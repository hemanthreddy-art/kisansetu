'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NetRealisationLedger } from '@/components/ui/NetRealisationLedger';
import { calculateNetRealisation, formatINR } from '@/lib/utils';
import { KEY_CROPS } from '@/lib/constants';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  MapPin,
  RotateCcw,
  Truck,
  Warehouse,
  Info,
  CheckCircle2,
  Sparkles,
  Mic,
} from 'lucide-react';

const VALID_CROP_IDS: readonly string[] = KEY_CROPS.map((c) => c.id);

function CalculatorInner() {
  const searchParams = useSearchParams();
  const { locale, t } = useLanguage();

  // Read URL query parameters
  const paramPrice = searchParams.get('price');
  const paramMarket = searchParams.get('market');
  const paramCrop = searchParams.get('crop');
  const paramDistance = searchParams.get('distance');
  const paramQuantity = searchParams.get('quantity');

  // Safe initial parsing
  const initialCrop = paramCrop && VALID_CROP_IDS.includes(paramCrop) ? paramCrop : 'onion';
  const initialPrice = paramPrice && !isNaN(Number(paramPrice)) && Number(paramPrice) > 0 ? Number(paramPrice) : 2300;
  const initialDistance = paramDistance && !isNaN(Number(paramDistance)) && Number(paramDistance) > 0 ? Number(paramDistance) : 120;
  const initialQuantity = paramQuantity && !isNaN(Number(paramQuantity)) && Number(paramQuantity) > 0 ? Number(paramQuantity) : 100;

  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [pricePerQtl, setPricePerQtl] = useState<number>(initialPrice);
  const [distanceKm, setDistanceKm] = useState<number>(initialDistance);
  const [selectedMarketName, setSelectedMarketName] = useState<string | null>(paramMarket || null);
  const [storageDays, setStorageDays] = useState<number>(0);
  const [ratePerKmTon, setRatePerKmTon] = useState<number>(5.0);

  // React to URL query changes dynamically without page reload
  useEffect(() => {
    if (paramPrice && !isNaN(Number(paramPrice)) && Number(paramPrice) > 0) {
      setPricePerQtl(Number(paramPrice));
    }
    if (paramDistance && !isNaN(Number(paramDistance)) && Number(paramDistance) > 0) {
      setDistanceKm(Number(paramDistance));
    }
    if (paramQuantity && !isNaN(Number(paramQuantity)) && Number(paramQuantity) > 0) {
      setQuantity(Number(paramQuantity));
    }
    if (paramCrop && VALID_CROP_IDS.includes(paramCrop)) {
      setSelectedCrop(paramCrop);
    }
    if (paramMarket) {
      setSelectedMarketName(paramMarket);
    }
  }, [paramPrice, paramDistance, paramQuantity, paramCrop, paramMarket]);

  const handleResetDefaults = () => {
    setSelectedCrop('onion');
    setQuantity(100);
    setPricePerQtl(2300);
    setDistanceKm(120);
    setStorageDays(0);
    setRatePerKmTon(5.0);
    setSelectedMarketName(null);
  };

  // Primary calculation
  const calc = calculateNetRealisation({
    pricePerQuintal: pricePerQtl,
    quantityQuintals: quantity,
    distanceKm: distanceKm,
    ratePerKmTon: ratePerKmTon,
    storageDays: storageDays,
  });

  // Selected crop details
  const activeCropObj = KEY_CROPS.find((c) => c.id === selectedCrop) || KEY_CROPS[0];
  const cropDisplayName =
    locale === 'mr'
      ? activeCropObj.nameMr
      : locale === 'te'
      ? activeCropObj.nameTe
      : locale === 'hi'
      ? activeCropObj.nameHi
      : activeCropObj.nameEn;

  // Comparative Analysis (Option A vs Option B)
  // Teaches that higher gross mandi quote != higher net realisation
  const compOptionA = useMemo(() => {
    // Option A: Distant Regional Mandi with higher gross price but high road freight
    const distantGross = Math.round(pricePerQtl * 1.06); // 6% higher nominal price
    const distantDistance = Math.max(distanceKm * 2, 220); // At least 220 km
    return {
      name: 'Distant Regional APMC (e.g. Pune / Vashi)',
      price: distantGross,
      distance: distantDistance,
      calc: calculateNetRealisation({
        pricePerQuintal: distantGross,
        quantityQuintals: quantity,
        distanceKm: distantDistance,
        ratePerKmTon: 5.5,
        storageDays: storageDays,
        mandiCessPercentage: 1.05,
        handlingCostPerQtl: 18,
      }),
    };
  }, [pricePerQtl, distanceKm, quantity, storageDays]);

  const compOptionB = useMemo(() => {
    // Option B: Nearby Mandi or Direct Farm-Gate Buyer with lower transport freight
    const nearbyDistance = Math.min(distanceKm, 35);
    return {
      name: selectedMarketName || 'Local Nearby Mandi / Buyer',
      price: pricePerQtl,
      distance: nearbyDistance,
      calc: calculateNetRealisation({
        pricePerQuintal: pricePerQtl,
        quantityQuintals: quantity,
        distanceKm: nearbyDistance,
        ratePerKmTon: 4.5,
        storageDays: storageDays,
        mandiCessPercentage: selectedMarketName ? 1.05 : 0,
        handlingCostPerQtl: 15,
      }),
    };
  }, [pricePerQtl, distanceKm, quantity, storageDays, selectedMarketName]);

  const highestNet = Math.max(compOptionA.calc.netRealisation, compOptionB.calc.netRealisation);
  const runnerUpNet = Math.min(compOptionA.calc.netRealisation, compOptionB.calc.netRealisation);
  const netDifference = highestNet - runnerUpNet;
  const isWinnerB = compOptionB.calc.netRealisation === highestNet;

  // Safe difference string without negative profit
  const formattedDifference =
    netDifference === 0
      ? 'Same net realisation'
      : `+${formatINR(netDifference)} more net realisation`;

  // Rule-based decision recommendation
  const recommendation = useMemo(() => {
    if (storageDays > 0 && calc.storageCost > calc.grossSaleValue * 0.05) {
      return {
        type: 'SELL_NOW' as const,
        title: 'SELL NOW — Avoid Storage Erosion',
        badgeVariant: 'emerald' as const,
        why: `Accumulated storage fees of ${formatINR(calc.storageCost)} (${Math.round(calc.storageCost / quantity)}/Qtl) erode net profit. Immediate dispatch avoids warehouse rental drain.`,
      };
    }
    if (distanceKm > 180 && calc.transportCost > calc.grossSaleValue * 0.06) {
      return {
        type: 'SELL_NOW' as const,
        title: 'SELL LOCALLY — Reduce Freight Costs',
        badgeVariant: 'emerald' as const,
        why: `Long-distance road freight consumes ${formatINR(calc.transportCost)} (${((calc.transportCost / calc.grossSaleValue) * 100).toFixed(1)}% of gross value). Selling to a closer mandi or verified farm-gate buyer yields higher take-home pay.`,
      };
    }
    if (storageDays > 0) {
      return {
        type: 'STORE_AND_SELL_LATER' as const,
        title: 'STORE & SELL LATER — Holding Simulated',
        badgeVariant: 'amber' as const,
        why: `Holding for ${storageDays} days incurs ${formatINR(calc.storageCost)} in warehouse rent. Ensure expected market price upside exceeds ₹${Math.round(calc.storageCost / quantity)}/Qtl before storing.`,
      };
    }
    return {
      type: 'SELL_NOW' as const,
      title: 'SELL NOW for Optimal Net Cash',
      badgeVariant: 'emerald' as const,
      why: `Current quote of ₹${pricePerQtl.toLocaleString('en-IN')}/Qtl yields ${formatINR(calc.netRealisation)} net take-home (${formatINR(calc.netRealisationPerQuintal)}/Qtl) with moderate freight deductions of ${formatINR(calc.transportCost)}.`,
    };
  }, [storageDays, distanceKm, calc, quantity, pricePerQtl]);

  // Total MT
  const totalMetricTonnes = (quantity * 0.1).toFixed(1);
  const tripsRequired = Math.ceil((quantity * 0.1) / (quantity <= 40 ? 4 : 10));

  return (
    <PageContainer maxWidth="7xl" className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title={t.calculator.title}
        description={t.calculator.subtitle}
        badge={
          <Badge variant="amber">
            {t.calculator.badge}
          </Badge>
        }
        action={
          selectedMarketName ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="gap-1.5 text-xs border-[#D8D2C4] hover:bg-[#F4F1EA]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.calculator.resetDefaults}</span>
            </Button>
          ) : undefined
        }
      />

      {/* Market Link Banner if pre-loaded from market intelligence */}
      {selectedMarketName && (
        <div className="p-4 rounded-[8px] bg-[#EAF2ED] border border-[#B7D5C4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#1B4332]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] block">
                {t.calculator.loadedFromMarket}
              </span>
              <span className="text-sm sm:text-base font-bold text-[#1B4332]">
                {selectedMarketName} • ₹{pricePerQtl.toLocaleString('en-IN')} {t.calculator.perQtlUnit}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#1B4332] bg-white px-2.5 py-1 rounded-[4px] border border-[#B7D5C4]">
              {distanceKm} km haul
            </span>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Col (6 cols): Produce & Parameters Form */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="shadow-none border-[#D8D2C4]">
            <CardHeader className="border-b border-[#D8D2C4] pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-heading text-[#262320]">
                    {t.calculator.parametersCardTitle}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#5A554E]">
                    {t.calculator.parametersCardSub}
                  </CardDescription>
                </div>
                <Badge variant="gray" className="text-[11px]">
                  Step 1 & 2
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Crop Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#262320] uppercase tracking-wider">
                  {t.calculator.selectCropLabel}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1.5 rounded-[6px] border border-[#D8D2C4] bg-[#FAFAF8]">
                  {KEY_CROPS.map((crop) => {
                    const localName =
                      locale === 'mr'
                        ? crop.nameMr
                        : locale === 'te'
                        ? crop.nameTe
                        : locale === 'hi'
                        ? crop.nameHi
                        : crop.nameMr;
                    const isSelected = selectedCrop === crop.id;
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => setSelectedCrop(crop.id)}
                        className={`p-2 rounded-[4px] text-xs font-medium flex flex-col items-center gap-1 transition-all border text-center ${
                          isSelected
                            ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                            : 'bg-white text-[#262320] border-[#D8D2C4] hover:bg-[#F4F1EA]'
                        }`}
                      >
                        <span className="text-base">{crop.icon}</span>
                        <span className="truncate w-full font-bold text-[11px]">{crop.nameEn}</span>
                        <span className="text-[10px] opacity-80 truncate w-full">{localName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Input & Slider */}
              <div className="space-y-2 pt-2 border-t border-[#EBE7DF]">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-bold text-[#262320] uppercase tracking-wider">
                    {t.calculator.harvestQtyLabel}
                  </label>
                  <span className="text-sm font-heading font-bold text-[#1B4332]">
                    {quantity} {t.calculator.quintalsUnit}{' '}
                    <span className="text-xs font-normal text-[#5A554E]">({totalMetricTonnes} MT)</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full h-2 bg-[#ECE7DE] rounded-[4px] appearance-none cursor-pointer accent-[#1B4332]"
                />
                <div className="flex gap-2">
                  {[40, 80, 100, 150, 200].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`px-2 py-1 text-[11px] rounded-[4px] border transition-colors ${
                        quantity === q
                          ? 'bg-[#EAF2ED] text-[#1B4332] border-[#B7D5C4] font-bold'
                          : 'bg-white text-[#5A554E] border-[#D8D2C4] hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {q} Qtl
                    </button>
                  ))}
                </div>
              </div>

              {/* Selling Price */}
              <div className="space-y-2 pt-2 border-t border-[#EBE7DF]">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-bold text-[#262320] uppercase tracking-wider">
                    {t.calculator.sellingPriceLabel}
                  </label>
                  <span className="text-sm font-heading font-bold text-[#1B4332]">
                    ₹{pricePerQtl.toLocaleString('en-IN')} {t.calculator.perQtlUnit}
                  </span>
                </div>
                <Input
                  type="number"
                  min="500"
                  max="50000"
                  step="50"
                  value={pricePerQtl}
                  onChange={(e) => setPricePerQtl(Number(e.target.value))}
                  className="font-heading font-bold text-base"
                />
              </div>

              {/* Distance in KM */}
              <div className="space-y-2 pt-2 border-t border-[#EBE7DF]">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-bold text-[#262320] uppercase tracking-wider">
                    {t.calculator.distanceLabel}
                  </label>
                  <span className="text-sm font-heading font-bold text-[#262320]">
                    {distanceKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="400"
                  step="5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full h-2 bg-[#ECE7DE] rounded-[4px] appearance-none cursor-pointer accent-[#1B4332]"
                />
                <div className="flex gap-2">
                  {[25, 35, 120, 220, 300].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDistanceKm(d)}
                      className={`px-2 py-1 text-[11px] rounded-[4px] border transition-colors ${
                        distanceKm === d
                          ? 'bg-[#EAF2ED] text-[#1B4332] border-[#B7D5C4] font-bold'
                          : 'bg-white text-[#5A554E] border-[#D8D2C4] hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {d} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage Days */}
              <div className="space-y-2 pt-2 border-t border-[#EBE7DF]">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-bold text-[#262320] uppercase tracking-wider">
                    {t.calculator.storageDurationLabel}
                  </label>
                  <span className="text-sm font-heading font-bold text-[#B45309]">
                    {storageDays} {t.calculator.daysUnit}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={storageDays}
                  onChange={(e) => setStorageDays(Number(e.target.value))}
                  className="w-full h-2 bg-[#ECE7DE] rounded-[4px] appearance-none cursor-pointer accent-[#B45309]"
                />
                <div className="flex justify-between text-[11px] text-[#5A554E]">
                  <span>0 Days (Immediate Sell)</span>
                  <span>30 Days</span>
                  <span>60 Days</span>
                  <span>90 Days</span>
                </div>
              </div>

              {/* Freight Rate Customizer */}
              <div className="pt-2 border-t border-[#EBE7DF] flex items-center justify-between text-xs text-[#5A554E]">
                <span>Road Freight Tariff Rate:</span>
                <span className="font-semibold text-[#262320]">₹{ratePerKmTon.toFixed(1)} / km / Tonne</span>
              </div>
            </CardContent>
          </Card>

          {/* Voice Assistant Shortcut */}
          <div className="p-4 rounded-[8px] bg-[#F4F1EA] border border-[#D8D2C4] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-[#1B4332] text-white flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#262320] block">Prefer Voice Calculation?</span>
                <span className="text-[#5A554E]">Ask: &ldquo;What is today&apos;s onion price?&rdquo; or &ldquo;Which market gives me more?&rdquo;</span>
              </div>
            </div>
            <Badge variant="emerald" className="text-[10px]">
              Voice Ready
            </Badge>
          </div>
        </div>

        {/* Right Col (6 cols): Ledger & Comparative Engine */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. VISUAL CENTERPIECE: NetRealisationLedger */}
          <NetRealisationLedger
            grossSaleValue={calc.grossSaleValue}
            transportFreight={calc.transportCost}
            mandiFee={calc.mandiCess}
            storageOrOtherCosts={calc.storageCost + calc.handlingCost}
            netRealisation={calc.netRealisation}
            lotQuantityQuintals={quantity}
            cropName={cropDisplayName}
          />

          {/* 2. Effective Take-Home Retention Card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-white border border-[#D8D2C4] rounded-[8px]">
              <span className="text-xs text-[#5A554E] block">Net Realisation / Qtl</span>
              <span className="font-heading text-lg sm:text-xl font-bold text-[#1B4332]">
                ₹{calc.netRealisationPerQuintal.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-[#5A554E]">/ Qtl</span>
              </span>
              <span className="text-[11px] text-[#2D6A4F] block mt-0.5">
                After all mandi & freight deductions
              </span>
            </div>

            <div className="p-3.5 bg-white border border-[#D8D2C4] rounded-[8px]">
              <span className="text-xs text-[#5A554E] block">Gross Retention Rate</span>
              <span className="font-heading text-lg sm:text-xl font-bold text-[#262320]">
                {calc.grossSaleValue > 0 ? Math.round((calc.netRealisation / calc.grossSaleValue) * 100) : 0}%
              </span>
              <span className="text-[11px] text-[#5A554E] block mt-0.5">
                Total deductions: {formatINR(calc.totalDeductions)}
              </span>
            </div>
          </div>

          {/* 3. RULE-BASED RECOMMENDATION CARD */}
          <Card className="shadow-none border-[#D8D2C4] bg-[#FAFAF8]">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1B4332]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                    Selling Recommendation
                  </span>
                </div>
                <Badge variant={recommendation.badgeVariant} className="text-xs font-bold">
                  {recommendation.title.split('—')[0].trim()}
                </Badge>
              </div>

              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-[#262320]">
                  {recommendation.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#5A554E] leading-relaxed">
                  {recommendation.why}
                </p>
              </div>

              <div className="text-[11px] text-[#7C766D] border-t border-[#EBE7DF] pt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Based on current estimated inputs. Market fluctuations and actual road freight may vary.</span>
              </div>
            </CardContent>
          </Card>

          {/* 4. "WHAT YOU ACTUALLY EARN" COMPARATIVE ANALYSIS */}
          <Card className="shadow-none border-[#1B4332]">
            <CardHeader className="border-b border-[#D8D2C4] pb-3 bg-[#F4F1EA]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-heading font-bold text-[#262320]">
                    What You Actually Earn: Mandi Comparison
                  </CardTitle>
                  <CardDescription className="text-xs text-[#5A554E]">
                    Proof that higher gross prices do not guarantee higher farmer earnings
                  </CardDescription>
                </div>
                <Badge variant="emerald" className="text-[10px]">
                  Real Comparison
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Dynamic Winner Callout */}
              <div className="p-3 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[6px] space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#1B4332]">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>
                    {isWinnerB ? compOptionB.name : compOptionA.name} provides highest net realisation!
                  </span>
                </div>
                <p className="text-[#2D6A4F] leading-relaxed">
                  Net earnings advantage: <strong>{formattedDifference}</strong> for this {quantity} Qtl lot.
                </p>
              </div>

              {/* Comparison Rows / Table */}
              <div className="space-y-2.5 text-xs">
                {/* Option A */}
                <div className="p-3 bg-white border border-[#D8D2C4] rounded-[6px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#262320]">{compOptionA.name}</span>
                    <span className="text-[#5A554E]">{compOptionA.distance} km</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-[#EBE7DF]">
                    <div>
                      <span className="text-[#5A554E] block">Gross Price:</span>
                      <strong className="text-[#262320]">₹{compOptionA.price}/Qtl</strong>
                    </div>
                    <div>
                      <span className="text-[#5A554E] block">Transport Freight:</span>
                      <strong className="text-[#B45309]">−{formatINR(compOptionA.calc.transportCost)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[#5A554E] block">Net Realisation:</span>
                      <strong className="text-[#1B4332] text-xs sm:text-sm font-heading">
                        {formatINR(compOptionA.calc.netRealisation)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Option B */}
                <div className="p-3 bg-white border border-[#D8D2C4] rounded-[6px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#262320]">{compOptionB.name}</span>
                    <span className="text-[#5A554E]">{compOptionB.distance} km</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-[#EBE7DF]">
                    <div>
                      <span className="text-[#5A554E] block">Gross Price:</span>
                      <strong className="text-[#262320]">₹{compOptionB.price}/Qtl</strong>
                    </div>
                    <div>
                      <span className="text-[#5A554E] block">Transport Freight:</span>
                      <strong className="text-[#B45309]">−{formatINR(compOptionB.calc.transportCost)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[#5A554E] block">Net Realisation:</span>
                      <strong className="text-[#1B4332] text-xs sm:text-sm font-heading">
                        {formatINR(compOptionB.calc.netRealisation)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transport & Storage Transparency Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Transport Freight Mechanics */}
        <Card className="shadow-none border-[#D8D2C4]">
          <CardHeader className="border-b border-[#D8D2C4] pb-3">
            <div className="flex items-center gap-2 text-[#1B4332] font-heading font-bold text-sm sm:text-base">
              <Truck className="w-4 h-4" />
              <span>Transport Freight Transparency</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-[#5A554E]">
            <p className="leading-relaxed">
              Transport freight is computed using verified commercial road haulage metrics:
            </p>
            <div className="bg-[#F4F1EA] p-3 rounded-[6px] space-y-1 font-mono text-xs text-[#262320]">
              <div className="flex justify-between">
                <span>Total Weight:</span>
                <span>{quantity} Qtl = {totalMetricTonnes} MT</span>
              </div>
              <div className="flex justify-between">
                <span>Dispatch Distance:</span>
                <span>{distanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span>Vehicle Trips:</span>
                <span>{tripsRequired} trip(s) ({quantity <= 40 ? '4T LCV' : '10T HCV'})</span>
              </div>
              <div className="flex justify-between border-t border-[#D8D2C4] pt-1 font-bold text-[#1B4332]">
                <span>Total Freight Deducted:</span>
                <span>{formatINR(calc.transportCost)}</span>
              </div>
            </div>
            <span className="text-[11px] text-[#7C766D] block">
              Road haulage deduction equals ₹{Math.round(calc.transportCost / quantity)} per quintal.
            </span>
          </CardContent>
        </Card>

        {/* Storage Holding Simulation */}
        <Card className="shadow-none border-[#D8D2C4]">
          <CardHeader className="border-b border-[#D8D2C4] pb-3">
            <div className="flex items-center gap-2 text-[#B45309] font-heading font-bold text-sm sm:text-base">
              <Warehouse className="w-4 h-4" />
              <span>Storage Holding Simulation</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-[#5A554E]">
            <p className="leading-relaxed">
              Warehouse rent is modeled at standard MSWC / WDRA rates of ₹30/quintal/month:
            </p>
            <div className="bg-[#FFFBEB] p-3 rounded-[6px] space-y-1 font-mono text-xs text-[#92400E]">
              <div className="flex justify-between">
                <span>Storage Period:</span>
                <span>{storageDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Rent Accrued:</span>
                <span>{formatINR(calc.storageCost)}</span>
              </div>
              <div className="flex justify-between border-t border-[#FDE68A] pt-1 font-bold text-[#B45309]">
                <span>Break-Even Mandi Target:</span>
                <span>₹{(pricePerQtl + Math.round(calc.storageCost / quantity)).toLocaleString('en-IN')}/Qtl</span>
              </div>
            </div>
            <span className="text-[11px] text-[#7C766D] block">
              Estimated / Projection — Market fluctuation may change actual price. Not guaranteed.
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Net Realisation Formula Callout */}
      <div className="p-4 sm:p-5 rounded-[8px] bg-[#F4F1EA] border border-[#D8D2C4] text-xs sm:text-sm space-y-1.5">
        <span className="font-heading font-bold text-[#262320] block">
          {t.calculator.formulaTitle}
        </span>
        <p className="font-mono text-xs sm:text-sm text-[#1B4332] font-semibold">
          {t.calculator.formulaText}
        </p>
      </div>
    </PageContainer>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center text-[#5A554E]">
          <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading Net Realisation Engine...</p>
        </div>
      }
    >
      <CalculatorInner />
    </Suspense>
  );
}
