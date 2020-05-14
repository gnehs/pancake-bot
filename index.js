const session = require('telegraf/session')
const Composer = require('telegraf/composer')
const bot = new Composer()
bot.use(session())

// components
const bahamut = require('./components/bahamut-anime')
const simpleReply = require('./components/simple-reply')
const dayoff = require('./components/dayoff')
bot.use(bahamut, simpleReply, dayoff);


module.exports = bot