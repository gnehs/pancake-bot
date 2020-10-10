
const Composer = require('telegraf/composer')
const telegram = require('./telegram')
const inlineProcessorList = [
    {
        name: '海綿寶寶圖片搜尋器',
        keywords: ['p', 'puffy', '海'],
        js: './puffy.js'
    },
    {
        name: '貼圖產生器',
        keywords: ['s', 'sticker', '貼'],
        js: './sticker.js'
    },
]
const bot = new Composer()
bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
    let text = inlineQuery.query.split(' ')
    if (text.length > 1) {
        for (let inlineProcessor of inlineProcessorList) {
            if (inlineProcessor.keywords.includes(text[0])) {
                return require(inlineProcessor.js)({ inlineQuery, answerInlineQuery })
            }
        }
    }
    // send help message
    let { username, first_name } = await telegram.getMe()
    let parsedInlineProcessorList = inlineProcessorList
        .map((x, i) => `${i + 1}. ${x.name}\n代號：${x.keywords.join(', ')}`)
        .join('\n\n')
    let results = [{
        type: 'article',
        id: 'info_msg',
        title: '使用說明',
        description: '按這裡查看使用說明',
        input_message_content: {
            message_text: `**📘「${first_name}」的使用說明**

👇 機器人可接受的格式如下：
@${username} _<代號>_ _<文字/關鍵字>_

👇 可用的處理器清單：
${parsedInlineProcessorList}`,
            parse_mode: 'Markdown'
        },
    }]
    return answerInlineQuery(results, { cache_time: 60 * 60 /* second */ })


})

module.exports = bot