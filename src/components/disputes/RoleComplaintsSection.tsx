'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  Scale,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
  User,
  Truck,
  Building2,
  Calendar,
} from 'lucide-react';
import { RoleDisputeModal } from '@/components/disputes/RoleDisputeModal';

export interface PromisedMetric {
  metric: string;
  promised: string;
  actual: string;
  shortfall: string;
}

export interface DisputeItem {
  id: string;
  disputeCode: string;
  reason: string;
  evidenceSummary: string;
  evidenceFilesJson?: string | null;
  status: string;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  raisedById?: string;
  raisedBy?: {
    id: string;
    fullName: string;
    role: string;
    phone?: string;
  };
  transaction?: {
    id: string;
    transactionCode: string;
    grossSaleValue: number;
    transportCost: number;
    netRealisation: number;
    status: string;
    agreedPricePerQuintal: number;
    quantityQuintals: number;
    lot?: {
      id: string;
      lotCode: string;
      commodity: string;
      variety?: string | null;
      expectedGrade?: string;
      mandi?: string;
      physicalVerifications?: Array<{
        officialGrade: string;
        certificateNumber: string;
        status: string;
      }>;
    };
    farmer?: {
      userId: string;
      user?: { fullName: string; phone?: string };
    };
    buyer?: {
      userId: string;
      companyName: string;
      user?: { fullName: string; phone?: string };
    };
    transporter?: {
      userId: string;
      businessName: string;
      user?: { fullName: string; phone?: string };
    };
    payments?: Array<{
      paymentStatus: string;
      amount: number;
    }>;
  };
}

export interface RoleComplaintsSectionProps {
  role: 'FARMER' | 'BUYER' | 'TRANSPORTER';
  onRaiseGrievanceClick?: () => void;
}

