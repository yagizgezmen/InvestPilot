import { MarketDataProvider } from "./index";
import { MarketQuote, MarketHistoryItem, ChartTimeRange } from "@/types";

export class CoinGeckoProvider implements MarketDataProvider {
    private baseUrl = "https://api.coingecko.com/api/v3";

    // Map our tickers to CoinGecko IDs
    private idMap: Record<string, string> = {
        BTC: "bitcoin",
        ETH: "ethereum",
        SOL: "solana",
        BNB: "binancecoin",
        XRP: "ripple",
        ADA: "cardano",
        AVAX: "avalanche-2",
        DOT: "polkadot",
        LINK: "chainlink",
        DOGE: "dogecoin",
        MATIC: "matic-network",
        TRX: "tron",
        LTC: "litecoin",
        NEAR: "near",
        PEPE: "pepe",
        SHIB: "shiba-inu",
    };

    private symbolToIdCache: Map<string, string> = new Map();

    async searchInstruments(query: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/search?query=${query}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        if (!res.ok) throw new Error("CoinGecko search failed");
        return res.json();
    }

    private async getCoinId(symbol: string): Promise<string> {
        const s = symbol.toUpperCase();
        if (this.idMap[s]) return this.idMap[s];
        if (this.symbolToIdCache.has(s)) return this.symbolToIdCache.get(s)!;

        // Try searching if not in map
        try {
            const searchData = await this.searchInstruments(symbol);
            const firstMatch = searchData.coins?.[0];
            if (firstMatch && firstMatch.symbol.toUpperCase() === s) {
                this.symbolToIdCache.set(s, firstMatch.id);
                return firstMatch.id;
            }
        } catch (e) {
            console.error(`[CoinGecko] Search failed for ${symbol}`, e);
        }

        return symbol.toLowerCase(); // last resort
    }

    async getQuote(symbol: string, market?: string): Promise<MarketQuote> {
        const id = await this.getCoinId(symbol);
        const url = `${this.baseUrl}/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;

        console.log(`[CoinGecko] Fetching Quote for ${symbol} via: ${url}`);

        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                }
            });
            if (!res.ok) {
                console.error(`[CoinGecko] Quote Fetch Error (${res.status}): ${res.statusText}`);
                throw new Error(`CoinGecko simple price failed: ${res.status}`);
            }

            const data = await res.json();
            console.log(`[CoinGecko] Quote Data received:`, data);

            if (!data[id]) {
                console.warn(`[CoinGecko] ID '${id}' not found in response for symbol '${symbol}'`);
                throw new Error(`Symbol ${symbol} (ID: ${id}) not found on CoinGecko`);
            }

            return {
                price: data[id].usd,
                changePct: data[id].usd_24h_change || 0,
                volume: data[id].usd_24h_vol || 0,
                currency: "usd",
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`[CoinGecko] getQuote failed:`, error);
            throw error;
        }
    }

    async getHistory(symbol: string, market: string | undefined, range: ChartTimeRange, interval: string): Promise<MarketHistoryItem[]> {
        const id = await this.getCoinId(symbol);

        // Map range to days
        let days = "30";
        if (range === "1D") days = "1";
        if (range === "1W") days = "7";
        if (range === "1M") days = "30";
        if (range === "3M") days = "90";
        if (range === "6M") days = "180";
        if (range === "1Y") days = "365";
        if (range === "All") days = "max";

        const url = `${this.baseUrl}/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
        console.log(`[CoinGecko] Fetching History for ${symbol} via: ${url}`);

        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                }
            });
            if (!res.ok) {
                console.error(`[CoinGecko] History Fetch Error (${res.status}): ${res.statusText}`);
                throw new Error(`CoinGecko market chart failed: ${res.status}`);
            }

            const data = await res.json();
            if (!data.prices) {
                console.warn(`[CoinGecko] No price data in history response for ${id}`);
                throw new Error(`History for ${symbol} not found`);
            }

            return data.prices.map((p: [number, number]) => ({
                time: new Date(p[0]).toISOString(),
                close: p[1],
                price: p[1] // fallback alias
            }));
        } catch (error) {
            console.error(`[CoinGecko] getHistory failed:`, error);
            throw error;
        }
    }
}
