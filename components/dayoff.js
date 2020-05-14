const Composer = require('telegraf/composer')
const bot = new Composer()
const cheerio = require('cheerio');
const fetch = require('node-fetch');
let dayoff = null
//十分鐘定時清除
setInterval(cleanDayoff, 1000 * 60 * 10); //10min
function cleanDayoff() {
    dayoff = null;
};
async function getDayoff() {
    return dayoff || await dayoffReq()
}
async function dayoffReq() {
    let body = await fetch('https://www.dgpa.gov.tw/typh/daily/nds.html').then(res => res.text())
    var $ = cheerio.load(body),
        city, status, time, city_status, city_name, data = {
            "typhoon": [],
            "update_time": ""
        };
    city = $('.Table_Body > tr > td:nth-child(1):not([colspan="3"])');
    status = $(".Table_Body > tr > td:nth-child(2)");
    for (var i = 0; i < city.length; i++) {
        city_name = $(city[i]).text()
        city_status = $(status[i]).text().replace(/。/g, "。\n").replace(/ /g, "").trim()
        if (city_status.length > 40)
            city_status = city_status.substring(0, 40) + '...'
        if (city_status.match(/上午|下午|停止上班|停止上課/))
            city_name = `❗️${city_name}`;
        else
            city_name = `🔹${city_name}`;

        data.typhoon.push({
            "city_name": city_name,
            "city_status": city_status
        })
    }
    //更新時間
    time = $("div.f_right > h4:nth-child(1)").text().match(/[0-9]+/g);
    data.update_time = `${time[3]}:${time[4]}:${time[5]}`
    dayoff = data
    return dayoff
}
bot.command('dayoff', async ({
    reply
}) => {
    let data = await getDayoff(),
        resp = ''
    for ({
            city_name,
            city_status
        } of data.typhoon) {
        resp += `${city_name} ${city_status}\n`;
    }
    //更新時間
    time = `更新時間 ${data.update_time} `;
    //送訊息囉
    resp += `---
\`詳細及最新情報以\` [行政院人事行政總處](goo.gl/GjmZnR) \`公告為主\`
${time}`;

    reply(resp, {
        parse_mode: "markdown",
    })
})
module.exports = bot