import type { Bot } from "grammy";
import type { ChatMemberAdministrator, ChatMemberOwner } from "grammy/types";
import type { AppServices } from "../../bot.ts";
import type { BotContext } from "../../types.ts";
import { subscribeTopics } from "./topics.ts";
import { startBahamutAnimeNotifier } from "./bahamut-anime.ts";
import { subscribe, unsubscribe } from "./manage.ts";

function replyTo(ctx: BotContext) {
  return ctx.message
    ? { reply_parameters: { message_id: ctx.message.message_id } }
    : {};
}

function isPrivilegedChatMember(
  member: unknown,
): member is ChatMemberAdministrator | ChatMemberOwner {
  if (!member || typeof member !== "object") return false;
  return (
    "status" in member &&
    (member.status === "administrator" || member.status === "creator")
  );
}

async function isAdmin(ctx: BotContext): Promise<boolean> {
  if (!ctx.chat || !ctx.from) return false;
  if (ctx.chat.type !== "group" && ctx.chat.type !== "supergroup") return true;

  try {
    const member = await ctx.api.getChatMember(ctx.chat.id, ctx.from.id);
    return isPrivilegedChatMember(member);
  } catch {
    return false;
  }
}

export function installSubscribeFeature(
  bot: Bot<BotContext>,
  services: AppServices,
): void {
  startBahamutAnimeNotifier({
    api: bot.api,
    database: services.database,
  });

  bot.command("admin", async (ctx) => {
    const allowed = await isAdmin(ctx);
    await ctx.reply(
      `您${allowed ? "有" : "沒有"}此聊天室的管理權限，${
        allowed ? "可" : "不可"
      }於此操作訂閱與取消訂閱等功能。`,
      replyTo(ctx),
    );
  });

  bot.command("subscribe", async (ctx) => {
    if (!(await isAdmin(ctx))) {
      await ctx.reply("❌ 只有管理員能使用此指令", replyTo(ctx));
      return;
    }

    const args = ctx.message?.text.split(" ").slice(1) ?? [];
    const id = args[0];
    const topic = subscribeTopics.find((item) => item.id === id);
    if (!ctx.chat) return;
    if (!topic) {
      await ctx.reply("❌ 請在後面加上訂閱編號", replyTo(ctx));
      return;
    }

    subscribe(services.database, topic.id, ctx.chat.id);
    await ctx.replyWithSticker("https://data.gnehs.net/stickers/ohohoh.webp", replyTo(ctx));
    await ctx.reply(`🎉 已訂閱「${topic.name}」，使用 /unsubscribe ${topic.id} 來取消訂閱。`, replyTo(ctx));
    console.log(
      `[Subscribe] ${ctx.from?.username ?? ctx.from?.id ?? "unknown"} subscribe ${topic.id} in ${ctx.chat.id}`,
    );
  });

  bot.command("unsubscribe", async (ctx) => {
    if (!(await isAdmin(ctx))) {
      await ctx.reply("❌ 只有管理員能使用此指令", replyTo(ctx));
      return;
    }

    const args = ctx.message?.text.split(" ").slice(1) ?? [];
    const id = args[0];
    const topic = subscribeTopics.find((item) => item.id === id);
    if (!ctx.chat) return;
    if (!topic) {
      await ctx.reply("❌ 請在後面加上訂閱編號", replyTo(ctx));
      return;
    }

    unsubscribe(services.database, topic.id, ctx.chat.id);
    await ctx.replyWithSticker("https://data.gnehs.net/stickers/bye.webp", replyTo(ctx));
    await ctx.reply(`👋 取消訂閱「${topic.name}」成功。`, replyTo(ctx));
    console.log(
      `[Unsubscribe] ${ctx.from?.username ?? ctx.from?.id ?? "unknown"} unsubscribe ${topic.id} in ${ctx.chat.id}`,
    );
  });
}
