"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, BarChart3, Coins, Gem, LayoutDashboard, Sparkles, Target } from "lucide-react";

const implementationRoutes = [
  {
    name: "Crypto",
    path: "/crypto",
    subtitle: "Digital assets and momentum-driven setups",
    icon: Coins,
    badge: "High volatility",
    border: "border-blue-500/30",
    iconClass: "text-blue-400",
    iconBg: "bg-blue-500/15 border-blue-400/40",
    glow: "from-blue-500/20 to-transparent",
  },
  {
    name: "US Stocks",
    path: "/us-stocks",
    subtitle: "Large-cap and growth equity execution",
    icon: BarChart3,
    badge: "Balanced",
    border: "border-cyan-500/30",
    iconClass: "text-cyan-400",
    iconBg: "bg-cyan-500/15 border-cyan-400/40",
    glow: "from-cyan-500/20 to-transparent",
  },
  {
    name: "Precious Metals",
    path: "/precious-metals",
    subtitle: "Inflation hedge and defensive exposure",
    icon: Gem,
    badge: "Defensive",
    border: "border-amber-500/30",
    iconClass: "text-amber-400",
    iconBg: "bg-amber-500/15 border-amber-400/40",
    glow: "from-amber-500/25 to-transparent",
  },
  {
    name: "TR Stocks",
    path: "/tr-stocks",
    subtitle: "Borsa Istanbul implementation workflows",
    icon: LayoutDashboard,
    badge: "Regional",
    border: "border-red-500/30",
    iconClass: "text-red-400",
    iconBg: "bg-red-500/15 border-red-400/40",
    glow: "from-red-500/20 to-transparent",
  },
] as const;

export default function MethodPage() {
  return (
    <div className="space-y-12 animate-fade-in pb-24">
      <PageHeader
        title="Implementation Center"
        subtitle="Choose a market, get invest/avoid signal with graph, then click any asset for detailed analysis page."
        actions={<Badge variant="secondary">v2 Strategy UI</Badge>}
      />

      <Card glass className="p-8 border-border/40 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-4 w-4" />
              New Flow
            </div>
            <h2 className="text-2xl font-black tracking-tight">Decision + Graph + Related Assets</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Every implementation page now includes the same structure: decision on the left, graph on the right, related assets list, and clickable deep analysis per asset.
            </p>
          </div>
          <Link
            href="/strategy/BTC"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/15 transition-colors"
          >
            <Target className="h-4 w-4" />
            Example Strategy Page
          </Link>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        {implementationRoutes.map((item) => {
          const Icon = item.icon;
          return (
            <div key={`chip-${item.name}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border/40 bg-secondary/20">
              <Icon className={`h-4 w-4 ${item.iconClass}`} />
              <span className="text-xs font-bold">{item.name}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {implementationRoutes.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.path} className="group">
              <Card
                glass
                className={`p-8 h-full min-h-[220px] ${item.border} bg-card/40 hover:bg-card/60 hover:border-primary/40 transition-all duration-300 relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.glow} opacity-40`} />
                <div className="absolute -right-10 -bottom-10 opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300">
                  <Icon className={`h-44 w-44 ${item.iconClass}`} />
                </div>
                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="space-y-3">
                    <div className={`inline-flex p-3 rounded-xl border shadow-[0_0_0_1px_rgba(59,130,246,0.1)] ${item.iconBg}`}>
                      <Icon className={`h-6 w-6 ${item.iconClass}`} />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{item.badge}</Badge>
                </div>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                  Open Implementation <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
