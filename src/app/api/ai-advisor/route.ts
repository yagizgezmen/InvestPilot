import { NextResponse } from "next/server";
import { aiAdvisorService } from "@/services/AIAdvisorService";
import { marketDataService } from "@/services/MarketDataService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { assets, riskProfile, timeHorizon } = body;

        if (!assets || !Array.isArray(assets) || assets.length === 0) {
            return NextResponse.json({ error: "Missing or invalid assets array" }, { status: 400 });
        }
        if (!riskProfile || !timeHorizon) {
            return NextResponse.json({ error: "Missing risk profile or time horizon" }, { status: 400 });
        }

        // Fetch market data for each requested asset (concurrently)
        // Ensure no failures block the whole process if one ticker is bad
        const marketDataPromises = assets.map(async (ticker) => {
            try {
                return await marketDataService.getMarketData(ticker, "USD", "1M");
            } catch (e) {
                console.error(`Failed fetching data for ${ticker} in AI route`, e);
                return null;
            }
        });

        const marketDataResults = await Promise.all(marketDataPromises);
        const validMarketData = marketDataResults.filter(d => d !== null) as NonNullable<typeof marketDataResults[0]>[];

        if (validMarketData.length === 0) {
            return NextResponse.json({ error: "Failed to fetch any market data for the provided assets." }, { status: 500 });
        }

        // Generate the markdown advice
        const adviceMarkdown = await aiAdvisorService.generateInvestmentAdvice(
            validMarketData,
            riskProfile,
            timeHorizon
        );

        return NextResponse.json({ advice: adviceMarkdown });
    } catch (e) {
        console.error("AI Advisor API Error:", e);
        return NextResponse.json({ error: "Failed to generate AI advice." }, { status: 500 });
    }
}
