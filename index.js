const {
    Telegraf
} = require('telegraf')
const session = require('telegraf/session')
const Composer = require('telegraf/composer')
const commandParts = require('telegraf-command-parts');
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())
bot.use(commandParts());

// components
const bahamut = require('./components/bahamut-anime')
const simpleReply = require('./components/simple-reply')
const dayoff = require('./components/dayoff')
const subscribe = require('./components/subscribe')
bot.use(bahamut, simpleReply, dayoff, subscribe);


module.exports = bot