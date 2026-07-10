import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { InputFile, type Api } from "grammy";
import type { InlineQueryResult } from "grammy/types";
import { render } from "takumi-js";
import { container, image, text as textNode } from "takumi-js/helpers";
import type { AppDatabase } from "../../db/database.ts";
import type { BotContext } from "../../types.ts";
import { stickerFontDir, stickerImageDir } from "../../utils/paths.ts";

type StickerOptions = {
  api: Api;
  database: AppDatabase;
  cacheChatIds: number[];
};

type StickerTemplate = {
  id: "blobbies" | "duck" | "dono" | "iknow" | "suck";
  baseFile: string;
  font: "noto-bold" | "huninn";
  color: string;
  stroke?: string;
  size: {
    width: number;
    height: number;
  };
  box: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  fontSize: number;
};

const templates: StickerTemplate[] = [
  {
    id: "blobbies",
    baseFile: "blobbies.png",
    font: "noto-bold",
    color: "#bcbdc8",
    stroke: "white",
    size: { width: 512, height: 319 },
    box: { left: 0, top: 10, width: 332, height: 136 },
    fontSize: 92,
  },
  {
    id: "duck",
    baseFile: "duck.png",
    font: "huninn",
    color: "white",
    size: { width: 512, height: 512 },
    box: { left: 0, top: 0, width: 512, height: 225 },
    fontSize: 110,
  },
  {
    id: "dono",
    baseFile: "dono.webp",
    font: "huninn",
    color: "black",
    size: { width: 512, height: 512 },
    box: { left: 0, top: 0, width: 512, height: 106 },
    fontSize: 74,
  },
  {
    id: "iknow",
    baseFile: "iknow.webp",
    font: "huninn",
    color: "black",
    size: { width: 512, height: 512 },
    box: { left: 0, top: 0, width: 512, height: 106 },
    fontSize: 74,
  },
  {
    id: "suck",
    baseFile: "suck.webp",
    font: "noto-bold",
    color: "black",
    stroke: "white",
    size: { width: 496, height: 512 },
    box: { left: 0, top: 400, width: 496, height: 112 },
    fontSize: 76,
  },
];

function getRandomChatId(chatIds: number[]): number {
  const chatId = chatIds[Math.floor(Math.random() * chatIds.length)];
  if (!chatId) {
    throw new Error("INLINE_CACHE_CHAT_IDS must contain at least one chat id for inline media caching");
  }
  return chatId;
}

function userLabel(ctx: BotContext): string {
  const from = ctx.inlineQuery?.from;
  return `${from?.username ? "@" : ""}${from?.username ?? from?.first_name ?? "unknown"}`;
}

export class StickerInlineProcessor {
  private readonly resultCache = new Map<string, InlineQueryResult[]>();
  private fixedStickerIds = new Map<string, Promise<string>>();
  private readonly options: StickerOptions;
  private fontBytes: Promise<{
    notoBold: Uint8Array;
    huninn: Uint8Array;
  }>;

  constructor(options: StickerOptions) {
    this.options = options;
    this.fontBytes = this.loadFonts();
  }

  async answer(ctx: BotContext): Promise<void> {
    const stickerText = ctx.inlineQuery?.query.split(" ")[1] ?? "";
    const cached = this.resultCache.get(stickerText);
    if (cached) {
      console.log(`[${userLabel(ctx)}][${stickerText}] cached`);
      await ctx.answerInlineQuery(cached, { cache_time: 60 * 40 });
      return;
    }

    if (stickerText.length < 1) {
      await ctx.answerInlineQuery(
        [
          {
            type: "sticker",
            id: "plz",
            sticker_file_id: await this.getFixedStickerId("moretextplz"),
          },
        ],
        { cache_time: 60 * 40 },
      );
      return;
    }

    try {
      const results = await Promise.all(
        templates.map(async (template) => ({
          type: "sticker" as const,
          id: template.id,
          sticker_file_id: await this.stickerBufferToId(
            await this.renderSticker(template, stickerText),
          ),
        })),
      );

      this.resultCache.set(stickerText, results);
      console.log(`[${userLabel(ctx)}][${stickerText}] 處理完畢`);
      await ctx.answerInlineQuery(results, { cache_time: 60 * 40 });
    } catch (error) {
      console.error(error);
      await ctx.answerInlineQuery(
        [
          {
            type: "sticker",
            id: "tooManyRequests",
            sticker_file_id: await this.getFixedStickerId("tooManyRequests"),
          },
        ],
        { cache_time: 20 },
      );
    }
  }

