const db = require('../db')
const telegram = require('../telegram')
function subscribe(key, value, id) {
	console.log(`[Subscribe][${key}${value ? `#${value}` : ''}]`, id)
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
	console.log(`[Unsubscribe][${key}${value ? `#${value}` : ''}]`, id)
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

async function sendMessage({ chats, message, imgs = [], key, value }) {
	console.log(`[Notify][${key}${value ? `#${value}` : ''}] Sending messages to:`)
	console.log(chats)
	for (chat of chats) {
		try {
			if (imgs.length) {
				await telegram.sendMediaGroup(chat, imgs, {
					parse_mode: "html",
					disable_web_page_preview: true
				})
			} else {
				await telegram.sendMessage(chat, message, {
					parse_mode: "html",
					disable_web_page_preview: true
				})
			}
		} catch (e) {
			console.log(e)
			unsubscribe(key, value, chat)
		}
	}
}
module.exports = {
	subscribe,
	unsubscribe,
	sendMessage
};