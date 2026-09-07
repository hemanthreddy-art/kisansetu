'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SAMPLE_MARKET_PRICES } from '@/lib/constants';
import {
  TrendingUp,
  Scale,
  Info,
  MapPin,
  Search,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RotateCcw,
  Truck,
  Layers,
} from 'lucide-react';

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

  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique crops and districts for filtering
  const availableCrops = useMemo(() => {
    const crops = new Set<string>();
    SAMPLE_MARKET_PRICES.forEach((m) => {
      const cropId = getCropId(m.commodity);
      crops.add(cropId);
    });
    return Array.from(crops);
  }, []);

  const availableDistricts = useMemo(() => {
    const districts = new Set<string>();
    SAMPLE_MARKET_PRICES.forEach((m) => districts.add(m.district));
    return Array.from(districts);
  }, []);

  // Filtered market rows
  const filteredPrices = useMemo(() => {
    return SAMPLE_MARKET_PRICES.filter((row) => {
      const cropId = getCropId(row.commodity);
      if (selectedCrop !== 'all' && cropId !== selectedCrop) {
        return false;
      }
      if (selectedDistrict !== 'all' && row.district !== selectedDistrict) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = row.marketName.toLowerCase().includes(query);
        const matchesDist = row.district.toLowerCase().includes(query);
        const matchesCommodity = row.commodity.toLowerCase().includes(query);
        if (!matchesName && !matchesDist && !matchesCommodity) return false;
      }
      return true;
    });
  }, [selectedCrop, selectedDistrict, searchQuery]);

  const hasActiveFilters = selectedCrop !== 'all' || selectedDistrict !== 'all' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedCrop('all');
    setSelectedDistrict('all');
    setSearchQuery('');
  };

  return (
    <PageContainer maxWidth="7xl" className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title="Market Prices"
        description="Compare prices, arrivals and selling options across markets."
        badge={
          <Badge variant="emerald">
            {t.markets.badge}
          </Badge>
        }
        action={
          <Link href="/calculator">
            <Button variant="primary" size="md" className="gap-2">
              <Scale className="w-4 h-4" />
              <span>{t.markets.calculateNetRealisation}</span>
            </Button>
          </Link>
        }
      />

      {/* Data Transparency Notice */}
      <div className="bg-[#F4F1EA] border border-[#D8D2C4] rounded-[8px] p-4 sm:p-5 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-[#1B4332] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[#262320] space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-bold text-[#1B4332]">{t.markets.dataNoticeTitle}</span>
            <Badge variant="amber" className="text-[10px] py-0 px-2">
              Sample APMC modal data (Demo)
            </Badge>
          </div>
          <p className="text-[#5A554E] leading-relaxed">
            {t.markets.dataNoticeDesc}
          </p>
        </div>
      </div>

      {/* Market Comparison Callout Strip */}
      <Card className="border-[#1B4332] bg-[#FAFAF8] shadow-none">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="emerald" className="text-xs font-bold">
                  Market Decision Insight
                </Badge>
                <span className="text-xs text-[#5A554E]">Gross Price ≠ Net Realisation</span>
              </div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#262320]">
                Which market gives you more after transport and mandi costs?
              </h3>
              <p className="text-xs sm:text-sm text-[#5A554E]">
                A distant mandi quoting ₹250/Qtl higher price might leave you with less cash after paying long-distance road freight.
              </p>
            </div>

            <Link href="/calculator?market=Pune+Market+Yard&price=2400&crop=onion&distance=220&quantity=100">
              <Button variant="outline" className="border-[#1B4332] text-[#1B4332] hover:bg-[#EAF2ED] gap-2 w-full sm:w-auto">
                <span>Compare Net Realisation</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#D8D2C4]">
            <div className="p-3 bg-white border border-[#D8D2C4] rounded-[6px] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#5A554E] block">Nearby Mandi (Lasalgaon APMC)</span>
                <span className="font-heading font-bold text-[#262320] text-sm sm:text-base">
                  ₹2,150 / Qtl <span className="text-xs font-normal text-[#5A554E]">• 35 km</span>
                </span>
              </div>
              <Badge variant="emerald" className="text-xs">
                Low Freight (₹1,750 / 10T)
              </Badge>
            </div>

            <div className="p-3 bg-white border border-[#D8D2C4] rounded-[6px] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#5A554E] block">Distant Mandi (Pune Market Yard)</span>
                <span className="font-heading font-bold text-[#262320] text-sm sm:text-base">
                  ₹2,400 / Qtl <span className="text-xs font-normal text-[#5A554E]">• 220 km</span>
                </span>
              </div>
              <Badge variant="amber" className="text-xs">
                Higher Freight (₹12,100 / 10T)
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practical Filters */}
      <Card className="shadow-none border-[#D8D2C4]">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A554E] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Filter Mandis & Commodities</span>
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-[#5A554E] hover:text-[#262320] gap-1 h-7 px-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <Select
                label="Filter by Crop"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
              >
                <option value="all">All Commodities ({availableCrops.length})</option>
                <option value="onion">Onion (कांदा)</option>
                <option value="tomato">Tomato (टोमॅटो)</option>
                <option value="soybean">Soybean (सोयाबीन)</option>
                <option value="pomegranate">Pomegranate (डाळिंब)</option>
                <option value="jaggery">Jaggery (गूळ / బెల్లం)</option>
                <option value="paddy">Paddy / Rice (धान / వరి)</option>
                <option value="cashew">Raw Cashew Nut (काजू)</option>
                <option value="coffee">Arabica Coffee (कॉफ़ी)</option>
                <option value="chilli">Red Chilli (लाल मिर्च)</option>
              </Select>
            </div>

            <div className="sm:col-span-4">
              <Select
                label="Filter by District"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="all">All Districts ({availableDistricts.length})</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>

            <div className="sm:col-span-4">
              <Input
                label="Search Market or Mandi"
                placeholder="e.g. Lasalgaon, Pune, Anakapalle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Prices Table / List */}
      <Card className="shadow-none border-[#D8D2C4]">
        <CardHeader className="border-b border-[#D8D2C4] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl font-heading text-[#262320]">
                {t.markets.tableTitle}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-[#5A554E]">
                {t.markets.tableSub} (Showing {filteredPrices.length} mandis)
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-[#5A554E] bg-[#F4F1EA] px-2.5 py-1 rounded-[4px] border border-[#D8D2C4] self-start sm:self-auto">
              Sample APMC Modal Data
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredPrices.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Search className="w-8 h-8 text-[#7C766D] mx-auto" />
              <p className="text-sm font-semibold text-[#262320]">No mandis match your active filters.</p>
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F4F1EA] text-[#5A554E] uppercase text-[11px] font-bold tracking-wider border-b border-[#D8D2C4]">
                    <tr>
                      <th className="py-3 px-4">{t.markets.colMarket}</th>
                      <th className="py-3 px-4">{t.markets.colCommodity}</th>
                      <th className="py-3 px-4">{t.markets.colPriceRange}</th>
                      <th className="py-3 px-4">{t.markets.colModalPrice}</th>
                      <th className="py-3 px-4">{t.markets.colArrivals}</th>
                      <th className="py-3 px-4">Trend</th>
                      <th className="py-3 px-4">Distance</th>
                      <th className="py-3 px-4 text-right">{t.markets.colAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE7DF]">
                    {filteredPrices.map((row, idx) => {
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
                        <tr key={idx} className="hover:bg-[#F9F7F3] transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-[#262320]">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#5A554E]" />
                              <span>{row.marketName}</span>
                            </div>
                            <span className="text-xs text-[#5A554E] font-normal block pl-5">
                              {row.district} {t.markets.dist}{row.state ? ` (${row.state})` : ''}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#262320]">
                            {row.commodity}
                          </td>
                          <td className="py-3.5 px-4 text-[#5A554E]">
                            ₹{row.minPrice.toLocaleString('en-IN')} - ₹{row.maxPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-heading font-bold text-[#1B4332] text-base whitespace-nowrap">
                            ₹{row.modalPrice.toLocaleString('en-IN')}{' '}
                            <span className="text-xs font-normal text-[#5A554E]">/ Qtl</span>
                          </td>
                          <td className="py-3.5 px-4 text-[#262320] text-xs">
                            <span className="font-semibold">{row.arrivalTonnes.toLocaleString('en-IN')} {t.markets.tonnes}</span>
                            <span className="text-[#5A554E] block">({(row.arrivalTonnes * 10).toLocaleString('en-IN')} Qtl)</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {row.trend === 'up' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D6A4F] bg-[#EAF2ED] px-2 py-0.5 rounded-[4px]">
                                <ArrowUpRight className="w-3 h-3" />
                                <span>Rising</span>
                              </span>
                            ) : row.trend === 'down' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded-[4px]">
                                <ArrowDownRight className="w-3 h-3" />
                                <span>Softening</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A554E] bg-[#ECE7DE] px-2 py-0.5 rounded-[4px]">
                                <Minus className="w-3 h-3" />
                                <span>Steady</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-[#5A554E] whitespace-nowrap">
                            {distance} km
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <Link href={`/calculator?${queryParams}`}>
                              <Button size="sm" variant="outline" className="text-xs py-1.5 px-3 border-[#1B4332] text-[#1B4332] hover:bg-[#EAF2ED]">
                                {t.markets.netProfitCheck}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (360px - 767px) */}
              <div className="block md:hidden divide-y divide-[#EBE7DF]">
                {filteredPrices.map((row, idx) => {
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
                    <div key={idx} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-[#262320] text-base">
                            <MapPin className="w-4 h-4 text-[#5A554E] shrink-0" />
                            <span>{row.marketName}</span>
                          </div>
                          <span className="text-xs text-[#5A554E]">
                            {row.district}{row.state ? `, ${row.state}` : ''} • ~{distance} km
                          </span>
                        </div>
                        {row.trend === 'up' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D6A4F] bg-[#EAF2ED] px-2 py-0.5 rounded-[4px] shrink-0">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Rising</span>
                          </span>
                        ) : row.trend === 'down' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded-[4px] shrink-0">
                            <ArrowDownRight className="w-3 h-3" />
                            <span>Softening</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A554E] bg-[#ECE7DE] px-2 py-0.5 rounded-[4px] shrink-0">
                            <Minus className="w-3 h-3" />
                            <span>Steady</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between bg-[#F4F1EA] p-2.5 rounded-[6px]">
                        <div>
                          <span className="text-[11px] text-[#5A554E] block">Commodity</span>
                          <span className="text-xs font-bold text-[#262320]">{row.commodity}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-[#5A554E] block">Modal Price</span>
                          <span className="font-heading font-black text-base text-[#1B4332]">
                            ₹{row.modalPrice.toLocaleString('en-IN')}{' '}
                            <span className="text-[10px] font-normal text-[#5A554E]">/ Qtl</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-[#5A554E]">
                        <div>
                          <span>Price Range: </span>
                          <strong className="text-[#262320]">₹{row.minPrice} - ₹{row.maxPrice}</strong>
                        </div>
                        <div className="text-right">
                          <span>Arrivals: </span>
                          <strong className="text-[#262320]">{row.arrivalTonnes} T</strong>
                        </div>
                      </div>

                      <Link href={`/calculator?${queryParams}`} className="block pt-1">
                        <Button size="sm" variant="outline" className="w-full text-xs border-[#1B4332] text-[#1B4332] hover:bg-[#EAF2ED] justify-center">
                          {t.markets.netProfitCheck}
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Trend & Arrival Volume Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-none border-[#D8D2C4]">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#1B4332] font-heading font-bold text-sm sm:text-base">
              <TrendingUp className="w-4 h-4" />
              <h4>Price Trends & Market Direction</h4>
            </div>
            <p className="text-xs sm:text-sm text-[#5A554E] leading-relaxed">
              Price trends reflect recent day-over-day modal price movement in physical mandi auctions. Rising trends typically reflect active buyer competition, while softening trends indicate increased yard intake.
            </p>
            <span className="text-[11px] text-[#7C766D] block">
              Transparent Notice: Trend indicators are derived from sample APMC modal records.
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-none border-[#D8D2C4]">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#1B4332] font-heading font-bold text-sm sm:text-base">
              <Truck className="w-4 h-4" />
              <h4>Arrival Volumes & Yard Liquidity</h4>
            </div>
            <p className="text-xs sm:text-sm text-[#5A554E] leading-relaxed">
              Arrival volumes (reported in Metric Tonnes) measure daily supply unloading at the mandi yard. Higher arrivals ensure liquid auctions and transparent price discovery, but heavy influx can occasionally soften immediate spot bids.
            </p>
            <span className="text-[11px] text-[#7C766D] block">
              Transparent Notice: Not predictive AI forecasting. Reflects reported yard volume.
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Schema Mapping / Technical Architecture Notice */}
      <div className="p-4 sm:p-5 rounded-[8px] bg-[#F4F1EA] border border-[#D8D2C4] text-xs sm:text-sm space-y-1.5">
        <span className="font-heading font-bold text-[#262320] block">
          {t.markets.archTitle}
        </span>
        <p className="text-[#5A554E] leading-relaxed">
          {t.markets.archDesc}
        </p>
      </div>
    </PageContainer>
  );
}
