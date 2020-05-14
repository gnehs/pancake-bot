const Telegram = require('telegraf/telegram')
const telegram = new Telegram(process.env.BOT_TOKEN)
module.exports = telegram