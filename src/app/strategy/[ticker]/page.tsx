import { notFound } from "next/navigation";
import StrategyExperience from "@/components/StrategyExperience";

interface AssetStrategyPageProps {
  params: Promise<{
    ticker?: string;
  }>;
}

export default async function AssetStrategyPage({ params }: AssetStrategyPageProps) {
  const { ticker } = await params;
  const normalizedTicker = ticker?.trim().toUpperCase();

  if (!normalizedTicker) {
    notFound();
  }

  return <StrategyExperience ticker={normalizedTicker} />;
}
