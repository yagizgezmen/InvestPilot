import { MarketData, MarketHistoryItem } from "../types";

export class AnalyticsService {
    /**
     * Calculate annualized volatility (approximation)
     * Assumption: 252 trading days for stocks, 365 for crypto. We will use a baseline of 252 for simplicity.
     */
    calculateVolatility(data: MarketData): number {
        if (data.history.length < 2) return 0;

        // Fallback to non-annualized if data history is extremely short, but ideally we scale
        const returns = this.getDailyReturns(data.history);
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        const dailyStdDev = Math.sqrt(variance);

        // Annualize (using ~252 trading days multiplier)
        return dailyStdDev * Math.sqrt(252);
    }

    /**
     * Calculate Max Drawdown
     */
    calculateMaxDrawdown(data: MarketData): number {
        if (data.history.length < 2) return 0;
        let maxPeak = data.history[0].close;
        let maxDrawdown = 0;

        for (let i = 1; i < data.history.length; i++) {
            const currentPrice = data.history[i].close;
            if (currentPrice > maxPeak) {
                maxPeak = currentPrice;
            } else {
                const drawdown = (maxPeak - currentPrice) / maxPeak;
                if (drawdown > maxDrawdown) {
                    maxDrawdown = drawdown;
                }
            }
        }
        return maxDrawdown;
    }

    /**
     * Calculate simple momentum (percentage change over the period)
     */
    calculateMomentum(data: MarketData): number {
        if (data.history.length < 2) return 0;
        const firstPrice = data.history[0].close;
        const lastPrice = data.history[data.history.length - 1].close;
        return (lastPrice - firstPrice) / firstPrice;
    }

    /**
     * Calculate Pearson Correlation between two assets using aligned dates.
     */
    calculateCorrelation(data1: MarketData, data2: MarketData): number {
        // Create a map of returns mapped by date string (ignoring time) for alignment
        const getReturnMap = (data: MarketData) => {
            const retMap = new Map<string, number>();
            for (let i = 1; i < data.history.length; i++) {
                const prev = data.history[i - 1];
                const curr = data.history[i];
                // Normalize date slice: 2023-01-01
                const dateStr = curr.time.split('T')[0];
                const ret = (curr.close - prev.close) / prev.close;
                retMap.set(dateStr, ret);
            }
            return retMap;
        };

        const map1 = getReturnMap(data1);
        const map2 = getReturnMap(data2);

        // Find intersection
        const aligned1: number[] = [];
        const aligned2: number[] = [];
        for (const [dateStr, ret1] of map1.entries()) {
            if (map2.has(dateStr)) {
                aligned1.push(ret1);
                aligned2.push(map2.get(dateStr)!);
            }
        }

        if (aligned1.length < 2) return 0; // Impossible to correlate

        return this.pearsonCorrelation(aligned1, aligned2);
    }

    private pearsonCorrelation(x: number[], y: number[]): number {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumX2 = x.reduce((a, b) => a + b * b, 0);
        const sumY2 = y.reduce((a, b) => a + b * b, 0);
        const sumXY = x.reduce((a, b, idx) => a + b * y[idx], 0);

        const numerator = (n * sumXY) - (sumX * sumY);
        const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
        if (denominator === 0) return 0;
        return numerator / denominator;
    }

    private getDailyReturns(history: MarketHistoryItem[]): number[] {
        const returns: number[] = [];
        for (let i = 1; i < history.length; i++) {
            const prev = history[i - 1].close;
            const curr = history[i].close;
            returns.push((curr - prev) / prev);
        }
        return returns;
    }
}

export const analyticsService = new AnalyticsService();
