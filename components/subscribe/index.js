const { subscribe, unsubscribe } = require("./manage");
const { Composer } = require("telegraf");
const telegram = require("../telegram");
const fetch = require("node-fetch");
const bot = new Composer();
const subscribeIdList = require("../../list").subscribeIdList;

require("./bahamut-anime");
require("./github-release");
require("./apple-ncc");
bot.command("admin", async (ctx) => {
  try {
    let isUserAdmin = await isAdmin(ctx);
    return ctx.reply(
      `您${isUserAdmin ? "有" : "沒有"}此聊天室的管理權限，${
        isUserAdmin ? "可" : "不可"
      }於此操作訂閱與取消訂閱等功能。`,
      { reply_to_message_id: ctx.message.message_id }
    );
  } catch (e) {
    console.log(e);
  }
});

async function isAdmin(ctx) {
  try {
    if (ctx.chat.type == "group" || ctx.chat.type == "supergroup") {
      let adminList = await telegram.getChatAdministrators(ctx.chat.id);
      return adminList.some((adm) => adm.user.id === ctx.from.id);
    } else {
      return true;
    }
  } catch (e) {
    return false;
  }
}

bot.command("subscribe", async (ctx) => {
  try {
    if (await isAdmin(ctx)) {
      let args = ctx.message.text.split(" ").slice(1);
      let chatId = ctx.message.chat.id;
      if (args[0]) {
        for (id in subscribeIdList) {
          if (args[0] == id) {
            ctx.replyWithSticker(
              "https://data.gnehs.net/stickers/ohohoh.webp",
              {
                reply_to_message_id: ctx.message.message_id,
              }
            );
            telegram.sendChatAction(ctx.chat.id, "typing");
            // GitHub 檢查有沒有這個 Repo
            if (id === "github-release") {
              let testFetch = await fetch(
                `https://api.github.com/repos/${args[1]}/releases`
              ).then((res) => res.json());
              if (testFetch.message)
                return ctx.replyWithMarkdownV2(
                  `❌ 無法訂閱「${subscribeIdList[id]}」，請確定 Repo 名稱是否正確。\n錯誤訊息：\`${testFetch.message}\``,
                  { reply_to_message_id: ctx.message.message_id }
                );
            }
            subscribe(id, args[1] || null, chatId);
            ctx.replyWithMarkdownV2(
              `🎉 已訂閱「${subscribeIdList[id]}」，使用 \`/unsubscribe ${id}${
                args[1] ? " " + args[1] : ""
              }\` 來取消訂閱。`,
              { reply_to_message_id: ctx.message.message_id }
            );
            console.log(
              `[Subscribe] ${ctx.from.username}(${ctx.from.id}) subscribe ${id}`,
              `${args[1] || ""} in ${ctx.chat.id}(${
                ctx.chat.title || ctx.from.first_name
              })`
            );
          }
        }
      } else {
        ctx.reply(`❌ 請在後面加上訂閱編號`, {
          reply_to_message_id: ctx.message.message_id,
        });
      }
    } else {
      ctx.reply(`❌ 只有管理員能使用此指令`, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  } catch (e) {
    console.log(e);
  }
});
bot.command("unsubscribe", async (ctx) => {
  try {
    if (await isAdmin(ctx)) {
      let args = ctx.message.text.split(" ").slice(1);
      let chatId = ctx.message.chat.id;
      if (args[0]) {
        for (id in subscribeIdList) {
          if (args[0] == id) {
            ctx.replyWithSticker("https://data.gnehs.net/stickers/bye.webp", {
              reply_to_message_id: ctx.message.message_id,
            });
            telegram.sendChatAction(ctx.chat.id, "typing");
            unsubscribe(id, args[1] || null, chatId);
            ctx.replyWithMarkdownV2(
              `👋 取消訂閱「${subscribeIdList[id]}」成功。`,
              { reply_to_message_id: ctx.message.message_id }
            );
            console.log(
              `[Unsubscribe] ${ctx.from.username}(${ctx.from.id}) unsubscribe ${id}`,
              `${args[1] || ""} in ${ctx.chat.id}(${
                ctx.chat.title || ctx.from.first_name
              })`
            );
          }
        }
      } else {
        ctx.reply(`❌ 請在後面加上訂閱編號`, {
          reply_to_message_id: ctx.message.message_id,
        });
      }
    } else {
      ctx.reply(`❌ 只有管理員能使用此指令`, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  } catch (e) {
    console.log(e);
  }
});
module.exports = bot;
