'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Scale,
} from 'lucide-react';

interface TransactionItem {
  id: string;
  transactionCode: string;
  status: string;
  agreedPricePerQuintal: number;
  quantityQuintals: number;
  grossSaleValue: number;
  transportCost: number;
  storageCost: number;
  otherCosts: number;
  netRealisation: number;
  createdAt: string;
  lot: {
    id: string;
    lotCode: string;
    commodity: string;
    variety: string | null;
  };
  farmer: {
    id: string;
    district: string;
    user: {
      fullName: string;
    };
  };
  buyer: {
    id: string;
    companyName: string;
    verified: boolean;
    user: {
      fullName: string;
    };
  };
  transporter?: {
    id: string;
    businessName: string;
    verified: boolean;
  } | null;
  payments: Array<{
    id: string;
    paymentStatus: string;
    amount: number;
    escrowReference: string | null;
  }>;
  ratings: Array<{
    id: string;
    ratingScore: number;
  }>;
  disputes: Array<{
    id: string;
    status: string;
    reason: string;
  }>;
}

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const res = await fetch('/api/transactions');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setTransactions(data.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  // Filtered transactions
  const filteredTransactions = transactions.filter((txn) => {
    if (statusFilter === 'ACTIVE') {
      return ['OFFER_ACCEPTED', 'TRANSPORT_REQUESTED', 'TRANSPORT_ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'QUALITY_CONFIRMED', 'PAYMENT_INITIATED'].includes(txn.status);
    }
    if (statusFilter === 'COMPLETED') {
      return ['PAYMENT_RECEIVED', 'COMPLETED'].includes(txn.status);
    }
    if (statusFilter === 'DISPUTED') {
      return txn.status === 'DISPUTED' || txn.disputes.length > 0;
    }
    return true;
  });

  // Aggregated metrics
  const totalValue = transactions.reduce((acc, curr) => acc + curr.grossSaleValue, 0);
  const completedCount = transactions.filter((t) => t.status === 'COMPLETED' || t.status === 'PAYMENT_RECEIVED').length;
  const activeCount = transactions.filter((t) => !['COMPLETED', 'PAYMENT_RECEIVED', 'CANCELLED'].includes(t.status)).length;
  const disputeCount = transactions.filter((t) => t.status === 'DISPUTED' || t.disputes.length > 0).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="emerald">{t.transactions.completed}</Badge>;
      case 'PAYMENT_RECEIVED':
        return <Badge variant="emerald">{t.transactions.paymentReceived}</Badge>;
      case 'PAYMENT_INITIATED':
        return <Badge variant="blue">{t.transactions.paymentInitiated}</Badge>;
      case 'IN_TRANSIT':
        return <Badge variant="purple">In Transit</Badge>;
      case 'DELIVERED':
        return <Badge variant="blue">Delivered</Badge>;
      case 'DISPUTED':
        return <Badge variant="red">{t.transactions.filterDisputed}</Badge>;
      case 'OFFER_ACCEPTED':
        return <Badge variant="amber">Offer Accepted</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-6xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">Trade & Escrow</Badge>
            <span className="text-xs text-gray-500 font-mono">SECURE SETTLEMENTS</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-700" />
            <span>{t.transactions.hubTitle}</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-3xl">
            {t.transactions.hubSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/disputes">
            <Button variant="outline" className="gap-2 text-rose-700 border-rose-200 hover:bg-rose-50">
              <Scale className="w-4 h-4" />
              <span>{t.disputes.hubTitle}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Contract Value
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-1">
              ₹{totalValue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              Across {transactions.length} trade contracts
            </p>
          </CardHeader>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Active Dispatches
            </span>
            <div className="text-2xl font-black text-purple-900 mt-1">
              {activeCount}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              In transit & pending settlement
            </p>
          </CardHeader>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Settled & Completed
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {completedCount}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              Paid & 3-way rated
            </p>
          </CardHeader>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Grievances / Disputes
            </span>
            <div className="text-2xl font-black text-rose-700 mt-1">
              {disputeCount}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              Human review by APMC/FPO
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Prototype Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold block">Payment Tracking — Demo</span>
          <p className="leading-relaxed text-amber-800">
            {t.transactions.prototypeNotice} Commercial payments follow milestone-based status tracking (Initiated → Processing → Paid). Banking credentials and ratings are decoupled to protect farmer transparency.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.transactions.filterAll} ({transactions.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.transactions.filterActive} ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.transactions.filterCompleted} ({completedCount})
          </button>
          <button
            onClick={() => setStatusFilter('DISPUTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'DISPUTED'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.transactions.filterDisputed} ({disputeCount})
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-xs text-gray-500">Loading commercial transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <p className="text-gray-500 text-sm font-medium">{t.transactions.noTransactionsFound}</p>
          <Link href="/buyer">
            <Button variant="outline" className="text-xs">Browse Lots & Make Offers</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((txn) => {
            const latestPayment = txn.payments[0];
            return (
              <Card
                key={txn.id}
                className="hover:shadow-md transition-all border border-gray-200 overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column: ID, Commodity, Parties */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {txn.transactionCode}
                      </span>
                      {getStatusBadge(txn.status)}
                      <span className="text-xs text-gray-400">
                        • {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="text-base font-black text-gray-900 flex items-center gap-2">
                      <span>{txn.lot.commodity}</span>
                      <span className="text-xs font-bold text-gray-500">
                        ({txn.quantityQuintals} Qtl @ ₹{txn.agreedPricePerQuintal.toLocaleString('en-IN')}/Qtl)
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                      <span>
                        <strong className="text-gray-700">{t.transactions.farmerLabel}:</strong> {txn.farmer.user.fullName} ({txn.farmer.district})
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-gray-700">{t.transactions.buyerLabel}:</strong> {txn.buyer.companyName}
                      </span>
                      {txn.transporter && (
                        <>
                          <span>•</span>
                          <span>
                            <strong className="text-gray-700">{t.transactions.transporterLabel}:</strong> {txn.transporter.businessName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Financial Realisation */}
                  <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 shrink-0">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      {t.transactions.grossContractValue}
                    </span>
                    <div className="text-lg font-black text-gray-900">
                      ₹{txn.grossSaleValue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs font-bold text-emerald-700">
                      Net: ₹{txn.netRealisation.toLocaleString('en-IN')}
                    </div>
                    {latestPayment && (
                      <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                        Ref: {latestPayment.escrowReference || 'DEMO-ESCROW'}
                      </span>
                    )}
                  </div>

                  {/* Right Column: CTA */}
                  <div className="shrink-0 flex items-center justify-end">
                    <Link href={`/transactions/${txn.id}`}>
                      <Button variant="primary" className="gap-2 text-xs w-full sm:w-auto shadow-xs">
                        <span>{t.transactions.viewTransactionBtn}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
