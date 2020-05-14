const Composer = require('telegraf/composer')
const bot = new Composer()
const telegram = require('./telegram')
bot.on('sticker', ({
    message
}) => console.log(message))

bot.start(async ({
    reply,
    replyWithSticker
}) => {
    let {
        first_name
    } = await telegram.getMe()
    replyWithSticker('https://data.gnehs.net/stickers/hello.webp')
    reply(`這裡是${first_name}！`)
})

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
}) => replyWithMarkdown('`HTTP /3.0 200 OK.`'));

bot.hears("晚安", ({
    reply,
    message,
    replyWithSticker
}) => {
    replyWithSticker('https://data.gnehs.net/stickers/good%20night.webp')
    reply(`${message.from.first_name}，晚安❤️`)
});

module.exports = bot