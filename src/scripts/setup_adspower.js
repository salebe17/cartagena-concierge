const https = require('http');

const API_URL = 'http://local.adspower.net:50325';
const PROXY_USER = 'brd-customer-hl_cafb4108-zone-residential_proxy1';
const PROXY_PASS = 'kb9hvqyn0dol';
const PROXY_HOST = 'brd.superproxy.io';
const PROXY_PORT = '33335';
const API_KEY = 'e1ed63ece53d130eedd5e16988cbdfa20081b9db245c72f0';

async function checkApiStatus() {
    const options = {
        hostname: 'local.adspower.net',
        port: 50325,
        path: '/status',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.code === 0);
                } catch (e) {
                    resolve(false);
                }
            });
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

async function createGroup() {
    const postData = JSON.stringify({
        group_name: "Security_Audit_Group"
    });

    const options = {
        hostname: 'local.adspower.net',
        port: 50325,
        path: '/api/v1/group/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
            'Authorization': `Bearer ${API_KEY}`
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.code === 0 && json.data && json.data.group_id) {
                        console.log(`✅ Created New Group: ${json.data.group_id}`);
                        resolve(json.data.group_id);
                    } else {
                        console.error("❌ Failed to create group:", json.msg);
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.write(postData);
        req.end();
    });
}

async function getGroupId() {
    const options = {
        hostname: 'local.adspower.net',
        port: 50325,
        path: '/api/v1/group/list',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', async () => {
                try {
                    const json = JSON.parse(data);
                    if (json.code === 0 && json.data.list.length > 0) {
                        resolve(json.data.list[0].group_id);
                    } else {
                        console.log("⚠️ No groups found. Creating one...");
                        const newGroupId = await createGroup();
                        resolve(newGroupId);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.end();
    });
}

function createProfile(groupId) {
    const postData = JSON.stringify({
        group_id: groupId,
        name: "Security_Audit_Profile_01",
        domain_name: "whoer.net",
        user_proxy_config: {
            proxy_type: "http",
            proxy_host: PROXY_HOST,
            proxy_port: PROXY_PORT,
            proxy_user: PROXY_USER,
            proxy_password: PROXY_PASS
        },
        fingerprint_config: {
            webrtc: "disabled",
            automatic_timezone: "1",
            location: "ask",
            language: ["en-US", "en"],
            language_switch: "1"
        }
    });

    const options = {
        hostname: 'local.adspower.net',
        port: 50325,
        path: '/api/v1/user/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
            'Authorization': `Bearer ${API_KEY}`
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('Response:', data);
            try {
                const json = JSON.parse(data);
                if (json.code === 0) {
                    console.log('✅ Profile Successfully Created!');
                    console.log(`Profile ID: ${json.data.id} (Name: Security_Audit_Profile_01)`);
                } else {
                    console.error('❌ Failed to create profile:', json.msg);
                }
            } catch (e) {
                console.error('Error parsing response:', e);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Request error:', e.message);
    });

    req.write(postData);
    req.end();
}

async function main() {
    console.log("🔍 Checking AdsPower Local API status...");
    const isUp = await checkApiStatus();

    if (isUp) {
        console.log("✅ AdsPower Local API is responding and Authenticated.");
        console.log("🔍 Fetching Group ID...");
        const groupId = await getGroupId();
        if (groupId) {
            console.log(`✅ Using Group ID: ${groupId}`);
            console.log("🚀 Creating Anti-Detect Profile...");
            createProfile(groupId);
        } else {
            console.error("❌ Could not find any Group ID. Please create a group in AdsPower first.");
        }
    } else {
        console.error("⚠️ AdsPower Local API is NOT reachable or Authentication Failed.");
    }
}

main();
