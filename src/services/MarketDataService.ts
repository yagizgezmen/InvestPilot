import { Asset, MarketData, MarketHistoryItem, MarketQuote, AssetClass } from "@/types";
import { MarketDataProvider, FxProvider } from "./providers";
import { CoinGeckoProvider } from "./providers/CoinGeckoProvider";
import { YahooFinanceProvider } from "./providers/YahooProvider";
import { TRMockProvider } from "./providers/TRMockProvider";

// Unified Cache Item
interface CacheItem<T> {
    data: T;
    timestamp: number;
}

export class MarketDataService {
    private cryptoProvider = new CoinGeckoProvider();
    private usCommodityProvider = new YahooFinanceProvider();
    private trProvider = new TRMockProvider();

    private dynamicAssets: Map<string, Asset> = new Map();

    // Cache configuration
    private quoteCache: Map<string, CacheItem<MarketQuote>> = new Map();
    private historyCache: Map<string, CacheItem<MarketHistoryItem[]>> = new Map();
    private fxCache: Map<string, CacheItem<number>> = new Map();

    // TTLs in MS
    private QUOTE_TTL = 1000 * 60; // 60s
    private HISTORY_TTL = 1000 * 60 * 30; // 30m
    private FX_TTL = 1000 * 60 * 60; // 60m

    private USE_MOCK_TR_DATA = process.env.USE_MOCK_TR_DATA !== "false"; // Default true

    async getMarketData(ticker: string, requestedCurrency: "USD" | "TRY" = "USD", range: string = "1M"): Promise<MarketData> {
        const assetClass = this.getAssetClass(ticker);
        let originalCurrency = "USD";
        if (assetClass === "TR Stocks") originalCurrency = "TRY";

        let targetCurrency = requestedCurrency;
        let quote: MarketQuote;
        let history: MarketHistoryItem[];
        let stale = false;
        let errorMsg: string | undefined = undefined;

        const provider = this.getProvider(assetClass);

        try {
            quote = await this.fetchWithCache(
                this.quoteCache,
                ticker,
                this.QUOTE_TTL,
                () => provider.getQuote(ticker, assetClass)
            );
        } catch (e) {
            // Fallback to stale quote cache
            const cached = this.quoteCache.get(ticker);
            if (cached) {
                quote = cached.data;
                stale = true;
            } else {
                return {
                    ticker,
                    currentPrice: 0,
                    currency: targetCurrency,
                    history: [],
                    error: `Failed to fetch quote for ${ticker}`,
                };
            }
        }

        try {
            const histKey = `${ticker}-${range}`;
            history = await this.fetchWithCache(
                this.historyCache,
                histKey,
                this.HISTORY_TTL,
                () => provider.getHistory(ticker, assetClass, range, "1d")
            );
        } catch (e) {
            const histKey = `${ticker}-${range}`;
            const cached = this.historyCache.get(histKey);
            if (cached) {
                history = cached.data;
                stale = true;
            } else {
                errorMsg = `Failed to fetch history for ${ticker}, partial data.`;
                history = [];
            }
        }

        // Fx Conversion if necessary
        let currentPrice = quote.price;
        if (originalCurrency !== targetCurrency) {
            try {
                const rate = await this.getFxRate(originalCurrency, targetCurrency);
                currentPrice = currentPrice * rate;

                // Reconstruct history with Fx conversion
                history = history.map(h => ({
                    ...h,
                    close: h.close * rate,
                    price: (h.price || h.close) * rate,
                    open: h.open ? h.open * rate : undefined,
                    high: h.high ? h.high * rate : undefined,
                    low: h.low ? h.low * rate : undefined,
                }));
            } catch (e) {
                errorMsg = errorMsg ? `${errorMsg} Also failed FX conversion.` : `Failed FX conversion to ${targetCurrency}.`;
                // Revert back out
                targetCurrency = originalCurrency as any;
            }
        }

        return {
            ticker,
            currentPrice,
            changePct: quote.changePct,
            currency: targetCurrency,
            history,
            error: errorMsg,
            stale
        };
    }

