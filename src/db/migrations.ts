import type { DatabaseSync } from "node:sqlite";

type Migration = {
  id: number;
  name: string;
  up: string;
};

const migrations: Migration[] = [
  {
    id: 1,
    name: "initial_schema",
    up: `
      CREATE TABLE IF NOT EXISTS legacy_kv (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) STRICT;

      CREATE TABLE IF NOT EXISTS subscriptions (
        topic TEXT NOT NULL,
        parameter TEXT NOT NULL DEFAULT '',
        chat_id INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (topic, parameter, chat_id)
      ) STRICT;

      CREATE TABLE IF NOT EXISTS telegram_file_cache (
        cache_key TEXT PRIMARY KEY,
        file_kind TEXT NOT NULL CHECK (file_kind IN ('photo', 'sticker')),
        file_id TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) STRICT;

      CREATE TABLE IF NOT EXISTS bahamut_sent_items (
        item_id TEXT PRIMARY KEY,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) STRICT;
    `,
  },
];

export function runMigrations(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
  `);

  const appliedRows = db
    .prepare("SELECT id FROM schema_migrations")
    .all() as Array<{ id: number }>;
  const applied = new Set(appliedRows.map((row) => row.id));
  const insert = db.prepare(
    "INSERT INTO schema_migrations (id, name) VALUES (:id, :name)",
  );

  db.exec("BEGIN");
  try {
    for (const migration of migrations) {
      if (applied.has(migration.id)) continue;
      db.exec(migration.up);
      insert.run({ id: migration.id, name: migration.name });
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
