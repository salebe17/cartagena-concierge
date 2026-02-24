const puppeteer = require('puppeteer');

(async () => {
    // Dates: Feb 05 2026 to Mar 03 2026 (User request)
    const checkin = "2026-02-05";
    const checkout = "2026-03-03";
    const location = "Bocagrande--Cartagena--Colombia";

    // Construct Search URL
    const url = `https://www.airbnb.com.co/s/${location}/homes?checkin=${checkin}&checkout=${checkout}`;

    console.log(`Searching Market: ${location}`);
    console.log(`Dates: ${checkin} to ${checkout}`);
    console.log(`URL: ${url}`);

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=es-CO']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log("Navigating...");
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for listings to load
        try {
            await page.waitForSelector('[itemprop="url"]', { timeout: 15000 });
        } catch (e) {
            console.log("Standard selector not found, trying fallback...");
        }

        // Extract listing URLs
        const listings = await page.evaluate(() => {
            const nodes = document.querySelectorAll('a[href^="/rooms/"]');
            const results = [];
            const seen = new Set();

            nodes.forEach(node => {
                const href = node.getAttribute('href');
                const idMatch = href.match(/\/rooms\/(\d+)/);
                if (idMatch) {
                    const id = idMatch[1];
                    if (!seen.has(id)) {
                        seen.add(id);
                        // Extract basic info if available in parent text
                        const text = node.innerText || "";
                        // Price is often in a separate div, might be hard to get reliably in simple bulk scan
                        // We primarily want the IDs to feed the Deep Dive Agent
                        results.push({ id, url: `https://www.airbnb.com.co${href}` });
                    }
                }
            });
            return results;
        });

        console.log(`\nFound ${listings.length} properties available for these dates.`);

        // Output clean list to file
        const fs = require('fs');
        const idList = listings.map(l => l.id).join('\n');
        fs.writeFileSync('ids.txt', idList);
        console.log(`Saved ${listings.length} IDs to ids.txt`);

        await browser.close();

    } catch (error) {
        console.error('Search Error:', error);
    }
})();
