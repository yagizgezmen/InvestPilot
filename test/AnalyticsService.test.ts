import { describe, it, expect } from 'vitest';
import { analyticsService } from '../src/services/AnalyticsService';
import { MarketData } from '../src/types';

describe('AnalyticsService', () => {

    const mockData: MarketData = {
        ticker: 'TEST',
        currentPrice: 150,
        currency: 'USD',
        history: [
            { time: '2023-01-01T00:00:00Z', close: 100 },
            { time: '2023-01-02T00:00:00Z', close: 110 }, // 10%
            { time: '2023-01-03T00:00:00Z', close: 99 },  // -10%
            { time: '2023-01-04T00:00:00Z', close: 108.9 } // 10%
        ]
    };

    const emptyData: MarketData = {
        ...mockData,
        history: [{ time: '2023-01-01T00:00:00Z', close: 100 }]
    };

    it('calculates volatility correctly', () => {
        const volatility = analyticsService.calculateVolatility(mockData);
        expect(volatility).toBeGreaterThan(0.09);
    });

    it('calculates momentum correctly', () => {
        const momentum = analyticsService.calculateMomentum(mockData);
        expect(momentum).toBeCloseTo(0.089);
    });

    it('calculates max drawdown correctly', () => {
        const drawdown = analyticsService.calculateMaxDrawdown(mockData);
        // Peak is 110. Trough is 99.
        expect(drawdown).toBeCloseTo((110 - 99) / 110);
    });

    it('calculates correlation correctly', () => {
        const data1: MarketData = { ...mockData };
        const data2: MarketData = {
            ...mockData,
            history: mockData.history.map(h => ({ ...h, close: h.close * 2 }))
        };
        const corr = analyticsService.calculateCorrelation(data1, data2);
        expect(corr).toBeCloseTo(1);

        // Test entirely uncorrelated/inverse
        const data3: MarketData = {
            ...mockData,
            history: [
                { time: '2023-01-01T00:00:00Z', close: 100 },
                { time: '2023-01-02T00:00:00Z', close: 90 }, // -10% vs +10%
                { time: '2023-01-03T00:00:00Z', close: 99 }, // +10% vs -10%
                { time: '2023-01-04T00:00:00Z', close: 89.1 } // -10% vs +10%
            ]
        };
        const corr2 = analyticsService.calculateCorrelation(data1, data3);
        expect(corr2).toBeCloseTo(-1);
    });

    it('handles insufficient data cleanly', () => {
        expect(analyticsService.calculateVolatility(emptyData)).toBe(0);
        expect(analyticsService.calculateMomentum(emptyData)).toBe(0);
        expect(analyticsService.calculateMaxDrawdown(emptyData)).toBe(0);
    });
});
