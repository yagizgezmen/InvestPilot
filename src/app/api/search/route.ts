import { NextResponse } from "next/server";
import { marketDataService } from "@/services/MarketDataService";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const assetClass = searchParams.get("assetClass") || undefined;

    try {
        const results = await marketDataService.searchAssets(query, assetClass);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
    }
}
