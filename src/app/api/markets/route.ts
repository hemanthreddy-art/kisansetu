import { NextResponse } from 'next/server';
import { SAMPLE_MARKET_PRICES, APMC_MARKETS } from '@/lib/constants';

/**
 * Market Intelligence API Route
 * 
 * IMPORTANT DATA PRINCIPLE:
 * Real APIs (Agmarknet, eNAM, MSAMB) will replace demo data in future phases.
 * We explicitly mark this as mock/demo data for the prototype and do NOT
 * pretend it is live government API feeds.
 */
export async function GET() {
  return NextResponse.json({
    dataSource: 'DEMO_PROTOTYPE_DATA',
    notice: 'Prototype data for Phase 1 architecture. MSAMB / Agmarknet live sync will be integrated in Phase 2.',
    state: 'Maharashtra',
    updatedAt: new Date().toISOString(),
    totalMarkets: APMC_MARKETS.length,
    markets: APMC_MARKETS,
    latestPrices: SAMPLE_MARKET_PRICES,
  });
}
