'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  AlertTriangle,
  Scale,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Loader2,
  CreditCard,
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
      user: { fullName: string };
    };
    buyer: {
      companyName: string;
    };
  };
}

export default function DisputesPage() {
  const { t } = useLanguage();
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const evidenceChecklist = [
    'Produce Lot ID & specifications',
    'Agreed quantity (Quintals)',
    'Agreed target price & accepted offer terms',
    'AI visual screening vs Physical inspection report',
    'Transporter electronic proof-of-delivery (e-POD)',
    'Weighing bridge slips from APMC yard / farm',
    'Escrow lock timestamp & milestone status',
  ];

  useEffect(() => {
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
        console.error('Failed to load disputes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDisputes();
  }, []);

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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="red">Arbitration</Badge>
            <span className="text-xs text-gray-500 font-mono">GRIEVANCE REDRESSAL</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-rose-700" />
            <span>{t.disputes.hubTitle}</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {t.disputes.hubSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/transactions">
            <Button variant="outline" className="text-xs gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>View Transactions</span>
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="primary" className="text-xs gap-1.5 bg-rose-700 hover:bg-rose-800">
              <Scale className="w-4 h-4" />
              <span>Admin Grievance Panel</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Strict Dispute Principle Banner */}
      <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 space-y-3">
        <div className="flex items-center gap-2 text-rose-950 font-bold">
          <Scale className="w-5 h-5 text-rose-700" />
          <span>Evidence-Based Resolution Principle: Official Human Adjudication (Not Autonomous AI Judgments)</span>
        </div>
        <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
          {t.disputes.humanAdjudicationNote} KisanSetu enforces human oversight backed by verifiable digital transaction artifacts:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          {evidenceChecklist.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gray-800 bg-white p-2.5 rounded-xl border border-rose-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Grievances List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-700" />
            <span>Registered Trade Grievances ({disputes.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-600" />
            <p className="text-xs text-gray-500">Loading trade grievances...</p>
          </div>
        ) : disputes.length === 0 ? (
          <Card className="p-12 text-center space-y-3 bg-gray-50 border-dashed">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-600" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-900">{t.disputes.noDisputesFound}</p>
              <p className="text-xs text-gray-500">
                Disputes can be raised on active transaction pages when discrepancies arise.
              </p>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size="sm" className="text-xs">Go to Transactions</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {disputes.map((d) => (
              <Card key={d.id} className="border border-gray-200 hover:shadow-md transition-all">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-rose-950 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                        {d.disputeCode}
                      </span>
                      {getStatusBadge(d.status)}
                      <span className="text-xs text-gray-400">
                        • {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <span className="text-xs text-gray-500 font-bold">
                      Category: <span className="text-rose-900 font-black">{d.reason.replace(/_/g, ' ')}</span>
                    </span>
                  </div>
                  <CardTitle className="text-base text-gray-900 mt-2">
                    Trade: {d.transaction?.lot?.commodity} ({d.transaction?.transactionCode})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 text-xs space-y-3">
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Summary of Grievance:</span>
                    <p className="text-gray-700 leading-relaxed">{d.evidenceSummary}</p>
                    <span className="text-[10px] text-gray-400 block pt-1">
                      Raised by: <strong>{d.raisedBy?.fullName}</strong> ({d.raisedBy?.role})
                    </span>
                  </div>

                  {d.resolutionNotes && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                      <span className="text-[10px] text-emerald-700 uppercase font-bold block flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Official Adjudication Notes:</span>
                      </span>
                      <p className="text-xs leading-relaxed">{d.resolutionNotes}</p>
                      {d.resolvedAt && (
                        <span className="text-[10px] text-emerald-600 block">
                          Resolved on: {new Date(d.resolvedAt).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-gray-500 text-[11px]">
                      Parties: {d.transaction?.farmer?.user?.fullName} ↔ {d.transaction?.buyer?.companyName}
                    </span>
                    <Link href={`/transactions/${d.transaction?.id}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <span>View Transaction Evidence</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
