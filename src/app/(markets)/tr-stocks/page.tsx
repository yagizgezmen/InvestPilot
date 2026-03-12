import { DynamicAssetDashboard } from "@/components/DynamicAssetDashboard";

export default function TrStocksPage() {
    return (
        <DynamicAssetDashboard
            assetClass="TR Stocks"
            defaultTicker="THYAO"
            title="Turkish Stocks"
        />
    );
}
