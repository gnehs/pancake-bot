// Pre requisites:
const telegram = require('./telegram')
const Composer = require('telegraf/composer')
const bot = new Composer()

// define get currency rate function
async function getExchangeRateFromWise(source, target, amount) {
    // define API key and parameters
    const apiKey = process.env.WISE_API_KEY;
    let rate = 0;

    // Check if API Key is set
    if (!apiKey) {
        throw new Error("API key not found in environment variables.");
    }

    // define API endpoint
    const ApiEndpoint = `https://api.wise.com/v1/rates?source=${source}&target=${target}`; // Wise API

    // API request headers
    const headers = new Headers({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    });

    // get currency rate by API
    const response = await fetch(ApiEndpoint, {
        method: 'GET',
        headers: headers
    });

    const data = await response.json();
    rate = data[0]["rate"];

    // result
    console.log(`${source} 1 = ${target} ${rate}`);

    return rate;
}

// define bot command
bot.command('rate', async(ctx) => {
    // get chat id and message
    const chatId = ctx.message.chat.id;
    const message = ctx.message.text;

    // parse message
    const match = message.match(/([0-9.]+)([a-zA-Z]{3})=([a-zA-Z]{3})/);

    if (!match) {
        await telegram.sendMessage(chatId, '請輸入正確的匯率指令，比如： /rate 100usd=twd');
        return;
    }

    const amount = match[1];
    const source = match[2].toUpperCase();
    const target = match[3].toUpperCase();

    // get currency rate and calculate results
    try {
        const rate = await getExchangeRateFromWise(source, target);
        const result = amount * rate;

        // send result
        await telegram.sendMessage(chatId, `${amount} ${source} = ${result.toFixed(9)} ${target}`);
    } catch (error) {
        console.error(error);
        await telegram.sendMessage(chatId, '無法獲取即時匯率，請稍後再試。');
    }
});