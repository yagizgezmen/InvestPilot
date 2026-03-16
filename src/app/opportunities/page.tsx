"use client";

import { useState, useEffect } from "react";
import { Asset, RiskProfile, BestOpportunityResponse } from "@/types";
import { TrendingUp, Award, BarChart3, Info, Fingerprint } from "lucide-react";
import clsx from "clsx";
import { useWatchlist } from "@/components/WatchlistProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

export default function OpportunitiesPage() {
    const [assets, setAssets] = useState<Record<string, Asset[]>>({});
    const { watchlist, toggleWatchlist } = useWatchlist();
    const [riskProfile, setRiskProfile] = useState<RiskProfile>("Balanced");

    const [results, setResults] = useState<BestOpportunityResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/assets")
            .then(res => res.json())
            .then(data => {
                setAssets(data);
            })
            .catch(err => console.error(err));
    }, []);

    const getRankings = async () => {
        if (watchlist.length === 0) return;
        setLoading(true);
        try {
            const res = await fetch("/api/best-opportunities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ watchlist, riskProfile }),
            });
            const data = await res.json();
            setResults(data);
            setExpandedRow(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const allAssetsFlat = Object.values(assets).flat();

    return (
        <div className="space-y-8 animate-fade-in relative z-10 w-full mb-10">
            <PageHeader
                title="Best Opportunities"
                subtitle="Select assets for your watchlist and rank them based on your personalized risk profile utilizing momentum and volatility metrics."
                actions={
                    <SegmentedControl
                        options={["Conservative", "Balanced", "Aggressive"]}
                        selected={riskProfile}
                        onChange={(val) => setRiskProfile(val as RiskProfile)}
                    />
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 relative z-10">
                {/* Watchlist Selection */}
                <div className="lg:col-span-4 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <Card glass className="p-6 sm:p-8 h-[600px] flex flex-col">
                        <h3 className="text-foreground font-bold text-lg mb-5 flex items-center gap-2">
                            <Fingerprint className="h-5 w-5 text-primary" /> Watchlist
                        </h3>

                        <div className="overflow-y-auto pr-2 space-y-2.5 flex-1 hide-scrollbar">
                            {allAssetsFlat.map(asset => {
                                const isSelected = watchlist.includes(asset.ticker);
                                return (
                                    <button
                                        key={asset.ticker}
                                        onClick={() => toggleWatchlist(asset.ticker)}
                                        className={clsx(
                                            "w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 border text-left group overflow-hidden relative transform active:scale-[0.98]",
                                            isSelected
                                                ? "bg-primary/10 border-primary/50 shadow-sm"
                                                : "bg-secondary/50 border-transparent hover:bg-secondary hover:border-border hover:-translate-y-0.5"
                                        )}
                                    >
                                        {isSelected && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_var(--primary)]" />
                                        )}
                                        <div>
                                            <div className={clsx("font-bold transition-colors", isSelected ? "text-primary" : "text-foreground")}>{asset.ticker}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5 truncate w-32">{asset.name}</div>
                                        </div>
                                        <div className={clsx(
                                            "h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-300",
                                            isSelected ? "bg-primary border-primary shadow-sm" : "border-muted-foreground group-hover:border-foreground bg-transparent"
                                        )}>
                                            {isSelected && <span className="h-2 w-2 bg-primary-foreground rounded-full block" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={getRankings}
                            disabled={loading || watchlist.length < 2}
                            className="w-full mt-8 btn-premium py-4 text-base"
                        >
                            {loading ? <BarChart3 className="animate-pulse h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                            Rank Watchlist
                        </button>
                        {watchlist.length < 2 && (
                            <p className="text-xs text-center text-muted-foreground mt-3 font-medium">Select at least 2 assets</p>
                        )}
                    </Card>
                </div>

                {/* Results Area */}
                <div className="lg:col-span-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <Card glass className="overflow-hidden min-h-[600px] flex flex-col border-border/60">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 w-full p-8">
                                <Skeleton className="w-full h-12" />
                                <Skeleton className="w-full h-16" />
                                <Skeleton className="w-full h-16" />
                                <Skeleton className="w-full h-16" />
                            </div>
                        ) : results ? (
                            <div className="p-0">
                                <div className="bg-secondary/40 backdrop-blur-md border-b border-border/80 px-6 py-5 grid grid-cols-12 gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <div className="col-span-2 text-center">Rank</div>
                                    <div className="col-span-4">Asset</div>
                                    <div className="col-span-3">Class</div>
                                    <div className="col-span-3 text-right">Action</div>
                                </div>

                                <div className="divide-y divide-border/60">
                                    {results.ranked.map((asset, index) => {
                                        const isTop = index === 0;
                                        const isExpanded = expandedRow === asset.ticker;

                                        return (
                                            <div key={asset.ticker} className={clsx(
                                                "transition-all duration-300 relative group",
                                                isTop ? "bg-primary/5" : "hover:bg-secondary/60 hover:-translate-y-0.5",
                                                isExpanded ? "bg-secondary/80 border-b-transparent" : ""
                                            )}>
                                                {/* Hover Indication Border */}
                                                {!isTop && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />}

                                                <div className="px-6 py-5 grid grid-cols-12 gap-4 items-center">
                                                    <div className="col-span-2 flex justify-center">
                                                        <div className={clsx(
                                                            "h-11 w-11 rounded-xl flex items-center justify-center font-black text-[15px] transition-all shadow-sm tabular-nums",
                                                            isTop ? "bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/20" : "bg-background text-muted-foreground border border-border group-hover:border-primary/50 group-hover:text-foreground"
                                                        )}>
                                                            #{index + 1}
                                                        </div>
                                                    </div>

                                                    <div className="col-span-4 flex flex-col pl-2">
                                                        <span className="font-extrabold text-foreground text-lg tracking-wide">{asset.ticker}</span>
                                                        <span className="text-xs text-muted-foreground mt-1 truncate">{asset.name}</span>
                                                    </div>

                                                    <div className="col-span-3">
                                                        <Badge variant="outline" className="px-3 py-1 font-semibold">{asset.assetClass}</Badge>
                                                    </div>

                                                    <div className="col-span-3 flex justify-end">
                                                        <button
                                                            onClick={() => setExpandedRow(isExpanded ? null : asset.ticker)}
                                                            className={clsx(
                                                                "flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 transform active:scale-95",
                                                                isExpanded
                                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                                    : "text-foreground bg-secondary hover:bg-primary/20 hover:text-primary border border-transparent"
                                                            )}
                                                        >
                                                            <Info className="h-4 w-4" /> Explain
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Drawer Content */}
                                                {isExpanded && (
                                                    <div className="px-6 sm:px-8 pb-6 pt-2 animate-fade-in relative z-0">
                                                        <div className="bg-secondary/50 rounded-2xl border border-border p-5 shadow-sm">
                                                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <BarChart3 className="h-4 w-4 text-primary" /> Metrics & Rationale
                                                            </h4>
                                                            <p className="text-foreground text-sm leading-relaxed">
                                                                {results.explanations[asset.ticker] || "No explanation available."}
                                                            </p>
                                                            <div className="mt-5 p-4 bg-destructive/5 border border-destructive/20 rounded-xl w-fit">
                                                                <p className="text-xs text-destructive font-bold tracking-widest uppercase flex items-center gap-1.5">
                                                                    Assumptions
                                                                </p>
                                                                <p className="text-[11px] font-medium text-destructive/80 mt-1 max-w-lg leading-relaxed">
                                                                    Scores are derived from simplistic historical volatility and momentum on mocked baseline data. Past performance is not indicative of future returns.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Correlation Heatmap */}
                                    {results.correlationMatrix && results.ranked.length >= 3 && (
                                        <div className="p-6 sm:p-8 border-t border-border bg-secondary/10">
                                            <h4 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5 text-primary" /> Correlation Heatmap
                                            </h4>
                                            <div className="overflow-x-auto rounded-3xl border border-border bg-background shadow-sm">
                                                <table className="w-full text-sm text-left text-muted-foreground">
                                                    <thead className="text-foreground font-semibold bg-secondary/40">
                                                        <tr>
                                                            <th className="px-6 py-5 border-b border-border">Asset</th>
                                                            {results.ranked.map(a => (
                                                                <th key={`th-${a.ticker}`} className="px-6 py-5 text-center border-b border-border">{a.ticker}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {results.ranked.map((a1, i) => (
                                                            <tr key={`tr-${a1.ticker}`} className="hover:bg-secondary/50 transition-colors group">
                                                                <td className="px-6 py-5 font-bold text-foreground bg-secondary/20 border-r border-border group-hover:bg-secondary/40 transition-colors">
                                                                    {a1.ticker}
                                                                </td>
                                                                {results.ranked.map(a2 => {
                                                                    const val = results.correlationMatrix?.[a1.ticker]?.[a2.ticker] ?? 0;
                                                                    const color = val > 0.7 ? "text-destructive" : val < 0.3 ? "text-emerald-500" : "text-yellow-500";
                                                                    return (
                                                                        <td key={`td-${a1.ticker}-${a2.ticker}`} className={clsx("px-6 py-5 text-center font-bold tracking-wide tabular-nums transition-colors", val === 1 ? "text-muted-foreground" : color)}>
                                                                            {val === 1 ? "1.00" : val.toFixed(2)}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="mt-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide bg-secondary p-3 rounded-lg inline-block border border-border shadow-sm">
                                                Values near <span className="text-destructive font-bold mx-1 text-xs">1.0</span> indicate strong positive correlation. Values near <span className="text-emerald-500 font-bold mx-1 text-xs">0</span> indicate diversification.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground p-8">
                                <div className="p-4 rounded-full bg-secondary/50 mb-4 border border-border shadow-sm">
                                    <BarChart3 className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-wide">No Data Yet</h3>
                                <p className="max-w-xs text-center text-sm mt-3">
                                    Select assets from the watchlist on the left and rank them based on your risk profile.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
