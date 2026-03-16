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
  DecisionSupportModel,
  Decision,
  DecisionHeroModel,
  DecisionSupportItem,
  DriverStatus,
  MethodologyModel,
  ProfileFitModel,
  ProfileFitLevel,
  RecommendationDriver,
  RecommendationTheme,
  RiskLevel,
  RiskOverviewModel,
  UserPreferenceProfile,
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

function getFactorStatus(score?: number): DriverStatus {
  if (score === undefined) return "Neutral";
  if (score >= 65) return "Positive";
  if (score <= 40) return "Cautious";
  return "Neutral";
}

function getFactorScore(strategy: AssetStrategy, key: string): number | undefined {
  return strategy.factorBreakdown?.find((factor) => factor.key === key)?.normalizedScore;
}

function pushDecisionSupportItem(
  items: DecisionSupportItem[],
  title: string,
  status: DriverStatus,
  explanation: string | undefined,
) {
  if (!explanation) return;
  if (items.some((item) => item.title === title)) return;
  items.push({ title, status, explanation });
}
export function buildDecisionSupport(
  strategy: AssetStrategy,
  decision: Decision,
  profileFit: ProfileFitModel,
): DecisionSupportModel {
  const trendScore = getFactorScore(strategy, "trendStrength");
  const shortMomentumScore = getFactorScore(strategy, "shortTermMomentum");
  const mediumMomentumScore = getFactorScore(strategy, "mediumTermMomentum");
  const volatilityScore = getFactorScore(strategy, "volatilityRisk");
  const drawdownScore = getFactorScore(strategy, "drawdownRisk");
  const structureScore = getFactorScore(strategy, "structuralTrendAlignment");
  const dataQualityScore = getFactorScore(strategy, "dataQuality");

  const items: DecisionSupportItem[] = [];

  if (decision === "INVEST") {
    pushDecisionSupportItem(
      items,
      "Trend Risk",
      getFactorStatus(trendScore),
      trendScore !== undefined && trendScore < 70
        ? "Trend quality is supportive enough to invest, but it is not strong enough to ignore a failed trend continuation."
        : "Trend structure is constructive, but the position still depends on the current trend staying intact after entry."
    );
    pushDecisionSupportItem(
      items,
      "Volatility Control",
      getFactorStatus(volatilityScore),
      volatilityScore !== undefined && volatilityScore <= 45
        ? "Volatility remains elevated enough that staged sizing and disciplined entries matter even with a positive recommendation."
        : "Even in a cleaner setup, volatility can still create uneven entry timing and interim pullbacks."
    );
    pushDecisionSupportItem(
      items,
      "Reward vs Risk",
      getFactorStatus(structureScore),
      structureScore !== undefined && structureScore < 60
        ? "The upside case exists, but reward-to-risk improves only if price respects support and confirms above breakout levels."
        : "The current setup is favorable, but the case weakens quickly if support fails after entry."
    );
    if (dataQualityScore !== undefined && dataQualityScore < 60) {
      pushDecisionSupportItem(
        items,
        "Data Confidence",
        "Cautious",
        "Data quality is not ideal, so the invest case should still be reviewed against fresh prices before sizing up."
      );
    }
  } else if (decision === "MONITOR") {
    pushDecisionSupportItem(
      items,
      "Trend Confirmation",
      getFactorStatus(trendScore),
      trendScore !== undefined && trendScore < 55
        ? "Trend strength is still mixed, which keeps this setup on watch instead of in active deployment."
        : "Trend is improving, but it still needs cleaner confirmation before the system turns fully constructive."
    );
    pushDecisionSupportItem(
      items,
      "Momentum Follow-Through",
      getFactorStatus(mediumMomentumScore),
      mediumMomentumScore !== undefined && mediumMomentumScore < 55
        ? "Medium-term momentum is not yet strong enough to support a more bullish stance."
        : "Momentum has stabilized, but follow-through is still not decisive enough to upgrade the call."
    );
    pushDecisionSupportItem(
      items,
      "Structural Setup",
      getFactorStatus(structureScore),
      structureScore !== undefined && structureScore < 55
        ? "Moving-average structure is not fully aligned yet, so waiting for a cleaner setup is more sensible."
        : "Structural trend alignment is improving, but not enough to remove the wait-and-watch posture."
    );
    if (profileFit.fit === "Weak fit") {
      pushDecisionSupportItem(
        items,
        "Profile Alignment",
        "Cautious",
        "The setup remains on watch partly because it does not line up cleanly with the current user profile."
      );
    }
  } else {
    pushDecisionSupportItem(
      items,
      "Weak Trend",
      getFactorStatus(trendScore),
      trendScore !== undefined && trendScore <= 45
        ? "Trend quality is not strong enough to justify fresh exposure right now."
        : "The trend does not provide enough support to offset the current downside risk."
    );
    pushDecisionSupportItem(
      items,
      "Downside Risk",
      getFactorStatus(drawdownScore),
      drawdownScore !== undefined && drawdownScore <= 45
        ? "Historical drawdown behavior remains too heavy for the current return outlook."
        : "Downside resilience is still too weak relative to the current opportunity set."
    );
    pushDecisionSupportItem(
      items,
      "Volatility Burden",
      getFactorStatus(volatilityScore),
      volatilityScore !== undefined && volatilityScore <= 45
        ? "Volatility is elevated enough to make entries unattractive unless conditions improve materially."
        : "The current setup still carries more volatility than the expected payoff justifies."
    );
    pushDecisionSupportItem(
      items,
      "Reward-to-Risk",
      getFactorStatus(shortMomentumScore),
      shortMomentumScore !== undefined && shortMomentumScore < 50
        ? "Recent momentum is not compensating enough for the current risk profile."
        : "The upside case does not look strong enough to justify the current risk and uncertainty."
    );
  }

  if (items.length < 4 && dataQualityScore !== undefined && dataQualityScore < 65) {
    pushDecisionSupportItem(
      items,
      "Data Quality",
      "Cautious",
      "Data freshness or sample depth is limiting confidence, so the recommendation should be treated more carefully."
    );
  }

  if (items.length < 4 && profileFit.fit !== "Strong fit") {
    pushDecisionSupportItem(
      items,
      "Profile Fit",
      profileFit.fit === "Weak fit" ? "Cautious" : "Neutral",
      profileFit.fit === "Weak fit"
        ? "The setup does not align especially well with the current user profile, which weakens conviction."
        : "Personal fit is acceptable but not strong enough to ignore execution and risk discipline."
    );
  }

  const title =
    decision === "INVEST"
      ? "What to watch"
      : decision === "MONITOR"
        ? "Why waiting may be better right now"
        : "Why avoid for now";

  const eyebrow =
    decision === "INVEST"
      ? "Key Risks Before Entering"
      : decision === "MONITOR"
        ? "What Needs to Improve"
        : "What Weakens the Case";

  return {
    title,
    eyebrow,
    tone: decision === "INVEST" ? "invest" : decision === "MONITOR" ? "monitor" : "avoid",
    items: items.slice(0, 4),
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

function mapRiskScoreToProfile(riskScore: number): UserPreferenceProfile["riskProfile"] {
  if (riskScore >= 8) return "Aggressive";
  if (riskScore <= 4) return "Conservative";
  return "Balanced";
}

function mapDurationToHorizon(duration: string): UserPreferenceProfile["timeHorizon"] {
  const normalized = duration.toLowerCase();
  if (normalized.includes("1-3 month") || normalized.includes("3 month")) return "0-6m";
  if (normalized.includes("24") || normalized.includes("18") || normalized.includes("12")) return "2y+";
  return "6-24m";
}

function describeIncomePreference(incomePreference?: boolean): string | undefined {
  if (incomePreference === undefined) return undefined;
  return incomePreference ? "Income / stability tilt" : "Growth / appreciation tilt";
}

export function buildProfileFit(
  strategy: AssetStrategy,
  decision: Decision,
  userPreferences?: UserPreferenceProfile | null,
): ProfileFitModel {
  const strategyRiskProfile = mapRiskScoreToProfile(strategy.riskScore);
  const strategyHorizon = mapDurationToHorizon(strategy.investmentStrategy.plan.duration);
  const strategyIncomeTilt =
    strategy.investmentStrategy.recommendedMethod === "Wait" || strategy.riskScore <= 4
      ? true
      : strategy.riskScore >= 7 || strategy.investmentStrategy.recommendedMethod === "Lump Sum"
        ? false
        : undefined;

  const effectivePreferences = userPreferences ?? null;
  const displayedRiskProfile = effectivePreferences?.riskProfile ?? strategyRiskProfile;
  const displayedTimeHorizon = effectivePreferences?.timeHorizon ?? strategy.investmentStrategy.plan.duration;
  const displayedIncomePreference = describeIncomePreference(effectivePreferences?.incomePreference);

  let score = effectivePreferences ? 58 : 52;
  const notes: string[] = [];

  const riskAligned = effectivePreferences ? effectivePreferences.riskProfile === strategyRiskProfile : false;
  if (effectivePreferences) {
    if (riskAligned) {
      score += 18;
      notes.push(`Risk profile aligns well: this setup behaves closer to a ${strategyRiskProfile.toLowerCase()} mandate than a mismatched risk bucket.`);
    } else {
      const riskMismatchPenalty =
        (effectivePreferences.riskProfile === "Conservative" && strategyRiskProfile === "Aggressive") ||
        (effectivePreferences.riskProfile === "Aggressive" && strategyRiskProfile === "Conservative")
          ? 22
          : 12;
      score -= riskMismatchPenalty;
      notes.push(`Risk profile is only partially aligned: the asset setup looks ${strategyRiskProfile.toLowerCase()}, while the user profile is ${effectivePreferences.riskProfile.toLowerCase()}.`);
    }
  } else {
    notes.push(`Risk fit is inferred from the strategy risk score (${strategy.riskScore}/10), which maps closest to a ${strategyRiskProfile.toLowerCase()} investor profile.`);
  }

  const horizonAligned = effectivePreferences ? effectivePreferences.timeHorizon === strategyHorizon : false;
  if (effectivePreferences) {
    if (horizonAligned) {
      score += 14;
      notes.push(`Time horizon fits cleanly: the recommended ${strategy.investmentStrategy.plan.duration.toLowerCase()} execution window matches the user's stated horizon.`);
    } else {
      score -= effectivePreferences.timeHorizon === "0-6m" && strategyHorizon === "2y+" ? 18 : 10;
      notes.push(`Time horizon is not fully aligned: this idea is framed for ${strategy.investmentStrategy.plan.duration.toLowerCase()}, which may not suit the user's current window.`);
    }
  } else {
    notes.push(`Time-horizon fit is estimated from the recommendation's ${strategy.investmentStrategy.plan.duration.toLowerCase()} execution window.`);
  }

  if (effectivePreferences?.incomePreference !== undefined) {
    if (strategyIncomeTilt === undefined) {
      notes.push("Income versus growth preference remains mixed here, so it is not a major fit driver.");
    } else if (effectivePreferences.incomePreference === strategyIncomeTilt) {
      score += 8;
      notes.push(`Income versus growth preference is aligned with the strategy's ${strategyIncomeTilt ? "stability" : "growth"} bias.`);
    } else {
      score -= 8;
      notes.push(`Income versus growth preference is not ideal for this setup because the strategy leans ${strategyIncomeTilt ? "stability" : "growth"} while the user prefers the opposite tilt.`);
    }
  } else {
    notes.push(
      strategy.investmentStrategy.recommendedMethod === "DCA"
        ? "Execution style favors gradual deployment, which usually fits users comfortable building exposure over time."
        : strategy.investmentStrategy.recommendedMethod === "Wait"
          ? "Execution style favors patience, so suitability depends on whether the user is comfortable delaying deployment."
          : "Execution style is more direct, which generally suits users comfortable acting on a defined setup."
    );
  }

  if (strategy.riskScore >= 8 || decision === "AVOID") {
    score -= 8;
    notes.push("Elevated downside and volatility keep the fit capped unless the user explicitly tolerates higher-risk setups.");
  } else if (strategy.riskScore <= 4 && decision === "INVEST") {
    score += 6;
    notes.push("Calmer risk characteristics improve fit for users who value smoother execution and lower interim drawdowns.");
  }

  score = Math.max(18, Math.min(92, score));

  let fit: ProfileFitLevel = "Moderate fit";
  if (score >= 76) fit = "Strong fit";
  else if (score <= 42) fit = "Weak fit";

  return {
    fit,
    score,
    riskProfile: displayedRiskProfile,
    timeHorizon: displayedTimeHorizon,
    incomePreference: displayedIncomePreference,
    notes: notes.slice(0, 4),
    profileComplete:
      Boolean(effectivePreferences) &&
      effectivePreferences?.incomePreference !== undefined,
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
