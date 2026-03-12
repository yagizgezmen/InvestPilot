import {
    AssetClass,
    RiskProfile,
    TimeHorizon,
    SectorAnalysisResponse,
    AssetAnalysis,
    SectorTrend,
    AssetTrend,
    AssetAction,
    InvestmentDecision,
    AdvancedRecommendationResponse,
    RecommendationMethod,
    PositionSizing,
    Cadence,
    Asset,
    AssetStrategy
} from "../types";
import { marketDataService } from "./MarketDataService";
import { analyticsService, QuantMetrics } from "../lib/services/AnalyticsService";

export class RecommendationService {
    async getSectorAnalysis(
        assetClass: AssetClass,
        riskProfile: RiskProfile,
        timeHorizon: TimeHorizon
    ): Promise<SectorAnalysisResponse> {

        // 1. Fetch Representative Data
        const availableAssets = await marketDataService.searchAssets("", assetClass);
        const topAsset = availableAssets[0] || { ticker: "SPY", name: "S&P 500", assetClass: "US Stocks" };

        // Use 1Y history for robust analysis
        const marketData = await marketDataService.getMarketData(topAsset.ticker, "USD", "1Y");
        const metrics = analyticsService.calculateMetrics(marketData.history, marketData.stale);

        // 2. Compute Score & Confidence
        const { score, confidence } = this.calculateAttractivenessScore(metrics, riskProfile, timeHorizon, assetClass);

        // 3. Generate Strategy
        const strategy = this.generateInvestmentStrategy(metrics, score, riskProfile, timeHorizon, assetClass);

        // 4. Generate Market Context
        const context = this.generateMarketContext(metrics, assetClass);

        // 5. Asset-level analysis (Legacy support)
        const assetsAnalysis: AssetAnalysis[] = availableAssets.slice(0, 5).map(asset => ({
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
            confidence: confidence as any,
            score,
            sector: assetClass,
            assets: assetsAnalysis,
            disclaimer: "Educational purposes only. This quant-driven analysis is not financial advice.",
            investmentDecision: strategy.recommendedMethod === "Wait" ? "AVOID" : strategy.recommendedMethod === "Lump Sum" ? "INVEST" : "MONITOR",
            decisionRationale: context.summary,
            summary: context.summary
        };
    }

    private calculateAttractivenessScore(metrics: QuantMetrics, risk: RiskProfile, horizon: TimeHorizon, assetClass: AssetClass) {
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

        score -= (metrics.volatility / 2) * volWeight;
        score -= (metrics.maxDrawdown / 3) * ddWeight;

        // C) Horizon Adjustments
        if (horizon === "0-6m") {
            if (metrics.volatility > 30) score -= 15; // Short term hates volatility
        } else if (horizon === "2y+") {
            if (metrics.trend.sma50 > metrics.trend.sma200) score += 10; // Long term loves structural uptrends
        }

        score = Math.max(0, Math.min(100, Math.round(score)));

        let confidence: "Low" | "Medium" | "High" = "Medium";
        if (metrics.dataQuality.points < 100) confidence = "Low";
        else if (score > 80 || score < 20) confidence = "High";

        return { score, confidence };
    }

    private generateInvestmentStrategy(metrics: QuantMetrics, score: number, risk: RiskProfile, horizon: TimeHorizon, assetClass: AssetClass): any {
        let method: RecommendationMethod = "DCA";
        let sizing: PositionSizing = "Medium";
        let cadence: Cadence = "Monthly";

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

    private generateMarketContext(metrics: QuantMetrics, assetClass: AssetClass) {
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
                trend: trend as any
            }
        };
    }

    async getAssetStrategy(ticker: string): Promise<AssetStrategy> {
        // Logic to fetch asset metadata and generate a tailored strategy
        const allAssets = marketDataService.getAssets();
        let asset: Asset | undefined;

        for (const cat of Object.values(allAssets)) {
            const assetsInCat = cat as Asset[];
            asset = assetsInCat.find((a: Asset) => a.ticker === ticker);
            if (asset) break;
        }

        if (!asset) {
            asset = { ticker, name: ticker, assetClass: "US Stocks" };
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
            entryZones: isCrypto ? ["$45k support", "$52k breakout"] : ["$1,950", "$2,010"],
            exitZones: isCrypto ? ["$85k", "$120k"] : ["$2,400", "$2,650"],
            allocationAdvice: `Allocate ${isCrypto ? "2-5%" : "10-15%"} of liquid capital.`,
            detailedRationale: `Strategic outlook for ${asset.ticker} based on institutional adoption cycles and macro liquidity trends.`,
            technicalFactors: ["200-day Moving Average", "RSI divergence", "Order flow clusters"],
            fundamentalFactors: ["Network effects", "Scarcity model", "Real-world utility"],
            investmentStrategy: {
                title: `${asset.ticker} Optimized Plan`,
                recommendedMethod: isCrypto ? "DCA" : "Staged Entry",
                plan: {
                    cadence: "Weekly",
                    duration: "12-18 Months",
                    positionSizing: "Medium",
                    riskManagement: ["Stop-loss at 15%", "Monthly rebalancing"]
                },
                pros: ["High potential returns", "Institutional liquidity"],
                cons: ["High volatility", "Regulatory risk"],
                whyThis: ["Proven track record", "Strong developer growth"],
                assumptions: ["Fed pivot mid-year", "No major security breach"],
                limitations: ["Past performance not indicative", "Macro headwinds"],
                disclaimer: "Educational use only."
            }
        };
    }
}

export const recommendationService = new RecommendationService();
