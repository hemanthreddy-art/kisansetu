'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Building2,
  MapPin,
  Scale,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/i18n/LanguageContext';

interface BuyerDemandItem {
  id: string;
  buyerId: string;
  companyName: string;
  buyerName: string;
  buyerType: string;
  isBuyerVerified: boolean;
  reputation?: { rating: number; reviewCount: number };
  commodity: string;
  variety?: string | null;
  requiredQuantityQtl: number;
  unit: string;
  targetPricePerQtl: number;
  minPricePerQtl?: number | null;
  maxPricePerQtl?: number | null;
  destinationDistrict: string;
  deliveryLocation: string;
  deliveryDeadline?: string | null;
  requiredGrade?: string | null;
  description?: string | null;
  status: string;
  createdAt: string;
}

interface BuyerDemandsSectionProps {
  onFulfillDemand?: (demand: BuyerDemandItem) => void;
  farmerDistrict?: string;
  farmerCrops?: string[];
}

export function BuyerDemandsSection({
  onFulfillDemand,
  farmerDistrict = 'Nashik',
  farmerCrops = ['Onion', 'Tomato'],
}: BuyerDemandsSectionProps) {
  const { t } = useLanguage();
  const [demands, setDemands] = useState<BuyerDemandItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCommodity, setFilterCommodity] = useState<string>('ALL');

  const fetchDemands = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/buyer-demands?status=ACTIVE');
      const data = await res.json();

      if (data.success && Array.isArray(data.demands)) {
        setDemands(data.demands);
      } else {
        setDemands([]);
      }
    } catch (err) {
      console.error('Failed to load buyer demands:', err);
      setError('Unable to load live buyer procurement demands.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const commodities = ['ALL', ...Array.from(new Set(demands.map((d) => d.commodity)))];

  const filteredDemands = demands.filter((d) => {
    if (filterCommodity === 'ALL') return true;
    return d.commodity.toLowerCase() === filterCommodity.toLowerCase();
  });

  return (
    <div className="bg-white rounded-[10px] border border-[#D8D2C4] shadow-sm p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8D2C4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#EAF2ED] text-[#1B4332]">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-[#262320] font-serif">
              Live Buyer Procurement Demands
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF2ED] text-[#1B4332] font-semibold border border-[#B7D5C4]">
              {demands.length} Verified Demands
            </span>
          </div>
          <p className="text-xs text-[#635E59] mt-1">
            Corporates, food processors, and wholesale buyers actively looking to purchase directly from farmers.
          </p>
        </div>

        {/* Commodity Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {commodities.map((crop) => (
            <button
              key={crop}
              onClick={() => setFilterCommodity(crop)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                filterCommodity === crop
                  ? 'bg-[#1B4332] text-white border-[#1B4332] font-semibold'
                  : 'bg-[#F4F1EA] text-[#635E59] border-[#D8D2C4] hover:bg-[#ECE7DE]'
              }`}
            >
              {crop === 'ALL' ? 'All Crops' : crop}
            </button>
          ))}
          <button
            onClick={fetchDemands}
            className="p-1.5 text-[#635E59] hover:text-[#1B4332] hover:bg-[#F4F1EA] rounded-full transition-colors"
            title="Refresh demands"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Demands Grid */}
      {loading ? (
        <div className="py-12 text-center text-[#635E59] space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1B4332]" />
          <p className="text-xs">Streaming active buyer procurement requirements...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded text-xs">{error}</div>
      ) : filteredDemands.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#635E59]">
          No procurement demands found matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredDemands.map((demand) => {
            const isMatch = farmerCrops.some(
              (c) => c.toLowerCase() === demand.commodity.toLowerCase()
            );

            // Estimated net calculation
            const estTransportCost = demand.destinationDistrict !== farmerDistrict ? 180 : 60; // per Qtl
            const netRealisationPerQtl = demand.targetPricePerQtl - estTransportCost;

            return (
              <div
                key={demand.id}
                className={`rounded-[8px] border p-3.5 transition-all flex flex-col justify-between ${
                  isMatch
                    ? 'bg-[#FAF8F5] border-[#52B788] shadow-sm ring-1 ring-[#52B788]/20'
                    : 'bg-white border-[#D8D2C4] hover:border-[#B7D5C4]'
                }`}
              >
                <div className="space-y-2">
                  {/* Top Bar: Match Tag & Buyer */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#635E59]" />
                        <span className="font-bold text-xs text-[#262320]">
                          {demand.companyName}
                        </span>
                        {demand.isBuyerVerified && (
                          <span
                            className="inline-flex items-center text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200"
                            title="Verified Procurement Partner"
                          >
                            <ShieldCheck className="w-3 h-3 mr-0.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#635E59] capitalize">
                        {demand.buyerType.toLowerCase()} Buyer • {demand.destinationDistrict}
                      </span>
                    </div>

                    {isMatch && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2ED] text-[#1B4332] border border-[#B7D5C4] flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3 text-[#52B788]" />
                        Crop Match
                      </span>
                    )}
                  </div>

                  {/* Commodity & Target Price */}
                  <div className="bg-white p-2.5 rounded-[6px] border border-[#ECE7DE] flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#1B4332] flex items-center gap-1.5">
                        <span>{demand.commodity}</span>
                        {demand.variety && (
                          <span className="text-xs font-normal text-[#635E59]">({demand.variety})</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#635E59] flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          Need: <strong>{demand.requiredQuantityQtl} Qtl</strong>
                        </span>
                        {demand.requiredGrade && (
                          <span className="px-1.5 py-0.2 bg-[#F4F1EA] text-[#262320] font-semibold text-[10px] rounded">
                            {demand.requiredGrade}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-[#635E59]">Target Price</div>
                      <div className="text-base font-bold text-[#1B4332]">
                        ₹{demand.targetPricePerQtl.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-[#635E59]">/Qtl</span>
                      </div>
                    </div>
                  </div>

                  {/* Quality & Delivery Requirements */}
                  <div className="text-[11px] text-[#635E59] space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#635E59] shrink-0" />
                      <span className="truncate">Delivery: {demand.deliveryLocation}</span>
                    </div>
                    {demand.deliveryDeadline && (
                      <div className="flex items-center gap-1 text-[11px] text-[#262320]">
                        <Calendar className="w-3 h-3 text-[#1B4332] shrink-0" />
                        <span>Deadline: <strong>{new Date(demand.deliveryDeadline).toLocaleDateString()}</strong></span>
                      </div>
                    )}
                    {demand.description && (
                      <p className="line-clamp-2 italic text-[#635E59]/90 bg-[#F4F1EA]/50 p-1.5 rounded">
                        &ldquo;{demand.description}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Realisation Preview & CTAs */}
                <div className="mt-3 pt-2.5 border-t border-[#ECE7DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="bg-[#EAF2ED] px-2.5 py-1.5 rounded-[6px] border border-[#B7D5C4]/70">
                    <span className="text-[10px] font-bold text-[#1B4332] uppercase tracking-wider block">
                      💰 {t.farmer.estAmountYouReceive || 'Estimated Amount You Receive'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#1B4332] font-black">
                      <span>₹{netRealisationPerQtl.toLocaleString('en-IN')}/Qtl</span>
                      <span className="text-[10px] font-normal text-[#635E59]">
                        (Freight: -₹{estTransportCost}/Qtl • 0% Mandi Fee)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <Button
                      size="sm"
                      onClick={() => onFulfillDemand && onFulfillDemand(demand)}
                      aria-label="Supply Crop"
                      className="h-8 px-3 text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold flex items-center gap-1 shadow-sm"
                    >
                      <span>Supply Crop — {t.farmer.supplyThisCrop || 'Supply Produce'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
