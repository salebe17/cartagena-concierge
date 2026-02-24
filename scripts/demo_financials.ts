import { mashvisor } from '../src/lib/mashvisor';

async function runDemo() {
    const targets = [
        "https://www.airbnb.mx/rooms/1054259915486313812?viralityEntryPoint=1&s=76",
        "https://www.airbnb.mx/rooms/1306660878963671518?viralityEntryPoint=1&s=76"
    ];

    console.log("\n💰 COMPETITOR FINANCIAL X-RAY (SIMULATION)\n");
    console.log(`URL ID               | Revenue/mo      | Occupancy  | ADR        | ROI`);
    console.log("-".repeat(80));

    for (const url of targets) {
        // Extract ID for display
        const id = url.match(/\/rooms\/(\d+)/)?.[1] || "Unknown";

        const data = await mashvisor.analyzeListing(url);

        const idStr = (id + "                    ").substring(0, 20);
        const revStr = (`$${data.revenue_monthly} ${data.currency}      `).substring(0, 15);
        const occStr = (`${data.occupancy_rate}%        `).substring(0, 10);
        const adrStr = (`$${data.adr}       `).substring(0, 10);

        console.log(
            `${idStr} | ${revStr} | ${occStr} | ${adrStr} | ${data.cap_rate}%`
        );
    }
    console.log("\nNOTE: These numbers are SIMULATED. Add RapidAPI Key to get real data.");
}

runDemo();
