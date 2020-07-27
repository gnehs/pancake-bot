
const Composer = require('telegraf/composer')
const telegram = require('./telegram')
const bot = new Composer()
const sharp = require('sharp');
const TextToSVG = require('text-to-svg');
const textToSVG = TextToSVG.loadSync('./font/NotoSansCJKtc-Bold.otf');
async function stickerToId(url) {
    let msg = await telegram.sendSticker(-1001280077302/* 請開一ㄍ群組 */, url)
    return msg.sticker.file_id
}
async function stickerFiletoId(source) {
    let msg = await telegram.sendDocument(-1001280077302/* 請開一ㄍ群組 */, {
        source,
        filename: 'sticker-gen.webp'
    })
    return msg.sticker.file_id
}

bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
    let text = inlineQuery.query
    let results = []
    try {
        let attributes, options, textRes, stickerRes
        //
        //   genBlobbies
        //
        attributes = { fill: '#bcbdc8', stroke: 'white' };
        options = { x: 0, y: 0, fontSize: 196, anchor: 'top', attributes };
        textRes = await sharp(Buffer.from(textToSVG.getSVG(text, options))).trim()
            .resize(332 - 30, 136 - 30, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .extend({
                top: 15, bottom: 15, left: 15, right: 15, background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer()
        stickerRes = await sharp('./sticker/blobbies.png').composite([{ input: textRes, top: 10, left: 0 }]).webp().toBuffer()
        results.push({ type: 'sticker', id: 'blobbies', sticker_file_id: await stickerFiletoId(stickerRes) })
        stickerRes = await sharp('./sticker/sadblobbies.png').composite([{ input: textRes, top: 10, left: 0 }]).webp().toBuffer()
        results.push({ type: 'sticker', id: 'sadblobbies', sticker_file_id: await stickerFiletoId(stickerRes) })
        //
        //   genText
        //
        attributes = { fill: '#bcbdc8', stroke: 'white' };
        options = { x: 0, y: 0, fontSize: 196, anchor: 'top', attributes };
        textRes = await sharp(Buffer.from(textToSVG.getSVG(text, options))).trim()
            .resize(512, 512, { fit: 'inside' })
            .webp()
            .toBuffer()
        results.push({ type: 'sticker', id: 'textonly', sticker_file_id: (await stickerFiletoId(textRes)) })
        console.log(`[${text}] 處理完畢`)
    } catch (e) {
        console.log(e)
    }
    return answerInlineQuery(results, { cache_time: 60 * 20 })
})

bot.on('chosen_inline_result', ({ chosenInlineResult }) => {
    console.log('chosen inline result', chosenInlineResult)
})

module.exports = bot