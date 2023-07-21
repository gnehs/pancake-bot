async function answer({ inlineQuery, answerInlineQuery }) {
  let results = [];
  // parse text
  let url = inlineQuery.query;
  let link = new URL(url);
  let isShorted = false;
  if (link.host == `24h.pchome.com.tw`) {
    url = url.replace("https://24h.pchome.com.tw/", "https://p.pancake.tw/");
    isShorted = true;
  }
  if (url.match(/^https:\/\/twitter\.com\/(.+)/)) {
    link.search = "";
    link.hash = "";
    link.host = "vxtwitter.com";
    url = link.href;
    isShorted = true;
  }
  results.push({
    type: "article",
    id: `URL`,
    title: `URL 短網址 [${isShorted ? "已縮短" : "未縮短"}]`,
    description: `自動移除追蹤連結並產生合適的網址`,
    input_message_content: {
      message_text: url,
    },
  });
  console.log(
    `[${inlineQuery.from.username ? "@" : ""}${
      inlineQuery.from.username || inlineQuery.from.first_name
    }][URL][${url}]處理完畢`
  );
  return answerInlineQuery(results, { cache_time: 60 * 60 /* second */ });
}

module.exports = answer;
