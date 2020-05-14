const db = require('./db')
const Composer = require('telegraf/composer')
const telegram = require('./telegram')
const bot = new Composer()
const cron = require('node-cron');
const fetch = require('node-fetch');
cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
    fetchData()
});
sendData()
async function sendData() {
    //check new
    let newEpisode = []
    let sentEpisode = db.get('bahamut-sent') || {}
    for (item of await fetchData()) {
        if (!sentEpisode[item.id]) {
            newEpisode.push(item)
            sentEpisode[item.id] = true
        }
    }
    db.set('bahamut-sent', sentEpisode)
    if (newEpisode.length > 0) {
        let resp = "\#ㄅㄏ動畫瘋更新菌\n"
        for ({
                link,
                title,
                episode
            } of newEpisode) {
            resp += `*E${episode.length>=2?episode:`0${episode}`}* [${title}](${link})\n`
        }
        for (chat of Object.keys(db.get('subscribe.baha'))) {
            telegram.sendMessage(chat, resp, {
                parse_mode: "Markdown",
                disable_web_page_preview: true
            })
        }
    }
}
async function fetchData() {
    let data = await fetch('https://api.gamer.com.tw/mobile_app/anime/v1/index.php').then(res => res.json())
    let result = []
    for ({
            video_sn,
            title,
            info,
            title
        } of data.new_anime.date) {
        result.push({
            id: video_sn,
            title,
            link: `https://ani.gamer.com.tw/animeVideo.php?sn=${video_sn}`,
            episode: info.match(/\[(.+)\]/)[1],
            date: info.match(/(.+) 更新至 /)[1]
        })
    }
    return result
}
module.exports = bot