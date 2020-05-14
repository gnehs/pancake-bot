const Composer = require('telegraf/composer')
const bot = new Composer()
const telegram = require('./telegram')

bot.help(async ({
    replyWithMarkdown
}) => {
    let {
        first_name
    } = await telegram.getMe()
    replyWithMarkdown(`*${first_name}的指令清單*
/start - 開始
/ping - PONG
/date - 傳回伺服器的時間
/dayoff - 台灣行政院人事局的停班課
/removekbd 移除鍵盤
*訂閱功能*
/subscribe <訂閱編號> - 訂閱
/unsubscribe <訂閱編號> - 取消訂閱
*訂閱編號*
baha - 動畫瘋更新通知
*測試用*
/admin - 看看你是不是管理員
`)
})
module.exports = bot