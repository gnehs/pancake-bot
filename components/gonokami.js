const Composer = require('telegraf/composer')
const telegram = require('./telegram')
const crypto = require('crypto')
const bot = new Composer()
const fetch = require('node-fetch');
const sand = Math.random().toString(36).substring(2, 15)
function encrypt(str) {
  const hash = crypto.createHash('sha256')
  hash.update(str.toString() + sand, 'utf8')
  return hash.digest('hex').slice(0, 8)
}

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
    {
      allows_multiple_answers: true,
      is_anonymous: false,
      reply_to_message_id: ctx.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: '✖️停止投票', callback_data: `stopvote_${encrypt(ctx.message.from.id)}` }]
        ]
      }
    }
  )
})
bot.action(/stopvote_(.+)/, async ctx => {
  let hash = ctx.match[1]
  if (hash == encrypt(ctx.update.callback_query.from.id)) {
    let poll = await telegram.stopPoll(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id)
    let count = poll.options.slice(0, -1).reduce((acc, cur) => acc + (cur.voter_count * cur.text.replace('+', '')), 0)
    ctx.replyWithMarkdown(`*${poll.question}投票結果*\n共 ${count} 人`, { reply_to_message_id: ctx.update.callback_query.message.message_id })
  } else {
    ctx.answerCbQuery('✖️ 只有發起人才能停止投票')
  }
})
module.exports = bot