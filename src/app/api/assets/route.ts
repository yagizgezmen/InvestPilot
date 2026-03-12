import { NextResponse } from 'next/server';
import { marketDataService } from '@/services/MarketDataService';

export async function GET() {
    const assets = marketDataService.getAssets();
    return NextResponse.json(assets);
}
