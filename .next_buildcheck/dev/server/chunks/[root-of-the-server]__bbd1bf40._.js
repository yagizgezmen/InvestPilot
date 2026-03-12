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
"[project]/src/app/api/search/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MarketDataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/MarketDataService.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const assetClass = searchParams.get("assetClass") || undefined;
    try {
        const results = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MarketDataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["marketDataService"].searchAssets(query, assetClass);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(results);
    } catch (error) {
        console.error("Search API Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to perform search"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bbd1bf40._.js.map