'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SAMPLE_MARKET_PRICES } from '@/lib/constants';
import { TrendingUp, Scale, Info, MapPin } from 'lucide-react';

const getCropId = (commodity: string): string => {
  const lower = commodity.toLowerCase();
  if (lower.includes('onion') || lower.includes('कांदा')) return 'onion';
  if (lower.includes('tomato') || lower.includes('टोमॅटो')) return 'tomato';
  if (lower.includes('soybean') || lower.includes('सोयाबीन')) return 'soybean';
  if (lower.includes('pomegranate') || lower.includes('डाळिंब')) return 'pomegranate';
  if (lower.includes('jaggery') || lower.includes('गूळ') || lower.includes('బెల్లం')) return 'jaggery';
  if (lower.includes('paddy') || lower.includes('rice') || lower.includes('వరి')) return 'paddy';
  if (lower.includes('cashew') || lower.includes('काजू') || lower.includes('జీడిపప్పు')) return 'cashew';
  if (lower.includes('coffee') || lower.includes('कॉफ़ी') || lower.includes('కాఫీ')) return 'coffee';
  if (lower.includes('chilli') || lower.includes('मिर्च') || lower.includes('మిరప')) return 'chilli';
  return 'onion';
};

const getMarketDistance = (marketName: string): number => {
  const lower = marketName.toLowerCase();
  if (lower.includes('lasalgaon')) return 35;
  if (lower.includes('pune')) return 160;
  if (lower.includes('akola')) return 280;
  if (lower.includes('solapur')) return 240;
  if (lower.includes('anakapalle')) return 40;
  if (lower.includes('visakhapatnam')) return 30;
  if (lower.includes('palasa')) return 180;
  if (lower.includes('araku')) return 110;
  if (lower.includes('kakinada')) return 150;
  return 60;
};

export default function MarketIntelligencePage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">{t.markets.badge}</Badge>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-700" />
            <span>{t.markets.title}</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {t.markets.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/calculator">
            <Button variant="secondary" className="gap-2">
              <Scale className="w-4 h-4" />
              <span>{t.markets.calculateNetRealisation}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Important Data Principle Notice */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-950 space-y-1">
          <span className="font-bold">{t.markets.dataNoticeTitle}</span>
          <p>{t.markets.dataNoticeDesc}</p>
        </div>
      </div>

      {/* Market Prices Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.markets.tableTitle}</CardTitle>
          <CardDescription>{t.markets.tableSub}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">{t.markets.colMarket}</th>
                <th className="py-3 px-4">{t.markets.colCommodity}</th>
                <th className="py-3 px-4">{t.markets.colPriceRange}</th>
                <th className="py-3 px-4">{t.markets.colModalPrice}</th>
                <th className="py-3 px-4">{t.markets.colArrivals}</th>
                <th className="py-3 px-4 text-right">{t.markets.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SAMPLE_MARKET_PRICES.map((row, idx) => {
                const cropId = getCropId(row.commodity);
                const distance = getMarketDistance(row.marketName);
                const queryParams = new URLSearchParams({
                  market: row.marketName,
                  price: String(row.modalPrice),
                  crop: cropId,
                  distance: String(distance),
                  district: row.district,
                }).toString();

                return (
                  <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{row.marketName}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-normal">
                        {row.district} {t.markets.dist}{row.state ? ` (${row.state})` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {row.commodity}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      ₹{row.minPrice} - ₹{row.maxPrice}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-800 text-base">
                      ₹{row.modalPrice} <span className="text-xs font-normal text-gray-500">{t.calculator.perQtlUnit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {row.arrivalTonnes} {t.markets.tonnes}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/calculator?${queryParams}`}>
                        <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                          {t.markets.netProfitCheck}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Schema Mapping */}
      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-sm space-y-2">
        <span className="font-bold text-gray-900 block">
          {t.markets.archTitle}
        </span>
        <p className="text-gray-600">
          {t.markets.archDesc}
        </p>
      </div>
    </div>
  );
}
