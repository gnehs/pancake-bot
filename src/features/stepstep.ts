import type { Bot } from "grammy";
import type { BotContext } from "../types.js";
import { escapeHtml } from "../utils/html.js";

type StepRankItem = {
  distance: number;
  steps: number;
  user: {
    name: string;
  };
};

function replyTo(ctx: BotContext) {
  return ctx.message
    ? { reply_parameters: { message_id: ctx.message.message_id } }
    : {};
}

function taipeiDate(): Date {
  return new Date(new Date().toLocaleString("en", { timeZone: "Asia/Taipei" }));
}

function stepDateString(date: Date): string {
  const day = date.getHours() < 8 ? date.getDate() - 1 : date.getDate();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

export function installStepstepFeature(bot: Bot<BotContext>): void {
  bot.command("stepstep", async (ctx) => {
    const dateStr = stepDateString(taipeiDate());
    const response = await fetch(`https://steps.pancake.tw/api/v1/rank?date=${dateStr}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    });
    const rank = ((await response.json()) as StepRankItem[]).slice(0, 5);

    let responseText = `<b>🍪 餅餅踏踏排行榜 🍪</b>\n${dateStr}\n\n`;
    rank.forEach((item, index) => {
      responseText += `<code>${index + 1}. </code>${escapeHtml(item.user.name)}\n`;
      responseText += `<code>   ${item.distance.toFixed(2)} 公里 - ${item.steps.toLocaleString()} 步</code>\n`;
    });

    await ctx.reply(responseText, {
      ...replyTo(ctx),
      parse_mode: "HTML",
    });
  });
}
