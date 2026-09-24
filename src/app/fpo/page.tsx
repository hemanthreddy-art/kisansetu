'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Building2,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Layers,
  Sparkles,
  Info,
  Check,
  AlertCircle,
} from 'lucide-react';

interface CorporateDemand {
  id: string;
  buyerName: string;
  commodity: string;
  variety: string;
  requiredQuantityQtl: number;
  offerPricePerQtl: number;
  destination: string;
  deliveryDeadline: string;
  specifications: string;
  procurementType: string;
}

interface MicroLot {
  id: string;
  farmerName: string;
  village: string;
  commodity: string;
  variety: string;
  quantityQuintals: number;
  individualMandiPrice: number;
  fpoPooledPrice: number;
  fpoPremiumPerQtl: number;
  moisturePct: number;
  status: string;
}

interface FpoDetails {
  name: string;
  registrationNumber: string;
  district: string;
  taluka: string;
  totalMembersCount: number;
  contactPerson: string;
}

interface AggregatedLotResult {
  lotCode: string;
  quantityQuintals: number;
  expectedPricePerQuintal: number;
  totalValuation: number;
  fpoCollectiveBonus: number;
  pooledTransportSavings: number;
  sourceLotsCount: number;
  status: string;
}

export default function FpoAggregationPage() {
  const { t } = useLanguage();

  const [fpoDetails, setFpoDetails] = useState<FpoDetails>({
    name: 'Nashik Agro Farmer Producer Co. Ltd.',
    registrationNumber: 'MH-NSK-FPO-2024-8841',
    district: 'Nashik',
    taluka: 'Niphad',
    totalMembersCount: 428,
    contactPerson: 'Vilasrao Shinde',
  });

  const [demands, setDemands] = useState<CorporateDemand[]>([]);
  const [selectedDemand, setSelectedDemand] = useState<CorporateDemand | null>(null);

  const [microLots, setMicroLots] = useState<MicroLot[]>([]);
  const [selectedLotIds, setSelectedLotIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aggregationResult, setAggregationResult] = useState<AggregatedLotResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadFpoData() {
      try {
        const res = await fetch('/api/fpo/aggregate');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.fpo) setFpoDetails(data.fpo);
            if (data.corporateDemands?.length > 0) {
              setDemands(data.corporateDemands);
              setSelectedDemand(data.corporateDemands[0]);
            }
            if (data.eligibleLots?.length > 0) {
              setMicroLots(data.eligibleLots);
              // Pre-select first 3 micro-lots
              setSelectedLotIds(data.eligibleLots.slice(0, 3).map((l: MicroLot) => l.id));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch FPO aggregation data', err);
      }
    }
    loadFpoData();
  }, []);

  // Calculate live collective metrics
  const selectedLots = microLots.filter((l) => selectedLotIds.includes(l.id));
  const totalPooledQty = selectedLots.reduce((acc, l) => acc + l.quantityQuintals, 0);

  const targetOfferPrice = selectedDemand ? selectedDemand.offerPricePerQtl : 2450;
  const collectiveValuation = totalPooledQty * targetOfferPrice;

  // Individual mandi spot comparison (average ~2,150)
  const baseIndividualValuation = selectedLots.reduce(
    (acc, l) => acc + l.quantityQuintals * l.individualMandiPrice,
    0
  );
  const collectivePricePremium = collectiveValuation - baseIndividualValuation;
  const pooledFreightSavings = Math.round(totalPooledQty * 65); // ₹65/Qtl saving on single 10T truck vs 5 mini-tempos
  const netMemberAdvantage = collectivePricePremium + pooledFreightSavings;

  const targetQuota = selectedDemand?.requiredQuantityQtl || 100;
  const progressPct = Math.min(100, Math.round((totalPooledQty / targetQuota) * 100));

  const toggleSelectLot = (id: string) => {
    if (selectedLotIds.includes(id)) {
      setSelectedLotIds(selectedLotIds.filter((item) => item !== id));
    } else {
      setSelectedLotIds([...selectedLotIds, id]);
    }
  };

  const selectAllLots = () => {
    if (selectedLotIds.length === microLots.length) {
      setSelectedLotIds([]);
    } else {
      setSelectedLotIds(microLots.map((l) => l.id));
    }
  };

  const handleAggregateLots = async () => {
    if (selectedLotIds.length === 0) {
      setErrorMsg('Please select at least one micro-lot to pool.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/fpo/aggregate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotIds: selectedLotIds,
          targetDemandId: selectedDemand?.id,
          corporateBuyerName: selectedDemand?.buyerName,
          pooledPricePerQtl: targetOfferPrice,
          commodity: selectedDemand?.commodity || 'Onion',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAggregationResult(data.aggregatedLot);
      } else {
        setErrorMsg(data.error || 'Failed to aggregate micro-lots');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error occurred while aggregating lots';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header Banner */}
      <div className="bg-[#1B4332] text-white py-10 border-b border-[#143225]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F] text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>{t.farmer.fpoBadge || 'Farmer Producer Organization (FPO Desk)'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white">
                {t.farmer.fpoDeskTitle || 'FPO Micro-Lot Aggregation Console'}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-emerald-100 max-w-2xl">
                {fpoDetails.name} • {t.farmer.fpoRegNo || fpoDetails.registrationNumber}
              </p>
            </div>

            {/* FPO Member Stats */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-[6px] p-4 flex items-center gap-6">
              <div>
                <div className="text-xs text-emerald-200 uppercase font-medium">FPO Members</div>
                <div className="text-xl font-bold text-white font-mono">{fpoDetails.totalMembersCount} Farmers</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="text-xs text-emerald-200 uppercase font-medium">Avg Premium</div>
                <div className="text-xl font-bold text-amber-300 font-mono">+14.2%</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="text-xs text-emerald-200 uppercase font-medium">Govt Recognition</div>
                <div className="text-xl font-bold text-emerald-300 font-mono">SFAC / MSAMB</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prototype Notice */}
      <div className="bg-[#F4EFE6] border-b border-[#D8D2C4] py-2 px-4 text-xs text-[#635E59]">
        <div className="container mx-auto max-w-7xl flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1B4332] shrink-0" />
          <span>
            SIH PS 26132 FPO Micro-Lot Aggregation Engine: Pooling 10–35 Qtl smallholder lots to fulfill corporate bulk contracts at institutional premium pricing.
          </span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[6px] text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Cols: Target Corporate Demand & Micro-Lot Checklist */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Target Corporate Procurement Contract Selector */}
            <div className="bg-white rounded-[6px] border border-[#D8D2C4] p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#262320] font-heading flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1B4332]" />
                    <span>{t.farmer.fpoTargetBuyerDemandTitle || 'Target Corporate Buyer Demand'}</span>
                  </h2>
                  <p className="text-xs text-[#635E59]">
                    {t.farmer.fpoTargetBuyerDemandSub || 'Select an institutional buyer contract to aggregate lots for'}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                  Verified Demand
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {demands.map((dem) => {
                  const isSelected = selectedDemand?.id === dem.id;
                  return (
                    <button
                      key={dem.id}
                      type="button"
                      onClick={() => setSelectedDemand(dem)}
                      className={`p-3 rounded-[4px] border text-left transition-all relative ${
                        isSelected
                          ? 'border-[#1B4332] bg-[#FAF8F5] ring-1 ring-[#1B4332]'
                          : 'border-[#D8D2C4] bg-white hover:bg-stone-50'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1B4332]" />
                      )}
                      <div className="text-[11px] font-bold text-[#635E59] uppercase">{dem.commodity}</div>
                      <div className="text-xs font-bold text-[#262320] mt-0.5 line-clamp-1">{dem.buyerName}</div>
                      <div className="mt-2 text-sm font-extrabold text-[#1B4332] font-mono">
                        ₹{dem.offerPricePerQtl}
                        <span className="text-[10px] font-normal text-[#635E59]">/Qtl</span>
                      </div>
                      <div className="text-[11px] text-stone-600 mt-1">
                        Need: <strong>{dem.requiredQuantityQtl} Qtl</strong>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Progress Toward Corporate Contract */}
              {selectedDemand && (
                <div className="mt-4 pt-3 border-t border-[#ECE7DE]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#635E59] font-medium">
                      Contract Target: <strong className="text-[#262320]">{targetQuota} Quintals</strong>
                    </span>
                    <span className="font-mono font-bold text-[#1B4332]">
                      {totalPooledQty} / {targetQuota} Qtl ({progressPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#ECE7DE] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#1B4332] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Specs: {selectedDemand.specifications} • Destination: {selectedDemand.destination}</span>
                  </p>
                </div>
              )}
            </div>

            {/* 2. Micro-Lot Selection Checklist */}
            <div className="bg-white rounded-[6px] border border-[#D8D2C4] p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#262320] font-heading flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1B4332]" />
                    <span>{t.farmer.fpoEligibleLotsTitle || 'Eligible Smallholder Micro-Lots'}</span>
                  </h3>
                  <p className="text-xs text-[#635E59]">
                    {t.farmer.fpoEligibleLotsSub ||
                      'Smallholder harvests (10–35 Qtl) that qualify for collective aggregation'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={selectAllLots}
                  className="text-xs font-semibold text-[#1B4332] hover:underline"
                >
                  {selectedLotIds.length === microLots.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-3">
                {microLots.map((lot) => {
                  const isChecked = selectedLotIds.includes(lot.id);
                  return (
                    <div
                      key={lot.id}
                      onClick={() => toggleSelectLot(lot.id)}
                      className={`p-3.5 rounded-[4px] border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'border-[#1B4332] bg-[#FAF8F5]'
                          : 'border-[#D8D2C4] bg-white hover:bg-[#FAFBF9]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-[3px] border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-[#1B4332] border-[#1B4332] text-white' : 'border-[#D8D2C4] bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#262320]">{lot.farmerName}</span>
                            <span className="text-[10px] text-[#635E59] bg-[#ECE7DE] px-1.5 py-0.2 rounded">
                              {lot.village}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-600 mt-0.5">
                            {lot.commodity} ({lot.variety}) • Moisture: <strong>{lot.moisturePct}%</strong>
                          </div>
                        </div>
                      </div>

                      {/* Lot Quantity & Pricing Difference */}
                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono font-bold text-[#262320]">
                          {lot.quantityQuintals} Quintals
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700">
                          +₹{lot.fpoPremiumPerQtl}/Qtl FPO Premium
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Collective Economics & Action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[6px] border border-[#D8D2C4] p-5 shadow-xs sticky top-24">
              <div className="flex items-center gap-2 border-b border-[#ECE7DE] pb-3 mb-4">
                <div className="w-8 h-8 rounded-[4px] bg-[#1B4332] text-white flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#262320] font-heading">
                    Collective Economics Breakdown
                  </h3>
                  <p className="text-xs text-[#635E59]">
                    Aggregation value calculation for {selectedLots.length} smallholder farmers
                  </p>
                </div>
              </div>

              {/* Real-time Financial Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[#ECE7DE]">
                  <span className="text-[#635E59]">
                    {t.farmer.fpoSelectedCount || 'Selected Micro-Lots'}:
                  </span>
                  <span className="font-bold font-mono text-[#262320]">{selectedLots.length} Farmers</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#ECE7DE]">
                  <span className="text-[#635E59]">
                    {t.farmer.fpoTotalAggregatedQty || 'Total Aggregated Volume'}:
                  </span>
                  <span className="font-bold font-mono text-[#1B4332] text-sm">
                    {totalPooledQty} Quintals ({(totalPooledQty / 10).toFixed(1)} MT)
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#ECE7DE]">
                  <span className="text-[#635E59]">Individual Local Mandi Base Value:</span>
                  <span className="font-mono text-stone-600">
                    ₹{baseIndividualValuation.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#ECE7DE]">
                  <span className="text-[#635E59]">
                    {t.farmer.fpoAvgPrice || 'Collective Institutional Price'}:
                  </span>
                  <span className="font-mono font-bold text-[#1B4332]">
                    ₹{targetOfferPrice}/Quintal
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#ECE7DE]">
                  <span className="text-[#635E59]">
                    {t.farmer.fpoTotalValuation || 'Total Aggregated Gross Value'}:
                  </span>
                  <span className="font-mono font-extrabold text-[#262320] text-sm">
                    ₹{collectiveValuation.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Economic Value Additions */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-[4px] p-3 space-y-1 text-[11px] text-emerald-900">
                  <div className="flex justify-between font-semibold">
                    <span>Collective Bargaining Premium:</span>
                    <span className="font-mono">+₹{collectivePricePremium.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Pooled Full-Truck Freight Savings:</span>
                    <span className="font-mono">+₹{pooledFreightSavings.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-1.5 border-t border-emerald-300 flex justify-between font-bold text-sm text-emerald-950">
                    <span>Total Smallholder Benefit:</span>
                    <span className="font-mono">+₹{netMemberAdvantage.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  disabled={selectedLotIds.length === 0 || isSubmitting}
                  onClick={handleAggregateLots}
                  className="w-full py-2.5 rounded-[4px] bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs mt-4"
                >
                  {isSubmitting ? (
                    <span>Pooling Micro-Lots...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t.farmer.fpoCreateAggregatedLotBtn || 'Create Aggregated Lot & Lock Contract'}</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-[#635E59]">
                  0 schema changes • Uses existing ProduceLot model with FPO linkage
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregation Success Modal */}
      {aggregationResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-[#D8D2C4] max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#1B4332] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#262320] font-heading">
                {t.farmer.fpoAggregationSuccess || 'Micro-Lots Aggregated Successfully!'}
              </h3>
              <p className="text-xs text-[#635E59]">
                Created single institutional bulk supply lot for{' '}
                <strong>{selectedDemand?.buyerName || 'ITC Agri Business'}</strong>
              </p>
            </div>

            <div className="mt-4 bg-[#FAF8F5] border border-[#D8D2C4] rounded-[4px] p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">{t.farmer.fpoAggregatedLotCode || 'Aggregated Lot Code'}:</span>
                <span className="font-mono font-bold text-[#1B4332]">{aggregationResult.lotCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Aggregated Volume:</span>
                <span className="font-mono font-bold text-stone-800">
                  {aggregationResult.quantityQuintals} Quintals
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Target Contract Price:</span>
                <span className="font-mono font-bold text-stone-800">
                  ₹{aggregationResult.expectedPricePerQuintal}/Qtl
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Gross Contract Valuation:</span>
                <span className="font-mono font-extrabold text-[#1B4332]">
                  ₹{aggregationResult.totalValuation.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#ECE7DE] text-emerald-800 font-semibold">
                <span>Member Price Premium:</span>
                <span className="font-mono">+₹{aggregationResult.fpoCollectiveBonus.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/lots"
                className="flex-1 py-2 rounded-[4px] border border-[#D8D2C4] text-xs font-semibold text-center text-[#262320] hover:bg-[#F4EFE6]"
              >
                {t.farmer.fpoViewInMarketplace || 'View Produce Lots'}
              </Link>
              <button
                type="button"
                onClick={() => setAggregationResult(null)}
                className="flex-1 py-2 rounded-[4px] bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] text-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
