import type { AssetStrategy, MarketData } from "@/types";
import {
  BarChart3,
  Eye,
  Radar,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Waves,
} from "lucide-react";
import type {
  ActionPlanModel,
  Decision,
  DecisionHeroModel,
  DriverStatus,
  MethodologyModel,
  ProfileFitModel,
  ProfileFitLevel,
  RecommendationDriver,
  RecommendationTheme,
  RiskLevel,
  RiskOverviewModel,
} from "./types";

export function deriveDecision(strategy: AssetStrategy, marketData: MarketData | null): Decision {
  const change = marketData?.changePct ?? 0;

  if (strategy.riskScore >= 8 && change < 0) return "AVOID";
  if (strategy.riskScore <= 5 && change > -3) return "INVEST";
  return "MONITOR";
}

export function decisionTheme(decision: Decision): RecommendationTheme {
  if (decision === "INVEST") {
    return {
      badge: "success",
      icon: TrendingUp,
      label: "Invest",
      caption: "Momentum/risk profile is acceptable for staged execution.",
      cardClass: "border-success/40 bg-success/5",
    };
  }

  if (decision === "AVOID") {
    return {
      badge: "destructive",
      icon: TrendingDown,
      label: "Do Not Invest",
      caption: "Risk and downside profile are not attractive right now.",
      cardClass: "border-destructive/40 bg-destructive/5",
    };
  }

  return {
    badge: "warning",
    icon: Eye,
    label: "Monitor",
    caption: "Setup is mixed; wait for stronger confirmation.",
    cardClass: "border-warning/40 bg-warning/5",
  };
}

function getDriverStatus(value: string): DriverStatus {
  const normalized = value.toLowerCase();

  if (
    normalized.includes("strong") ||
    normalized.includes("bull") ||
    normalized.includes("uptrend") ||
    normalized.includes("growth") ||
    normalized.includes("positive")
  ) {
    return "Positive";
  }

  if (
    normalized.includes("risk") ||
    normalized.includes("drawdown") ||
    normalized.includes("volatile") ||
    normalized.includes("bear") ||
    normalized.includes("weak")
  ) {
    return "Cautious";
  }

  return "Neutral";
}

export function buildDrivers(strategy: AssetStrategy, marketData: MarketData | null): RecommendationDriver[] {
  const change = marketData?.changePct ?? 0;
  const trendText =
    change > 2
      ? "Recent price action supports a constructive trend bias."
      : change < -2
        ? "Recent price action is soft and calls for caution."
        : "Trend confirmation is mixed and still developing.";
  const volatilityText =
    strategy.riskScore >= 8
      ? "Risk score implies wider volatility and tighter sizing discipline."
      : strategy.riskScore <= 4
        ? "Risk score suggests comparatively calmer behavior for staged entries."
        : "Volatility looks manageable but still relevant for timing and scaling.";

  const drivers: RecommendationDriver[] = [
    {
      title: "Trend",
      status: getDriverStatus(trendText),
      explanation: trendText,
      theme: "trend",
    },
    {
      title: "Momentum",
      status: change > 0 ? "Positive" : change < 0 ? "Cautious" : "Neutral",
      explanation:
        change > 0
          ? "Short-term momentum is supportive, which improves execution confidence."
          : change < 0
            ? "Momentum is currently soft, so entries should stay selective."
            : "Momentum is flat, so the setup relies more on discipline than urgency.",
      theme: "momentum",
    },
    {
      title: "Volatility",
      status: getDriverStatus(volatilityText),
      explanation: volatilityText,
      theme: "volatility",
    },
    {
      title: "Market Context",
      status: getDriverStatus(strategy.detailedRationale),
      explanation:
        strategy.detailedRationale.length > 135
          ? `${strategy.detailedRationale.slice(0, 132).trimEnd()}...`
          : strategy.detailedRationale,
      theme: "market",
    },
    {
      title: "Relative Attractiveness",
      status: strategy.riskScore <= 5 ? "Positive" : strategy.riskScore >= 8 ? "Cautious" : "Neutral",
      explanation: `Expected return profile is ${strategy.expectedReturn}, which shapes current attractiveness versus risk.`,
      theme: "attractiveness",
    },
    {
      title: "Portfolio Role",
      status: strategy.investmentStrategy.recommendedMethod === "Wait" ? "Cautious" : "Neutral",
      explanation:
        strategy.investmentStrategy.recommendedMethod === "DCA"
          ? "Best used as a phased accumulation sleeve rather than an all-in position."
          : strategy.investmentStrategy.recommendedMethod === "Wait"
            ? "Better treated as a monitored watchlist idea until conditions improve."
            : "Fits as an active allocation with defined execution discipline.",
      theme: "portfolio",
    },
  ];

  return drivers.slice(0, 6);
}

