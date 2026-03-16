import { MarketHistoryItem } from "@/types";

export interface QuantMetrics {
    latestPrice: number;
    returns: {
        oneWeek: number;
        oneMonth: number;
        threeMonths: number;
        sixMonths: number;
        oneYear: number;
    };
    volatility: number; // Annualized
    maxDrawdown: number;
    sharpeRatio: number; // Simplified (risk-free rate offset omitted)
    trend: {
        sma20: number;
        sma50: number;
        sma200: number;
        priceVsSma20Pct: number;
        priceVsSma50Pct: number;
        priceVsSma200Pct: number;
        signal: "Bullish" | "Neutral" | "Bearish";
    };
    dataQuality: {
        points: number;
        isStale: boolean;
    };
}

export class AnalyticsService {
    calculateMetrics(history: MarketHistoryItem[], isStale: boolean = false): QuantMetrics {
        if (!history || history.length < 2) {
            return this.getEmptyMetrics(history.length, isStale);
        }

        const prices = history.map(h => h.close);
        const latestPrice = prices[prices.length - 1];

        return {
            latestPrice,
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

    private calculateTrailingReturns(prices: number[]) {
        const latest = prices[prices.length - 1];

        const getReturn = (daysBack: number) => {
            if (prices.length <= daysBack) return 0;
            const past = prices[prices.length - 1 - daysBack];
            return past === 0 ? 0 : ((latest - past) / past) * 100;
        };

        return {
            oneWeek: getReturn(7),
            oneMonth: getReturn(30),
            threeMonths: getReturn(90),
            sixMonths: getReturn(180),
            oneYear: getReturn(365)
        };
    }

    private calculateVolatility(prices: number[]): number {
        if (prices.length < 2) return 0;

        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            if (prices[i - 1] === 0) continue;
            returns.push(Math.log(prices[i] / prices[i - 1]));
        }

        if (returns.length < 2) return 0;

        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);

        // Annualize (assuming daily data, 252 trading days)
        return Math.sqrt(variance * 252) * 100;
    }

    private calculateMaxDrawdown(prices: number[]): number {
        let maxDD = 0;
        let peak = -Infinity;

        for (const price of prices) {
            if (price > peak) peak = price;
            const dd = peak === 0 ? 0 : ((peak - price) / peak);
            if (dd > maxDD) maxDD = dd;
        }

        return maxDD * 100;
    }

    private calculateSharpeRatio(prices: number[]): number {
        const vol = this.calculateVolatility(prices);
        if (vol === 0) return 0;

        const totalReturn = this.calculateTrailingReturns(prices).oneYear || this.calculateTrailingReturns(prices).oneMonth;
        // Simplified: return / volatility
        return totalReturn / vol;
    }

    private calculateTrend(prices: number[]) {
        const getSMA = (period: number) => {
            if (prices.length < period) return prices[prices.length - 1];
            const slice = prices.slice(-period);
            return slice.reduce((a, b) => a + b, 0) / period;
        };

        const sma20 = getSMA(20);
        const sma50 = getSMA(50);
        const sma200 = getSMA(200);
        const latest = prices[prices.length - 1];
        const priceVsSma20Pct = sma20 === 0 ? 0 : ((latest - sma20) / sma20) * 100;
        const priceVsSma50Pct = sma50 === 0 ? 0 : ((latest - sma50) / sma50) * 100;
        const priceVsSma200Pct = sma200 === 0 ? 0 : ((latest - sma200) / sma200) * 100;

        let signal: "Bullish" | "Neutral" | "Bearish" = "Neutral";
        if (latest > sma50 && sma50 > sma200) signal = "Bullish";
        else if (latest < sma50 && sma50 < sma200) signal = "Bearish";

        return { sma20, sma50, sma200, priceVsSma20Pct, priceVsSma50Pct, priceVsSma200Pct, signal };
    }

    private getEmptyMetrics(points: number, isStale: boolean): QuantMetrics {
        return {
            latestPrice: 0,
            returns: { oneWeek: 0, oneMonth: 0, threeMonths: 0, sixMonths: 0, oneYear: 0 },
            volatility: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            trend: {
                sma20: 0,
                sma50: 0,
                sma200: 0,
                priceVsSma20Pct: 0,
                priceVsSma50Pct: 0,
                priceVsSma200Pct: 0,
                signal: "Neutral"
            },
            dataQuality: { points, isStale }
        };
    }
}

export const analyticsService = new AnalyticsService();
