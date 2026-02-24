const http = require('http');

// Proxy Credentials
const PROXY_HOST = 'brd.superproxy.io';
const PROXY_PORT = 33335;
const PROXY_USER = 'amanchaudharyy20@gmail.com';
const PROXY_PASS = 'Aman@#$9800';

const auth = 'Basic ' + Buffer.from(PROXY_USER + ':' + PROXY_PASS).toString('base64');

const options = {
    hostname: PROXY_HOST,
    port: PROXY_PORT,
    path: 'http://ip-api.com/json', // Target URL inside the proxy request
    method: 'GET',
    headers: {
        'Proxy-Authorization': auth,
        'Host': 'ip-api.com'
    }
};

console.log("🔍 Testing Proxy Connection...");
console.log(`Proxy: ${PROXY_HOST}:${PROXY_PORT}`);

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("\n✅ Proxy Connection Successful!");
            console.log("------------------------------------------------");
            console.log(`IP:       ${json.query}`);
            console.log(`Country:  ${json.country} (${json.countryCode})`);
            console.log(`City:     ${json.city}`);
            console.log(`ISP:      ${json.isp}`);
            console.log("------------------------------------------------");
            console.log("\nCompare this IP with what you see on whoer.net in AdsPower.");
        } catch (e) {
            console.error("❌ Failed to parse response:", data);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Connection Error: ${e.message}`);
});

req.end();
