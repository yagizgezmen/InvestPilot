import { expect, test, describe } from 'vitest';
import { analyticsService } from '../AnalyticsService';
import { MarketData } from '../../types';

describe('AnalyticsService Utilities', () => {

    const generateMockData = (prices: number[]): MarketData => {
        return {
            ticker: "TEST",
            currentPrice: prices[prices.length - 1],
            currency: "USD",
            history: prices.map((p, i) => ({
                time: `2024-01-0${i + 1}T00:00:00Z`,
                close: p,
                price: p
            }))
        };
    };

    test('calculateMomentum computes correctly based on first and last price', () => {
        const data = generateMockData([100, 105, 110, 115, 120]);
        const momentum = analyticsService.calculateMomentum(data);
        expect(momentum).toBeCloseTo(0.20); // (120 - 100) / 100
    });

    test('calculateMomentum handles negative returns', () => {
        const data = generateMockData([100, 90, 80, 70, 60]);
        const momentum = analyticsService.calculateMomentum(data);
        expect(momentum).toBeCloseTo(-0.40); // (60 - 100) / 100
    });

    test('calculateMaxDrawdown correctly finds the maximum peak-to-trough drop', () => {
        // Peak is 100, drops to 80 (20% DD), goes to 120 (new peak), drops to 90 (25% DD from 120).
        // Max DD should be 25%.
        const data = generateMockData([100, 90, 80, 120, 110, 90]);
        const maxDd = analyticsService.calculateMaxDrawdown(data);
        expect(maxDd).toBeCloseTo(0.25); // (120 - 90) / 120
    });

    test('calculateVolatility approximates standard deviation over 252 days', () => {
        // 5 periods of returns
        // 100 -> 101 (1%), 101 -> 102 (0.99%), 102 -> 101 (-0.98%), 101 -> 100 (-0.99%)
        const data = generateMockData([100, 101, 102, 101, 100]);
        const vol = analyticsService.calculateVolatility(data);

        // Calculate manually to verify
        // returns: [0.01, ~0.0099, ~-0.0098, ~-0.0099]
        const returns = [(101 - 100) / 100, (102 - 101) / 101, (101 - 102) / 102, (100 - 101) / 101];
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        const expectedVol = Math.sqrt(variance) * Math.sqrt(252);

        expect(vol).toBeCloseTo(expectedVol);
    });

    test('calculateCorrelation correctly correlates two aligned assets', () => {
        // Test perfectly correlated assets
        const data1 = generateMockData([100, 110, 120, 100, 90]);
        const data2 = generateMockData([50, 55, 60, 50, 45]); // Exactly 0.5 ratio, returns are identical

        const corr = analyticsService.calculateCorrelation(data1, data2);
        expect(corr).toBeCloseTo(1.0);
    });

    test('calculateCorrelation handles inversely correlated assets', () => {
        // Test perfectly inversely correlated assets by ensuring returns are exact mathematical opposites
        // Prices 1 yield returns: [0.1, -0.1, 0.2]
        // Prices 2 yield returns: [-0.1, 0.1, -0.2]
        const data1 = generateMockData([100, 110, 99, 118.8]);
        const data2 = generateMockData([100, 90, 99, 79.2]);

        const corr = analyticsService.calculateCorrelation(data1, data2);
        expect(corr).toBeCloseTo(-1.0);
    });

    test('Returns 0 for metrics with insufficient data', () => {
        const shortData = generateMockData([100]);
        expect(analyticsService.calculateMomentum(shortData)).toBe(0);
        expect(analyticsService.calculateMaxDrawdown(shortData)).toBe(0);
        expect(analyticsService.calculateVolatility(shortData)).toBe(0);
        expect(analyticsService.calculateCorrelation(shortData, shortData)).toBe(0);
    });
});
