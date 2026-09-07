'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { KEY_CROPS, MAHARASHTRA_DISTRICTS, ANDHRA_PRADESH_DISTRICTS } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Package,
  PlusCircle,
  MapPin,
  Calendar,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  Filter,
  Eye,
  Loader2,
  Scale,
  Sparkles,
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
        return <Badge variant="red">Cancelled</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">{t.lots.badge}</Badge>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-700" />
            <span>{t.lots.title}</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-3xl">{t.lots.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setFieldErrors({});
              setFormSuccessMessage(null);
              setIsModalOpen(true);
            }}
            className="gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t.lots.createNew}</span>
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            {t.lots.filterAll}
          </span>
          <div className="text-2xl font-black text-gray-900 mt-1">{metrics.totalLots}</div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            {t.lots.filterAvailable}
          </span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{metrics.activeLots}</div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
            {t.lots.filterDraft}
          </span>
          <div className="text-2xl font-black text-amber-900 mt-1">{metrics.draftLots}</div>
        </div>

        <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider block">
            {locale === 'mr' ? 'एकूण परिमाण' : locale === 'te' ? 'మొత్తం వాల్యూమ్' : 'Total Volume'}
          </span>
          <div className="text-2xl font-black text-sky-950 mt-1">
            {metrics.totalQuantityQuintals}{' '}
            <span className="text-sm font-semibold text-sky-700">Qtl</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100">
        <Filter className="w-4 h-4 text-gray-400 mr-1 shrink-0" />
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
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-emerald-800 text-emerald-100'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lots Content List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
          <p className="text-gray-500 font-medium text-sm">{t.lots.loading}</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="text-rose-900 font-semibold">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchLots}>
            Retry
          </Button>
        </div>
      ) : filteredLots.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50 text-center py-16 px-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">{t.lots.emptyTitle}</h3>
              <p className="text-gray-600 text-sm">{t.lots.emptyDesc}</p>
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
        /* Produce Lot Cards */
        <div className="grid grid-cols-1 gap-5">
          {filteredLots.map((lot) => (
            <Card
              key={lot.id}
              className="hover:border-emerald-300 hover:shadow-md transition-all border-gray-200"
            >
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {lot.lotCode}
                    </span>
                    {getStatusBadge(lot.status)}
                  </div>
                  <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lot.expectedGrade || 'Not Graded Yet'}</span>
                  </span>
                </div>

                <CardTitle className="text-xl text-gray-900 mt-2 flex items-center gap-2">
                  <span>{lot.commodity}</span>
                  {lot.variety && (
                    <>
                      <span className="text-gray-400 font-normal">•</span>
                      <span className="text-gray-600 font-medium text-lg">{lot.variety}</span>
                    </>
                  )}
                </CardTitle>

                <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600 mt-2">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {lot.location || lot.locationDistrict}, {lot.locationDistrict}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    {t.lots.volume}:{' '}
                    <strong className="text-gray-900 font-bold">
                      {lot.quantity} {lot.unit}
                    </strong>
                    {lot.unit !== 'Quintal' && (
                      <span className="text-gray-500 font-normal">
                        ({lot.quantityQuintals} Quintals)
                      </span>
                    )}
                  </span>
                  <span>•</span>
                  <span className="font-medium">
                    {t.lots.targetPrice}:{' '}
                    <strong className="text-emerald-800 font-bold">
                      ₹{lot.expectedPricePerQuintal || lot.expectedPrice}/Qtl
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {t.lots.availabilityDateLabel}:{' '}
                    {new Date(lot.readyForPickupDate).toLocaleDateString()}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/40 rounded-b-2xl">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    {(lot.offers && lot.offers.length) || 0} {t.lots.offersReceived}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/calculator?price=${lot.expectedPricePerQuintal || lot.expectedPrice}&crop=${encodeURIComponent(lot.commodity)}`}
                  >
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 min-h-[38px]">
                      <Scale className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t.lots.calculateRealisation}</span>
                    </Button>
                  </Link>

                  <Link href={`/lots/${lot.lotCode}`}>
                    <Button size="sm" variant="primary" className="text-xs gap-1.5 min-h-[38px]">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.lots.viewDetails}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE LOT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    KisanSetu Produce Lot
                  </span>
                </div>
                <h2 className="text-xl font-bold mt-1">{t.lots.createModalTitle}</h2>
                <p className="text-xs text-emerald-100">{t.lots.createModalSubtitle}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-emerald-700/50 text-emerald-100 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Success Alert Banner */}
              {formSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-fadeIn">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                  <span className="text-sm font-semibold">{formSuccessMessage}</span>
                </div>
              )}

              {/* General Error Banner */}
              {fieldErrors.general && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-sm font-semibold">{fieldErrors.general}</span>
                </div>
              )}

              {/* 1. Crop Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  <span>{t.lots.cropLabel}</span>
                  <span className="text-rose-500">*</span>
                </label>

                {/* Quick select pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1 rounded-xl border border-gray-100 bg-gray-50/50">
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
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/20 shadow-xs'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-base">{crop.icon}</span>
                        <span className="truncate">{displayName}</span>
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={formData.crop}
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  placeholder={t.lots.cropCustomPlaceholder}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
                {fieldErrors.crop && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.crop}</p>
                )}
              </div>

              {/* 2. Variety & Quality Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800">
                    {t.lots.varietyLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    placeholder={t.lots.varietyPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800">
                    {t.lots.expectedGradeLabel}
                  </label>
                  <select
                    value={formData.expectedGrade}
                    onChange={(e) => setFormData({ ...formData, expectedGrade: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Grade A">{t.lots.gradeA}</option>
                    <option value="Grade B">{t.lots.gradeB}</option>
                    <option value="Grade C">{t.lots.gradeC}</option>
                    <option value="Not Graded Yet">{t.lots.gradeNotYet}</option>
                  </select>
                </div>
              </div>

              {/* 3. Quantity and Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <span>{t.lots.quantityLabel}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600"
                  />
                  {fieldErrors.quantity && (
                    <p className="text-xs text-rose-600 font-medium">{fieldErrors.quantity}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800">
                    {t.lots.unitLabel}
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unit: e.target.value as 'Quintal' | 'Tonnes' | 'Kg',
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Quintal">Quintals (क्विंटल)</option>
                    <option value="Tonnes">Tonnes (टन)</option>
                    <option value="Kg">Kilograms (किलो)</option>
                  </select>
                </div>
              </div>

              {/* 4. Expected Price */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  <span>{t.lots.expectedPriceLabel}</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={formData.expectedPrice}
                    onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {t.lots.expectedPricePerQtl}:{' '}
                  <strong className="text-emerald-800">
                    ₹
                    {formData.unit === 'Tonnes'
                      ? (Number(formData.expectedPrice) / 10 || 0).toFixed(0)
                      : formData.unit === 'Kg'
                      ? (Number(formData.expectedPrice) * 100 || 0).toFixed(0)
                      : Number(formData.expectedPrice) || 0}
                    /Quintal
                  </strong>
                </p>
                {fieldErrors.expectedPrice && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.expectedPrice}</p>
                )}
              </div>

              {/* 5. Harvest & Availability Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800">
                    {t.lots.harvestDateLabel}
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800">
                    {t.lots.availabilityDateLabel}
                  </label>
                  <input
                    type="date"
                    value={formData.availabilityDate}
                    onChange={(e) =>
                      setFormData({ ...formData, availabilityDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              </div>

              {/* 6. District and Farm Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <span>{t.lots.districtLabel}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
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
                  </select>
                  {fieldErrors.district && (
                    <p className="text-xs text-rose-600 font-medium">{fieldErrors.district}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <span>{t.lots.locationLabel}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={t.lots.locationPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600"
                  />
                  {fieldErrors.location && (
                    <p className="text-xs text-rose-600 font-medium">{fieldErrors.location}</p>
                  )}
                </div>
              </div>

              {/* 7. Description / Storage notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  {t.lots.descriptionLabel}
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t.lots.descriptionPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="p-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {t.lots.cancelBtn}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSaveLot('DRAFT')}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-amber-800 border-amber-600 hover:bg-amber-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                <span>{t.lots.saveDraftBtn}</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={() => handleSaveLot('AVAILABLE')}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{t.lots.publishBtn}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LotsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
        </div>
      }
    >
      <LotsPageContent />
    </Suspense>
  );
}

