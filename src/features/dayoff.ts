import * as cheerio from "cheerio";
import type { Bot } from "grammy";
import type { BotContext } from "../types.js";

type DayoffData = {
  typhoon: Array<{
    cityName: string;
    cityStatus: string;
  }>;
  updateTime: string;
};

let dayoffCache: DayoffData | null = null;

function replyTo(ctx: BotContext) {
  return ctx.message
    ? { reply_parameters: { message_id: ctx.message.message_id } }
    : {};
}

setInterval(() => {
  dayoffCache = null;
}, 1000 * 60 * 10);

async function fetchDayoff(): Promise<DayoffData> {
  if (dayoffCache) return dayoffCache;

  const body = await fetch("https://www.dgpa.gov.tw/typh/daily/nds.html").then(
    (response) => response.text(),
  );
  const $ = cheerio.load(body);
  const city = $('.Table_Body > tr > td:nth-child(1):not([colspan="3"])');
  const status = $(".Table_Body > tr > td:nth-child(2)");
  const typhoon: DayoffData["typhoon"] = [];

  for (let index = 0; index < city.length; index += 1) {
    let cityStatus = $(status[index])
      .text()
      .replaceAll("。", "。\n")
      .replaceAll(" ", "")
      .trim();
    if (cityStatus.length > 40) cityStatus = `${cityStatus.slice(0, 40)}...`;

    const cityName = $(city[index]).text();
    typhoon.push({
      cityName: `${cityStatus.match(/上午|下午|停止上班|停止上課/) ? "❗️" : "🔹"}${cityName}`,
      cityStatus,
    });
  }

  const timeParts = $("div.f_right > h4:nth-child(1)").text().match(/[0-9]+/g);
  const updateTime =
    timeParts && timeParts.length >= 6
      ? `${timeParts[3]}:${timeParts[4]}:${timeParts[5]}`
      : "未知";

  dayoffCache = { typhoon, updateTime };
  return dayoffCache;
}

export function installDayoffFeature(bot: Bot<BotContext>): void {
  bot.command("dayoff", async (ctx) => {
    const data = await fetchDayoff();
    const lines = data.typhoon.map(
      ({ cityName, cityStatus }) => `${cityName} ${cityStatus}`,
    );
    lines.push("---");
    lines.push("詳細及最新情報以 行政院人事行政總處 公告為主");
    lines.push(`更新時間 ${data.updateTime}`);

    await ctx.reply(lines.join("\n"), replyTo(ctx));
  });
}
