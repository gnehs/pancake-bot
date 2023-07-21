const Composer = require("telegraf/composer");
const bot = new Composer();
const telegram = require("./telegram");

bot.command("removekbd", ({ reply, replyWithSticker, message }) => {
  replyWithSticker("https://data.gnehs.net/stickers/bye.webp", {
    reply_to_message_id: message.message_id,
  });
  reply(`鍵盤掰掰`, {
    reply_markup: JSON.stringify({ remove_keyboard: true }),
    reply_to_message_id: message.message_id,
  });
});
bot.command("date", ({ reply, message }) =>
  reply(`Server time: ${Date()}`, { reply_to_message_id: message.message_id })
);
bot.command("about", async ({ replyWithMarkdown, message }) => {
  let { first_name } = await telegram.getMe();
  replyWithMarkdown(
    `「${first_name}」由 [🥞pancake](https://github.com/gnehs/pancake-bot) 驅動！`,
    { reply_to_message_id: message.message_id }
  );
});

// Ping
bot.command("ping", ({ replyWithMarkdown, message }) =>
  replyWithMarkdown(`*PONG*`, { reply_to_message_id: message.message_id })
);
bot.hears("ping", ({ replyWithMarkdown, message }) =>
  replyWithMarkdown(`*PONG*`, { reply_to_message_id: message.message_id })
);

// 髒話偵測
bot.hears("幹", ({ replyWithMarkdown }) => replyWithMarkdown("_QQ_"));

bot.hears("怕", ({ reply, message }) =>
  reply("嚇到吃手手", { reply_to_message_id: message.message_id })
);

bot.hears("逼比", ({ reply, message }) =>
  reply("蹦蹦", { reply_to_message_id: message.message_id })
);

bot.hears("喵", ({ replyWithMarkdown, message }) =>
  replyWithMarkdown("`HTTP /3.0 200 OK.`", {
    reply_to_message_id: message.message_id,
  })
);

bot.hears("嗨", ({ replyWithSticker, message }) =>
  replyWithSticker("https://data.gnehs.net/stickers/hello.webp", {
    reply_to_message_id: message.message_id,
  })
);

bot.hears("晚安", ({ reply, message, replyWithSticker }) => {
  if (message.from.username == "seadog007") {
    replyWithSticker("https://gcdnb.pbrd.co/images/ZLjQQi8gqHui.webp", {
      reply_to_message_id: message.message_id,
    });
  } else if (message.from.username == "Vincent550102") {
    replyWithSticker("https://gcdnb.pbrd.co/images/4UdVojF7Ss9F.webp", {
      reply_to_message_id: message.message_id,
    });
  } else if (Math.random() < 0.5) {
    replyWithSticker("https://data.gnehs.net/stickers/good%20night.webp", {
      reply_to_message_id: message.message_id,
    });
  } else {
    replyWithSticker("https://gcdnb.pbrd.co/images/ZLjQQi8gqHui.webp", {
      reply_to_message_id: message.message_id,
    });
  }
  if (message.from.username == "seadog007") {
    reply(`笨豹豹，晚安`, { reply_to_message_id: message.message_id });
  } else {
    reply(`${message.from.first_name}，晚安❤️`, {
      reply_to_message_id: message.message_id,
    });
  }
});

module.exports = bot;
