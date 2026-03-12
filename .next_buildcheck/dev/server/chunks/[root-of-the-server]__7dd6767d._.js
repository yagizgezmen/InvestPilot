module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/services/providers/CoinGeckoProvider.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CoinGeckoProvider",
    ()=>CoinGeckoProvider
]);
class CoinGeckoProvider {
    baseUrl = "https://api.coingecko.com/api/v3";
    // Map our tickers to CoinGecko IDs
    idMap = {
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
        SHIB: "shiba-inu"
    };
    symbolToIdCache = new Map();
    async searchInstruments(query) {
        const res = await fetch(`${this.baseUrl}/search?query=${query}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        if (!res.ok) throw new Error("CoinGecko search failed");
        return res.json();
    }
    async getCoinId(symbol) {
        const s = symbol.toUpperCase();
        if (this.idMap[s]) return this.idMap[s];
        if (this.symbolToIdCache.has(s)) return this.symbolToIdCache.get(s);
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
    async getQuote(symbol, market) {
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
    async getHistory(symbol, market, range, interval) {
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
            return data.prices.map((p)=>({
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
}),
"[project]/src/services/providers/YahooProvider.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "YahooFinanceProvider",
    ()=>YahooFinanceProvider
]);
class YahooFinanceProvider {
    baseUrl = "https://query1.finance.yahoo.com/v8/finance/chart";
    async searchInstruments(query) {
        // Yahoo search endpoint is complex for free tier, omitting for MVP
        return [];
    }
    async getQuote(symbol, market) {
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
        const changePct = prevClose ? (price - prevClose) / prevClose * 100 : 0;
        return {
            price,
            changePct,
            currency: meta.currency || "USD",
            timestamp: new Date().toISOString()
        };
    }
    async getHistory(symbol, market, range, interval) {
        const formattedSymbol = this.formatSymbol(symbol, market);
        // Map standard ranges to Yahoo ranges
        let yRange = "1mo";
        if (range === "1D") yRange = "1d";
        if (range === "1W") yRange = "5d";
        if (range === "1M") yRange = "1mo";
        if (range === "3M") yRange = "3mo";
        if (range === "6M") yRange = "6mo";
        if (range === "1Y") yRange = "1y";
        if (range === "All") yRange = "max";
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
        const history = [];
        for(let i = 0; i < timestamps.length; i++){
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
    formatSymbol(symbol, market) {
        // Yahoo specific formatting. e.g. Gold is GC=F. AAPL is just AAPL.
        if (symbol === "XAU") return "GC=F";
        if (symbol === "XAG") return "SI=F";
        if (market === "TR") return `${symbol}.IS`;
        if (market === "Crypto" || [
            "BTC",
            "ETH",
            "SOL",
            "BNB",
            "XRP",
            "ADA",
            "AVAX",
            "DOT",
            "LINK",
            "DOGE"
        ].includes(symbol.toUpperCase())) {
            return `${symbol.toUpperCase()}-USD`;
        }
        return symbol;
    }
}
}),
"[project]/src/services/providers/TRMockProvider.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TRMockProvider",
    ()=>TRMockProvider
]);
class TRMockProvider {
    async searchInstruments(query) {
        return [];
    }
    async getQuote(symbol, market) {
        return {
            price: Math.random() * 50 + 10,
            changePct: (Math.random() - 0.5) * 5,
            currency: "TRY",
            timestamp: new Date().toISOString()
        };
    }
    async getHistory(symbol, market, range, interval) {
        let numDays = 30;
        if (range === "1D") numDays = 1;
        if (range === "1W") numDays = 7;
        if (range === "3M") numDays = 90;
        if (range === "6M") numDays = 180;
        if (range === "1Y") numDays = 365;
        if (range === "All") numDays = 365 * 5;
        let currentPrice = Math.random() * 50 + 10;
        const history = [];
        // Generate backwards
        const now = Date.now();
        for(let i = numDays; i >= 0; i--){
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
}),
"[project]/src/services/MarketDataService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MarketDataService",
    ()=>MarketDataService,
    "marketDataService",
    ()=>marketDataService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$providers$2f$CoinGeckoProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/providers/CoinGeckoProvider.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$providers$2f$YahooProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/providers/YahooProvider.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$providers$2f$TRMockProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/providers/TRMockProvider.ts [app-route] (ecmascript)");
;
;
;
class MarketDataService {
    cryptoProvider = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$providers$2f$CoinGeckoProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CoinGeckoProvider"]();
    usCommodityProvider = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$providers$2f$YahooProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["YahooFinanceProvider"]();
    trProvider = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$providers$2f$TRMockProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRMockProvider"]();
    dynamicAssets = new Map();
    // Cache configuration
    quoteCache = new Map();
    historyCache = new Map();
    fxCache = new Map();
    // TTLs in MS
    QUOTE_TTL = 1000 * 60;
    HISTORY_TTL = 1000 * 60 * 30;
    FX_TTL = 1000 * 60 * 60;
    USE_MOCK_TR_DATA = process.env.USE_MOCK_TR_DATA !== "false";
    async getMarketData(ticker, requestedCurrency = "USD", range = "1M") {
        const assetClass = this.getAssetClass(ticker);
        let originalCurrency = "USD";
        if (assetClass === "TR Stocks") originalCurrency = "TRY";
        let targetCurrency = requestedCurrency;
        let quote;
        let history;
        let stale = false;
        let errorMsg = undefined;
        const provider = this.getProvider(assetClass);
        try {
            quote = await this.fetchWithCache(this.quoteCache, ticker, this.QUOTE_TTL, ()=>provider.getQuote(ticker, assetClass));
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
                    error: `Failed to fetch quote for ${ticker}`
                };
            }
        }
        try {
            const histKey = `${ticker}-${range}`;
            history = await this.fetchWithCache(this.historyCache, histKey, this.HISTORY_TTL, ()=>provider.getHistory(ticker, assetClass, range, "1d"));
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
                history = history.map((h)=>({
                        ...h,
                        close: h.close * rate,
                        price: (h.price || h.close) * rate,
                        open: h.open ? h.open * rate : undefined,
                        high: h.high ? h.high * rate : undefined,
                        low: h.low ? h.low * rate : undefined
                    }));
            } catch (e) {
                errorMsg = errorMsg ? `${errorMsg} Also failed FX conversion.` : `Failed FX conversion to ${targetCurrency}.`;
                // Revert back out
                targetCurrency = originalCurrency;
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
    async getFxRate(base, target) {
        const pair = `${base}${target}`;
        return this.fetchWithCache(this.fxCache, pair, this.FX_TTL, async ()=>{
            // Free FX via Yahoo Finance syntax
            const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${base}${target}=X?interval=1d&range=1d`);
            if (!res.ok) throw new Error("Fx fetching failed");
            const data = await res.json();
            const rate = data.chart?.result?.[0]?.meta?.regularMarketPrice;
            if (!rate) throw new Error("Fx rate missing");
            return rate;
        });
    }
    /** Generic Cache Wrapper */ async fetchWithCache(cache, key, ttl, fetcher) {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }
        const data = await fetcher();
        cache.set(key, {
            data,
            timestamp: Date.now()
        });
        return data;
    }
    getProvider(assetClass) {
        if (assetClass === "TR Stocks") {
            // Future proofing for when TRMockProvider is replaced
            return this.USE_MOCK_TR_DATA ? this.trProvider : this.trProvider;
        }
        return this.usCommodityProvider; // US Stocks, Precious Metals, Crypto (Yahoo)
    }
    getAssetClass(ticker) {
        const assets = this.getAssets();
        for (const category of Object.values(assets)){
            const found = category.find((a)=>a.ticker === ticker);
            if (found) return found.assetClass;
        }
        const dynamic = this.dynamicAssets.get(ticker);
        if (dynamic) return dynamic.assetClass;
        return "US Stocks"; // Default fallback
    }
    getAssets() {
        return {
            crypto: [
                {
                    ticker: "BTC",
                    name: "Bitcoin",
                    assetClass: "Crypto"
                },
                {
                    ticker: "ETH",
                    name: "Ethereum",
                    assetClass: "Crypto"
                },
                {
                    ticker: "SOL",
                    name: "Solana",
                    assetClass: "Crypto"
                },
                {
                    ticker: "BNB",
                    name: "BNB",
                    assetClass: "Crypto"
                },
                {
                    ticker: "XRP",
                    name: "XRP",
                    assetClass: "Crypto"
                },
                {
                    ticker: "ADA",
                    name: "Cardano",
                    assetClass: "Crypto"
                },
                {
                    ticker: "AVAX",
                    name: "Avalanche",
                    assetClass: "Crypto"
                },
                {
                    ticker: "DOT",
                    name: "Polkadot",
                    assetClass: "Crypto"
                },
                {
                    ticker: "LINK",
                    name: "Chainlink",
                    assetClass: "Crypto"
                },
                {
                    ticker: "DOGE",
                    name: "Dogecoin",
                    assetClass: "Crypto"
                }
            ],
            commodities: [
                {
                    ticker: "XAU",
                    name: "Gold",
                    assetClass: "Precious Metals"
                },
                {
                    ticker: "XAG",
                    name: "Silver",
                    assetClass: "Precious Metals"
                },
                {
                    ticker: "XPT",
                    name: "Platinum",
                    assetClass: "Precious Metals"
                },
                {
                    ticker: "XPD",
                    name: "Palladium",
                    assetClass: "Precious Metals"
                }
            ],
            us: [
                {
                    ticker: "AAPL",
                    name: "Apple",
                    assetClass: "US Stocks"
                },
                {
                    ticker: "MSFT",
                    name: "Microsoft",
                    assetClass: "US Stocks"
                },
                {
                    ticker: "GOOGL",
                    name: "Alphabet (Google)",
                    assetClass: "US Stocks"
                },
                {
                    ticker: "AMZN",
                    name: "Amazon",
                    assetClass: "US Stocks"
                },
                {
                    ticker: "NVDA",
                    name: "Nvidia",
                    assetClass: "US Stocks"
                },
                {
                    ticker: "TSLA",
                    name: "Tesla",
                    assetClass: "US Stocks"
                },
                {
                    ticker: "META",
                    name: "Meta Platforms",
                    assetClass: "US Stocks"
                },
                {
                    ticker: "BRK-B",
                    name: "Berkshire Hathaway",
                    assetClass: "US Stocks"
                },
                {
                    ticker: "V",
                    name: "Visa",
                    assetClass: "US Stocks"
                },
                {
                    ticker: "SPY",
                    name: "SPDR S&P 500 ETF",
                    assetClass: "US Stocks"
                },
                {
                    ticker: "QQQ",
                    name: "Invesco QQQ Trust",
                    assetClass: "US Stocks"
                }
            ],
            tr: [
                {
                    ticker: "THYAO",
                    name: "Türk Hava Yolları",
                    assetClass: "TR Stocks"
                },
                {
                    ticker: "ASELS",
                    name: "Aselsan",
                    assetClass: "TR Stocks"
                },
                {
                    ticker: "BIMAS",
                    name: "BİM Birleşik Mağazalar",
                    assetClass: "TR Stocks"
                },
                {
                    ticker: "AKBNK",
                    name: "Akbank",
                    assetClass: "TR Stocks"
                },
                {
                    ticker: "EREGL",
                    name: "Erdemir",
                    assetClass: "TR Stocks"
                },
                {
                    ticker: "GARAN",
                    name: "Garanti BBVA",
                    assetClass: "TR Stocks"
                },
                {
                    ticker: "KCHOL",
                    name: "Koç Holding",
                    assetClass: "TR Stocks"
                },
                {
                    ticker: "SISE",
                    name: "Şişecam",
                    assetClass: "TR Stocks"
                },
                {
                    ticker: "TUPRS",
                    name: "Tüpraş",
                    assetClass: "TR Stocks"
                },
                {
                    ticker: "YKBNK",
                    name: "Yapı Kredi",
                    assetClass: "TR Stocks"
                }
            ]
        };
    }
    // Mock search method for fuzzy filtering
    async searchAssets(query, assetClass) {
        const allAssets = this.getAssets();
        let flatAssets = [];
        // 1. Initial local filtering
        if (assetClass) {
            flatAssets = Object.values(allAssets).flat().filter((a)=>a.assetClass.toLowerCase().includes(assetClass.toLowerCase().replace(' stocks', '').replace(' stock', '')) || assetClass.toLowerCase().includes(a.assetClass.toLowerCase()));
        } else {
            flatAssets = Object.values(allAssets).flat();
        }
        const q = query.toLowerCase();
        let results = !query ? flatAssets : flatAssets.filter((asset)=>asset.name.toLowerCase().includes(q) || asset.ticker.toLowerCase().includes(q));
        // 2. If no local results and query is long enough, try dynamic generation/discovery
        if (results.length === 0 && query.trim().length >= 2) {
            let assignedClass = "US Stocks";
            if (assetClass) {
                if (assetClass.toLowerCase().includes("crypto")) assignedClass = "Crypto";
                else if (assetClass.toLowerCase().includes("metal") || assetClass.toLowerCase().includes("commodity")) assignedClass = "Precious Metals";
                else if (assetClass.toLowerCase().includes("tr")) assignedClass = "TR Stocks";
            }
            const dynamicAsset = {
                ticker: query.toUpperCase(),
                name: `${query.toUpperCase()}`,
                assetClass: assignedClass
            };
            // Basic validation: Check if it's likely a real ticker (simple regex or just allow for now)
            if (/^[A-Z0-9.\-]{2,10}$/.test(dynamicAsset.ticker)) {
                this.dynamicAssets.set(dynamicAsset.ticker, dynamicAsset);
                results = [
                    dynamicAsset
                ];
            }
        }
        return results;
    }
}
const marketDataService = new MarketDataService();
}),
"[project]/src/lib/services/AnalyticsService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnalyticsService",
    ()=>AnalyticsService,
    "analyticsService",
    ()=>analyticsService
]);
class AnalyticsService {
    calculateMetrics(history, isStale = false) {
        if (!history || history.length < 2) {
            return this.getEmptyMetrics(history.length, isStale);
        }
        const prices = history.map((h)=>h.close);
        const latestPrice = prices[prices.length - 1];
        return {
            returns: this.calculateTrailingReturns(prices),
            volatility: this.calculateVolatility(prices),
            maxDrawdown: this.calculateMaxDrawdown(prices),
            sharpeRatio: this.calculateSharpeRatio(prices),
            trend: this.calculateTrend(prices),
            dataQuality: {
                points: prices.length,
                isStale
            }
        };
    }
    calculateTrailingReturns(prices) {
        const latest = prices[prices.length - 1];
        const getReturn = (daysBack)=>{
            if (prices.length <= daysBack) return 0;
            const past = prices[prices.length - 1 - daysBack];
            return past === 0 ? 0 : (latest - past) / past * 100;
        };
        return {
            oneWeek: getReturn(7),
            oneMonth: getReturn(30),
            threeMonths: getReturn(90),
            sixMonths: getReturn(180),
            oneYear: getReturn(365)
        };
    }
    calculateVolatility(prices) {
        if (prices.length < 2) return 0;
        const returns = [];
        for(let i = 1; i < prices.length; i++){
            if (prices[i - 1] === 0) continue;
            returns.push(Math.log(prices[i] / prices[i - 1]));
        }
        if (returns.length < 2) return 0;
        const mean = returns.reduce((a, b)=>a + b, 0) / returns.length;
        const variance = returns.reduce((a, b)=>a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
        // Annualize (assuming daily data, 252 trading days)
        return Math.sqrt(variance * 252) * 100;
    }
    calculateMaxDrawdown(prices) {
        let maxDD = 0;
        let peak = -Infinity;
        for (const price of prices){
            if (price > peak) peak = price;
            const dd = peak === 0 ? 0 : (peak - price) / peak;
            if (dd > maxDD) maxDD = dd;
        }
        return maxDD * 100;
    }
    calculateSharpeRatio(prices) {
        const vol = this.calculateVolatility(prices);
        if (vol === 0) return 0;
        const totalReturn = this.calculateTrailingReturns(prices).oneYear || this.calculateTrailingReturns(prices).oneMonth;
        // Simplified: return / volatility
        return totalReturn / vol;
    }
    calculateTrend(prices) {
        const getSMA = (period)=>{
            if (prices.length < period) return prices[prices.length - 1];
            const slice = prices.slice(-period);
            return slice.reduce((a, b)=>a + b, 0) / period;
        };
        const sma20 = getSMA(20);
        const sma50 = getSMA(50);
        const sma200 = getSMA(200);
        const latest = prices[prices.length - 1];
        let signal = "Neutral";
        if (latest > sma50 && sma50 > sma200) signal = "Bullish";
        else if (latest < sma50 && sma50 < sma200) signal = "Bearish";
        return {
            sma20,
            sma50,
            sma200,
            signal
        };
    }
    getEmptyMetrics(points, isStale) {
        return {
            returns: {
                oneWeek: 0,
                oneMonth: 0,
                threeMonths: 0,
                sixMonths: 0,
                oneYear: 0
            },
            volatility: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            trend: {
                sma20: 0,
                sma50: 0,
                sma200: 0,
                signal: "Neutral"
            },
            dataQuality: {
                points,
                isStale
            }
        };
    }
}
const analyticsService = new AnalyticsService();
}),
"[project]/src/services/RecommendationService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecommendationService",
    ()=>RecommendationService,
    "recommendationService",
    ()=>recommendationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MarketDataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/MarketDataService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$AnalyticsService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/services/AnalyticsService.ts [app-route] (ecmascript)");
