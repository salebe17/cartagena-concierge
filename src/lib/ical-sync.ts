import ical from 'node-ical';

export interface ICalEvent {
    summary: string;
    start: Date;
    end: Date;
    uid: string;
}

export async function fetchICalEvents(url: string): Promise<ICalEvent[]> {
    try {
        const events = await ical.async.fromURL(url);
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
    } catch (error) {
        console.error('Error fetching iCal:', error);
        throw new Error('Failed to fetch or parse calendar feed');
    }
}
