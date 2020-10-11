const Composer = require('telegraf/composer')
const bot = new Composer()
const telegram = require('./telegram')
const parsedInlineProcessorList = require('../list').inlineProcessorList
    .map((x, i) => `*${x.name}*\n代號：${x.keywords.join(', ')}`)
    .join('\n')
bot.start(async ctx => {
    let splitedCommand = ctx.message.text.split(' ')[1]
    let { first_name, username } = await telegram.getMe()
    switch (splitedCommand) {
        case 'inline_puffy_404':
            ctx.replyWithMarkdown(
                `你可以在 [這裡](https://github.com/gnehs/pancake-bot/tree/master/components/inline/puffy) 查看所有可供搜尋的圖片名稱`,
                { reply_to_message_id: ctx.message.message_id, disable_web_page_preview: true }
            )
            break;
        case 'inline_help':
            ctx.replyWithMarkdown(`*📘「${first_name}」行內機器人使用說明*

*👇 機器人可接受的格式如下：*
@${username} \`<代號> <文字/關鍵字>\`

*👇 可用的處理器清單：*
${parsedInlineProcessorList}`, { reply_to_message_id: ctx.message.message_id })
            break;
        default:
            ctx.replyWithSticker('https://data.gnehs.net/stickers/hello.webp', { reply_to_message_id: ctx.message.message_id })
            ctx.reply(`這裡是${first_name}！`, { reply_to_message_id: ctx.message.message_id })
    }
})
module.exports = bot