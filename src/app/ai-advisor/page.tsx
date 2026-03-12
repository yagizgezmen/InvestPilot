"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Brain, Sparkles, Target } from "lucide-react";
import Link from "next/link";

export default function AIAdvisorPage() {
  return (
    <div className="space-y-10 pb-24">
      <PageHeader
        title="AI Advisor"
        subtitle="This page is intentionally kept lightweight. Strategy-specific decision views live in Deep Dive Strategy."
      />

      <Card glass className="overflow-hidden rounded-[32px] border-border/40 bg-card/35 p-0 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.92)]">
        <div className="border-b border-border/30 px-8 py-6 sm:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-primary/20 bg-primary/10 text-primary">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60">
                Advisor
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">
                Strategy views now live on asset deep dives
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-8 sm:p-10">
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            Recommendation-focused decision UI has been moved to the strategy flow so it appears exactly where users click
            <span className="font-black text-foreground"> Deep Dive Strategy</span>. This keeps the advisor page out of the main investment workflow.
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Recommendation UI moved
            </Badge>
            <Badge variant="outline">
              <Target className="mr-2 h-3.5 w-3.5" />
              Use Strategy pages
            </Badge>
          </div>

          <Link
            href="/strategy/BTC"
            className="inline-flex items-center rounded-2xl border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-black text-primary transition-colors hover:bg-primary/15"
          >
            Open Example Strategy
          </Link>
        </div>
      </Card>
    </div>
  );
}
