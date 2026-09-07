'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  ShieldAlert,
  FileCheck2,
  Camera,
  Award,
  Calendar,
  MapPin,
  UserCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface InspectorLotItem {
  id: string;
  lotCode: string;
  commodity: string;
  variety: string;
  quantity: number;
  unit: string;
  quantityQuintals: number;
  expectedPricePerQuintal?: number;
  currentGrade?: string;
  locationDistrict?: string;
  location?: string;
  farmerName: string;
  farmerPhone?: string;
  createdAt: string;
  aiAssessment: {
    status: string;
    label: string;
    estimatedGrade: string;
    color?: string;
    sizeUniformity?: number;
    visibleDefects?: number;
    assessedAt: string;
  } | null;
  latestVerification: {
    id: string;
    status: string;
    label: string;
    officialGrade: string;
    certificateNumber?: string;
    moisturePercentage?: number;
    foreignMatterPerc?: number;
    location?: string;
    notes?: string;
    verifiedAt: string;
  } | null;
  inspectionStatus: 'PENDING' | 'PHYSICALLY_VERIFIED' | 'REQUIRES_REINSPECTION' | 'REJECTED' | string;
}

interface InspectorMetrics {
  totalLots: number;
  pendingInspections: number;
  completedVerifications: number;
  reinspectionRequired: number;
  rejected: number;
}

interface InspectorProfile {
  id: string;
  agencyName: string;
  licenseNumber: string;
  assignedDistricts: string[];
}

