import type { Bot } from "grammy";
import type { AppServices } from "../../bot.ts";
import type { BotContext } from "../../types.ts";
import { answerAlphabetInlineQuery } from "./alphabet.ts";
import { inlineProcessors } from "./metadata.ts";
import { PuffyInlineProcessor } from "./puffy.ts";
import { StickerInlineProcessor } from "./sticker.ts";

type InlineProcessor = {
  keywords: string[];
  answer: (ctx: BotContext) => Promise<void>;
};

export function installInlineFeature(
  bot: Bot<BotContext>,
  services: AppServices,
): void {
  const puffy = new PuffyInlineProcessor({
    api: bot.api,
    database: services.database,
    cacheChatIds: services.config.inlineCacheChatIds,
    preload: services.config.preloadPuffyCache,
  });
  const sticker = new StickerInlineProcessor({
    api: bot.api,
    database: services.database,
    cacheChatIds: services.config.inlineCacheChatIds,
  });

  const processorMap: Record<string, InlineProcessor> = {
    puffy: {
      keywords: inlineProcessors.find((item) => item.id === "puffy")?.keywords ?? [],
      answer: (ctx) => puffy.answer(ctx),
    },
    sticker: {
      keywords: inlineProcessors.find((item) => item.id === "sticker")?.keywords ?? [],
      answer: (ctx) => sticker.answer(ctx),
    },
    alphabet: {
      keywords: inlineProcessors.find((item) => item.id === "alphabet")?.keywords ?? [],
      answer: answerAlphabetInlineQuery,
    },
  };

  bot.on("inline_query", async (ctx) => {
    const parts = ctx.inlineQuery.query.split(" ");
    try {
      if (parts.length > 1) {
        for (const processor of Object.values(processorMap)) {
          if (processor.keywords.includes(parts[0] ?? "")) {
            await processor.answer(ctx);
            return;
          }
        }
      }
    } catch (error) {
      console.error(error);
      await ctx.answerInlineQuery([], {
        button: {
          text: "❌ 出錯了，請稍後再試",
          start_parameter: "inline_error",
        },
      });
      return;
    }

    const me = await ctx.api.getMe();
    await ctx.answerInlineQuery([], {
      cache_time: 60 * 60,
      button: {
        text: `📘 查看「${me.first_name}」行內機器人使用說明`,
        start_parameter: "inline_help",
      },
    });
  });
}
