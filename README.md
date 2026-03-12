# InvestPilot

InvestPilot is an advanced investment decision and comparison application built with Next.js, React, Tailwind CSS (via Vanilla CSS config mapping), and TypeScript.

The app is designed to help users compare and decide how to invest across various asset classes including Crypto, Gold/Silver, US Stocks, and TR Stocks.

## Features
- **Market Overview Dashboard**: Real-time mock data mapping, trend visualization, and recent history using `recharts`.
- **Investment Methods**: Get strategic methodologies mapped directly to your exact asset class, time horizon, and risk profile.
- **Best Opportunities Scanner**: Rank a custom watchlist of assets by calculating momentum and penalizing historical volatility according to your risk appetite.

## Getting Started

### Prerequisites
Make sure you have Node.js 18+ installed. 

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running Tests
The project includes unit tests for the analytics services. Run them using Vitest:
```bash
npx vitest run
```

## Architecture & Data Providers

InvestPilot uses a Service Layer architecture to abstract data fetching and analytics logic from the Next.js API routing.

- **MarketDataService (`src/services/MarketDataService.ts`)**: Currently handles fetching data. It implements an in-memory caching mechanism.
- **AnalyticsService (`src/services/AnalyticsService.ts`)**: Calculates basic momentum and historical volatility (standard deviation of returns).
- **RecommendationService (`src/services/RecommendationService.ts`)**: Houses the rule engine for producing the "best ways to invest" mapping.

### Swapping Providers

To integrate real-world data providers (e.g. CoinGecko, Yahoo Finance, etc.):
1. Open `src/services/MarketDataService.ts`.
2. Inside the `getMarketData` function, replace the `mockData` payload generation with specific fetch calls depending on the asset class. 
   - _Note: Use the `getAssets()` mapping to determine the `AssetClass` of a given ticker if routing to specific external APIs is required._
3. Ensure the return object conforms to the `MarketData` interface found in `src/types/index.ts`. The rest of the application will seamlessly accept the new data source.
