
const Composer = require('telegraf/composer')
const bot = new Composer()
const db = require('./db')
const telegram = require('./telegram')
const fs = require('fs');
const index = require("flexsearch").create({
    encode: false,
    tokenize: str => str.replace(/[\x00-\x7F]/g, "").split("")
});
const chats = require('../config').chats;
const getRandomChat = () => chats[Math.floor(Math.random() * chats.length)]
let cacheFinished = false
async function imageFiletoId(file) {
    let cacheData = db.get('puffyCache') || {}
    if (cacheData[file]) return cacheData[file] // check cache && return
    let msg = await telegram.sendPhoto(getRandomChat(), {
        source: require('fs').readFileSync('./components/puffy/' + file)
    })
    let photoId = msg.photo.pop().file_id
    cacheData[file] = photoId
    db.set('puffyCache', cacheData);
    return photoId
}
bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
    let text = inlineQuery.query
    let searchResult = index.search(text, cacheFinished ? 100 : 4)
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
        let name = file.replace('.jpg', '')
        tasks.push(parseImage(name, file))
    }
    await Promise.all(tasks)
    console.log(`[${'@' + inlineQuery.from.username || inlineQuery.from.first_name}][${text}] 處理完畢`)
    return answerInlineQuery(results, { cache_time: 60 * 60 /* second */ })
})

bot.on('chosen_inline_result', ({ chosenInlineResult }) => {
    console.log('chosen inline result', chosenInlineResult)
})
fs.readdir('./components/puffy/', async (err, files) => {
    files = files.filter(x => x != '.DS_Store')
    files.forEach(file => {
        let name = file.replace('.jpg', '')
        index.add(file, name);
    });
    // 移除已經不存在的圖片
    let cacheData = db.get('puffyCache') || {}
    for (let cachedfile of Object.keys(cacheData)) {
        if (!files.includes(cachedfile)) {
            delete cacheData[cachedfile]
        }
    }
    // 快取
    const delay = (s) => {
        return new Promise(resolve => {
            setTimeout(resolve, s);
        });
    };
    for (let file of files) {
        cacheData = db.get('puffyCache') || {}
        if (!cacheData[file]) {
            console.log(`[${Object.keys(cacheData).length}/${files.length}]正在快取 ${file}`)
            imageFiletoId(file)
            await delay(1200)
        }
    }
    cacheFinished = true
    console.log(`${index.length} 張圖片快取完畢`);
});
module.exports = bot