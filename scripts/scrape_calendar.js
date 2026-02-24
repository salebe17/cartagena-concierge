const puppeteer = require('puppeteer');

(async () => {
    const listingId = process.argv[2] || '1306660878963671518';
    const url = `https://www.airbnb.com.co/rooms/${listingId}`;

    console.log(`Starting browser for ${url}...`);

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-US']
        });

        const page = await browser.newPage();

        // Set viewport to desktop to ensure calendar loads
        await page.setViewport({ width: 1280, height: 800 });

        page.on('request', request => {
            // console.log('Request:', request.url()); // Verbose, but useful for debug
        });

        page.on('response', async (response) => {
            const request = response.request();
            // console.log('Response:', request.url());

            if (request.url().includes('PdpAvailabilityCalendar') || request.url().includes('calendar')) {
                console.log('Intercepted Potential Calendar Response:', request.url());
                try {
                    const json = await response.json();
                    if (json.data && json.data.merlin) {
                        calendarData = json.data.merlin.pdpAvailabilityCalendar;
                    }
                } catch (e) { }
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Wait specifically for a common element
        try {
            await page.waitForSelector('[data-testid="listing-availability-calendar"]', { timeout: 10000 });
        } catch (e) { console.log("Calendar selector not found/timeout"); }

        // If we haven't caught the response yet, maybe we need to click "Availability" or scroll?
        // Usually it loads on init, but sometimes it's lazy.
        // Let's try to verify if we found it.

        if (calendarData) {
            console.log('--- CALENDAR DATA FOUND ---');
            const months = calendarData.calendarMonths;
            let totalDays = 0;
            let bookedDays = 0;

            if (months.length > 0) {
                const m = months[0];
                console.log(`Month: ${m.name}`);
                m.days.forEach(day => {
                    totalDays++;
                    if (!day.available) bookedDays++;
                });

                const occupancy = (bookedDays / totalDays) * 100;
                console.log(`Occupancy: ${occupancy.toFixed(1)}% (${bookedDays}/${totalDays} days booked)`);

                // Estimate Revenue (simple avg price * booked days)
                // We'd need to extract price from somewhere else or use a fixed avg for now
                console.log(`Estimated Days Booked: ${bookedDays}`);
            }
        } else {
            console.log('No calendar data intercepted. The page might have loaded differently.');
            // Fallback: Screenshot to verify what happened
            await page.screenshot({ path: 'debug_browser.png' });
            console.log('Saved debug_browser.png');
        }

        await browser.close();

    } catch (error) {
        console.error('Browser Error:', error);
    }
})();
