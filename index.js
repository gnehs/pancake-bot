const { Telegraf } = require('telegraf')
const session = require('telegraf/session')
const commandParts = require('telegraf-command-parts');
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`)
    console.log(err)
})
bot.use(session())
bot.use(commandParts());

// components
bot.use(
    require('./components/simple-reply'),
    require('./components/dayoff'),
    require('./components/help'),
    require('./components/start'),
    require('./components/gonokami'),
    require(`./components/inline/index`),
    require('./components/subscribe/index')
);


module.exports = bot