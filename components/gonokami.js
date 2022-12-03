const Composer = require('telegraf/composer')
const bot = new Composer()
const fetch = require('node-fetch');
bot.command('number', async ctx => {
  let res = await fetch("https://dxc.tagfans.com/mighty?_field%5B%5D=*&%24gid=10265&%24description=anouncingNumbers")
    .then(x => x.json());
  let currentNumber = JSON.parse(res[0].detail_json).selections["目前號碼"]
  let responseText = `目前五之神號碼為 *${currentNumber}*`
  ctx.reply(responseText, { parse_mode: "markdown", reply_to_message_id: ctx.message.message_id })
})
bot.command('vote', async ctx => {
  let args = ctx.state.command.splitArgs
  let voteTitle = args[0] == '' ? '限定拉麵' : args[0]
  let byeOptions = ['ㄅㄅ', 'ＱＱ', '🥞']
  let byeOption = args[1] ? args[1] : byeOptions[Math.floor(Math.random() * byeOptions.length)]
  let voteOptions = ['+1', '+2', '+4', byeOption]
  ctx.replyWithPoll(
    voteTitle,
    voteOptions,
    { allows_multiple_answers: true, is_anonymous: false, reply_to_message_id: ctx.message.message_id }
  )
})
module.exports = bot