  private async loadFonts(): Promise<{ notoBold: Uint8Array; huninn: Uint8Array }> {
    const [notoBold, huninn] = await Promise.all([
      readFile(join(stickerFontDir, "NotoSansCJKtc-Bold.otf")),
      readFile(join(stickerFontDir, "jf-openhuninn-1.1.ttf")),
    ]);
    return { notoBold, huninn };
  }

  private async renderSticker(template: StickerTemplate, value: string): Promise<Uint8Array> {
    const [base, fonts] = await Promise.all([
      readFile(join(stickerImageDir, template.baseFile)),
      this.fontBytes,
    ]);
    const fontFamily = template.font === "huninn" ? "Huninn" : "Noto Sans CJK TC";
    const fontData = template.font === "huninn" ? fonts.huninn : fonts.notoBold;
    const stickerTextStyle = {
      color: template.color,
      fontFamily,
      fontSize: template.fontSize,
      fontWeight: 700,
      lineHeight: 1,
      textAlign: "center",
      textFit: "shrink",
      textWrap: "balance",
      wordBreak: "keep-all",
      ...(template.stroke
        ? { WebkitTextStroke: `4px ${template.stroke}` }
        : {}),
    };

    return render(
      container({
        style: {
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "transparent",
        },
        children: [
          image({
            src: base,
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            },
          }),
          container({
            style: {
              position: "absolute",
              left: template.box.left,
              top: template.box.top,
              width: template.box.width,
              height: template.box.height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: "4px 14px",
              boxSizing: "border-box",
            },
            children: [
              textNode({
                text: value,
                style: stickerTextStyle,
              }),
            ],
          }),
        ],
      }),
      {
        // Keep the output canvas aligned with the base asset. A square canvas
        // would center non-square assets and shift their text boxes.
        width: template.size.width,
        height: template.size.height,
        format: "webp",
        fonts: [{ name: fontFamily, data: fontData, weight: 700 }],
        lang: "zh-Hant",
      },
    );
  }

  private async getFixedStickerId(name: string): Promise<string> {
    const cached = this.fixedStickerIds.get(name);
    if (cached) return cached;
    const promise = this.stickerFileToId(`${name}.webp`);
    this.fixedStickerIds.set(name, promise);
    return promise;
  }

  private async stickerFileToId(file: string): Promise<string> {
    const key = `sticker:file:${file}`;
    const cached = this.options.database.getCachedFile(key);
    if (cached) return cached;

    const message = await this.options.api.sendSticker(
      getRandomChatId(this.options.cacheChatIds),
      new InputFile(createReadStream(join(stickerImageDir, file)), "sticker-gen.webp"),
    );
    const fileId = message.sticker?.file_id;
    if (!fileId) throw new Error(`Telegram did not return a sticker file id for ${file}`);
    this.options.database.setCachedFile(key, "sticker", fileId);
    return fileId;
  }

  private async stickerBufferToId(source: Uint8Array): Promise<string> {
    const message = await this.options.api.sendSticker(
      getRandomChatId(this.options.cacheChatIds),
      new InputFile(source, "sticker-gen.webp"),
    );
    const fileId = message.sticker?.file_id;
    if (!fileId) throw new Error("Telegram did not return a sticker file id");
    return fileId;
  }
}
