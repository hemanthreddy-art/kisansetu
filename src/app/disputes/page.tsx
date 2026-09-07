'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  AlertTriangle,
  Scale,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Loader2,
  CreditCard,
  PlusCircle,
  X,
  RefreshCw,
  Clock,
  User,
  Building2,
  Package,
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
    lot: {
      commodity: string;
      lotCode: string;
    };
    farmer: {
      user: { fullName: string; id?: string };
    };
    buyer: {
      companyName: string;
    };
  };
}

interface TransactionOption {
  id: string;
  transactionCode: string;
  grossSaleValue: number;
  lot: {
    commodity: string;
    lotCode: string;
  };
  farmer: {
    user: { fullName: string; id?: string };
  };
  buyer: {
    companyName: string;
  };
}

export default function DisputesPage() {
  const { t } = useLanguage();
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Raise Grievance Modal State
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState<string>('');
  const [categoryReason, setCategoryReason] = useState<string>('QUALITY_MISMATCH');
  const [evidenceSummary, setEvidenceSummary] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const evidenceChecklist = [
    'Produce Lot ID & specifications',
    'Agreed quantity (Quintals)',
    'Agreed target price & accepted offer terms',
    'Two-tier visual screening vs physical assay report',
    'Transporter electronic proof-of-delivery (e-POD)',
    'Weighing bridge slips from APMC yard / farm',
    'Simulated payment milestone tracking status',
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dispRes, txnRes] = await Promise.all([
        fetch('/api/disputes'),
        fetch('/api/transactions'),
      ]);

      if (dispRes.ok) {
        const dispData = await dispRes.json();
        if (dispData.success) {
          setDisputes(dispData.data || []);
        }
      }

      if (txnRes.ok) {
        const txnData = await txnRes.json();
        if (txnData.success) {
          const list = txnData.data || [];
          setTransactions(list);
          if (list.length > 0) {
            setSelectedTxnId((prev) => prev || list[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load disputes data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRaiseGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxnId || !evidenceSummary.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please select a transaction and detail what happened.' });
      return;
    }

    const selectedTxn = transactions.find((t) => t.id === selectedTxnId);
    if (!selectedTxn) return;

    try {
      setSubmitting(true);
      setFeedbackMsg(null);

      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: selectedTxn.id,
          raisedById: selectedTxn.farmer.user.id || 'usr-farmer-01',
          reason: categoryReason,
          evidenceSummary: evidenceSummary.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Grievance ${data.dispute?.disputeCode || ''} formally registered. An authorized officer will review digital evidence.`,
        });
        setShowRaiseModal(false);
        setEvidenceSummary('');
        await loadData();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to raise grievance.' });
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'Network error registering grievance.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="amber">{t.disputes.statusOpen}</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="blue">{t.disputes.statusUnderReview}</Badge>;
      case 'RESOLVED':
        return <Badge variant="emerald">{t.disputes.statusResolved}</Badge>;
      case 'REJECTED':
        return <Badge variant="red">{t.disputes.statusRejected}</Badge>;
      case 'CLOSED':
        return <Badge variant="gray">{t.disputes.statusClosed}</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const openCount = disputes.filter((d) => d.status === 'OPEN').length;
  const reviewCount = disputes.filter((d) => d.status === 'UNDER_REVIEW').length;
  const resolvedCount = disputes.filter((d) => d.status === 'RESOLVED').length;
  const closedCount = disputes.filter((d) => d.status === 'CLOSED' || d.status === 'REJECTED').length;

  const filteredDisputes = disputes.filter((d) => {
    if (statusFilter === 'OPEN') return d.status === 'OPEN';
    if (statusFilter === 'UNDER_REVIEW') return d.status === 'UNDER_REVIEW';
    if (statusFilter === 'RESOLVED') return d.status === 'RESOLVED' || d.status === 'CLOSED' || d.status === 'REJECTED';
    return true;
  });

  return (
    <PageContainer className="py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title={t.disputes.hubTitle}
        description={t.disputes.hubSubtitle}
        badge={<Badge variant="red">Human Supervised Redressal</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="gap-1.5 text-xs border-[#D8D2C4] bg-white hover:bg-stone-50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowRaiseModal(true)}
              className="gap-1.5 text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-none rounded-[4px]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.disputes.raiseGrievanceTitle}</span>
            </Button>
            <Link href="/transactions">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs border-[#D8D2C4] bg-white">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Transactions</span>
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-[#D8D2C4] text-[#8C2D19] hover:bg-[#FDF2F0] bg-white"
              >
                <Scale className="w-3.5 h-3.5 text-[#8C2D19]" />
                <span>Admin Desk</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Notifications / Alerts */}
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

      {/* 4 Summary Commercial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Open Grievances</span>
            </span>
            <div className="text-2xl font-black font-heading text-amber-800 mt-1">
              {openCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              Awaiting initial human review
            </p>
          </CardHeader>
        </Card>

        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-700" />
              <span>Under Review</span>
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
              <span>Resolved</span>
            </span>
            <div className="text-2xl font-black font-heading text-[#1B4332] mt-1">
              {resolvedCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              Settled with official notes
            </p>
          </CardHeader>
        </Card>

        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#635E59]" />
              <span>Closed Cases</span>
            </span>
            <div className="text-2xl font-black font-heading text-[#262320] mt-1">
              {closedCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              Completed records archived
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Strict Dispute Principle Banner (Human Review Guaranteed) */}
      <Card className="border-[#D8D2C4] bg-[#FAFAF8] rounded-[8px] shadow-none overflow-hidden">
        <CardHeader className="bg-[#ECE7DE] border-b border-[#D8D2C4] p-4 pb-3">
          <div className="flex items-center gap-2 text-[#262320]">
            <Scale className="w-5 h-5 text-[#8C2D19]" />
            <CardTitle className="text-sm font-bold font-heading text-[#262320]">
              Evidence-Based Resolution Principle: Official Human Adjudication (Not Autonomous AI Judgments)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs text-[#635E59]">
          <p className="leading-relaxed text-[#262320]/90">
            {t.disputes.humanAdjudicationNote} KisanSetu enforces rigorous human oversight backed by verifiable digital transaction artifacts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {evidenceChecklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs font-semibold text-[#262320] bg-white p-2.5 rounded-[4px] border border-[#D8D2C4]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs & Counter */}
      <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#635E59] hover:text-[#262320] hover:bg-stone-100'
            }`}
          >
            All Grievances ({disputes.length})
          </button>
          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
              statusFilter === 'OPEN'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-[#635E59] hover:text-[#262320] hover:bg-stone-100'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setStatusFilter('UNDER_REVIEW')}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
              statusFilter === 'UNDER_REVIEW'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'text-[#635E59] hover:text-[#262320] hover:bg-stone-100'
            }`}
          >
            Under Review ({reviewCount})
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
              statusFilter === 'RESOLVED'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#635E59] hover:text-[#262320] hover:bg-stone-100'
            }`}
          >
            Resolved & Closed ({resolvedCount + closedCount})
          </button>
        </div>
      </div>

      {/* Registered Grievances List */}
      {loading ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-[8px] border border-[#D8D2C4]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1B4332]" />
          <p className="text-xs text-[#635E59] font-medium">Loading trade grievance records...</p>
        </div>
      ) : filteredDisputes.length === 0 ? (
        <Card className="p-12 text-center space-y-3 bg-white border-dashed border-[#D8D2C4] rounded-[8px]">
          <ShieldCheck className="w-10 h-10 mx-auto text-emerald-700 opacity-60" />
          <div className="space-y-1">
            <p className="text-sm font-bold font-heading text-[#262320]">{t.disputes.noDisputesFound}</p>
            <p className="text-xs text-[#635E59] max-w-sm mx-auto">
              Commercial transactions are progressing normally. Grievances can be registered when operational discrepancies occur.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowRaiseModal(true)}
              className="text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white"
            >
              Raise a Grievance
            </Button>
            <Link href="/transactions">
              <Button variant="outline" size="sm" className="text-xs border-[#D8D2C4]">
                View Transactions
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDisputes.map((d) => (
            <Card
              key={d.id}
              className="border border-[#D8D2C4] hover:border-[#1B4332] transition-all bg-white rounded-[8px] overflow-hidden shadow-none"
            >
              <CardHeader className="p-4 pb-2 border-b border-[#D8D2C4] bg-[#FAFAF8]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-rose-950 bg-rose-50 px-2 py-0.5 rounded-[4px] border border-rose-200">
                      {d.disputeCode}
                    </span>
                    {getStatusBadge(d.status)}
                    <span className="text-xs text-[#635E59]">
                      • Raised on {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <span className="text-xs text-[#635E59] font-bold">
                    Category: <strong className="text-rose-900">{d.reason.replace(/_/g, ' ')}</strong>
                  </span>
                </div>
                <CardTitle className="text-sm font-bold font-heading text-[#262320] mt-1.5 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#1B4332]" />
                  <span>
                    Trade Contract: {d.transaction?.lot?.commodity} ({d.transaction?.transactionCode}) — {formatINR(d.transaction?.grossSaleValue || 0)}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-3 text-xs space-y-3">
                <div className="p-3 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] space-y-1">
                  <span className="text-[10px] text-[#635E59] uppercase font-bold block">Summary of Discrepancy:</span>
                  <p className="text-[#262320] leading-relaxed">{d.evidenceSummary}</p>
                  <span className="text-[10px] text-[#635E59] block pt-1">
                    Raised by: <strong className="text-[#262320]">{d.raisedBy?.fullName}</strong> ({d.raisedBy?.role})
                  </span>
                </div>

                {d.resolutionNotes && (
                  <div className="p-3 bg-emerald-50/50 rounded-[4px] border border-[#B7D5C4] text-emerald-950 space-y-1">
                    <span className="text-[10px] text-[#1B4332] uppercase font-bold block flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Official Human Adjudication Notes:</span>
                    </span>
                    <p className="text-xs leading-relaxed text-[#262320]">{d.resolutionNotes}</p>
                    {d.resolvedAt && (
                      <span className="text-[10px] text-emerald-800 block">
                        Resolved on: {new Date(d.resolvedAt).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-[#635E59] text-[11px]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#1B4332]" />
                      <span>{d.transaction?.farmer?.user?.fullName}</span>
                    </span>
                    <span>↔</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-700" />
                      <span>{d.transaction?.buyer?.companyName}</span>
                    </span>
                  </div>

                  <Link href={`/transactions/${d.transaction?.id}`}>
                    <Button size="sm" variant="outline" className="text-xs gap-1 border-[#D8D2C4]">
                      <span>Inspect Transaction Evidence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* RAISE GRIEVANCE MODAL */}
      {/* ========================================================================= */}
      {showRaiseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[8px] max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#D8D2C4]">
            <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-3">
              <h3 className="text-base font-black font-heading text-[#262320] flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-700" />
                <span>{t.disputes.raiseGrievanceTitle}</span>
              </h3>
              <button
                onClick={() => setShowRaiseModal(false)}
                className="text-[#635E59] hover:text-[#262320] font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseGrievance} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#262320] mb-1">Select Commercial Transaction</label>
                {transactions.length === 0 ? (
                  <p className="text-xs text-[#635E59] italic">No active transactions available to dispute.</p>
                ) : (
                  <select
                    value={selectedTxnId}
                    onChange={(e) => setSelectedTxnId(e.target.value)}
                    className="w-full p-2.5 border border-[#D8D2C4] rounded-[4px] bg-white text-xs font-medium"
                  >
                    {transactions.map((tx) => (
                      <option key={tx.id} value={tx.id}>
                        {tx.transactionCode} — {tx.lot?.commodity} ({tx.buyer?.companyName}) [{formatINR(tx.grossSaleValue)}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#262320] mb-1">{t.disputes.categoryLabel}</label>
                <select
                  value={categoryReason}
                  onChange={(e) => setCategoryReason(e.target.value)}
                  className="w-full p-2.5 border border-[#D8D2C4] rounded-[4px] bg-white text-xs font-medium"
                >
                  <option value="QUALITY_MISMATCH">{t.disputes.categoryQualityMismatch}</option>
                  <option value="DELIVERY_DELAY">{t.disputes.categoryDeliveryDelay}</option>
                  <option value="PAYMENT_DELAY">{t.disputes.categoryPaymentDelay}</option>
                  <option value="WEIGHT_DISCREPANCY">{t.disputes.categoryWeightDiscrepancy}</option>
                  <option value="PRICE_DISAGREEMENT">{t.disputes.categoryPriceDisagreement}</option>
                  <option value="CANCELLATION">{t.disputes.categoryCancellation}</option>
                  <option value="OTHER">{t.disputes.categoryOther}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#262320] mb-1">{t.disputes.descriptionLabel}</label>
                <textarea
                  rows={4}
                  required
                  value={evidenceSummary}
                  onChange={(e) => setEvidenceSummary(e.target.value)}
                  placeholder={t.disputes.descriptionPlaceholder}
                  className="w-full p-2.5 border border-[#D8D2C4] rounded-[4px] text-xs bg-white"
                />
              </div>

              <div className="p-3 bg-amber-50/50 rounded-[4px] border border-amber-200 text-[#92400E] text-[11px] leading-relaxed">
                <strong>Important Principle:</strong> {t.disputes.humanAdjudicationNote}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRaiseModal(false)}
                  className="border-[#D8D2C4]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting || transactions.length === 0}
                  className="bg-rose-700 hover:bg-rose-800 text-white rounded-[4px]"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{t.disputes.submitGrievanceBtn}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
