import type { BadgeProps } from "@/components/ui/Badge";
import type { AssetStrategy, MarketData } from "@/types";
import type { LucideIcon } from "lucide-react";

export type Decision = "INVEST" | "AVOID" | "MONITOR";
export type DriverStatus = "Positive" | "Neutral" | "Cautious";
export type RiskLevel = "Low" | "Moderate" | "High";
export type ProfileFitLevel = "Strong fit" | "Moderate fit" | "Weak fit";

export interface UserPreferenceProfile {
  riskProfile: "Conservative" | "Balanced" | "Aggressive";
  timeHorizon: "0-6m" | "6-24m" | "2y+";
  incomePreference?: boolean;
}

export interface RecommendationDriver {
  title: string;
  status: DriverStatus;
  explanation: string;
  theme: "trend" | "momentum" | "volatility" | "market" | "attractiveness" | "portfolio";
}

export interface DecisionSupportItem {
  title: string;
  status: DriverStatus;
  explanation: string;
}

export interface DecisionSupportModel {
  title: string;
  eyebrow: string;
  tone: "invest" | "monitor" | "avoid";
  items: DecisionSupportItem[];
}

export interface RiskOverviewModel {
  level: RiskLevel;
  score: number;
  volatilitySummary: string;
  downsideSummary: string;
  timeSuitability: string;
  notSuitableFor: string;
}

export interface DecisionHeroModel {
  assetName: string;
  ticker: string;
  assetClass: string;
  currentPrice: string;
  shortTermPerformance: string;
  recommendationLabel: "Strong Buy" | "Buy" | "Accumulate" | "Hold" | "Reduce" | "Avoid";
  confidenceBand: "High" | "Medium" | "Low";
  riskBadge: RiskLevel;
  timeHorizon: string;
  summary: string;
}

export interface ActionPlanModel {
  recommendedAction: "Buy now" | "Staged entry" | "Hold" | "Wait" | "Reduce";
  suggestedApproach: string;
  allocationRange: string;
  monitoringTrigger: string;
  implementationSummary: string;
}

export interface ProfileFitModel {
  fit: ProfileFitLevel;
  score: number;
  riskProfile: string;
  timeHorizon: string;
  incomePreference?: string;
  notes: string[];
  profileComplete: boolean;
}

export interface MethodologyModel {
  summary: string;
  factors: string[];
  latestDataTimestamp: string;
  limitations: string[];
  missingDataWarning?: string;
  disclosure: string;
}

export interface RecommendationTheme {
  badge: NonNullable<BadgeProps["variant"]>;
  icon: LucideIcon;
  label: string;
  caption: string;
  cardClass: string;
}

export interface RecommendationViewModel {
  strategy: AssetStrategy;
  marketData: MarketData | null;
  decision: Decision;
  theme: RecommendationTheme;
  hero: DecisionHeroModel | null;
  riskOverview: RiskOverviewModel | null;
  actionPlan: ActionPlanModel;
  profileFit: ProfileFitModel;
  userPreferences: UserPreferenceProfile | null;
  methodology: MethodologyModel;
  recommendationDrivers: RecommendationDriver[];
  decisionSupport: DecisionSupportModel;
  disclosureItems: string[];
}
