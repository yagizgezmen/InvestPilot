"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AssetStrategy, MarketData } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ActionPlanCard,
  ChartWorkspaceCard,
  DecisionHero,
  DetailAnalysisSection,
  MethodologyDrawer,
  MethodologySummaryCard,
  ProfileFitCard,
  RationaleList,
  RiskOverviewCard,
  WhyNotInvestCard,
} from "@/components/recommendation/RecommendationSections";
import {
  buildActionPlan,
  buildDecisionHero,
  buildDrivers,
  buildMethodology,
  buildProfileFit,
  buildRiskOverview,
  decisionTheme,
  deriveDecision,
} from "@/components/recommendation/utils";
import type { Decision, RecommendationViewModel } from "@/components/recommendation/types";
import { ArrowLeft, ShieldAlert } from "lucide-react";

interface StrategyExperienceProps {
  ticker: string;
  parentTicker?: string;
  detailMode?: boolean;
}

function buildViewModel(strategy: AssetStrategy, marketData: MarketData | null): RecommendationViewModel {
  const decision = deriveDecision(strategy, marketData);
  const theme = decisionTheme(decision);
  const riskOverview = buildRiskOverview(strategy, marketData);

  return {
    strategy,
    marketData,
    decision,
    theme,
    hero: buildDecisionHero(strategy, marketData, decision, riskOverview),
    riskOverview,
    actionPlan: buildActionPlan(strategy, decision),
    profileFit: buildProfileFit(strategy, decision),
    methodology: buildMethodology(strategy, marketData),
    recommendationDrivers: buildDrivers(strategy, marketData),
    whyNotInvest: [...strategy.investmentStrategy.cons, ...strategy.investmentStrategy.limitations].slice(0, 4),
    disclosureItems: [
      ...strategy.investmentStrategy.assumptions.slice(0, 2),
      ...strategy.investmentStrategy.limitations.slice(0, 2),
    ],
  };
}

export default function StrategyExperience({ ticker, parentTicker, detailMode = false }: StrategyExperienceProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<AssetStrategy | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [strategyResponse, marketDataResponse] = await Promise.all([
          fetch(`/api/strategy/${ticker}`),
          fetch(`/api/market-data?ticker=${ticker}`),
        ]);

        const strategyPayload = await strategyResponse.json();
        const marketDataPayload = await marketDataResponse.json();
        const fetchedStrategy = strategyPayload?.strategy as AssetStrategy | undefined;

        if (!fetchedStrategy) {
          setStrategy(null);
          return;
        }

        setStrategy(fetchedStrategy);
        if (marketDataPayload && !marketDataPayload.error) {
          setMarketData(marketDataPayload);
        }
      } catch (error) {
        console.error("Failed to load strategy details", error);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchData();
    }
  }, [ticker]);

  const viewModel = useMemo(() => {
    if (!strategy) return null;
    return buildViewModel(strategy, marketData);
  }, [strategy, marketData]);

  if (loading) {
    return (
      <div className="animate-fade-in space-y-8 pb-20">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Skeleton className="h-[560px] lg:col-span-5" />
          <Skeleton className="h-[560px] lg:col-span-7" />
        </div>
      </div>
    );
  }

  if (!strategy || !viewModel) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-black">Strategy Not Found</h1>
        <button onClick={() => router.back()} className="btn-premium">
          Go Back
        </button>
      </div>
    );
  }

  const handleBack = () => {
    if (parentTicker) {
      router.push(`/strategy/${parentTicker}`);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20 sm:space-y-8 sm:pb-32">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <button
          onClick={handleBack}
          className="rounded-full border border-border/40 p-2 transition-colors hover:bg-secondary/50"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="rounded-md border border-border/20 bg-secondary/30 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground sm:text-sm">
          Investment Strategy Engine
        </div>
      </div>

      <PageHeader
        title={`${viewModel.strategy.ticker} Strategy`}
        subtitle={`${viewModel.strategy.name} • ${viewModel.strategy.assetClass}${detailMode ? " • Detailed Analysis" : ""}`}
      />

      <DecisionHero hero={viewModel.hero} strategy={viewModel.strategy} theme={viewModel.theme} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.02fr_1.38fr] xl:gap-8">
        <div className="order-2 space-y-6 xl:order-1 xl:space-y-8">
          {viewModel.riskOverview && (
            <RiskOverviewCard
              riskOverview={viewModel.riskOverview}
              riskScore={viewModel.strategy.riskScore}
            />
          )}

          <ProfileFitCard profileFit={viewModel.profileFit} />
          <WhyNotInvestCard items={viewModel.whyNotInvest} />
          <MethodologySummaryCard
            methodology={viewModel.methodology}
            disclosureItems={viewModel.disclosureItems}
            onOpen={() => setIsMethodologyOpen(true)}
          />
        </div>

        <div className="order-1 space-y-6 xl:order-2 xl:space-y-8">
          <ChartWorkspaceCard
            data={viewModel.marketData}
            decision={viewModel.decision}
            assetName={viewModel.strategy.name}
            theme={viewModel.theme}
          />
          <RationaleList drivers={viewModel.recommendationDrivers} />
          <ActionPlanCard
            actionPlan={viewModel.actionPlan}
            theme={viewModel.theme}
            strategy={viewModel.strategy}
          />

          {detailMode && <DetailAnalysisSection strategy={viewModel.strategy} />}
        </div>
      </div>

      <MethodologyDrawer
        isOpen={isMethodologyOpen}
        methodology={viewModel.methodology}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
