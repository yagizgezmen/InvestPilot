"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Coins, BarChart3, Gem, LayoutDashboard, Settings, Brain, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useWatchlist } from "@/components/WatchlistProvider";

export default function Home() {
  const { watchlist } = useWatchlist();

  const assetLinks = [
    {
      name: "Crypto",
      path: "/crypto",
      icon: Coins,
      chip: "High Beta",
      border: "border-blue-500/30",
      iconClass: "text-blue-400",
      iconBg: "bg-blue-500/15 border-blue-400/40",
      glow: "from-blue-500/20 to-transparent",
      description: "Track momentum, volatility, and regime shifts across BTC, ETH, and major altcoins.",
    },
    {
      name: "US Stocks",
      path: "/us-stocks",
      icon: BarChart3,
      chip: "Balanced",
      border: "border-cyan-500/30",
      iconClass: "text-cyan-400",
      iconBg: "bg-cyan-500/15 border-cyan-400/40",
      glow: "from-cyan-500/20 to-transparent",
      description: "Analyze trend strength and drawdown dynamics across large-cap U.S. stocks.",
    },
    {
      name: "Precious Metals",
      path: "/precious-metals",
      icon: Gem,
      chip: "Defensive",
      border: "border-amber-500/30",
      iconClass: "text-amber-400",
      iconBg: "bg-amber-500/15 border-amber-400/40",
      glow: "from-amber-500/25 to-transparent",
      description: "Evaluate gold and metals as inflation hedges with risk-aware execution context.",
    },
    {
      name: "TR Stocks",
      path: "/tr-stocks",
      icon: LayoutDashboard,
      chip: "Regional",
      border: "border-red-500/30",
      iconClass: "text-red-400",
      iconBg: "bg-red-500/15 border-red-400/40",
      glow: "from-red-500/20 to-transparent",
      description: "Follow Turkish market opportunities with cleaner risk and timing signals.",
    },
  ] as const;

  return (
    <div className="space-y-12 animate-fade-in relative z-10 w-full pb-16">
      <PageHeader
        title="Investment Command Center"
        subtitle="Select a market and jump straight into actionable analysis flows."
        actions={
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-black uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            Market Intelligence
          </div>
        }
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-black tracking-tight">Market Sections</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Routes unchanged • UI improved</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assetLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link href={link.path} key={link.name} className="group">
                <Card
                  glass
                  className={`p-8 h-full min-h-[220px] ${link.border} bg-card/40 hover:bg-card/60 hover:border-primary/40 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.glow} opacity-40`} />
                  <div className="absolute -right-10 -bottom-10 opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300">
                    <Icon className={`h-44 w-44 ${link.iconClass}`} />
                  </div>
                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="space-y-3">
                      <div className={`inline-flex p-3 rounded-xl border shadow-[0_0_0_1px_rgba(59,130,246,0.1)] ${link.iconBg}`}>
                        <Icon className={`h-6 w-6 ${link.iconClass}`} />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">{link.name}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{link.chip}</Badge>
                  </div>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                    Open Market <ArrowRight className="h-4 w-4" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card glass className="p-7 border-border/40 min-h-[220px]">
          <h3 className="text-xl font-black mb-4 tracking-tight">Watchlist Snapshot</h3>
          {watchlist.length === 0 ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your watchlist is currently empty. Open any market card above and add assets to start tracking.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You are tracking <span className="text-foreground font-black">{watchlist.length}</span> assets.
              </p>
              <div className="flex flex-wrap gap-2">
                {watchlist.map((w) => (
                  <span key={w} className="px-3 py-1.5 bg-secondary/50 rounded-lg border border-border/40 text-xs font-bold">
                    {w}
                  </span>
                ))}
              </div>
              <Link href="/opportunities" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                Rank my watchlist <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </Card>

        <Card glass className="p-7 border-border/40 min-h-[220px] bg-gradient-to-br from-background via-secondary/20 to-secondary/40">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black tracking-tight">Strategy & AI Tools</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use Methodology and AI Advisor to convert market signals into clearer execution plans.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/method" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 text-primary border border-primary/30 text-sm font-bold hover:bg-primary/20 transition-colors">
                  Open Method <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/ai-advisor" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-sm font-bold hover:bg-indigo-500/20 transition-colors">
                  <Brain className="h-4 w-4" />
                  AI Advisor
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
