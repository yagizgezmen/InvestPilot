import { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import PriceChart from "@/components/PriceChart";
import type { AssetStrategy, MarketData, RecommendationFactorBreakdown } from "@/types";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleDot,
  Clock3,
  Gauge,
  ListTree,
  Shield,
  ShieldAlert,
  Target,
  TriangleAlert,
  Waves,
} from "lucide-react";
import clsx from "clsx";
import type {
  ActionPlanModel,
  Decision,
  DecisionHeroModel,
  DecisionSupportModel,
  MethodologyModel,
  ProfileFitLevel,
  ProfileFitModel,
  RecommendationDriver,
  RecommendationTheme,
  RiskLevel,
  RiskOverviewModel,
} from "./types";
import { getDriverThemeIcon } from "./utils";

interface WorkspaceSectionProps {
  title: string;
  eyebrow: string;
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
  tone?: "default" | "risk" | "action";
}

interface DetailAnalysisSectionProps {
  strategy: AssetStrategy;
}

interface MethodologySummaryCardProps {
  methodology: MethodologyModel;
  disclosureItems: string[];
  onOpen: () => void;
}

interface MethodologyDrawerProps {
  isOpen: boolean;
  methodology: MethodologyModel;
  onClose: () => void;
}

interface FactorBreakdownCardProps {
  factors: RecommendationFactorBreakdown[];
  methodology: MethodologyModel;
}

interface DecisionSupportCardProps {
  section: DecisionSupportModel;
}

interface ChartWorkspaceCardProps {
  data: MarketData | null;
  decision: Decision;
  assetName: string;
  theme: RecommendationTheme;
}

interface DecisionHeroProps {
  hero: DecisionHeroModel | null;
  strategy: AssetStrategy;
  theme: RecommendationTheme;
}

interface RiskOverviewCardProps {
  riskOverview: RiskOverviewModel;
  riskScore: number;
}

interface RationaleListProps {
  drivers: RecommendationDriver[];
}

interface ActionPlanCardProps {
  actionPlan: ActionPlanModel;
  theme: RecommendationTheme;
  strategy: AssetStrategy;
}

interface ProfileFitCardProps {
  profileFit: ProfileFitModel;
}

function DriverBadge({ status }: { status: RecommendationDriver["status"] }) {
  const classes: Record<RecommendationDriver["status"], string> = {
    Positive: "border-success/25 bg-success/10 text-success",
    Neutral: "border-border/40 bg-secondary/40 text-muted-foreground",
    Cautious: "border-warning/25 bg-warning/10 text-warning",
  };

  return (
    <span className={clsx("rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]", classes[status])}>
      {status}
    </span>
  );
}

function RiskMeter({ level, score }: { level: RiskLevel; score: number }) {
  const barClass = level === "High" ? "bg-destructive" : level === "Low" ? "bg-success" : "bg-warning";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          Risk Level
        </span>
        <span className="text-sm font-black">{level}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary/50">
        <div className={clsx("h-full rounded-full", barClass)} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        Qualitative risk gauge for this strategy setup, not a precise numeric risk metric.
      </p>
    </div>
  );
}

function FitMeter({ fit, score }: { fit: ProfileFitLevel; score: number }) {
  const barClass = fit === "Strong fit" ? "bg-success" : fit === "Weak fit" ? "bg-destructive" : "bg-warning";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          Fit Level
        </span>
        <span className="text-sm font-black">{fit}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary/50">
        <div className={clsx("h-full rounded-full", barClass)} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        Personal fit gauge based on current risk and time-horizon information.
      </p>
    </div>
  );
}

