export type AssetClass = "Crypto" | "Precious Metals" | "US Stocks" | "TR Stocks";

export interface Asset {
  ticker: string;
  name: string;
  assetClass: AssetClass;
}

export interface MarketQuote {
  price: number;
  changePct: number;
  high?: number;
  low?: number;
  volume?: number;
  timestamp: string;
  currency: string;
}

export interface MarketHistoryItem {
  time: string; // ISO date string
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
  // Fallback for simple charts:
  price?: number;
}

export interface MarketData {
  ticker: string;
  currentPrice: number; // mapped from quote
  changePct?: number;
  currency: "USD" | "TRY" | string;
  history: MarketHistoryItem[];
  error?: string;
  stale?: boolean; // Indicates if data is served from stale cache
}

export type ChartTimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "All";
export type ChartDisplayType = "line" | "area" | "candlestick" | "baseline";

export type RiskProfile = "Conservative" | "Balanced" | "Aggressive";
export type TimeHorizon = "0-6m" | "6-24m" | "2y+";
export type RecommendationFactorKey =
  | "trendStrength"
  | "shortTermMomentum"
  | "mediumTermMomentum"
  | "volatilityRisk"
  | "drawdownRisk"
  | "structuralTrendAlignment"
  | "dataQuality";

export interface RecommendationFactorBreakdown {
  key: RecommendationFactorKey;
  label: string;
  rawValue: string;
  normalizedScore: number;
  weight: number;
  weightedContribution: number;
  impact: "Positive" | "Neutral" | "Negative";
  summary: string;
}

export interface RecommendationScoreResult {
  score: number;
  confidence: "Low" | "Medium" | "High";
  factors: RecommendationFactorBreakdown[];
  dominantDrivers: string[];
  cautionFlags: string[];
  context: {
    riskProfile: RiskProfile;
    timeHorizon: TimeHorizon;
  };
}

export interface ExpectedReturnOutlook {
  summary: string;
  confidence: "Low" | "Medium" | "High";
  bullishCase: string;
  baseCase: string;
  bearishCase: string;
  methodologyNote: string;
}

export interface RecommendationConstraints {
  avoidCrypto?: boolean;
  preferTry?: boolean;
  incomePreference?: boolean;
}

export interface Explainability {
  drivers: string[];
  metricsSnapshot: Record<string, string>;
  assumptions: string;
}

export interface RecommendationResponse {
  approach: string;
  confidence: "Low" | "Medium" | "High";
  dcaAmount?: number;
  dcaFrequency?: string;
  why: string[];
  assumptions: string[];
  disclaimer: string;
  explainability: Explainability;
  allocation?: Record<string, number>;
}

export interface BestOpportunityResponse {
  ranked: Asset[];
  explanations: Record<string, string>;
  correlationMatrix?: Record<string, Record<string, number>>;
}

export type SectorTrend = "Bullish" | "Neutral" | "Bearish";
export type AssetTrend = "Up" | "Neutral" | "Down";
export type AssetAction = "BUY" | "HOLD" | "DCA" | "SELL";
export type InvestmentDecision = "INVEST" | "AVOID" | "MONITOR";

export interface AssetAnalysis {
  ticker: string;
  name: string;
  trend: AssetTrend;
  action: AssetAction;
  rationale: string;
}

export type RecommendationMethod = "DCA" | "Staged Entry" | "Lump Sum" | "Wait";
export type PositionSizing = "Small" | "Medium" | "Large";
export type Cadence = "Weekly" | "Biweekly" | "Monthly";

export interface InvestmentStrategy {
  title: string;
  recommendedMethod: RecommendationMethod;
  plan: {
    cadence: Cadence;
    duration: string;
    positionSizing: PositionSizing;
    riskManagement: string[];
  };
  pros: string[];
  cons: string[];
  whyThis: string[];
  assumptions: string[];
  limitations: string[];
  disclaimer: string;
}

export interface MarketContext {
  summary: string;
  bullets: string[];
  metricsSnapshot: {
    return_1m: number;
    return_6m: number;
    volatility: number;
    maxDrawdown: number;
    trend: "Uptrend" | "Downtrend" | "Sideways";
  };
}

export interface AdvancedRecommendationResponse {
  instrument: {
    symbol: string;
    market: string;
    name: string;
  };
  marketContext: MarketContext;
  investmentStrategy: InvestmentStrategy;
  confidence: "Low" | "Medium" | "High";
  score: number; // 0-100
  factorBreakdown?: RecommendationFactorBreakdown[];
}

export interface SectorAnalysisResponse extends AdvancedRecommendationResponse {
  sector: string;
  assets: AssetAnalysis[];
  disclaimer: string;
  // Legacy fields to prevent breaking existing UI
  investmentDecision: InvestmentDecision;
  decisionRationale: string;
  summary: string;
}

export interface AssetStrategy {
  ticker: string;
  name: string;
  assetClass: AssetClass;
  strategyName: string; // e.g. "Long-term Accumulation"
  riskScore: number; // 1-10
  expectedReturn: string;
  entryZones: string[];
  exitZones: string[];
  allocationAdvice: string;
  detailedRationale: string;
  technicalFactors: string[];
  fundamentalFactors: string[];
  investmentStrategy: InvestmentStrategy;
  factorBreakdown?: RecommendationFactorBreakdown[];
  expectedReturnOutlook?: ExpectedReturnOutlook;
  scoringContext?: RecommendationScoreResult["context"];
  scoreConfidence?: RecommendationScoreResult["confidence"];
  dominantDrivers?: string[];
  cautionFlags?: string[];
}
