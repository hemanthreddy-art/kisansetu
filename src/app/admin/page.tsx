'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Settings,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
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
    };
    farmer: {
      user: { fullName: string };
    };
    buyer: {
      companyName: string;
    };
  };
}

export default function AdminPortalPage() {
  const { t } = useLanguage();
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadDisputes() {
    try {
      setLoading(true);
      const res = await fetch('/api/disputes');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDisputes(data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load admin disputes:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleAdjudicate = async (disputeId: string, status: string) => {
    if (!notesInput.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Adjudication notes are required to resolve or update a dispute.' });
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
        setFeedbackMsg({ type: 'success', text: `Dispute status successfully updated to ${status}.` });
        setSelectedDispute(null);
        setNotesInput('');
        await loadDisputes();
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
  const resolvedCount = disputes.filter((d) => d.status === 'RESOLVED' || d.status === 'CLOSED').length;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="blue">Module X & T</Badge>
            <span className="text-xs text-gray-500 font-mono">GOVERNMENT OF MAHARASHTRA ADMIN & GRIEVANCE REDRESSAL</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-gray-800" />
            <span>State Agriculture Governance Portal</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Oversight dashboard for Maharashtra Department of Agriculture and Maharashtra State Agricultural Marketing Board (MSAMB).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="px-3 py-1 text-xs">
            Admin: Sanjay Deshmukh (MSAMB)
          </Badge>
        </div>
      </div>

      {/* State Oversight Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Monitored APMCs</span>
            <div className="text-2xl font-black text-gray-900">305</div>
            <p className="text-[11px] text-gray-500">Across 36 Maharashtra Districts</p>
          </CardHeader>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-amber-600 uppercase">Open Grievances</span>
            <div className="text-2xl font-black text-amber-700">{openCount}</div>
            <p className="text-[11px] text-gray-500">Awaiting initial triage</p>
          </CardHeader>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-sky-600 uppercase">Under Review</span>
            <div className="text-2xl font-black text-sky-700">{reviewCount}</div>
            <p className="text-[11px] text-gray-500">Evidence being examined</p>
          </CardHeader>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-emerald-600 uppercase">Resolved & Closed</span>
            <div className="text-2xl font-black text-emerald-700">{resolvedCount}</div>
            <p className="text-[11px] text-gray-500">Adjudicated with notes</p>
          </CardHeader>
        </Card>
      </div>

      {/* Feedback Messages */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Grievance Adjudication Table */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-rose-700" />
              <span>{t.disputes.adminPanelTitle} ({disputes.length})</span>
            </CardTitle>
            <span className="text-xs text-gray-500">Human Administrative Redressal Only</span>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {loading ? (
            <div className="p-8 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs text-gray-500">Loading registered disputes...</p>
            </div>
          ) : disputes.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl border-dashed">
              No trade disputes currently recorded across Maharashtra.
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((dispute) => {
                const isSelected = selectedDispute?.id === dispute.id;
                return (
                  <div
                    key={dispute.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-50 bg-purple-50/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-rose-950 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
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
                        <span className="text-xs font-bold text-gray-700">
                          Reason: {dispute.reason.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <span className="text-xs text-gray-400">
                        Raised on {new Date(dispute.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl space-y-1">
                      <div>
                        <strong>Transaction:</strong>{' '}
                        <Link href={`/transactions/${dispute.transaction?.id}`} className="text-emerald-800 font-mono hover:underline">
                          {dispute.transaction?.transactionCode}
                        </Link>{' '}
                        ({dispute.transaction?.lot?.commodity} - ₹{dispute.transaction?.grossSaleValue.toLocaleString('en-IN')})
                      </div>
                      <div>
                        <strong>Parties:</strong> {dispute.transaction?.farmer?.user?.fullName} ↔ {dispute.transaction?.buyer?.companyName}
                      </div>
                      <div>
                        <strong>Evidence Summary:</strong> {dispute.evidenceSummary}
                      </div>
                      {dispute.resolutionNotes && (
                        <div className="pt-2 border-t border-gray-200 text-emerald-900">
                          <strong>Resolution Notes:</strong> {dispute.resolutionNotes}
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
                        className="text-xs font-bold text-purple-800 hover:text-purple-950 underline"
                      >
                        {isSelected ? 'Cancel Action' : 'Adjudicate / Update Notes'}
                      </button>

                      <Link href={`/transactions/${dispute.transaction?.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs gap-1">
                          <span>Inspect Transaction Evidence</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>

                    {/* Adjudication Panel */}
                    {isSelected && (
                      <div className="p-4 bg-white rounded-2xl border border-purple-200 space-y-3 pt-3">
                        <label className="block text-xs font-bold text-gray-700">
                          Official Adjudication Notes (Mandatory for Resolution):
                        </label>
                        <textarea
                          rows={3}
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          placeholder="Record findings after examining weighbridge slips, inspection certificate, and contract terms..."
                          className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
                        />

                        <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoadingId === dispute.id}
                            onClick={() => handleAdjudicate(dispute.id, 'UNDER_REVIEW')}
                            className="text-xs"
                          >
                            Mark Under Review
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={actionLoadingId === dispute.id}
                            onClick={() => handleAdjudicate(dispute.id, 'RESOLVED')}
                            className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                          >
                            {actionLoadingId === dispute.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>Resolve & Settle Dispute</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoadingId === dispute.id}
                            onClick={() => handleAdjudicate(dispute.id, 'CLOSED')}
                            className="text-xs text-gray-700"
                          >
                            Close Dispute
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
    </div>
  );
}
