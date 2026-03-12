"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useWatchlist } from "@/components/WatchlistProvider";
import { Brain, Search, Loader2, Sparkles, AlertTriangle, Lightbulb, Target, TrendingUp, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

export default function AIAdvisorPage() {
    const { watchlist } = useWatchlist();
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [riskProfile, setRiskProfile] = useState<"Conservative" | "Balanced" | "Aggressive">("Balanced");
    const [timeHorizon, setTimeHorizon] = useState<"0-6m" | "6-24m" | "2y+">("2y+");

    // Search for additional assets
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ ticker: string, name: string }[]>([]);

    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initial load from watchlist
    useEffect(() => {
        if (watchlist.length > 0 && selectedAssets.length === 0) {
            // Default to top 3 from watchlist to prevent overwhelming the LLM
            setSelectedAssets(watchlist.slice(0, 3));
        }
    }, [watchlist]);

    // Simple search mock
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        const delay = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${searchQuery}`);
                const data = await res.json();
                setSearchResults(data.slice(0, 5));
            } catch (e) { }
        }, 300);
        return () => clearTimeout(delay);
    }, [searchQuery]);

    const toggleAsset = (ticker: string) => {
        if (selectedAssets.includes(ticker)) {
            setSelectedAssets(prev => prev.filter(a => a !== ticker));
        } else {
            if (selectedAssets.length >= 5) {
                alert("You can select maximum 5 assets for a single analysis.");
                return;
            }
            setSelectedAssets(prev => [...prev, ticker]);
        }
    };

    const generateAdvice = async () => {
        if (selectedAssets.length === 0) {
            setError("Please select at least one asset to analyze.");
            return;
        }

        setLoading(true);
        setError(null);
        setAdvice(null);

        try {
            const res = await fetch("/api/ai-advisor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assets: selectedAssets,
                    riskProfile,
                    timeHorizon
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate advice");

            setAdvice(data.advice);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Custom Markdown Parser for the specific structure we requested
    const renderParsedAdvice = (markdown: string) => {
        const sections = markdown.split("## ").filter(s => s.trim() !== "");
        const headerMatch = markdown.match(/# (.*?)\n/);
        const title = headerMatch ? headerMatch[1].replace('🤖 ', '') : "AI Portföy Analizi";

        let intro = "";
        const introMatch = markdown.match(/\*\*Analiz Edilen([\s\S]*?)---/);
        if (introMatch) {
            intro = "**Analiz Edilen" + introMatch[1].trim();
        }

        return (
            <div className="space-y-12 animate-fade-in">
                <div className="bg-blue-600/5 border border-primary/20 rounded-[2rem] p-10 sm:p-12 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute -top-10 -right-10 p-4 opacity-5">
                        <Brain className="h-48 w-48 text-primary group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400 mb-4 flex items-center gap-3 tracking-tight">
                            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                            {title}
                        </h2>
                        <div className="text-lg font-medium text-muted-foreground/80 whitespace-pre-wrap leading-relaxed max-w-3xl">
                            {intro.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.map((section, idx) => {
                        if (section.startsWith("🤖") || section.startsWith("#")) return null; // Skip title row in sections

                        const lines = section.split("\n");
                        const sectionTitle = lines[0].trim();
                        const content = lines.slice(1).join("\n").trim();

                        // Extract Blockquotes (tips)
                        const tipMatch = content.match(/> \[!TIP\]([\s\S]*)/);
                        let mainContent = content;
                        let tipContent = "";

                        if (tipMatch) {
                            mainContent = content.substring(0, content.indexOf("> [!TIP]")).trim();
                            tipContent = tipMatch[1].replace(/>/g, "").trim();
                        }

                        // Theme per section type
                        let Icon = ChevronRight;
                        let ringColor = "ring-border";
                        let bgHeader = "bg-secondary";

                        if (sectionTitle.includes("🎯 Tavsiye Özeti")) { Icon = Target; ringColor = "ring-blue-500/30"; bgHeader = "bg-blue-500/10 text-blue-400"; }
                        else if (sectionTitle.includes("📊 Varlık Analizi")) { Icon = TrendingUp; ringColor = "ring-emerald-500/30"; bgHeader = "bg-emerald-500/10 text-emerald-400"; }
                        else if (sectionTitle.includes("💡 Strateji Önerisi")) { Icon = Lightbulb; ringColor = "ring-amber-500/30"; bgHeader = "bg-amber-500/10 text-amber-400"; }
                        else if (sectionTitle.includes("⚠️ Kritik Riskler")) { Icon = AlertTriangle; ringColor = "ring-red-500/30"; bgHeader = "bg-red-500/10 text-red-400"; }

                        return (
                            <div key={idx} className={clsx("rounded-[2rem] border border-border/40 bg-card/30 backdrop-blur-sm text-card-foreground shadow-sm overflow-hidden flex flex-col transition-all hover:bg-card/40 hover:border-border/60", sectionTitle.includes("Kritik") && "md:col-span-2")}>
                                <div className={clsx("px-8 py-5 border-b border-border/20 flex items-center gap-3 font-black text-sm uppercase tracking-widest", bgHeader)}>
                                    <Icon className="h-5 w-5" />
                                    {sectionTitle.replace(/[^\w\sğüşöçİĞÜŞÖÇ]/gi, '')}
                                </div>
                                <div className="p-8 sm:p-10 flex-1 space-y-6">
                                    <div
                                        className="text-base leading-relaxed space-y-4 text-foreground/80 [&>ul]:list-disc [&>ul]:ml-6 [&>ul>li]:pl-2 [&>strong]:text-foreground [&>strong]:font-black"
                                        dangerouslySetInnerHTML={{
                                            __html: mainContent
                                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
                                                .replace(/- (.*?)\n/g, '<li>$1</li>')
                                                .replace(/<li>/g, '<ul class="my-3 text-muted-foreground/90"><li class="mb-2">')
                                                .replace(/<\/li>(?!<li>)/g, '</li></ul>')
                                        }}
                                    />
                                    {tipContent && (
                                        <div className="mt-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-start shadow-inner">
                                            <Lightbulb className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                                            <div
                                                className="text-base text-amber-200/90 leading-relaxed font-medium"
                                                dangerouslySetInnerHTML={{ __html: tipContent.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-500 font-black">$1</strong>') }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center text-xs text-muted-foreground/60 italic pt-8 border-t border-border/50">
                    Bu analiz tamamen eğitim ve fikir verme amaçlıdır, yapay zeka tarafından geçici piyasa verileri referans alınarak oluşturulmuştur. Kesinlikle profesyonel finansal veya yatırım tavsiyesi niteliği taşımaz.
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-16 animate-fade-in relative z-10 w-full mb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
            <PageHeader
                title="AI Advisor"
                subtitle="Leverage LLM-driven quantum analysis to align market instruments with your unique financial goals."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Configuration Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <Card glass className="p-10 rounded-3xl border-border/40 shadow-sm">
                        <h3 className="font-extrabold text-xl mb-6 flex items-center gap-3 tracking-tight">
                            <span className="w-8 h-8 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-sm font-black ring-4 ring-primary/5">1</span>
                            Select Assets
                        </h3>

                        {/* Selected Assets Tags */}
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                            {selectedAssets.length === 0 ? (
                                <span className="text-sm text-muted-foreground">Select up to 5 assets to analyze</span>
                            ) : (
                                selectedAssets.map(asset => (
                                    <Badge key={asset} variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive group" onClick={() => toggleAsset(asset)}>
                                        {asset} <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                                    </Badge>
                                ))
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-6 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search (e.g., BTC, AAPL)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-secondary/50 border border-border/60 rounded-2xl py-3 !pl-14 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60 shadow-inner"
                            />
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="space-y-1 mb-4 p-2 bg-background/50 rounded-xl border border-border/50">
                                {searchResults.map(res => (
                                    <button
                                        key={res.ticker}
                                        onClick={() => toggleAsset(res.ticker)}
                                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary text-sm text-left transition-colors"
                                    >
                                        <span className="font-bold">{res.ticker}</span>
                                        <span className="text-xs text-muted-foreground">{selectedAssets.includes(res.ticker) ? "Added" : "+ Add"}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Watchlist Quick Add */}
                        {watchlist.length > 0 && (
                            <div className="pt-4 border-t border-border/50">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">QUICK ADD FROM WATCHLIST</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {watchlist.filter(w => !selectedAssets.includes(w)).slice(0, 5).map(w => (
                                        <button
                                            key={w}
                                            onClick={() => toggleAsset(w)}
                                            className="px-2.5 py-1 text-xs bg-secondary/50 border border-border rounded-md hover:bg-secondary transition-colors"
                                        >
                                            + {w}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card glass className="p-10 rounded-3xl border-border/40 shadow-sm space-y-8">
                        <div>
                            <h3 className="font-extrabold text-xl flex items-center gap-3 mb-6 tracking-tight">
                                <span className="w-8 h-8 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-sm font-black ring-4 ring-primary/5">2</span>
                                Constraints
                            </h3>

                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-3 block opacity-70">Risk Profile</label>
                            <div className="grid grid-cols-3 gap-2 p-1.5 bg-secondary/40 backdrop-blur-sm rounded-2xl mb-8 border border-border/20 shadow-inner">
                                {["Conservative", "Balanced", "Aggressive"].map(profile => (
                                    <button
                                        key={profile}
                                        onClick={() => setRiskProfile(profile as any)}
                                        className={clsx(
                                            "py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300",
                                            riskProfile === profile
                                                ? "bg-background shadow-md text-primary scale-[1.02] ring-1 ring-border/10"
                                                : "text-muted-foreground/60 hover:text-foreground"
                                        )}
                                    >
                                        {profile}
                                    </button>
                                ))}
                            </div>

                            <label className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-3 block opacity-70">Time Horizon</label>
                            <div className="grid grid-cols-3 gap-2 p-1.5 bg-secondary/40 backdrop-blur-sm rounded-2xl border border-border/20 shadow-inner">
                                {[{ id: "0-6m", label: "< 6m" }, { id: "6-24m", label: "1-2y" }, { id: "2y+", label: "2y+" }].map(hz => (
                                    <button
                                        key={hz.id}
                                        onClick={() => setTimeHorizon(hz.id as any)}
                                        className={clsx(
                                            "py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300",
                                            timeHorizon === hz.id
                                                ? "bg-background shadow-md text-primary scale-[1.02] ring-1 ring-border/10"
                                                : "text-muted-foreground/60 hover:text-foreground"
                                        )}
                                    >
                                        {hz.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <button
                        onClick={generateAdvice}
                        disabled={loading || selectedAssets.length === 0}
                        className="w-full py-5 px-8 rounded-2xl font-black text-lg text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] hover:shadow-indigo-500/40 group relative overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, #4f46e5, #7c3aed)"
                        }}
                    >
                        {loading && (
                            <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Brain className="h-6 w-6 group-hover:scale-110 transition-transform" />}
                            {loading ? "Analyzing..." : "Generate AI Vision"}
                        </span>
                    </button>

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>

                {/* AI Advice Output Panel */}
                <div className="lg:col-span-8">
                    {loading ? (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-6 bg-secondary/20 rounded-3xl border border-border/30 p-10 relative overflow-hidden">
                            {/* Animated scanner line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-scan" />

                            <div className="relative">
                                <div className="absolute -inset-10 bg-indigo-500/20 blur-[50px] rounded-full animate-pulse-slow" />
                                <Brain className="h-24 w-24 text-indigo-400 animate-pulse relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                            </div>

                            <div className="text-center space-y-2 relative z-10">
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                    Synthesizing Market Data
                                </h3>
                                <p className="text-muted-foreground">Compressing historical trends, evaluating volatility arrays, and generating strategic alignments...</p>
                            </div>

                            <div className="flex gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                ))}
                            </div>
                        </div>
                    ) : advice ? (
                        renderParsedAdvice(advice)
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-4 bg-secondary/10 rounded-3xl border border-border/50 border-dashed p-10">
                            <div className="p-5 bg-background border border-border rounded-full shadow-sm mb-2">
                                <Sparkles className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground/70">Awaiting Inputs</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Select up to 5 assets and configure your constraints on the left. AI Advisor will compress the market context and deliver institutional-grade portfolio insights.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
