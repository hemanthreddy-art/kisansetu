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
} from 'lucide-react';
import { ProduceLot } from '@/types';

function LotsPageContent() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();

  // Lots state
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalLots: 0,
    activeLots: 0,
    draftLots: 0,
    totalQuantityQuintals: 0,
  });

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Check URL query parameters to auto-open create modal if requested
  useEffect(() => {
    if (searchParams?.get('action') === 'create' || searchParams?.get('create') === 'true') {
      setIsModalOpen(true);
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
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setFieldErrors({});
              setFormSuccessMessage(null);
              setIsModalOpen(true);
            }}
            className="gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.lots.createNew}</span>
          </Button>
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
              onClick={() => {
                setFieldErrors({});
                setFormSuccessMessage(null);
                setIsModalOpen(true);
              }}
              className="gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.lots.createFirstLot}</span>
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="shadow-none border-[#D8D2C4]">
          <CardHeader className="border-b border-[#D8D2C4] pb-3 bg-[#F4F1EA]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-heading font-bold text-[#262320]">
                  {t.lots.registeredLotsTitle} ({filteredLots.length})
                </CardTitle>
                <CardDescription className="text-xs text-[#5A554E]">
                  {t.lots.activeLotsSub}
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-[#5A554E] bg-white px-2.5 py-1 rounded-[4px] border border-[#D8D2C4]">
                {t.lots.digitalApmcYard}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
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
