import { NextResponse } from 'next/server';
import { marketDataService } from '@/services/MarketDataService';
import { analyticsService } from '@/services/AnalyticsService';
import { Asset, RiskProfile, BestOpportunityResponse } from '@/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { watchlist, riskProfile } = body as {
            watchlist: string[];
            riskProfile: RiskProfile;
        };

        if (!watchlist || !Array.isArray(watchlist) || watchlist.length < 2) {
            return NextResponse.json({ error: "Invalid watchlist (minimun 2 required)" }, { status: 400 });
        }

        const allAssets = Object.values(marketDataService.getAssets()).flat();
        const selectedAssets = allAssets.filter(a => watchlist.includes(a.ticker));

        const marketDataMap = new Map();
        for (const asset of selectedAssets) {
            const data = await marketDataService.getMarketData(asset.ticker);
            if (!data.error) {
                marketDataMap.set(asset.ticker, data);
            }
        }

        const explanations: Record<string, string> = {};
        const scoredAssets = [];
        const correlationMatrix: Record<string, Record<string, number>> = {};

        // Initialize correlation matrix base
        for (const a1 of selectedAssets) {
            correlationMatrix[a1.ticker] = {};
            for (const a2 of selectedAssets) {
                correlationMatrix[a1.ticker][a2.ticker] = 1; // self is 1
            }
        }

        for (const asset of selectedAssets) {
            const data = marketDataMap.get(asset.ticker);
            if (!data) {
                explanations[asset.ticker] = "Market data unavailable for this asset.";
                continue;
            }

            const volatility = analyticsService.calculateVolatility(data);
            const momentum = analyticsService.calculateMomentum(data);
            const maxDrawdown = analyticsService.calculateMaxDrawdown(data);

            let score = 0;
            let rationale = `Ann. Vol: ${(volatility * 100).toFixed(2)}%, Mom: ${(momentum * 100).toFixed(2)}%, Max DD: ${(maxDrawdown * 100).toFixed(2)}%. `;

            if (riskProfile === "Conservative") {
                score = momentum - (volatility * 2.5) - (maxDrawdown * 3);
                rationale += "Scored emphasizing capital preservation (low DD/Vol).";
            } else if (riskProfile === "Balanced") {
                score = momentum - (volatility * 1.5) - (maxDrawdown * 1.5);
                rationale += "Balanced momentum vs. volatility/drawdown.";
            } else {
                score = (momentum * 2.5) - volatility - maxDrawdown;
                rationale += "Scored emphasizing momentum and alpha generation.";
            }

            let avgCorrelation = 0;
            if (marketDataMap.size > 1) {
                let corrSum = 0;
                let count = 0;
                for (const [otherTicker, otherData] of marketDataMap.entries()) {
                    if (otherTicker !== asset.ticker) {
                        const corr = analyticsService.calculateCorrelation(data, otherData);
                        correlationMatrix[asset.ticker][otherTicker] = corr;
                        corrSum += corr;
                        count++;
                    }
                }
                if (count > 0) avgCorrelation = corrSum / count;

                if (avgCorrelation < 0.5) {
                    score += 0.05;
                    rationale += ` Avg Corr: ${avgCorrelation.toFixed(2)} (Diversification bonus applied).`;
                } else {
                    rationale += ` Avg Corr: ${avgCorrelation.toFixed(2)}.`;
                }
            }

            explanations[asset.ticker] = rationale;
            scoredAssets.push({ asset, score });
        }

        const ranked = scoredAssets
            .sort((a, b) => b.score - a.score)
            .map(s => s.asset);

        const response: BestOpportunityResponse = {
            ranked,
            explanations,
            correlationMatrix
        };

        return NextResponse.json(response);

    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
