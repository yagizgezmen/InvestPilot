"use client";

import { useState, useEffect } from "react";
import { AssetClass, MarketData, Asset } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import PriceChart from "@/components/PriceChart";
import { Search, Loader2, AlertCircle, Target } from "lucide-react";
import Link from "next/link";
import { useWatchlist } from "@/components/WatchlistProvider";
import clsx from "clsx";

// Custom hook for debouncing search input
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

interface DynamicAssetDashboardProps {
    assetClass: AssetClass;
    defaultTicker: string;
    title: string;
}

export function DynamicAssetDashboard({ assetClass, defaultTicker, title }: DynamicAssetDashboardProps) {
    const [selectedAsset, setSelectedAsset] = useState<string>(defaultTicker);
    const [timeRange, setTimeRange] = useState<string>("1M");
    const [currency, setCurrency] = useState<"USD" | "TRY">("USD");
    const [chartType, setChartType] = useState<"area" | "line">("area");
    const [showSma20, setShowSma20] = useState<boolean>(false);
    const [showSma50, setShowSma50] = useState<boolean>(false);

    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [loadingMarket, setLoadingMarket] = useState(false);
    const [marketError, setMarketError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState<Asset[]>([]);
    const [searching, setSearching] = useState(false);

    const { watchlist, toggleWatchlist } = useWatchlist();

    // 1. Fetch search results when debounced query changes
    useEffect(() => {
        const fetchResults = async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/search?q=${debouncedSearch}&assetClass=${assetClass}`);
                const data = await res.json();
                setSearchResults(data);
            } catch (err) {
                console.error("Search fetch error:", err);
            } finally {
                setSearching(false);
            }
        };

        fetchResults();
    }, [debouncedSearch, assetClass]);

    // 2. Fetch detailed market data when selectedAsset, timeRange, or currency changes
    useEffect(() => {
        if (!selectedAsset) return;

        let isMounted = true;
        setLoadingMarket(true);

        const fetchMarketData = async () => {
            setMarketError(null);
            try {
                const res = await fetch(`/api/market-data?ticker=${selectedAsset}&currency=${currency}&range=${timeRange}`);
                if (!res.ok) throw new Error(`Market data request failed with status: ${res.status}`);
                const data = await res.json();

                if (data.error && (!data.history || data.history.length === 0)) {
                    if (isMounted) setMarketError(data.error);
                }

                if (isMounted) setMarketData(data);
            } catch (e: unknown) {
                console.error("fetchMarketData Error:", e);
                if (isMounted) setMarketError("Veri güncellenemedi. Lütfen daha sonra tekrar deneyiniz.");
            } finally {
                if (isMounted) setLoadingMarket(false);
            }
        };

        fetchMarketData();

        return () => {
            isMounted = false;
        };
    }, [selectedAsset, timeRange, currency]);


    // Action handlers
    const isSelectedWatchlist = marketData ? watchlist.includes(marketData.ticker) : false;
    const latestVolume = marketData?.history?.slice().reverse().find((h) => typeof h.volume === "number")?.volume;
    const formatVolume = (volume?: number) => {
        if (volume == null) return "N/A";
        if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(2)}B`;
        if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
        if (volume >= 1_000) return `${(volume / 1_000).toFixed(2)}K`;
        return volume.toLocaleString();
    };
    const changePct = marketData?.changePct ?? 0;

    return (
        <div className="space-y-16 animate-fade-in relative z-10 w-full mb-32">
            {/* Header section  */}
            <PageHeader
                title={title}
                subtitle={`Analyze and perform due diligence on ${assetClass} markets before investing.`}
                actions={
                    <SegmentedControl
                        options={["USD", "TRY"]}
                        selected={currency}
                        onChange={(val) => setCurrency(val as "USD" | "TRY")}
                    />
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 relative z-10 w-full">

                <div className="lg:col-span-4 flex flex-col h-full shrink-0">
                    <Card glass className="p-8 sm:p-10 flex flex-col flex-1 max-h-[750px] border-border/60 shadow-lg ring-1 ring-white/5 bg-card/40 backdrop-blur-2xl">
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black flex items-center gap-3 tracking-tighter uppercase text-muted-foreground/80">
                                <div className="h-4 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                Markets
                            </h3>
                            <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/50 border border-border/40 text-muted-foreground uppercase tracking-widest">
                                {searchResults.length} assets
                            </div>
                        </div>

                        {/* Search Bar Container */}
                        <div className="relative mb-8 group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                <Search className="h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder={`Search ${assetClass}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-secondary/30 border border-border/60 rounded-2xl py-4 !pl-16 pr-12 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 shadow-inner hover:bg-secondary/50"
                            />
                            {searching && (
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Search Results List */}
                        <div className="overflow-y-auto pr-4 space-y-2 flex-1 custom-scrollbar w-full">
                            {searchResults.length > 0 ? (
                                searchResults.map(asset => {
                                    const isActive = selectedAsset === asset.ticker;
                                    return (
                                        <button
                                            key={asset.ticker}
                                            onClick={() => setSelectedAsset(asset.ticker)}
                                            className={`w-[calc(100%-8px)] flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 border text-left flex-shrink-0 group relative mx-1 ${isActive
                                                ? "bg-primary/10 border-primary/40 shadow-[0_8px_20px_rgba(59,130,246,0.12)] translate-x-1"
                                                : "bg-transparent border-transparent hover:bg-secondary/40 hover:border-border/40 hover:translate-x-1"
                                                }`}
                                        >
                                            <div className="min-w-0 pr-6 z-10 pl-2">
                                                <div className={`font-black text-lg tracking-tight transition-colors ${isActive ? "text-primary" : "text-foreground group-hover:text-primary/90"}`}>
                                                    {asset.ticker}
                                                </div>
                                                <div className="text-[10px] font-bold text-muted-foreground/50 truncate mt-0.5 uppercase tracking-[0.1em] max-w-[150px]">
                                                    {asset.name}
                                                </div>
                                            </div>

                                            {/* Selection/Hover visual cues */}
                                            <div className="flex items-center gap-4 z-10 shrink-0">
                                                {isActive && (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
                                                )}
                                                <svg className={clsx(
                                                    "h-4 w-4 transition-all duration-300",
                                                    isActive ? "text-primary translate-x-0 opacity-100" : "text-muted-foreground opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100"
                                                )} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                            </div>

                                            {isActive && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl -z-0" />
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 px-4 rounded-3xl bg-secondary/10 border border-dashed border-border/40">
                                    <div className="mb-4 flex justify-center">
                                        <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center text-muted-foreground/40">
                                            <Search className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <p className="text-base font-bold text-muted-foreground/60 italic">
                                        {searching ? "Searching market..." : "No assets match your search."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Panel: Data & Charts */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Stat Cards Row */}
                    {loadingMarket || !marketData ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Skeleton className="h-44 w-full rounded-2xl" />
                            <Skeleton className="h-44 w-full rounded-2xl" />
                            <Skeleton className="h-44 w-full rounded-2xl" />
                            <Skeleton className="h-44 w-full rounded-2xl" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in relative z-10 w-full">
                            <StatCard
                                title="Current Price"
                                value={marketData.currency === "USD" ? `$${Number(marketData.currentPrice).toLocaleString()}` : `₺${Number(marketData.currentPrice).toLocaleString()}`}
                                className="h-44 shadow-md"
                            />
                            <StatCard
                                title="Volume"
                                value={formatVolume(latestVolume)}
                                className="h-44 shadow-md"
                            />
                            <StatCard
                                title="24h Change"
                                value={`${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`}
                                delta={changePct}
                                className="h-44 shadow-md"
                                isLargeDelta={true}
                                deltaOnly={true}
                            />
                            <Card glass className="p-8 h-44 flex flex-col items-center justify-center text-center gap-4 border border-border/40 shadow-md group relative overflow-hidden bg-card/40 backdrop-blur-2xl transition-all duration-500 hover:border-primary/40">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-2 z-10">Strategy Engine</span>
                                <Link
                                    href={`/strategy/${marketData.ticker}`}
                                    className="z-10 px-6 py-3.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-black rounded-2xl text-xs transition-all shadow-sm group-hover:-translate-y-1 active:scale-95 uppercase tracking-widest ring-1 ring-primary/10 flex items-center gap-2"
                                >
                                    <Target className="h-4 w-4" />
                                    Deep Dive Strategy
                                </Link>
                            </Card>
                        </div>
                    )}

                    {/* Chart Area */}
                    <Card glass className="p-10 sm:p-12 h-[550px] flex flex-col items-center justify-center border-border/40 shadow-sm relative overflow-hidden">
                        {/* Stale Data Warning Banner */}
                        {marketData?.stale && (
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/30 text-amber-500 px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-3 shadow-md z-30 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                Displaying cached data due to network or provider issues.
                            </div>
                        )}

                        <div className="w-full h-full">
                            {loadingMarket ? (
                                <Skeleton className="h-full w-full" />
                            ) : marketError ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-destructive/5 rounded-2xl border border-destructive/20 group">
                                    <div className="p-3 bg-destructive/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="h-8 w-8 text-destructive" />
                                    </div>
                                    <h4 className="text-lg font-bold text-foreground mb-2">Data Unavailable</h4>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                                        {marketError}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSelectedAsset("");
                                            setTimeout(() => setSelectedAsset(selectedAsset), 10);
                                        }}
                                        className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl text-sm transition-all border border-border"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : !marketData ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    Select an asset to view market data
                                </div>
                            ) : (
                                <div className="h-full w-full relative group">
                                    {/* Action Header in Chart */}
                                    <div className="absolute top-0 right-0 z-10 flex gap-2">
                                        <button
                                            onClick={() => toggleWatchlist(marketData.ticker)}
                                            className="p-1.5 bg-background border border-border rounded-lg shadow-sm hover:bg-secondary transition-colors"
                                            title="Toggle Watchlist"
                                        >
                                            <svg className={`h-5 w-5 ${isSelectedWatchlist ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        </button>
                                        <SegmentedControl
                                            options={["1D", "1W", "1M", "6M", "1Y"]}
                                            selected={timeRange}
                                            onChange={setTimeRange}
                                        />
                                        <SegmentedControl
                                            options={["AREA", "LINE"]}
                                            selected={chartType.toUpperCase()}
                                            onChange={(val) => setChartType(val.toLowerCase() as "area" | "line")}
                                        />
                                        <button
                                            onClick={() => setShowSma20((prev) => !prev)}
                                            className={clsx(
                                                "px-2.5 py-1.5 text-[10px] font-black rounded-lg border transition-colors",
                                                showSma20
                                                    ? "bg-blue-500/15 border-blue-400/40 text-blue-300"
                                                    : "bg-background border-border text-muted-foreground hover:bg-secondary",
                                            )}
                                        >
                                            SMA20
                                        </button>
                                        <button
                                            onClick={() => setShowSma50((prev) => !prev)}
                                            className={clsx(
                                                "px-2.5 py-1.5 text-[10px] font-black rounded-lg border transition-colors",
                                                showSma50
                                                    ? "bg-amber-500/15 border-amber-400/40 text-amber-300"
                                                    : "bg-background border-border text-muted-foreground hover:bg-secondary",
                                            )}
                                        >
                                            SMA50
                                        </button>
                                    </div>
                                    <PriceChart
                                        data={marketData}
                                        chartType={chartType}
                                        showSma20={showSma20}
                                        showSma50={showSma50}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
