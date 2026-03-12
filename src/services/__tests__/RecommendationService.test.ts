import { describe, it, expect, vi } from "vitest";
import { recommendationService } from "../RecommendationService";
import { marketDataService } from "../MarketDataService";

// Mock MarketDataService
vi.mock("../MarketDataService", () => ({
    marketDataService: {
        searchAssets: vi.fn().mockResolvedValue([{ ticker: "BTC", name: "Bitcoin", assetClass: "Crypto" }]),
        getMarketData: vi.fn().mockResolvedValue({
            ticker: "BTC",
            currency: "USD",
            history: Array.from({ length: 30 }, (_, i) => ({ time: `2024-01-${i + 1}`, close: 100 + i })),
            stale: false
        })
    }
}));

describe("RecommendationService", () => {
    it("should generate a structured recommendation response", async () => {
        const result = await recommendationService.getSectorAnalysis("Crypto", "Balanced", "2y+");

        expect(result).toHaveProperty("instrument");
        expect(result.instrument.symbol).toBe("BTC");

        expect(result).toHaveProperty("marketContext");
        expect(result.marketContext).toHaveProperty("metricsSnapshot");
        expect(typeof result.marketContext.metricsSnapshot.volatility).toBe("number");

        expect(result).toHaveProperty("investmentStrategy");
        expect(result.investmentStrategy).toHaveProperty("recommendedMethod");
        expect(result.investmentStrategy.plan).toHaveProperty("riskManagement");

        expect(typeof result.score).toBe("number");
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
    });

    it("should adjust score based on risk profile", async () => {
        const consResult = await recommendationService.getSectorAnalysis("Crypto", "Conservative", "2y+");
        const aggResult = await recommendationService.getSectorAnalysis("Crypto", "Aggressive", "2y+");

        // Aggressive should generally have higher sizing or specific methods for a bullish trend
        expect(aggResult.investmentStrategy.plan.positionSizing).toBe("Large");
        expect(consResult.investmentStrategy.plan.positionSizing).toBe("Small");
    });
});
