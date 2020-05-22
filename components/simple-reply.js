const Composer = require('telegraf/composer')
const bot = new Composer()
const telegram = require('./telegram')

bot.start(async ctx => {
    let { first_name } = await telegram.getMe()
    ctx.replyWithSticker('https://data.gnehs.net/stickers/hello.webp', { reply_to_message_id: ctx.message.message_id })
    ctx.reply(`這裡是${first_name}！`, { reply_to_message_id: ctx.message.message_id })
})

bot.command('removekbd', ({ reply, replyWithSticker, message }) => {
    replyWithSticker('https://data.gnehs.net/stickers/bye.webp', { reply_to_message_id: message.message_id })
    reply(`鍵盤掰掰`, { reply_markup: JSON.stringify({ remove_keyboard: true }), reply_to_message_id: message.message_id })
})
bot.command('date', ({ reply, message }) => reply(`Server time: ${Date()}`, { reply_to_message_id: message.message_id }))

// Ping
bot.command('ping', ({ replyWithMarkdown, message }) => replyWithMarkdown(`*PONG*`, { reply_to_message_id: message.message_id }))
bot.hears('ping', ({ replyWithMarkdown, message }) => replyWithMarkdown(`*PONG*`, { reply_to_message_id: message.message_id }))

// 髒話偵測
bot.hears(msg => msg.match(/幹|幹你娘|趕羚羊/) && !msg.match(/幹嘛/), ({ replyWithMarkdown }) => replyWithMarkdown('_QQ_'));

bot.hears("怕", ({ reply, message }) => reply('嚇到吃手手', { reply_to_message_id: message.message_id }));

bot.hears("逼比", ({ reply, message }) => reply('蹦蹦', { reply_to_message_id: message.message_id }));

bot.hears("喵", ({ replyWithMarkdown, message }) => replyWithMarkdown('`HTTP /3.0 200 OK.`', { reply_to_message_id: message.message_id }));

bot.hears("嗨", ({ replyWithSticker, message }) => replyWithSticker('https://data.gnehs.net/stickers/hello.webp', { reply_to_message_id: message.message_id }));

bot.hears("晚安", ({ reply, message, replyWithSticker }) => {
    replyWithSticker('https://data.gnehs.net/stickers/good%20night.webp', { reply_to_message_id: message.message_id })
    reply(`${message.from.first_name}，晚安❤️`, { reply_to_message_id: message.message_id })
});

module.exports = bot