'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Clock,
  TrendingUp,
  Warehouse,
  ChevronRight,
  Sparkles,
  Info,
  BarChart3,
  Coins,
} from 'lucide-react';
import { calculateSaleWindow, SaleWindowRecommendation } from '@/lib/recommendation';

interface SellingWindowCardProps {
  commodity: string;
  expectedPricePerQuintal?: number | null;
  quantityQuintals?: number | null;
  compact?: boolean;
}

export function SellingWindowCard({
  commodity,
  expectedPricePerQuintal,
  quantityQuintals,
  compact = false,
}: SellingWindowCardProps) {
  const { t } = useLanguage();
  const advisory: SaleWindowRecommendation = calculateSaleWindow({
    commodity,
    expectedPricePerQuintal,
    quantityQuintals,
  });

  const isStore = advisory.action === 'STORE_WAREHOUSE';

  const badgeBg =
    advisory.badgeVariant === 'emerald'
      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
      : advisory.badgeVariant === 'amber'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-blue-100 text-blue-900 border-blue-300';

  const actionBg =
    advisory.badgeVariant === 'emerald'
      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
      : advisory.badgeVariant === 'amber'
      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
      : 'bg-blue-50/70 border-blue-200 text-blue-950';

  if (compact) {
    return (
      <div className={`p-3 rounded-[6px] border ${actionBg} flex items-center justify-between gap-3 text-xs`}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1B4332] shrink-0" />
          <div>
            <div className="font-bold text-[#262320] flex items-center gap-1.5">
              <span>{advisory.actionTitle}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${badgeBg}`}>
                {advisory.badgeLabel}
              </span>
            </div>
            <p className="text-[11px] text-[#635E59] line-clamp-1">{advisory.summaryReason}</p>
          </div>
        </div>

        {isStore ? (
          <Link
            href="/storage"
            className="shrink-0 px-2.5 py-1 rounded bg-[#1B4332] text-white text-[11px] font-bold hover:bg-[#2D6A4F] flex items-center gap-1"
          >
            <span>Storage</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        ) : (
          <Link
            href="/markets"
            className="shrink-0 text-[11px] font-bold text-[#1B4332] hover:underline"
          >
            Signals →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[8px] border border-[#D8D2C4] p-5 shadow-xs">
      {/* Header Strip */}
      <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[4px] bg-[#1B4332] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#262320] font-heading">
              {t.netRealisation?.windowCardTitle || 'Actionable Sale Window Advisory'}
            </h3>
            <p className="text-xs text-[#635E59]">
              Data-backed recommendation based on Agmarknet modal trends &amp; buyer bids
            </p>
          </div>
        </div>

        <span className={`text-xs font-bold px-2.5 py-1 rounded-[4px] border ${badgeBg}`}>
          {advisory.badgeLabel}
        </span>
      </div>

      {/* Main Recommended Action Banner */}
      <div className={`p-4 rounded-[6px] border ${actionBg} mb-4`}>
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1B4332]" />
            <span className="text-sm sm:text-base font-extrabold text-[#1B4332]">
              {advisory.actionTitle}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold bg-white/80 px-2 py-0.5 rounded border border-black/10">
            {advisory.confidenceScore}% Confidence
          </span>
        </div>
        <p className="text-xs leading-relaxed text-[#262320]">{advisory.summaryReason}</p>
      </div>

      {/* 4 Underlying Market Signals Matrix */}
      <div className="mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#635E59] mb-2 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-[#1B4332]" />
          <span>{t.netRealisation?.windowSignalsTitle || 'Underlying Market Signals'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Signal 1: Buyer Demand */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-[4px] p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-500 font-medium">
                {t.netRealisation?.windowDemandSignal || 'Buyer Demand'}:
              </span>
              <span className="font-bold text-emerald-800 text-[11px] bg-emerald-100 px-1.5 py-0.2 rounded">
                {advisory.signals.buyerDemandStrength}
              </span>
            </div>
            <p className="text-[#262320] text-[11px] leading-snug">
              {advisory.signals.buyerDemandDescription}
            </p>
          </div>

          {/* Signal 2: Price Trend */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-[4px] p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-500 font-medium">
                {t.netRealisation?.windowPriceTrendSignal || 'Mandi Price Trend'}:
              </span>
              <span
                className={`font-bold text-[11px] px-1.5 py-0.2 rounded ${
                  advisory.signals.priceTrendDirection === 'RISING'
                    ? 'text-emerald-800 bg-emerald-100'
                    : 'text-stone-800 bg-stone-200'
                }`}
              >
                {advisory.signals.priceTrendDirection}
              </span>
            </div>
            <p className="text-[#262320] text-[11px] leading-snug">
              {advisory.signals.priceTrendDescription}
            </p>
          </div>

          {/* Signal 3: APMC Arrivals */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-[4px] p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-500 font-medium">
                {t.netRealisation?.windowArrivalsSignal || 'APMC Arrivals'}:
              </span>
              <span className="font-bold text-stone-700 text-[11px] bg-stone-100 px-1.5 py-0.2 rounded">
                {advisory.signals.arrivalVolumePressure}
              </span>
            </div>
            <p className="text-[#262320] text-[11px] leading-snug">
              {advisory.signals.arrivalVolumeDescription}
            </p>
          </div>

          {/* Signal 4: Holding Benefit */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-[4px] p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-500 font-medium">
                {t.netRealisation?.windowHoldingUpsideSignal || 'Holding Realisation'}:
              </span>
              <Coins className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-[#262320] text-[11px] leading-snug">
              {advisory.signals.holdingRiskVsBenefit}
            </p>
          </div>
        </div>
      </div>

      {/* Direct Action Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#ECE7DE]">
        <p className="text-[10px] text-[#635E59] flex items-center gap-1">
          <Info className="w-3.5 h-3.5 shrink-0 text-stone-400" />
          <span>
            {t.netRealisation?.windowDisclaimer ||
              'Algorithmic advisory based on Agmarknet modal trends and active corporate bids. Market conditions may fluctuate.'}
          </span>
        </p>

        {isStore ? (
          <Link
            href="/storage"
            className="shrink-0 px-3.5 py-1.5 rounded-[4px] bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] flex items-center gap-1.5 transition-colors"
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>{t.netRealisation?.storageReserveBtn || 'Book MSWC Storage Slot'}</span>
          </Link>
        ) : (
          <Link
            href="/markets"
            className="shrink-0 px-3.5 py-1.5 rounded-[4px] border border-[#1B4332] text-[#1B4332] text-xs font-bold hover:bg-[#EAF2ED] flex items-center gap-1.5 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.markets?.trendChartTitle || 'Check Historical Trends'}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
