const Composer = require('telegraf/composer')
const telegram = require('./telegram')
const crypto = require('crypto')
const bot = new Composer()
const fetch = require('node-fetch');
const os = require('os')
const salt = os.hostname() || 'salt'
const JSONdb = require('simple-json-db');
const voteData = new JSONdb('./votes.json', { jsonSpaces: false })
function hash(str) {
  const hash = crypto.createHash('sha256')
  hash.update(str.toString() + salt, 'utf8')
  return hash.digest('hex').slice(0, 8)
}

bot.command('number', async ctx => {
  ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
  let res = await fetch("https://dxc.tagfans.com/mighty?_field%5B%5D=*&%24gid=10265&%24description=anouncingNumbers")
    .then(x => x.json());
  let currentNumber = JSON.parse(res[0].detail_json).selections["目前號碼"]
  let responseText = `目前五之神號碼為 *${currentNumber}*`
  ctx.reply(responseText, { parse_mode: "markdown", reply_to_message_id: ctx.message.message_id })
})

// vote
bot.command('vote', async ctx => {
  let args = ctx.state.command.splitArgs
  let voteTitle = args[0] == '' ? '限定拉麵' : args[0]
  let byeOptions = ['ㄅㄅ', 'ＱＱ', '🥞']
  let byeOption = args[1] ? args[1] : byeOptions[Math.floor(Math.random() * byeOptions.length)]
  let voteOptions = ['+1', '+2', '+4', byeOption]
  let data = await ctx.replyWithPoll(
    voteTitle,
    voteOptions,
    {
      allows_multiple_answers: true,
      is_anonymous: false,
      reply_to_message_id: ctx.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: '✖️停止投票', callback_data: `stopvote_${hash(ctx.message.from.id)}` }]
        ]
      }
    }
  )

  updatePollData(data.poll.id, {
    ...data.poll,
    chat_id: ctx.chat.id,
    chat_name: ctx.chat.title || ctx.chat.first_name,
    chat_type: ctx.chat.type,
    votes: {}
  })
})
bot.action(/stopvote_(.+)/, async ctx => {
  let hashStr = ctx.match[1]
  if (hashStr == hash(ctx.update.callback_query.from.id)) {
    let poll = await telegram.stopPoll(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id)
    let count = poll.options.slice(0, -1).reduce((acc, cur) => acc + (cur.voter_count * cur.text.replace('+', '')), 0)
    ctx.replyWithMarkdown(`*${poll.question}投票結果*\n共 ${count} 人`, { reply_to_message_id: ctx.update.callback_query.message.message_id })
  } else {
    ctx.answerCbQuery('✖️ 只有發起人才能停止投票')
  }
})

// ramen vote
bot.command('voteramen', async ctx => {
  let args = ctx.state.command.splitArgs
  let voteTitle = args[0] == '' ? '限定拉麵' : args[0]
  let byeOptions = ['ㄅㄅ', 'ＱＱ', '🥞']
  let byeOption = args[1] ? args[1] : byeOptions[Math.floor(Math.random() * byeOptions.length)]
  let voteOptions = [
    '+1 | 🍜 單點',
    '+2 | 🍜 單點',
    '+1 | 🥚 加蛋',
    '+2 | 🥚 加蛋',
    '+1 | ✨ 超值',
    '+2 | ✨ 超值',
    byeOption
  ]
  let data = await ctx.replyWithPoll(
    voteTitle,
    voteOptions,
    {
      allows_multiple_answers: true,
      is_anonymous: false,
      reply_to_message_id: ctx.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: '✖️停止投票', callback_data: `stopramenvote_${hash(ctx.message.from.id)}` }]
        ]
      }
    }
  )
  updatePollData(data.poll.id, {
    ...data.poll,
    chat_id: ctx.chat.id,
    chat_name: ctx.chat.title || ctx.chat.first_name,
    chat_type: ctx.chat.type,
    votes: {}
  })
})

// watch user vote
bot.on('poll_answer', async ctx => {
  let pollAnswer = ctx.update.poll_answer
  // update user
  let users = voteData.get('users') || {}
  users[pollAnswer.user.id] = {
    first_name: pollAnswer.user?.first_name,
    username: pollAnswer.user?.username,
  }
  voteData.set('users', users)
  // update poll
  let polls = voteData.get('polls') || {}
  let poll = polls[pollAnswer.poll_id]
  let options = pollAnswer.option_ids
  poll.votes[pollAnswer.user.id] = options
  updatePollData(pollAnswer.poll_id, poll)
  console.log(`[vote] ${pollAnswer.user?.first_name} voted ${options.length ? options : 'retract'} in poll ${poll.question}(${pollAnswer.poll_id}) at ${poll.chat_name}(${poll.chat_id})`)
})

bot.action(/stopramenvote_(.+)/, async ctx => {
  let hashStr = ctx.match[1]
  if (hashStr == hash(ctx.update.callback_query.from.id)) {
    let poll = await telegram.stopPoll(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id)
    let options = [...new Set(poll.options.slice(0, -1).map(x => x.text.split('|')[1].trim()))]
    let result = {}
    options.forEach(x => result[x] = 0)
    poll.options.slice(0, -1).forEach(x => {
      let option = x.text.split('|')[1].trim()
      result[option] += x.voter_count * x.text.replace('+', '').split('|')[0].trim()
    })
    let count = Object.values(result).reduce((acc, cur) => acc + cur, 0)
    let responseText = `*${poll.question}投票結果*\n`
    for (let key in result) {
      responseText += `${key}：${result[key]} 人\n`
    }
    responseText += `---\n`
    responseText += `共 ${count} 人\n`
    ctx.replyWithMarkdown(responseText, { reply_to_message_id: ctx.update.callback_query.message.message_id })

    updatePollData(poll.id, poll)
  } else {
    ctx.answerCbQuery('✖️ 只有發起人才能停止投票')
  }
})

function updatePollData(id, data) {
  let polls = voteData.get('polls') || {}
  let poll = polls[id] || {}
  poll = {
    ...poll,
    ...data,
    update_time: Date.now()
  }
  delete poll.id
  delete poll.is_anonymous
  delete poll.type
  delete poll.allows_multiple_answers

  polls[id] = poll
  voteData.set('polls', polls)
}
module.exports = bot