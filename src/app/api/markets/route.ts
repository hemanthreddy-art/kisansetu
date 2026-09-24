import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_MARKET_PRICES, APMC_MARKETS } from '@/lib/constants';
import { MAHARASHTRA_MANDIS, generateMandiTrendSeries } from '@/lib/mandi-network';

/**
 * Market Intelligence API Route
 * 
 * IMPORTANT DATA PRINCIPLE:
 * Real APIs (Agmarknet, eNAM, MSAMB) will replace demo data in future phases.
 * We explicitly mark this as mock/demo data for the prototype and do NOT
 * pretend it is live government API feeds.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const crop = searchParams.get('crop');
  const mandi = searchParams.get('mandi');
  const timeframeParam = searchParams.get('timeframe');
  const timeframe = timeframeParam === '7' ? 7 : timeframeParam === '30' ? 30 : 15;

  let trendResult = null;
  if (crop || mandi) {
    trendResult = generateMandiTrendSeries(crop || 'onion', mandi || 'Lasalgaon APMC', timeframe);
  }

  return NextResponse.json({
    dataSource: 'DEMO_PROTOTYPE_DATA',
    notice: 'Prototype data for Phase 1 architecture. MSAMB / Agmarknet live sync will be integrated in Phase 2.',
    state: 'Maharashtra',
    updatedAt: new Date().toISOString(),
    totalMarkets: APMC_MARKETS.length,
    markets: APMC_MARKETS,
    maharashtraNetwork: MAHARASHTRA_MANDIS,
    latestPrices: SAMPLE_MARKET_PRICES,
    trend: trendResult,
  });
}
