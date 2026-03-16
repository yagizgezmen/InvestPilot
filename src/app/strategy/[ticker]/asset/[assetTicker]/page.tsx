import { notFound } from "next/navigation";
import StrategyExperience from "@/components/StrategyExperience";

interface AssetStrategyDetailPageProps {
  params: Promise<{
    ticker?: string;
    assetTicker?: string;
  }>;
}

export default async function AssetStrategyDetailPage({ params }: AssetStrategyDetailPageProps) {
  const { ticker, assetTicker } = await params;
  const normalizedTicker = ticker?.trim().toUpperCase();
  const normalizedAssetTicker = assetTicker?.trim().toUpperCase();

  if (!normalizedTicker || !normalizedAssetTicker) {
    notFound();
  }

  return (
    <StrategyExperience
      ticker={normalizedAssetTicker}
      parentTicker={normalizedTicker}
      detailMode
    />
  );
}
