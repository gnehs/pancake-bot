const db = require('./db')
const Composer = require('telegraf/composer')
const bot = new Composer()
const cron = require('node-cron');
cron.schedule('0 * * * *', () => {
    console.log('running a task every minute');
});

bot.command('baha', ({
    reply
}) => reply(`*PONG*`, {
    parse_mode: 'MarkdownV2'
}))
module.exports = bot