import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { prompt } = await req.json();

    const result = streamText({
        model: openai('gpt-4o-mini'),
        prompt: `You are an AI assistant for a premium home services app called Cartagena Concierge.
    The user is a client writing a description for a service request they need help with (e.g. AC Repair, Cleaning).
    Enhance their description to be professional, clear, and detailed so that technicians can understand exactly what is needed. 
    Do not add extra conversational fluff, just return the improved description itself.
    
    User's rough description: ${prompt}`,
    });

    return result.toTextStreamResponse();
}
