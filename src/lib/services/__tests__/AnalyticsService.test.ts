import { describe, it, expect } from "vitest";
import { analyticsService } from "../AnalyticsService";
import { MarketHistoryItem } from "@/types";

describe("AnalyticsService", () => {
    it("should calculate max drawdown correctly", () => {
        const mockHistory: MarketHistoryItem[] = [
            { time: "2024-01-01", close: 100 },
            { time: "2024-01-02", close: 110 },
            { time: "2024-01-03", close: 80 },
            { time: "2024-01-04", close: 120 }
        ];

        const metrics = analyticsService.calculateMetrics(mockHistory);
        // Peak was 110, trough was 80. DD = (110 - 80) / 110 = 27.27%
        expect(metrics.maxDrawdown).toBeCloseTo(27.27, 1);
    });

    it("should handle upward trends", () => {
        const mockHistory: MarketHistoryItem[] = Array.from({ length: 250 }, (_, i) => ({
            time: `2024-01-${i + 1}`,
            close: 100 + i
        }));

        const metrics = analyticsService.calculateMetrics(mockHistory);
        expect(metrics.trend.signal).toBe("Bullish");
        expect(metrics.returns.oneMonth).toBeGreaterThan(0);
    });

    it("should handle downward trends", () => {
        const mockHistory: MarketHistoryItem[] = Array.from({ length: 250 }, (_, i) => ({
            time: `2024-01-${i + 1}`,
            close: 300 - i
        }));

        const metrics = analyticsService.calculateMetrics(mockHistory);
        expect(metrics.trend.signal).toBe("Bearish");
    });

    it("should calculate volatility for stable vs volatile data", () => {
        const stableHistory: MarketHistoryItem[] = Array.from({ length: 30 }, (_, i) => ({
            time: `2024-01-${i + 1}`,
            close: 100 + (i % 2 === 0 ? 0.1 : -0.1)
        }));

        const volatileHistory: MarketHistoryItem[] = Array.from({ length: 30 }, (_, i) => ({
            time: `2024-01-${i + 1}`,
            close: 100 + (i % 2 === 0 ? 20 : -20)
        }));

        const stableMetrics = analyticsService.calculateMetrics(stableHistory);
        const volatileMetrics = analyticsService.calculateMetrics(volatileHistory);

        expect(volatileMetrics.volatility).toBeGreaterThan(stableMetrics.volatility);
    });
});
