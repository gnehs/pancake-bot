const { Telegraf } = require('telegraf')
const session = require('telegraf/session')
const commandParts = require('telegraf-command-parts');
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())
bot.use(commandParts());

// components
const bahamut = require('./subscribe/bahamut-anime')
const githubRelease = require('./subscribe/github-release')
const simpleReply = require('./components/simple-reply')
const dayoff = require('./components/dayoff')
const subscribe = require('./components/subscribe')
const help = require('./components/help')
bot.use(bahamut, githubRelease, simpleReply, dayoff, subscribe, help);


module.exports = bot