const Composer = require("telegraf/composer");
const bot = new Composer();
const fetch = require("node-fetch");

bot.command("stepstep", async ({ reply, message }) => {
  const date = new Date(
    new Date().toLocaleString("en", { timeZone: "Asia/Taipei" })
  );
  let day = date.getDate();
  if (date.getHours() < 8) day = day - 1;
  const dateStr = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    day.toString().padStart(2, "0"),
  ].join("-");

  let rank = await fetch(
    `https://steps.pancake.tw/api/v1/rank?date=${dateStr}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    }
  ).then((res) => res.json());
  rank = rank.slice(0, 5);

  let responseText = `<b>🍪 餅餅踏踏排行榜 🍪</b>\n`;
  responseText += `${dateStr}\n\n`;
  rank.forEach((item, index) => {
    let distance = item.distance.toFixed(2);
    let steps = item.steps.toLocaleString();
    responseText += `<code>${index + 1}. </code>${item.user.name}\n`;
    responseText += `<code>   ${distance} 公里 - ${steps} 步</code>\n`;
  });

  reply(responseText, {
    reply_to_message_id: message.message_id,
    parse_mode: "html",
  });
});

module.exports = bot;
