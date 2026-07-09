import { Bot, GrammyError, HttpError } from "grammy";
import type { RuntimeConfig } from "./config.ts";
import { AppDatabase } from "./db/database.ts";
import { installBasicFeature } from "./features/basic.ts";
import { installDayoffFeature } from "./features/dayoff.ts";
import { installHelpFeature } from "./features/help.ts";
import { installInlineFeature } from "./features/inline/index.ts";
import { installStartFeature } from "./features/start.ts";
import { installStepstepFeature } from "./features/stepstep.ts";
import { installSubscribeFeature } from "./features/subscribe/index.ts";
import type { BotContext } from "./types.ts";

export type AppServices = {
  database: AppDatabase;
  config: RuntimeConfig;
};

export function createBot(services: AppServices): Bot<BotContext> {
  if (!services.config.botToken) {
    throw new Error("BOT_TOKEN is required");
  }

  const bot = new Bot<BotContext>(services.config.botToken);

  installStartFeature(bot);
  installHelpFeature(bot);
  installBasicFeature(bot);
  installDayoffFeature(bot);
  installStepstepFeature(bot);
  installSubscribeFeature(bot, services);
  installInlineFeature(bot, services);

  bot.catch((error) => {
    const updateId = error.ctx.update.update_id;
    console.error(`Error while handling update ${updateId}:`);
    if (error.error instanceof GrammyError) {
      console.error("Telegram API error:", error.error.description);
    } else if (error.error instanceof HttpError) {
      console.error("Telegram HTTP error:", error.error);
    } else {
      console.error(error.error);
    }
  });

  return bot;
}
