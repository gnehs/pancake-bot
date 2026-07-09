import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import type { AppDatabase, JsonValue } from "./database.ts";

type LegacyObject = Record<string, unknown>;

async function readJsonObject(path: string): Promise<LegacyObject | null> {
  if (!existsSync(path)) return null;
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${path} is not a JSON object`);
  }
  return parsed as LegacyObject;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asJsonValue(value: unknown): JsonValue {
  return value as JsonValue;
}

export async function migrateLegacyJson(options: {
  database: AppDatabase;
  databaseJsonPath: string;
  votesJsonPath?: string;
}): Promise<void> {
  const legacy = await readJsonObject(options.databaseJsonPath);
  if (legacy) {
    for (const [key, value] of Object.entries(legacy)) {
      options.database.setJson(key, asJsonValue(value));
    }

    const puffyCache = legacy.puffyCache;
    if (isRecord(puffyCache)) {
      for (const [fileName, fileId] of Object.entries(puffyCache)) {
        if (typeof fileId === "string") {
          options.database.setCachedFile(`puffy:${fileName}`, "photo", fileId);
        }
      }
    }

    const bahamutSent = legacy["bahamut-sent"];
    if (isRecord(bahamutSent)) {
      options.database.replaceBahamutSentIds(Object.keys(bahamutSent));
    }

    const bahaSubscriptions = legacy["subscribe.baha"];
    if (isRecord(bahaSubscriptions)) {
      for (const chatId of Object.keys(bahaSubscriptions)) {
        const numericChatId = Number(chatId);
        if (Number.isSafeInteger(numericChatId)) {
          options.database.subscribe("baha", numericChatId);
        }
      }
    }
  }

  if (options.votesJsonPath) {
    const votes = await readJsonObject(options.votesJsonPath);
    if (votes) options.database.setJson("legacy.votes", asJsonValue(votes));
  }
}
