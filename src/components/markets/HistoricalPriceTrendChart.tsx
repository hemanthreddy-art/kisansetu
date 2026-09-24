'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import {
  MAHARASHTRA_MANDIS,
  generateMandiTrendSeries,
  PricePoint,
  MandiTrendResult,
} from '@/lib/mandi-network';
import {
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Activity,
  MapPin,
} from 'lucide-react';

interface HistoricalPriceTrendChartProps {
  initialCrop?: string;
  initialMandi?: string;
}

export function HistoricalPriceTrendChart({
  initialCrop = 'onion',
  initialMandi = 'Lasalgaon APMC',
}: HistoricalPriceTrendChartProps) {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop);
  const [selectedMandiName, setSelectedMandiName] = useState<string>(initialMandi);
  const [timeframe, setTimeframe] = useState<7 | 15 | 30>(15);
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);

  // Sync external crop changes (e.g. from parent market filters)
  useEffect(() => {
    if (initialCrop) {
      setSelectedCrop(initialCrop);
    }
  }, [initialCrop]);

  useEffect(() => {
    if (initialMandi) {
      setSelectedMandiName(initialMandi);
    }
  }, [initialMandi]);

  // Available agricultural commodities
  const cropOptions = useMemo(() => {
    return [
      { id: 'onion', label: 'Onion (कांदा / ఉల్లిపాయ / प्याज)' },
      { id: 'tomato', label: 'Tomato (टोमॅटो / టమోటా / टमाटर)' },
      { id: 'wheat', label: 'Wheat (गहू / గోధుమలు / गेहूँ)' },
      { id: 'soybean', label: 'Soybean (सोयाबीन / సోయాబీన్ / सोयाबीन)' },
      { id: 'cotton', label: 'Cotton (कापूस / పత్తి / कपास)' },
      { id: 'grapes', label: 'Grapes (द्राक्षे / ద్రాక్ష / अंगूर)' },
      { id: 'pomegranate', label: 'Pomegranate (डाळिंब / దానిమ్మ / अनार)' },
      { id: 'maize', label: 'Maize (मका / మొక్కజొన్న / मक्का)' },
      { id: 'jaggery', label: 'Jaggery (गूळ / బెల్లం / गुड़)' },
      { id: 'turmeric', label: 'Turmeric (हळद / పసుపు / हल्दी)' },
      { id: 'paddy', label: 'Paddy / Rice (भात / धान / వరి)' },
      { id: 'cashew', label: 'Raw Cashew Nut (काजू / జీడిపప్పు)' },
      { id: 'coffee', label: 'Arabica Coffee (कॉफ़ी / కాఫీ)' },
      { id: 'chilli', label: 'Red Chilli (लाल मिर्च / ఎర్ర మిరప)' },
    ];
  }, []);

  // Compute authentic mandi-specific price trend series
  const trendResult: MandiTrendResult = useMemo(() => {
    return generateMandiTrendSeries(selectedCrop, selectedMandiName, timeframe);
  }, [selectedCrop, selectedMandiName, timeframe]);

  const trendData = trendResult.points;
  const currentMandi = trendResult.mandiInfo;
  const percentChange = trendResult.percentChange;
  const activePoint = hoveredPoint || trendData[trendData.length - 1] || {
    dayIndex: 0,
    dateStr: 'Today',
    modalPrice: trendResult.currentModalPrice,
    minPrice: trendResult.minPrice,
    maxPrice: trendResult.maxPrice,
    arrivalTonnes: trendResult.arrivalTonnes,
  };

  // SVG dimensions & dynamic scaling
  const minInSeries = Math.min(...trendData.map((p) => p.minPrice));
  const maxInSeries = Math.max(...trendData.map((p) => p.maxPrice));
  const pricePadding = Math.max(80, (maxInSeries - minInSeries) * 0.15);
  const yMin = Math.max(0, Math.floor((minInSeries - pricePadding) / 50) * 50);
  const yMax = Math.ceil((maxInSeries + pricePadding) / 50) * 50;

  const svgWidth = 720;
  const svgHeight = 260;
  const paddingLeft = 68;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const getX = useCallback(
    (index: number) => {
      if (trendData.length <= 1) return paddingLeft + plotWidth / 2;
      return paddingLeft + (index / (trendData.length - 1)) * plotWidth;
    },
    [trendData.length, paddingLeft, plotWidth]
  );

  const getY = useCallback(
    (val: number) => {
      const range = yMax - yMin || 1;
      const ratio = (val - yMin) / range;
      return paddingTop + plotHeight - ratio * plotHeight;
    },
    [yMax, yMin, paddingTop, plotHeight]
  );

  const pathD = useMemo(() => {
    if (trendData.length === 0) return '';
    return trendData.reduce((acc, pt, idx) => {
      const x = getX(idx);
      const y = getY(pt.modalPrice);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [trendData, getX, getY]);

  const areaD = useMemo(() => {
    if (trendData.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(trendData.length - 1);
    const bottomY = paddingTop + plotHeight;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, trendData, getX, paddingTop, plotHeight]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const count = 4;
    const step = (yMax - yMin) / count;
    for (let i = 0; i <= count; i++) {
      const val = Math.round(yMin + i * step);
      ticks.push({ val, y: getY(val) });
    }
    return ticks;
  }, [yMin, yMax, getY]);

  const xLabels = useMemo(() => {
    const interval = timeframe === 30 ? 5 : timeframe === 15 ? 3 : 1;
    return trendData.filter((_, idx) => idx % interval === 0 || idx === trendData.length - 1);
  }, [trendData, timeframe]);

  return (
    <Card className="border-[#D8D2C4] shadow-none bg-white">
      <CardHeader className="border-b border-[#D8D2C4] pb-4">
        {/* Mandi Network Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="emerald" className="font-heading text-xs font-bold px-2 py-0.5">
                <Activity className="w-3.5 h-3.5 mr-1" />
                {t.markets.trendChartTitle}
              </Badge>
              <Badge variant="gray" className="text-xs bg-[#FAF8F5] border-[#D8D2C4] text-[#262320]">
                <MapPin className="w-3 h-3 mr-1 text-[#1B4332]" />
                {currentMandi.name} ({currentMandi.district}, {currentMandi.state})
              </Badge>
              <Badge variant="emerald" className="text-[11px] bg-[#EAF2ED] text-[#1B4332] border-[#C2DDD0]">
                {currentMandi.hubType}
              </Badge>
              <span className="text-[11px] text-[#7C766D] font-mono">
                {currentMandi.code} • ~{currentMandi.refDistanceKm} km
              </span>
            </div>

            <CardTitle className="text-xl sm:text-2xl font-heading font-bold text-[#262320]">
              ₹{trendResult.currentModalPrice.toLocaleString('en-IN')}{' '}
              <span className="text-xs sm:text-sm font-normal text-[#5A554E]">
                {t.common.perQuintal} ({t.markets.trendModalPrice})
              </span>
            </CardTitle>

            <CardDescription className="text-xs text-[#5A554E]">
              {trendResult.commodityLabel} • {t.markets.trendChartSubtitle}
            </CardDescription>
          </div>

          {/* Timeframe Selector (7 | 15 | 30) */}
          <div className="flex items-center gap-1.5 self-start lg:self-auto bg-[#F4F1EA] p-1 rounded-[6px] border border-[#D8D2C4]">
            <button
              type="button"
              onClick={() => setTimeframe(7)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${
                timeframe === 7
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'text-[#5A554E] hover:text-[#262320]'
              }`}
            >
              {t.markets.trendSevenDays}
            </button>
            <button
              type="button"
              onClick={() => setTimeframe(15)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${
                timeframe === 15
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'text-[#5A554E] hover:text-[#262320]'
              }`}
            >
              {t.markets.trendFifteenDays}
            </button>
            <button
              type="button"
              onClick={() => setTimeframe(30)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${
                timeframe === 30
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'text-[#5A554E] hover:text-[#262320]'
              }`}
            >
              {t.markets.trendThirtyDays}
            </button>
          </div>
        </div>

        {/* Coordinated Crop & Mandi Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
          <Select
            label={t.markets.trendSelectCrop}
            value={selectedCrop}
            onChange={(e) => {
              setSelectedCrop(e.target.value);
              setHoveredPoint(null);
            }}
          >
            {cropOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>

          <Select
            label={`${t.markets.trendSelectMandi} (10+ Maharashtra APMCs)`}
            value={selectedMandiName}
            onChange={(e) => {
              setSelectedMandiName(e.target.value);
              setHoveredPoint(null);
            }}
          >
            {MAHARASHTRA_MANDIS.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name} ({m.district}) — {m.hubType}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Dynamic Market KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3 rounded-[6px] border border-[#EBE7DF]">
          <div>
            <span className="text-[11px] font-semibold text-[#5A554E] block">
              {hoveredPoint ? `Modal Price (${hoveredPoint.dateStr})` : t.markets.trendModalPrice}
            </span>
            <span className="font-heading font-bold text-[#1B4332] text-base sm:text-lg">
              ₹{activePoint.modalPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#5A554E] block">
              {t.markets.trendPeriodChange} ({timeframe}d)
            </span>
            <span
              className={`inline-flex items-center gap-1 font-heading font-bold text-sm sm:text-base ${
                percentChange >= 0 ? 'text-[#2D6A4F]' : 'text-[#B45309]'
              }`}
            >
              {percentChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {percentChange > 0 ? `+${percentChange}%` : `${percentChange}%`}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#5A554E] block">
              {t.markets.trendPriceRange}
            </span>
            <span className="font-medium text-[#262320] text-xs sm:text-sm">
              ₹{activePoint.minPrice.toLocaleString('en-IN')} - ₹{activePoint.maxPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#5A554E] block">
              {t.markets.trendArrivals}
            </span>
            <span className="font-medium text-[#262320] text-xs sm:text-sm">
              {activePoint.arrivalTonnes.toLocaleString('en-IN')} {t.markets.tonnes}
            </span>
          </div>
        </div>

        {/* Responsive Interactive SVG Line & Area Chart */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none"
            style={{ maxHeight: '300px' }}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.28" />
                <stop offset="85%" stopColor="#2D6A4F" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Price Ticks */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={svgWidth - paddingRight}
                  y2={tick.y}
                  stroke="#EBE7DF"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={tick.y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#7C766D"
                  fontFamily="sans-serif"
                >
                  ₹{tick.val.toLocaleString('en-IN')}
                </text>
              </g>
            ))}

            {/* Area Fill */}
            <path d={areaD} fill="url(#areaGradient)" />

            {/* Main Trend Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#1B4332"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Points & Hover Targets */}
            {trendData.map((pt, idx) => {
              const cx = getX(idx);
              const cy = getY(pt.modalPrice);
              const isHovered = hoveredPoint?.dateStr === pt.dateStr;
              return (
                <g key={idx}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5.5 : 3.5}
                    fill={isHovered ? '#1B4332' : '#FFFFFF'}
                    stroke="#1B4332"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onTouchStart={() => setHoveredPoint(pt)}
                  />
                </g>
              );
            })}

            {/* Date Labels along X-Axis */}
            {xLabels.map((pt, i) => {
              const origIdx = trendData.findIndex((p) => p.dateStr === pt.dateStr);
              const x = getX(origIdx >= 0 ? origIdx : 0);
              return (
                <text
                  key={i}
                  x={x}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#5A554E"
                  fontFamily="sans-serif"
                >
                  {pt.dateStr}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Footer & Compliance Notice */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[#5A554E] pt-2 border-t border-[#EBE7DF]">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
            <span>
              {currentMandi.name} ({currentMandi.district}) • {t.markets.trendDemoNotice}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#7C766D]">
              Baseline: Agmarknet modal trade registry (Govt of Maharashtra APMC network)
            </span>
            <Badge
              variant={percentChange >= 0 ? 'emerald' : 'amber'}
              className="text-[10px] py-0 px-1.5"
            >
              {percentChange >= 0 ? t.markets.trendBadgeRising : t.markets.trendBadgeSoftening}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
