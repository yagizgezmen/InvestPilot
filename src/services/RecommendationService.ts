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
    AssetStrategy,
    InvestmentStrategy,
    RecommendationScoreResult,
    MarketHistoryItem,
    ExpectedReturnOutlook
} from "../types";
import { marketDataService } from "./MarketDataService";
import { analyticsService, QuantMetrics } from "../lib/services/AnalyticsService";
import { recommendationScoringService } from "../lib/services/RecommendationScoringService";

type RecommendationConfidence = AdvancedRecommendationResponse["confidence"];

interface AssetFactorModel {
    latestPrice: number;
    supportLevel: number;
    secondarySupportLevel: number;
    resistanceLevel: number;
    breakoutLevel: number;
    takeProfitLevel: number;
    riskStopLevel: number;
    priceVsSma20Pct: number;
    priceVsSma50Pct: number;
    priceVsSma200Pct: number;
    trendScore: number;
    momentumScore: number;
    volatilityScore: number;
    drawdownScore: number;
    movingAverageScore: number;
    dataQualityScore: number;
    totalScore: number;
    volatilityBand: "Low" | "Moderate" | "Elevated" | "High";
    drawdownBand: "Contained" | "Moderate" | "Deep";
    freshnessLabel: "Fresh" | "Stale" | "Thin";
}

interface PriceStructure {
    supportLevel: number;
    secondarySupportLevel: number;
    resistanceLevel: number;
    breakoutLevel: number;
    takeProfitLevel: number;
    riskStopLevel: number;
    averageRangePct: number;
    fallbackUsed: boolean;
}

