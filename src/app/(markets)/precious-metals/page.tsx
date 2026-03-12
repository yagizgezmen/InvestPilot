import { DynamicAssetDashboard } from "@/components/DynamicAssetDashboard";

export default function PreciousMetalsPage() {
    return (
        <DynamicAssetDashboard
            assetClass="Precious Metals"
            defaultTicker="XAU"
            title="Precious Metals"
        />
    );
}
