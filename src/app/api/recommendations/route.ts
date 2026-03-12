import { NextResponse } from 'next/server';
import { recommendationService } from '@/services/RecommendationService';
import { AssetClass, RiskProfile, TimeHorizon } from '@/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { assetClass, riskProfile, timeHorizon, constraints } = body as {
            assetClass: AssetClass;
            riskProfile: RiskProfile;
            timeHorizon: TimeHorizon;
            constraints?: any;
        };

        if (!assetClass) {
            return NextResponse.json({ error: "Missing required parameter: assetClass" }, { status: 400 });
        }

        const recommendation = await recommendationService.getSectorAnalysis(
            assetClass,
            riskProfile,
            timeHorizon
        );

        return NextResponse.json(recommendation);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
