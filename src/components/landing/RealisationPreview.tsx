'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { calculateNetRealisation, formatINR } from '@/lib/utils';
import { Scale, Check, AlertCircle, ChevronRight } from 'lucide-react';

export function RealisationPreview() {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState<number>(100); // 100 Quintals of Onion

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

  // Dynamic winner calculation - never hard-coded
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
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4 text-amber-700" />
            <span>Core USP Demonstration</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t.usp.title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {t.usp.explanation}
          </p>
        </div>

        {/* Formula Visual Banner */}
        <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-md">
          <div className="text-center sm:text-left mb-4">
            <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
              {t.usp.formulaLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-sm sm:text-lg text-center">
            <div className="bg-emerald-700/80 px-4 py-2.5 rounded-xl border border-emerald-500/50">
              <span className="text-xs block text-emerald-200 uppercase font-sans">
                {t.usp.formulaGross}
              </span>
              <span className="font-bold">Gross Sale Value</span>
            </div>

            <span className="text-amber-400 font-black text-2xl font-sans">-</span>

            <div className="bg-emerald-700/80 px-4 py-2.5 rounded-xl border border-emerald-500/50">
              <span className="text-xs block text-emerald-200 uppercase font-sans">
                {t.usp.formulaTransport}
              </span>
              <span className="font-bold">Transport Cost</span>
            </div>

            <span className="text-amber-400 font-black text-2xl font-sans">-</span>

            <div className="bg-emerald-700/80 px-4 py-2.5 rounded-xl border border-emerald-500/50">
              <span className="text-xs block text-emerald-200 uppercase font-sans">
                {t.usp.formulaStorage}
              </span>
              <span className="font-bold">Storage Cost</span>
            </div>

            <span className="text-amber-400 font-black text-2xl font-sans">-</span>

            <div className="bg-emerald-700/80 px-4 py-2.5 rounded-xl border border-emerald-500/50">
              <span className="text-xs block text-emerald-200 uppercase font-sans">
                {t.usp.formulaOther}
              </span>
              <span className="font-bold">Other Costs</span>
            </div>

            <span className="text-amber-400 font-black text-2xl font-sans">=</span>

            <div className="bg-amber-500 text-gray-950 px-5 py-2.5 rounded-xl font-bold shadow-sm border border-amber-300">
              <span className="text-xs block text-amber-950 uppercase font-sans">Take-Home Profit</span>
              <span className="font-black text-emerald-950">NET REALISATION</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Comparison Tool */}
        <div className="max-w-4xl mx-auto">
          {/* Quantity Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6">
            <div>
              <span className="text-sm font-bold text-gray-900 block">
                Sample Crop: Maharashtra Nashik Onion (कांदा)
              </span>
              <span className="text-xs text-gray-500">
                Adjust harvest quantity to compare actual returns:
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[50, 100, 200].map((qty) => (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    quantity === qty
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {qty} Quintals ({qty * 0.1} T)
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Market Option A */}
            <Card className={`relative transition-all ${isWinnerA ? 'border-2 border-emerald-600 bg-emerald-50/40 shadow-md' : 'border-2 border-gray-200'}`}>
              <div className="absolute top-4 right-4 flex items-center gap-1">
                {isWinnerA ? (
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-200/90 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                    <Check className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Highest Net Realisation</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    Option A: Distant APMC
                  </span>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Distant Terminal Mandi</CardTitle>
                <CardDescription>
                  Distance: 260 km | Raw Price: <strong className="text-gray-900">₹2,400 / Qtl</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Gross Sale Value:</span>
                  <span className="font-semibold text-gray-900">{formatINR(optionA.grossSaleValue)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 text-rose-700">
                  <span>Transport Freight (260 km):</span>
                  <span className="font-medium">- {formatINR(optionA.transportCost)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 text-rose-700">
                  <span>Mandi Cess & Labor Handling:</span>
                  <span className="font-medium">- {formatINR(optionA.otherCosts)}</span>
                </div>
                <div className="pt-3 flex justify-between items-baseline font-bold text-lg">
                  <span className="text-gray-800">Net Realisation:</span>
                  <span className={isWinnerA ? "text-emerald-800 text-xl font-black" : "text-gray-900"}>{formatINR(optionA.netRealisation)}</span>
                </div>
                <p className={isWinnerA ? "text-xs text-emerald-800 font-semibold" : "text-xs text-gray-500 italic"}>
                  Effective take-home: ₹{optionA.netRealisationPerQuintal} / quintal {isWinnerA && `(${getDifferenceText(true)})`}
                </p>
              </CardContent>
            </Card>

            {/* Market Option B */}
            <Card className={`relative transition-all ${isWinnerB ? 'border-2 border-emerald-600 bg-emerald-50/40 shadow-md' : 'border-2 border-gray-200'}`}>
              <div className="absolute top-4 right-4 flex items-center gap-1">
                {isWinnerB ? (
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-200/90 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                    <Check className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Highest Net Realisation</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    Option B: Nearby Buyer
                  </span>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-emerald-950">
                  Nearby Direct Buyer / FPO
                </CardTitle>
                <CardDescription>
                  Distance: 30 km | Raw Price: <strong className="text-emerald-900">₹2,280 / Qtl</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-sm">
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-gray-700">Gross Sale Value:</span>
                  <span className="font-semibold text-gray-900">{formatINR(optionB.grossSaleValue)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100 text-emerald-800">
                  <span>Transport Freight (30 km):</span>
                  <span className="font-medium">- {formatINR(optionB.transportCost)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100 text-emerald-800">
                  <span>Direct Buyer Handling (0 cess):</span>
                  <span className="font-medium">- {formatINR(optionB.otherCosts)}</span>
                </div>
                <div className="pt-3 flex justify-between items-baseline font-bold text-lg text-emerald-950">
                  <span>Net Realisation:</span>
                  <span className={isWinnerB ? "text-emerald-800 text-xl font-black" : "text-gray-900"}>{formatINR(optionB.netRealisation)}</span>
                </div>
                <p className={isWinnerB ? "text-xs text-emerald-800 font-semibold" : "text-xs text-gray-500 italic"}>
                  Effective take-home: ₹{optionB.netRealisationPerQuintal} / quintal {isWinnerB && `(${getDifferenceText(true)})`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Insight Box */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-950 space-y-1">
              <span className="font-bold">The KisanSetu Advantage:</span>
              <p>
                {isWinnerB ? (
                  <>
                    Option A appeared to offer ₹120 more per quintal on paper, but Option B puts{' '}
                    <strong>{formatINR(netDifference)} more net realisation</strong> directly into the farmer&apos;s bank account after transport and handling.
                  </>
                ) : isWinnerA ? (
                  <>
                    Option A delivers{' '}
                    <strong>{formatINR(netDifference)} more net realisation</strong> directly into the farmer&apos;s bank account after accounting for transport and mandi fees.
                  </>
                ) : (
                  <>Both options yield the same net realisation of <strong>{formatINR(highestNet)}</strong>.</>
                )}
                {' '}This is why KisanSetu is built around true Net Realisation rather than nominal price discovery.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/calculator">
              <Button size="md" variant="outline" className="gap-2">
                <span>Open Full Interactive Net Realisation Engine</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
