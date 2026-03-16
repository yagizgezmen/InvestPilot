import type {
  AssetStrategy,
  MarketData,
  RecommendationFactorBreakdown,
  RecommendationFactorKey,
} from "@/types";
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

function getFactor(strategy: AssetStrategy, key: RecommendationFactorKey): RecommendationFactorBreakdown | undefined {
  return strategy.factorBreakdown?.find((factor) => factor.key === key);
}

function getFactorStatusFromImpact(impact?: RecommendationFactorBreakdown["impact"]): DriverStatus {
  if (impact === "Positive") return "Positive";
  if (impact === "Negative") return "Cautious";
  return "Neutral";
}

function trimSentence(value: string): string {
  return value.trim().replace(/\.$/, "");
}

function buildFactorSupportExplanation(
  factor: RecommendationFactorBreakdown,
  suffix: string,
): string {
  return `${trimSentence(factor.summary)} (${factor.rawValue}). ${suffix}`;
}

function buildProfileFitSupport(profileFit: ProfileFitModel): DecisionSupportItem | null {
  if (profileFit.fit === "Strong fit") return null;

  return {
    title: "Profile Fit",
    status: profileFit.fit === "Weak fit" ? "Cautious" : "Neutral",
    explanation:
      profileFit.fit === "Weak fit"
        ? "The setup does not line up cleanly with the current user profile, which lowers conviction even if market factors improve."
        : "Personal fit is acceptable, but it is not strong enough to ignore entry discipline and ongoing risk control.",
  };
}

