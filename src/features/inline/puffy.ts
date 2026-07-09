import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { InputFile, type Api } from "grammy";
import type { InlineQueryResult } from "grammy/types";
import type { AppDatabase } from "../../db/database.ts";
import type { BotContext } from "../../types.ts";
import { puffyAssetsDir } from "../../utils/paths.ts";

type PuffyOptions = {
  api: Api;
  database: AppDatabase;
  cacheChatIds: number[];
  preload: boolean;
};

type PuffyEntry = {
  name: string;
  file: string;
};

function getRandomChatId(chatIds: number[]): number {
  const chatId = chatIds[Math.floor(Math.random() * chatIds.length)];
  if (!chatId) {
    throw new Error("INLINE_CACHE_CHAT_IDS must contain at least one chat id for inline media caching");
  }
  return chatId;
}

function cacheKey(file: string): string {
  return `puffy:${file}`;
}

function stripImageExtension(file: string): string {
  return file.replace(/\.(jpe?g|png|webp)$/i, "");
}

function scoreByLetters(name: string, letters: string[]): number {
  let count = 0;
  for (const letter of letters) {
    if (name.includes(letter)) count += 1;
  }
  return count;
}

export class PuffyInlineProcessor {
  private entries = new Map<string, PuffyEntry>();
  private loaded = false;
  private preloadFinished = false;
  private readonly options: PuffyOptions;

  constructor(options: PuffyOptions) {
    this.options = options;
    void this.loadFiles().then(() => {
      if (this.options.preload) {
        void this.preloadCache().catch((error) => console.error(error));
      }
    }).catch((error) => console.error(error));
  }

  async answer(ctx: BotContext): Promise<void> {
    const text = ctx.inlineQuery?.query.split(" ")[1] ?? "";
    const searchResult = await this.search(text, this.preloadFinished ? 12 : 4);
    const results: InlineQueryResult[] = await Promise.all(
      searchResult.map(async ({ name, file }) => ({
        type: "photo" as const,
        id: name,
        title: name,
        description: file,
        photo_file_id: await this.imageFileToId(file),
      })),
    );

    console.log(
      `[${ctx.inlineQuery?.from.username ? "@" : ""}${
        ctx.inlineQuery?.from.username ?? ctx.inlineQuery?.from.first_name ?? "unknown"
      }][${text}] 處理完畢 (${searchResult.length})`,
    );

    await ctx.answerInlineQuery(results, {
      cache_time: 60 * 60,
      ...(!results.length
        ? {
            button: {
              text: "❌ 找不到你要的圖片，按這裡查看可供搜尋的圖片名稱",
              start_parameter: "inline_puffy_404",
            },
          }
        : {}),
    });
  }

  private async search(text: string, limit: number): Promise<PuffyEntry[]> {
    await this.waitUntilLoaded();
    const letters = text.split("");
    return [...this.entries.keys()]
      .sort((a, b) => scoreByLetters(b, letters) - scoreByLetters(a, letters))
      .slice(0, limit)
      .map((name) => this.entries.get(name))
      .filter((entry): entry is PuffyEntry => Boolean(entry));
  }

  private async loadFiles(): Promise<void> {
    const files = (await readdir(puffyAssetsDir)).filter(
      (file) => file !== ".DS_Store" && /\.(jpe?g|png|webp)$/i.test(file),
    );

    this.entries.clear();
    for (const file of files) {
      const name = stripImageExtension(file);
      this.entries.set(name, { name, file });
    }
    this.options.database.removeCachedFilesExcept(
      "puffy:",
      files.map((file) => cacheKey(file)),
    );
    this.loaded = true;
  }

  private async waitUntilLoaded(): Promise<void> {
    while (!this.loaded) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private async preloadCache(): Promise<void> {
    if (!this.options.cacheChatIds.length) {
      console.warn("Skip puffy preload because INLINE_CACHE_CHAT_IDS is empty");
      return;
    }

    await this.waitUntilLoaded();
    const files = [...this.entries.values()].map((entry) => entry.file);
    for (const file of files) {
      if (this.options.database.getCachedFile(cacheKey(file))) continue;
      console.log(`[puffy] caching ${file}`);
      await this.imageFileToId(file);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    this.preloadFinished = true;
    console.log(`${this.entries.size} 張圖片快取完畢`);
  }

  private async imageFileToId(file: string): Promise<string> {
    const key = cacheKey(file);
    const cached = this.options.database.getCachedFile(key);
    if (cached) return cached;

    const filePath = join(puffyAssetsDir, file);
    const message = await this.options.api.sendPhoto(
      getRandomChatId(this.options.cacheChatIds),
      new InputFile(createReadStream(filePath), basename(filePath)),
    );
    const photoId = message.photo.at(-1)?.file_id;
    if (!photoId) throw new Error(`Telegram did not return a photo file id for ${file}`);

    this.options.database.setCachedFile(key, "photo", photoId);
    return photoId;
  }
}
