const db = require('../db')
const { sendMessage } = require('./manage')
const cron = require('node-cron');
const fetch = require('node-fetch');
cron.schedule('0,30 * * * *', () => {
  sendData()
});
async function sendData() {
  //check new
  let data = await fetch('https://gnehs.github.io/apple-ncc-feed/').then(res => res.json())
  let sent = db.get('apple-ncc') || []
  let newData = data.filter(x => !sent.includes(x.new_id))
  db.set('apple-ncc', data.map(x => x.new_id))
  // 送資料
  if (newData.length) {
    for (let item of newData) {
      let text = `🍎 #Apple_NCC #${item.model}\n\n`
      text += `產品名稱：${item.equip_name}\n`
      text += `驗證號碼：<pre>${item.new_id}</pre>\n`
      text += `產品型號：<pre>${item.model}</pre>\n`
      text += `審驗日期：${item.verifydate}\n`
      if (item.files.some(x => x.name.includes('外觀照'))) {
        text += `<a href="${item.files.find(x => x.name.includes('外觀照')).link}">外觀照</a>\n`
      }
      sendMessage({
        chats: Object.keys(db.get('subscribe.apple-ncc')),
        message: text,
        key: 'apple-ncc'
      })
    }
  }
}
sendData()