import type { Bot } from "grammy";
import type { BotContext } from "../types.ts";
import { escapeHtml } from "../utils/html.ts";

function replyTo(ctx: BotContext) {
  return ctx.message
    ? { reply_parameters: { message_id: ctx.message.message_id } }
    : {};
}

export function installBasicFeature(bot: Bot<BotContext>): void {
  bot.command("removekbd", async (ctx) => {
    await ctx.replyWithSticker(
      "CAACAgEAAxkBAAIJlmZ4AULu2paaf4qOqVJ4f3APqfoBAAKdAgACOPTgR1en_Fb8JDzgNQQ",
      replyTo(ctx),
    );
    await ctx.reply("鍵盤掰掰", {
      ...replyTo(ctx),
      reply_markup: { remove_keyboard: true },
    });
  });

  bot.command("date", (ctx) =>
    ctx.reply(`Server time: ${new Date().toString()}`, replyTo(ctx)),
  );

  bot.command("about", async (ctx) => {
    const me = await ctx.api.getMe();
    await ctx.reply(
      `「${escapeHtml(me.first_name)}」由 <a href="https://github.com/gnehs/pancake-bot">pancake</a> 驅動！`,
      {
        ...replyTo(ctx),
        parse_mode: "HTML",
      },
    );
  });

  bot.command("ping", (ctx) =>
    ctx.reply("<b>PONG</b>", { ...replyTo(ctx), parse_mode: "HTML" }),
  );
  bot.hears("ping", (ctx) =>
    ctx.reply("<b>PONG</b>", { ...replyTo(ctx), parse_mode: "HTML" }),
  );

  bot.hears("幹", (ctx) =>
    ctx.reply("<i>QQ</i>", { ...replyTo(ctx), parse_mode: "HTML" }),
  );
  bot.hears("怕", (ctx) => ctx.reply("嚇到吃手手", replyTo(ctx)));
  bot.hears("逼比", (ctx) => ctx.reply("蹦蹦", replyTo(ctx)));
  bot.hears("喵", (ctx) =>
    ctx.reply("<code>HTTP /3.0 200 OK.</code>", {
      ...replyTo(ctx),
      parse_mode: "HTML",
    }),
  );

  const stickers = new Map<string | string[], string>([
    ["嗨", "CAACAgUAAxkBAAIJmGZ4AVRrCyLdCt5vI4aTB7cPYrP8AAJ8DgACgOxZVgNQJej4_BIkNQQ"],
    ["早安", "CAACAgUAAxkBAAIJdmZ3_youpSxjm__7ga2LnxG3ESNPAAJzEgACETeQV1xbq7c7uVXGNQQ"],
    [["容勾絲揪", "榮勾絲揪"], "CAACAgUAAxkBAAIJiGZ4AAF7iriA0n-aQnYFuDrLVTNZ7gACfA4AAoDsWVYDUCXo-PwSJDUE"],
    ["❤️", "CAACAgUAAxkBAAIJgGZ4AAEXZIeOW1aI0K5y2nStxPIAAZkAAosSAAL51blXAAFQ0ZANjhzaNQQ"],
    ["🥞", "CAACAgUAAxkBAAIJgmZ4AAElMp9saRujXl79y1UXp_aO0AAC_g4AAtAFuVdJIvY5qe55ZTUE"],
    ["🍪", "CAACAgUAAxkBAAIJhGZ4AAE3t5CFp00uwuJyhoB62LMjhwAC3AwAAszvuFcFVvEyvCXG-jUE"],
    ["🐰", "CAACAgUAAxkBAAIJimZ4AAGNfrO8IPAUThRYmyPZYrThVgACjxAAAl-5WFZDCdsdEB9_7TUE"],
    ["🍉", "CAACAgUAAxkBAAIJjGZ4AAGmd5w5V9ubdVwxTxcVQmmqAwACURAAAklkmFfHrPq-1h_M9jUE"],
    ["🍮", "CAACAgUAAxkBAAIJjmZ4AAG8rk3AyK2Iveh5tA7L04CV6gACdhAAAiVoqVdHmGKi0FmWcDUE"],
  ]);

  for (const [trigger, sticker] of stickers) {
    bot.hears(trigger, (ctx) => ctx.replyWithSticker(sticker, replyTo(ctx)));
  }

  bot.hears("晚安", async (ctx) => {
    const from = ctx.message?.from;
    const extra = replyTo(ctx);
    if (from?.username === "seadog007") {
      await ctx.replyWithSticker(
        "CAACAgUAAxkBAAIJkGZ4AAHqKDlns115TTRjphQPc4ZJkAACZAgAAjjQIVTLjvHNvbKjLTUE",
        extra,
      );
      await ctx.reply("笨豹豹，晚安", extra);
      return;
    }

    if (from?.username === "Vincent550102") {
      await ctx.replyWithSticker(
        "CAACAgEAAxkBAAIJlGZ4ASpSPzqcKmDHYaNPT3AHaMYxAAJFAgACR_HZRY-ZgVz18-Q3NQQ",
        extra,
      );
    } else {
      const sticker =
        Math.random() < 0.5
          ? "CAACAgUAAxkBAAECFyZmd_7-NtyjFf0s-rZfoYgf1L5T-wACVg8AAugGWVZ2N1z2l3RnHjUE"
          : "CAACAgUAAxkBAAIJkGZ4AAHqKDlns115TTRjphQPc4ZJkAACZAgAAjjQIVTLjvHNvbKjLTUE";
      await ctx.replyWithSticker(sticker, extra);
    }
    await ctx.reply(`${from?.first_name ?? "你"}，晚安❤️`, extra);
  });

  bot.command("getuserinfo", async (ctx) => {
    const id = ctx.message?.text.split(" ").slice(1).join(" ").trim();
    if (!id) {
      await ctx.reply("❌ 請在後面加上使用者 ID", replyTo(ctx));
      return;
    }
    const user = await ctx.api.getChat(id);
    await ctx.reply(`<pre>${escapeHtml(JSON.stringify(user, null, 2))}</pre>`, {
      ...replyTo(ctx),
      parse_mode: "HTML",
    });
  });

  bot.on("message:sticker", (ctx) => {
    if (ctx.chat.type !== "private") return;
    return ctx.reply(
      `<pre>${escapeHtml(JSON.stringify(ctx.message?.sticker, null, 2))}</pre>`,
      {
        ...replyTo(ctx),
        parse_mode: "HTML",
      },
    );
  });
}
