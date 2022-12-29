const db = require('../db')
const { sendMessage } = require('./manage')
const cron = require('node-cron');
const fetch = require('node-fetch');
const dbKey = "gonokamitw"
const cheerio = require('cheerio')
const crypto = require('crypto')
function getHash(str) {
  const hash = crypto.createHash('sha256')
  hash.update(str.toString(), 'utf8')
  return hash.digest('hex').slice(0, 8)
}
cron.schedule('*/15 * * * *', () => {
  let subscribeList = db.get('subscribe.gonokamitw') || {}
  if (Object.keys(subscribeList).length)
    sendData()
});
async function fetchPage(url) {
  let html = await fetch(url, {
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "zh-TW,zh;q=0.9",
      "cache-control": "max-age=0",
      "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Microsoft Edge\";v=\"108\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    }
  }).then(res => res.text())
  return cheerio.load(html)
}

async function sendData() {
  try {
    // get subscribe list
    let subscribeList = db.get('subscribe.gonokamitw') || {}
    let sentHashs = db.get('gonokamitw-sent') || []

    let $ = await fetchPage('https://mbasic.facebook.com/gonokamitw')
    const itemLinks = $('a')
      .toArray()
      // text = 完整動態
      .filter((a) => $(a).text() === '完整動態')
      .map((a) => $(a).attr('href'))

    // fetch first item
    $ = await fetchPage(`https://mbasic.facebook.com${itemLinks[0]}`)
    const $content = $(`#m_story_permalink_view > div > div > div > div > div`).eq(0);
    const $attach = $(`#m_story_permalink_view > div > div > div.bx > div.cf.cg > div.ch > div.ci`)
    const content = $($content.html().replace(/<br>/g, '\n')).text()
    const link = `https://www.facebook.com${itemLinks[0]}`
    const postHash = getHash(content)
    if (sentHashs.includes(postHash)) {
      return
    }
    sentHashs.push(postHash)
    sentHashs = sentHashs.slice(-10)
    db.set('gonokamitw-sent', sentHashs)

    const imageLinks = $attach.find('a')
      .toArray()
      .map((a) => $(a).attr('href'))
      .filter((a) => a && a.includes(`/gonokamitw/photos/`) && a.includes(`encrypted_tracking_data`))
    if (imageLinks.length) {
      let imgs = await Promise.all(imageLinks.map(async (link) => {
        const $ = await fetchPage('https://mbasic.facebook.com' + link)
        const href = $('#MPhotoContent div.desc.attachment > span > div > span > a[target=_blank].sec').attr('href');
        return href
      }))
      imgs = imgs.map((href, i) => {
        let result = { 'type': 'photo', 'media': href }
        if (i == 0) {
          result.caption = `#五之神限定\n${content}`
          result.parse_mode = 'html'
        }
        return result
      })

      sendMessage({
        chats: Object.keys(subscribeList),
        imgs,
        key: dbKey
      })
    } else {
      sendMessage({
        chats: Object.keys(subscribeList),
        text: `#五之神限定\n${content}`,
        key: dbKey
      })
    }
  } catch (e) {
    console.log(e)
  }
}