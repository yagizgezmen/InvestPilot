"use client";

import { ChartDisplayType, ChartTimeRange, MarketData } from "@/types";
import clsx from "clsx";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

interface PriceChartProps {
  data: MarketData;
  assetName?: string;
  chartType?: ChartDisplayType;
  showSma20?: boolean;
  showSma50?: boolean;
  showVolume?: boolean;
  timeRange?: ChartTimeRange;
}

interface ChartPoint {
  index: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  change: string;
  fullDate: string;
  axisLabel: string;
  sma20: number | null;
  sma50: number | null;
  volumeBarColor: string;
  candleColor: string;
  candlePositive: boolean;
  candleBody: [number, number];
  baselineGain: number;
  baselineLoss: number;
}

function getSMA(values: number[], period: number, idx: number): number | null {
  if (idx < period - 1) return null;
  const slice = values.slice(idx - period + 1, idx + 1);
  const sum = slice.reduce((acc, value) => acc + value, 0);
  return sum / period;
}

function formatCurrency(value: number, currency: string, digits = 2): string {
  const symbol = currency === "USD" ? "$" : currency === "TRY" ? "TRY " : `${currency} `;
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function formatAxisCurrency(value: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : currency === "TRY" ? "TRY " : "";

  if (Math.abs(value) >= 1_000_000_000) return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`;
  return `${symbol}${value.toFixed(2)}`;
}

function formatVolume(value?: number): string {
  if (value === undefined) return "-";
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatAxisDate(date: Date, range?: ChartTimeRange): string {
  if (range === "1D") {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "1W") {
    return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
  }
  if (range === "1M" || range === "3M") {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  if (range === "6M" || range === "1Y") {
    return date.toLocaleDateString(undefined, { month: "short" });
  }
  return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function getMinTickGap(range?: ChartTimeRange): number {
  if (range === "1D") return 28;
  if (range === "1W") return 24;
  if (range === "1M" || range === "3M") return 30;
  if (range === "6M") return 38;
  if (range === "1Y") return 42;
  return 52;
}

function TooltipRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="font-black uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span
        className={clsx(
          "font-black tabular-nums",
          tone === "positive" && "text-emerald-300",
          tone === "negative" && "text-rose-300",
          tone === "neutral" && "text-white",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ChartPoint }>;
  currency: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) return null;

  const pointChange = Number.parseFloat(point.change);
  const pointPositive = pointChange >= 0;

  return (
    <div className="min-w-[230px] rounded-[22px] border border-white/10 bg-slate-950/92 px-4 py-4 shadow-[0_22px_50px_-20px_rgba(2,6,23,0.95)] backdrop-blur-xl">
      <div className="border-b border-white/10 pb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
          {point.fullDate}
        </p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-xl font-black tracking-tight text-white">
            {formatCurrency(point.close, currency)}
          </p>
          <span
            className={clsx(
              "rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ring-inset",
              pointPositive
                ? "bg-success/15 text-success ring-success/30"
                : "bg-destructive/15 text-destructive ring-destructive/30",
            )}
          >
            {pointPositive ? "+" : ""}
            {point.change}%
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <TooltipRow label="Open" value={formatCurrency(point.open, currency)} />
        <TooltipRow label="High" value={formatCurrency(point.high, currency)} />
        <TooltipRow label="Low" value={formatCurrency(point.low, currency)} />
        <TooltipRow label="Close" value={formatCurrency(point.close, currency)} />
        {point.volume !== undefined && <TooltipRow label="Volume" value={formatVolume(point.volume)} />}
      </div>
    </div>
  );
}

export default function PriceChart({
  data,
  assetName,
  chartType = "area",
  showSma20 = false,
  showSma50 = false,
  showVolume = true,
  timeRange,
}: PriceChartProps) {
  if (!data || !data.history || data.history.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[28px] border border-dashed border-border/50 bg-card/30 text-sm text-muted-foreground">
        No chart data available
      </div>
    );
  }

  const firstPrice = data.history[0].close;
  const lastPrice = data.history[data.history.length - 1].close;
  const absoluteChange = lastPrice - firstPrice;
  const percentageChange = firstPrice !== 0 ? (absoluteChange / firstPrice) * 100 : 0;
  const isPositive = absoluteChange >= 0;
  const strokeColor = isPositive ? "#22c55e" : "#ef4444";
  const fillColor = isPositive ? "url(#pricePositive)" : "url(#priceNegative)";
  const maxPrice = Math.max(...data.history.map((item) => item.high ?? item.close));
  const minPrice = Math.min(...data.history.map((item) => item.low ?? item.close));
  const closes = data.history.map((item) => item.close);
  const hasVolume = data.history.some((item) => item.volume !== undefined && item.volume > 0);
  const hasOhlc = data.history.every(
    (item) => item.open !== undefined && item.high !== undefined && item.low !== undefined,
  );

  const effectiveChartType: ChartDisplayType =
    chartType === "candlestick" && !hasOhlc ? "area" : chartType;

  const chartData: ChartPoint[] = data.history.map((item, index) => {
    const previousClose = index > 0 ? data.history[index - 1].close : item.close;
    const open = item.open ?? previousClose;
    const high = item.high ?? Math.max(open, item.close);
    const low = item.low ?? Math.min(open, item.close);
    const date = new Date(item.time);
    const pointChange = previousClose !== 0 ? ((item.close - previousClose) / previousClose) * 100 : 0;
    const candlePositive = item.close >= open;

    return {
      index,
      open,
      high,
      low,
      close: item.close,
      volume: item.volume,
      change: pointChange.toFixed(2),
      fullDate: date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      axisLabel: formatAxisDate(date, timeRange),
      sma20: getSMA(closes, 20, index),
      sma50: getSMA(closes, 50, index),
      volumeBarColor: candlePositive ? "rgba(34,197,94,0.45)" : "rgba(239,68,68,0.42)",
      candleColor: candlePositive ? "#22c55e" : "#ef4444",
      candlePositive,
      candleBody: [Math.min(open, item.close), Math.max(open, item.close)],
      baselineGain: item.close >= firstPrice ? item.close : firstPrice,
      baselineLoss: item.close < firstPrice ? item.close : firstPrice,
    };
  });

  const displayName = assetName ?? data.ticker;
  const showMovingAverages = effectiveChartType !== "candlestick";

  const renderMainSeries = () => {
    if (effectiveChartType === "line") {
      return (
        <Line
          type="monotone"
          dataKey="close"
          stroke={strokeColor}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: strokeColor, stroke: "#f8fafc", strokeWidth: 2 }}
        />
      );
    }

    if (effectiveChartType === "baseline") {
      return (
        <>
          <ReferenceLine
            y={firstPrice}
            stroke="rgba(148,163,184,0.8)"
            strokeDasharray="4 6"
            label={{
              value: "Baseline",
              position: "insideTopLeft",
              fill: "#94a3b8",
              fontSize: 10,
              fontWeight: 800,
            }}
          />
          <Area
            type="monotone"
            dataKey="baselineGain"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#baselinePositive)"
            baseValue={firstPrice}
            connectNulls
            activeDot={{ r: 6, fill: "#22c55e", stroke: "#f8fafc", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="baselineLoss"
            stroke="#ef4444"
            strokeWidth={2.5}
            fill="url(#baselineNegative)"
            baseValue={firstPrice}
            connectNulls
            activeDot={{ r: 6, fill: "#ef4444", stroke: "#f8fafc", strokeWidth: 2 }}
          />
        </>
      );
    }

    if (effectiveChartType === "candlestick") {
      return (
        <>
          <Line
            type="monotone"
            dataKey="high"
            stroke="rgba(148,163,184,0.55)"
            strokeWidth={1.2}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="rgba(148,163,184,0.35)"
            strokeWidth={1.2}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Bar dataKey="candleBody" barSize={10} radius={[3, 3, 3, 3]} isAnimationActive={false}>
            {chartData.map((entry) => (
              <Cell
                key={entry.index}
                fill={entry.candlePositive ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)"}
                stroke={entry.candleColor}
                strokeWidth={0.8}
              />
            ))}
          </Bar>
        </>
      );
    }

    return (
      <Area
        type="monotone"
        dataKey="close"
        stroke={strokeColor}
        strokeWidth={3}
        fill={fillColor}
        animationDuration={700}
        activeDot={{ r: 6, fill: strokeColor, stroke: "#f8fafc", strokeWidth: 2 }}
      />
    );
  };

  const tickFormatter = (value: number | string) => {
    const numericValue = typeof value === "number" ? value : Number(value);
    return chartData[numericValue]?.axisLabel ?? "";
  };

  return (
    <div className="h-full w-full rounded-[30px] border border-border/50 bg-gradient-to-br from-card/90 via-card/70 to-slate-950/80 p-4 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.9)] sm:p-6">
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={clsx(
                  "h-2.5 w-2.5 rounded-full shadow-[0_0_18px_currentColor]",
                  isPositive ? "bg-success text-success" : "bg-destructive text-destructive",
                )}
              />
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-muted-foreground/70">
                {displayName}
              </p>
              <span className="rounded-full border border-border/40 bg-background/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                {data.ticker}
              </span>
              {timeRange && (
                <span className="rounded-full border border-border/40 bg-background/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  {timeRange}
                </span>
              )}
              {chartType === "candlestick" && !hasOhlc && (
                <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                  Fallback to Area
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <h3 className="text-2xl font-black tracking-[-0.04em] text-foreground sm:text-3xl">
                {formatCurrency(lastPrice, data.currency)}
              </h3>
              <div
                className={clsx(
                  "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-black ring-1 ring-inset",
                  isPositive
                    ? "bg-success/15 text-success ring-success/30"
                    : "bg-destructive/15 text-destructive ring-destructive/30",
                )}
              >
                {absoluteChange >= 0 ? "+" : ""}
                {formatCurrency(absoluteChange, data.currency)}
              </div>
              <div
                className={clsx(
                  "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-black ring-1 ring-inset",
                  isPositive
                    ? "bg-success/15 text-success ring-success/30"
                    : "bg-destructive/15 text-destructive ring-destructive/30",
                )}
              >
                {percentageChange >= 0 ? "+" : ""}
                {percentageChange.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:min-w-[300px]">
            <div className="rounded-2xl border border-border/40 bg-background/25 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">
                Session High
              </p>
              <p className="mt-1 text-sm font-black text-foreground">
                {formatCurrency(maxPrice, data.currency)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-background/25 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">
                Session Low
              </p>
              <p className="mt-1 text-sm font-black text-foreground">
                {formatCurrency(minPrice, data.currency)}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-border/40 bg-background/25 px-3 py-2.5 sm:col-span-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">
                Trend
              </p>
              <p className={clsx("mt-1 text-sm font-black", isPositive ? "text-success" : "text-destructive")}>
                {isPositive ? "Positive Bias" : "Negative Bias"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
          <span className="rounded-full border border-border/40 bg-background/25 px-2.5 py-1">
            {effectiveChartType === "candlestick" ? "OHLC Candle" : effectiveChartType}
          </span>
          {showSma20 && showMovingAverages && (
            <span className="rounded-full border border-blue-400/25 bg-blue-500/10 px-2.5 py-1 text-blue-300">
              SMA 20
            </span>
          )}
          {showSma50 && showMovingAverages && (
            <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-amber-300">
              SMA 50
            </span>
          )}
        </div>

        <div className="min-h-0 flex-1">
          <div className="flex h-full flex-col gap-3">
            <div className={clsx("min-h-0", showVolume && hasVolume ? "flex-[3.6]" : "flex-1")}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  syncId="asset-chart"
                  data={chartData}
                  margin={{ top: 10, right: 22, left: 6, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="pricePositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.32} />
                      <stop offset="90%" stopColor="#22c55e" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="priceNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.28} />
                      <stop offset="90%" stopColor="#ef4444" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="baselinePositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="baselineNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="rgba(148,163,184,0.14)" strokeDasharray="3 5" vertical={false} />

                  <XAxis
                    dataKey="index"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    minTickGap={getMinTickGap(timeRange)}
                    stroke="#94a3b8"
                    style={{ fontSize: "11px", fontWeight: 700 }}
                    tickFormatter={tickFormatter}
                    hide={showVolume && hasVolume}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    width={84}
                    stroke="#94a3b8"
                    style={{ fontSize: "11px", fontWeight: 700 }}
                    tickFormatter={(value: number) => formatAxisCurrency(value, data.currency)}
                    domain={["dataMin", "dataMax"]}
                  />

                  <Tooltip
                    cursor={{ stroke: "rgba(148,163,184,0.72)", strokeWidth: 1.25, strokeDasharray: "5 5" }}
                    isAnimationActive={false}
                    content={(props: TooltipProps<number, string>) => (
                      <ChartTooltip {...props} currency={data.currency} />
                    )}
                  />

                  {renderMainSeries()}

                  {showSma20 && showMovingAverages && (
                    <Line
                      type="monotone"
                      dataKey="sma20"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  )}

                  {showSma50 && showMovingAverages && (
                    <Line
                      type="monotone"
                      dataKey="sma50"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  )}

                  {effectiveChartType !== "baseline" && (
                    <ReferenceLine
                      y={lastPrice}
                      stroke={strokeColor}
                      strokeDasharray="4 6"
                      strokeOpacity={0.45}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {showVolume && hasVolume && (
              <div className="h-[104px] shrink-0 rounded-[22px] border border-border/40 bg-background/20 px-2 pb-1 pt-2">
                <div className="mb-1 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/55">
                  Volume
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    syncId="asset-chart"
                    data={chartData}
                    margin={{ top: 0, right: 22, left: 6, bottom: 10 }}
                  >
                    <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="3 5" vertical={false} />
                    <XAxis
                      dataKey="index"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      minTickGap={getMinTickGap(timeRange)}
                      stroke="#94a3b8"
                      style={{ fontSize: "11px", fontWeight: 700 }}
                      tickFormatter={tickFormatter}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                      width={84}
                      stroke="#64748b"
                      style={{ fontSize: "10px", fontWeight: 700 }}
                      tickFormatter={(value: number) => formatVolume(value)}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(148,163,184,0.06)" }}
                      isAnimationActive={false}
                      content={(props: TooltipProps<number, string>) => (
                        <ChartTooltip {...props} currency={data.currency} />
                      )}
                    />
                    <Bar
                      dataKey="volume"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={14}
                      fill="rgba(96,165,250,0.35)"
                      isAnimationActive={false}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.index} fill={entry.volumeBarColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
