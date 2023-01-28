const db = require('../db')
const { sendMessage } = require('./manage')
const cron = require('node-cron');
const fetch = require('node-fetch');
const dbKey = "gonokamitw"
const crypto = require('crypto')
function getHash(str) {
  const hash = crypto.createHash('sha256')
  hash.update(str.toString(), 'utf8')
  return hash.digest('hex').slice(0, 8)
}
cron.schedule('*/15 * * * 4,5', () => {
  let subscribeList = db.get('subscribe.gonokamitw') || {}
  if (Object.keys(subscribeList).length)
    sendData()
});
async function sendData() {
  try {
    // get subscribe list
    let subscribeList = db.get('subscribe.gonokamitw') || {}
    let sentHashs = db.get('gonokamitw-sent') || []

    let posts = await fetch(`https://gnehs.github.io/gonokamitw-feed/posts.json`).then(x => x.json())
    let latestPost = posts[0]
    const content = latestPost.description
    const postHash = latestPost.id
    if (sentHashs.includes(postHash)) {
      return
    }
    sentHashs.push(postHash)
    sentHashs = sentHashs.slice(-10)
    db.set('gonokamitw-sent', sentHashs)

    if (!content.includes('各位拉麵與沾麵的愛好捧油!!') && !content.includes('五之神有夠神')) return

    const name = content.match(/本週的限定【(.+?)】/)[1].trim().replace(/\!/g, '').replace(/ /g, '_')
    const message = `#五之神限定 #${name}\n${content}`

    let imgs = [{
      type: 'photo',
      media: `https://gnehs.github.io/gonokamitw-feed${latestPost.img}`,
      caption: message,
      parse_mode: 'html'
    }]

    sendMessage({
      chats: Object.keys(subscribeList),
      imgs,
      key: dbKey
    })
  } catch (e) {
    console.log(e)
  }
}
sendData()