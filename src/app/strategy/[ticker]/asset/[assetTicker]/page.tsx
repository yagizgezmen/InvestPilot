"use client";

import { useParams } from "next/navigation";
import StrategyExperience from "@/components/StrategyExperience";

export default function AssetStrategyDetailPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const assetTicker = params.assetTicker as string;

  return <StrategyExperience ticker={assetTicker} parentTicker={ticker} detailMode />;
}
