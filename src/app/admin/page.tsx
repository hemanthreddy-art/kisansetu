'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Package,
  RefreshCw,
  Search,
  FileCheck2,
  FileText,
  X,
} from 'lucide-react';

interface DisputeItem {
  id: string;
  disputeCode: string;
  reason: string;
  evidenceSummary: string;
  status: string;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  raisedBy: {
    fullName: string;
    role: string;
  };
  transaction: {
    id: string;
    transactionCode: string;
    grossSaleValue: number;
    agreedPricePerQuintal?: number;
    quantityQuintals?: number;
    lot: {
      id: string;
      commodity: string;
      variety?: string | null;
      lotCode?: string;
      physicalVerifications?: Array<{
        officialGrade: string;
        certificateNumber: string;
      }>;
      aiAssessments?: Array<{
        estimatedGrade: string;
      }>;
      transportRequests?: Array<{
        status: string;
        distanceKm: number;
        estimatedCost: number;
        dropLocation: string;
      }>;
    };
    farmer: {
      district?: string;
      user: { fullName: string };
    };
    buyer: {
      companyName: string;
      verified?: boolean;
    };
    transporter?: {
      businessName: string;
    } | null;
    payments?: Array<{
      paymentStatus: string;
      escrowReference: string | null;
    }>;
  };
}

