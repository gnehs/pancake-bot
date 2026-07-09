import { Bot, GrammyError, HttpError } from "grammy";
import type { RuntimeConfig } from "./config.js";
import { AppDatabase } from "./db/database.js";
import { installBasicFeature } from "./features/basic.js";
import { installDayoffFeature } from "./features/dayoff.js";
import { installHelpFeature } from "./features/help.js";
import { installInlineFeature } from "./features/inline/index.js";
import { installStartFeature } from "./features/start.js";
import { installStepstepFeature } from "./features/stepstep.js";
import { installSubscribeFeature } from "./features/subscribe/index.js";
import type { BotContext } from "./types.js";

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
