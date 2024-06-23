const { Composer } = require("telegraf");
const telegram = require("../telegram");
const inlineProcessorList = require("../../list").inlineProcessorList;
const bot = new Composer();
bot.on("inline_query", async (ctx) => {
  let text = ctx.inlineQuery.query.split(" ");
  try {
    if (text.length > 1) {
      for (let inlineProcessor of inlineProcessorList) {
        if (inlineProcessor.keywords.includes(text[0])) {
          return require(inlineProcessor.js)(ctx);
        }
      }
    }
  } catch (e) {
    console.log(e);
    return ctx.answerInlineQuery([], {
      button: {
        text: `❌ 出錯了，請稍後再試`,
        start_parameter: "inline_error",
      },
    });
  }
  // send help message
  let { first_name } = await telegram.getMe();
  return ctx.answerInlineQuery([], {
    cache_time: 60 * 60 /* second */,
    button: {
      text: `📘 查看「${first_name}」行內機器人使用說明`,
      start_parameter: "inline_help",
    },
  });
});

module.exports = bot;
