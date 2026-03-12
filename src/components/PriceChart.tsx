"use client";

import { MarketData } from '@/types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Line } from 'recharts';

interface PriceChartProps {
    data: MarketData;
    chartType?: "area" | "line";
    showSma20?: boolean;
    showSma50?: boolean;
}

function getSMA(values: number[], period: number, idx: number): number | null {
    if (idx < period - 1) return null;
    const slice = values.slice(idx - period + 1, idx + 1);
    const sum = slice.reduce((acc, v) => acc + v, 0);
    return sum / period;
}

export default function PriceChart({ data, chartType = "area", showSma20 = false, showSma50 = false }: PriceChartProps) {
    if (!data || !data.history || data.history.length === 0) {
        return (
            <div className="h-64 w-full flex items-center justify-center text-slate-500 glass-panel border-dashed">
                No chart data available
            </div>
        );
    }

    // Determine trend for color
    const firstPrice = data.history[0].close;
    const lastPrice = data.history[data.history.length - 1].close;
    const isPositive = lastPrice >= firstPrice;
    const strokeColor = isPositive ? '#10b981' : '#ef4444';
    const fillColor = isPositive ? 'url(#colorPositive)' : 'url(#colorNegative)';
    const maxPrice = Math.max(...data.history.map((h) => h.close));
    const minPrice = Math.min(...data.history.map((h) => h.close));
    const periodReturn = firstPrice !== 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
    const closes = data.history.map((h) => h.close);

    // Format dates for the XAxis
    const formattedData = data.history.map((d, i) => {
        const prev = i > 0 ? data.history[i - 1].close : d.close;
        const change = prev !== 0 ? ((d.close - prev) / prev) * 100 : 0;
        return {
            ...d,
            displayDate: new Date(d.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            displayTime: new Date(d.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            change: change.toFixed(2),
            sma20: getSMA(closes, 20, i),
            sma50: getSMA(closes, 50, i)
        };
    });

    return (
        <div className="h-full w-full relative">
            <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-2">
                <span className="text-[10px] font-black px-2 py-1 rounded-md bg-background/70 border border-border/40">
                    High: {data.currency === "USD" ? "$" : "₺"}{maxPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-black px-2 py-1 rounded-md bg-background/70 border border-border/40">
                    Low: {data.currency === "USD" ? "$" : "₺"}{minPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${periodReturn >= 0 ? "bg-success/15 border-success/40 text-success" : "bg-destructive/15 border-destructive/40 text-destructive"}`}>
                    Range: {periodReturn >= 0 ? "+" : ""}{periodReturn.toFixed(2)}%
                </span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
                    <defs>
                        <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.4} />
                    <XAxis
                        dataKey="displayDate"
                        stroke="#64748b"
                        fontSize={11}
                        fontWeight={700}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={40}
                        dy={10}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        stroke="#64748b"
                        fontSize={11}
                        fontWeight={700}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => Number(value).toLocaleString()}
                        width={60}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                const isItemPositive = parseFloat(d.change) >= 0;
                                return (
                                    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl ring-1 ring-white/10">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{d.displayDate} • {d.displayTime}</p>
                                        <div className="flex items-baseline gap-3">
                                            <p className="text-xl font-black text-white tracking-tighter">
                                                {data.currency === "USD" ? "$" : "₺"}{d.close.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isItemPositive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                                                {isItemPositive ? '+' : ''}{d.change}%
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    {chartType === "area" ? (
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke={strokeColor}
                            strokeWidth={3}
                            fill={fillColor}
                            animationDuration={1000}
                            activeDot={{ r: 6, strokeWidth: 0, fill: strokeColor }}
                        />
                    ) : (
                        <Line
                            type="monotone"
                            dataKey="close"
                            stroke={strokeColor}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0, fill: strokeColor }}
                        />
                    )}
                    {showSma20 && (
                        <Line
                            type="monotone"
                            dataKey="sma20"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                        />
                    )}
                    {showSma50 && (
                        <Line
                            type="monotone"
                            dataKey="sma50"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                        />
                    )}
                    <ReferenceLine
                        y={lastPrice}
                        stroke={strokeColor}
                        strokeDasharray="3 3"
                        opacity={0.5}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
