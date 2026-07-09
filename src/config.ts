import { join } from "node:path";
import { projectRoot } from "./utils/paths.ts";

function parseChatIds(value: string | undefined): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number(part))
    .filter((value) => Number.isSafeInteger(value));
}

export type RuntimeConfig = {
  botToken: string;
  databasePath: string;
  inlineCacheChatIds: number[];
  preloadPuffyCache: boolean;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return {
    botToken: env.BOT_TOKEN ?? "",
    databasePath: env.DATABASE_PATH ?? join(projectRoot, "data", "pancake.sqlite"),
    inlineCacheChatIds: parseChatIds(env.INLINE_CACHE_CHAT_IDS),
    preloadPuffyCache: env.PRELOAD_PUFFY_CACHE !== "false",
  };
}
