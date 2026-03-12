import { describe, it, expect, vi } from 'vitest';
import { marketDataService } from '../src/services/MarketDataService';

describe('MarketDataService', () => {
    it('should fetch and normalize crypto data correctly using CoinGecko', async () => {
        // We actually hit the network here unless mocked, since it's "minimal tests", 
        // let's do a live sanity check or mock the provider. 
        // We'll mock the getProvider method to just return a controlled response.
        const mockProvider = {
            searchInstruments: vi.fn(),
            getQuote: vi.fn().mockResolvedValue({
                price: 50000,
                changePct: 5,
                currency: 'usd',
                timestamp: new Date().toISOString()
            }),
            getHistory: vi.fn().mockResolvedValue([
                { time: '2023-01-01', close: 40000, price: 40000 },
                { time: '2023-01-02', close: 50000, price: 50000 }
            ])
        };

        // Inject mock
        (marketDataService as any).cryptoProvider = mockProvider;

        const data = await marketDataService.getMarketData('BTC', 'USD', '1M');
        expect(data.ticker).toBe('BTC');
        expect(data.currentPrice).toBe(50000);
        expect(data.changePct).toBe(5);
        expect(data.history.length).toBe(2);
        expect(data.history[0].close).toBe(40000);
    });

    it('should cache quotes effectively', async () => {
        const mockProvider = {
            searchInstruments: vi.fn(),
            getQuote: vi.fn().mockResolvedValue({
                price: 100,
                changePct: 1,
                currency: 'usd',
                timestamp: new Date().toISOString()
            }),
            getHistory: vi.fn().mockResolvedValue([])
        };

        (marketDataService as any).usCommodityProvider = mockProvider;

        await marketDataService.getMarketData('AAPL', 'USD', '1D');
        await marketDataService.getMarketData('AAPL', 'USD', '1D');

        // Provider should only be called once because of cache
        expect(mockProvider.getQuote).toHaveBeenCalledTimes(1);
    });
});
