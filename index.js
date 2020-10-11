const { Telegraf } = require('telegraf')
const session = require('telegraf/session')
const commandParts = require('telegraf-command-parts');
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())
bot.use(commandParts());

// components
bot.use(
    require('./components/simple-reply'),
    require('./components/dayoff'),
    require('./components/help'),
    require('./components/start'),
    require(`./components/inline/index`),
    require('./components/subscribe/index')
);


module.exports = bot