function InspectorDeskContent() {
  const { t } = useLanguage();

  const [lots, setLots] = useState<InspectorLotItem[]>([]);
  const [metrics, setMetrics] = useState<InspectorMetrics>({
    totalLots: 0,
    pendingInspections: 0,
    completedVerifications: 0,
    reinspectionRequired: 0,
    rejected: 0,
  });
  const [inspector, setInspector] = useState<InspectorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PHYSICALLY_VERIFIED' | 'REQUIRES_REINSPECTION' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Physical Inspection Modal State
  const [selectedLot, setSelectedLot] = useState<InspectorLotItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<{ certificateNumber: string; message: string } | null>(null);
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

  // Form inputs
  const [formStatus, setFormStatus] = useState<'PHYSICALLY_VERIFIED' | 'PENDING' | 'REQUIRES_REINSPECTION' | 'REJECTED'>('PHYSICALLY_VERIFIED');
  const [formOfficialGrade, setFormOfficialGrade] = useState('Grade A');
  const [formMoisture, setFormMoisture] = useState('11.5');
  const [formForeignMatter, setFormForeignMatter] = useState('0.4');
  const [formLocation, setFormLocation] = useState('On-Farm Assaying');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('Physical inspection complete. Assaying confirms moisture is within standard market tolerance. Skin integrity, sizing and foreign matter meet trade standards.');

  // Fetch Inspector lots and metrics
  const fetchLots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/inspector/lots');
      if (!res.ok) {
        throw new Error('Failed to load inspector produce lots.');
      }
      const data = await res.json();
      if (data.success) {
        setLots(data.lots || []);
        if (data.metrics) setMetrics(data.metrics);
        if (data.inspector) setInspector(data.inspector);
      } else {
        setError(data.error || 'Failed to fetch lots');
      }
    } catch (err: unknown) {
      console.error('Error fetching inspector data:', err);
      setError(err instanceof Error ? err.message : 'Error fetching inspector lots.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  // Open Inspection Modal for a lot
  const handleOpenInspection = (lot: InspectorLotItem) => {
    setSelectedLot(lot);
    setModalErrors({});
    setModalSuccess(null);

    // Pre-populate fields based on existing data if available
    if (lot.latestVerification) {
      setFormStatus(
        (lot.latestVerification.status as
          | 'PHYSICALLY_VERIFIED'
          | 'PENDING'
          | 'REQUIRES_REINSPECTION'
          | 'REJECTED') || 'PHYSICALLY_VERIFIED'
      );
      setFormOfficialGrade(lot.latestVerification.officialGrade || 'Grade A');
      setFormMoisture(lot.latestVerification.moisturePercentage !== undefined ? String(lot.latestVerification.moisturePercentage) : '11.5');
      setFormForeignMatter(lot.latestVerification.foreignMatterPerc !== undefined ? String(lot.latestVerification.foreignMatterPerc) : '0.4');
      setFormLocation(lot.latestVerification.location || `On-Farm (${lot.locationDistrict || 'Nashik'})`);
      setFormNotes(lot.latestVerification.notes || 'Reinspection complete. Sample satisfies standard market specifications.');
    } else {
      setFormStatus('PHYSICALLY_VERIFIED');
      setFormOfficialGrade(lot.currentGrade || 'Grade A');
      setFormMoisture('11.5');
      setFormForeignMatter('0.4');
      setFormLocation(`On-Farm (${lot.locationDistrict || 'Nashik'})`);
      setFormNotes('Physical inspection complete. Produce tested for moisture and extraneous impurities. Skin integrity and aroma meet grade parameters.');
    }
    setFormDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Submit Physical Verification
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!formOfficialGrade.trim()) {
      errors.officialGrade = 'Official grade is required.';
    }

    const moistureNum = parseFloat(formMoisture);
    if (isNaN(moistureNum) || moistureNum < 0 || moistureNum > 100) {
      errors.moisture = 'Moisture must be a valid percentage between 0 and 100.';
    }

    const foreignNum = parseFloat(formForeignMatter);
    if (isNaN(foreignNum) || foreignNum < 0 || foreignNum > 100) {
      errors.foreignMatter = 'Foreign matter must be a valid percentage between 0 and 100.';
    }

    if (!formLocation.trim()) {
      errors.location = 'Inspection location cannot be empty.';
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setModalErrors({});
      setModalSuccess(null);

      const payload = {
        status: formStatus,
        officialGrade: formOfficialGrade,
        moisturePercentage: moistureNum,
        foreignMatterPerc: foreignNum,
        inspectionLocation: formLocation,
        inspectionDate: formDate,
        inspectionNotes: formNotes,
      };

      const res = await fetch(`/api/lots/${encodeURIComponent(selectedLot.lotCode)}/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalErrors({ general: data.error || 'Failed to submit physical verification.' });
        return;
      }

      setModalSuccess({
        certificateNumber: data.certificateNumber || 'KS-QC-2026-CERT',
        message: data.message || 'Official physical verification certificate successfully issued.',
      });

      // Refresh list to update badge and metrics
      fetchLots();
    } catch (err: unknown) {
      console.error('Error submitting verification:', err);
      setModalErrors({ general: err instanceof Error ? err.message : 'Error submitting inspection.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered lots
  const filteredLots = lots.filter((lot) => {
    // Tab filter
    if (activeTab === 'PENDING' && lot.inspectionStatus !== 'PENDING') return false;
    if (activeTab === 'PHYSICALLY_VERIFIED' && lot.inspectionStatus !== 'PHYSICALLY_VERIFIED') return false;
    if (activeTab === 'REQUIRES_REINSPECTION' && lot.inspectionStatus !== 'REQUIRES_REINSPECTION') return false;
    if (activeTab === 'REJECTED' && lot.inspectionStatus !== 'REJECTED') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLotCode = lot.lotCode?.toLowerCase().includes(q);
      const matchCrop = lot.commodity?.toLowerCase().includes(q);
      const matchVariety = lot.variety?.toLowerCase().includes(q);
      const matchFarmer = lot.farmerName?.toLowerCase().includes(q);
      const matchDistrict = lot.locationDistrict?.toLowerCase().includes(q);
      const matchCert = lot.latestVerification?.certificateNumber?.toLowerCase().includes(q);
      return matchLotCode || matchCrop || matchVariety || matchFarmer || matchDistrict || matchCert;
    }

    return true;
  });

  return (
    <PageContainer maxWidth="7xl" className="py-6 space-y-6 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title={t.quality.inspectorDashboardTitle}
        description={t.quality.inspectorDashboardSubtitle}
        badge={
          <Badge variant="gray">
            QUALITY ASSAYING & VERIFICATION
          </Badge>
        }
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLots}
            disabled={loading}
            className="gap-2 text-xs border-[#D8D2C4] text-[#1B4332] hover:bg-[#F4F1EA]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </Button>
        }
      />

      {/* Authorized Inspector Badge Card with Explicit Prototype Demo Transparency */}
      <div className="bg-white border border-[#D8D2C4] rounded-lg p-5 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#EAF2ED] text-[#1B4332] border border-[#B7D5C4] flex items-center justify-center font-bold text-lg shrink-0">
            <UserCheck className="w-6 h-6 text-[#1B4332]" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#262320] text-sm font-heading">Dr. Vilas Shinde</span>
              <span className="text-[10px] font-semibold text-[#5A5243] bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#D8D2C4]">
                Quality Assayer [Prototype Demo]
              </span>
            </div>
            <div className="text-[#1B4332] font-mono font-medium text-[11px]">
              License ID: {inspector?.licenseNumber || 'MSAMB-QI-MH-2026-089'}
            </div>
            <div className="text-[#5A5243] text-[11px]">
              {inspector?.agencyName || 'MSAMB Quality Assurance Cell'}
            </div>
            <div className="text-[#8C827A] text-[10px]">
              Assigned Mandi Corridors: Nashik, Ahmednagar, Pune
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#FDFBF7] rounded-lg border border-[#D8D2C4] text-xs text-[#5A5243] max-w-xs sm:text-right">
          <span className="font-bold text-[#1B4332] block font-heading">Independent Assaying</span>
          <span className="text-[11px] leading-tight block text-[#8C827A]">
            Performs in-person physical assaying without commercial or financial bias.
          </span>
        </div>
      </div>

      {/* Strict Quality Principle Banner (Stitch Styled) */}
      <div className="p-5 rounded-lg bg-[#FDFBF7] border border-[#D8D2C4] space-y-3 shadow-none">
        <div className="flex items-center gap-2 text-[#262320] font-bold font-heading">
          <ShieldAlert className="w-5 h-5 text-[#B45309] shrink-0" />
          <span>{t.quality.trustPrincipleTitle}</span>
        </div>
        <p className="text-xs sm:text-sm text-[#5A5243] leading-relaxed">
          {t.quality.trustPrincipleDesc}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-amber-50/40 p-3.5 rounded-lg border border-dashed border-amber-300 flex items-start gap-2.5">
            <Camera className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#92400E] block font-heading">{t.quality.tier1Title}</span>
              <p className="text-[#78350F] text-[11px] leading-relaxed">
                Preliminary non-binding photographic screening. Always labeled &ldquo;AI Assessment — Not Verified&rdquo;. Zero moisture or laboratory testing.
              </p>
            </div>
          </div>
          <div className="bg-[#EAF2ED]/50 p-3.5 rounded-lg border border-[#B7D5C4] flex items-start gap-2.5">
            <FileCheck2 className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#1B4332] block font-heading">{t.quality.tier2Title}</span>
              <p className="text-[#2D6A4F] text-[11px] leading-relaxed">
                Authorized physical sampling testing moisture percentage, foreign matter, and issuing digital trade verification certificates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-[#D8D2C4] shadow-none rounded-lg bg-white">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-[#5A5243] font-medium">All Produce Lots</span>
            <div className="text-2xl sm:text-3xl font-black text-[#262320] font-heading">{metrics.totalLots}</div>
            <span className="text-[11px] text-[#8C827A] block">Active in jurisdiction</span>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30 shadow-none rounded-lg">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#92400E] font-medium">{t.quality.pendingCard}</span>
              <Clock className="w-3.5 h-3.5 text-[#B45309]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#92400E] font-heading">{metrics.pendingInspections}</div>
            <span className="text-[11px] text-[#B45309] block">Awaiting physical assaying</span>
          </CardContent>
        </Card>

        <Card className="border-[#B7D5C4] bg-[#EAF2ED]/40 shadow-none rounded-lg">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#1B4332] font-medium">{t.quality.verifiedCard}</span>
              <Award className="w-3.5 h-3.5 text-[#1B4332]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1B4332] font-heading">{metrics.completedVerifications}</div>
            <span className="text-[11px] text-[#2D6A4F] block">Certificates issued</span>
          </CardContent>
        </Card>

        <Card className="border-[#D8D2C4] bg-[#FDFBF7] shadow-none rounded-lg">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A5243] font-medium">{t.quality.reinspectionCard}</span>
              <RefreshCw className="w-3.5 h-3.5 text-[#5A5243]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#262320] font-heading">{metrics.reinspectionRequired}</div>
            <span className="text-[11px] text-[#8C827A] block">Re-sampling needed</span>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 min-h-[40px] ${
              activeTab === 'ALL'
                ? 'bg-[#1B4332] text-[#FDFBF7] shadow-sm'
                : 'bg-white text-[#5A5243] hover:bg-[#F4F1EA] border border-[#D8D2C4]'
            }`}
          >
            All Lots ({metrics.totalLots})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 min-h-[40px] ${
              activeTab === 'PENDING'
                ? 'bg-[#B45309] text-white shadow-sm'
                : 'bg-amber-50 text-[#92400E] hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Pending ({metrics.pendingInspections})
          </button>
          <button
            onClick={() => setActiveTab('PHYSICALLY_VERIFIED')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 min-h-[40px] ${
              activeTab === 'PHYSICALLY_VERIFIED'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-emerald-50 text-[#1B4332] hover:bg-emerald-100 border border-[#B7D5C4]'
            }`}
          >
            Verified ({metrics.completedVerifications})
          </button>
          <button
            onClick={() => setActiveTab('REQUIRES_REINSPECTION')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 min-h-[40px] ${
              activeTab === 'REQUIRES_REINSPECTION'
                ? 'bg-[#5A5243] text-white shadow-sm'
                : 'bg-[#F4F1EA] text-[#5A5243] hover:bg-gray-200 border border-[#D8D2C4]'
            }`}
          >
            Reinspection ({metrics.reinspectionRequired})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by lot ID, crop, farmer, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#262320] focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent placeholder-gray-400 min-h-[40px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lots List Feed */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#1B4332] animate-spin mx-auto" />
          <p className="text-sm text-[#5A5243]">Loading produce lots queue...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-sm text-red-800 font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchLots}>
            Retry Loading
          </Button>
        </div>
      ) : filteredLots.length === 0 ? (
        <div className="py-16 text-center space-y-3 border-2 border-dashed border-[#D8D2C4] rounded-lg bg-[#FDFBF7]">
          <FileText className="w-10 h-10 text-[#8C827A] mx-auto" />
          <p className="text-base font-bold text-[#262320] font-heading">No produce lots found</p>
          <p className="text-xs text-[#5A5243] max-w-sm mx-auto">
            {searchQuery
              ? 'No lots matched your search criteria. Try a different query.'
              : 'There are currently no produce lots matching this status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLots.map((lot) => {
            const hasAi = !!lot.aiAssessment;
            const hasVerification = !!lot.latestVerification;
            const isVerified = lot.inspectionStatus === 'PHYSICALLY_VERIFIED';

            return (
              <Card
                key={lot.id}
                className={`transition-all hover:border-[#1B4332]/50 border rounded-lg shadow-none ${
                  isVerified
                    ? 'border-[#B7D5C4] bg-white'
                    : lot.inspectionStatus === 'REQUIRES_REINSPECTION'
                    ? 'border-amber-300 bg-[#FDFBF7]'
                    : 'border-[#D8D2C4] bg-white'
                }`}
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Top Bar: Lot Code, Location, Date, Public Link */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D8D2C4]/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#F4F1EA] text-[#262320] border border-[#D8D2C4]">
                        {lot.lotCode}
                      </span>
                      <span className="text-xs text-[#5A5243] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8C827A]" />
                        <span>{lot.locationDistrict || 'Maharashtra'}, {lot.location || 'Farmgate'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#8C827A] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(lot.createdAt).toLocaleDateString()}</span>
                      </span>
                      <Link
                        href={`/lots/${lot.lotCode}`}
                        target="_blank"
                        className="text-[11px] text-[#1B4332] hover:underline font-semibold flex items-center gap-1 ml-2"
                      >
                        <span>View Lot</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Main Info Row: Commodity, Volume, Farmer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <h3 className="text-lg font-bold text-[#262320] font-heading">
                        {lot.commodity}
                      </h3>
                      <p className="text-xs text-[#5A5243] font-medium">
                        Variety: <span className="text-[#262320] font-semibold">{lot.variety || 'Standard'}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-[#5A5243] block">Harvest Volume</span>
                      <div className="text-base font-bold text-[#262320]">
                        {lot.quantity} {lot.unit}
                        <span className="text-xs text-[#5A5243] font-normal ml-1">
                          ({lot.quantityQuintals} Quintals)
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-[#5A5243] block">Farmer / FPO</span>
                      <div className="text-sm font-semibold text-[#262320]">
                        {lot.farmerName}
                      </div>
                      {lot.farmerPhone && (
                        <span className="text-xs text-[#8C827A] font-mono">
                          Ph: {lot.farmerPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Two-Tier Quality Status Showcase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* TIER 1 Visual Screening Box (Amber / Dashed Treatment) */}
                    <div className="p-3.5 rounded-lg bg-amber-50/30 border border-dashed border-amber-300 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-[#B45309]" />
                          <span className="text-xs font-bold text-[#262320] font-heading">Tier 1: AI Visual Screening</span>
                        </div>
                        <Badge variant="amber" className="text-[10px] font-bold px-2 py-0.5">
                          {t.quality.tier1Badge}
                        </Badge>
                      </div>

                      {hasAi ? (
                        <div className="space-y-1 text-xs text-[#5A5243]">
                          <div className="flex justify-between">
                            <span className="text-[#8C827A]">Visual Estimate:</span>
                            <strong className="text-[#92400E] font-bold">
                              {lot.aiAssessment?.estimatedGrade}
                            </strong>
                          </div>
                          {lot.aiAssessment?.color && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#8C827A]">Color / Sizing:</span>
                              <span className="text-[#262320] font-medium">
                                {lot.aiAssessment.color}
                                {lot.aiAssessment.sizeUniformity ? ` (${lot.aiAssessment.sizeUniformity}% uniform)` : ''}
                              </span>
                            </div>
                          )}
                          <div className="text-[10px] text-[#8C827A] italic pt-0.5">
                            Non-binding screening. Physical verification required.
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#8C827A] italic py-1">
                          No preliminary visual screening recorded yet.
                        </div>
                      )}
                    </div>

                    {/* TIER 2 Physical Inspection Box (Green Verified Treatment) */}
                    <div className="p-3.5 rounded-lg bg-[#EAF2ED]/30 border border-[#B7D5C4] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-[#1B4332]" />
                          <span className="text-xs font-bold text-[#262320] font-heading">Tier 2: Physical Verification</span>
                        </div>
                        {isVerified ? (
                          <Badge variant="emerald" className="text-[10px] font-bold px-2 py-0.5">
                            {t.quality.tier2BadgeVerified}
                          </Badge>
                        ) : lot.inspectionStatus === 'REQUIRES_REINSPECTION' ? (
                          <Badge variant="amber" className="text-[10px] font-bold px-2 py-0.5">
                            {t.quality.tier2BadgeReinspection}
                          </Badge>
                        ) : lot.inspectionStatus === 'REJECTED' ? (
                          <Badge variant="red" className="text-[10px] font-bold px-2 py-0.5">
                            {t.quality.tier2BadgeRejected}
                          </Badge>
                        ) : (
                          <Badge variant="amber" className="text-[10px] font-bold px-2 py-0.5">
                            {t.quality.tier2BadgePending}
                          </Badge>
                        )}
                      </div>

                      {hasVerification ? (
                        <div className="space-y-1 text-xs text-[#5A5243]">
                          <div className="flex justify-between">
                            <span className="text-[#8C827A]">Verified Grade:</span>
                            <strong className="text-[#1B4332] font-bold">
                              {lot.latestVerification?.officialGrade}
                            </strong>
                          </div>
                          {lot.latestVerification?.certificateNumber && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#8C827A]">Certificate No:</span>
                              <span className="font-mono font-bold text-[#1B4332]">
                                {lot.latestVerification.certificateNumber}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-[11px]">
                            <span className="text-[#8C827A]">Moisture / Foreign Matter:</span>
                            <span className="font-semibold text-[#262320]">
                              {lot.latestVerification?.moisturePercentage ?? '—'}% / {lot.latestVerification?.foreignMatterPerc ?? '—'}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#92400E] py-1">
                          Awaiting physical assaying and official certificate issuance.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#D8D2C4]/60">
                    <Button
                      variant={isVerified ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleOpenInspection(lot)}
                      className={`gap-2 text-xs font-bold min-h-[36px] ${
                        isVerified
                          ? 'border-[#D8D2C4] text-[#1B4332] hover:bg-[#F4F1EA]'
                          : 'bg-[#1B4332] text-white hover:bg-[#1B4332]/90'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>
                        {isVerified
                          ? 'Update Physical Certification'
                          : t.quality.openInspection}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Official Physical Quality Inspection Modal */}
      {isModalOpen && selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D8D2C4]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#D8D2C4] flex items-center justify-between sticky top-0 bg-[#1B4332] text-[#FDFBF7] z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    Tier 2 Official Inspection
                  </span>
                  <span className="font-mono text-xs text-[#E8E4D9] font-bold">{selectedLot.lotCode}</span>
                </div>
                <h2 className="text-xl font-bold mt-1 font-heading flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#B7D5C4]" />
                  <span>{t.quality.inspectionModalTitle}</span>
                </h2>
                <p className="text-xs text-[#E8E4D9]">
                  Target: <strong className="text-white">{selectedLot.commodity}</strong> ({selectedLot.quantityQuintals} Quintals) • Farmer: <strong className="text-white">{selectedLot.farmerName}</strong>
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmitVerification} className="p-6 space-y-5">
              {/* Success Banner */}
              {modalSuccess && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-[#B7D5C4] text-[#1B4332] space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>{modalSuccess.message}</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#1B4332]">
                    Certificate Code: {modalSuccess.certificateNumber}
                  </p>
                </div>
              )}

              {/* General Error Banner */}
              {modalErrors.general && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{modalErrors.general}</span>
                </div>
              )}

              {/* Status Decision & Official Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#262320] block font-heading">
                    {t.quality.verificationStatus} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(
                        e.target.value as
                          | 'PHYSICALLY_VERIFIED'
                          | 'PENDING'
                          | 'REQUIRES_REINSPECTION'
                          | 'REJECTED'
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-lg text-xs font-semibold text-[#262320] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  >
                    <option value="PHYSICALLY_VERIFIED">Physically Verified (Issue Certificate)</option>
                    <option value="PENDING">Pending Further Testing</option>
                    <option value="REQUIRES_REINSPECTION">Requires Reinspection / Cleaning</option>
                    <option value="REJECTED">Rejected (Below FAQ Standard)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#262320] block font-heading">
                    {t.quality.officialGrade} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formOfficialGrade}
                    onChange={(e) => setFormOfficialGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-lg text-xs font-semibold text-[#262320] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  >
                    <option value="Grade A">Grade A (Premium / Export Standard)</option>
                    <option value="Grade B">Grade B (Standard Market Quality)</option>
                    <option value="Grade C">Grade C (Commercial / Processing)</option>
                    <option value="Fair Average Quality">Fair Average Quality (FAQ)</option>
                  </select>
                  {modalErrors.officialGrade && (
                    <span className="text-[11px] text-red-600 block">{modalErrors.officialGrade}</span>
                  )}
                </div>
              </div>

              {/* Physical Assaying Tests: Moisture % & Foreign Matter % */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#262320] block font-heading">
                    {t.quality.moisturePercentage}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formMoisture}
                    onChange={(e) => setFormMoisture(e.target.value)}
                    placeholder="e.g. 11.5"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-lg text-xs font-medium text-[#262320] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                  {modalErrors.moisture && (
                    <span className="text-[11px] text-red-600 block">{modalErrors.moisture}</span>
                  )}
                  <span className="text-[10px] text-[#8C827A] block">
                    Standard agricultural tolerance: 10% – 14%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#262320] block font-heading">
                    {t.quality.foreignMatter}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formForeignMatter}
                    onChange={(e) => setFormForeignMatter(e.target.value)}
                    placeholder="e.g. 0.4"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-lg text-xs font-medium text-[#262320] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                  {modalErrors.foreignMatter && (
                    <span className="text-[11px] text-red-600 block">{modalErrors.foreignMatter}</span>
                  )}
                  <span className="text-[10px] text-[#8C827A] block">
                    Dust, chaff, and extraneous matter %
                  </span>
                </div>
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#262320] block font-heading">
                    {t.quality.inspectionLocation} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. On-Farm Assaying (Niphad, Nashik)"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-lg text-xs font-medium text-[#262320] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                  {modalErrors.location && (
                    <span className="text-[11px] text-red-600 block">{modalErrors.location}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#262320] block font-heading">
                    {t.quality.inspectionDate} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-lg text-xs font-medium text-[#262320] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>
              </div>

              {/* Remarks / Assaying Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#262320] block font-heading">
                  {t.quality.inspectionNotes}
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Enter detailed assaying observations, moisture, sorting notes..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-lg text-xs font-medium text-[#262320] focus:outline-none focus:ring-2 focus:ring-[#1B4332] leading-relaxed"
                />
              </div>

              {/* Certification Notice */}
              <div className="p-3.5 rounded-lg bg-[#FDFBF7] border border-[#D8D2C4] text-[#5A5243] text-[11px] leading-relaxed space-y-1">
                <span className="font-bold block text-[#1B4332] font-heading">Physical Assaying Record</span>
                <p>
                  By submitting this form, you record that an in-person physical assay was conducted. A unique certificate code (e.g. KS-QC-2026-XXXX) will be generated and permanently linked to this produce lot.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8D2C4]/60">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="min-h-[44px]"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="gap-2 bg-[#1B4332] hover:bg-[#1B4332]/90 text-white font-bold min-h-[44px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.quality.submittingVerification}</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>{t.quality.submitVerification}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default function InspectorDeskPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 text-[#1B4332] animate-spin mx-auto" />
        </div>
      }
    >
      <InspectorDeskContent />
    </Suspense>
  );
}
