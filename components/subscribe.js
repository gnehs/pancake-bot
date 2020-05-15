const db = require('./db')
const Composer = require('telegraf/composer')
const telegram = require('./telegram')
const bot = new Composer()
const subscribeIdList = require('../subscribeIdList')
bot.command('admin', async ctx => {
    if (await isAdmin(ctx))
        return ctx.reply('尼是管理員');
    else
        return ctx.reply('尼不是管理員');
});

async function isAdmin(ctx) {
    if (ctx.chat.type == 'group' || ctx.chat.type == 'supergroup') {
        let adminList = await telegram.getChatAdministrators(ctx.chat.id)
        return adminList.some(adm => adm.user.id === ctx.from.id);
    }
    else {
        return true
    }
}

function subscribe(key, id) {
    key = 'subscribe.' + key
    let subscribe_list = db.get(key) || {}
    subscribe_list[id] = true
    db.set(key, subscribe_list);
}
function unsubscribe(key, id) {
    key = 'subscribe.' + key
    let subscribe_list = db.get(key) || {}
    delete subscribe_list[id]
    db.set(key, subscribe_list);
}

bot.command('subscribe', async ctx => {
    if (await isAdmin(ctx)) {
        let args = ctx.state.command.args
        let chatId = ctx.message.chat.id
        if (args != '') {
            for (id in subscribeIdList) {
                if (args == id) {
                    ctx.replyWithSticker('https://data.gnehs.net/stickers/ohohoh.webp')
                    subscribe(id, chatId)
                    ctx.replyWithMarkdown(`🎉 已訂閱「${subscribeIdList[id]}」，使用 \`/unsubscribe ${id}\` 來取消訂閱。`)
                }
            }
        } else {
            ctx.reply(`❌ 請在後面加上訂閱編號`)
        }
    } else {
        ctx.reply(`❌ 只有管理員能使用此指令`)
    }
})
bot.command('unsubscribe', async ctx => {
    if (await isAdmin(ctx)) {
        let args = ctx.state.command.args
        let chatId = ctx.message.chat.id
        if (args != '') {
            for (id in subscribeIdList) {
                if (args == id) {
                    ctx.replyWithSticker('https://data.gnehs.net/stickers/ohohoh.webp')
                    unsubscribe(id, chatId)
                    ctx.replyWithMarkdown(`👋 取消訂閱「${subscribeIdList[id]}」成功。`)
                }
            }
        } else {
            ctx.reply(`❌ 請在後面加上訂閱編號`)
        }
    } else {
        ctx.reply(`❌ 只有管理員能使用此指令`)
    }
})
module.exports = bot