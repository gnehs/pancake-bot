// define API key and parameters
const apiKey = process.env.WISE_API_KEY;
const source = 'TWD';
const target = 'USD';
const amount = '50000';
let rate = 0;

// Check if API Key is set
if (!apiKey) {
    console.error("API key not found in environment variables.");
    return;
}

// define API endpoint
const ApiEndpoint = `https://api.wise.com/v1/rates?source=${source}&target=${target}`; // Wise API

// API request headers
const headers = new Headers({
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
});

// get currency rate by API
fetch(ApiEndpoint, {
        method: 'GET',
        headers: headers
    })
    .then(response => response.json())
    .then(data => {
        rate = data[0]["rate"];

        // result
        console.log(`${source} 1 = ${target} ${rate}`);
        const result = amount * rate;
        console.log(`${source} ${amount} = ${target} ${result}`);
    })
    .catch(error => console.error(error));