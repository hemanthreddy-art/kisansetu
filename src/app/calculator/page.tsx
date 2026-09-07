'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { calculateNetRealisation, formatINR } from '@/lib/utils';
import { KEY_CROPS } from '@/lib/constants';
import { useLanguage } from '@/i18n/LanguageContext';
import { Scale, MapPin, RotateCcw } from 'lucide-react';

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
  const ratePerKmTon = 5.0;

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
    setSelectedMarketName(null);
  };

  const calc = calculateNetRealisation({
    pricePerQuintal: pricePerQtl,
    quantityQuintals: quantity,
    distanceKm: distanceKm,
    ratePerKmTon: ratePerKmTon,
    storageDays: storageDays,
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="amber">{t.calculator.badge}</Badge>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Scale className="w-8 h-8 text-amber-700" />
            <span>{t.calculator.title}</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {t.calculator.subtitle}
          </p>
        </div>

        {selectedMarketName && (
          <Button variant="outline" size="sm" onClick={handleResetDefaults} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.calculator.resetDefaults}</span>
          </Button>
        )}
      </div>

      {/* Market Link Banner if pre-loaded from market intelligence */}
      {selectedMarketName && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-emerald-800" />
            </div>
            <div>
              <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">
                {t.calculator.loadedFromMarket}
              </span>
              <span className="text-sm font-black text-emerald-950">
                {selectedMarketName} • ₹{pricePerQtl} {t.calculator.perQtlUnit}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-medium">
              {distanceKm} km
            </span>
          </div>
        </div>
      )}

      {/* Interactive Form & Live Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.calculator.parametersCardTitle}</CardTitle>
              <CardDescription>{t.calculator.parametersCardSub}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Crop Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  {t.calculator.selectCropLabel}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto p-1 rounded-xl border border-gray-100 bg-gray-50/50">
                  {KEY_CROPS.map((crop) => {
                    const localName =
                      locale === 'mr'
                        ? crop.nameMr
                        : locale === 'te'
                        ? crop.nameTe
                        : locale === 'hi'
                        ? crop.nameHi
                        : crop.nameMr;
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => setSelectedCrop(crop.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all border ${
                          selectedCrop === crop.id
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs ring-2 ring-emerald-600/20'
                            : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{crop.icon}</span>
                        <span className="truncate w-full text-center">{crop.nameEn}</span>
                        <span className="text-[10px] opacity-75 truncate w-full text-center">{localName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    {t.calculator.harvestQtyLabel}
                  </label>
                  <span className="text-sm font-black text-emerald-800">
                    {quantity} {t.calculator.quintalsUnit} ({(quantity * 0.1).toFixed(1)} T)
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                />
              </div>

              {/* Price per Quintal */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    {t.calculator.sellingPriceLabel}
                  </label>
                  <span className="text-sm font-black text-emerald-800">
                    ₹{pricePerQtl} {t.calculator.perQtlUnit}
                  </span>
                </div>
                <input
                  type="number"
                  min="500"
                  max="20000"
                  step="50"
                  value={pricePerQtl}
                  onChange={(e) => setPricePerQtl(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none text-base font-semibold"
                />
              </div>

              {/* Distance in KM */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    {t.calculator.distanceLabel}
                  </label>
                  <span className="text-sm font-black text-sky-800">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="400"
                  step="5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-700"
                />
              </div>

              {/* Storage Days */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    {t.calculator.storageDurationLabel}
                  </label>
                  <span className="text-sm font-black text-amber-800">{storageDays} {t.calculator.daysUnit}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={storageDays}
                  onChange={(e) => setStorageDays(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Calculation Results */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white border-0 shadow-lg">
            <CardHeader className="border-b border-emerald-800 pb-4">
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-300">
                {t.calculator.resultTitle}
              </span>
              <CardTitle className="text-3xl text-white font-black">
                {formatINR(calc.netRealisation)}
              </CardTitle>
              <p className="text-emerald-200 text-sm">
                {t.calculator.takeHomeLabel}: <strong>₹{calc.netRealisationPerQuintal} {t.calculator.perQuintal}</strong>
              </p>
            </CardHeader>

            <CardContent className="space-y-3 pt-4 text-sm font-medium">
              <div className="flex justify-between py-1 text-emerald-100">
                <span>{t.calculator.grossSaleValue}:</span>
                <span className="font-bold text-white">{formatINR(calc.grossSaleValue)}</span>
              </div>

              <div className="flex justify-between py-1 text-rose-300">
                <span>{t.calculator.transportFreight} ({distanceKm} km @ ₹{ratePerKmTon}/km/T):</span>
                <span>- {formatINR(calc.transportCost)}</span>
              </div>

              <div className="flex justify-between py-1 text-rose-300">
                <span>{t.calculator.storageCost} ({storageDays} {t.calculator.daysUnit}):</span>
                <span>- {formatINR(calc.storageCost)}</span>
              </div>

              <div className="flex justify-between py-1 text-rose-300">
                <span>{t.calculator.mandiCessHandling}:</span>
                <span>- {formatINR(calc.otherCosts)}</span>
              </div>

              <div className="pt-3 border-t border-emerald-800 flex justify-between font-bold text-base text-amber-300">
                <span>{t.calculator.totalDeductions}:</span>
                <span>- {formatINR(calc.totalDeductions)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Formula Callout */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
            <span className="font-bold block">{t.calculator.formulaTitle}:</span>
            <p className="font-mono">
              {t.calculator.formulaText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center text-gray-500">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading Net Realisation Engine...</p>
        </div>
      }
    >
      <CalculatorInner />
    </Suspense>
  );
}
