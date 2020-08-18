
const Composer = require('telegraf/composer')
const bot = new Composer()
const telegram = require('./telegram')
const fs = require('fs');
const index = require("flexsearch").create({
    encode: false,
    tokenize: str => str.replace(/[\x00-\x7F]/g, "").split("")
});
const chats = require('../config').chats;
const getRandomChat = () => chats[Math.floor(Math.random() * chats.length)]
async function imageFiletoId(url) {
    let msg = await telegram.sendPhoto(getRandomChat(), {
        source: require('fs').readFileSync('./components/puffy/' + url)
    })
    return msg.photo.pop().file_id
}
bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
    let text = inlineQuery.query
    let searchResult = index.search(text, 4)
    let results = []
    let tasks = []
    async function parseImage(name, file) {
        results.push({
            type: 'photo',
            id: name,
            title: name,
            description: file,
            photo_file_id: await imageFiletoId(file)
        })
    }
    for (let file of searchResult) {
        let name = file.split(']').pop().replace('.jpg', '')
        tasks.push(parseImage(name, file))
    }
    await Promise.all(tasks)
    console.log(`[${'@' + inlineQuery.from.username || inlineQuery.from.first_name}][${text}] 處理完畢`)
    return answerInlineQuery(results, { cache_time: 60 * 60 /* second */ })
})

bot.on('chosen_inline_result', ({ chosenInlineResult }) => {
    console.log('chosen inline result', chosenInlineResult)
})
fs.readdir('./components/puffy/', (err, files) => {
    files.forEach((file, id) => {
        let name = file.split(']').pop().replace('.jpg', '')
        index.add(file, name);
    });
    console.log(`${index.length} 張圖片已匯入`)
});
module.exports = bot