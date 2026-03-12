"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Asset, AssetStrategy, MarketData } from "@/types";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import PriceChart from "@/components/PriceChart";
import {
  ArrowLeft,
  ArrowRight,
  CircleDot,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Eye,
  BarChart3,
  Target,
  ListTree,
} from "lucide-react";
import clsx from "clsx";

type Decision = "INVEST" | "AVOID" | "MONITOR";

interface StrategyExperienceProps {
  ticker: string;
  parentTicker?: string;
  detailMode?: boolean;
}

function deriveDecision(strategy: AssetStrategy, marketData: MarketData | null): Decision {
  const change = marketData?.changePct ?? 0;

  if (strategy.riskScore >= 8 && change < 0) return "AVOID";
  if (strategy.riskScore <= 5 && change > -3) return "INVEST";
  return "MONITOR";
}

function decisionTheme(decision: Decision) {
  if (decision === "INVEST") {
    return {
      badge: "success" as const,
      icon: TrendingUp,
      label: "Invest",
      caption: "Momentum/risk profile is acceptable for staged execution.",
      cardClass: "border-success/40 bg-success/5",
    };
  }

  if (decision === "AVOID") {
    return {
      badge: "destructive" as const,
      icon: TrendingDown,
      label: "Do Not Invest",
      caption: "Risk and downside profile are not attractive right now.",
      cardClass: "border-destructive/40 bg-destructive/5",
    };
  }

  return {
    badge: "warning" as const,
    icon: Eye,
    label: "Monitor",
    caption: "Setup is mixed; wait for stronger confirmation.",
    cardClass: "border-warning/40 bg-warning/5",
  };
}

