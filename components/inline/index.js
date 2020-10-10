
const Composer = require('telegraf/composer')
const telegram = require('../telegram')
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
        .map((x, i) => `*${x.name}*\n代號：${x.keywords.join(', ')}`)
        .join('\n')
    let results = [{
        type: 'article',
        id: 'info_msg',
        title: '使用說明',
        description: '按這裡查看使用說明',
        thumb_url: 'https://i.loli.net/2020/10/11/Vitra1wnSOAWMRg.jpg',
        input_message_content: {
            message_text: `*📘「${first_name}」使用說明*

*👇 機器人可接受的格式如下：*
@${username} \`<代號> <文字/關鍵字>\`

*👇 可用的處理器清單：*
${parsedInlineProcessorList}`,
            parse_mode: 'markdown'
        },
    }, {
        type: 'article',
        id: 'info_github',
        title: '相關介紹',
        description: `查看「${first_name}」的身世`,
        thumb_url: 'https://i.loli.net/2020/10/11/HEWmLaA2ecGC8Ov.jpg',
        input_message_content: {
            message_text: `「${first_name}」由 [🥞pancake](https://github.com/gnehs/pancake-bot) 所驅動！`,
            parse_mode: 'markdown'
        },
    }]
    return answerInlineQuery(results, { cache_time: 60 * 60 /* second */ })


})

module.exports = bot