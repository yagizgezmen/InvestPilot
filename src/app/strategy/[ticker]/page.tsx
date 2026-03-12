"use client";

import { useParams } from "next/navigation";
import StrategyExperience from "@/components/StrategyExperience";

export default function AssetStrategyPage() {
  const params = useParams();
  const ticker = params.ticker as string;

  return <StrategyExperience ticker={ticker} />;
}