function buildDataQualitySupport(factor: RecommendationFactorBreakdown): DecisionSupportItem {
  return {
    title: "Data Quality",
    status: "Cautious",
    explanation: buildFactorSupportExplanation(
      factor,
      "Confidence stays lower until fresher or deeper history confirms the setup."
    ),
  };
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
  const items: DecisionSupportItem[] = [];
  const trendFactor = getFactor(strategy, "trendStrength");
  const shortMomentumFactor = getFactor(strategy, "shortTermMomentum");
  const mediumMomentumFactor = getFactor(strategy, "mediumTermMomentum");
  const volatilityFactor = getFactor(strategy, "volatilityRisk");
  const drawdownFactor = getFactor(strategy, "drawdownRisk");
  const structureFactor = getFactor(strategy, "structuralTrendAlignment");
  const dataQualityFactor = getFactor(strategy, "dataQuality");

  const investItems: Array<DecisionSupportItem | null> = [
    trendFactor
      ? {
          title: "Trend Integrity",
          status: getFactorStatusFromImpact(trendFactor.impact),
          explanation: buildFactorSupportExplanation(
            trendFactor,
            "The invest case stays valid while this trend remains intact after entry."
          ),
        }
      : null,
    volatilityFactor
      ? {
          title: "Volatility Control",
          status: getFactorStatusFromImpact(volatilityFactor.impact),
          explanation: buildFactorSupportExplanation(
            volatilityFactor,
            volatilityFactor.normalizedScore <= 45
              ? "That keeps staged sizing and disciplined execution important even with a positive recommendation."
              : "Even in a constructive setup, pullbacks can still create uneven entry quality."
          ),
        }
      : null,
    structureFactor
      ? {
          title: "Reward-to-Risk",
          status: getFactorStatusFromImpact(structureFactor.impact),
          explanation: buildFactorSupportExplanation(
            structureFactor,
            "Reward-to-risk stays healthier if price holds its current support structure and respects breakout confirmation."
          ),
        }
      : null,
    dataQualityFactor && dataQualityFactor.normalizedScore < 65
      ? buildDataQualitySupport(dataQualityFactor)
      : null,
  ];

  const monitorItems: Array<DecisionSupportItem | null> = [
    trendFactor
      ? {
          title: "Trend Confirmation",
          status: getFactorStatusFromImpact(trendFactor.impact),
          explanation: buildFactorSupportExplanation(
            trendFactor,
            "That is why the setup remains on watch instead of moving into active deployment."
          ),
        }
      : null,
    mediumMomentumFactor
      ? {
          title: "Momentum Follow-Through",
          status: getFactorStatusFromImpact(mediumMomentumFactor.impact),
          explanation: buildFactorSupportExplanation(
            mediumMomentumFactor,
            "The system needs cleaner follow-through here before it upgrades the recommendation."
          ),
        }
      : null,
    structureFactor
      ? {
          title: "Structural Setup",
          status: getFactorStatusFromImpact(structureFactor.impact),
          explanation: buildFactorSupportExplanation(
            structureFactor,
            "The moving-average stack is not strong enough yet to justify a more bullish stance."
          ),
        }
      : null,
    buildProfileFitSupport(profileFit),
  ];

  const avoidItems: Array<DecisionSupportItem | null> = [
    trendFactor
      ? {
          title: "Weak Trend",
          status: getFactorStatusFromImpact(trendFactor.impact),
          explanation: buildFactorSupportExplanation(
            trendFactor,
            "That leaves the setup without enough directional support for fresh exposure."
          ),
        }
      : null,
    drawdownFactor
      ? {
          title: "Downside Risk",
          status: getFactorStatusFromImpact(drawdownFactor.impact),
          explanation: buildFactorSupportExplanation(
            drawdownFactor,
            "The downside profile is too heavy for the current return outlook."
          ),
        }
      : null,
    volatilityFactor
      ? {
          title: "Volatility Burden",
          status: getFactorStatusFromImpact(volatilityFactor.impact),
          explanation: buildFactorSupportExplanation(
            volatilityFactor,
            "That makes timing less forgiving and weakens the case for new exposure."
          ),
        }
      : null,
    shortMomentumFactor
      ? {
          title: "Reward-to-Risk",
          status: getFactorStatusFromImpact(shortMomentumFactor.impact),
          explanation: buildFactorSupportExplanation(
            shortMomentumFactor,
            "Recent momentum is not strong enough to offset the current risk and uncertainty."
          ),
        }
      : null,
  ];

  const preferredItems =
    decision === "INVEST"
      ? investItems
      : decision === "MONITOR"
        ? monitorItems
        : avoidItems;

  preferredItems.forEach((item) => {
    if (!item) return;
    pushDecisionSupportItem(items, item.title, item.status, item.explanation);
  });

  if (items.length < 4 && dataQualityFactor && dataQualityFactor.normalizedScore < 65) {
    const dataQualityItem = buildDataQualitySupport(dataQualityFactor);
    pushDecisionSupportItem(items, dataQualityItem.title, dataQualityItem.status, dataQualityItem.explanation);
  }

  if (items.length < 4) {
    const profileItem = buildProfileFitSupport(profileFit);
    if (profileItem) {
      pushDecisionSupportItem(items, profileItem.title, profileItem.status, profileItem.explanation);
    }
  }

  if (items.length < 4 && strategy.expectedReturnOutlook) {
    pushDecisionSupportItem(
      items,
      "Return Outlook",
      decision === "AVOID" ? "Cautious" : "Neutral",
      strategy.expectedReturnOutlook.baseCase
    );
  }

  if (items.length < 4) {
    pushDecisionSupportItem(
      items,
      "Implementation Discipline",
      decision === "INVEST" ? "Neutral" : "Cautious",
      strategy.investmentStrategy.plan.riskManagement[0] ??
        strategy.investmentStrategy.limitations[0] ??
        strategy.investmentStrategy.cons[0] ??
        "Execution discipline remains important while the setup develops."
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

function formatScoringRiskProfile(
  strategy: AssetStrategy,
  userPreferences?: UserPreferenceProfile | null,
): string {
  return userPreferences?.riskProfile ?? strategy.scoringContext?.riskProfile ?? "Balanced";
}

function formatScoringHorizon(
  strategy: AssetStrategy,
  userPreferences?: UserPreferenceProfile | null,
): string {
  return userPreferences?.timeHorizon ?? strategy.scoringContext?.timeHorizon ?? "6-24m";
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

export function buildMethodology(
  strategy: AssetStrategy,
  marketData: MarketData | null,
  userPreferences?: UserPreferenceProfile | null,
  profileFit?: ProfileFitModel,
): MethodologyModel {
  const factorBreakdown = [...(strategy.factorBreakdown ?? [])].sort(
    (a, b) => b.weightedContribution - a.weightedContribution
  );
  const factors = factorBreakdown.length > 0
    ? factorBreakdown.map((factor) => `${factor.label}: ${factor.summary}`)
    : [
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

  const confidenceBand = strategy.scoreConfidence ?? strategy.expectedReturnOutlook?.confidence ?? "Medium";
  const scoringRiskProfile = formatScoringRiskProfile(strategy, userPreferences);
  const scoringHorizon = formatScoringHorizon(strategy, userPreferences);
  const riskAdjustmentNote = userPreferences
    ? `The recommendation is interpreted through a ${scoringRiskProfile.toLowerCase()} risk lens, while profile fit separately checks whether that lens matches the current user preferences.`
    : `This asset score is currently interpreted through a ${scoringRiskProfile.toLowerCase()} risk lens. Add saved preferences to personalize the fit layer further.`;
  const horizonAdjustmentNote = userPreferences
    ? `The analysis is framed around a ${scoringHorizon} horizon, which affects how momentum, structure, and volatility are weighted in the recommendation context.`
    : `The analysis currently uses a ${scoringHorizon} default horizon, so shorter- or longer-term users should treat the fit section as the personalization layer.`;
  const uncertaintyNotes = [
    missingDataWarning,
    confidenceBand === "Low"
      ? "Confidence is limited because factor agreement is weak or data quality is not strong enough."
      : confidenceBand === "Medium"
        ? "Confidence is moderate, which means the factors point in a usable direction but do not remove execution risk."
        : "Confidence is higher because the major factors are more aligned, though this still does not remove market risk.",
    ...(strategy.cautionFlags ?? []).slice(0, 2),
    profileFit && profileFit.fit !== "Strong fit"
      ? `Profile fit is ${profileFit.fit.toLowerCase()}, so personal suitability is not as strong as the market setup alone.`
      : undefined,
  ].filter((value): value is string => Boolean(value));

  return {
    summary: "This recommendation combines market context, risk framing, and implementation guidance into a single decision workspace.",
    factors,
    latestDataTimestamp: formatLatestTimestamp(marketData),
    limitations,
    missingDataWarning,
    factorBreakdown,
    confidenceBand,
    dominantDrivers: strategy.dominantDrivers ?? [],
    cautionFlags: strategy.cautionFlags ?? [],
    riskAdjustmentNote,
    horizonAdjustmentNote,
    uncertaintyNotes,
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