export function buildRiskOverview(strategy: AssetStrategy, marketData: MarketData | null): RiskOverviewModel {
  const change = marketData?.changePct ?? 0;
  let level: RiskLevel = "Moderate";
  let score = 58;

  if (strategy.riskScore >= 8 || change < -4) {
    level = "High";
    score = 80;
  } else if (strategy.riskScore <= 4 && change > -2) {
    level = "Low";
    score = 32;
  }

  return {
    level,
    score,
    volatilitySummary:
      strategy.riskScore >= 8
        ? "This setup carries elevated volatility and is better handled with tighter sizing."
        : strategy.riskScore <= 4
          ? "Volatility profile looks comparatively calmer for staged execution."
          : "Volatility is present but can be managed with pacing and position control.",
    downsideSummary:
      strategy.investmentStrategy.limitations[0] ??
      strategy.investmentStrategy.cons[0] ??
      "Primary downside comes from macro repricing and uneven entry timing.",
    timeSuitability:
      strategy.investmentStrategy.recommendedMethod === "Wait"
        ? "Less suitable for immediate deployment; better for patient monitoring."
        : `Best aligned with investors comfortable with a ${strategy.investmentStrategy.plan.duration} execution window.`,
    notSuitableFor:
      strategy.riskScore >= 8
        ? "Not suitable for capital-preservation-first investors or anyone needing near-term liquidity."
        : strategy.investmentStrategy.recommendedMethod === "Wait"
          ? "Not suitable for investors seeking instant execution right now."
          : "Not suitable for investors who cannot tolerate interim volatility or slow accumulation.",
  };
}

