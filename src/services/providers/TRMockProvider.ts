import { MarketDataProvider } from "./index";
import { MarketQuote, MarketHistoryItem, ChartTimeRange } from "@/types";

export class TRMockProvider implements MarketDataProvider {
    async searchInstruments(query: string): Promise<any[]> {
        return [];
    }

    async getQuote(symbol: string, market?: string): Promise<MarketQuote> {
        return {
            price: Math.random() * 50 + 10, // Mock TR price
            changePct: (Math.random() - 0.5) * 5,
            currency: "TRY",
            timestamp: new Date().toISOString()
        };
    }

    async getHistory(symbol: string, market: string | undefined, range: ChartTimeRange, interval: string): Promise<MarketHistoryItem[]> {
        let numDays = 30;
        if (range === "1D") numDays = 1;
        if (range === "1W") numDays = 7;
        if (range === "3M") numDays = 90;
        if (range === "6M") numDays = 180;
        if (range === "1Y") numDays = 365;
        if (range === "All") numDays = 365 * 5;

        let currentPrice = Math.random() * 50 + 10;
        const history: MarketHistoryItem[] = [];

        // Generate backwards
        const now = Date.now();
        for (let i = numDays; i >= 0; i--) {
            const time = new Date(now - i * 24 * 60 * 60 * 1000).toISOString();
            const change = (Math.random() - 0.5) * 2;
            currentPrice = currentPrice + change;

            history.push({
                time,
                close: currentPrice,
                open: currentPrice - change / 2,
                high: currentPrice + Math.abs(change),
                low: currentPrice - Math.abs(change),
                price: currentPrice
            });
        }

        return history;
    }
}
