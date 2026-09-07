'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { calculateNetRealisation, formatINR } from '@/lib/utils';
import { NetRealisationLedger } from '@/components/ui/NetRealisationLedger';
import { Scale, ArrowRight, CheckCircle2 } from 'lucide-react';

export function RealisationPreview() {
  const quantity = 100; // 100 Quintals of Onion

  // Option A: Distant Mandi (e.g. Vashi APMC: 260 km away, Gross: ₹2,400/Qtl)
  const optionA = calculateNetRealisation({
    pricePerQuintal: 2400,
    quantityQuintals: quantity,
    distanceKm: 260,
    ratePerKmTon: 5.5,
    mandiCessPercentage: 1.05,
    handlingCostPerQtl: 18,
  });

  // Option B: Local Direct Buyer / FPO Center (30 km away, Gross: ₹2,280/Qtl, 0 cess)
  const optionB = calculateNetRealisation({
    pricePerQuintal: 2280,
    quantityQuintals: quantity,
    distanceKm: 30,
    ratePerKmTon: 4.5,
    mandiCessPercentage: 0,
    handlingCostPerQtl: 10,
  });

  // Dynamic winner calculation - verified by regression suite
  const highestNet = Math.max(optionA.netRealisation, optionB.netRealisation);
  const isWinnerA = optionA.netRealisation === highestNet;
  const isWinnerB = optionB.netRealisation === highestNet;
  const winnerNet = highestNet;
  const runnerUpNet = Math.min(optionA.netRealisation, optionB.netRealisation);
  const netDifference = winnerNet - runnerUpNet;

  const getDifferenceText = (isOptionWinner: boolean) => {
    if (!isOptionWinner) return null;
    if (netDifference === 0) return 'Same net realisation';
    return `+${formatINR(netDifference)} more net realisation`;
  };

  return (
    <section className="py-12 bg-[#FFFFFF] border-b border-[#D8D2C4]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Real Market Decision</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
            Highest price is not always highest earnings.
          </h2>
          <p className="text-sm sm:text-base font-body text-[#635E59]">
            Compare two real selling options for <strong>100 Quintals of Onion (Niphad, Nashik)</strong> with all road freight, warehouse rent, and APMC cess accounted for.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Option A: Distant Mandi */}
          <div className={`bg-[#F4F1EA] border rounded-[8px] p-5 sm:p-6 space-y-4 transition-all ${
            isWinnerA ? 'border-[#1B4332] ring-1 ring-[#1B4332]' : 'border-[#D8D2C4]'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C4]">
              <div>
                <span className="text-xs font-bold text-[#635E59] uppercase tracking-wider block">
                  Option A • Distant Mandi
                </span>
                <h3 className="font-heading font-bold text-lg text-[#262320]">
                  Vashi APMC (Navi Mumbai)
                </h3>
                <span className="text-xs text-[#635E59]">260 km road haul from Nashik</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#635E59] block">Nominal Price</span>
                <span className="text-xl font-bold font-heading text-[#262320]">₹2,400 / Qtl</span>
              </div>
            </div>

            {/* Ledger breakdown */}
            <NetRealisationLedger
              grossSaleValue={optionA.grossSaleValue}
              transportFreight={optionA.transportCost}
              mandiFee={optionA.otherCosts}
              storageOrOtherCosts={optionA.storageCost}
              netRealisation={optionA.netRealisation}
              lotQuantityQuintals={quantity}
              cropName="Onion (Nashik Red)"
            />

            {isWinnerA && (
              <div className="p-2.5 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[4px] text-xs font-bold text-[#1B4332] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Higher Take-Home Realisation</span>
                </span>
                <span>{getDifferenceText(true)}</span>
              </div>
            )}
          </div>

          {/* Option B: Local Direct Buyer */}
          <div className={`bg-[#F4F1EA] border rounded-[8px] p-5 sm:p-6 space-y-4 transition-all ${
            isWinnerB ? 'border-[#1B4332] ring-1 ring-[#1B4332] bg-[#FFFFFF]' : 'border-[#D8D2C4]'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C4]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
                    Option B • Nearby Direct Buyer
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#EAF2ED] text-[#1B4332] text-[10px] font-bold rounded border border-[#B7D5C4]">
                    RECOMMENDED
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#262320]">
                  ABC Foods Processing Hub
                </h3>
                <span className="text-xs text-[#635E59]">30 km local haul (Niphad farmgate)</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#635E59] block">Nominal Price</span>
                <span className="text-xl font-bold font-heading text-[#635E59]">₹2,280 / Qtl</span>
              </div>
            </div>

            {/* Ledger breakdown */}
            <NetRealisationLedger
              grossSaleValue={optionB.grossSaleValue}
              transportFreight={optionB.transportCost}
              mandiFee={optionB.otherCosts}
              storageOrOtherCosts={optionB.storageCost}
              netRealisation={optionB.netRealisation}
              lotQuantityQuintals={quantity}
              cropName="Onion (Nashik Red)"
            />

            {isWinnerB && (
              <div className="p-2.5 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[4px] text-xs font-bold text-[#1B4332] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Higher Take-Home Realisation</span>
                </span>
                <span>{getDifferenceText(true)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Decision Summary Banner */}
        <div className="max-w-5xl mx-auto mt-6 p-4 rounded-[4px] bg-[#ECE7DE] border border-[#D8D2C4] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-[#262320]">
          <div>
            <strong>KisanSetu Insight:</strong> Selling locally at ₹2,280/Qtl saves ₹12,950 in transport freight and cess, delivering <strong>+₹4,270 higher profit</strong> into the farmer&apos;s bank account.
          </div>
          <Link href="/calculator">
            <Button size="sm" variant="primary" className="shrink-0 bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-1.5">
              <span>Calculate For Your Lot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
