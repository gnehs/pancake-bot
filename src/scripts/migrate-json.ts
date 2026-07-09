import { resolve } from "node:path";
import { loadConfig } from "../config.ts";
import { AppDatabase } from "../db/database.ts";
import { migrateLegacyJson } from "../db/legacy-json.ts";
import { projectRoot } from "../utils/paths.ts";

function readArg(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

const config = loadConfig();
const dbPath = readArg("--db", config.databasePath);
const databaseJsonPath = readArg(
  "--database-json",
  resolve(projectRoot, "database.json"),
);
const votesJsonPath = readArg("--votes-json", resolve(projectRoot, "votes.json"));

const database = new AppDatabase(dbPath);

try {
  await migrateLegacyJson({
    database,
    databaseJsonPath,
    votesJsonPath,
  });
  console.log(`Migrated legacy JSON data into ${dbPath}`);
} finally {
  database.close();
}