function formatPrice(value?: number, currency?: string): string {
  if (value === undefined || value === null) return "Market price unavailable";
  const symbol = currency === "USD" ? "$" : currency === "TRY" ? "TRY " : currency ? `${currency} ` : "";
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: value >= 100 ? 0 : 2,
    maximumFractionDigits: value >= 100 ? 2 : 4,
  })}`;
}

function formatPerformance(change?: number): string {
  if (change === undefined || Number.isNaN(change)) return "Short-term performance currently unavailable.";
  if (change > 2) return `Short-term performance is constructive at +${change.toFixed(2)}%.`;
  if (change < -2) return `Short-term performance is under pressure at ${change.toFixed(2)}%.`;
  return `Short-term performance is broadly flat at ${change.toFixed(2)}%.`;
}

export function buildDecisionHero(
  strategy: AssetStrategy,
  marketData: MarketData | null,
  decision: Decision,
  riskOverview: RiskOverviewModel,
): DecisionHeroModel {
  const change = marketData?.changePct ?? 0;

  const recommendationLabel: DecisionHeroModel["recommendationLabel"] =
    decision === "INVEST"
      ? strategy.riskScore <= 3 && change > 2
        ? "Strong Buy"
        : strategy.investmentStrategy.recommendedMethod === "DCA"
          ? "Accumulate"
          : "Buy"
      : decision === "AVOID"
        ? strategy.riskScore >= 9
          ? "Avoid"
          : "Reduce"
        : "Hold";

  const confidenceBand: DecisionHeroModel["confidenceBand"] =
    strategy.riskScore <= 4 || strategy.riskScore >= 8 ? "High" : strategy.riskScore <= 6 ? "Medium" : "Low";

  const summary =
    decision === "INVEST"
      ? `${strategy.ticker} is currently positioned as a ${recommendationLabel.toLowerCase()} candidate with ${strategy.investmentStrategy.recommendedMethod.toLowerCase()} execution.`
      : decision === "AVOID"
        ? `${strategy.ticker} is currently flagged as ${recommendationLabel.toLowerCase()} due to elevated downside and weaker setup quality.`
        : `${strategy.ticker} is currently a ${recommendationLabel.toLowerCase()} setup, which favors patience over immediate deployment.`;

  return {
    assetName: strategy.name,
    ticker: strategy.ticker,
    assetClass: strategy.assetClass,
    currentPrice: formatPrice(marketData?.currentPrice, marketData?.currency),
    shortTermPerformance: formatPerformance(change),
    recommendationLabel,
    confidenceBand,
    riskBadge: riskOverview.level,
    timeHorizon: strategy.investmentStrategy.plan.duration,
    summary,
  };
}

export function buildActionPlan(strategy: AssetStrategy, decision: Decision): ActionPlanModel {
  const method = strategy.investmentStrategy.recommendedMethod;
  const firstRiskItem =
    strategy.investmentStrategy.plan.riskManagement[0] ??
    strategy.investmentStrategy.limitations[0] ??
    strategy.investmentStrategy.cons[0] ??
    "Monitor market structure and sizing discipline before acting.";

  const recommendedAction: ActionPlanModel["recommendedAction"] =
    decision === "INVEST"
      ? method === "Lump Sum"
        ? "Buy now"
        : "Staged entry"
      : decision === "AVOID"
        ? "Reduce"
        : method === "Wait"
          ? "Wait"
          : "Hold";

  const suggestedApproach =
    method === "DCA"
      ? "DCA / phased accumulation"
      : method === "Staged Entry"
        ? "Staged entry"
        : method === "Lump Sum"
          ? "Single allocation"
          : "Wait and reassess";

  const implementationSummary =
    recommendedAction === "Buy now"
      ? `Deploy with ${strategy.investmentStrategy.plan.positionSizing.toLowerCase()} sizing and review risk controls before full execution.`
      : recommendedAction === "Staged entry"
        ? `Scale in with ${strategy.investmentStrategy.plan.cadence.toLowerCase()} entries rather than committing all capital at once.`
        : recommendedAction === "Reduce"
          ? "Keep exposure defensive and avoid adding until setup quality improves materially."
          : "Maintain observation mode and wait for a cleaner confirmation before increasing exposure.";

  return {
    recommendedAction,
    suggestedApproach,
    allocationRange: strategy.allocationAdvice || "Allocation guidance not available.",
    monitoringTrigger: firstRiskItem,
    implementationSummary,
  };
}

export function buildProfileFit(strategy: AssetStrategy, decision: Decision): ProfileFitModel {
  let fit: ProfileFitLevel = "Moderate fit";
  let score = 62;

  if (decision === "INVEST" && strategy.riskScore <= 5) {
    fit = "Strong fit";
    score = 82;
  } else if (decision === "AVOID" || strategy.riskScore >= 8) {
    fit = "Weak fit";
    score = 34;
  }

  const inferredRiskProfile =
    strategy.riskScore >= 8 ? "Aggressive" : strategy.riskScore <= 4 ? "Conservative" : "Balanced";

  const notes = [
    `Risk profile alignment currently leans ${inferredRiskProfile.toLowerCase()} based on a ${strategy.riskScore}/10 risk score.`,
    `Time-horizon fit is tied to a ${strategy.investmentStrategy.plan.duration.toLowerCase()} execution window.`,
    strategy.investmentStrategy.recommendedMethod === "DCA"
      ? "This recommendation fits users who prefer gradual deployment over one-time entries."
      : strategy.investmentStrategy.recommendedMethod === "Wait"
        ? "This recommendation is better for users comfortable with patience and delayed execution."
        : "This recommendation assumes the user can act with a more direct implementation style.",
    "Income versus growth preference is not set explicitly, so fit is inferred from risk and execution style.",
  ];

  return {
    fit,
    score,
    riskProfile: inferredRiskProfile,
    timeHorizon: strategy.investmentStrategy.plan.duration,
    incomePreference: undefined,
    notes,
    profileComplete: false,
  };
}

function formatLatestTimestamp(marketData: MarketData | null): string {
  const latestPoint = marketData?.history?.[marketData.history.length - 1];
  if (!latestPoint?.time) return "Latest timestamp unavailable";

  const date = new Date(latestPoint.time);
  if (Number.isNaN(date.getTime())) return "Latest timestamp unavailable";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildMethodology(strategy: AssetStrategy, marketData: MarketData | null): MethodologyModel {
  const factors = [
    "Price trend and short-term momentum",
    "Risk score and volatility profile",
    "Recommended method, cadence, and position sizing",
    "Technical and fundamental drivers from the strategy engine",
  ];

  const limitations = [
    ...strategy.investmentStrategy.limitations.slice(0, 2),
    ...strategy.investmentStrategy.assumptions.slice(0, 2),
  ];

  const missingDataWarning = marketData?.stale
    ? "Market data may be cached or stale, so the recommendation should be reviewed with fresh quotes before execution."
    : !marketData || marketData.error
      ? "Some market data fields are unavailable, so parts of the recommendation rely more heavily on strategy defaults."
      : undefined;

  return {
    summary: "This recommendation combines market context, risk framing, and implementation guidance into a single decision workspace.",
    factors,
    latestDataTimestamp: formatLatestTimestamp(marketData),
    limitations,
    missingDataWarning,
    disclosure:
      strategy.investmentStrategy.disclaimer ||
      "Educational use only. This does not guarantee outcomes and should not be treated as financial advice.",
  };
}

export function getDriverThemeIcon(theme: RecommendationDriver["theme"]) {
  switch (theme) {
    case "trend":
      return TrendingUp;
    case "momentum":
      return Radar;
    case "volatility":
      return Waves;
    case "market":
      return BarChart3;
    case "attractiveness":
      return Target;
    case "portfolio":
      return Shield;
  }
}
