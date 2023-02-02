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
  async function checkURL(url = 'https://gnehs.github.io/gonokamitw-feed/posts.json') {
    try {
      // get subscribe list
      let subscribeList = db.get('subscribe.gonokamitw') || {}
      let sentHashs = db.get('gonokamitw-sent') || []

      let posts = await fetch(url).then(x => x.json())
      let latestPost = posts[0]
      const content = latestPost.description
      const postHash = latestPost.id
      const ramenName = latestPost.limitRamenName

      if (sentHashs.includes(postHash) || !ramenName) {
        return
      }
      sentHashs.push(postHash)
      sentHashs = sentHashs.slice(-20)
      db.set('gonokamitw-sent', sentHashs)

      const message = `#五之神限定 #${ramenName}\n${content}`

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
  await checkURL(`https://gnehs.github.io/gonokamitw-feed/posts.json`)
  await checkURL(`https://gnehs.github.io/gonokamitw-feed/okuyama_posts.json`)
}
sendData()