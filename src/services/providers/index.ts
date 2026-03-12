import { MarketQuote, MarketHistoryItem } from "@/types";

export interface MarketDataProvider {
    /**
     * Search for instruments by query string
     */
    searchInstruments(query: string): Promise<any[]>;

    /**
     * Get the current quote for a symbol
     */
    getQuote(symbol: string, market?: string): Promise<MarketQuote>;

    /**
     * Get historical data for a symbol
     * @param range e.g., '1D', '1W', '1M', '6M', '1Y'
     * @param interval e.g., '1d', '1h'
     */
    getHistory(symbol: string, market: string | undefined, range: string, interval: string): Promise<MarketHistoryItem[]>;
}

/**
 * Interface for currency/FX data
 */
export interface FxProvider {
    getFxRate(base: string, quote: string): Promise<number>;
}