function BulletList({ items, accent = "text-primary" }: { items: string[]; accent?: string }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-start gap-3">
          <CircleDot className={clsx("mt-1 h-4 w-4 shrink-0", accent)} />
          <p className="text-sm leading-7 text-muted-foreground">{item}</p>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceSection({ title, eyebrow, icon: Icon, children, tone = "default" }: WorkspaceSectionProps) {
  return (
    <Card
      glass
      className={clsx(
        "overflow-hidden rounded-[24px] border-border/40 bg-card/35 p-0 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.98)] sm:rounded-[28px]",
        tone === "risk" && "border-warning/20",
        tone === "action" && "border-primary/20",
      )}
    >
      <div className="border-b border-border/30 px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={clsx(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border sm:h-12 sm:w-12",
              tone === "risk"
                ? "border-warning/20 bg-warning/10 text-warning"
                : tone === "action"
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border/40 bg-background/30 text-foreground",
            )}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60">{eyebrow}</div>
            <h3 className="mt-1 text-lg font-black tracking-tight text-foreground sm:text-xl">{title}</h3>
          </div>
        </div>
      </div>
      <div className="px-5 py-5 sm:px-8 sm:py-7">{children}</div>
    </Card>
  );
}

export function DecisionHero({ hero, strategy, theme }: DecisionHeroProps) {
  const DecisionIcon = theme.icon;

  return (
    <Card glass className="overflow-hidden rounded-[26px] border-border/40 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.74))] p-0 shadow-[0_26px_70px_-34px_rgba(15,23,42,0.98)] sm:rounded-[34px]">
      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[1.7fr_0.95fr]">
        <div className="border-b border-border/30 p-5 sm:p-8 xl:border-b-0 xl:border-r xl:p-10">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Badge variant="outline" className="max-w-full px-3 py-1.5 text-[10px] tracking-[0.18em] sm:px-4 sm:py-2 sm:tracking-[0.2em]">
              {hero?.assetClass ?? strategy.assetClass}
            </Badge>
            <Badge variant="outline" className="max-w-full px-3 py-1.5 text-[10px] tracking-[0.18em] sm:px-4 sm:py-2 sm:tracking-[0.2em]">
              {hero?.ticker ?? strategy.ticker}
            </Badge>
            <Badge variant="outline" className="max-w-full px-3 py-1.5 text-[10px] tracking-[0.18em] sm:px-4 sm:py-2 sm:tracking-[0.2em]">
              {strategy.strategyName}
            </Badge>
          </div>

          <div className="mt-5 flex items-start gap-4 sm:mt-6 sm:gap-5">
            <div className={clsx("flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] border sm:h-16 sm:w-16 sm:rounded-[24px]", theme.cardClass)}>
              <DecisionIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/70">Decision Hero</div>
              <h2 className="mt-2 break-words text-[2rem] font-black tracking-[-0.05em] text-foreground sm:text-4xl">
                {hero?.assetName ?? strategy.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <Badge variant={theme.badge} className="max-w-full px-3 py-1.5 text-[10px] font-black tracking-[0.18em] sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.24em]">
                  {hero?.recommendationLabel ?? theme.label}
                </Badge>
                <Badge variant="outline" className="max-w-full px-3 py-1.5 text-[10px] tracking-[0.16em] sm:tracking-[0.18em]">
                  Confidence {hero?.confidenceBand ?? "Medium"}
                </Badge>
                <Badge
                  variant={hero?.riskBadge === "High" ? "destructive" : hero?.riskBadge === "Low" ? "success" : "warning"}
                  className="max-w-full px-3 py-1.5 text-[10px] tracking-[0.16em] sm:tracking-[0.18em]"
                >
                  Risk {hero?.riskBadge ?? "Moderate"}
                </Badge>
                <Badge variant="outline" className="max-w-full px-3 py-1.5 text-[10px] tracking-[0.16em] sm:tracking-[0.18em]">
                  Horizon {hero?.timeHorizon ?? strategy.investmentStrategy.plan.duration}
                </Badge>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                {hero?.summary ?? `${theme.caption} ${strategy.detailedRationale}`}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <div className="min-w-0 rounded-3xl border border-border/30 bg-background/25 p-4 sm:p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">Current Price</div>
              <div className="mt-2 break-words text-xl font-black leading-tight text-foreground sm:text-2xl">{hero?.currentPrice ?? "Market price unavailable"}</div>
            </div>
            <div className="min-w-0 rounded-3xl border border-border/30 bg-background/25 p-4 sm:p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">Short-Term Performance</div>
              <div className="mt-2 text-sm font-black leading-6 text-foreground">{hero?.shortTermPerformance ?? "Short-term performance unavailable."}</div>
            </div>
            <div className="min-w-0 rounded-3xl border border-border/30 bg-background/25 p-4 sm:p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">Risk Score</div>
              <div className="mt-2 break-words text-xl font-black leading-tight text-foreground sm:text-2xl">{strategy.riskScore}/10</div>
            </div>
            <div className="min-w-0 rounded-3xl border border-border/30 bg-background/25 p-4 sm:p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">Expected Return</div>
              <div className="mt-2 break-words text-base font-black leading-6 text-foreground sm:text-lg">{strategy.expectedReturn}</div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 xl:p-10">
          <div className="space-y-4">
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Quick Decision Stack</div>
            <div className="rounded-3xl border border-border/30 bg-background/20 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">Recommendation</div>
                  <div className="mt-2 break-words text-xl font-black leading-tight text-foreground sm:text-2xl">{hero?.recommendationLabel ?? theme.label}</div>
                </div>
                <DecisionIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="rounded-3xl border border-border/30 bg-background/20 p-4 sm:p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">Confidence</div>
              <div className="mt-2 text-sm font-black text-foreground">{hero?.confidenceBand ?? "Medium"}</div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Confidence is inferred from risk structure and setup clarity, then expressed as a clear decision band.
              </p>
            </div>
            <div className="rounded-3xl border border-border/30 bg-background/20 p-4 sm:p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">Suggested Horizon</div>
              <div className="mt-2 text-sm font-black text-foreground">{hero?.timeHorizon ?? strategy.investmentStrategy.plan.duration}</div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                This strategy is currently framed for {strategy.investmentStrategy.plan.duration.toLowerCase()} execution, not immediate all-in deployment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function RiskOverviewCard({ riskOverview, riskScore }: RiskOverviewCardProps) {
  return (
    <WorkspaceSection title="Risk overview" eyebrow="Risk" icon={ShieldAlert} tone="risk">
      <div className="flex items-center justify-between gap-3">
        <Badge variant={riskOverview.level === "High" ? "destructive" : riskOverview.level === "Low" ? "success" : "warning"}>
          {riskOverview.level}
        </Badge>
        <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Risk score {riskScore}/10</span>
      </div>

      <div className="mt-5">
        <RiskMeter level={riskOverview.level} score={riskOverview.score} />
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl border border-border/30 bg-background/25 p-4">
          <div className="flex items-start gap-3">
            <Waves className="mt-1 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Volatility Summary</p>
              <p className="mt-1 text-sm text-muted-foreground">{riskOverview.volatilitySummary}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/25 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-1 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Downside Watch</p>
              <p className="mt-1 text-sm text-muted-foreground">{riskOverview.downsideSummary}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/25 p-4">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Time-Horizon Suitability</p>
              <p className="mt-1 text-sm text-muted-foreground">{riskOverview.timeSuitability}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/25 p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Not Suitable For</p>
              <p className="mt-1 text-sm text-muted-foreground">{riskOverview.notSuitableFor}</p>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceSection>
  );
}

export function ProfileFitCard({ profileFit }: ProfileFitCardProps) {
  return (
    <WorkspaceSection title="Profile fit" eyebrow="Suitability" icon={Gauge}>
      <div className="flex items-center justify-between gap-3">
        <Badge variant={profileFit.fit === "Strong fit" ? "success" : profileFit.fit === "Weak fit" ? "destructive" : "warning"}>
          {profileFit.fit}
        </Badge>
        <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Personal suitability</span>
      </div>

      <div className="mt-5">
        <FitMeter fit={profileFit.fit} score={profileFit.score} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <div className="rounded-2xl border border-border/30 bg-background/25 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">User Risk Profile</div>
          <p className="mt-1 text-sm font-black text-foreground">{profileFit.riskProfile}</p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/25 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Suggested Time Horizon</div>
          <p className="mt-1 text-sm font-black text-foreground">{profileFit.timeHorizon}</p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/25 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Income vs Growth Preference</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {profileFit.incomePreference ?? "Not set yet. Complete profile preferences to improve fit quality."}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <BulletList items={profileFit.notes.slice(0, 4)} />
      </div>

      {!profileFit.profileComplete && (
        <div className="mt-6 rounded-3xl border border-border/35 bg-background/25 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Profile Completion</div>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Suitability is currently inferred from available strategy signals. Add richer profile preferences later for more personalized matching.
          </p>
        </div>
      )}
    </WorkspaceSection>
  );
}

export function DecisionSupportCard({ section }: DecisionSupportCardProps) {
  const badgeVariant =
    section.tone === "invest" ? "warning" : section.tone === "monitor" ? "outline" : "destructive";
  const tone = section.tone === "avoid" ? "risk" : "default";

  return (
    <WorkspaceSection title={section.title} eyebrow={section.eyebrow} icon={ListTree} tone={tone}>
      <div className="space-y-3">
        {section.items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-2xl border border-border/30 bg-background/25 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-black text-foreground">{item.title}</div>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.explanation}</p>
              </div>
              <Badge variant={item.status === "Positive" ? "success" : item.status === "Cautious" ? badgeVariant : "outline"}>
                {item.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceSection>
  );
}

export function FactorBreakdownCard({ factors, methodology }: FactorBreakdownCardProps) {
  const visibleFactors = factors.slice(0, 6);

  return (
    <WorkspaceSection title="Factor breakdown" eyebrow="Explainability" icon={Gauge}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="px-3 py-1 text-[10px] tracking-[0.18em]">
          Confidence {methodology.confidenceBand}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 text-[10px] tracking-[0.18em]">
          {visibleFactors.length} active factors
        </Badge>
      </div>

      {visibleFactors.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-border/35 bg-background/20 p-5">
          <p className="text-sm leading-7 text-muted-foreground">
            Factor-level scoring is not available for this asset yet. The recommendation is using the broader strategy summary instead.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {visibleFactors.map((factor) => {
            const badgeVariant =
              factor.impact === "Positive" ? "success" : factor.impact === "Negative" ? "destructive" : "outline";
            const barClass =
              factor.impact === "Positive" ? "bg-success" : factor.impact === "Negative" ? "bg-destructive" : "bg-warning";

            return (
              <div key={factor.key} className="rounded-2xl border border-border/30 bg-background/25 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-foreground">{factor.label}</p>
                      <Badge variant={badgeVariant}>{factor.impact}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{factor.summary}</p>
                    <p className="mt-2 text-xs text-muted-foreground/80">{factor.rawValue}</p>
                  </div>
                  <div className="w-full sm:w-44">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                      <span>Score {Math.round(factor.normalizedScore)}</span>
                      <span>Weight {factor.weight}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary/50">
                      <div className={clsx("h-full rounded-full", barClass)} style={{ width: `${factor.normalizedScore}%` }} />
                    </div>
                    <div className="mt-2 text-right text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                      Impact {factor.weightedContribution.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WorkspaceSection>
  );
}

export function MethodologySummaryCard({ methodology, disclosureItems, onOpen }: MethodologySummaryCardProps) {
  return (
    <WorkspaceSection title="Disclosure / methodology summary" eyebrow="Guardrails" icon={BookOpen}>
      <button
        onClick={onOpen}
        className="group w-full rounded-3xl border border-border/35 bg-background/25 p-5 text-left transition-colors hover:border-primary/30 hover:bg-background/35"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Methodology / Disclosures</div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{methodology.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="px-3 py-1 text-[10px] tracking-[0.18em]">
                Latest data {methodology.latestDataTimestamp}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-[10px] tracking-[0.18em]">
                Confidence {methodology.confidenceBand}
              </Badge>
              {methodology.missingDataWarning && (
                <Badge variant="warning" className="px-3 py-1 text-[10px] tracking-[0.18em]">
                  Missing or stale data noted
                </Badge>
              )}
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/40 bg-background/40 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </button>

      <BulletList items={disclosureItems} />
    </WorkspaceSection>
  );
}

export function MethodologyDrawer({ isOpen, methodology, onClose }: MethodologyDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Methodology / Disclosures">
      <div className="space-y-8">
        <div className="rounded-3xl border border-border/35 bg-background/20 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Trust Summary</div>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{methodology.summary}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-border/35 bg-background/20 p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Confidence Band</div>
            <p className="mt-2 text-sm font-black text-foreground">{methodology.confidenceBand}</p>
          </div>
          <div className="rounded-3xl border border-border/35 bg-background/20 p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Factors</div>
            <p className="mt-2 text-sm font-black text-foreground">{methodology.factorBreakdown.length}</p>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">What this recommendation uses</div>
          <div className="mt-4">
            <BulletList items={methodology.factors} />
          </div>
        </div>

        {methodology.factorBreakdown.length > 0 && (
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Factor Contributions</div>
            <div className="mt-4 space-y-3">
              {methodology.factorBreakdown.map((factor) => (
                <div key={factor.key} className="rounded-3xl border border-border/35 bg-background/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-foreground">{factor.label}</p>
                        <Badge variant={factor.impact === "Positive" ? "success" : factor.impact === "Negative" ? "destructive" : "outline"}>
                          {factor.impact}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{factor.summary}</p>
                      <p className="mt-2 text-xs text-muted-foreground/80">{factor.rawValue}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>Weight {factor.weight}%</div>
                      <div className="mt-1">Score {Math.round(factor.normalizedScore)}</div>
                      <div className="mt-1">Impact {factor.weightedContribution.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-border/35 bg-background/20 p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Risk Profile Adjustment</div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{methodology.riskAdjustmentNote}</p>
          </div>
          <div className="rounded-3xl border border-border/35 bg-background/20 p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Time Horizon Adjustment</div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{methodology.horizonAdjustmentNote}</p>
          </div>
        </div>

        {methodology.dominantDrivers.length > 0 && (
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">What Helped the Result</div>
            <div className="mt-4">
              <BulletList items={methodology.dominantDrivers} />
            </div>
          </div>
        )}

        {methodology.cautionFlags.length > 0 && (
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">What Hurt the Result</div>
            <div className="mt-4">
              <BulletList items={methodology.cautionFlags} accent="text-warning" />
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-border/35 bg-background/20 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Latest Data Timestamp</div>
          <p className="mt-2 text-sm font-black text-foreground">{methodology.latestDataTimestamp}</p>
        </div>

        {methodology.missingDataWarning && (
          <div className="rounded-3xl border border-warning/20 bg-warning/10 p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Missing Data Warning</div>
            <p className="mt-2 text-sm leading-7 text-warning">{methodology.missingDataWarning}</p>
          </div>
        )}

        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Model Limitations</div>
          <div className="mt-4">
            <BulletList items={methodology.limitations} />
          </div>
        </div>

        {methodology.uncertaintyNotes.length > 0 && (
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Uncertainty Notes</div>
            <div className="mt-4">
              <BulletList items={methodology.uncertaintyNotes} accent="text-warning" />
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-border/35 bg-background/20 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Educational / Non-Guarantee</div>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{methodology.disclosure}</p>
        </div>
      </div>
    </Drawer>
  );
}

export function ChartWorkspaceCard({ data, decision, assetName, theme }: ChartWorkspaceCardProps) {
  return (
    <WorkspaceSection title="Market and execution chart" eyebrow="Price Context" icon={BarChart3}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-black text-foreground">Price Graph</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start here to validate trend, volatility, and execution timing before acting.
          </p>
        </div>
        <Badge variant={theme.badge} className="w-fit max-w-full px-3 py-1.5 text-[10px] tracking-[0.18em]">
          {decision === "AVOID" ? "Do Not Invest" : decision}
        </Badge>
      </div>
      <div className="h-[320px] sm:h-[360px] xl:h-[380px]">
        {data ? (
          <PriceChart data={data} assetName={assetName} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Market data unavailable.</div>
        )}
      </div>
    </WorkspaceSection>
  );
}

export function RationaleList({ drivers }: RationaleListProps) {
  return (
    <WorkspaceSection title="Why this recommendation" eyebrow="Rationale" icon={Gauge}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {drivers.map((driver, index) => {
          const DriverIcon = getDriverThemeIcon(driver.theme);

          return (
            <div
              key={`${driver.title}-${index}`}
              className="min-w-0 rounded-2xl border border-border/35 bg-background/25 p-4 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.95)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                  <DriverIcon className="h-4 w-4" />
                </div>
                <DriverBadge status={driver.status} />
              </div>
              <div className="mt-4 min-w-0">
                <h4 className="break-words text-sm font-black tracking-tight">{driver.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{driver.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </WorkspaceSection>
  );
}

export function ActionPlanCard({ actionPlan, theme, strategy }: ActionPlanCardProps) {
  return (
    <WorkspaceSection title="Action plan" eyebrow="Execution" icon={Target} tone="action">
      <div className="mb-6 rounded-3xl border border-primary/20 bg-primary/8 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Recommended Action</div>
            <div className="mt-2 break-words text-xl font-black leading-tight text-foreground sm:text-2xl">{actionPlan.recommendedAction}</div>
          </div>
          <Badge variant={theme.badge} className="w-fit max-w-full px-3 py-1.5 text-[10px] font-black tracking-[0.18em] sm:px-4 sm:py-2">
            {actionPlan.suggestedApproach}
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{actionPlan.implementationSummary}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/35 bg-background/25 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Approach</div>
          <div className="mt-2 text-sm font-black">{actionPlan.suggestedApproach}</div>
        </div>
        <div className="rounded-2xl border border-border/35 bg-background/25 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Cadence</div>
          <div className="mt-2 text-sm font-black">{strategy.investmentStrategy.plan.cadence}</div>
        </div>
        <div className="rounded-2xl border border-border/35 bg-background/25 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Duration</div>
          <div className="mt-2 text-sm font-black">{strategy.investmentStrategy.plan.duration}</div>
        </div>
        <div className="rounded-2xl border border-border/35 bg-background/25 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Sizing</div>
          <div className="mt-2 text-sm font-black">{strategy.investmentStrategy.plan.positionSizing}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Suggested Allocation</div>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{actionPlan.allocationRange}</p>
        </div>
        <div className="rounded-3xl border border-border/35 bg-background/25 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Monitoring Trigger</div>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{actionPlan.monitoringTrigger}</p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-border/35 bg-background/25 p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Implementation Summary</div>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{actionPlan.implementationSummary}</p>
        <div className="mt-4">
          <BulletList items={strategy.investmentStrategy.plan.riskManagement.slice(0, 2)} />
        </div>
      </div>
    </WorkspaceSection>
  );
}

export function DetailAnalysisSection({ strategy }: DetailAnalysisSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card glass className="space-y-3 border-border/40 p-6">
          <h3 className="text-base font-black">Technical Factors</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {strategy.technicalFactors.map((factor, idx) => (
              <li key={`${factor}-${idx}`} className="flex items-start gap-2">
                <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card glass className="space-y-3 border-border/40 p-6">
          <h3 className="text-base font-black">Fundamental Drivers</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {strategy.fundamentalFactors.map((factor, idx) => (
              <li key={`${factor}-${idx}`} className="flex items-start gap-2">
                <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card glass className="border-border/40 p-6">
        <h3 className="mb-4 text-base font-black">Entry / Exit Zones</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-success/30 bg-success/5 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-success">Entry Zones</p>
            {strategy.entryZones.map((zone, idx) => (
              <p key={`${zone}-${idx}`} className="text-sm font-medium">{zone}</p>
            ))}
          </div>
          <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-destructive">Exit Zones</p>
            {strategy.exitZones.map((zone, idx) => (
              <p key={`${zone}-${idx}`} className="text-sm font-medium">{zone}</p>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}
