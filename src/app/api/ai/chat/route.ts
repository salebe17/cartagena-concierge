import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

// Master Plan Phase 9: Support Assistant Chatbot
// Streams helpful responses regarding app policies

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      logger.warn("OPENAI_API_KEY is not set. Chat AI is disabled.");
      return NextResponse.json(
        { error: "AI is not configured. Please add OPENAI_API_KEY." },
        { status: 503 },
      );
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: `Eres "FairBid Support", el asistente experto de la plataforma FairBid en Cartagena.
Reglas:
1. Resuelve dudas sobre cómo funciona la app. Sé amable y ultra conciso.
2. El modelo de pago es mediante "Escrow" (Retención). El pago del cliente se congela temporalmente vía Stripe hasta que el trabajo termina con éxito.
3. Los técnicos reciben sus pagos directamente en su banco oficial mediante Stripe Connect.
4. Cualquier intento de fraude detectado resulta en expulsión inmediata permanente.
5. El cliente y técnico pueden negociar indefinidamente (Bid / Counter-Bid).`,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error in AI Chat: ${errorMessage}`);
    return NextResponse.json(
      { error: "Failed to generate chat response" },
      { status: 500 },
    );
  }
}
