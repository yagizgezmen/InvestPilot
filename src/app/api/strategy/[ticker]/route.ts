import { NextResponse } from 'next/server';
import { recommendationService } from '@/services/RecommendationService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    try {
        const { ticker } = await params;
        if (!ticker) {
            return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
        }

        const strategy = await recommendationService.getAssetStrategy(ticker);
        return NextResponse.json({ strategy });
    } catch (error) {
        console.error('Strategy API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch strategy' }, { status: 500 });
    }
}