    private async getFxRate(base: string, target: string): Promise<number> {
        const pair = `${base}${target}`;
        return this.fetchWithCache(
            this.fxCache,
            pair,
            this.FX_TTL,
            async () => {
                // Free FX via Yahoo Finance syntax
                const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${base}${target}=X?interval=1d&range=1d`);
                if (!res.ok) throw new Error("Fx fetching failed");
                const data = await res.json();
                const rate = data.chart?.result?.[0]?.meta?.regularMarketPrice;
                if (!rate) throw new Error("Fx rate missing");
                return rate;
            }
        );
    }

    /** Generic Cache Wrapper */
    private async fetchWithCache<T>(cache: Map<string, CacheItem<T>>, key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }
        const data = await fetcher();
        cache.set(key, { data, timestamp: Date.now() });
        return data;
    }

    private getProvider(assetClass: string): MarketDataProvider {
        if (assetClass === "TR Stocks") {
            // Future proofing for when TRMockProvider is replaced
            return this.USE_MOCK_TR_DATA ? this.trProvider : this.trProvider;
        }
        return this.usCommodityProvider; // US Stocks, Precious Metals, Crypto (Yahoo)
    }

    private getAssetClass(ticker: string): string {
        const assets = this.getAssets();
        for (const category of Object.values(assets)) {
            const found = category.find((a: Asset) => a.ticker === ticker);
            if (found) return found.assetClass;
        }
        const dynamic = this.dynamicAssets.get(ticker);
        if (dynamic) return dynamic.assetClass;
        return "US Stocks"; // Default fallback
    }

    getAssets(): Record<string, Asset[]> {
        return {
            crypto: [
                { ticker: "BTC", name: "Bitcoin", assetClass: "Crypto" },
                { ticker: "ETH", name: "Ethereum", assetClass: "Crypto" },
                { ticker: "SOL", name: "Solana", assetClass: "Crypto" },
                { ticker: "BNB", name: "BNB", assetClass: "Crypto" },
                { ticker: "XRP", name: "XRP", assetClass: "Crypto" },
                { ticker: "ADA", name: "Cardano", assetClass: "Crypto" },
                { ticker: "AVAX", name: "Avalanche", assetClass: "Crypto" },
                { ticker: "DOT", name: "Polkadot", assetClass: "Crypto" },
                { ticker: "LINK", name: "Chainlink", assetClass: "Crypto" },
                { ticker: "DOGE", name: "Dogecoin", assetClass: "Crypto" },
            ],
            commodities: [
                { ticker: "XAU", name: "Gold", assetClass: "Precious Metals" },
                { ticker: "XAG", name: "Silver", assetClass: "Precious Metals" },
                { ticker: "XPT", name: "Platinum", assetClass: "Precious Metals" },
                { ticker: "XPD", name: "Palladium", assetClass: "Precious Metals" },
            ],
            us: [
                { ticker: "AAPL", name: "Apple", assetClass: "US Stocks" },
                { ticker: "MSFT", name: "Microsoft", assetClass: "US Stocks" },
                { ticker: "GOOGL", name: "Alphabet (Google)", assetClass: "US Stocks" },
                { ticker: "AMZN", name: "Amazon", assetClass: "US Stocks" },
                { ticker: "NVDA", name: "Nvidia", assetClass: "US Stocks" },
                { ticker: "TSLA", name: "Tesla", assetClass: "US Stocks" },
                { ticker: "META", name: "Meta Platforms", assetClass: "US Stocks" },
                { ticker: "BRK-B", name: "Berkshire Hathaway", assetClass: "US Stocks" },
                { ticker: "V", name: "Visa", assetClass: "US Stocks" },
                { ticker: "SPY", name: "SPDR S&P 500 ETF", assetClass: "US Stocks" },
                { ticker: "QQQ", name: "Invesco QQQ Trust", assetClass: "US Stocks" },
            ],
            tr: [
                { ticker: "THYAO", name: "Türk Hava Yolları", assetClass: "TR Stocks" },
                { ticker: "ASELS", name: "Aselsan", assetClass: "TR Stocks" },
                { ticker: "BIMAS", name: "BİM Birleşik Mağazalar", assetClass: "TR Stocks" },
                { ticker: "AKBNK", name: "Akbank", assetClass: "TR Stocks" },
                { ticker: "EREGL", name: "Erdemir", assetClass: "TR Stocks" },
                { ticker: "GARAN", name: "Garanti BBVA", assetClass: "TR Stocks" },
                { ticker: "KCHOL", name: "Koç Holding", assetClass: "TR Stocks" },
                { ticker: "SISE", name: "Şişecam", assetClass: "TR Stocks" },
                { ticker: "TUPRS", name: "Tüpraş", assetClass: "TR Stocks" },
                { ticker: "YKBNK", name: "Yapı Kredi", assetClass: "TR Stocks" },
            ],
        };
    }

    // Mock search method for fuzzy filtering
    async searchAssets(query: string, assetClass?: string): Promise<Asset[]> {
        const allAssets = this.getAssets();
        let flatAssets: Asset[] = [];

        // 1. Initial local filtering
        if (assetClass) {
            flatAssets = Object.values(allAssets).flat().filter(a =>
                a.assetClass.toLowerCase().includes(assetClass.toLowerCase().replace(' stocks', '').replace(' stock', '')) ||
                assetClass.toLowerCase().includes(a.assetClass.toLowerCase())
            );
        } else {
            flatAssets = Object.values(allAssets).flat();
        }

        const q = query.toLowerCase();
        let results = !query ? flatAssets : flatAssets.filter(
            asset => asset.name.toLowerCase().includes(q) || asset.ticker.toLowerCase().includes(q)
        );

        // 2. If no local results and query is long enough, try dynamic generation/discovery
        if (results.length === 0 && query.trim().length >= 2) {
            let assignedClass: AssetClass = "US Stocks";
            if (assetClass) {
                if (assetClass.toLowerCase().includes("crypto")) assignedClass = "Crypto";
                else if (assetClass.toLowerCase().includes("metal") || assetClass.toLowerCase().includes("commodity")) assignedClass = "Precious Metals";
                else if (assetClass.toLowerCase().includes("tr")) assignedClass = "TR Stocks";
            }

            const dynamicAsset: Asset = {
                ticker: query.toUpperCase(),
                name: `${query.toUpperCase()}`,
                assetClass: assignedClass
            };

            // Basic validation: Check if it's likely a real ticker (simple regex or just allow for now)
            if (/^[A-Z0-9.\-]{2,10}$/.test(dynamicAsset.ticker)) {
                this.dynamicAssets.set(dynamicAsset.ticker, dynamicAsset);
                results = [dynamicAsset];
            }
        }

        return results;
    }
}

export const marketDataService = new MarketDataService();
