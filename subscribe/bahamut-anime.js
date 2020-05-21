const db = require('../components/db')
const Composer = require('telegraf/composer')
const telegram = require('../components/telegram')
const bot = new Composer()
const cron = require('node-cron');
const fetch = require('node-fetch');
cron.schedule('*/10 * * * *', () => {
    sendData()
});
async function fetchData() {
    let data = await fetch('https://api.gamer.com.tw/mobile_app/anime/v1/index.php').then(res => res.json())
    let newEpisode = []
    let recentAdded = []
    for ({ video_sn, title, info } of data.new_anime.date) {
        let episode = info.match(/\[(.+)\]/)[1]
        episode = episode.length >= 2 ? episode : `0${episode}`
        newEpisode.push({
            id: video_sn,
            title,
            link: `https://ani.gamer.com.tw/animeVideo.php?sn=${video_sn}`,
            episode,
        })
    }
    for ({ anime_sn, title, info } of data.new_added) {
        recentAdded.push({
            id: `recent_${anime_sn}`,
            title,
            link: `https://ani.gamer.com.tw/animeRef.php?sn=${anime_sn}`,
        })
    }
    return {
        newEpisode,
        recentAdded
    }
}
async function sendData() {
    //check new
    let fetchedData = await fetchData()
    let newEpisode = []
    let recentAdded = []
    let sentEpisode = db.get('bahamut-sent') || {}
    // 新增的內容
    for (item of fetchedData.newEpisode)
        if (!sentEpisode[item.id])
            newEpisode.push(item)
    for (item of fetchedData.recentAdded)
        if (!sentEpisode[item.id])
            recentAdded.push(item)
    // 重置已發送ㄉ資料
    sentEpisode = {}
    for ({ id } of fetchedData.newEpisode)
        sentEpisode[id] = true
    for ({ id } of fetchedData.recentAdded)
        sentEpisode[id] = true
    db.set('bahamut-sent', sentEpisode)
    // 送資料
    if (newEpisode.length || recentAdded.length) {
        let resp = "#ㄅㄏ動畫瘋更新菌\n"
        for ({ link, title, episode } of newEpisode) {
            let ep = isNaN(episode) ? episode : `E${episode}` // 有時候會解析出「電影」之類的東西所以要過濾一下
            resp += `<b>${ep}</b> <a href="${link}">${title}</a>\n`
        }
        if (recentAdded.length) {
            resp += `<b>最近新增</b>\n`
            for ({ link, title } of recentAdded) {
                resp += `<a href="${link}">${title}</a>\n`
            }
        }
        for (chat of Object.keys(db.get('subscribe.baha'))) {
            telegram.sendMessage(chat, resp, {
                parse_mode: "html",
                disable_web_page_preview: true
            })
        }
    }
}
module.exports = bot