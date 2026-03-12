"use client";

import Link from "next/link";
import { Coins, BarChart3, Gem, LayoutDashboard, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

const markets = [
  {
    name: "Crypto",
    path: "/crypto",
    description: "Analyze momentum and volatility across digital assets.",
    icon: Coins,
    accent: "text-blue-400",
    border: "border-blue-500/30",
    glow: "from-blue-500/15 to-transparent",
  },
  {
    name: "US Stocks",
    path: "/us-stocks",
    description: "Track large-cap trends and growth setups.",
    icon: BarChart3,
    accent: "text-cyan-400",
    border: "border-cyan-500/30",
    glow: "from-cyan-500/15 to-transparent",
  },
  {
    name: "Precious Metals",
    path: "/precious-metals",
    description: "Follow defensive assets and inflation hedges.",
    icon: Gem,
    accent: "text-amber-400",
    border: "border-amber-500/30",
    glow: "from-amber-500/15 to-transparent",
  },
  {
    name: "TR Stocks",
    path: "/tr-stocks",
    description: "Review Borsa Istanbul names and market structure.",
    icon: LayoutDashboard,
    accent: "text-red-400",
    border: "border-red-500/30",
    glow: "from-red-500/15 to-transparent",
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Investment Command Center"
        subtitle="Choose a market and move into focused analysis."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {markets.map((market) => {
          const Icon = market.icon;

          return (
            <Link key={market.path} href={market.path} className="group">
              <Card
                glass
                className={`relative overflow-hidden p-8 min-h-[220px] ${market.border} bg-card/40 hover:bg-card/60 transition-all duration-300`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${market.glow} opacity-40`} />
                <div className="absolute -right-8 -bottom-8 opacity-20 transition-transform duration-300 group-hover:scale-110">
                  <Icon className={`h-36 w-36 ${market.accent}`} />
                </div>

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="space-y-3">
                    <div className="inline-flex rounded-xl border border-border/40 bg-background/40 p-3">
                      <Icon className={`h-6 w-6 ${market.accent}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{market.name}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{market.description}</p>
                    </div>
                  </div>

                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Open Market
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
