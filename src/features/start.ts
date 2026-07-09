import type { Bot } from "grammy";
import { inlineProcessors } from "./inline/metadata.ts";
import type { BotContext } from "../types.ts";
import { escapeHtml } from "../utils/html.ts";

function replyTo(ctx: BotContext) {
  return ctx.message
    ? { reply_parameters: { message_id: ctx.message.message_id } }
    : {};
}

export function installStartFeature(bot: Bot<BotContext>): void {
  bot.command("start", async (ctx) => {
    const startParameter = ctx.message?.text.split(" ")[1];
    const me = await ctx.api.getMe();
    const processorList = inlineProcessors
      .map(
        (processor) =>
          `<b>${escapeHtml(processor.name)}</b>\n代號：${processor.keywords
            .map(escapeHtml)
            .join(", ")}`,
      )
      .join("\n");

    switch (startParameter) {
      case "inline_puffy_404":
        await ctx.reply(
          '你可以在 <a href="https://github.com/gnehs/pancake-bot/tree/master/components/inline/puffy">這裡</a> 查看所有可供搜尋的圖片名稱',
          {
            ...replyTo(ctx),
            parse_mode: "HTML",
            link_preview_options: { is_disabled: true },
          },
        );
        return;
      case "inline_error":
        await ctx.reply(
          "<b>出錯原因</b>\n這可能是因為你輸入的指令有誤，或是機器人程式出錯，請檢查後再試一次。",
          { ...replyTo(ctx), parse_mode: "HTML" },
        );
        return;
      case "inline_help":
        await ctx.reply(
          `<b>📘「${escapeHtml(me.first_name)}」行內機器人使用說明</b>

<b>👇 機器人可接受的格式如下：</b>
@${escapeHtml(me.username ?? "your_bot")} <code>&lt;代號&gt; &lt;文字/關鍵字&gt;</code>
@${escapeHtml(me.username ?? "your_bot")} <code>&lt;網址&gt;</code>

<b>👇 可用的處理器清單：</b>
${processorList}`,
          { ...replyTo(ctx), parse_mode: "HTML" },
        );
        return;
      default:
        await ctx.replyWithSticker("https://data.gnehs.net/stickers/hello.webp", replyTo(ctx));
        await ctx.reply(`這裡是${me.first_name}！`, replyTo(ctx));
    }
  });
}
