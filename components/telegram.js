const { Telegram } = require("telegraf");
const telegram = new Telegram(process.env.BOT_TOKEN);
module.exports = telegram;