const DEFAULT_ASSET_SCORING_CONTEXT: { riskProfile: RiskProfile; timeHorizon: TimeHorizon } = {
    riskProfile: "Balanced",
    timeHorizon: "6-24m",
};

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
        const scoreResult = recommendationScoringService.score(metrics, { riskProfile, timeHorizon });
        const { score, confidence } = scoreResult;

        // 3. Generate Strategy
        const strategy = this.generateInvestmentStrategy(metrics, scoreResult, riskProfile, timeHorizon, assetClass);

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
            confidence,
            score,
            factorBreakdown: scoreResult.factors,
            sector: assetClass,
            assets: assetsAnalysis,
            disclaimer: "Educational purposes only. This quant-driven analysis is not financial advice.",
            investmentDecision: strategy.recommendedMethod === "Wait" ? "AVOID" : strategy.recommendedMethod === "Lump Sum" ? "INVEST" : "MONITOR",
            decisionRationale: context.summary,
            summary: context.summary
        };
    }

    private generateInvestmentStrategy(
        metrics: QuantMetrics,
        scoreResult: RecommendationScoreResult,
        risk: RiskProfile,
        horizon: TimeHorizon,
        assetClass: AssetClass
    ): InvestmentStrategy {
        const score = scoreResult.score;
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
            `Attractiveness score is ${score}/100 with the strongest driver being ${scoreResult.factors[0]?.label.toLowerCase() ?? "trend quality"}.`,
            scoreResult.dominantDrivers[0] ?? (metrics.volatility > 40 ? "High annualized volatility suggests a cautious, staggered entry." : "Stable volatility levels support current position sizing."),
            scoreResult.cautionFlags[0] ?? (metrics.maxDrawdown > 20 ? `Historical max drawdown of ${metrics.maxDrawdown.toFixed(1)}% requires strict stop-loss discipline.` : "Contained drawdown history provides a margin of safety.")
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
                trend: trend as "Uptrend" | "Downtrend" | "Sideways"
            }
        };
    }

    async getAssetStrategy(ticker: string): Promise<AssetStrategy> {
        const normalizedTicker = ticker.trim().toUpperCase();
        const asset = await this.resolveAsset(normalizedTicker);
        const currency = asset.assetClass === "TR Stocks" ? "TRY" : "USD";
        const marketData = await marketDataService.getMarketData(asset.ticker, currency, "1Y");

        if (marketData.history.length === 0) {
            throw new Error(`No market history returned for ${asset.ticker}`);
        }

        const metrics = analyticsService.calculateMetrics(marketData.history, marketData.stale);
        const scoreResult = recommendationScoringService.score(metrics, DEFAULT_ASSET_SCORING_CONTEXT);
        const factorModel = this.buildAssetFactorModel(marketData, metrics, scoreResult);
        const riskScore = this.buildRiskScore(factorModel);
        const expectedReturnOutlook = this.buildExpectedReturnOutlook(metrics, factorModel, scoreResult);
        const investmentStrategy = this.buildAssetInvestmentStrategy(asset, metrics, factorModel, riskScore);

        return {
            ticker: asset.ticker,
            name: asset.name,
            assetClass: asset.assetClass,
            strategyName: this.buildStrategyName(factorModel),
            riskScore,
            expectedReturn: expectedReturnOutlook.summary,
            entryZones: this.buildEntryZones(marketData, factorModel),
            exitZones: this.buildExitZones(marketData, factorModel),
            allocationAdvice: this.buildAllocationAdvice(factorModel, riskScore),
            detailedRationale: this.buildDetailedRationale(asset, metrics, factorModel),
            technicalFactors: this.buildTechnicalFactors(metrics, factorModel, marketData),
            fundamentalFactors: this.buildFundamentalFactors(asset, metrics, factorModel),
            investmentStrategy,
            factorBreakdown: scoreResult.factors,
            expectedReturnOutlook,
        };
    }

    private async resolveAsset(ticker: string): Promise<Asset> {
        const allAssets = marketDataService.getAssets();

        for (const category of Object.values(allAssets)) {
            const foundAsset = category.find((asset) => asset.ticker === ticker);
            if (foundAsset) {
                return foundAsset;
            }
        }

        const discoveredAssets = await marketDataService.searchAssets(ticker);
        return discoveredAssets[0] ?? { ticker, name: ticker, assetClass: "US Stocks" };
    }

    private buildAssetFactorModel(
        marketData: { currentPrice: number; history: { close: number; high?: number; low?: number; time: string; }[]; stale?: boolean },
        metrics: QuantMetrics,
        scoreResult: RecommendationScoreResult
    ): AssetFactorModel {
        const latestPrice = marketData.currentPrice || metrics.latestPrice || marketData.history[marketData.history.length - 1]?.close || 0;
        const structure = this.buildPriceStructure(marketData.history, metrics, latestPrice);
        const priceVsSma20Pct = metrics.trend.priceVsSma20Pct;
        const priceVsSma50Pct = metrics.trend.priceVsSma50Pct;
        const priceVsSma200Pct = metrics.trend.priceVsSma200Pct;

        const totalScore = scoreResult.score;
        const trendScore = this.getFactorScore(scoreResult, "trendStrength");
        const momentumScore = Math.round(
            (this.getFactorScore(scoreResult, "shortTermMomentum") + this.getFactorScore(scoreResult, "mediumTermMomentum")) / 10
        );
        const volatilityScore = Math.round(this.getFactorScore(scoreResult, "volatilityRisk") / 6.67);
        const drawdownScore = Math.round(this.getFactorScore(scoreResult, "drawdownRisk") / 6.67);
        const movingAverageScore = Math.round(this.getFactorScore(scoreResult, "structuralTrendAlignment") / 6.67);
        const dataQualityScore = Math.max(1, Math.round(this.getFactorScore(scoreResult, "dataQuality") / 10));

        const volatilityBand =
            metrics.volatility > 55 ? "High" :
            metrics.volatility > 35 ? "Elevated" :
            metrics.volatility > 18 ? "Moderate" :
            "Low";

        const drawdownBand =
            metrics.maxDrawdown > 35 ? "Deep" :
            metrics.maxDrawdown > 18 ? "Moderate" :
            "Contained";

        const freshnessLabel =
            metrics.dataQuality.isStale ? "Stale" :
            metrics.dataQuality.points < 60 ? "Thin" :
            "Fresh";

        return {
            latestPrice,
            supportLevel: structure.supportLevel,
            secondarySupportLevel: structure.secondarySupportLevel,
            resistanceLevel: structure.resistanceLevel,
            breakoutLevel: structure.breakoutLevel,
            takeProfitLevel: structure.takeProfitLevel,
            riskStopLevel: structure.riskStopLevel,
            priceVsSma20Pct,
            priceVsSma50Pct,
            priceVsSma200Pct,
            trendScore,
            momentumScore,
            volatilityScore,
            drawdownScore,
            movingAverageScore,
            dataQualityScore,
            totalScore,
            volatilityBand,
            drawdownBand,
            freshnessLabel,
        };
    }

    private getFactorScore(scoreResult: RecommendationScoreResult, key: RecommendationScoreResult["factors"][number]["key"]): number {
        return scoreResult.factors.find((factor) => factor.key === key)?.normalizedScore ?? 50;
    }

    private buildRiskScore(model: AssetFactorModel): number {
        const penalty =
            (model.volatilityBand === "High" ? 3.2 : model.volatilityBand === "Elevated" ? 2.1 : model.volatilityBand === "Moderate" ? 1.2 : 0.4) +
            (model.drawdownBand === "Deep" ? 2.8 : model.drawdownBand === "Moderate" ? 1.6 : 0.6) +
            (model.freshnessLabel === "Stale" ? 1 : model.freshnessLabel === "Thin" ? 0.5 : 0);

        return this.clamp(Math.round(3 + penalty), 1, 10);
    }

    private buildExpectedReturnOutlook(
        metrics: QuantMetrics,
        model: AssetFactorModel,
        scoreResult: RecommendationScoreResult
    ): ExpectedReturnOutlook {
        const direction =
            model.totalScore >= 72 ? "Constructive upside bias" :
            model.totalScore >= 55 ? "Measured upside bias" :
            model.totalScore >= 42 ? "Mixed / range-bound outlook" :
            "Defensive / weak outlook";

        const mediumTermContext =
            metrics.returns.sixMonths >= 12 ? "recent medium-term momentum is supportive" :
            metrics.returns.sixMonths >= 0 ? "medium-term momentum is positive but not decisive" :
            "medium-term momentum is still soft";

        const trendContext =
            metrics.trend.signal === "Bullish" ? "trend structure remains supportive" :
            metrics.trend.signal === "Neutral" ? "trend structure is not fully directional" :
            "trend structure is still under pressure";

        const volatilityContext =
            model.volatilityBand === "Low" ? "volatility is contained" :
            model.volatilityBand === "Moderate" ? "volatility is manageable" :
            model.volatilityBand === "Elevated" ? "volatility is elevated" :
            "volatility is high";

        const staleSuffix =
            model.freshnessLabel === "Fresh"
                ? ""
                : " Data freshness is limited, so scenario confidence should be treated conservatively.";

        const summary = `${direction} with ${scoreResult.confidence.toLowerCase()} confidence; ${trendContext} and ${mediumTermContext}.${staleSuffix}`.trim();

        const bullishCase =
            model.totalScore >= 60
                ? `Bullish case: a sustained hold above structure with breakout follow-through could extend gains, especially if ${mediumTermContext}.`
                : "Bullish case: price would need to reclaim resistance cleanly and rebuild momentum before a stronger upside path becomes credible.";

        const baseCase =
            model.totalScore >= 72
                ? `Base case: constructive upside remains possible, but ${volatilityContext}, so progress is likely uneven rather than straight-line.`
                : model.totalScore >= 45
                    ? `Base case: range-bound to moderately positive behavior is more realistic while ${trendContext}.`
                    : `Base case: capital preservation remains the priority while ${trendContext} and ${volatilityContext}.`;

        const bearishCase =
            model.drawdownBand === "Deep" || model.volatilityBand === "High"
                ? "Bearish case: a failed support hold could produce a sharper downside move because recent downside behavior has already been unstable."
                : "Bearish case: losing nearby support would weaken the setup and shift the outlook toward a more defensive stance.";

        return {
            summary,
            confidence: scoreResult.confidence,
            bullishCase,
            baseCase,
            bearishCase,
            methodologyNote: "This outlook is scenario-based and inferred from trend, medium-term returns, volatility, drawdown history, and data quality. It is not a performance forecast.",
        };
    }

    private buildEntryZones(marketData: { currency: string }, model: AssetFactorModel): string[] {
        return [
            `Primary entry zone sits near recent support around ${this.formatPrice(model.supportLevel, marketData.currency)}.`,
            `Deeper pullback support comes in around ${this.formatPrice(model.secondarySupportLevel, marketData.currency)} if price retests the broader range.`,
            model.priceVsSma20Pct >= 0
                ? `Breakout confirmation improves on a sustained push above ${this.formatPrice(model.breakoutLevel, marketData.currency)}.`
                : `Wait for price to reclaim short-term structure and close back above ${this.formatPrice(model.breakoutLevel, marketData.currency)} before adding aggressively.`,
        ];
    }

    private buildExitZones(marketData: { currency: string }, model: AssetFactorModel): string[] {
        return [
            `First trim zone sits near overhead resistance around ${this.formatPrice(model.resistanceLevel, marketData.currency)}.`,
            `If the breakout extends, the next profit-taking zone is near ${this.formatPrice(model.takeProfitLevel, marketData.currency)}.`,
            `Reassess if price breaks below ${this.formatPrice(model.riskStopLevel, marketData.currency)} on a closing basis.`,
        ];
    }

    private buildAllocationAdvice(model: AssetFactorModel, riskScore: number): string {
        if (model.freshnessLabel !== "Fresh") {
            return "Keep exposure small until data quality improves and the setup can be revalidated.";
        }

        if (riskScore >= 8) {
            return "Keep allocation small and treat the position as a satellite exposure rather than a core holding.";
        }

        if (riskScore >= 6) {
            return "Use a measured allocation and scale in across multiple entries rather than deploying all capital at once.";
        }

        return "This setup can support a moderate core allocation, provided position sizing still respects drawdown risk.";
    }

    private buildDetailedRationale(asset: Asset, metrics: QuantMetrics, model: AssetFactorModel): string {
        return `${asset.ticker} is being scored from actual market behavior: trend is ${metrics.trend.signal.toLowerCase()}, one-month momentum is ${metrics.returns.oneMonth.toFixed(1)}%, realized volatility is ${metrics.volatility.toFixed(1)}%, and max drawdown is ${metrics.maxDrawdown.toFixed(1)}%. The current recommendation reflects moving-average structure, recent momentum persistence, and the reliability of the available data rather than an asset-class template.`;
    }

    private buildTechnicalFactors(metrics: QuantMetrics, model: AssetFactorModel, marketData: { currency: string }): string[] {
        return [
            `Trend structure is ${metrics.trend.signal.toLowerCase()} with price ${model.priceVsSma50Pct >= 0 ? "above" : "below"} the 50-day average by ${Math.abs(model.priceVsSma50Pct).toFixed(1)}%.`,
            `Momentum snapshot: 1M ${metrics.returns.oneMonth.toFixed(1)}%, 3M ${metrics.returns.threeMonths.toFixed(1)}%, 6M ${metrics.returns.sixMonths.toFixed(1)}%.`,
            `Volatility is ${model.volatilityBand.toLowerCase()} at ${metrics.volatility.toFixed(1)}% annualized, which directly affects entry pacing.`,
            `Current support / resistance map is ${this.formatPrice(model.supportLevel, marketData.currency)} to ${this.formatPrice(model.resistanceLevel, marketData.currency)}.`,
        ];
    }

    private buildFundamentalFactors(asset: Asset, metrics: QuantMetrics, model: AssetFactorModel): string[] {
        return [
            `This engine is price-and-risk driven for ${asset.ticker}; issuer-specific fundamentals are not modeled directly here.`,
            `Data quality is ${model.freshnessLabel.toLowerCase()} with ${metrics.dataQuality.points} daily observations in the current sample.`,
            `The recommendation is most sensitive right now to drawdown depth (${metrics.maxDrawdown.toFixed(1)}%) and medium-term trend persistence.`,
        ];
    }

    private buildAssetInvestmentStrategy(
        asset: Asset,
        metrics: QuantMetrics,
        model: AssetFactorModel,
        riskScore: number
    ): InvestmentStrategy {
        let recommendedMethod: RecommendationMethod = "DCA";
        if (model.totalScore < 42 || model.freshnessLabel === "Stale") {
            recommendedMethod = "Wait";
        } else if (model.totalScore >= 78 && riskScore <= 5) {
            recommendedMethod = "Lump Sum";
        } else if (model.totalScore >= 58) {
            recommendedMethod = "Staged Entry";
        }

        const cadence: Cadence =
            model.volatilityBand === "High" || model.volatilityBand === "Elevated"
                ? "Weekly"
                : model.totalScore >= 70
                    ? "Biweekly"
                    : "Monthly";

        const positionSizing: PositionSizing =
            riskScore >= 8 ? "Small" : riskScore <= 4 && model.totalScore >= 70 ? "Large" : "Medium";

        const duration =
            model.totalScore >= 70 ? "9-12 Months" :
            model.totalScore >= 50 ? "6-9 Months" :
            "1-3 Months";

        return {
            title: `${asset.ticker} Market-Driven Plan`,
            recommendedMethod,
            plan: {
                cadence,
                duration,
                positionSizing,
                riskManagement: [
                    `Reassess the setup if price closes below ${this.formatPrice(model.riskStopLevel, asset.assetClass === "TR Stocks" ? "TRY" : "USD")}.`,
                    `Respect ${model.volatilityBand.toLowerCase()} volatility with staged execution and predefined risk limits.`,
                    model.freshnessLabel === "Fresh"
                        ? "Review the trend and drawdown profile weekly while the position is active."
                        : "Wait for cleaner or fresher data before increasing position size."
                ]
            },
            pros: [
                `Composite score is ${model.totalScore}/100 from real trend, momentum, volatility, and drawdown inputs.`,
                metrics.trend.signal === "Bullish"
                    ? "Moving-average structure still supports the prevailing trend."
                    : "Risk can be defined clearly around observable support and trend levels."
            ],
            cons: [
                `Volatility remains ${model.volatilityBand.toLowerCase()}, which can create noisy entries.`,
                model.drawdownBand === "Deep"
                    ? "Historical drawdowns have been deep enough to demand small sizing."
                    : "Momentum can still fade quickly if the short-term trend weakens."
            ],
            whyThis: [
                `Trend, momentum, and structural alignment are all being scored from actual trailing returns and moving-average positioning rather than asset-class defaults.`,
                `Volatility and drawdown are treated as explicit risk factors, so weaker downside resilience directly lowers the recommendation strength.`,
                model.freshnessLabel === "Fresh"
                    ? "Data quality is adequate enough to support an asset-level tactical recommendation."
                    : "Data quality is a limiting factor, so the strategy stays more conservative."
            ],
            assumptions: [
                "Recent daily price behavior remains representative enough for short-to-medium term planning.",
                "Execution can be staged near observed support / resistance levels without major liquidity disruption.",
                "No major asset-specific event invalidates the current trend structure immediately."
            ],
            limitations: [
                "The model relies on price history and does not ingest company financials or protocol-specific fundamentals directly.",
                "Expected return framing is qualitative when realized volatility makes precise forecasting unreliable.",
                model.freshnessLabel !== "Fresh"
                    ? "Data freshness is limited, so timing confidence should be treated cautiously."
                    : "Daily bars can miss intraday reversals and event-driven gaps."
            ],
            disclaimer: "Educational purposes only. This recommendation is deterministic, data-driven, and not a guarantee of future performance."
        };
    }

    private buildStrategyName(model: AssetFactorModel): string {
        if (model.totalScore >= 78) return "Trend-Following Accumulation";
        if (model.totalScore >= 60) return "Measured Breakout / Pullback Plan";
        if (model.totalScore >= 45) return "Selective Watchlist Accumulation";
        return "Capital Preservation / Wait Setup";
    }

    private formatPrice(value: number, currency: string): string {
        const prefix = currency === "TRY" ? "TRY " : currency === "USD" ? "$" : `${currency} `;
        const digits = value >= 1000 ? 0 : value >= 10 ? 2 : 4;
        return `${prefix}${value.toLocaleString(undefined, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        })}`;
    }

    private buildPriceStructure(history: MarketHistoryItem[], metrics: QuantMetrics, latestPrice: number): PriceStructure {
        const recentHistory = history.slice(-120);
        const fallbackSupport = metrics.trend.sma50 || metrics.trend.sma200 || latestPrice * 0.96;
        const fallbackSecondarySupport = metrics.trend.sma200 || fallbackSupport * 0.97;
        const fallbackResistance = latestPrice * (metrics.volatility > 35 ? 1.04 : 1.03);
        const averageRangePct = this.calculateAverageRangePct(recentHistory, latestPrice);
        const breakoutBufferPct = Math.max(averageRangePct * 0.6, 0.8);
        const stopBufferPct = Math.max(averageRangePct * 0.75, 1.2);

        if (recentHistory.length < 20) {
            return {
                supportLevel: fallbackSupport,
                secondarySupportLevel: fallbackSecondarySupport,
                resistanceLevel: fallbackResistance,
                breakoutLevel: fallbackResistance * (1 + breakoutBufferPct / 100),
                takeProfitLevel: fallbackResistance * (1 + (breakoutBufferPct * 1.8) / 100),
                riskStopLevel: fallbackSupport * (1 - stopBufferPct / 100),
                averageRangePct,
                fallbackUsed: true,
            };
        }

        const swingLows = this.findSwingLevels(recentHistory, "low");
        const swingHighs = this.findSwingLevels(recentHistory, "high");
        const rawSupportLevels = [
            ...swingLows,
            metrics.trend.sma20,
            metrics.trend.sma50,
            metrics.trend.sma200,
            ...recentHistory.slice(-20).map((item) => item.low ?? item.close),
        ].filter((level) => Number.isFinite(level) && level > 0);
        const rawResistanceLevels = [
            ...swingHighs,
            ...recentHistory.slice(-20).map((item) => item.high ?? item.close),
        ].filter((level) => Number.isFinite(level) && level > 0);

        const supportLevels = this.clusterLevels(rawSupportLevels, latestPrice, 1.2)
            .filter((level) => level <= latestPrice * 1.01)
            .sort((a, b) => b - a);
        const resistanceLevels = this.clusterLevels(rawResistanceLevels, latestPrice, 1.2)
            .filter((level) => level >= latestPrice * 0.99)
            .sort((a, b) => a - b);

        const supportLevel = supportLevels[0] ?? fallbackSupport;
        const secondarySupportLevel =
            supportLevels.find((level) => level < supportLevel * 0.985) ??
            Math.min(fallbackSecondarySupport, supportLevel * 0.985);
        const resistanceLevel = resistanceLevels[0] ?? fallbackResistance;
        const nextResistance =
            resistanceLevels.find((level) => level > resistanceLevel * 1.012) ??
            resistanceLevel * (1 + Math.max(averageRangePct, 2.2) / 100);

        return {
            supportLevel,
            secondarySupportLevel,
            resistanceLevel,
            breakoutLevel: resistanceLevel * (1 + breakoutBufferPct / 100),
            takeProfitLevel: nextResistance,
            riskStopLevel: Math.min(
                supportLevel * (1 - stopBufferPct / 100),
                secondarySupportLevel * (1 - Math.max(stopBufferPct * 0.5, 0.8) / 100)
            ),
            averageRangePct,
            fallbackUsed: false,
        };
    }

    private calculateAverageRangePct(history: MarketHistoryItem[], latestPrice: number): number {
        const ranges = history
            .slice(-20)
            .map((item) => {
                const high = item.high ?? item.close;
                const low = item.low ?? item.close;
                const base = item.close || latestPrice;
                if (base <= 0) return 0;
                return ((high - low) / base) * 100;
            })
            .filter((value) => Number.isFinite(value) && value > 0);

        if (ranges.length === 0) {
            return latestPrice > 0 ? 1.5 : 0;
        }

        return ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
    }

    private findSwingLevels(history: MarketHistoryItem[], direction: "low" | "high"): number[] {
        const swings: number[] = [];

        for (let index = 2; index < history.length - 2; index += 1) {
            const current = direction === "low" ? (history[index].low ?? history[index].close) : (history[index].high ?? history[index].close);
            const prevOne = direction === "low" ? (history[index - 1].low ?? history[index - 1].close) : (history[index - 1].high ?? history[index - 1].close);
            const prevTwo = direction === "low" ? (history[index - 2].low ?? history[index - 2].close) : (history[index - 2].high ?? history[index - 2].close);
            const nextOne = direction === "low" ? (history[index + 1].low ?? history[index + 1].close) : (history[index + 1].high ?? history[index + 1].close);
            const nextTwo = direction === "low" ? (history[index + 2].low ?? history[index + 2].close) : (history[index + 2].high ?? history[index + 2].close);

            const isSwing =
                direction === "low"
                    ? current <= prevOne && current <= prevTwo && current <= nextOne && current <= nextTwo
                    : current >= prevOne && current >= prevTwo && current >= nextOne && current >= nextTwo;

            if (isSwing && Number.isFinite(current) && current > 0) {
                swings.push(current);
            }
        }

        return swings;
    }

    private clusterLevels(levels: number[], anchorPrice: number, tolerancePct: number): number[] {
        if (levels.length === 0) return [];

        const tolerance = Math.max(anchorPrice * (tolerancePct / 100), anchorPrice * 0.003);
        const sorted = [...levels].sort((a, b) => a - b);
        const clusters: number[][] = [];

        for (const level of sorted) {
            const lastCluster = clusters[clusters.length - 1];
            if (!lastCluster) {
                clusters.push([level]);
                continue;
            }

            const clusterMean = lastCluster.reduce((sum, value) => sum + value, 0) / lastCluster.length;
            if (Math.abs(level - clusterMean) <= tolerance) {
                lastCluster.push(level);
            } else {
                clusters.push([level]);
            }
        }

        return clusters
            .map((cluster) => cluster.reduce((sum, value) => sum + value, 0) / cluster.length)
            .filter((level) => Number.isFinite(level));
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
}

export const recommendationService = new RecommendationService();
