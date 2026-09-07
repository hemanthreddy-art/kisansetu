'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  PackageCheck,
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
    confidenceScore: number;
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

export default function InspectorDeskPage() {
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
  const [formNotes, setFormNotes] = useState('Physical inspection complete. Assaying confirms moisture is within AGMARK tolerance. Color, skin integrity, and sizing meet trade standards.');

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
      setFormNotes('Physical inspection complete. Produce tested for moisture and impurities. Skin integrity and aroma meet AGMARK grade parameters.');
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl space-y-8">
      {/* Top Header & Inspector Profile */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="purple">MSAMB / APMC MODULE</Badge>
            <span className="text-xs text-gray-500 font-mono">ROLE: QUALITY INSPECTOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <PackageCheck className="w-7 h-7 sm:w-8 sm:h-8 text-purple-700 shrink-0" />
            <span>{t.quality.inspectorDashboardTitle}</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
            {t.quality.inspectorDashboardSubtitle}
          </p>
        </div>

        {/* Authorized Inspector Badge Card */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/40 p-4 rounded-2xl border border-purple-200/80 shadow-xs flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-gray-900 text-sm">Dr. Vilas Shinde</div>
            <div className="text-purple-700 font-medium font-mono text-[11px]">
              {inspector?.licenseNumber || 'MSAMB-QI-MH-2026-089'}
            </div>
            <div className="text-gray-500 text-[11px]">
              {inspector?.agencyName || 'MSAMB Quality Assurance Cell'}
            </div>
            <div className="text-gray-400 text-[10px]">
              Jurisdiction: Nashik, Ahmednagar, Pune
            </div>
          </div>
        </div>
      </div>

      {/* Strict Quality Principle Banner */}
      <div className="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-amber-950 font-bold">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
          <span>{t.quality.trustPrincipleTitle}</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
          {t.quality.trustPrincipleDesc}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white/90 p-3 rounded-xl border border-amber-200 flex items-start gap-2.5">
            <Camera className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-gray-900 block">{t.quality.tier1Title}</span>
              <p className="text-gray-600">
                Non-binding photographic screening. Always labeled &ldquo;AI Assessment — Not Verified&rdquo;.
              </p>
            </div>
          </div>
          <div className="bg-white/90 p-3 rounded-xl border border-amber-200 flex items-start gap-2.5">
            <FileCheck2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-gray-900 block">{t.quality.tier2Title}</span>
              <p className="text-gray-600">
                Authorized physical sampling testing moisture, foreign matter, and issuing digital trade certificates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-gray-500 font-medium">All Produce Lots</span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900">{metrics.totalLots}</div>
            <span className="text-[11px] text-gray-400 block">Active in jurisdiction</span>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-800 font-medium">{t.quality.pendingCard}</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900">{metrics.pendingInspections}</div>
            <span className="text-[11px] text-amber-700 block">Awaiting assaying</span>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-medium">{t.quality.verifiedCard}</span>
              <Award className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900">{metrics.completedVerifications}</div>
            <span className="text-[11px] text-emerald-700 block">Certificates issued</span>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/30 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-800 font-medium">{t.quality.reinspectionCard}</span>
              <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-900">{metrics.reinspectionRequired}</div>
            <span className="text-[11px] text-purple-700 block">Re-sampling needed</span>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'ALL'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Lots ({metrics.totalLots})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Pending ({metrics.pendingInspections})
          </button>
          <button
            onClick={() => setActiveTab('PHYSICALLY_VERIFIED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'PHYSICALLY_VERIFIED'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Verified ({metrics.completedVerifications})
          </button>
          <button
            onClick={() => setActiveTab('REQUIRES_REINSPECTION')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'REQUIRES_REINSPECTION'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
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
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 shadow-2xs"
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
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading produce lots queue...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-sm text-red-800 font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchLots}>
            Retry Loading
          </Button>
        </div>
      ) : filteredLots.length === 0 ? (
        <div className="py-16 text-center space-y-3 border-2 border-dashed border-gray-200 rounded-3xl">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-base font-bold text-gray-700">No produce lots found</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
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
                className={`transition-all hover:shadow-md border ${
                  isVerified
                    ? 'border-emerald-200 bg-white'
                    : lot.inspectionStatus === 'REQUIRES_REINSPECTION'
                    ? 'border-purple-200 bg-purple-50/10'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Top Bar: Lot Code, Location, Date, Public Link */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 border border-gray-200">
                        {lot.lotCode}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{lot.locationDistrict || 'Maharashtra'}, {lot.location || 'Farmgate'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(lot.createdAt).toLocaleDateString()}</span>
                      </span>
                      <Link
                        href={`/lots/${lot.lotCode}`}
                        target="_blank"
                        className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 ml-2"
                      >
                        <span>View Lot</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Main Info Row: Commodity, Volume, Farmer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {lot.commodity}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Variety: <span className="text-gray-800 font-semibold">{lot.variety || 'Standard'}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 block">Harvest Volume</span>
                      <div className="text-base font-bold text-gray-900">
                        {lot.quantity} {lot.unit}
                        <span className="text-xs text-gray-500 font-normal ml-1">
                          ({lot.quantityQuintals} Quintals)
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 block">Farmer / FPO</span>
                      <div className="text-sm font-semibold text-gray-900">
                        {lot.farmerName}
                      </div>
                      {lot.farmerPhone && (
                        <span className="text-xs text-gray-500 font-mono">
                          Ph: {lot.farmerPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Two-Tier Quality Status Showcase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* TIER 1 Visual Screening Box */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-xs font-bold text-gray-800">Tier 1: AI Visual Screening</span>
                        </div>
                        <Badge variant="amber" className="text-[10px] font-bold px-2 py-0.2">
                          {t.quality.tier1Badge}
                        </Badge>
                      </div>

                      {hasAi ? (
                        <div className="space-y-1 text-xs text-gray-700">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Visual Estimate:</span>
                            <strong className="text-emerald-800 font-bold">
                              {lot.aiAssessment?.estimatedGrade} ({((lot.aiAssessment?.confidenceScore || 0.85) * 100).toFixed(0)}% conf.)
                            </strong>
                          </div>
                          {lot.aiAssessment?.color && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-gray-500">Color / Sizing:</span>
                              <span className="text-gray-800 font-medium">
                                {lot.aiAssessment.color}
                                {lot.aiAssessment.sizeUniformity ? ` (${lot.aiAssessment.sizeUniformity}% uniform)` : ''}
                              </span>
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 italic pt-0.5">
                            Non-binding screening. Not an official grade certificate.
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic py-1">
                          No preliminary visual screening recorded yet.
                        </div>
                      )}
                    </div>

                    {/* TIER 2 Physical Inspection Box */}
                    <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-purple-700" />
                          <span className="text-xs font-bold text-gray-800">Tier 2: Physical Verification</span>
                        </div>
                        {isVerified ? (
                          <Badge variant="emerald" className="text-[10px] font-bold px-2 py-0.2">
                            {t.quality.tier2BadgeVerified}
                          </Badge>
                        ) : lot.inspectionStatus === 'REQUIRES_REINSPECTION' ? (
                          <Badge variant="amber" className="text-[10px] font-bold px-2 py-0.2">
                            {t.quality.tier2BadgeReinspection}
                          </Badge>
                        ) : lot.inspectionStatus === 'REJECTED' ? (
                          <Badge variant="red" className="text-[10px] font-bold px-2 py-0.2">
                            {t.quality.tier2BadgeRejected}
                          </Badge>
                        ) : (
                          <Badge variant="amber" className="text-[10px] font-bold px-2 py-0.2">
                            {t.quality.tier2BadgePending}
                          </Badge>
                        )}
                      </div>

                      {hasVerification ? (
                        <div className="space-y-1 text-xs text-gray-700">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Verified Grade:</span>
                            <strong className="text-purple-900 font-bold">
                              {lot.latestVerification?.officialGrade}
                            </strong>
                          </div>
                          {lot.latestVerification?.certificateNumber && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-gray-500">Certificate No:</span>
                              <span className="font-mono font-bold text-purple-800">
                                {lot.latestVerification.certificateNumber}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500">Moisture / Impurities:</span>
                            <span className="font-semibold text-gray-900">
                              {lot.latestVerification?.moisturePercentage ?? '—'}% / {lot.latestVerification?.foreignMatterPerc ?? '—'}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-amber-800 py-1">
                          Awaiting physical assaying and official certificate issuance.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInspection(lot)}
                      className={`gap-2 text-xs font-bold ${
                        isVerified
                          ? 'border-purple-300 text-purple-800 hover:bg-purple-50'
                          : 'bg-purple-700 text-white hover:bg-purple-800 border-purple-700'
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
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="purple">Tier 2 Official Inspection</Badge>
                  <span className="font-mono text-xs text-gray-500 font-bold">{selectedLot.lotCode}</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <FileCheck2 className="w-6 h-6 text-purple-700" />
                  <span>{t.quality.inspectionModalTitle}</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Target: <span className="font-bold text-gray-800">{selectedLot.commodity}</span> ({selectedLot.quantity} {selectedLot.unit}) • Farmer: <span className="font-semibold text-gray-800">{selectedLot.farmerName}</span>
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmitVerification} className="p-6 space-y-5">
              {/* Success Banner */}
              {modalSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>{modalSuccess.message}</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-emerald-800">
                    Certificate Code: {modalSuccess.certificateNumber}
                  </p>
                </div>
              )}

              {/* General Error Banner */}
              {modalErrors.general && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{modalErrors.general}</span>
                </div>
              )}

              {/* Status Decision & Official Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
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
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  >
                    <option value="PHYSICALLY_VERIFIED">Physically Verified (Issue Certificate)</option>
                    <option value="PENDING">Pending Further Testing</option>
                    <option value="REQUIRES_REINSPECTION">Requires Reinspection / Cleaning</option>
                    <option value="REJECTED">Rejected (Below FAQ Standard)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    {t.quality.officialGrade} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formOfficialGrade}
                    onChange={(e) => setFormOfficialGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
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
                  <label className="text-xs font-bold text-gray-700 block">
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
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                  {modalErrors.moisture && (
                    <span className="text-[11px] text-red-600 block">{modalErrors.moisture}</span>
                  )}
                  <span className="text-[10px] text-gray-400 block">
                    Standard onion/grain tolerance: 10% – 14%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
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
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                  {modalErrors.foreignMatter && (
                    <span className="text-[11px] text-red-600 block">{modalErrors.foreignMatter}</span>
                  )}
                  <span className="text-[10px] text-gray-400 block">
                    Dust, soil, chaff, and extraneous matter %
                  </span>
                </div>
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    {t.quality.inspectionLocation} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. On-Farm Assaying (Niphad, Nashik)"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                  {modalErrors.location && (
                    <span className="text-[11px] text-red-600 block">{modalErrors.location}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    {t.quality.inspectionDate} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Remarks / Assaying Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  {t.quality.inspectionNotes}
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Enter detailed assaying notes, odor, skin integrity, sorting observation..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white leading-relaxed"
                />
              </div>

              {/* Strict Legal / Certification Notice */}
              <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-950 text-[11px] leading-relaxed space-y-1">
                <span className="font-bold block text-purple-900">Official Quality Certification Notice</span>
                <p>
                  By submitting this form, you certify under MSAMB/APMC regulations that an in-person physical assay was conducted. A cryptographically unique certificate code (e.g. KS-QC-2026-XXXX) will be generated and permanently linked to this produce lot.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="gap-2 bg-purple-700 hover:bg-purple-800 text-white font-bold"
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
    </div>
  );
}
