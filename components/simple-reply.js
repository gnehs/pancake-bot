const { Composer } = require("telegraf");
const { message } = require("telegraf/filters");
const bot = new Composer();
const telegram = require("./telegram");

bot.command("removekbd", (ctx) => {
  ctx.replyWithSticker(
    "CAACAgEAAxkBAAIJlmZ4AULu2paaf4qOqVJ4f3APqfoBAAKdAgACOPTgR1en_Fb8JDzgNQQ",
    {
      reply_to_message_id: ctx.message.message_id,
    }
  );
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
  ctx.replyWithSticker(
    "CAACAgUAAxkBAAIJmGZ4AVRrCyLdCt5vI4aTB7cPYrP8AAJ8DgACgOxZVgNQJej4_BIkNQQ",
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
);

bot.hears("早安", (ctx) =>
  ctx.replyWithSticker(
    "CAACAgUAAxkBAAIJdmZ3_youpSxjm__7ga2LnxG3ESNPAAJzEgACETeQV1xbq7c7uVXGNQQ",
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
);

bot.hears(["容勾絲揪", "榮勾絲揪"], (ctx) =>
  ctx.replyWithSticker(
    "CAACAgUAAxkBAAIJiGZ4AAF7iriA0n-aQnYFuDrLVTNZ7gACfA4AAoDsWVYDUCXo-PwSJDUE",
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
);

bot.hears("❤️", (ctx) =>
  ctx.replyWithSticker(
    "CAACAgUAAxkBAAIJgGZ4AAEXZIeOW1aI0K5y2nStxPIAAZkAAosSAAL51blXAAFQ0ZANjhzaNQQ",
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
);
bot.hears("🥞", (ctx) =>
  ctx.replyWithSticker(
    "CAACAgUAAxkBAAIJgmZ4AAElMp9saRujXl79y1UXp_aO0AAC_g4AAtAFuVdJIvY5qe55ZTUE",
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
);

bot.hears("🍪", (ctx) =>
  ctx.replyWithSticker(
    "CAACAgUAAxkBAAIJhGZ4AAE3t5CFp00uwuJyhoB62LMjhwAC3AwAAszvuFcFVvEyvCXG-jUE",
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
);

bot.hears("🐰", (ctx) =>
  ctx.replyWithSticker(
    "CAACAgUAAxkBAAIJimZ4AAGNfrO8IPAUThRYmyPZYrThVgACjxAAAl-5WFZDCdsdEB9_7TUE",
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
);

bot.hears("🍉", (ctx) =>
  ctx.replyWithSticker(
    "CAACAgUAAxkBAAIJjGZ4AAGmd5w5V9ubdVwxTxcVQmmqAwACURAAAklkmFfHrPq-1h_M9jUE",
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
);

bot.hears("🍮", (ctx) =>
  ctx.replyWithSticker(
    "CAACAgUAAxkBAAIJjmZ4AAG8rk3AyK2Iveh5tA7L04CV6gACdhAAAiVoqVdHmGKi0FmWcDUE",
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
);

bot.hears("晚安", (ctx) => {
  const extra = {
    reply_to_message_id: ctx.message.message_id,
  };
  if (ctx.message.from.username == "seadog007") {
    ctx.replyWithSticker(
      "CAACAgUAAxkBAAIJkGZ4AAHqKDlns115TTRjphQPc4ZJkAACZAgAAjjQIVTLjvHNvbKjLTUE",
      extra
    );
  } else if (ctx.message.from.username == "Vincent550102") {
    ctx.replyWithSticker(
      "CAACAgEAAxkBAAIJlGZ4ASpSPzqcKmDHYaNPT3AHaMYxAAJFAgACR_HZRY-ZgVz18-Q3NQQ",
      extra
    );
  } else if (Math.random() < 0.5) {
    ctx.replyWithSticker(
      "CAACAgUAAxkBAAECFyZmd_7-NtyjFf0s-rZfoYgf1L5T-wACVg8AAugGWVZ2N1z2l3RnHjUE",
      extra
    );
  } else {
    ctx.replyWithSticker(
      "CAACAgUAAxkBAAIJkGZ4AAHqKDlns115TTRjphQPc4ZJkAACZAgAAjjQIVTLjvHNvbKjLTUE",
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
  ctx.reply(`<pre>${JSON.stringify(sticker, null, 2)}</pre>`, {
    reply_to_message_id: ctx.message.message_id,
    parse_mode: "HTML",
  });
});
module.exports = bot;
