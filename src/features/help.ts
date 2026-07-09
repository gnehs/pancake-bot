import type { Bot } from "grammy";
import { subscribeTopics } from "./subscribe/topics.js";
import type { BotContext } from "../types.js";
import { escapeHtml } from "../utils/html.js";

function replyTo(ctx: BotContext) {
  return ctx.message
    ? { reply_parameters: { message_id: ctx.message.message_id } }
    : {};
}

export function installHelpFeature(bot: Bot<BotContext>): void {
  bot.command("help", async (ctx) => {
    const me = await ctx.api.getMe();
    const topics = subscribeTopics
      .map((topic) => `${escapeHtml(topic.id)} - ${escapeHtml(topic.name)}\n`)
      .join("");

    await ctx.reply(
      `<b>${escapeHtml(me.first_name)}的指令清單</b>
/about - 關於
/date - 傳回伺服器的時間
/dayoff - 台灣行政院人事局的停班課
/ping - PONG
/removekbd - 移除鍵盤
/start - 開始

<b>訂閱功能</b>
/subscribe <u>訂閱編號</u> - 訂閱
/unsubscribe <u>訂閱編號</u> - 取消訂閱

<b>訂閱編號</b>
${topics}
<b>測試</b>
/admin - 檢查是否具此聊天室的管理權限`,
      { ...replyTo(ctx), parse_mode: "HTML" },
    );
  });
}