export default function AdminPortalPage() {
  const { t } = useLanguage();
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [activeTxnCount, setActiveTxnCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  async function loadData() {
    try {
      setLoading(true);
      const [dispRes, txnRes] = await Promise.all([
        fetch('/api/disputes'),
        fetch('/api/transactions'),
      ]);

      if (dispRes.ok) {
        const data = await dispRes.json();
        if (data.success) {
          setDisputes(data.data || []);
        }
      }

      if (txnRes.ok) {
        const data = await txnRes.json();
        if (data.success) {
          const list = data.data || [];
          const activeCount = list.filter(
            (t: { status: string }) => !['COMPLETED', 'CANCELLED'].includes(t.status)
          ).length;
          setActiveTxnCount(activeCount);
        }
      }
    } catch (err) {
      console.error('Failed to load admin disputes:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjudicate = async (disputeId: string, status: string) => {
    if (!notesInput.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Official adjudication notes are required to update or resolve a dispute.' });
      return;
    }

    try {
      setActionLoadingId(disputeId);
      setFeedbackMsg(null);

      const res = await fetch(`/api/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          resolutionNotes: notesInput.trim(),
          role: 'ADMIN',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Grievance status successfully updated to ${status} with recorded human adjudication notes.`,
        });
        setSelectedDispute(null);
        setNotesInput('');
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to update dispute.' });
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'Network error updating dispute.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCount = disputes.filter((d) => d.status === 'OPEN').length;
  const reviewCount = disputes.filter((d) => d.status === 'UNDER_REVIEW').length;
  const resolvedCount = disputes.filter((d) => d.status === 'RESOLVED' || d.status === 'CLOSED' || d.status === 'REJECTED').length;

  const filteredDisputes = disputes.filter((d) => {
    if (statusFilter === 'OPEN' && d.status !== 'OPEN') return false;
    if (statusFilter === 'UNDER_REVIEW' && d.status !== 'UNDER_REVIEW') return false;
    if (statusFilter === 'RESOLVED' && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(d.status)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = d.disputeCode.toLowerCase();
      const crop = d.transaction?.lot?.commodity?.toLowerCase() || '';
      const reason = d.reason.toLowerCase();
      const farmer = d.transaction?.farmer?.user?.fullName?.toLowerCase() || '';
      const buyer = d.transaction?.buyer?.companyName?.toLowerCase() || '';
      return code.includes(q) || crop.includes(q) || reason.includes(q) || farmer.includes(q) || buyer.includes(q);
    }
    return true;
  });

  return (
    <PageContainer className="py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title={t.disputes.adminPanelTitle}
        description="Operational oversight, transaction monitoring, and human grievance adjudication for agricultural market linkages."
        badge={<Badge variant="emerald">Supervision Desk [Prototype Demo]</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Badge variant="emerald" className="hidden sm:inline-flex px-3 py-1 text-xs">
              Supervisor: Sanjay Deshmukh (MSAMB Grievance Cell) [Prototype Demo]
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="gap-1.5 text-xs border-[#D8D2C4] bg-white hover:bg-stone-50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>{t.common.refresh}</span>
            </Button>
            <Link href="/disputes">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs border-[#D8D2C4] bg-white">
                <Scale className="w-3.5 h-3.5 text-rose-700" />
                <span>{t.common.publicPortal}</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Real Database Summary Oversight Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.common.openGrievances}</span>
            </span>
            <div className="text-2xl font-black font-heading text-amber-800 mt-1">
              {openCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              Awaiting initial triage
            </p>
          </CardHeader>
        </Card>

        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-700" />
              <span>{t.common.underReview}</span>
            </span>
            <div className="text-2xl font-black font-heading text-blue-900 mt-1">
              {reviewCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              Evidence being examined
            </p>
          </CardHeader>
        </Card>

        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.common.resolved}</span>
            </span>
            <div className="text-2xl font-black font-heading text-[#1B4332] mt-1">
              {resolvedCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              Adjudicated with notes
            </p>
          </CardHeader>
        </Card>

        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>{t.common.monitoredActiveTrades}</span>
            </span>
            <div className="text-2xl font-black font-heading text-[#262320] mt-1">
              {activeTxnCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              Live market transactions
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Feedback Notification */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-[8px] text-xs font-bold flex items-center justify-between gap-2 shadow-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-[#635E59] hover:text-[#262320]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grievance Adjudication Queue */}
      <Card className="border border-[#D8D2C4] bg-white rounded-[8px] shadow-none overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-rose-700" />
              <CardTitle className="text-sm font-bold font-heading text-[#262320]">
                Official Grievance Queue ({disputes.length})
              </CardTitle>
            </div>
            <span className="text-xs text-[#635E59] font-medium">
              Human Administrative Redressal Only · AI Adjudication Prohibited
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Controls: Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D2C4] pb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#635E59] hover:text-[#262320] hover:bg-stone-100'
                }`}
              >
                All ({disputes.length})
              </button>
              <button
                onClick={() => setStatusFilter('OPEN')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
                  statusFilter === 'OPEN'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-[#635E59] hover:text-[#262320] hover:bg-stone-100'
                }`}
              >
                Open ({openCount})
              </button>
              <button
                onClick={() => setStatusFilter('UNDER_REVIEW')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
                  statusFilter === 'UNDER_REVIEW'
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'text-[#635E59] hover:text-[#262320] hover:bg-stone-100'
                }`}
              >
                Under Review ({reviewCount})
              </button>
              <button
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
                  statusFilter === 'RESOLVED'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#635E59] hover:text-[#262320] hover:bg-stone-100'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#635E59] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queue..."
                className="w-full pl-8 pr-3 py-1.5 border border-[#D8D2C4] rounded-[4px] text-xs bg-white focus:outline-hidden focus:border-[#1B4332]"
              />
            </div>
          </div>

          {/* Queue Rows */}
          {loading ? (
            <div className="p-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1B4332]" />
              <p className="text-xs text-[#635E59]">{t.common.loadingGrievances}</p>
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="p-12 text-center space-y-2 bg-[#FAFAF8] rounded-[6px] border border-dashed border-[#D8D2C4]">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-700 opacity-60" />
              <p className="text-xs font-bold text-[#262320]">{t.common.noGrievancesFound}</p>
              <p className="text-xs text-[#635E59]">All recorded transactions are progressing smoothly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDisputes.map((dispute) => {
                const isSelected = selectedDispute?.id === dispute.id;
                const txn = dispute.transaction;
                const physicalCert = txn?.lot?.physicalVerifications?.[0];
                const aiAssessment = txn?.lot?.aiAssessments?.[0];
                const transportReq = txn?.lot?.transportRequests?.[0];
                const payment = txn?.payments?.[0];

                return (
                  <div
                    key={dispute.id}
                    className={`p-4 rounded-[8px] border transition-all space-y-3 ${
                      isSelected
                        ? 'border-[#1B4332] ring-2 ring-[#B7D5C4]/40 bg-[#FAFAF8]'
                        : 'border-[#D8D2C4] bg-white hover:border-[#1B4332]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-rose-950 bg-rose-50 px-2 py-0.5 rounded-[4px] border border-rose-200">
                          {dispute.disputeCode}
                        </span>
                        <Badge
                          variant={
                            dispute.status === 'RESOLVED' || dispute.status === 'CLOSED'
                              ? 'emerald'
                              : dispute.status === 'UNDER_REVIEW'
                              ? 'blue'
                              : 'amber'
                          }
                        >
                          {dispute.status}
                        </Badge>
                        <span className="text-xs font-bold text-[#262320]">
                          Reason: <strong className="text-rose-900">{dispute.reason.replace(/_/g, ' ')}</strong>
                        </span>
                      </div>

                      <span className="text-xs text-[#635E59]">
                        Raised on {new Date(dispute.createdAt).toLocaleDateString('en-IN')} by {dispute.raisedBy?.fullName}
                      </span>
                    </div>

                    {/* Summary Row */}
                    <div className="text-xs text-[#262320] bg-[#FAFAF8] p-3 rounded-[4px] border border-[#D8D2C4] space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#1B4332]" />
                          <strong>Transaction:</strong>
                          <Link href={`/transactions/${txn?.id}`} className="text-[#1B4332] font-mono hover:underline">
                            {txn?.transactionCode}
                          </Link>
                          <span>({txn?.lot?.commodity} — {formatINR(txn?.grossSaleValue || 0)})</span>
                        </div>
                        <div className="text-[#635E59]">
                          <span>Parties: </span>
                          <strong className="text-[#262320]">{txn?.farmer?.user?.fullName}</strong>
                          <span> ↔ </span>
                          <strong className="text-[#262320]">{txn?.buyer?.companyName}</strong>
                        </div>
                      </div>

                      <div>
                        <strong className="text-[#635E59]">Evidence Summary: </strong>
                        <span>{dispute.evidenceSummary}</span>
                      </div>

                      {dispute.resolutionNotes && (
                        <div className="pt-1.5 border-t border-[#D8D2C4] text-emerald-950">
                          <strong className="text-emerald-900 block">Official Resolution Notes:</strong>
                          <p className="text-xs leading-relaxed text-[#262320]">{dispute.resolutionNotes}</p>
                          {dispute.resolvedAt && (
                            <span className="text-[10px] text-emerald-800 block mt-0.5">
                              Settled on {new Date(dispute.resolvedAt).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Admin Action Bar */}
                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedDispute(isSelected ? null : dispute);
                          setNotesInput(dispute.resolutionNotes || '');
                        }}
                        className="text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] underline"
                      >
                        {isSelected ? 'Close Adjudication Panel' : 'Adjudicate / Review Evidence'}
                      </button>

                      <Link href={`/transactions/${txn?.id}`}>
                        <Button variant="outline" size="sm" className="text-xs gap-1 border-[#D8D2C4] bg-white">
                          <span>Open Transaction Detail</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>

                    {/* Detailed Evidence Dossier & Adjudication Panel */}
                    {isSelected && (
                      <div className="p-4 bg-white rounded-[6px] border border-[#1B4332] space-y-4 pt-4 shadow-xs">
                        <div className="border-b border-[#D8D2C4] pb-2">
                          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1B4332] flex items-center gap-1.5">
                            <FileCheck2 className="w-4 h-4" />
                            <span>Digital Transaction Evidence Dossier</span>
                          </h4>
                          <p className="text-[11px] text-[#635E59] mt-0.5">
                            Comprehensive records linked to this dispute. Review before entering official findings.
                          </p>
                        </div>

                        {/* 4 Context Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {/* Quality Context */}
                          <div className="p-2.5 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] space-y-1">
                            <span className="text-[10px] font-bold text-[#635E59] uppercase block">Produce Quality Record</span>
                            {physicalCert ? (
                              <div className="text-[11px] text-[#262320]">
                                <div>Grade: <strong className="text-[#1B4332]">{physicalCert.officialGrade} (Physically Assayed)</strong></div>
                                <div>Cert: <span className="font-mono">{physicalCert.certificateNumber}</span></div>
                              </div>
                            ) : aiAssessment ? (
                              <div className="text-[11px] text-[#262320]">
                                <div>Preliminary AI: <strong className="text-amber-900">{aiAssessment.estimatedGrade} (Not Verified)</strong></div>
                                <span className="text-[10px] text-amber-800 italic block">Physical verification pending</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#635E59] italic">No quality inspection records</span>
                            )}
                          </div>

                          {/* Logistics Context */}
                          <div className="p-2.5 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] space-y-1">
                            <span className="text-[10px] font-bold text-[#635E59] uppercase block">Logistics Dispatch</span>
                            {transportReq ? (
                              <div className="text-[11px] text-[#262320]">
                                <div>Status: <strong>{transportReq.status}</strong> ({transportReq.distanceKm} km corridor)</div>
                                <div>Freight: <strong className="text-rose-800">{formatINR(transportReq.estimatedCost)}</strong></div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#635E59] italic">Direct farmgate pickup / no transporter</span>
                            )}
                          </div>

                          {/* Payment Context */}
                          <div className="p-2.5 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] space-y-1">
                            <span className="text-[10px] font-bold text-[#635E59] uppercase block">Payment Tracking Status</span>
                            {payment ? (
                              <div className="text-[11px] text-[#262320]">
                                <div>Status: <strong>{payment.paymentStatus}</strong></div>
                                <div>Ref: <span className="font-mono text-emerald-800">{payment.escrowReference}</span></div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#635E59] italic">Payment record pending</span>
                            )}
                          </div>

                          {/* Commercial Context */}
                          <div className="p-2.5 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] space-y-1">
                            <span className="text-[10px] font-bold text-[#635E59] uppercase block">Agreed Commercial Terms</span>
                            <div className="text-[11px] text-[#262320]">
                              <div>Gross Value: <strong className="text-[#1B4332]">{formatINR(txn?.grossSaleValue || 0)}</strong></div>
                              <div>Destination: <strong>{transportReq?.dropLocation || 'Buyer Yard'}</strong></div>
                            </div>
                          </div>
                        </div>

                        {/* Mandatory Adjudication Notes Input */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-[#262320]">
                            {t.disputes.resolutionNotesLabel}
                          </label>
                          <textarea
                            rows={3}
                            value={notesInput}
                            onChange={(e) => setNotesInput(e.target.value)}
                            placeholder={t.disputes.resolutionNotesPlaceholder}
                            className="w-full p-2.5 border border-[#D8D2C4] rounded-[4px] text-xs bg-white focus:outline-hidden focus:border-[#1B4332]"
                          />
                        </div>

                        {/* Adjudication Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoadingId === dispute.id}
                            onClick={() => handleAdjudicate(dispute.id, 'UNDER_REVIEW')}
                            className="text-xs border-[#D8D2C4] bg-white text-blue-900"
                          >
                            {actionLoadingId === dispute.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>{t.disputes.markUnderReviewBtn}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={actionLoadingId === dispute.id}
                            onClick={() => handleAdjudicate(dispute.id, 'RESOLVED')}
                            className="text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-none rounded-[4px]"
                          >
                            {actionLoadingId === dispute.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>{t.disputes.resolveDisputeBtn}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoadingId === dispute.id}
                            onClick={() => handleAdjudicate(dispute.id, 'CLOSED')}
                            className="text-xs text-[#635E59] border-[#D8D2C4] bg-white"
                          >
                            <span>{t.disputes.closeDisputeBtn}</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
