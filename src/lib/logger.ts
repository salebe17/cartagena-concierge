import { headers } from 'next/headers';

export interface LogPayload {
    message: string;
    level?: 'info' | 'warn' | 'error';
    [key: string]: any;
}

export const Logger = {
    info: (message: string, meta?: any) => log('info', message, meta),
    warn: (message: string, meta?: any) => log('warn', message, meta),
    error: (message: string, meta?: any) => log('error', message, meta),
};

function log(level: 'info' | 'warn' | 'error', message: string, meta: any = {}) {
    // const correlationId = headers().get('x-correlation-id') || 'unknown';
    const correlationId = 'unknown'; // Next.js 15 headers() is async, cannot be called in sync logger.

    const entry = {
        timestamp: new Date().toISOString(),
        level,
        correlationId,
        message,
        ...meta
    };

    // In production, this would go to Datadog/Sentry/CloudWatch
    // `console.log` in Vercel is captured as a log entry.
    // We use JSON.stringify so log aggregators can parse it automatically.
    const output = JSON.stringify(entry);

    if (level === 'error') {
        console.error(output);
    } else {
        console.log(output);
    }
}
