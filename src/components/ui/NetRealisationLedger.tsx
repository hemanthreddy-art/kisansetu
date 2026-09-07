import React from 'react';
import { cn } from '@/lib/utils';

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
  const formatInr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
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
            Net Realisation Ledger
          </span>
          <h4 className="font-heading text-base sm:text-lg font-bold text-[#262320]">
            {cropName ? `${cropName} Settlement Breakdown` : 'True Net Realisation'}
          </h4>
        </div>
        {lotQuantityQuintals && (
          <span className="text-xs font-semibold bg-[#ECE7DE] text-[#262320] px-2.5 py-1 rounded-[4px] border border-[#D8D2C4]">
            {lotQuantityQuintals} Qtl
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-[#262320]">
        <div className="flex justify-between items-center py-1">
          <span className="text-[#5A554E]">Gross Mandi Sale Value</span>
          <span className="font-heading font-bold text-[#262320]">{formatInr(grossSaleValue)}</span>
        </div>

        <div className="flex justify-between items-center py-1 text-[#B45309]">
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-xs">−</span>
            <span>Transport Freight</span>
          </span>
          <span className="font-heading font-semibold">−{formatInr(transportFreight)}</span>
        </div>

        <div className="flex justify-between items-center py-1 text-[#B45309]">
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-xs">−</span>
            <span>APMC Mandi Fee & Cess</span>
          </span>
          <span className="font-heading font-semibold">−{formatInr(mandiFee)}</span>
        </div>

        {storageOrOtherCosts > 0 && (
          <div className="flex justify-between items-center py-1 text-[#B45309]">
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-xs">−</span>
              <span>Warehouse Storage & Handling</span>
            </span>
            <span className="font-heading font-semibold">−{formatInr(storageOrOtherCosts)}</span>
          </div>
        )}
      </div>

      <div className="border-t-2 border-[#1B4332] pt-3 flex items-baseline justify-between bg-[#EAF2ED] p-3 rounded-[4px] border border-[#B7D5C4]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] block">
            = Farmer Net Realisation
          </span>
          {netPerQtl && (
            <span className="text-xs font-semibold text-[#2D6A4F]">
              ({formatInr(netPerQtl)} / Quintal)
            </span>
          )}
        </div>
        <span className="font-heading text-xl sm:text-2xl font-black text-[#1B4332]">
          {formatInr(netRealisation)}
        </span>
      </div>
    </div>
  );
}
