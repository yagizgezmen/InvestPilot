import { NextResponse } from 'next/server';
import { marketDataService } from '@/services/MarketDataService';
import { ChartTimeRange } from '@/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const currency = searchParams.get('currency') as "USD" | "TRY" || "USD";
    const range = (searchParams.get('range') as ChartTimeRange | null) || "1M";

    if (!ticker) {
        return NextResponse.json({ error: "Missing ticker parameter" }, { status: 400 });
    }

    const data = await marketDataService.getMarketData(ticker, currency, range);
    return NextResponse.json(data);
}
