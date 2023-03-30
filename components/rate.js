const Composer = require('telegraf/composer')
const bot = new Composer()
const fetch = require('node-fetch');
bot.command('rate', async ctx => {
  const match = ctx.state.command.args.toUpperCase().match(/([0-9.]+)([A-Z]{3})=([A-Z]{3})/);
  if (!match) {
    return ctx.reply('請輸入正確格式，例如：`/rate 100USD=JPY`', { parse_mode: "markdown", reply_to_message_id: ctx.message.message_id })
  }
  ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
  const [, amount, from, to] = match;
  const resp = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`)
  const { success, result } = await resp.json()
  if (!success || !result) {
    return ctx.reply('查無此貨幣代碼', { parse_mode: "markdown", reply_to_message_id: ctx.message.message_id })
  }
  ctx.reply(`${amount} ${from} = ${result} ${to}`, { parse_mode: "markdown", reply_to_message_id: ctx.message.message_id })
})
module.exports = bot