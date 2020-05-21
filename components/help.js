const Composer = require('telegraf/composer')
const bot = new Composer()
const telegram = require('./telegram')
let subscribeIdList = require('../subscribeIdList')
function parseSubscribeIdList() {
    let result = ""
    for ([id, name] of Object.entries(subscribeIdList))
        result += `${id} - ${name}\n`
    subscribeIdList = result
}
parseSubscribeIdList()
bot.help(async ({ replyWithMarkdown }) => {
    let { first_name } = await telegram.getMe()
    replyWithMarkdown(`*${first_name}的指令清單*
/start - 開始
/ping - PONG
/date - 傳回伺服器的時間
/dayoff - 台灣行政院人事局的停班課
/removekbd - 移除鍵盤

*訂閱功能*
/subscribe <訂閱編號> <可選參數> - 訂閱
/unsubscribe <訂閱編號> <可選參數> - 取消訂閱

*訂閱編號*
${subscribeIdList}
*測試*
/admin - 看看你是不是管理員
`)
})
module.exports = bot