;
;
class RecommendationService {
    async getSectorAnalysis(assetClass, riskProfile, timeHorizon) {
        // 1. Fetch Representative Data
        const availableAssets = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MarketDataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["marketDataService"].searchAssets("", assetClass);
        const topAsset = availableAssets[0] || {
            ticker: "SPY",
            name: "S&P 500",
            assetClass: "US Stocks"
        };
        // Use 1Y history for robust analysis
        const marketData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MarketDataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["marketDataService"].getMarketData(topAsset.ticker, "USD", "1Y");
        const metrics = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$AnalyticsService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyticsService"].calculateMetrics(marketData.history, marketData.stale);
        // 2. Compute Score & Confidence
        const { score, confidence } = this.calculateAttractivenessScore(metrics, riskProfile, timeHorizon, assetClass);
        // 3. Generate Strategy
        const strategy = this.generateInvestmentStrategy(metrics, score, riskProfile, timeHorizon, assetClass);
        // 4. Generate Market Context
        const context = this.generateMarketContext(metrics, assetClass);
        // 5. Asset-level analysis (Legacy support)
        const assetsAnalysis = availableAssets.slice(0, 5).map((asset)=>({
                ticker: asset.ticker,
                name: asset.name,
                trend: metrics.trend.signal === "Bullish" ? "Up" : metrics.trend.signal === "Bearish" ? "Down" : "Neutral",
                action: strategy.recommendedMethod === "Wait" ? "HOLD" : strategy.recommendedMethod === "DCA" ? "DCA" : "BUY",
                rationale: `Aligned with ${assetClass} ${metrics.trend.signal} trend and ${riskProfile} profile.`
            }));
        return {
            instrument: {
                symbol: topAsset.ticker,
                market: assetClass,
                name: topAsset.name
            },
            marketContext: context,
            investmentStrategy: strategy,
            confidence: confidence,
            score,
            sector: assetClass,
            assets: assetsAnalysis,
            disclaimer: "Educational purposes only. This quant-driven analysis is not financial advice.",
            investmentDecision: strategy.recommendedMethod === "Wait" ? "AVOID" : strategy.recommendedMethod === "Lump Sum" ? "INVEST" : "MONITOR",
            decisionRationale: context.summary,
            summary: context.summary
        };
    }
    calculateAttractivenessScore(metrics, risk, horizon, assetClass) {
        let score = 50; // Base score
        // A) Trend Impact (0-40)
        if (metrics.trend.signal === "Bullish") score += 20;
        else if (metrics.trend.signal === "Bearish") score -= 20;
        const momentum = metrics.returns.oneMonth;
        if (momentum > 5) score += 10;
        else if (momentum < -5) score -= 10;
        // B) Risk Penalties (Weighted by profile)
        let volWeight = risk === "Conservative" ? 1.5 : risk === "Aggressive" ? 0.5 : 1.0;
        let ddWeight = risk === "Conservative" ? 2.0 : risk === "Aggressive" ? 0.8 : 1.2;
        score -= metrics.volatility / 2 * volWeight;
        score -= metrics.maxDrawdown / 3 * ddWeight;
        // C) Horizon Adjustments
        if (horizon === "0-6m") {
            if (metrics.volatility > 30) score -= 15; // Short term hates volatility
        } else if (horizon === "2y+") {
            if (metrics.trend.sma50 > metrics.trend.sma200) score += 10; // Long term loves structural uptrends
        }
        score = Math.max(0, Math.min(100, Math.round(score)));
        let confidence = "Medium";
        if (metrics.dataQuality.points < 100) confidence = "Low";
        else if (score > 80 || score < 20) confidence = "High";
        return {
            score,
            confidence
        };
    }
    generateInvestmentStrategy(metrics, score, risk, horizon, assetClass) {
        let method = "DCA";
        let sizing = "Medium";
        let cadence = "Monthly";
        if (score < 30) method = "Wait";
        else if (score > 75 && risk === "Aggressive") method = "Lump Sum";
        else if (score > 60) method = "Staged Entry";
        if (risk === "Conservative") sizing = "Small";
        else if (risk === "Aggressive") sizing = "Large";
        if (horizon === "0-6m") cadence = "Weekly";
        const whyThis = [
            `Attractiveness score of ${score}/100 based on ${metrics.trend.signal.toLowerCase()} market signals.`,
            metrics.volatility > 40 ? "High annualized volatility suggests a cautious, staggered entry." : "Stable volatility levels support current position sizing.",
            metrics.maxDrawdown > 20 ? `Historical max drawdown of ${metrics.maxDrawdown.toFixed(1)}% requires strict stop-loss discipline.` : "Contained drawdown history provides a margin of safety."
        ];
        return {
            title: "Investment Strategy",
            recommendedMethod: method,
            plan: {
                cadence,
                duration: horizon === "0-6m" ? "3 months" : horizon === "6-24m" ? "12 months" : "24 months",
                positionSizing: sizing,
                riskManagement: [
                    "Implement a -10% trailing stop-loss.",
                    "Rebalance quarterly to maintain risk parity.",
                    assetClass === "Crypto" ? "Use cold storage for long-term holdings." : "Diversify across sub-sectors."
                ]
            },
            pros: [
                metrics.trend.signal === "Bullish" ? "Strong momentum alignment." : "Potential 'value' entry point.",
                "Systematic risk-controlled approach."
            ],
            cons: [
                metrics.volatility > 30 ? "Significant price fluctuation expected." : "Slow growth potential.",
                "Subject to macro-economic regime shifts."
            ],
            whyThis,
            assumptions: [
                "Market correlation stays within historical bounds.",
                "Liquidity remains sufficient for planned exits.",
                "No black-swan regulatory events."
            ],
            limitations: [
                "Past performance is not indicative of future results.",
                "Algorithm does not account for intra-day news events.",
                metrics.dataQuality.isStale ? "Data is currently stale and may not reflect real-time events." : "Relies on daily close parity."
            ],
            disclaimer: "Educational purposes only. Not financial advice."
        };
    }
    generateMarketContext(metrics, assetClass) {
        const trend = metrics.trend.signal === "Bullish" ? "Uptrend" : metrics.trend.signal === "Bearish" ? "Downtrend" : "Sideways";
        return {
            summary: `${assetClass} is currently in a ${trend.toLowerCase()} phase with ${metrics.volatility > 30 ? 'high' : 'moderate'} volatility. The structural trend is ${metrics.trend.sma50 > metrics.trend.sma200 ? 'positive' : 'weak'}.`,
            bullets: [
                `${trend} signal confirmed by SMA crossover analysis.`,
                `1-Month return of ${metrics.returns.oneMonth.toFixed(1)}% shows current momentum.`,
                `Volatility is annualized at ${metrics.volatility.toFixed(1)}%.`
            ],
            metricsSnapshot: {
                return_1m: metrics.returns.oneMonth,
                return_6m: metrics.returns.sixMonths,
                volatility: metrics.volatility,
                maxDrawdown: metrics.maxDrawdown,
                trend: trend
            }
        };
    }
    async getAssetStrategy(ticker) {
        // Logic to fetch asset metadata and generate a tailored strategy
        const allAssets = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MarketDataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["marketDataService"].getAssets();
        let asset;
        for (const cat of Object.values(allAssets)){
            const assetsInCat = cat;
            asset = assetsInCat.find((a)=>a.ticker === ticker);
            if (asset) break;
        }
        if (!asset) {
            asset = {
                ticker,
                name: ticker,
                assetClass: "US Stocks"
            };
        }
        const isCrypto = asset.assetClass === "Crypto";
        const isMetal = asset.assetClass === "Precious Metals";
        return {
            ticker: asset.ticker,
            name: asset.name,
            assetClass: asset.assetClass,
            strategyName: isCrypto ? "Aggressive Growth Accumulation" : isMetal ? "Defensive Wealth Preservation" : "Core Growth Portfolio",
            riskScore: isCrypto ? 8 : isMetal ? 3 : 5,
            expectedReturn: isCrypto ? "30-50% p.a." : isMetal ? "5-8% p.a." : "12-15% p.a.",
            entryZones: isCrypto ? [
                "$45k support",
                "$52k breakout"
            ] : [
                "$1,950",
                "$2,010"
            ],
            exitZones: isCrypto ? [
                "$85k",
                "$120k"
            ] : [
                "$2,400",
                "$2,650"
            ],
            allocationAdvice: `Allocate ${isCrypto ? "2-5%" : "10-15%"} of liquid capital.`,
            detailedRationale: `Strategic outlook for ${asset.ticker} based on institutional adoption cycles and macro liquidity trends.`,
            technicalFactors: [
                "200-day Moving Average",
                "RSI divergence",
                "Order flow clusters"
            ],
            fundamentalFactors: [
                "Network effects",
                "Scarcity model",
                "Real-world utility"
            ],
            investmentStrategy: {
                title: `${asset.ticker} Optimized Plan`,
                recommendedMethod: isCrypto ? "DCA" : "Staged Entry",
                plan: {
                    cadence: "Weekly",
                    duration: "12-18 Months",
                    positionSizing: "Medium",
                    riskManagement: [
                        "Stop-loss at 15%",
                        "Monthly rebalancing"
                    ]
                },
                pros: [
                    "High potential returns",
                    "Institutional liquidity"
                ],
                cons: [
                    "High volatility",
                    "Regulatory risk"
                ],
                whyThis: [
                    "Proven track record",
                    "Strong developer growth"
                ],
                assumptions: [
                    "Fed pivot mid-year",
                    "No major security breach"
                ],
                limitations: [
                    "Past performance not indicative",
                    "Macro headwinds"
                ],
                disclaimer: "Educational use only."
            }
        };
    }
}
const recommendationService = new RecommendationService();
}),
"[project]/src/app/api/strategy/[ticker]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$RecommendationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/RecommendationService.ts [app-route] (ecmascript)");
;
;
async function GET(request, { params }) {
    try {
        const { ticker } = await params;
        if (!ticker) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Ticker is required'
            }, {
                status: 400
            });
        }
        const strategy = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$RecommendationService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recommendationService"].getAssetStrategy(ticker);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            strategy
        });
    } catch (error) {
        console.error('Strategy API Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch strategy'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7dd6767d._.js.map