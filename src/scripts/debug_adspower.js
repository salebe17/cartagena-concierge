const https = require('http');

const API_KEY = 'e1ed63ece53d130eedd5e16988cbdfa20081b9db245c72f0';
const HOST = 'local.adspower.net';
const PORT = 50325;

function request(path, method, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });

        req.on('error', reject);

        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    try {
        console.log("1. Checking Status...");
        const status = await request('/status', 'GET');
        console.log("Status Response:", status);

        console.log("\n2. Listing Groups...");
        const groups = await request('/api/v1/group/list', 'GET');
        console.log("Groups Response:", groups);

        console.log("\n3. Attempting Minimal Create...");
        const payload = JSON.stringify({
            name: "Test_Profile_Minimal",
            domain_name: "whoer.net"
        });
        const create = await request('/api/v1/user/create', 'POST', payload);
        console.log("Create Response:", create);

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
