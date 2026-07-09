import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { runMigrations } from "./migrations.js";

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

function normalizeParameter(parameter: string | null | undefined): string {
  return parameter ?? "";
}

export class AppDatabase {
  readonly connection: DatabaseSync;

  constructor(path: string) {
    if (path !== ":memory:") {
      const dir = dirname(path);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }

    this.connection = new DatabaseSync(path, { timeout: 5000 });
    this.connection.exec("PRAGMA journal_mode = WAL");
    this.connection.exec("PRAGMA foreign_keys = ON");
    runMigrations(this.connection);
  }

  close(): void {
    if (this.connection.isOpen) this.connection.close();
  }

  getJson<T extends JsonValue>(key: string, fallback: T): T {
    const row = this.connection
      .prepare("SELECT value_json FROM legacy_kv WHERE key = ?")
      .get(key) as { value_json: string } | undefined;
    if (!row) return fallback;
    return JSON.parse(row.value_json) as T;
  }

  setJson(key: string, value: JsonValue): void {
    this.connection
      .prepare(
        `
          INSERT INTO legacy_kv (key, value_json, updated_at)
          VALUES (:key, :valueJson, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET
            value_json = excluded.value_json,
            updated_at = CURRENT_TIMESTAMP
        `,
      )
      .run({ key, valueJson: JSON.stringify(value) });
  }

  subscribe(topic: string, chatId: number, parameter?: string | null): void {
    this.connection
      .prepare(
        `
          INSERT OR IGNORE INTO subscriptions (topic, parameter, chat_id)
          VALUES (:topic, :parameter, :chatId)
        `,
      )
      .run({ topic, parameter: normalizeParameter(parameter), chatId });
  }

  unsubscribe(topic: string, chatId: number, parameter?: string | null): void {
    this.connection
      .prepare(
        `
          DELETE FROM subscriptions
          WHERE topic = :topic AND parameter = :parameter AND chat_id = :chatId
        `,
      )
      .run({ topic, parameter: normalizeParameter(parameter), chatId });
  }

  getSubscriptionChatIds(topic: string, parameter?: string | null): number[] {
    const rows = this.connection
      .prepare(
        `
          SELECT chat_id FROM subscriptions
          WHERE topic = :topic AND parameter = :parameter
          ORDER BY chat_id
        `,
      )
      .all({ topic, parameter: normalizeParameter(parameter) }) as Array<{
      chat_id: number;
    }>;
    return rows.map((row) => row.chat_id);
  }

  getCachedFile(cacheKey: string): string | null {
    const row = this.connection
      .prepare("SELECT file_id FROM telegram_file_cache WHERE cache_key = ?")
      .get(cacheKey) as { file_id: string } | undefined;
    return row?.file_id ?? null;
  }

  setCachedFile(cacheKey: string, fileKind: "photo" | "sticker", fileId: string): void {
    this.connection
      .prepare(
        `
          INSERT INTO telegram_file_cache (cache_key, file_kind, file_id, updated_at)
          VALUES (:cacheKey, :fileKind, :fileId, CURRENT_TIMESTAMP)
          ON CONFLICT(cache_key) DO UPDATE SET
            file_kind = excluded.file_kind,
            file_id = excluded.file_id,
            updated_at = CURRENT_TIMESTAMP
        `,
      )
      .run({ cacheKey, fileKind, fileId });
  }

  removeCachedFilesExcept(cacheKeyPrefix: string, liveKeys: Iterable<string>): void {
    const keep = new Set(liveKeys);
    const rows = this.connection
      .prepare("SELECT cache_key FROM telegram_file_cache WHERE cache_key LIKE ?")
      .all(`${cacheKeyPrefix}%`) as Array<{ cache_key: string }>;
    const remove = this.connection.prepare(
      "DELETE FROM telegram_file_cache WHERE cache_key = ?",
    );

    for (const row of rows) {
      if (!keep.has(row.cache_key)) remove.run(row.cache_key);
    }
  }

  getBahamutSentIds(): Set<string> {
    const rows = this.connection
      .prepare("SELECT item_id FROM bahamut_sent_items")
      .all() as Array<{ item_id: string }>;
    return new Set(rows.map((row) => row.item_id));
  }

  replaceBahamutSentIds(itemIds: Iterable<string>): void {
    const insert = this.connection.prepare(
      "INSERT INTO bahamut_sent_items (item_id) VALUES (?)",
    );
    this.connection.exec("BEGIN");
    try {
      this.connection.exec("DELETE FROM bahamut_sent_items");
      for (const itemId of itemIds) insert.run(itemId);
      this.connection.exec("COMMIT");
    } catch (error) {
      this.connection.exec("ROLLBACK");
      throw error;
    }
  }
}
