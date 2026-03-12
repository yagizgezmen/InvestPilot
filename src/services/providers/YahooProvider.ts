import { MarketDataProvider } from "./index";
import { MarketQuote, MarketHistoryItem } from "@/types";

export class YahooFinanceProvider implements MarketDataProvider {
    private baseUrl = "https://query1.finance.yahoo.com/v8/finance/chart";

    async searchInstruments(query: string): Promise<any[]> {
        // Yahoo search endpoint is complex for free tier, omitting for MVP
        return [];
    }

    async getQuote(symbol: string, market?: string): Promise<MarketQuote> {
        const formattedSymbol = this.formatSymbol(symbol, market);
        const res = await fetch(`${this.baseUrl}/${formattedSymbol}?interval=1d&range=1d`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        if (!res.ok) throw new Error("Yahoo Finance quote failed");

        const data = await res.json();
        const result = data.chart.result?.[0];
        if (!result) throw new Error(`Symbol ${formattedSymbol} not found`);

        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose;
        const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

        return {
            price,
            changePct,
            currency: meta.currency || "USD",
            timestamp: new Date().toISOString()
        };
    }

    async getHistory(symbol: string, market: string | undefined, range: string, interval: string): Promise<MarketHistoryItem[]> {
        const formattedSymbol = this.formatSymbol(symbol, market);

        // Map standard ranges to Yahoo ranges
        let yRange = "1mo";
        if (range === "1D") yRange = "1d";
        if (range === "1W") yRange = "5d";
        if (range === "1M") yRange = "1mo";
        if (range === "6M") yRange = "6mo";
        if (range === "1Y") yRange = "1y";

        // Yahoo requires interval matching range roughly
        let yInterval = "1d";
        if (yRange === "1d") yInterval = "5m";
        if (yRange === "5d") yInterval = "1h";

        const res = await fetch(`${this.baseUrl}/${formattedSymbol}?interval=${yInterval}&range=${yRange}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        if (!res.ok) throw new Error("Yahoo Finance history failed");

        const data = await res.json();
        const result = data.chart.result?.[0];
        if (!result || !result.timestamp) throw new Error(`History for ${formattedSymbol} not found`);

        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];

        const history: MarketHistoryItem[] = [];
        for (let i = 0; i < timestamps.length; i++) {
            if (quotes.close[i] !== null) {
                history.push({
                    time: new Date(timestamps[i] * 1000).toISOString(),
                    open: quotes.open[i],
                    high: quotes.high[i],
                    low: quotes.low[i],
                    close: quotes.close[i],
                    volume: quotes.volume[i],
                    price: quotes.close[i]
                });
            }
        }
        return history;
    }

    private formatSymbol(symbol: string, market?: string): string {
        // Yahoo specific formatting. e.g. Gold is GC=F. AAPL is just AAPL.
        if (symbol === "XAU") return "GC=F";
        if (symbol === "XAG") return "SI=F";
        if (market === "TR") return `${symbol}.IS`;
        if (market === "Crypto" || ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "AVAX", "DOT", "LINK", "DOGE"].includes(symbol.toUpperCase())) {
            return `${symbol.toUpperCase()}-USD`;
        }
        return symbol;
    }
}
