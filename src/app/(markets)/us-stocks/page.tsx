import { DynamicAssetDashboard } from "@/components/DynamicAssetDashboard";

export default function UsStocksPage() {
    return (
        <DynamicAssetDashboard
            assetClass="US Stocks"
            defaultTicker="NVDA"
            title="US Stocks"
        />
    );
}
