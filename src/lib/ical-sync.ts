// import ical from 'node-ical'; // REMOVED: Causing BigInt crash in Vercel

export interface ICalEvent {
    summary: string;
    start: Date;
    end: Date;
    uid: string;
}

// Robust Regex Parser for ICS (No external deps)
function parseICS(icsData: string): ICalEvent[] {
    const events: ICalEvent[] = [];

    // Normalize line endings and unfold lines (ICAL folding involves newline + space)
    const unfolded = icsData.replace(/\r\n[ \t]/g, '');
    const lines = unfolded.split(/\r\n|\n|\r/);

    let currentEvent: Partial<ICalEvent> | null = null;
    let inEvent = false;

    // Helper to extract value after the first colon handling params (e.g., DTSTART;VALUE=DATE:20230101)
    const getValue = (line: string) => {
        const idx = line.indexOf(':');
        return idx !== -1 ? line.substring(idx + 1).trim() : '';
    };

    // Helper to parse iCal dates
    const parseDate = (str: string) => {
        if (!str) return null;
        const clean = str.replace('Z', '').trim();

        // YYYYMMDD
        if (clean.length === 8 && /^\d{8}$/.test(clean)) {
            const y = parseInt(clean.substring(0, 4));
            const m = parseInt(clean.substring(4, 6)) - 1;
            const d = parseInt(clean.substring(6, 8));
            return new Date(Date.UTC(y, m, d));
        }

        // YYYYMMDDTHHMMSS
        if (clean.length >= 15 && clean.includes('T')) {
            const [datePart, timePart] = clean.split('T');
            if (datePart.length === 8 && timePart.length >= 6) {
                const y = parseInt(datePart.substring(0, 4));
                const m = parseInt(datePart.substring(4, 6)) - 1;
                const d = parseInt(datePart.substring(6, 8));
                const h = parseInt(timePart.substring(0, 2));
                const min = parseInt(timePart.substring(2, 4));
                const s = parseInt(timePart.substring(4, 6));
                return new Date(Date.UTC(y, m, d, h, min, s));
            }
        }
        return null;
    };

    for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;

        if (cleanLine === 'BEGIN:VEVENT') {
            inEvent = true;
            currentEvent = {};
        } else if (cleanLine === 'END:VEVENT') {
            if (currentEvent?.uid && currentEvent?.start && currentEvent?.end) {
                events.push(currentEvent as ICalEvent);
            }
            inEvent = false;
            currentEvent = null;
        } else if (inEvent && currentEvent) {
            if (cleanLine.startsWith('UID') && (cleanLine[3] === ':' || cleanLine[3] === ';')) {
                currentEvent.uid = getValue(cleanLine);
            } else if (cleanLine.startsWith('SUMMARY') && (cleanLine[7] === ':' || cleanLine[7] === ';')) {
                currentEvent.summary = getValue(cleanLine);
            } else if (cleanLine.startsWith('DTSTART')) {
                const val = getValue(cleanLine);
                const date = parseDate(val);
                if (date) currentEvent.start = date;
            } else if (cleanLine.startsWith('DTEND')) {
                const val = getValue(cleanLine);
                const date = parseDate(val);
                if (date) currentEvent.end = date;
            }
        }
    }
    return events;
}

export async function fetchICalEvents(url: string): Promise<ICalEvent[]> {
    try {
        // 1. Validate URL format basically
        if (!url.startsWith('http')) {
            throw new Error(`Invalid URL protocol: ${url.substring(0, 10)}...`);
        }

        // 2. Fetch Raw Text
        const response = await fetch(url);
        if (!response.ok) {
            // Check for common issues
            if (response.status === 404) throw new Error("ICS no encontrado (404)");
            if (response.status === 401 || response.status === 403) throw new Error("Acceso denegado (Auth)");
            throw new Error(`HTTP Error ${response.status}`);
        }

        const text = await response.text();

        // 3. Check if it looks like an ICS
        if (!text.includes('BEGIN:VCALENDAR')) {
            // Maybe it's HTML?
            if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
                throw new Error("URL devolvió HTML en lugar de ICS (¿Login requerido?)");
            }
            // Be lenient, maybe just VEVENT fragment
        }

        // 4. Manual Parse Only
        const events = parseICS(text);

        // Log info
        console.log(`Manual parser found ${events.length} events from ${url}`);

        return events;

    } catch (error: any) {
        console.error('Error fetching iCal:', error);
        throw new Error(`${error.message}`);
    }
}
