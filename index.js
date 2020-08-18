const { Telegraf } = require('telegraf')
const session = require('telegraf/session')
const commandParts = require('telegraf-command-parts');
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())
bot.use(commandParts());

// components
const inlineProcessor = require('./config').inlineProcessor;
bot.use(
    require('./subscribe/bahamut-anime'),
    require('./subscribe/github-release'),
    require('./components/simple-reply'),
    require('./components/dayoff'),
    require('./components/subscribe'),
    require('./components/help'),
    require(`./components/${inlineProcessor}`)
);


module.exports = bot