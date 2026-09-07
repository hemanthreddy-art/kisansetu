'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Scale,
  Truck,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Package,
  ShieldCheck,
  RefreshCw,
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

  const fetchTransactions = async () => {
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
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filtered transactions
  const filteredTransactions = transactions.filter((txn) => {
    if (statusFilter === 'ACTIVE') {
      return [
        'OFFER_ACCEPTED',
        'TRANSPORT_REQUESTED',
        'TRANSPORT_ACCEPTED',
        'IN_TRANSIT',
        'DELIVERED',
        'QUALITY_CONFIRMED',
        'PAYMENT_INITIATED',
      ].includes(txn.status);
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
  const activeCount = transactions.filter(
    (t) => !['COMPLETED', 'PAYMENT_RECEIVED', 'CANCELLED'].includes(t.status)
  ).length;
  const inTransitCount = transactions.filter((t) => t.status === 'IN_TRANSIT').length;
  const paymentPendingCount = transactions.filter(
    (t) =>
      ['DELIVERED', 'QUALITY_CONFIRMED', 'PAYMENT_INITIATED'].includes(t.status) &&
      !t.payments.some((p) => p.paymentStatus === 'PAID')
  ).length;
  const completedCount = transactions.filter(
    (t) => t.status === 'COMPLETED' || t.status === 'PAYMENT_RECEIVED'
  ).length;
  const disputeCount = transactions.filter((t) => t.status === 'DISPUTED' || t.disputes.length > 0).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="emerald">{t.transactions.completed}</Badge>;
      case 'PAYMENT_RECEIVED':
        return <Badge variant="emerald">{t.transactions.paymentReceived}</Badge>;
      case 'PAYMENT_INITIATED':
        return <Badge variant="blue">{t.transactions.paymentInitiated}</Badge>;
      case 'QUALITY_CONFIRMED':
        return <Badge variant="emerald">{t.commonStatuses.qualityAssayed}</Badge>;
      case 'DELIVERED':
        return <Badge variant="blue">{t.commonStatuses.delivered}</Badge>;
      case 'IN_TRANSIT':
        return <Badge variant="purple">{t.commonStatuses.inTransit}</Badge>;
      case 'TRANSPORT_ACCEPTED':
        return <Badge variant="blue">{t.commonStatuses.vehicleAssigned}</Badge>;
      case 'TRANSPORT_REQUESTED':
        return <Badge variant="amber">{t.commonStatuses.transportBooked}</Badge>;
      case 'DISPUTED':
        return <Badge variant="red">{t.transactions.filterDisputed}</Badge>;
      case 'OFFER_ACCEPTED':
        return <Badge variant="amber">{t.commonStatuses.offerAccepted}</Badge>;
      case 'CANCELLED':
        return <Badge variant="gray">{t.commonStatuses.cancelled}</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <PageContainer className="py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title={t.transactions.hubTitle}
        description={t.transactions.hubSubtitle}
        badge={<Badge variant="emerald">{t.common.commercialLedger}</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTransactions}
              className="gap-1.5 text-xs border-[#D8D2C4] bg-white hover:bg-stone-50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>{t.common.refresh}</span>
            </Button>
            <Link href="/disputes">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-rose-200 text-rose-800 hover:bg-rose-50 bg-white"
              >
                <Scale className="w-3.5 h-3.5 text-rose-700" />
                <span>{t.disputes.hubTitle}</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 Summary Commercial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.transactions.activeContracts}</span>
            </span>
            <div className="text-2xl font-black font-heading text-[#262320] mt-1">
              {activeCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              In transit or settlement
            </p>
          </CardHeader>
        </Card>

        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-purple-700" />
              <span>In Transit / Dispatches</span>
            </span>
            <div className="text-2xl font-black font-heading text-purple-900 mt-1">
              {inTransitCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              Active corridor freight
            </p>
          </CardHeader>
        </Card>

        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-700" />
              <span>Payment Pending</span>
            </span>
            <div className="text-2xl font-black font-heading text-blue-900 mt-1">
              {paymentPendingCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              Delivered & awaiting settlement
            </p>
          </CardHeader>
        </Card>

        <Card className="border-[#D8D2C4] bg-white shadow-none rounded-[8px]">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Settled & Completed</span>
            </span>
            <div className="text-2xl font-black font-heading text-[#1B4332] mt-1">
              {completedCount}
            </div>
            <p className="text-[11px] text-[#635E59] font-medium mt-0.5">
              Paid & 3-way verified
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Prototype Simulation Transparency Notice */}
      <div className="p-4 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3 text-xs text-[#92400E] shadow-xs">
        <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold block text-[#B45309]">
            Payment Tracking — Demo [Prototype Simulation]
          </span>
          <p className="leading-relaxed text-[#78350F]">
            {t.transactions.prototypeNotice} This is a prototype commercial tracking simulation. No real money movement, banking gateways, or escrow accounts are involved. Milestone transitions reflect operational dispatch, physical quality assaying, and direct counterparty confirmations.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
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
            {t.transactions.filterAll} ({transactions.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#635E59] hover:text-[#262320] hover:bg-stone-100'
            }`}
          >
            {t.transactions.filterActive} ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
              statusFilter === 'COMPLETED'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#635E59] hover:text-[#262320] hover:bg-stone-100'
            }`}
          >
            {t.transactions.filterCompleted} ({completedCount})
          </button>
          <button
            onClick={() => setStatusFilter('DISPUTED')}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
              statusFilter === 'DISPUTED'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-[#635E59] hover:text-rose-800 hover:bg-rose-50'
            }`}
          >
            {t.transactions.filterDisputed} ({disputeCount})
          </button>
        </div>

        <div className="text-xs text-[#635E59] font-medium hidden sm:block">
          Total Commercial Value: <strong className="text-[#1B4332] font-heading font-black">{formatINR(totalValue)}</strong>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-[8px] border border-[#D8D2C4]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1B4332]" />
          <p className="text-xs text-[#635E59] font-medium">Loading commercial ledger records...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card className="p-12 text-center space-y-3 bg-white rounded-[8px] border border-[#D8D2C4]">
          <CreditCard className="w-10 h-10 text-[#635E59] opacity-40 mx-auto" />
          <p className="text-[#262320] text-sm font-bold">{t.transactions.noTransactionsFound}</p>
          <p className="text-xs text-[#635E59] max-w-sm mx-auto">
            Transactions are generated automatically when a commercial offer is accepted between farmers and buyers.
          </p>
          <div className="pt-2">
            <Link href="/buyer">
              <Button variant="outline" size="sm" className="text-xs border-[#D8D2C4]">
                Browse Lots & Make Offers
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((txn) => {
            const latestPayment = txn.payments[0];
            return (
              <Card
                key={txn.id}
                className="hover:border-[#1B4332] transition-all border border-[#D8D2C4] bg-white rounded-[8px] overflow-hidden shadow-none"
              >
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: ID, Commodity, Parties */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#1B4332] bg-[#EAF2ED] px-2.5 py-0.5 rounded-[4px] border border-[#B7D5C4]">
                        {txn.transactionCode}
                      </span>
                      {getStatusBadge(txn.status)}
                      <span className="text-xs text-[#635E59]">
                        • Lot: <strong className="text-[#262320]">{txn.lot.lotCode}</strong>
                      </span>
                      <span className="text-xs text-[#635E59]">
                        • {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="text-base font-black font-heading text-[#262320] flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#1B4332]" />
                      <span>{txn.lot.commodity}</span>
                      {txn.lot.variety && <span className="text-xs text-[#635E59] font-normal">({txn.lot.variety})</span>}
                      <span className="text-xs font-bold text-[#635E59]">
                        — {txn.quantityQuintals} Qtl @ {formatINR(txn.agreedPricePerQuintal)}/Qtl
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#635E59] flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#1B4332]" />
                        <strong className="text-[#262320]">{t.transactions.farmerLabel}:</strong> {txn.farmer.user.fullName} ({txn.farmer.district})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-700" />
                        <strong className="text-[#262320]">{t.transactions.buyerLabel}:</strong> {txn.buyer.companyName}
                        {txn.buyer.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />}
                      </span>
                      {txn.transporter && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-purple-700" />
                            <strong className="text-[#262320]">{t.transactions.transporterLabel}:</strong> {txn.transporter.businessName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Financial Realisation */}
                  <div className="lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-[#D8D2C4] shrink-0 space-y-0.5">
                    <span className="text-[10px] text-[#635E59] uppercase font-bold tracking-wider block">
                      {t.transactions.grossContractValue}
                    </span>
                    <div className="text-lg font-black font-heading text-[#262320]">
                      {formatINR(txn.grossSaleValue)}
                    </div>
                    <div className="text-xs font-bold text-[#1B4332]">
                      Est. Net: {formatINR(txn.netRealisation)} ({formatINR(Math.round(txn.netRealisation / txn.quantityQuintals))}/Qtl)
                    </div>
                    {latestPayment && (
                      <span className="text-[10px] text-[#635E59] font-mono block">
                        Ref: {latestPayment.escrowReference || 'DEMO-PAY-2026-XXXX'}
                      </span>
                    )}
                  </div>

                  {/* Right Column: CTA */}
                  <div className="shrink-0 flex items-center justify-end">
                    <Link href={`/transactions/${txn.id}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-2 text-xs w-full lg:w-auto shadow-none bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-[4px]"
                      >
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
    </PageContainer>
  );
}
