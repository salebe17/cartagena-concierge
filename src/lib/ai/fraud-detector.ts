import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Master Plan Phase 9: Automated Fraud Detection AI
// Scans chat logs between technicians and clients to flag "Off-Platform" transaction attempts

export async function detectFraudulentIntent(
  chatLog: string,
): Promise<{ isFraudulent: boolean; reason: string; riskScore: number }> {
  if (!process.env.OPENAI_API_KEY) {
    logger.warn(
      "OPENAI_API_KEY not set. Bypassing fraud detection heuristics.",
    );
    return {
      isFraudulent: false,
      reason: "AI disabled. Not evaluated.",
      riskScore: 0,
    };
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        isFraudulent: z
          .boolean()
          .describe(
            "True si hay clara intención de evadir la plataforma (compartir números personales para pago, pedir pagar en efectivo por fuera).",
          ),
        reason: z
          .string()
          .describe("Explicación concisa y técnica de la decisión."),
        riskScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Puntaje de riesgo de 0 a 100."),
      }),
      prompt: `Analiza esta conversación reciente entre cliente y técnico en un marketplace de servicios de lujo cerrado:\n\n---\n${chatLog}\n---\n\nDetermina si existen intentos explícitos de evadir las comisiones de la plataforma (off-platform leakage) mediante intercambio de números de teléfono, peticiones de pagar en efectivo por fuera, o URLs sospechosas. Actúa como el vigilante de riesgos del marketplace.`,
    });

    if (object.isFraudulent) {
      logger.warn(
        `🚨 Fraud Detected by AI Engine: ${object.reason} [Score: ${object.riskScore}]`,
      );
    }

    return object;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Fraud detection failed: ${errorMessage}`);
    // Default to safe if AI fails to prevent blocking legitimate users erroneously
    return {
      isFraudulent: false,
      reason: "Error in evaluation fallback",
      riskScore: 0,
    };
  }
}
