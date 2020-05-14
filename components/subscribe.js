const db = require('./db')
const Composer = require('telegraf/composer')
const telegram = require('./telegram')
const bot = new Composer()
bot.use((ctx, next) => {
    /// or other chat types...
    // if( ctx.chat.type !== 'channel' ) return next();
    if (ctx.chat.id > 0) return next();
    /// need to cache this result ( variable or session or ....)
    /// because u don't need to call this method
    /// every message
    return telegram.getChatAdministrators(ctx.chat.id)
        .then(data => {
            if (!data || !data.length) return;
            ctx.chat._admins = data;
            ctx.from._is_in_admin_list = data.some(adm => adm.user.id === ctx.from.id);
        })
        .catch(console.log)
        .then(_ => next(ctx));
});
bot.command('admin', ctx => {
    if (ctx.from._is_in_admin_list) {
        return ctx.reply('尼是管理員');
    } else {
        return ctx.reply('尼不是管理員');
    }
});

function isAdmin(ctx) {
    if (ctx.chat.type == 'group' || ctx.chat.type == 'supergroup') return ctx.from._is_in_admin_list
    else return true
}

function subscribe(key, id) {
    let subscribe_list = db.get(key) || {}
    subscribe_list[id] = true
    db.set(key, subscribe_list);
}

function unsubscribe(key, id) {
    let subscribe_list = db.get(key) || {}
    delete subscribe_list[id]
    db.set(key, subscribe_list);
}
bot.command('subscribe', ctx => {
    if (isAdmin(ctx)) {
        let args = ctx.state.command.splitArgs
        let chatId = ctx.message.chat.id
        if (args[0] == 'baha') {
            ctx.replyWithSticker('https://data.gnehs.net/stickers/ohohoh.webp')
            subscribe('subscribe.baha', chatId)
            ctx.replyWithMarkdown('🎉 已訂閱「動畫瘋更新通知」，使用 `/unsubscribe baha` 來取消訂閱。')
        }
    } else {
        ctx.reply(`❌ 只有管理員能使用此指令`)
    }
})
bot.command('unsubscribe', ctx => {
    if (isAdmin(ctx)) {
        let args = ctx.state.command.splitArgs
        let chatId = ctx.message.chat.id
        if (args[0] == 'baha') {
            ctx.replyWithSticker('https://data.gnehs.net/stickers/bye.webp')
            unsubscribe('subscribe.baha', chatId)
            ctx.reply(`👋 取消訂閱「動畫瘋更新通知」成功。`)
        }
    } else {
        ctx.reply(`❌ 只有管理員能使用此指令`)
    }
})
module.exports = bot