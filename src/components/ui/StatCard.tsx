import React from "react";
import clsx from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "./Card";

interface StatCardProps {
    title: string;
    value: string;
    delta?: number;
    deltaLabel?: string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    className?: string;
    isLargeDelta?: boolean;
    deltaOnly?: boolean;
}

export function StatCard({ title, value, delta, deltaLabel, icon, trend, className, isLargeDelta, deltaOnly = false }: StatCardProps) {
    const isPositive = delta !== undefined ? delta >= 0 : trend === "up";
    const valueLength = value.length;

    const valueClass =
        valueLength > 30
            ? "text-[clamp(0.50rem,2.2cqw,0.78rem)]"
            : valueLength > 24
                ? "text-[clamp(0.56rem,2.6cqw,0.90rem)]"
                : valueLength > 20
                    ? "text-[clamp(0.62rem,3.2cqw,1.05rem)]"
                    : valueLength > 18
                        ? "text-[clamp(0.70rem,3.8cqw,1.20rem)]"
                        : valueLength > 14
                            ? "text-[clamp(0.78rem,4.4cqw,1.45rem)]"
                            : valueLength > 10
                                ? "text-[clamp(0.88rem,5.6cqw,1.80rem)]"
                                : valueLength > 7
                                    ? "text-[clamp(0.95rem,6.2cqw,2.00rem)]"
                                    : "text-[clamp(1rem,6.8cqw,2.20rem)]";

    return (
        <Card className={clsx("glass-panel group hover:border-primary/40 transition-all duration-500 shadow-xl bg-card/50 backdrop-blur-2xl border border-border/40 overflow-hidden relative", className)}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <CardContent className={clsx("p-8 h-full relative z-10 text-center", deltaOnly ? "flex flex-col justify-start" : "flex flex-col items-center justify-center")}>
                <div className={clsx("w-full min-w-0", deltaOnly ? "pt-1" : "flex-1 flex flex-col items-center justify-center")}>
                    <p className={clsx("text-[11px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] leading-none px-3 max-w-full", deltaOnly ? "mb-8" : "mb-4")}>{title}</p>
                    {!deltaOnly && (
                        <h3
                            className={clsx(
                                "font-black text-white tabular-nums leading-[1.12] pb-[0.08em] px-5 whitespace-nowrap w-[88%] mx-auto tracking-tight",
                                valueClass,
                            )}
                            title={value}
                        >
                            {value}
                        </h3>
                    )}
                </div>

                {deltaOnly && delta !== undefined && (
                    <div className="absolute inset-0 flex items-center justify-center pt-6">
                        <div className={clsx("origin-center transition-all duration-500", isLargeDelta ? "scale-[1.85]" : "scale-125")}>
                            <span
                                className={clsx(
                                    "flex items-center text-[11px] font-black px-6 py-3 rounded-full ring-2 ring-inset transition-all duration-300",
                                    isPositive
                                        ? "text-success bg-success/20 ring-success/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                                        : "text-destructive bg-destructive/20 ring-destructive/40 shadow-[0_0_20px_rgba(239,68,68,0.25)]",
                                )}
                            >
                                {isPositive ? <TrendingUp className="h-4 w-4 mr-2" /> : <TrendingDown className="h-4 w-4 mr-2" />}
                                {isPositive ? "+" : ""}{Math.abs(delta).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                )}

                {delta !== undefined && !deltaOnly && (
                    <div className={clsx("mt-auto mb-1 origin-center transition-all duration-500 shrink-0", isLargeDelta ? "scale-150" : "scale-110")}>
                        <div className="flex flex-col items-center gap-1">
                            <span
                                className={clsx(
                                    "flex items-center text-[10px] font-black px-5 py-2.5 rounded-full ring-2 ring-inset transition-all duration-300",
                                    isPositive
                                        ? "text-success bg-success/20 ring-success/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                                        : "text-destructive bg-destructive/20 ring-destructive/40 shadow-[0_0_20px_rgba(239,68,68,0.25)]",
                                )}
                            >
                                {isPositive ? <TrendingUp className="h-4 w-4 mr-2" /> : <TrendingDown className="h-4 w-4 mr-2" />}
                                {isPositive ? "+" : ""}{Math.abs(delta).toFixed(2)}%
                            </span>
                            {deltaLabel && (
                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">
                                    {deltaLabel}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {icon && (
                    <div className="absolute top-3 right-3 opacity-40 pointer-events-none">
                        {icon}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
