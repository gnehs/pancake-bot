const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");
const bot = new Composer();
const telegram = require("./telegram");

bot.command("removekbd", (ctx) => {
  ctx.replyWithSticker("https://data.gnehs.net/stickers/bye.webp", {
    reply_to_message_id: ctx.message.message_id,
  });
  ctx.reply(`鍵盤掰掰`, {
    reply_markup: JSON.stringify({ remove_keyboard: true }),
    reply_to_message_id: ctx.message.message_id,
  });
});
bot.command("date", (ctx) =>
  ctx.reply(`Server time: ${Date()}`, {
    reply_to_message_id: ctx.message.message_id,
  })
);
bot.command("about", async (ctx) => {
  let { first_name } = await telegram.getMe();
  ctx.replyWithMarkdownV2(
    `「${first_name}」由 [🥞pancake](https://github.com/gnehs/pancake-bot) 驅動！`,
    { reply_to_message_id: ctx.message.message_id }
  );
});

// Ping
bot.command("ping", (ctx) =>
  ctx.replyWithMarkdownV2(`*PONG*`, {
    reply_to_message_id: ctx.message.message_id,
  })
);
bot.hears("ping", (ctx) =>
  ctx.replyWithMarkdownV2(`*PONG*`, {
    reply_to_message_id: ctx.message.message_id,
  })
);

// 髒話偵測
bot.hears("幹", (ctx) => ctx.replyWithMarkdownV2("_QQ_"));

bot.hears("怕", (ctx) =>
  ctx.reply("嚇到吃手手", { reply_to_message_id: ctx.message.message_id })
);

bot.hears("逼比", (ctx) =>
  ctx.reply("蹦蹦", { reply_to_message_id: ctx.message.message_id })
);

bot.hears("喵", (ctx) =>
  ctx.replyWithMarkdownV2("`HTTP /3.0 200 OK.`", {
    reply_to_message_id: ctx.message.message_id,
  })
);

bot.hears("嗨", (ctx) =>
  ctx.replyWithSticker("https://data.gnehs.net/stickers/hello.webp", {
    reply_to_message_id: ctx.message.message_id,
  })
);

bot.hears("晚安", (ctx) => {
  const extra = {
    reply_to_message_id: ctx.message.message_id,
  };
  if (ctx.message.from.username == "seadog007") {
    ctx.replyWithSticker(
      "https://gcdnb.pbrd.co/images/ZLjQQi8gqHui.webp",
      extra
    );
  } else if (ctx.message.from.username == "Vincent550102") {
    ctx.replyWithSticker(
      "https://gcdnb.pbrd.co/images/4UdVojF7Ss9F.webp",
      extra
    );
  } else if (Math.random() < 0.5) {
    ctx.replyWithSticker(
      "https://data.gnehs.net/stickers/good%20night.webp",
      extra
    );
  } else {
    ctx.replyWithSticker(
      "https://gcdnb.pbrd.co/images/ZLjQQi8gqHui.webp",
      extra
    );
  }
  if (ctx.message.from.username == "seadog007") {
    ctx.reply(`笨豹豹，晚安`, extra);
  } else {
    ctx.reply(`${ctx.message.from.first_name}，晚安❤️`, extra);
  }
});

// get user info by id
bot.command("getuserinfo", async (ctx) => {
  let splitedCommand = ctx.message.text.split(" ");
  splitedCommand.shift(); // remove first element
  let id = splitedCommand.join(" ");
  if (!id) {
    ctx.reply("❌ 請在後面加上使用者 ID", {
      reply_to_message_id: ctx.message.message_id,
    });
    return;
  }
  let user = await telegram.getChat(id);
  ctx.reply(JSON.stringify(user), {
    reply_to_message_id: ctx.message.message_id,
  });
});

// sticker info
bot.on(message("sticker"), (ctx) => {
  // is private
  if (ctx.chat.type != "private") {
    return;
  }
  let sticker = ctx.message.sticker;
  let stickerInfo = {
    file_id: sticker.file_id,
    file_unique_id: sticker.file_unique_id,
    width: sticker.width,
    height: sticker.height,
    is_animated: sticker.is_animated,
    emoji: sticker.emoji,
    set_name: sticker.set_name,
  };
  ctx.reply(`<pre>${JSON.stringify(stickerInfo, null, 2)}</pre>`, {
    reply_to_message_id: ctx.message.message_id,
    parse_mode: "HTML",
  });
});
module.exports = bot;
