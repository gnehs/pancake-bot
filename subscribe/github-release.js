const db = require('../components/db')
const Composer = require('telegraf/composer')
const telegram = require('../components/telegram')
const bot = new Composer()
const cron = require('node-cron');
const fetch = require('node-fetch');
const dbKey = "github-release"
cron.schedule('*/10 * * * *', () => {
    sendData()
});
function releaseId(repo, value) {
    let releaseIdList = db.get(dbKey) || {}
    if (value) {
        releaseIdList[repo] = value
        db.set(dbKey, releaseIdList)
    }
    return releaseIdList[repo]
}
async function checkRepo(repo) {
    return (await fetch(`https://api.github.com/repos/${repo}/releases`).then(res => res.json()))
}
async function sendData() {
    // 取得 Repo List
    let repoSubscribeList = db.get('subscribe.github-release') || {}
    let repoList = Object.keys(repoSubscribeList)
    // 檢查更新
    for (repo of repoList) {
        let localReleaseId = releaseId(repo)
        let repoReleases = await checkRepo(repo)
        if (repoReleases.message == 'Not Found') {
            let resp = ''
            resp += `找不到 <b>${repo}</b>，已自動取消訂閱\n`
            for (chat of Object.keys(repoSubscribeList[repo])) {
                telegram.sendMessage(chat, resp, {
                    parse_mode: "html",
                    disable_web_page_preview: true
                })
            }
            function unsubscribe(value) {
                let subscribe_list = repoSubscribeList
                delete subscribe_list[value]
                db.set('subscribe.github-release', subscribe_list);
            }
            unsubscribe(repo)
        } else if (!repoReleases.message) {
            let latestRelease = repoReleases[0]
            if (!localReleaseId || latestRelease.id > localReleaseId) {
                releaseId(repo, latestRelease.id)
                // 發訊息
                let resp = ''
                resp += `<b>${repo}</b> 已發布 <b>${latestRelease.name}</b>\n`
                resp += `<b>更新日誌</b>：\n${latestRelease.body}`
                resp += `\n<b>連結</b>：<a href="${latestRelease.html_url}">GitHub</a>`
                for (chat of Object.keys(repoSubscribeList[repo])) {
                    telegram.sendMessage(chat, resp, {
                        parse_mode: "html",
                        disable_web_page_preview: true
                    })
                }
            }
        }
    }
}
module.exports = bot