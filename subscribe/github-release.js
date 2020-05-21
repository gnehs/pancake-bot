const db = require('../components/db')
const Composer = require('telegraf/composer')
const telegram = require('../components/telegram')
const bot = new Composer()
const cron = require('node-cron');
const fetch = require('node-fetch');
cron.schedule('*/10 * * * *', () => {
    sendData()
});
function releaseId(repo, value) {
    let releaseIdList = db.get('github-release')
    if (value) {
        releaseIdList[repo] = value
        db.set('github-release', releaseIdList)
    }
    return releaseIdList[repo]
}
async function checkRepo(repo) {
    let releaseData = await fetch(`https://api.github.com/repos/${repo}/releases`)
}
function sendData() {
    // 取得 Repo List
    // 檢查更新
    // 發訊息
}
module.exports = bot