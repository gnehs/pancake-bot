import * as cheerio from "cheerio";
import type { Bot } from "grammy";
import type { BotContext } from "../types.ts";

export type DayoffData = {
  typhoon: Array<{
    cityName: string;
    cityStatus: string;
  }>;
  updateTime: string;
};

let dayoffCache: DayoffData | null = null;
let dayoffCacheResetStarted = false;

function replyTo(ctx: BotContext) {
  return ctx.message
    ? { reply_parameters: { message_id: ctx.message.message_id } }
    : {};
}

function startDayoffCacheReset(): void {
  if (dayoffCacheResetStarted) return;
  dayoffCacheResetStarted = true;

  setInterval(() => {
    dayoffCache = null;
  }, 1000 * 60 * 10);
}

function normalizeStatus(value: string): string {
  const status = value.replace(/\s+/g, "").replaceAll("。", "。\n").trim();
  return status.length > 40 ? `${status.slice(0, 40)}...` : status;
}

function normalizeCellText(value: string): string {
  return value.replace(/\s+/g, "").trim();
}

function parseUpdateTime($: cheerio.CheerioAPI): string {
  const updateText = `${$(".Content_Updata").text()}\n${$("body").text()}`;
  const updateTime = updateText.match(
    /更新時間[：:\s]*(?:\d{4}\/\d{1,2}\/\d{1,2})?\s*([0-9]{1,2}:[0-9]{2}:[0-9]{2})/,
  );
  if (updateTime) return updateTime[1];

  const timeParts = updateText.match(/[0-9]+/g);
  return timeParts && timeParts.length >= 6
    ? `${timeParts[3]}:${timeParts[4]}:${timeParts[5]}`
    : "未知";
}

export function parseDayoffHtml(body: string): DayoffData {
  const $ = cheerio.load(body);
  const typhoon: DayoffData["typhoon"] = [];

  $("#Table .Table_Body > tr").each((_, row) => {
    const dataCells = $(row)
      .children("td")
      .filter((_, cell) => Number($(cell).attr("colspan") ?? "1") < 3);
    if (dataCells.length < 2) return;

    const cityCell =
      dataCells
        .filter((_, cell) =>
          /\bcity_Name\b/.test($(cell).attr("headers") ?? ""),
        )
        .get(0) ?? dataCells.get(dataCells.length >= 3 ? 1 : 0);
    if (!cityCell) return;

    const cityCellIndex = dataCells.toArray().indexOf(cityCell);
    const statusCell = dataCells.get(cityCellIndex + 1);
    if (!statusCell) return;

    const cityName = normalizeCellText($(cityCell).text());
    const cityStatus = normalizeStatus($(statusCell).text());
    if (!cityName || !cityStatus) return;

    typhoon.push({
      cityName: `${cityStatus.match(/上午|下午|停止上班|停止上課/) ? "❗️" : "🔹"}${cityName}`,
      cityStatus,
    });
  });

  if (
    typhoon.length !== 22 ||
    typhoon.some(({ cityName }) =>
      cityName.replace(/^(?:❗️|🔹)/, "").endsWith("地區"),
    )
  ) {
    throw new Error(
      `Unexpected DGPA dayoff format: parsed ${typhoon.length} city rows`,
    );
  }

  return { typhoon, updateTime: parseUpdateTime($) };
}

async function fetchDayoff(): Promise<DayoffData> {
  if (dayoffCache) return dayoffCache;

  const response = await fetch(
    "https://www.dgpa.gov.tw/typh/daily/nds.html",
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch DGPA dayoff page: ${response.status}`);
  }

  const body = await response.text();
  dayoffCache = parseDayoffHtml(body);
  return dayoffCache;
}

export function installDayoffFeature(bot: Bot<BotContext>): void {
  startDayoffCacheReset();

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
