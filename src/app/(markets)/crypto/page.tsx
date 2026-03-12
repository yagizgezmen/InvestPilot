import { DynamicAssetDashboard } from "@/components/DynamicAssetDashboard";

export default function CryptoPage() {
    return (
        <DynamicAssetDashboard
            assetClass="Crypto"
            defaultTicker="BTC"
            title="Crypto Markets"
        />
    );
}
