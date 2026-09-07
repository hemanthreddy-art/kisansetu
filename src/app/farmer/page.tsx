'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  PlusCircle,
  Scale,
  ShieldCheck,
  ArrowRight,
  Package,
  Sparkles,
  MapPin,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { ProduceLot } from '@/types';
import { FarmerVoiceAssistant } from '@/components/farmer/FarmerVoiceAssistant';

interface FarmerTransactionItem {
  id: string;
  transactionCode: string;
  status: string;
  quantityQuintals: number;
  agreedPricePerQuintal: number;
  netRealisation: number;
  lot?: { commodity: string };
  buyer?: { companyName: string };
  payments?: Array<{ paymentStatus: string }>;
}

export default function FarmerHubPage() {
  const { t } = useLanguage();

  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [transactions, setTransactions] = useState<FarmerTransactionItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalLots: 0,
    activeLots: 0,
    draftLots: 0,
    totalQuantityQuintals: 0,
    totalOffers: 0,
    pendingOffers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [lotsRes, txnsRes] = await Promise.all([
          fetch('/api/lots'),
          fetch('/api/transactions?role=FARMER'),
        ]);
        if (lotsRes.ok) {
          const data = await lotsRes.json();
          if (data.success) {
            setLots(data.data || []);
            if (data.metrics) {
              setMetrics(data.metrics);
            }
          }
        }
        if (txnsRes.ok) {
          const txnData = await txnsRes.json();
          if (txnData.success) {
            setTransactions(txnData.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load farmer data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
            <Badge variant="emerald">{t.farmer.badge}</Badge>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-700" />
            <span>{t.farmer.title}</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-3xl">
            {t.farmer.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/lots?action=create">
            <Button variant="primary" className="gap-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              <span>{t.farmer.createLotCTA}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Voice-First Farmer Assistant Entry Point */}
      <FarmerVoiceAssistant />

      {/* Quick Status Cards with Live Database Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/lots" className="block group">
          <Card className="bg-emerald-50/60 border-emerald-200 group-hover:border-emerald-400 transition-all">
            <CardHeader className="pb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {t.farmer.activeLotsCard}
              </span>
              <div className="text-3xl font-black text-emerald-950 flex items-baseline gap-2 mt-1">
                <span>{metrics.activeLots} Lots</span>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
              </div>
              <p className="text-xs text-emerald-700 mt-1 font-medium">
                {metrics.totalQuantityQuintals} Quintals listed • {metrics.draftLots} Drafts
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/lots" className="block group">
          <Card className="bg-amber-50/60 border-amber-200 group-hover:border-amber-400 transition-all">
            <CardHeader className="pb-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                {t.farmer.incomingOffersCard}
              </span>
              <div className="text-3xl font-black text-amber-950 flex items-baseline gap-2 mt-1">
                <span>{metrics.totalOffers} Offers</span>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
              </div>
              <p className="text-xs text-amber-700 mt-1 font-medium">
                {metrics.pendingOffers} Pending Farmer Action • Live Bids
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Card className="bg-sky-50/60 border-sky-200">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
              {t.farmer.fpoMembershipCard}
            </span>
            <div className="text-xl font-bold text-sky-950 mt-1">
              Nashik Agro FPO
            </div>
            <p className="text-xs text-sky-700 mt-1 font-medium">
              {t.farmer.fpoMembershipSub}
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Phase 6 Core USP Banner: Best Net Realisation Discovery */}
      {lots.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-900 via-indigo-900 to-emerald-950 text-white border-0 shadow-lg overflow-hidden relative">
          <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <CardContent className="p-6 sm:p-8 relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="purple" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                    {t.netRealisation.dashboardCardTitle}
                  </Badge>
                  <span className="text-xs text-purple-300 font-mono uppercase tracking-wider">
                    {t.netRealisation.dashboardCardSub}
                  </span>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{lots[0].commodity}</span>
                  <span className="text-purple-300 font-normal text-base">
                    • {lots[0].quantity} {lots[0].unit || 'Quintals'}
                  </span>
                </h3>
                <p className="text-sm text-purple-200/90 max-w-2xl">
                  {t.netRealisation.hubSubtitle}
                </p>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-purple-300 font-medium uppercase tracking-wider">
                  {t.netRealisation.bestSellingOption}
                </span>
                <div className="text-3xl font-black text-amber-300 mt-0.5">
                  ₹{Math.round((lots[0].expectedPrice || 2300) * 0.98).toLocaleString('en-IN')}{' '}
                  <span className="text-sm font-normal text-purple-200">/ Qtl Net</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 mt-1 bg-emerald-900/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t.netRealisation.sellNow}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs text-purple-200">
                <span>
                  {t.netRealisation.formulaTitle}: <strong className="text-white">Gross − Transport − Storage − Fees</strong>
                </span>
              </div>
              <Link href={`/lots/${lots[0].lotCode || lots[0].id}#net-realisation`}>
                <Button
                  size="sm"
                  className="bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold gap-2 shadow-sm"
                >
                  <Scale className="w-4 h-4" />
                  <span>{t.netRealisation.viewAnalysisBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Produce Lots Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-gray-900">{t.farmer.recentLotsTitle}</h2>
          </div>
          {lots.length > 0 && (
            <Link
              href="/lots"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{t.farmer.viewAllLots} ({lots.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <Loader2 className="w-6 h-6 text-emerald-700 animate-spin mx-auto" />
            <p className="text-xs text-gray-500 mt-2">{t.lots.loading}</p>
          </div>
        ) : lots.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
            <Package className="w-10 h-10 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-gray-800">{t.lots.emptyTitle}</h3>
              <p className="text-xs text-gray-500 mt-1">{t.lots.emptyDesc}</p>
            </div>
            <Link href="/lots?action=create">
              <Button size="sm" variant="primary" className="gap-1.5 mt-2">
                <PlusCircle className="w-4 h-4" />
                <span>{t.lots.createFirstLot}</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lots.slice(0, 4).map((lot) => (
              <Card key={lot.id} className="hover:border-emerald-300 transition-all border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {lot.lotCode}
                    </span>
                    {getStatusBadge(lot.status)}
                  </div>
                  <CardTitle className="text-lg text-gray-900 mt-1">
                    {lot.commodity} {lot.variety && <span className="text-gray-500 font-normal">• {lot.variety}</span>}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {lot.locationDistrict}
                    </span>
                    <span>•</span>
                    <span><strong>{lot.quantity} {lot.unit}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-800 font-semibold">₹{lot.expectedPricePerQuintal || lot.expectedPrice}/Qtl</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{lot.expectedGrade}</span>
                  </span>
                  <Link href={`/lots/${lot.lotCode}`}>
                    <Button size="sm" variant="outline" className="text-xs gap-1 min-h-[34px] py-1 px-3">
                      <span>{t.lots.viewDetails}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Phase 7: My Commercial Transactions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <span>{t.transactions.myTransactionsTitle}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                {transactions.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              {t.transactions.myTransactionsSubtitle}
            </p>
          </div>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="text-xs text-emerald-800 hover:text-emerald-950 gap-1">
              <span>View All Transactions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {transactions.length === 0 ? (
          <Card className="p-6 text-center text-xs text-gray-500 bg-gray-50 border-dashed">
            {t.transactions.noTransactionsFound}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {transactions.slice(0, 4).map((txn) => {
              const latestPayment = txn.payments?.[0];
              return (
                <Card key={txn.id} className="hover:border-emerald-400 hover:shadow-md transition-all border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {txn.transactionCode}
                      </span>
                      <Badge
                        variant={
                          txn.status === 'COMPLETED' || txn.status === 'PAYMENT_RECEIVED'
                            ? 'emerald'
                            : txn.status === 'DISPUTED'
                            ? 'red'
                            : 'blue'
                        }
                      >
                        {txn.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base text-gray-900 mt-1">
                      {txn.lot?.commodity} ({txn.quantityQuintals} Qtl @ ₹{txn.agreedPricePerQuintal}/Qtl)
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      Buyer: <strong className="text-gray-700">{txn.buyer?.companyName}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Net Realisation</span>
                      <span className="font-bold text-emerald-700 text-sm">₹{txn.netRealisation?.toLocaleString('en-IN')}</span>
                      {latestPayment && (
                        <span className="text-[10px] text-gray-500 block">
                          Payment: <strong>{latestPayment.paymentStatus}</strong>
                        </span>
                      )}
                    </div>
                    <Link href={`/transactions/${txn.id}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <span>{t.transactions.viewTransactionBtn}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Core Actions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-emerald-300 transition-all">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-2">
              <Scale className="w-5 h-5" />
            </div>
            <CardTitle>{t.farmer.engineTitle}</CardTitle>
            <CardDescription>{t.farmer.engineDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/calculator">
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>{t.farmer.engineAction}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-300 transition-all">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <CardTitle>{t.farmer.qualityTitle}</CardTitle>
            <CardDescription>{t.farmer.qualityDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/inspector">
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>{t.farmer.qualityAction}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Phase 2 Architecture Notice */}
      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-sm space-y-2">
        <span className="font-bold text-gray-900 block">
          {t.farmer.noticeTitle}
        </span>
        <p className="text-gray-600">
          {t.farmer.noticeDesc}
        </p>
      </div>
    </div>
  );
}

