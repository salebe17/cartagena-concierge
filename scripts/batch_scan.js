const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
    console.log("--- BATCH MARKET SCAN (Top 5 Listings) ---");

    let targets = [];
    try {
        const data = fs.readFileSync('ids.txt', 'utf8');
        targets = data.split('\n').map(s => s.trim()).filter(s => s).slice(0, 5);
    } catch (e) {
        console.error("Could not read ids.txt");
        process.exit(1);
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-US']
    });

    const results = [];

    for (const id of targets) {
        const url = `https://www.airbnb.com.co/rooms/${id}`;
        process.stdout.write(`Scanning ${id}... `);

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        let calendarData = null;

        page.on('response', async (response) => {
            const request = response.request();
            if (request.url().includes('PdpAvailabilityCalendar')) {
                try {
                    const json = await response.json();
                    if (json.data && json.data.merlin) {
                        calendarData = json.data.merlin.pdpAvailabilityCalendar;
                    }
                } catch (e) { }
            }
        });

        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
        } catch (e) {
            process.stdout.write("(Timeout) ");
        }

        if (calendarData) {
            const months = calendarData.calendarMonths;
            if (months.length > 0) {
                let booked = 0;
                let total = 0;
                const m = months[0]; // Next month (or current)
                m.days.forEach(d => {
                    total++;
                    if (!d.available) booked++;
                });
                const occ = (booked / total * 100).toFixed(1);
                console.log(`[SUCCESS] ${occ}% Occupancy (${booked}/${total} days)`);
                results.push({ id, occupancy: occ, booked, total, month: m.name });
            } else {
                console.log("[NO DATA]");
            }
        } else {
            console.log("[FAILED INTERCEPT]");
        }

        await page.close();
        await new Promise(r => setTimeout(r, 2000));
    }

    await browser.close();

    console.log("\n--- FINAL REPORT ---");
    console.table(results);
    fs.writeFileSync('batch_results.json', JSON.stringify(results, null, 2));

})();
