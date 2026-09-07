'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn, formatINR } from '@/lib/utils';

export interface NetRealisationLedgerProps extends React.HTMLAttributes<HTMLDivElement> {
  grossSaleValue: number;
  transportFreight: number;
  mandiFee: number;
  storageOrOtherCosts?: number;
  netRealisation: number;
  lotQuantityQuintals?: number;
  cropName?: string;
}

/**
 * NetRealisationLedger — Visual foundation for KisanSetu's core calculation:
 * Gross Sale Value − Transport − Storage − Mandi Fees = NET REALISATION
 * Designed as a practical trade/accounting ledger slip.
 */
export function NetRealisationLedger({
  grossSaleValue,
  transportFreight,
  mandiFee,
  storageOrOtherCosts = 0,
  netRealisation,
  lotQuantityQuintals,
  cropName,
  className,
  ...props
}: NetRealisationLedgerProps) {
  const { t } = useLanguage();
  const netPerQtl = lotQuantityQuintals && lotQuantityQuintals > 0
    ? Math.round(netRealisation / lotQuantityQuintals)
    : null;

  return (
    <div
      className={cn(
        'w-full bg-[#FFFFFF] border border-[#D8D2C4] rounded-[8px] p-5 font-sans space-y-4 shadow-none',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A554E] block">
            {t.netRealisation.ledgerTitle}
          </span>
          <h4 className="font-heading text-base sm:text-lg font-bold text-[#262320]">
            {cropName ? `${cropName} • ${t.netRealisation.settlementBreakdown}` : t.netRealisation.trueNetRealisation}
          </h4>
        </div>
        {lotQuantityQuintals && (
          <span className="text-xs font-semibold bg-[#ECE7DE] text-[#262320] px-2.5 py-1 rounded-[4px] border border-[#D8D2C4]">
            {lotQuantityQuintals} {t.common.quintals}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-[#262320]">
        <div className="flex justify-between items-center py-1">
          <span className="text-[#5A554E]">{t.netRealisation.grossMandiSale}</span>
          <span className="font-heading font-bold text-[#262320]">{formatINR(grossSaleValue)}</span>
        </div>

        <div className="flex justify-between items-center py-1 text-[#B45309]">
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-xs">−</span>
            <span>{t.netRealisation.transportFreightLabel}</span>
          </span>
          <span className="font-heading font-semibold">−{formatINR(transportFreight)}</span>
        </div>

        <div className="flex justify-between items-center py-1 text-[#B45309]">
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-xs">−</span>
            <span>{t.netRealisation.mandiFeeCess}</span>
          </span>
          <span className="font-heading font-semibold">−{formatINR(mandiFee)}</span>
        </div>

        {storageOrOtherCosts > 0 && (
          <div className="flex justify-between items-center py-1 text-[#B45309]">
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-xs">−</span>
              <span>{t.netRealisation.storageHandling}</span>
            </span>
            <span className="font-heading font-semibold">−{formatINR(storageOrOtherCosts)}</span>
          </div>
        )}
      </div>

      <div className="border-t-2 border-[#1B4332] pt-3 flex items-baseline justify-between bg-[#EAF2ED] p-3 rounded-[4px] border border-[#B7D5C4]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] block">
            = {t.netRealisation.farmerNetRealisation}
          </span>
          {netPerQtl && (
            <span className="text-xs font-semibold text-[#2D6A4F]">
              ({formatINR(netPerQtl)} {t.common.perQuintal})
            </span>
          )}
        </div>
        <span className="font-heading text-xl sm:text-2xl font-black text-[#1B4332]">
          {formatINR(netRealisation)}
        </span>
      </div>
    </div>
  );
}
