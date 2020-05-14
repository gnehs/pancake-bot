const Composer = require('telegraf/composer')
const bot = new Composer()


bot.on('sticker', ({
    message
}) => console.log(message))

bot.start(({
    reply,
    replyWithSticker
}) => {
    replyWithSticker('CAACAgUAAxkBAAIEk168uuUhTaJOZq7Y852DtbeSGt9rAAIVAAM4OXczIctMvt3--UEZBA')
    reply('這裡是鬆餅好朋友！')
})

bot.help(({
    replyWithSticker
}) => replyWithSticker('CAACAgUAAxkBAAIEqF68vBDUGn3vm__LyL1GIGLBxiN6AAIgAAM4OXczo9cKNXYj3Q4ZBA'))

bot.command('date', ({
    reply
}) => reply(`Server time: ${Date()}`))

// Ping
bot.command('ping', ({
    replyWithMarkdown
}) => replyWithMarkdown(`*PONG*`))
bot.hears('ping', ({
    replyWithMarkdown
}) => replyWithMarkdown(`*PONG*`))

// 髒話偵測
bot.hears((msg) => msg.match(/幹|幹你娘|趕羚羊/) && !msg.match(/幹嘛/), ({
    replyWithMarkdown
}) => replyWithMarkdown('_QQ_'));

bot.hears("怕", ({
    reply
}) => reply('嚇到吃手手'));

bot.hears("逼比", ({
    reply
}) => reply('蹦蹦'));

bot.hears("喵", ({
    replyWithMarkdown
}) => replyWithMarkdown('`HTTP/3.0 200 OK.`'));

bot.hears("晚安", ({
    reply,
    message
}) => reply(`${message.from.first_name}，晚安❤️`));

module.exports = bot