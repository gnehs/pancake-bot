import type { Api } from "grammy";
import type { AppDatabase } from "../../db/database.js";

export function subscribe(database: AppDatabase, key: string, chatId: number): void {
  database.subscribe(key, chatId);
}

export function unsubscribe(database: AppDatabase, key: string, chatId: number): void {
  database.unsubscribe(key, chatId);
}

export async function sendMessage(options: {
  api: Api;
  database: AppDatabase;
  chats: number[];
  message: string;
  key: string;
}): Promise<void> {
  console.log(`[Notify][${options.key}] Sending messages to:`, options.chats);

  for (const chatId of options.chats) {
    try {
      await options.api.sendMessage(chatId, options.message, {
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      });
    } catch (error) {
      console.error(error);
      unsubscribe(options.database, options.key, chatId);
    }
  }
}
