const db = require('../db')
const { sendMessage } = require('./manage')
const cron = require('node-cron');
const fetch = require('node-fetch');
cron.schedule('*/5 * * * *', () => {
  sendData()
});
async function sendData() {
  // check new
  let data = await fetch('https://gnehs.github.io/apple-ncc-feed/').then(res => res.json())
  let sent = db.get('apple-ncc') || []
  let newData = data.filter(x => !sent.includes(x.new_id))
  db.set('apple-ncc', [...new Set([...sent, ...newData.map(x => x.new_id)])])
  // check verifydate
  newData = newData.filter(x => {
    // "verifydate": "2022/10/04",
    let date = x.verifydate.split('/')
    let now = new Date()
    let verifydate = new Date(date[0], date[1] - 1, date[2])
    // check if verifydate is this week
    if (now.getDate() - verifydate.getDate() > 7) return false
    return true
  })
  // 送資料
  if (newData.length) {
    let text = ''
    for (let item of newData) {
      text += `🍎 #Apple_NCC #${item.model}\n`
      text += `產品名稱：${item.equip_name}\n`
      text += `驗證號碼：<pre>${item.new_id}</pre>\n`
      text += `產品型號：<pre>${item.model}</pre>\n`
      text += `審驗日期：${item.verifydate}\n`
      text += `<a href="https://gnehs.github.io/apple-ncc-feed/demo.html#${item.new_id}">🔗 詳細資料</a>\n\n`
    }
    sendMessage({
      chats: Object.keys(db.get('subscribe.apple-ncc')),
      message: text,
      key: 'apple-ncc'
    })
  }
}
sendData()