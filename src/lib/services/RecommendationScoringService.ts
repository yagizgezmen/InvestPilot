import { QuantMetrics } from "@/lib/services/AnalyticsService";
import {
  RecommendationFactorBreakdown,
  RecommendationFactorKey,
  RecommendationScoreResult,
  RiskProfile,
  TimeHorizon,
} from "@/types";

interface RecommendationScoringContext {
  riskProfile: RiskProfile;
  timeHorizon: TimeHorizon;
}

interface FactorDefinition {
  key: RecommendationFactorKey;
  label: string;
  baseWeight: number;
}

const FACTOR_DEFINITIONS: FactorDefinition[] = [
  { key: "trendStrength", label: "Trend Strength", baseWeight: 19 },
  { key: "shortTermMomentum", label: "Short-Term Momentum", baseWeight: 13 },
  { key: "mediumTermMomentum", label: "Medium-Term Momentum", baseWeight: 15 },
  { key: "volatilityRisk", label: "Volatility Risk", baseWeight: 16 },
  { key: "drawdownRisk", label: "Drawdown Risk", baseWeight: 15 },
  { key: "structuralTrendAlignment", label: "Structural Trend", baseWeight: 14 },
  { key: "dataQuality", label: "Data Quality", baseWeight: 8 },
];

const RISK_WEIGHT_MULTIPLIERS: Record<RiskProfile, Record<RecommendationFactorKey, number>> = {
  Conservative: {
    trendStrength: 0.9,
    shortTermMomentum: 0.75,
    mediumTermMomentum: 0.95,
    volatilityRisk: 1.35,
    drawdownRisk: 1.35,
    structuralTrendAlignment: 1.05,
    dataQuality: 1.15,
  },
  Balanced: {
    trendStrength: 1,
    shortTermMomentum: 1,
    mediumTermMomentum: 1,
    volatilityRisk: 1,
    drawdownRisk: 1,
    structuralTrendAlignment: 1,
    dataQuality: 1,
  },
  Aggressive: {
    trendStrength: 1.05,
    shortTermMomentum: 1.2,
    mediumTermMomentum: 1.1,
    volatilityRisk: 0.75,
    drawdownRisk: 0.8,
    structuralTrendAlignment: 1,
    dataQuality: 0.95,
  },
};