export function RoleComplaintsSection({ role, onRaiseGrievanceClick }: RoleComplaintsSectionProps) {
  const { t } = useLanguage();
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/disputes?role=${role}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDisputes(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load role complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const openCount = disputes.filter((d) => d.status === 'OPEN').length;
  const reviewCount = disputes.filter((d) => d.status === 'UNDER_REVIEW').length;
  const activeCount = openCount + reviewCount;
  const resolvedCount = disputes.filter(
    (d) => d.status === 'RESOLVED' || d.status === 'CLOSED' || d.status === 'REJECTED'
  ).length;

  const filteredDisputes = useMemo(() => {
    if (filter === 'ACTIVE') return disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');
    if (filter === 'RESOLVED')
      return disputes.filter((d) => d.status === 'RESOLVED' || d.status === 'CLOSED' || d.status === 'REJECTED');
    return disputes;
  }, [disputes, filter]);

  // Determine Counterparty metadata for a dispute item
  const getDisputeContext = (d: DisputeItem) => {
    const isReporter =
      (role === 'FARMER' && (d.raisedById === d.transaction?.farmer?.userId || d.raisedBy?.role === 'FARMER')) ||
      (role === 'BUYER' && (d.raisedById === d.transaction?.buyer?.userId || d.raisedBy?.role === 'BUYER')) ||
      (role === 'TRANSPORTER' && (d.raisedById === d.transaction?.transporter?.userId || d.raisedBy?.role === 'TRANSPORTER'));

    let counterpartyLabel = 'Counterparty';
    let counterpartyName = 'Platform Counterparty';
    let counterpartyRole = 'BUYER';
    let Icon = Building2;

    if (role === 'BUYER') {
      if (isReporter) {
        if (d.reason.includes('TRANSPORT') || d.reason.includes('TRANSIT') || d.reason.includes('LOCATION')) {
          counterpartyLabel = 'Complaint against Transporter';
          counterpartyName = d.transaction?.transporter?.businessName || 'Assigned Transporter';
          counterpartyRole = 'TRANSPORTER';
          Icon = Truck;
        } else {
          counterpartyLabel = 'Complaint against Farmer';
          counterpartyName = d.transaction?.farmer?.user?.fullName || 'Farmer Partner';
          counterpartyRole = 'FARMER';
          Icon = User;
        }
      } else {
        counterpartyLabel = 'Complaint received from Farmer';
        counterpartyName = d.transaction?.farmer?.user?.fullName || 'Farmer Partner';
        counterpartyRole = 'FARMER';
        Icon = User;
      }
    } else if (role === 'TRANSPORTER') {
      if (isReporter) {
        if (d.reason.includes('FARMER') || d.reason.includes('LOADING') || d.reason.includes('PICKUP')) {
          counterpartyLabel = 'Complaint against Farmer';
          counterpartyName = d.transaction?.farmer?.user?.fullName || 'Farmer Partner';
          counterpartyRole = 'FARMER';
          Icon = User;
        } else {
          counterpartyLabel = 'Complaint against Buyer';
          counterpartyName = d.transaction?.buyer?.companyName || 'Buyer Entity';
          counterpartyRole = 'BUYER';
          Icon = Building2;
        }
      } else {
        counterpartyLabel = 'Complaint regarding Cargo Transit';
        counterpartyName = d.transaction?.buyer?.companyName || d.transaction?.farmer?.user?.fullName || 'Counterparty';
        counterpartyRole = 'BUYER';
        Icon = ShieldCheck;
      }
    } else {
      // role === 'FARMER'
      if (isReporter) {
        if (d.reason.includes('TRANSPORT') || d.reason.includes('TRANSIT')) {
          counterpartyLabel = 'Complaint against Transporter';
          counterpartyName = d.transaction?.transporter?.businessName || 'Assigned Transporter';
          counterpartyRole = 'TRANSPORTER';
          Icon = Truck;
        } else {
          counterpartyLabel = 'Complaint against Buyer';
          counterpartyName = d.transaction?.buyer?.companyName || 'Buyer Partner';
          counterpartyRole = 'BUYER';
          Icon = Building2;
        }
      } else {
        counterpartyLabel = 'Complaint from Buyer against your Lot';
        counterpartyName = d.transaction?.buyer?.companyName || 'Buyer Partner';
        counterpartyRole = 'BUYER';
        Icon = Building2;
      }
    }

    // Parse evidenceFilesJson if available
    let parsedFiles: Array<{ name: string; sizeKb?: number }> = [];
    let promisedVsActual: PromisedMetric[] = [];
    if (d.evidenceFilesJson) {
      try {
        const parsed = JSON.parse(d.evidenceFilesJson);
        if (Array.isArray(parsed)) {
          parsedFiles = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.files)) parsedFiles = parsed.files;
          if (Array.isArray(parsed.promisedVsActual)) promisedVsActual = parsed.promisedVsActual;
        }
      } catch {
        // raw string or invalid json
      }
    }

    return {
      isReporter,
      counterpartyLabel,
      counterpartyName,
      counterpartyRole,
      Icon,
      parsedFiles,
      promisedVsActual,
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="amber">{t.disputes.statusOpen || 'Open / Pending Review'}</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="blue">{t.disputes.statusUnderReview || 'Under Review'}</Badge>;
      case 'RESOLVED':
        return <Badge variant="emerald">{t.disputes.statusResolved || 'Resolved'}</Badge>;
      case 'REJECTED':
        return <Badge variant="red">{t.disputes.statusRejected || 'Rejected'}</Badge>;
      case 'CLOSED':
        return <Badge variant="gray">{t.disputes.statusClosed || 'Closed'}</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">
              {t.disputes.tabComplaints || 'My Complaints & Issues'}
            </h2>
            <Badge variant="amber" className="font-semibold text-xs">
              {role} WORKFLOW
            </Badge>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {t.disputes.complaintsSub ||
              'Track active disputes, inspection reviews, and official resolution settlements.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadComplaints}
            className="text-white border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (onRaiseGrievanceClick) onRaiseGrievanceClick();
              else setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.disputes.reportIssueBtn || 'Report an Issue'}</span>
          </Button>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Complaints ({disputes.length})
        </button>
        <button
          onClick={() => setFilter('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
            filter === 'ACTIVE'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Active / Under Review ({activeCount})
        </button>
        <button
          onClick={() => setFilter('RESOLVED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
            filter === 'RESOLVED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Resolved & Closed ({resolvedCount})
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
            <p className="text-xs">Loading grievance records...</p>
          </CardContent>
        </Card>
      ) : filteredDisputes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {t.disputes.noDisputesFound || 'No active grievances recorded.'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.disputes.noComplaintsDesc ||
                  'All transactions are running smoothly. No active grievances filed.'}
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="text-xs"
              >
                {t.disputes.reportIssueBtn || 'Report an Issue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((d) => {
            const ctx = getDisputeContext(d);
            const CounterpartyIcon = ctx.Icon;

            return (
              <Card key={d.id} className="overflow-hidden border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                {/* Header Strip */}
                <CardHeader className="py-3 px-5 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {d.disputeCode}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{d.reason.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                    {getStatusBadge(d.status)}
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Counterparty Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                        <CounterpartyIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {ctx.counterpartyLabel}
                        </span>
                        <p className="text-xs font-bold text-slate-900">{ctx.counterpartyName}</p>
                      </div>
                    </div>

                    {d.transaction && (
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Order</span>
                          <span className="font-semibold text-slate-800">{d.transaction.transactionCode}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Commodity</span>
                          <span className="font-semibold text-slate-800">
                            {d.transaction.lot?.commodity || 'Produce'} ({d.transaction.quantityQuintals} qtl)
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Agreed Value</span>
                          <span className="font-semibold text-slate-800">
                            {formatINR(d.transaction.grossSaleValue)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PROMISED VS ACTUAL COMPARISON BLOCK */}
                  {ctx.promisedVsActual && ctx.promisedVsActual.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="px-3.5 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Scale className="w-3.5 h-3.5 text-primary" />
                          <span>{t.disputes.promisedVsActualTitle || 'Promised vs Actual Verification'}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 italic">
                          Authentic platform audit
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                            <tr>
                              <th className="py-2 px-3 font-semibold">Metric</th>
                              <th className="py-2 px-3 font-semibold text-slate-700">Contracted / Promised</th>
                              <th className="py-2 px-3 font-semibold text-slate-700">Delivered / Recorded</th>
                              <th className="py-2 px-3 font-semibold text-slate-700">Discrepancy</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {ctx.promisedVsActual.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 text-slate-700 font-medium">{item.metric}</td>
                                <td className="py-2 px-3 text-slate-900 font-semibold">{item.promised}</td>
                                <td className="py-2 px-3">
                                  {item.actual === (t.disputes.promisedNotRecorded || 'Not recorded') ? (
                                    <span className="text-slate-400 italic">
                                      {t.disputes.promisedNotRecorded || 'Not recorded'}
                                    </span>
                                  ) : (
                                    <span className="text-slate-900 font-semibold">{item.actual}</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {item.shortfall === (t.disputes.promisedNotRecorded || 'Not recorded') ? (
                                    <span className="text-slate-400 italic">—</span>
                                  ) : (
                                    <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                                      {item.shortfall}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 5-STAGE PROGRESS TIMELINE */}
                  <div className="py-3 px-4 bg-slate-50/70 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2.5">
                      Grievance Progress Timeline
                    </span>
                    <div className="flex items-center justify-between relative text-xs">
                      {/* Connecting Line */}
                      <div className="absolute left-4 right-4 top-3 h-0.5 bg-slate-200 -z-0" />

                      {/* Stage 1: Submitted */}
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          ✓
                        </div>
                        <span className="font-semibold text-slate-900 text-[11px] mt-1.5">Submitted</span>
                        <span className="text-[10px] text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Stage 2: Under Review */}
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                            d.status !== 'OPEN' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white animate-pulse'
                          }`}
                        >
                          {d.status !== 'OPEN' ? '✓' : '2'}
                        </div>
                        <span className="font-semibold text-slate-900 text-[11px] mt-1.5">Under Review</span>
                        <span className="text-[10px] text-slate-400">
                          {d.status === 'OPEN' ? 'In Queue' : 'Assigned'}
                        </span>
                      </div>

                      {/* Stage 3: Evidence Examined */}
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                            d.status === 'RESOLVED' || d.status === 'CLOSED' || d.status === 'REJECTED'
                              ? 'bg-emerald-600 text-white'
                              : d.status === 'UNDER_REVIEW'
                              ? 'bg-blue-600 text-white animate-pulse'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {d.status === 'RESOLVED' || d.status === 'CLOSED' || d.status === 'REJECTED' ? '✓' : '3'}
                        </div>
                        <span className="font-semibold text-slate-900 text-[11px] mt-1.5">Evidence Examined</span>
                        <span className="text-[10px] text-slate-400">Digital records</span>
                      </div>

                      {/* Stage 4: Decision */}
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                            d.status === 'RESOLVED' || d.status === 'CLOSED' || d.status === 'REJECTED'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {d.status === 'RESOLVED' || d.status === 'CLOSED' || d.status === 'REJECTED' ? '✓' : '4'}
                        </div>
                        <span className="font-semibold text-slate-900 text-[11px] mt-1.5">Decision</span>
                        <span className="text-[10px] text-slate-400">
                          {d.status === 'RESOLVED' ? 'Approved' : d.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>

                      {/* Stage 5: Resolved */}
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                            d.status === 'RESOLVED'
                              ? 'bg-emerald-600 text-white'
                              : d.status === 'CLOSED' || d.status === 'REJECTED'
                              ? 'bg-slate-700 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {d.status === 'RESOLVED' || d.status === 'CLOSED' || d.status === 'REJECTED' ? '✓' : '5'}
                        </div>
                        <span className="font-semibold text-slate-900 text-[11px] mt-1.5">Resolved</span>
                        <span className="text-[10px] text-slate-400">
                          {d.resolvedAt ? new Date(d.resolvedAt).toLocaleDateString() : 'Awaiting'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Evidence Description */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      Submitted Statement & Discrepancy Note:
                    </span>
                    <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed italic">
                      &ldquo;{d.evidenceSummary}&rdquo;
                    </p>
                  </div>

                  {/* Attached Files List */}
                  {ctx.parsedFiles.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[11px] font-bold text-slate-400">Attachments:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ctx.parsedFiles.map((file, i) => (
                          <Badge key={i} variant="gray" className="text-[11px] font-medium">
                            📎 {file.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comprehensive Resolution Summary Card */}
                  {(d.status === 'RESOLVED' || d.status === 'CLOSED' || d.status === 'REJECTED') && (
                    <div className="p-4 bg-emerald-50/70 border-2 border-emerald-200 rounded-xl space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-emerald-950 uppercase text-[11px] tracking-wide">
                            Official Grievance Adjudication Record
                          </span>
                        </div>
                        {getStatusBadge(d.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                            {t.disputes.decisionOutcomeLabel || 'Official Decision Outcome'}
                          </span>
                          <p className="font-semibold text-emerald-950 mt-0.5">
                            {d.status === 'RESOLVED'
                              ? 'Claim Upheld — Financial settlement verified and trade records updated'
                              : d.status === 'REJECTED'
                              ? 'Claim Not Substantiated — Original contract terms upheld'
                              : 'Case Concluded by Review Officer'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                            {t.disputes.financialAdjustmentLabel || 'Financial / Escrow Adjustment'}
                          </span>
                          <p className="font-semibold text-emerald-950 mt-0.5">
                            {d.transaction?.netRealisation
                              ? `Escrow Net Realisation: ${formatINR(d.transaction.netRealisation)}`
                              : 'Settlement Terms Verified'}
                          </p>
                        </div>
                      </div>

                      {/* Official Reviewer Note */}
                      <div className="pt-1">
                        <span className="text-[10px] font-bold uppercase text-emerald-800 block mb-1">
                          {t.disputes.officialNotesLabel || 'Reviewer Adjudication Notes'}
                        </span>
                        <div className="p-2.5 bg-white border border-emerald-300 rounded-lg text-emerald-950 font-medium leading-relaxed">
                          {d.resolutionNotes || 'Resolution completed per standard review protocol.'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-emerald-700 pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {t.disputes.resolvedOnLabel || 'Resolution Date'}:{' '}
                            {d.resolvedAt ? new Date(d.resolvedAt).toLocaleString() : 'Recent'}
                          </span>
                        </div>
                        <span className="italic text-[10px] text-slate-500">
                          Demonstration Prototype Internal Adjudication Desk
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Role Dispute Modal */}
      <RoleDisputeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={role}
        onDisputeSubmitted={() => {
          loadComplaints();
        }}
      />
    </div>
  );
}
