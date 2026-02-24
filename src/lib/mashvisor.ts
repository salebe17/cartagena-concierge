import { createClient } from '@/lib/supabase/client';

export interface CompetitorFinancials {
    revenue_monthly: number;
    occupancy_rate: number;
    adr: number;
    cash_flow: number;
    cap_rate: number;
    currency: string;
    is_simulated?: boolean;
}

export class MashvisorClient {
    private apiKey: string;
    private baseUrl = 'https://mashvisor-api.p.rapidapi.com';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.RAPIDAPI_KEY || '';
    }

    /**
     * Simulates a financial analysis for a giving listing.
     * In a real scenario, this would chain calls to get property details -> get rental rates.
     */
    async analyzeListing(url: string): Promise<CompetitorFinancials> {
        if (!this.apiKey) {
            console.log("⚠️ No API Key found. Returning SIMULATED data for demonstration.");
            return this.getMockData(url);
        }

        try {
            // TODO: Implement actual RapidAPI fetch here
            // const response = await fetch(...)
            throw new Error("Real API not implemented yet, add Key to activate.");
        } catch (error) {
            console.error("API Call Failed:", error);
            return this.getMockData(url);
        }
    }

    private getMockData(url: string): CompetitorFinancials {
        // Deterministic mock based on URL hash to give consistent "random" results per property
        const seed = url.length;

        return {
            revenue_monthly: 1200 + (seed * 10), // ~$1,500 - $2,500 range
            occupancy_rate: 45 + (seed % 30),    // 45% - 75% range
            adr: 80 + (seed % 50),               // $80 - $130 range
            cash_flow: 800 + (seed * 5),
            cap_rate: 4 + (seed % 5),
            currency: 'USD',
            is_simulated: true
        };
    }
}

export const mashvisor = new MashvisorClient();
