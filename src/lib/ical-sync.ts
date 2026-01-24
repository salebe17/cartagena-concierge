import ical from 'node-ical';

export interface ICalEvent {
    summary: string;
    start: Date;
    end: Date;
    uid: string;
}

import ical from 'node-ical';

export interface ICalEvent {
    summary: string;
    start: Date;
    end: Date;
    uid: string;
}

// Simple Regex Parser (Failsafe for BigInt crashes in node-ical)
function parseICSManual(icsData: string): ICalEvent[] {
    const events: ICalEvent[] = [];
    const lines = icsData.split(/\r\n|\n|\r/);
    let currentEvent: Partial<ICalEvent> | null = null;
    let inEvent = false;

    // Helper to parse iCal date (YYYYMMDDTHHMMSSZ or YYYYMMDD)
    const parseDate = (str: string) => {
        if (!str) return new Date();
        const clean = str.replace('Z', '');
        if (clean.length === 8) {
            const y = parseInt(clean.substring(0, 4));
            const m = parseInt(clean.substring(4, 6)) - 1;
            const d = parseInt(clean.substring(6, 8));
            return new Date(Date.UTC(y, m, d));
        }
        const y = parseInt(clean.substring(0, 4));
        const m = parseInt(clean.substring(4, 6)) - 1;
        const d = parseInt(clean.substring(6, 8));
        const h = parseInt(clean.substring(9, 11));
        const min = parseInt(clean.substring(11, 13));
        const s = parseInt(clean.substring(13, 15));
        return new Date(Date.UTC(y, m, d, h, min, s));
    };

    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            inEvent = true;
            currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
            if (currentEvent?.uid && currentEvent?.start && currentEvent?.end) {
                events.push(currentEvent as ICalEvent);
            }
            inEvent = false;
            currentEvent = null;
        } else if (inEvent && currentEvent) {
            if (line.startsWith('UID:')) currentEvent.uid = line.substring(4);
            else if (line.startsWith('SUMMARY:')) currentEvent.summary = line.substring(8);
            else if (line.startsWith('DTSTART') && line.includes(':')) currentEvent.start = parseDate(line.split(':')[1]);
            else if (line.startsWith('DTEND') && line.includes(':')) currentEvent.end = parseDate(line.split(':')[1]);
        }
    }
    return events;
}

export async function fetchICalEvents(url: string): Promise<ICalEvent[]> {
    try {
        // 1. Fetch Raw Text
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch iCal: ${response.statusText}`);
        const text = await response.text();

        // 2. Try Manual Parse FIRST (To avoid BigInt crash in node-ical/rrule)
        try {
            const manualEvents = parseICSManual(text);
            if (manualEvents.length > 0) return manualEvents;
        } catch (e) {
            console.warn("Manual parsing failed, trying node-ical...", e);
        }

        // 3. Fallback to node-ical (only if manual fails)
        const events = ical.parseICS(text);
        const parsedEvents: ICalEvent[] = [];

        for (const k in events) {
            if (events.hasOwnProperty(k)) {
                const ev = events[k];
                if (ev.type === 'VEVENT') {
                    parsedEvents.push({
                        summary: ev.summary || 'Reserva Externa',
                        start: ev.start as Date,
                        end: ev.end as Date,
                        uid: ev.uid
                    });
                }
            }
        }

        return parsedEvents;
    } catch (error: any) {
        console.error('Error fetching iCal:', error);
        throw new Error(`Sync Failed: ${error.message}`);
    }
}
