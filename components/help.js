const { Composer } = require("telegraf");
const bot = new Composer();
const telegram = require("./telegram");
const subscribeIdList = Object.entries(require("../list").subscribeIdList)
  .map(([id, name]) => `${id} - ${name}\n`)
  .join("");
bot.help(async (ctx) => {
  let { first_name } = await telegram.getMe();
  ctx.replyWithHTML(
    `<b>${first_name}的指令清單</b>
/about - 關於
/date - 傳回伺服器的時間
/dayoff - 台灣行政院人事局的停班課
/ping - PONG
/removekbd - 移除鍵盤
/start - 開始

<b>訂閱功能</b>
/subscribe <u>訂閱編號</u> <u>可選參數</u> - 訂閱
/unsubscribe <u>訂閱編號</u> <u>可選參數</u> - 取消訂閱

<b>訂閱編號</b>
${subscribeIdList}
<b>測試</b>
/admin - 檢查是否具此聊天室的管理權限
`,
    { reply_to_message_id: ctx.message.message_id }
  );
});
module.exports = bot;