const HORIZON_WEIGHT_MULTIPLIERS: Record<TimeHorizon, Record<RecommendationFactorKey, number>> = {
  "0-6m": {
    trendStrength: 0.95,
    shortTermMomentum: 1.3,
    mediumTermMomentum: 0.8,
    volatilityRisk: 1.25,
    drawdownRisk: 1.15,
    structuralTrendAlignment: 0.85,
    dataQuality: 1.1,
  },
  "6-24m": {
    trendStrength: 1,
    shortTermMomentum: 1,
    mediumTermMomentum: 1,
    volatilityRisk: 1,
    drawdownRisk: 1,
    structuralTrendAlignment: 1,
    dataQuality: 1,
  },
  "2y+": {
    trendStrength: 1.1,
    shortTermMomentum: 0.75,
    mediumTermMomentum: 1.2,
    volatilityRisk: 0.85,
    drawdownRisk: 0.95,
    structuralTrendAlignment: 1.25,
    dataQuality: 0.9,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scaleLinear(value: number, floor: number, ceiling: number): number {
  if (ceiling <= floor) return 50;
  return clamp(((value - floor) / (ceiling - floor)) * 100, 0, 100);
}

function invertScale(value: number, floor: number, ceiling: number): number {
  return 100 - scaleLinear(value, floor, ceiling);
}

function describeImpact(score: number): "Positive" | "Neutral" | "Negative" {
  if (score >= 65) return "Positive";
  if (score <= 40) return "Negative";
  return "Neutral";
}

function buildWeights(context: RecommendationScoringContext): Record<RecommendationFactorKey, number> {
  const totals = FACTOR_DEFINITIONS.map((factor) => {
    const weight =
      factor.baseWeight *
      RISK_WEIGHT_MULTIPLIERS[context.riskProfile][factor.key] *
      HORIZON_WEIGHT_MULTIPLIERS[context.timeHorizon][factor.key];
    return { key: factor.key, rawWeight: weight };
  });

  const sum = totals.reduce((acc, item) => acc + item.rawWeight, 0) || 1;

  return totals.reduce<Record<RecommendationFactorKey, number>>((acc, item) => {
    acc[item.key] = Number(((item.rawWeight / sum) * 100).toFixed(2));
    return acc;
  }, {
    trendStrength: 0,
    shortTermMomentum: 0,
    mediumTermMomentum: 0,
    volatilityRisk: 0,
    drawdownRisk: 0,
    structuralTrendAlignment: 0,
    dataQuality: 0,
  });
}

function evaluateFactors(metrics: QuantMetrics, context: RecommendationScoringContext): RecommendationFactorBreakdown[] {
  const weights = buildWeights(context);
  const volUpper = context.riskProfile === "Conservative" ? 45 : context.riskProfile === "Aggressive" ? 80 : 60;
  const ddUpper = context.riskProfile === "Conservative" ? 35 : context.riskProfile === "Aggressive" ? 60 : 45;

  const trendBase =
    metrics.trend.signal === "Bullish" ? 76 :
    metrics.trend.signal === "Bearish" ? 28 :
    52;
  const trendStrengthScore = clamp(
    trendBase + (metrics.trend.priceVsSma50Pct * 1.2) + (metrics.trend.priceVsSma200Pct * 0.6),
    0,
    100,
  );

  const shortTermMomentumScore = clamp(
    scaleLinear(metrics.returns.oneWeek, -8, 8) * 0.4 + scaleLinear(metrics.returns.oneMonth, -15, 15) * 0.6,
    0,
    100,
  );

  const mediumTermMomentumScore = clamp(
    scaleLinear(metrics.returns.threeMonths, -25, 25) * 0.55 + scaleLinear(metrics.returns.sixMonths, -35, 35) * 0.45,
    0,
    100,
  );

  const volatilityRiskScore = invertScale(metrics.volatility, 8, volUpper);
  const drawdownRiskScore = invertScale(metrics.maxDrawdown, 5, ddUpper);

  const structureBase =
    metrics.trend.sma20 >= metrics.trend.sma50 && metrics.trend.sma50 >= metrics.trend.sma200
      ? 82
      : metrics.trend.sma50 >= metrics.trend.sma200
        ? 62
        : metrics.trend.sma20 <= metrics.trend.sma50 && metrics.trend.sma50 <= metrics.trend.sma200
          ? 22
          : 45;
  const structuralTrendAlignmentScore = clamp(
    structureBase + metrics.trend.priceVsSma20Pct * 0.8 + metrics.trend.priceVsSma50Pct * 0.6,
    0,
    100,
  );

  let dataQualityScore = metrics.dataQuality.points >= 252 ? 92 : scaleLinear(metrics.dataQuality.points, 30, 252);
  if (metrics.dataQuality.isStale) dataQualityScore -= 28;
  if (metrics.dataQuality.points < 60) dataQualityScore -= 12;
  dataQualityScore = clamp(dataQualityScore, 0, 100);

  const factorInputs: Array<{
    key: RecommendationFactorKey;
    rawValue: string;
    score: number;
    summary: string;
  }> = [
    {
      key: "trendStrength",
      rawValue: `${metrics.trend.signal}, ${metrics.trend.priceVsSma50Pct.toFixed(1)}% vs SMA50`,
      score: trendStrengthScore,
      summary: `Primary trend is ${metrics.trend.signal.toLowerCase()} with price ${metrics.trend.priceVsSma50Pct >= 0 ? "above" : "below"} the 50-day average.`,
    },
    {
      key: "shortTermMomentum",
      rawValue: `1W ${metrics.returns.oneWeek.toFixed(1)}%, 1M ${metrics.returns.oneMonth.toFixed(1)}%`,
      score: shortTermMomentumScore,
      summary: `Short-term momentum combines the latest 1-week and 1-month move.`,
    },
    {
      key: "mediumTermMomentum",
      rawValue: `3M ${metrics.returns.threeMonths.toFixed(1)}%, 6M ${metrics.returns.sixMonths.toFixed(1)}%`,
      score: mediumTermMomentumScore,
      summary: `Medium-term momentum checks whether the move is persisting beyond the latest bounce.`,
    },
    {
      key: "volatilityRisk",
      rawValue: `${metrics.volatility.toFixed(1)}% annualized`,
      score: volatilityRiskScore,
      summary: `Higher realized volatility lowers the attractiveness score because execution risk rises.`,
    },
    {
      key: "drawdownRisk",
      rawValue: `${metrics.maxDrawdown.toFixed(1)}% max drawdown`,
      score: drawdownRiskScore,
      summary: `Historical drawdown depth sets the downside tolerance required for this setup.`,
    },
    {
      key: "structuralTrendAlignment",
      rawValue: `SMA20 ${metrics.trend.sma20.toFixed(2)}, SMA50 ${metrics.trend.sma50.toFixed(2)}, SMA200 ${metrics.trend.sma200.toFixed(2)}`,
      score: structuralTrendAlignmentScore,
      summary: `Structural alignment checks moving-average ordering and price location versus the trend stack.`,
    },
    {
      key: "dataQuality",
      rawValue: `${metrics.dataQuality.points} points${metrics.dataQuality.isStale ? ", stale" : ""}`,
      score: dataQualityScore,
      summary: `Data quality rewards deeper and fresher histories and penalizes stale inputs.`,
    },
  ];

  return factorInputs.map((factor) => {
    const definition = FACTOR_DEFINITIONS.find((item) => item.key === factor.key);
    const weight = weights[factor.key];
    const normalizedScore = Number(factor.score.toFixed(1));
    const weightedContribution = Number(((normalizedScore * weight) / 100).toFixed(2));

    return {
      key: factor.key,
      label: definition?.label ?? factor.key,
      rawValue: factor.rawValue,
      normalizedScore,
      weight,
      weightedContribution,
      impact: describeImpact(normalizedScore),
      summary: factor.summary,
    };
  });
}

function inferConfidence(score: number, factors: RecommendationFactorBreakdown[]): RecommendationScoreResult["confidence"] {
  const dataQuality = factors.find((factor) => factor.key === "dataQuality")?.normalizedScore ?? 0;
  const weakFactorCount = factors.filter((factor) => factor.normalizedScore <= 35).length;

  if (dataQuality < 45) return "Low";
  if (dataQuality >= 75 && (score >= 70 || score <= 30) && weakFactorCount <= 2) return "High";
  return "Medium";
}

export class RecommendationScoringService {
  score(metrics: QuantMetrics, context: RecommendationScoringContext): RecommendationScoreResult {
    const factors = evaluateFactors(metrics, context).sort((a, b) => b.weightedContribution - a.weightedContribution);
    const score = clamp(
      Math.round(factors.reduce((acc, factor) => acc + factor.weightedContribution, 0)),
      0,
      100,
    );
    const confidence = inferConfidence(score, factors);

    return {
      score,
      confidence,
      factors,
      dominantDrivers: factors
        .filter((factor) => factor.normalizedScore >= 60)
        .slice(0, 3)
        .map((factor) => `${factor.label}: ${factor.rawValue}`),
      cautionFlags: factors
        .filter((factor) => factor.normalizedScore <= 40)
        .slice(0, 3)
        .map((factor) => `${factor.label}: ${factor.rawValue}`),
      context,
    };
  }
}

export const recommendationScoringService = new RecommendationScoringService();
