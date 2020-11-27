const db = require('../db')
const telegram = require('../telegram')
function subscribe(key, value, id) {
    key = 'subscribe.' + key
    let subscribe_list = db.get(key) || {}
    if (value) {
        if (!subscribe_list[value]) subscribe_list[value] = {}
        subscribe_list[value][id] = true
    } else {
        subscribe_list[id] = value || true
    }
    db.set(key, subscribe_list);
}
function unsubscribe(key, value, id) {
    key = 'subscribe.' + key
    let subscribe_list = db.get(key) || {}
    if (value) {
        if (!subscribe_list[value]) subscribe_list[value] = {}
        delete subscribe_list[value][id]
        if (!subscribe_list[value].length)
            delete subscribe_list[value]
    } else {
        delete subscribe_list[id]
    }
    db.set(key, subscribe_list);
}

function sendMessage({ chats, message, key, value }) {
    for (chat of chats) {
        try {
            telegram.sendMessage(chat, message, {
                parse_mode: "html",
                disable_web_page_preview: true
            })
        } catch (e) {
            unsubscribe(key, value, id)
            try {
                telegram.sendMessage(chat, `❌ 「${key}${value ? ` (${value})` : ''}」發送訊息時發生錯誤，已自動取消訂閱，請確定對話是否存在。`, {
                    parse_mode: "html",
                    disable_web_page_preview: true
                })
            } catch (e) { }
        }
    }
}
module.exports = {
    subscribe,
    unsubscribe,
    sendMessage
};