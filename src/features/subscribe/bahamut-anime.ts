import cron from "node-cron";
import type { Api } from "grammy";
import type { AppDatabase } from "../../db/database.js";
import { escapeHtml } from "../../utils/html.js";
import { sendMessage } from "./manage.js";

type BahamutApiResponse = {
  new_anime: {
    date: Array<{
      video_sn: number;
      title: string;
      info: string;
    }>;
  };
  new_added: Array<{
    anime_sn: number;
    title: string;
    info: string;
  }>;
};

type FetchedData = {
  newEpisode: Array<{
    id: string;
    title: string;
    link: string;
    episode: string;
  }>;
  recentAdded: Array<{
    id: string;
    title: string;
    link: string;
  }>;
};

async function fetchData(): Promise<FetchedData> {
  const data = (await fetch(
    "https://api.gamer.com.tw/mobile_app/anime/v1/index.php",
  ).then((response) => response.json())) as BahamutApiResponse;

  const newEpisode = data.new_anime.date.map(({ video_sn, title, info }) => {
    const matchedEpisode = info.match(/\[(.+)\]/)?.[1] ?? info;
    const episode =
      matchedEpisode.length >= 2 ? matchedEpisode : `0${matchedEpisode}`;
    return {
      id: String(video_sn),
      title,
      link: `https://ani.gamer.com.tw/animeVideo.php?sn=${video_sn}`,
      episode: episode.replace(/\[|\]/g, ""),
    };
  });

  const recentAdded = data.new_added.map(({ anime_sn, title }) => ({
    id: `recent_${anime_sn}`,
    title,
    link: `https://ani.gamer.com.tw/animeRef.php?sn=${anime_sn}`,
  }));

  return { newEpisode, recentAdded };
}

export function startBahamutAnimeNotifier(options: {
  api: Api;
  database: AppDatabase;
}): void {
  const sendData = async (): Promise<void> => {
    const fetchedData = await fetchData();
    const sentEpisode = options.database.getBahamutSentIds();
    const newEpisode = fetchedData.newEpisode.filter(
      (item) => !sentEpisode.has(item.id),
    );
    const recentAdded = fetchedData.recentAdded.filter(
      (item) => !sentEpisode.has(item.id),
    );

    options.database.replaceBahamutSentIds([
      ...fetchedData.newEpisode.map((item) => item.id),
      ...fetchedData.recentAdded.map((item) => item.id),
    ]);

    if (!newEpisode.length && !recentAdded.length) return;

    let message = "#ㄅㄏ動畫瘋更新菌\n";
    for (const { link, title, episode } of newEpisode) {
      const ep = Number.isNaN(Number(episode)) ? episode : `E${episode}`;
      message += `<b>${escapeHtml(ep)}</b> <a href="${link}">${escapeHtml(title)}</a>\n`;
    }
    if (recentAdded.length) {
      message += "<b>最近新增</b>\n";
      for (const { link, title } of recentAdded) {
        message += `<a href="${link}">${escapeHtml(title)}</a>\n`;
      }
    }

    await sendMessage({
      api: options.api,
      database: options.database,
      chats: options.database.getSubscriptionChatIds("baha"),
      message,
      key: "baha",
    });
  };

  cron.schedule("50 0,30 * * * *", () => {
    void sendData().catch((error) => console.error(error));
  });
}
