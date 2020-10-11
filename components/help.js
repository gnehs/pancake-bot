const Composer = require('telegraf/composer')
const bot = new Composer()
const telegram = require('./telegram')
const subscribeIdList = Object.entries(require('../list').subscribeIdList).map(([id, name]) => `${id} - ${name}\n`).join('')
bot.help(async ctx => {
    let { first_name } = await telegram.getMe()
    ctx.replyWithMarkdown(`*${first_name}的指令清單*
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
`, { reply_to_message_id: ctx.message.message_id })
})
module.exports = bot