'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { KEY_CROPS, MAHARASHTRA_DISTRICTS, ANDHRA_PRADESH_DISTRICTS } from '@/lib/constants';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  Package,
  PlusCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  Filter,
  Loader2,
  Scale,
  Sparkles,
  FileText,
  LayoutGrid,
  List,
} from 'lucide-react';
import { ProduceLot } from '@/types';
import { SellMyCropWizard } from '@/components/farmer/SellMyCropWizard';

function LotsPageContent() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();

  // Lots state
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalLots: 0,
    activeLots: 0,
    draftLots: 0,
    totalQuantityQuintals: 0,
  });

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSellWizardOpen, setIsSellWizardOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const todayStr = new Date().toISOString().split('T')[0];

  const initialFormData = {
    crop: 'Onion',
    variety: '',
    quantity: '50',
    unit: 'Quintal' as 'Quintal' | 'Tonnes' | 'Kg',
    expectedPrice: '2200',
    expectedGrade: 'Grade A',
    harvestDate: todayStr,
    availabilityDate: todayStr,
    district: 'Nashik',
    location: 'Niphad, Nashik',
    description: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  // Check URL query parameters to auto-open Sell My Crop wizard if requested
  useEffect(() => {
    if (searchParams?.get('action') === 'create' || searchParams?.get('create') === 'true') {
      setIsSellWizardOpen(true);
    }
  }, [searchParams]);

  // Fetch produce lots from SQLite API
  const fetchLots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/lots');
      if (!res.ok) {
        throw new Error('Failed to load produce lots');
      }
      const data = await res.json();
      if (data.success) {
        setLots(data.data || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } else {
        setError(data.error || 'Failed to fetch produce lots');
      }
    } catch (err: unknown) {
      console.error('Error loading lots:', err);
      setError(err instanceof Error ? err.message : 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  // Client validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.crop.trim()) {
      errors.crop = locale === 'mr' ? 'कृपया शेतमाल/पीक निवडा' : 'Please select or enter a crop';
    }
    const qNum = Number(formData.quantity);
    if (isNaN(qNum) || qNum <= 0) {
      errors.quantity =
        locale === 'mr' ? 'वजन शून्य किंवा ऋण असू शकत नाही' : 'Quantity must be greater than 0';
    }
    const pNum = Number(formData.expectedPrice);
    if (isNaN(pNum) || pNum < 0) {
      errors.expectedPrice =
        locale === 'mr' ? 'अपेक्षित भाव योग्य लिहा' : 'Please enter a valid price (>= 0)';
    }
    if (!formData.district) {
      errors.district = locale === 'mr' ? 'जिल्हा निवडा' : 'Please select a district';
    }
    if (!formData.location.trim()) {
      errors.location =
        locale === 'mr' ? 'गाव किंवा शेताचा पत्ता आवश्यक आहे' : 'Location address is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Lot Handler
  const handleSaveLot = async (targetStatus: 'AVAILABLE' | 'DRAFT') => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setFieldErrors({});

      const payload = {
        crop: formData.crop,
        variety: formData.variety,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        expectedPrice: Number(formData.expectedPrice),
        expectedGrade: formData.expectedGrade,
        harvestDate: formData.harvestDate,
        availabilityDate: formData.availabilityDate,
        district: formData.district,
        location: formData.location,
        description: formData.description,
        status: targetStatus,
      };

      const res = await fetch('/api/lots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        if (result.details) {
          setFieldErrors(result.details);
        } else {
          setFieldErrors({ general: result.error || 'Failed to save lot' });
        }
        return;
      }

      // Success
      setFormSuccessMessage(
        locale === 'mr'
          ? `शेतमाल लॉट यशस्वीरित्या तयार केला! लॉट आयडी: ${result.lotId}`
          : locale === 'te'
          ? `పంట లాట్ విజయవంతంగా సృష్టించబడింది! లాట్ ID: ${result.lotId}`
          : `Produce Lot created successfully! Lot ID: ${result.lotId}`
      );

      // Refresh data
      await fetchLots();

      // Reset & close after short delay
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccessMessage(null);
        setFormData(initialFormData);
      }, 1400);
    } catch (err: unknown) {
      console.error('Error submitting lot:', err);
      setFieldErrors({ general: err instanceof Error ? err.message : 'Error saving lot' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered lots
  const filteredLots = lots.filter((lot) => {
    if (activeTab === 'ALL') return true;
    return lot.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="emerald">{t.lots.filterAvailable}</Badge>;
      case 'DRAFT':
        return <Badge variant="amber">{t.lots.filterDraft}</Badge>;
      case 'RESERVED':
        return <Badge variant="blue">{t.lots.filterReserved}</Badge>;
      case 'SOLD':
        return <Badge variant="purple">{t.lots.filterSold}</Badge>;
      case 'CANCELLED':
        return <Badge variant="red">{t.commonStatuses.cancelled}</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <PageContainer maxWidth="7xl" className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title={t.lots.title}
        description={t.lots.subtitle}
        badge={<Badge variant="emerald">{t.lots.badge}</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsSellWizardOpen(true)}
              className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-2 font-bold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.farmer.sellMyCropHero}</span>
            </Button>
            <span className="sr-only" aria-hidden="true">{t.lots.createNew}</span>
          </div>
        }
      />

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#D8D2C4] rounded-[8px] p-4">
          <span className="text-xs font-bold text-[#5A554E] uppercase tracking-wider block">
            {t.lots.filterAll}
          </span>
          <div className="text-2xl font-black font-heading text-[#262320] mt-1">
            {metrics.totalLots}
          </div>
          <span className="text-[11px] text-[#5A554E] block mt-0.5">{t.lots.totalRegisteredLots}</span>
        </div>

        <div className="bg-[#EAF2ED] border border-[#B7D5C4] rounded-[8px] p-4">
          <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
            {t.lots.filterAvailable}
          </span>
          <div className="text-2xl font-black font-heading text-[#1B4332] mt-1">
            {metrics.activeLots}
          </div>
          <span className="text-[11px] text-[#2D6A4F] block mt-0.5">{t.lots.openForBuyerDiscovery}</span>
        </div>

        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] p-4">
          <span className="text-xs font-bold text-[#92400E] uppercase tracking-wider block">
            {t.lots.filterDraft}
          </span>
          <div className="text-2xl font-black font-heading text-[#92400E] mt-1">
            {metrics.draftLots}
          </div>
          <span className="text-[11px] text-[#B45309] block mt-0.5">{t.lots.unpublishedDrafts}</span>
        </div>

        <div className="bg-[#E0F2FE] border border-[#BAE6FD] rounded-[8px] p-4">
          <span className="text-xs font-bold text-[#0369A1] uppercase tracking-wider block">
            {t.lots.totalVolume}
          </span>
          <div className="text-2xl font-black font-heading text-[#0369A1] mt-1">
            {metrics.totalQuantityQuintals}{' '}
            <span className="text-sm font-normal text-[#0369A1]">{t.common.quintals}</span>
          </div>
          <span className="text-[11px] text-[#0369A1] block mt-0.5">
            {(metrics.totalQuantityQuintals * 0.1).toFixed(1)} Metric Tonnes
          </span>
        </div>
      </div>

      {/* Status Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#D8D2C4]">
        <Filter className="w-4 h-4 text-[#5A554E] mr-1 shrink-0" />
        {[
          { id: 'ALL', label: t.lots.filterAll, count: lots.length },
          {
            id: 'AVAILABLE',
            label: t.lots.filterAvailable,
            count: lots.filter((l) => l.status === 'AVAILABLE').length,
          },
          {
            id: 'DRAFT',
            label: t.lots.filterDraft,
            count: lots.filter((l) => l.status === 'DRAFT').length,
          },
          {
            id: 'RESERVED',
            label: t.lots.filterReserved,
            count: lots.filter((l) => l.status === 'RESERVED').length,
          },
          {
            id: 'SOLD',
            label: t.lots.filterSold,
            count: lots.filter((l) => l.status === 'SOLD').length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
              activeTab === tab.id
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white text-[#262320] border-[#D8D2C4] hover:bg-[#F4F1EA]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id
                  ? 'bg-[#2D6A4F] text-white'
                  : 'bg-[#ECE7DE] text-[#5A554E]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lots Content: Table / Mobile Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#1B4332] animate-spin mx-auto" />
          <p className="text-[#5A554E] font-medium text-sm">{t.lots.loading}</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-[8px] bg-[#FEE2E2] border border-[#FCA5A5] text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#991B1B] mx-auto" />
          <p className="text-[#991B1B] font-semibold">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchLots}>
            Retry
          </Button>
        </div>
      ) : filteredLots.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-2 border-[#D8D2C4] bg-[#FAFAF8] text-center py-16 px-4 shadow-none">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-[8px] bg-[#EAF2ED] text-[#1B4332] mx-auto flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-heading font-bold text-[#262320]">{t.lots.emptyTitle}</h3>
              <p className="text-[#5A554E] text-sm">{t.lots.emptyDesc}</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsSellWizardOpen(true)}
              className="gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.farmer.sellMyCropHero}</span>
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="shadow-none border-[#D8D2C4]">
          <CardHeader className="border-b border-[#D8D2C4] pb-3 bg-[#F4F1EA]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-heading font-bold text-[#262320]">
                  {t.lots.registeredLotsTitle} ({filteredLots.length})
                </CardTitle>
                <CardDescription className="text-xs text-[#5A554E]">
                  {t.lots.activeLotsSub}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle: Grid Marketplace Cards vs Compact Table */}
                <div className="flex items-center rounded border border-[#D8D2C4] bg-white p-0.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('GRID')}
                    className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                      viewMode === 'GRID'
                        ? 'bg-[#1B4332] text-white font-semibold shadow-xs'
                        : 'text-[#635E59] hover:text-[#262320]'
                    }`}
                    title="Produce Marketplace Grid"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('TABLE')}
                    className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                      viewMode === 'TABLE'
                        ? 'bg-[#1B4332] text-white font-semibold shadow-xs'
                        : 'text-[#635E59] hover:text-[#262320]'
                    }`}
                    title="Compact Table View"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>

                <span className="hidden sm:inline text-xs font-semibold text-[#5A554E] bg-white px-2.5 py-1 rounded-[4px] border border-[#D8D2C4]">
                  {t.lots.digitalApmcYard}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* 1. PRODUCE MARKETPLACE GRID VIEW */}
            {viewMode === 'GRID' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 p-4 sm:p-5">
                {filteredLots.map((lot) => {
                  const price = lot.expectedPricePerQuintal || lot.expectedPrice || 0;
                  const qty = lot.quantityQuintals || lot.quantity || 0;
                  const grossVal = Math.round(qty * price);
                  const estNetRealisation = Math.round(grossVal * 0.985);

                  let photoUrl: string | null = null;
                  if (lot.lotPhotosJson) {
                    try {
                      const parsed = JSON.parse(lot.lotPhotosJson);
                      if (Array.isArray(parsed) && parsed.length > 0) photoUrl = parsed[0];
                      else if (typeof parsed === 'string') photoUrl = parsed;
                    } catch {
                      if (typeof lot.lotPhotosJson === 'string' && lot.lotPhotosJson.startsWith('data:')) {
                        photoUrl = lot.lotPhotosJson;
                      }
                    }
                  }

                  const cropMatch = KEY_CROPS.find(
                    (c) => c.nameEn.toLowerCase() === (lot.commodity || '').toLowerCase()
                  );
                  const cropEmoji = cropMatch?.icon || '🌾';

                  return (
                    <div
                      key={lot.id}
                      className="bg-white rounded-[10px] border border-[#D8D2C4] hover:border-[#1B4332] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      <div>
                        {/* Top Visual Banner */}
                        <div className="relative h-44 bg-[#F4F1EA] overflow-hidden flex items-center justify-center border-b border-[#ECE7DE]">
                          {photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photoUrl}
                              alt={lot.commodity}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <span className="text-6xl drop-shadow-xs select-none">{cropEmoji}</span>
                              <span className="block text-xs font-semibold text-[#635E59] mt-2">
                                {lot.commodity} {lot.variety ? `• ${lot.variety}` : ''}
                              </span>
                            </div>
                          )}

                          {/* Badges Overlay */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/95 text-[#1B4332] shadow-xs border border-[#B7D5C4]">
                              {lot.lotCode}
                            </span>
                            {getStatusBadge(lot.status)}
                          </div>

                          <div className="absolute bottom-2.5 right-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B4332]/90 text-white backdrop-blur-xs">
                              {lot.expectedGrade || 'Grade A'}
                            </span>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="font-heading font-bold text-lg text-[#262320]">
                              {lot.commodity}
                              {lot.variety && (
                                <span className="font-normal text-sm text-[#635E59] ml-1.5 font-sans">
                                  ({lot.variety})
                                </span>
                              )}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-[#635E59] mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#1B4332] shrink-0" />
                              <span className="truncate">{lot.location || lot.locationDistrict}</span>
                            </div>
                          </div>

                          {/* Pricing & Volume Strip */}
                          <div className="bg-[#FAF8F5] p-3 rounded-[6px] border border-[#ECE7DE] flex items-center justify-between">
                            <div>
                              <span className="text-[11px] text-[#635E59] block">{t.lots.volume}</span>
                              <span className="font-bold text-sm text-[#262320]">
                                {lot.quantity} {lot.unit}
                              </span>
                              {lot.unit !== 'Quintal' && (
                                <span className="text-[10px] text-[#635E59] block">
                                  ({lot.quantityQuintals} Quintals)
                                </span>
                              )}
                            </div>

                            <div className="text-right">
                              <span className="text-[11px] text-[#635E59] block">{t.lots.targetPrice}</span>
                              <div className="text-base font-bold text-[#1B4332]">
                                ₹{price.toLocaleString('en-IN')}
                                <span className="text-[10px] font-normal text-[#635E59]">/{t.common.perQuintal}</span>
                              </div>
                            </div>
                          </div>

                          {/* Net Realisation Differentiator Tag */}
                          <div className="flex items-center justify-between text-[11px] text-[#2D6A4F] bg-[#EAF2ED]/70 p-2 rounded border border-[#B7D5C4]/60">
                            <span className="font-semibold">Est. Net Realisation:</span>
                            <span className="font-bold text-[#1B4332]">₹{estNetRealisation.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 pt-0 flex items-center gap-2">
                        <Link href={`/lots/${lot.lotCode || lot.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs border-[#1B4332] text-[#1B4332] hover:bg-[#EAF2ED] font-semibold h-9"
                          >
                            <span>{t.lots.viewDetails}</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. COMPACT TABLE VIEW */}
            {viewMode === 'TABLE' && (
              <>
                {/* Desktop Table View (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F4F1EA] text-[#5A554E] uppercase text-[11px] font-bold tracking-wider border-b border-[#D8D2C4]">
                  <tr>
                    <th className="py-3 px-4">{t.lots.lotId}</th>
                    <th className="py-3 px-4">{t.lots.crop}</th>
                    <th className="py-3 px-4">{t.lots.volume}</th>
                    <th className="py-3 px-4">{t.lots.targetPrice}</th>
                    <th className="py-3 px-4">{t.lots.location}</th>
                    <th className="py-3 px-4">{t.lots.grade}</th>
                    <th className="py-3 px-4">{t.lots.status}</th>
                    <th className="py-3 px-4">{t.lots.offersReceived}</th>
                    <th className="py-3 px-4 text-right">{t.lots.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE7DF]">
                  {filteredLots.map((lot) => {
                    const price = lot.expectedPricePerQuintal || lot.expectedPrice || 0;
                    const qty = lot.quantityQuintals || lot.quantity;
                    return (
                      <tr key={lot.id} className="hover:bg-[#F9F7F3] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#1B4332] whitespace-nowrap">
                          {lot.lotCode}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#262320]">
                          <div className="flex items-center gap-1.5">
                            <span>{lot.commodity}</span>
                          </div>
                          {lot.variety && (
                            <span className="text-xs text-[#5A554E] font-normal block">
                              {lot.variety}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-[#262320]">
                            {lot.quantity} {lot.unit}
                          </span>
                          {lot.unit !== 'Quintal' && (
                            <span className="text-xs text-[#5A554E] block">
                              ({lot.quantityQuintals} {t.common.quintals})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-heading font-bold text-[#1B4332] whitespace-nowrap">
                          ₹{price.toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-normal text-[#5A554E]">{t.common.perQuintal}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#5A554E]">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#5A554E] shrink-0" />
                            <span className="truncate max-w-[140px]" title={lot.location || lot.locationDistrict}>
                              {lot.location || lot.locationDistrict}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#7C766D] pl-4 block">
                            {lot.locationDistrict}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#EAF2ED] text-[#1B4332] px-2 py-0.5 rounded-[4px] border border-[#B7D5C4]">
                            <Sparkles className="w-3 h-3 text-[#2D6A4F]" />
                            <span>{lot.expectedGrade || t.lots.notGraded}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getStatusBadge(lot.status)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#5A554E] whitespace-nowrap">
                          <span className="font-semibold text-[#262320]">
                            {(lot.offers && lot.offers.length) || 0}
                          </span>{' '}
                          {t.lots.offersCount}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/calculator?price=${price}&crop=${encodeURIComponent(lot.commodity.toLowerCase())}&quantity=${qty}`}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs py-1 px-2 border-[#D8D2C4] hover:bg-[#F4F1EA] gap-1"
                                title={t.lots.calculateRealisation}
                              >
                                <Scale className="w-3 h-3 text-[#1B4332]" />
                                <span>{t.netRealisation.netRealisation}</span>
                              </Button>
                            </Link>

                            <Link href={`/lots/${lot.lotCode}`}>
                              <Button
                                size="sm"
                                variant="primary"
                                className="text-xs py-1 px-2.5 gap-1"
                              >
                                <span>{t.lots.viewDetails}</span>
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (<md, 360px - 767px) */}
            <div className="block md:hidden divide-y divide-[#EBE7DF]">
              {filteredLots.map((lot) => {
                const price = lot.expectedPricePerQuintal || lot.expectedPrice || 0;
                const qty = lot.quantityQuintals || lot.quantity;
                return (
                  <div key={lot.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs text-[#1B4332] block">
                          {lot.lotCode}
                        </span>
                        <h4 className="font-heading font-bold text-base text-[#262320]">
                          {lot.commodity}
                          {lot.variety && <span className="font-normal text-xs text-[#5A554E]"> • {lot.variety}</span>}
                        </h4>
                      </div>
                      {getStatusBadge(lot.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-[#F4F1EA] p-2.5 rounded-[6px] text-xs">
                      <div>
                        <span className="text-[#5A554E] block">{t.lots.volume}</span>
                        <span className="font-bold text-[#262320]">
                          {lot.quantity} {lot.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#5A554E] block">{t.lots.targetPrice}</span>
                        <span className="font-heading font-bold text-[#1B4332]">
                          ₹{price.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal text-[#5A554E]">{t.common.perQuintal}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#5A554E]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[180px]">{lot.location || lot.locationDistrict}</span>
                      </div>
                      <span className="font-semibold text-[#1B4332]">
                        {lot.expectedGrade || t.lots.notGraded}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/calculator?price=${price}&crop=${encodeURIComponent(lot.commodity.toLowerCase())}&quantity=${qty}`}
                        className="block"
                      >
                        <Button size="sm" variant="outline" className="w-full text-xs border-[#D8D2C4] hover:bg-[#F4F1EA] gap-1 justify-center">
                          <Scale className="w-3 h-3 text-[#1B4332]" />
                          <span>{t.netRealisation.netRealisation}</span>
                        </Button>
                      </Link>

                      <Link href={`/lots/${lot.lotCode}`} className="block">
                        <Button size="sm" variant="primary" className="w-full text-xs gap-1 justify-center">
                          <span>{t.lots.viewDetails}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
            )}
          </CardContent>
        </Card>
      )}

      {/* CREATE PRODUCE LOT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-[8px] shadow-lg border border-[#D8D2C4] overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#1B4332] text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3E635] block">
                  KisanSetu Digital Mandi
                </span>
                <h2 className="text-lg sm:text-xl font-heading font-bold text-white mt-0.5">
                  {t.lots.createModalTitle}
                </h2>
                <p className="text-xs text-emerald-100">{t.lots.createModalSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-[4px] hover:bg-[#2D6A4F] text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
              {/* Success Alert Banner */}
              {formSuccessMessage && (
                <div className="p-4 rounded-[6px] bg-[#EAF2ED] border border-[#B7D5C4] text-[#1B4332] flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">{formSuccessMessage}</span>
                </div>
              )}

              {/* General Error Banner */}
              {fieldErrors.general && (
                <div className="p-4 rounded-[6px] bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-[#991B1B] shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">{fieldErrors.general}</span>
                </div>
              )}

              {/* SECTION 1: PRODUCE */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D8D2C4] pb-1.5">
                  <Package className="w-4 h-4 text-[#1B4332]" />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1B4332]">
                    1. Produce Information
                  </h3>
                </div>

                {/* Crop Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#262320] flex items-center gap-1">
                    <span>{t.lots.cropLabel}</span>
                    <span className="text-[#B91C1C]">*</span>
                  </label>

                  {/* Quick select pills */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1.5 rounded-[6px] border border-[#D8D2C4] bg-[#FAFAF8]">
                    {KEY_CROPS.map((crop) => {
                      const displayName =
                        locale === 'mr'
                          ? crop.nameMr
                          : locale === 'te'
                          ? crop.nameTe
                          : locale === 'hi'
                          ? crop.nameHi
                          : crop.nameEn;
                      const isSelected = formData.crop.toLowerCase() === crop.nameEn.toLowerCase();
                      return (
                        <button
                          key={crop.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, crop: crop.nameEn })}
                          className={`px-2 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                            isSelected
                              ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-xs'
                              : 'bg-white border-[#D8D2C4] text-[#262320] hover:bg-[#F4F1EA]'
                          }`}
                        >
                          <span className="text-sm">{crop.icon}</span>
                          <span className="truncate">{displayName}</span>
                        </button>
                      );
                    })}
                  </div>

                  <Input
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    placeholder={t.lots.cropCustomPlaceholder}
                    error={fieldErrors.crop}
                  />
                </div>

                {/* Variety & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <Input
                      label={t.lots.varietyLabel}
                      value={formData.variety}
                      onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                      placeholder={t.lots.varietyPlaceholder}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <Input
                      type="number"
                      min="1"
                      step="any"
                      label={t.lots.quantityLabel}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      error={fieldErrors.quantity}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <Select
                      label={t.lots.unitLabel}
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit: e.target.value as 'Quintal' | 'Tonnes' | 'Kg',
                        })
                      }
                    >
                      <option value="Quintal">Quintals (क्विंटल)</option>
                      <option value="Tonnes">Tonnes (टन)</option>
                      <option value="Kg">Kilograms (किलो)</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOCATION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-[#D8D2C4] pb-1.5">
                  <MapPin className="w-4 h-4 text-[#1B4332]" />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1B4332]">
                    2. Pickup Location
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label={t.lots.districtLabel}
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    error={fieldErrors.district}
                  >
                    <optgroup label="Maharashtra Districts">
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Andhra Pradesh & Vizag Region">
                      {ANDHRA_PRADESH_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </optgroup>
                  </Select>

                  <Input
                    label={t.lots.locationLabel}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={t.lots.locationPlaceholder}
                    error={fieldErrors.location}
                  />
                </div>
              </div>

              {/* SECTION 3: QUALITY & PRICING */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-[#D8D2C4] pb-1.5">
                  <Sparkles className="w-4 h-4 text-[#1B4332]" />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1B4332]">
                    3. Pricing & Quality Expectation
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      min="0"
                      step="10"
                      label={t.lots.expectedPriceLabel}
                      value={formData.expectedPrice}
                      onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                      error={fieldErrors.expectedPrice}
                      helperText={`${t.lots.expectedPricePerQtl}: ₹${
                        formData.unit === 'Tonnes'
                          ? (Number(formData.expectedPrice) / 10 || 0).toFixed(0)
                          : formData.unit === 'Kg'
                          ? (Number(formData.expectedPrice) * 100 || 0).toFixed(0)
                          : Number(formData.expectedPrice) || 0
                      }/Qtl`}
                    />
                  </div>

                  <Select
                    label={t.lots.expectedGradeLabel}
                    value={formData.expectedGrade}
                    onChange={(e) => setFormData({ ...formData, expectedGrade: e.target.value })}
                  >
                    <option value="Grade A">{t.lots.gradeA}</option>
                    <option value="Grade B">{t.lots.gradeB}</option>
                    <option value="Grade C">{t.lots.gradeC}</option>
                    <option value="Not Graded Yet">{t.lots.gradeNotYet}</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#262320] mb-1.5">
                      {t.lots.harvestDateLabel}
                    </label>
                    <input
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm text-[#262320] bg-white border border-[#D8D2C4] rounded-[4px] min-h-[44px] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#262320] mb-1.5">
                      {t.lots.availabilityDateLabel}
                    </label>
                    <input
                      type="date"
                      value={formData.availabilityDate}
                      onChange={(e) =>
                        setFormData({ ...formData, availabilityDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm text-[#262320] bg-white border border-[#D8D2C4] rounded-[4px] min-h-[44px] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: STORAGE & NOTES */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-[#D8D2C4] pb-1.5">
                  <FileText className="w-4 h-4 text-[#1B4332]" />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1B4332]">
                    4. Storage & Notes
                  </h3>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#262320] mb-1.5">
                    {t.lots.descriptionLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t.lots.descriptionPlaceholder}
                    className="w-full px-3.5 py-2.5 text-sm text-[#262320] bg-white border border-[#D8D2C4] rounded-[4px] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="p-4 bg-[#F4F1EA] border-t border-[#D8D2C4] flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs"
              >
                {t.lots.cancelBtn}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSaveLot('DRAFT')}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs border-[#B45309] text-[#B45309] hover:bg-[#FFFBEB]"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                <span>{t.lots.saveDraftBtn}</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={() => handleSaveLot('AVAILABLE')}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{t.lots.publishBtn}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer-First Guided 4-Step Listing Flow */}
      <SellMyCropWizard
        isOpen={isSellWizardOpen}
        onClose={() => setIsSellWizardOpen(false)}
        onSuccess={(newLot) => {
          setIsSellWizardOpen(false);
          setLots((prev) => [newLot, ...prev]);
        }}
      />
    </PageContainer>
  );
}

export default function LotsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#1B4332] animate-spin mx-auto" />
        </div>
      }
    >
      <LotsPageContent />
    </Suspense>
  );
}
