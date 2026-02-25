import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Master Plan Phase 9: Dynamic Pricing AI (FairBid Oracle)
// Suggests an upper and lower bound for a fair service price

export async function POST(req: Request) {
  try {
    const { description, category } = await req.json();

    if (!description || !category) {
      return NextResponse.json(
        { error: "Missing description or category" },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      logger.warn(
        "OPENAI_API_KEY is not set. Returning mock dynamic pricing data.",
      );
      // Return a mock response for fallback / local dev without API keys
      return NextResponse.json({
        minPrice: 45000,
        maxPrice: 120000,
        confidence: 88,
        reasoning:
          'Estimación basada en promedios del mercado para "Mantenimiento" en Cartagena (mock).',
      });
    }

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        minPrice: z
          .number()
          .describe(
            "El precio mínimo justo sugerido en pesos colombianos (COP).",
          ),
        maxPrice: z
          .number()
          .describe(
            "El precio máximo justo sugerido en pesos colombianos (COP).",
          ),
        confidence: z
          .number()
          .min(0)
          .max(100)
          .describe("Nivel de confianza de la estimación (0-100)."),
        reasoning: z
          .string()
          .describe(
            "Breve explicación de por qué se sugieren esos precios (ej. complejidad estimada o piezas).",
          ),
      }),
      prompt: `Actúa como un tasador experto de servicios a domicilio privados y de lujo en Cartagena, Colombia.\n\nCategoría: ${category}\nDescripción: "${description}"\n\nEstima un rango de precio justo (en COP) considerando la complejidad típica de esta tarea, la inflación actual y perfil de los clientes.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error in Dynamic Pricing AI: ${errorMessage}`);
    return NextResponse.json(
      { error: "Failed to generate price estimation" },
      { status: 500 },
    );
  }
}