export default function StrategyExperience({ ticker, parentTicker, detailMode = false }: StrategyExperienceProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<AssetStrategy | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [relatedAssets, setRelatedAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stratRes, marketRes] = await Promise.all([
          fetch(`/api/strategy/${ticker}`),
          fetch(`/api/market-data?ticker=${ticker}`),
        ]);

        const stratJson = await stratRes.json();
        const marketJson = await marketRes.json();

        const fetchedStrategy = stratJson?.strategy as AssetStrategy | undefined;
        if (!fetchedStrategy) {
          setStrategy(null);
          return;
        }

        setStrategy(fetchedStrategy);
        if (marketJson && !marketJson.error) setMarketData(marketJson);

        const relatedRes = await fetch(
          `/api/search?q=&assetClass=${encodeURIComponent(fetchedStrategy.assetClass)}`,
        );
        const relatedJson = (await relatedRes.json()) as Asset[];
        setRelatedAssets(
          relatedJson
            .filter((asset) => asset.ticker !== fetchedStrategy.ticker)
            .slice(0, 8),
        );
      } catch (error) {
        console.error("Failed to load strategy details", error);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) fetchData();
  }, [ticker]);

  const decision = useMemo(() => {
    if (!strategy) return "MONITOR" as Decision;
    return deriveDecision(strategy, marketData);
  }, [strategy, marketData]);

  const theme = decisionTheme(decision);
  const DecisionIcon = theme.icon;
  const baseTicker = parentTicker ?? ticker;

  const whyNotInvest = useMemo(() => {
    if (!strategy) return [];
    return [...strategy.investmentStrategy.cons, ...strategy.investmentStrategy.limitations].slice(0, 4);
  }, [strategy]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in pb-20">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="h-[560px] lg:col-span-5" />
          <Skeleton className="h-[560px] lg:col-span-7" />
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-black">Strategy Not Found</h1>
        <button onClick={() => router.back()} className="btn-premium">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-32">
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (parentTicker) {
              router.push(`/strategy/${parentTicker}`);
            } else {
              router.back();
            }
          }}
          className="p-2 rounded-full hover:bg-secondary/50 transition-colors border border-border/40"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-sm font-black text-muted-foreground uppercase tracking-widest bg-secondary/30 px-3 py-1 rounded-md border border-border/20">
          Investment Strategy Engine
        </div>
      </div>

      <PageHeader
        title={`${strategy.ticker} Strategy`}
        subtitle={`${strategy.name} • ${strategy.assetClass}${detailMode ? " • Detailed Analysis" : ""}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card glass className={clsx("p-6 space-y-4", theme.cardClass)}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <DecisionIcon className="h-5 w-5" />
                <h3 className="text-lg font-black">Decision</h3>
              </div>
              <Badge variant={theme.badge}>{theme.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{theme.caption}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/30 p-3 bg-background/30">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Risk Score</div>
                <div className="text-2xl font-black mt-1">{strategy.riskScore}/10</div>
              </div>
              <div className="rounded-xl border border-border/30 p-3 bg-background/30">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Expected Return</div>
                <div className="text-sm font-black mt-2">{strategy.expectedReturn}</div>
              </div>
            </div>
          </Card>

          <Card glass className="p-6 space-y-4 border-border/40">
            <div className="flex items-center gap-2">
              <ListTree className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-black">Why Not Invest (Now)</h3>
            </div>
            <ul className="space-y-3">
              {whyNotInvest.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CircleDot className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card glass className="p-6 space-y-4 border-border/40">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-black">Related Assets ({strategy.assetClass})</h3>
            </div>
            <div className="space-y-2">
              {relatedAssets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No related assets found.</p>
              ) : (
                relatedAssets.map((asset) => (
                  <Link
                    key={asset.ticker}
                    href={`/strategy/${baseTicker}/asset/${asset.ticker}`}
                    className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    <div>
                      <p className="font-black text-sm">{asset.ticker}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-48">{asset.name}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <Card glass className="p-6 border-border/40">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black">Price Graph</h3>
              </div>
              <Badge variant={theme.badge}>{decision === "AVOID" ? "Do Not Invest" : decision}</Badge>
            </div>
            <div className="h-[360px]">
              {marketData ? (
                <PriceChart data={marketData} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Market data unavailable.
                </div>
              )}
            </div>
          </Card>

          <Card glass className="p-6 border-border/40 space-y-4">
            <h3 className="text-lg font-black">Execution Snapshot</h3>
            <p className="text-sm text-muted-foreground">{strategy.detailedRationale}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/30 p-3 bg-background/30">
                <div className="text-[11px] uppercase text-muted-foreground">Method</div>
                <div className="font-black text-sm mt-1">{strategy.investmentStrategy.recommendedMethod}</div>
              </div>
              <div className="rounded-xl border border-border/30 p-3 bg-background/30">
                <div className="text-[11px] uppercase text-muted-foreground">Cadence</div>
                <div className="font-black text-sm mt-1">{strategy.investmentStrategy.plan.cadence}</div>
              </div>
              <div className="rounded-xl border border-border/30 p-3 bg-background/30">
                <div className="text-[11px] uppercase text-muted-foreground">Position Size</div>
                <div className="font-black text-sm mt-1">{strategy.investmentStrategy.plan.positionSizing}</div>
              </div>
              <div className="rounded-xl border border-border/30 p-3 bg-background/30">
                <div className="text-[11px] uppercase text-muted-foreground">Allocation</div>
                <div className="font-black text-sm mt-1">{strategy.allocationAdvice}</div>
              </div>
            </div>
          </Card>

          {detailMode && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card glass className="p-6 border-border/40 space-y-3">
                  <h3 className="text-base font-black">Technical Factors</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {strategy.technicalFactors.map((factor, idx) => (
                      <li key={`${factor}-${idx}`} className="flex items-start gap-2">
                        <CircleDot className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card glass className="p-6 border-border/40 space-y-3">
                  <h3 className="text-base font-black">Fundamental Drivers</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {strategy.fundamentalFactors.map((factor, idx) => (
                      <li key={`${factor}-${idx}`} className="flex items-start gap-2">
                        <CircleDot className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              <Card glass className="p-6 border-border/40">
                <h3 className="text-base font-black mb-4">Entry / Exit Zones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-success/30 bg-success/5 p-4 space-y-2">
                    <p className="text-xs font-black uppercase tracking-wide text-success">Entry Zones</p>
                    {strategy.entryZones.map((zone, idx) => (
                      <p key={`${zone}-${idx}`} className="text-sm font-medium">{zone}</p>
                    ))}
                  </div>
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                    <p className="text-xs font-black uppercase tracking-wide text-destructive">Exit Zones</p>
                    {strategy.exitZones.map((zone, idx) => (
                      <p key={`${zone}-${idx}`} className="text-sm font-medium">{zone}</p>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
