import { MarketData, RiskProfile, TimeHorizon } from "@/types";
import { analyticsService } from "./AnalyticsService";

// Compressed interface specifically for LLM context to save tokens
export interface CompressedMarketData {
    ticker: string;
    currentPrice: number;
    periodStartPrice: number;
    periodHigh: number;
    periodLow: number;
    volatilityEstimate: string;
    momentum: string;
}

export class AIAdvisorService {
    /**
     * Compresses raw MarketData into a token-efficient JSON format for the LLM prompt.
     */
    compressDataForAI(marketDataList: MarketData[]): CompressedMarketData[] {
        return marketDataList.map((data) => {
            if (!data.history || data.history.length === 0) {
                return {
                    ticker: data.ticker,
                    currentPrice: data.currentPrice,
                    periodStartPrice: data.currentPrice,
                    periodHigh: data.currentPrice,
                    periodLow: data.currentPrice,
                    volatilityEstimate: "0.0%",
                    momentum: "0.0%"
                };
            }

            const firstPrice = data.history[0].close;
            const lastPrice = data.history[data.history.length - 1].close;
            const high = Math.max(...data.history.map((h) => h.high ?? h.close));
            const low = Math.min(...data.history.map((h) => low ?? h.close)); // wait math min low has issues?

            // Actually, correctly mapping for low:
            const safeLow = Math.min(...data.history.map((h) => h.low ?? h.close));

            const volatility = analyticsService.calculateVolatility(data);
            const momentum = ((lastPrice - firstPrice) / firstPrice) * 100;

            return {
                ticker: data.ticker,
                currentPrice: data.currentPrice,
                periodStartPrice: firstPrice,
                periodHigh: high,
                periodLow: safeLow,
                volatilityEstimate: `${(volatility * 100).toFixed(2)}%`,
                momentum: `${momentum > 0 ? "+" : ""}${momentum.toFixed(2)}%`
            };
        });
    }

    /**
     * Mock LLM generation for Investment Advice.
     * In the future, this will connect to OpenAI/Anthropic APIs.
     */
    async generateInvestmentAdvice(
        marketDataList: MarketData[],
        riskProfile: RiskProfile,
        timeHorizon: TimeHorizon
    ): Promise<string> {
        // Compress data to save tokens and improve reasoning
        const compressedData = this.compressDataForAI(marketDataList);

        // This is where context string would be piped into an OpenAI fetch request.
        // const promptContext = JSON.stringify(compressedData, null, 2);

        // Simulate network delay for AI thinking (loading state)
        await new Promise((resolve) => setTimeout(resolve, 3500));

        // Generate dynamic mock markdown based on inputs
        const isConservative = riskProfile === "Conservative";
        const isAggressive = riskProfile === "Aggressive";
        const shortTerm = timeHorizon === "0-6m";

        const tickerNames = compressedData.map((d) => d.ticker).join(", ");
        const firstTicker = compressedData[0]?.ticker || "Assets";
        const firstVolatility = compressedData[0]?.volatilityEstimate || "Moderate";
        const firstMomentum = compressedData[0]?.momentum || "0%";

        return `
# 🤖 InvestPilot AI: Portföy Analizi ve Vizyon Raporu

**Analiz Edilen Varlıklar:** ${tickerNames}  
**Kullanıcı Profili:** ${riskProfile} Risk | ${timeHorizon} Vade  

---

## 🎯 Tavsiye Özeti

Seçilen zaman çizelgesi (${timeHorizon}) ve ${riskProfile} risk profilin göz önüne alındığında, stratejik olarak ${isConservative ? "sermaye korumaya" : isAggressive ? "agresif büyümeye" : "dengeli bir getiriye"} odaklanmak en mantıklı yaklaşım olacaktır. ${shortTerm ? "Özellikle kısa vadede oluşabilecek dalgalanmalardan (volatility) korunmak için likit kalarak kademeli bir yaklaşım benimsenmelidir." : "Uzun vade hedeflerin, geçici piyasa çöküşlerini tolere edebileceğini gösteriyor."}

## 📊 ${firstTicker} Özel Varlık Analizi

Görünen o ki **${firstTicker}** için son dönem volatilitesi **${firstVolatility}** ve fiyat momentumu yaklaşık **${firstMomentum}** seviyesinde.

- **Risk/Getiri Durumu:** ${Number(firstVolatility.replace('%', '')) > 30 ? "Oldukça yüksek bir oynaklık mevcut. Bu bir fırsat yaratsa da ana parayı riske atabilir." : "Düşük/Orta oynaklığa sahip ve bu sayede daha güvenilir bir yörünge izliyor."}
- **Fiyat Performansı:** Dönem başından bu yana gerçekleşen ${firstMomentum} değişim, varlığın ${firstMomentum.includes('-') ? "şu an indirimde (veya ayı piyasasında)" : "güçlü bir yükseliş trendinde"} olduğunu işaret ediyor.

## 💡 Strateji Önerisi

${isConservative
                ? "Size kesinlikle **Lump Sum (Toplu Alım) önermiyoruz**. Sermayenizi korumak adına sadece küçük oranlarda portföye dahil edilmeli veya riskten tamamen kaçınılmalıdır."
                : isAggressive
                    ? "Profilinize uygun olarak, fırsatı kaçırmamak adına **büyük oranda alım veya kısa aralıklı DCA** (Dollar Cost Averaging - Kademeli Alım) yapılabilir."
                    : "**DCA (Kademeli Alım) Stratejisi** uygulamanız önerilir. Belirli periyotlarda (örneğin her ay) sabit miktarda alım yaparak ortalama maliyetinizi düşürün."
            }

> [!TIP]
> **DCA (Kademeli Alım) Nasıl Uygulanır?**  
> Varlığın %15 düştüğü günlerde ekstra alımlar yaparak ortalama maliyet avantajını artırabilirsiniz.

## ⚠️ Kritik Riskler

- **Makroekonomik Şartlar:** Faiz kararları ve enflasyon oranları.
- **Sistematik Risk:** ${firstTicker} varlığına özgü beklenmedik haber akışları.
- **Zamanlama Riski:** ${shortTerm ? "Seçtiğiniz vade çok kısa. Piyasalar teknik bir çöküş yaşarsa toparlanmak için vaktiniz olmayabilir!" : "Uzun vadede likidite krizleri veya regülasyon engellerine dikkat edin."}

---

*Bu analiz tamamen eğitim ve fikir verme amaçlıdır, yapay zeka tarafından geçici piyasa verileri referans alınarak oluşturulmuştur. Kesinlikle profesyonel finansal veya yatırım tavsiyesi niteliği taşımaz.*
        `;
    }
}

export const aiAdvisorService = new AIAdvisorService();
