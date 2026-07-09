import { createBot } from "./bot.ts";
import { loadConfig } from "./config.ts";
import { AppDatabase } from "./db/database.ts";

const config = loadConfig();
const database = new AppDatabase(config.databasePath);
const bot = createBot({ config, database });

const stop = async (signal: NodeJS.Signals): Promise<void> => {
  console.log(`Received ${signal}, stopping bot`);
  await bot.stop();
  database.close();
};

process.once("SIGINT", () => void stop("SIGINT"));
process.once("SIGTERM", () => void stop("SIGTERM"));

await bot.start({
  onStart: (info) => {
    console.log(`@${info.username} started`);
  },
});
