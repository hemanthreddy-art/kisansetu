'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { ReputationCluster } from '@/components/ui/ReputationCluster';
import { NetRealisationLedger } from '@/components/ui/NetRealisationLedger';
import { FarmerVoiceAssistant } from '@/components/farmer/FarmerVoiceAssistant';
import { SellMyCropWizard } from '@/components/farmer/SellMyCropWizard';
import { FarmerLotCard } from '@/components/farmer/FarmerLotCard';
import { FarmerOffersModal } from '@/components/farmer/FarmerOffersModal';
import { BuyerDemandsSection } from '@/components/farmer/BuyerDemandsSection';
import { RoleHistoryView } from '@/components/shared/RoleHistoryView';
import { FarmerComplaintsSection } from '@/components/farmer/FarmerComplaintsSection';
import { FarmerDisputeModal } from '@/components/disputes/FarmerDisputeModal';
import { formatINR } from '@/lib/utils';
import { ProduceLot } from '@/types';
import {
  Users,
  PlusCircle,
  TrendingUp,
  Truck,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Package,
  History,
  Warehouse,
  Building2,
  Scale,
  AlertTriangle,
} from 'lucide-react';

interface FarmerTransactionItem {
  id: string;
  transactionCode: string;
  status: string;
  quantityQuintals: number;
  agreedPricePerQuintal: number;
  netRealisation: number;
  lot?: { commodity: string };
  buyer?: { companyName: string };
  transporter?: { businessName: string };
  payments?: Array<{ paymentStatus: string }>;
}

function FarmerHubContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [transactions, setTransactions] = useState<FarmerTransactionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'MY_CROPS' | 'FIND_BUYERS' | 'MY_DELIVERIES' | 'HISTORY' | 'COMPLAINTS'>('MY_CROPS');
  const [isSellWizardOpen, setIsSellWizardOpen] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeInitialTxnId, setDisputeInitialTxnId] = useState<string | undefined>(undefined);
  const [disputeInitialReason, setDisputeInitialReason] = useState<string | undefined>(undefined);
  const [selectedLotId, setSelectedLotId] = useState<string | undefined>(undefined);
  const [pendingOffersCount, setPendingOffersCount] = useState<number>(0);
  const [totalOffersCount, setTotalOffersCount] = useState<number>(0);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab')?.toUpperCase();
    if (tabParam && ['MY_CROPS', 'FIND_BUYERS', 'MY_DELIVERIES', 'HISTORY', 'COMPLAINTS', 'DISPUTES'].includes(tabParam)) {
      setActiveTab(tabParam === 'DISPUTES' ? 'COMPLAINTS' : tabParam as 'MY_CROPS' | 'FIND_BUYERS' | 'MY_DELIVERIES' | 'HISTORY' | 'COMPLAINTS');
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [lotsRes, txnsRes, offersRes] = await Promise.all([
        fetch('/api/lots'),
        fetch('/api/transactions?role=FARMER'),
        fetch('/api/offers?role=FARMER'),
      ]);

      if (lotsRes.ok) {
        const data = await lotsRes.json();
        if (data.success) {
          setLots(data.data || []);
        }
      }

      if (txnsRes.ok) {
        const txnData = await txnsRes.json();
        if (txnData.success) {
          setTransactions(txnData.data || []);
        }
      }

      if (offersRes.ok) {
        const offersData = await offersRes.json();
        if (offersData.success && Array.isArray(offersData.offers)) {
          setTotalOffersCount(offersData.offers.length);
          const pending = offersData.offers.filter((o: { status: string }) => o.status === 'PENDING').length;
          setPendingOffersCount(pending);
        }
      }
    } catch (err) {
      console.error('Failed to load farmer data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLotCreated = (newLot: ProduceLot) => {
    setLots((prev) => [newLot, ...prev]);
    setSuccessToast(t.farmer.publishSuccess || 'Produce lot successfully published!');
    setActiveTab('MY_CROPS');
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Rule #2: Active/in-progress lots remain visible until COMPLETED
  // Curated demo dataset displays all 13 representative lots across the full trade lifecycle:
  const activeLots = lots.filter((l) => l.status !== 'COMPLETED');
  const displayLots: ProduceLot[] = lots.length > 0 ? lots : activeLots.length > 0 ? activeLots : [
    {
      id: 'cmtplfopt000311fhrrmu0jpj',
      lotCode: 'KS-ONION-2026-0001',
      farmerId: 'cmtplfopt0001',
      commodity: 'Onion',
      variety: 'Nashik Red Garva',
      quantity: 80,
      unit: 'Quintals',
      quantityQuintals: 80,
      expectedPrice: 2350,
      expectedPricePerQuintal: 2350,
      expectedGrade: 'Grade A',
      locationDistrict: 'Nashik',
      location: 'Niphad, Nashik',
      status: 'AVAILABLE',
      harvestDate: new Date().toISOString(),
      readyForPickupDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const totalQuintals = displayLots.reduce((sum, l) => sum + (l.quantityQuintals || 0), 0);

  return (
    <PageContainer maxWidth="7xl">
      {/* 1. Farmer Profile & Hero Action Header */}
      <div className="pb-6 mb-6 border-b border-[#D8D2C4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant="emerald">{t.farmer.portalBadge}</Badge>
            <span className="text-[11px] font-semibold text-[#635E59] bg-[#ECE7DE] px-2 py-0.5 rounded border border-[#D8D2C4]">
              {t.farmer.demoProfile}: Ramesh Patil (Niphad, Nashik)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
            {t.farmer.title}
          </h1>
          <p className="text-xs sm:text-sm font-body text-[#635E59] mt-0.5">
            {t.farmer.fpoMember}
          </p>
        </div>

        {/* HERO "+ SELL MY CROP" UNIFIED PRIMARY ACTION */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsSellWizardOpen(true)}
            className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-2 font-black text-sm px-6 h-11 rounded-[8px] shadow-md transition-all hover:scale-[1.02]"
            data-testid="createLotBtn"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t.farmer.sellMyCropHero}</span>
          </Button>
          <span className="sr-only" aria-hidden="true">{t.farmer.createLotBtn}</span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="mb-6 p-4 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[8px] flex items-center justify-between text-xs text-[#1B4332] font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#1B4332] shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-[#635E59] hover:text-[#262320] text-xs font-bold underline"
          >
            {t.common.dismiss || 'Dismiss'}
          </button>
        </div>
      )}

      {/* 2. FOUR CORE FARMER QUESTIONS — CLARITY BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {/* Q1: What can I sell? */}
        <div className="p-4 rounded-[8px] bg-white border border-[#D8D2C4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#635E59] mb-1">
              <span className="font-bold text-[#1B4332] uppercase tracking-wider text-[10px]">{t.farmer.clarityHarvestInventory || '1. Harvest Inventory'}</span>
              <Package className="w-4 h-4 text-[#1B4332]" />
            </div>
            <h4 className="text-sm font-bold text-[#262320]">{t.farmer.clarityWhatCanSell}</h4>
            <p className="text-xs text-[#635E59] mt-1">
              <strong>{displayLots.length}</strong> {t.farmer.activeLotsCard} • <strong>{totalQuintals}</strong> {t.common.quintals}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#ECE7DE]">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSellWizardOpen(true)}
              className="w-full text-xs h-8 border-[#1B4332] text-[#1B4332] hover:bg-[#EAF2ED] font-semibold"
            >
              {t.farmer.sellMyCropHero}
            </Button>
          </div>
        </div>

        {/* Q2: Who wants to buy it? */}
        <div className="p-4 rounded-[8px] bg-white border border-[#D8D2C4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#635E59] mb-1">
              <span className="font-bold text-[#1B4332] uppercase tracking-wider text-[10px]">{t.farmer.clarityBuyerLinkages}</span>
              <Users className="w-4 h-4 text-[#1B4332]" />
            </div>
            <h4 className="text-sm font-bold text-[#262320]">{t.farmer.clarityWhoWantsBuy}</h4>
            <p className="text-xs text-[#635E59] mt-1">
              {t.buyerMatching.matchedBuyersSubtitle || 'Verified corporate buyers & wholesalers actively seeking local harvest supply.'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#ECE7DE]">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab('FIND_BUYERS')}
              className="w-full text-xs h-8 border-[#D8D2C4] text-[#262320] hover:bg-stone-50 font-semibold"
            >
              {t.farmer.browseBuyerDemandsBtn}
            </Button>
          </div>
        </div>

        {/* Q3: What offers have I received? */}
        <div className="p-4 rounded-[8px] bg-white border border-[#D8D2C4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#635E59] mb-1">
              <span className="font-bold text-[#92400E] uppercase tracking-wider text-[10px]">{t.farmer.clarityDirectBids}</span>
              <CheckCircle2 className="w-4 h-4 text-[#92400E]" />
            </div>
            <h4 className="text-sm font-bold text-[#262320]">{t.farmer.clarityOffersReceived}</h4>
            <p className="text-xs text-[#635E59] mt-1">
              {pendingOffersCount > 0 ? (
                <span className="text-[#92400E] font-semibold">
                  {pendingOffersCount} {t.buyerMatching.incomingOffersTitle} ({t.commonStatuses.pending})
                </span>
              ) : totalOffersCount > 0 ? (
                <span>{totalOffersCount} {t.buyerMatching.incomingOffersTitle}</span>
              ) : (
                t.buyerMatching.noOffersReceived || 'No pending offers yet. Direct bids on your lots appear here.'
              )}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#ECE7DE]">
            <Button
              size="sm"
              onClick={() => {
                setSelectedLotId(undefined);
                setIsOffersModalOpen(true);
              }}
              className="w-full text-xs h-8 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold shadow-xs"
            >
              {t.farmer.inspectOffersBtn} {totalOffersCount > 0 ? `(${totalOffersCount})` : ''}
            </Button>
          </div>
        </div>

        {/* Q4: What should I do next? */}
        <div className="p-4 rounded-[8px] bg-[#FAF8F5] border border-[#B7D5C4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#2D6A4F] mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">{t.farmer.clarityNextAction}</span>
              <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
            </div>
            <h4 className="text-sm font-bold text-[#1B4332]">{t.farmer.clarityWhatNext}</h4>
            <p className="text-xs text-[#635E59] mt-1">
              {pendingOffersCount > 0
                ? (t.buyerMatching.incomingOffersSubtitle || 'Review and accept direct purchase bids to lock escrow deposit.')
                : (t.farmer.tabMyDeliveries || 'Confirm dispatch handover or monitor in-transit deliveries.')}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D8D2C4]">
            {pendingOffersCount > 0 ? (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedLotId(undefined);
                  setIsOffersModalOpen(true);
                }}
                className="w-full text-xs h-8 bg-[#92400E] hover:bg-[#78350F] text-white font-semibold shadow-sm"
              >
                {t.farmer.reviewPendingBidsBtn} ({pendingOffersCount}) →
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab('MY_DELIVERIES')}
                className="w-full text-xs h-8 border-[#B7D5C4] text-[#1B4332] bg-white hover:bg-[#EAF2ED] font-semibold"
              >
                {t.farmer.tabMyDeliveries} →
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Embedded Voice Assistant (Preserving Auto-Speech Recitation) */}
      <div id="voice" className="mb-6">
        <FarmerVoiceAssistant />
      </div>

      {/* 3.5 SIH PS 26132 Market Linkage Features: Storage Discovery & FPO Aggregation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Storage Facility Discovery Card */}
        <div className="p-4 rounded-[8px] bg-gradient-to-br from-white to-[#FAF8F5] border border-[#D8D2C4] shadow-xs flex flex-col justify-between hover:border-[#1B4332] transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-[#635E59] mb-1.5">
              <span className="font-bold text-[#1B4332] uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Warehouse className="w-3.5 h-3.5" />
                <span>{t.netRealisation.storageTitle || 'MSWC Post-Harvest Storage'}</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                WDRA &amp; e-NWR
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#262320]">
              {t.netRealisation.storageBadge || 'Avoid Distress Selling — Store & Pledge'}
            </h4>
            <p className="text-xs text-[#635E59] mt-1 leading-relaxed">
              {t.netRealisation.storageSubtitle || 'Find accredited dry warehouses, cold stores, and onion chawls near your farm. Calculate holding advantage and access 70% bank pledge loans.'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#ECE7DE] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#1B4332] font-semibold">From ₹35/Qtl/mo</span>
            <Link
              href="/storage"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] hover:underline"
            >
              <span>{t.netRealisation.storageViewFacilities || 'Explore MSWC Facilities'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* FPO Micro-Lot Aggregation Card */}
        <div className="p-4 rounded-[8px] bg-gradient-to-br from-white to-[#FAF8F5] border border-[#D8D2C4] shadow-xs flex flex-col justify-between hover:border-[#1B4332] transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-[#635E59] mb-1.5">
              <span className="font-bold text-[#1B4332] uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{t.farmer.fpoName || 'Nashik Agro FPO Member Desk'}</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                +₹250/Qtl Premium
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#262320]">
              {t.farmer.fpoDeskTitle || 'Pool Micro-Lots for Corporate Contracts'}
            </h4>
            <p className="text-xs text-[#635E59] mt-1 leading-relaxed">
              {t.farmer.fpoDeskSubtitle || 'Combine your 10–35 Qtl harvest with 420+ FPO smallholders to supply institutional corporate buyers (ITC, Haldirams) with shared freight savings.'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#ECE7DE] flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-900 font-semibold">428 Active Members</span>
            <Link
              href="/fpo"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] hover:underline"
            >
              <span>{t.farmer.fpoViewInMarketplace || 'Open Aggregation Console'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Farmer Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8D2C4] mb-6 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('MY_CROPS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-heading font-bold rounded-t-[6px] border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'MY_CROPS'
              ? 'border-[#1B4332] text-[#1B4332] bg-[#EAF2ED]/40'
              : 'border-transparent text-[#635E59] hover:text-[#262320]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.farmer.tabMyCrops}</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 bg-[#ECE7DE] rounded-full text-[#262320]">
            {displayLots.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FIND_BUYERS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-heading font-bold rounded-t-[6px] border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'FIND_BUYERS'
              ? 'border-[#1B4332] text-[#1B4332] bg-[#EAF2ED]/40'
              : 'border-transparent text-[#635E59] hover:text-[#262320]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.farmer.tabFindBuyers}</span>
          {pendingOffersCount > 0 && (
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded-full animate-pulse">
              {pendingOffersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MY_DELIVERIES')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-heading font-bold rounded-t-[6px] border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'MY_DELIVERIES'
              ? 'border-[#1B4332] text-[#1B4332] bg-[#EAF2ED]/40'
              : 'border-transparent text-[#635E59] hover:text-[#262320]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{t.farmer.tabMyDeliveries}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-heading font-bold rounded-t-[6px] border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'HISTORY'
              ? 'border-[#1B4332] text-[#1B4332] bg-[#EAF2ED]/40'
              : 'border-transparent text-[#635E59] hover:text-[#262320]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{t.farmer.tabHistory}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLAINTS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-heading font-bold rounded-t-[6px] border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'COMPLAINTS'
              ? 'border-[#1B4332] text-[#1B4332] bg-[#EAF2ED]/40'
              : 'border-transparent text-[#635E59] hover:text-[#262320]'
          }`}
        >
          <Scale className="w-4 h-4 text-red-700" />
          <span>{t.farmer.tabComplaints || 'Complaints & Issues'}</span>
        </button>
      </div>

      {/* 5. Tab Content */}

      {/* TAB 1: MY CROPS (ACTIVE & IN-PROGRESS LOTS) */}
      {activeTab === 'MY_CROPS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Active Lots List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#262320]">
                    {t.farmer.activeLotsCard}
                  </h3>
                  <span className="text-xs text-[#635E59]">
                    {t.farmer.activeLotsSub}
                  </span>
                </div>
                {totalOffersCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedLotId(undefined);
                      setIsOffersModalOpen(true);
                    }}
                    className="text-xs border-[#52B788] text-[#1B4332] bg-[#EAF2ED] hover:bg-[#D8EADF] font-semibold gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{t.farmer.viewOffers} ({totalOffersCount})</span>
                  </Button>
                )}
              </div>

              {displayLots.map((lotItem, idx) => (
                <FarmerLotCard
                  key={lotItem.id || idx}
                  lot={lotItem}
                  onRefresh={loadData}
                  onViewOffers={(lot) => {
                    setSelectedLotId(lot.id);
                    setIsOffersModalOpen(true);
                  }}
                  onReportDispute={(lot) => {
                    setDisputeInitialTxnId(undefined);
                    setSelectedLotId(lot.id);
                    setIsDisputeModalOpen(true);
                  }}
                />
              ))}

              {/* Net Realisation Decision Ledger */}
              <div className="bg-white border border-[#D8D2C4] rounded-[10px] p-5 space-y-4 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D8D2C4]">
                  <div>
                    <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
                      {t.farmer.coreDecision}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-[#262320]">
                      {t.farmer.netRealisationEst}
                    </h3>
                    <p className="text-xs text-[#635E59]">
                      {t.farmer.takeHomeCalc}
                    </p>
                  </div>

                  <div className="p-2.5 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[4px] text-right">
                    <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-[#1B4332]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.farmer.sellNow}</span>
                    </div>
                    <span className="text-[11px] text-[#2D6A4F] block mt-0.5">
                      {t.farmer.sellNowDesc}
                    </span>
                  </div>
                </div>

                <NetRealisationLedger
                  grossSaleValue={193600}
                  transportFreight={1200}
                  mandiFee={0}
                  storageOrOtherCosts={1200}
                  netRealisation={191200}
                  lotQuantityQuintals={80}
                  cropName="Onion (Nashik Red)"
                />

                <div className="p-3 bg-[#F4F1EA] border border-[#D8D2C4] rounded-[4px] text-xs text-[#262320] space-y-1">
                  <strong className="text-[#1B4332] block">{t.farmer.whySellNowTitle}</strong>
                  <p className="text-[#635E59] leading-relaxed">
                    {t.farmer.whySellNowDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Active Offer, Transport & Live Transaction Summary */}
            <div className="space-y-6">
              {/* Quick Actions Panel */}
              <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-[10px] p-5 space-y-3">
                <h4 className="font-heading font-bold text-sm text-[#262320] uppercase tracking-wider">
                  {t.home.farmerToolsTitle || 'Mandi Quick Actions'}
                </h4>
                <div className="space-y-2">
                  <Link href="/markets" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs border-[#D8D2C4] text-[#262320] gap-2">
                      <TrendingUp className="w-4 h-4 text-[#1B4332]" />
                      <span>{t.farmer.compareMandis}</span>
                    </Button>
                  </Link>
                  <Link href="/lots" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs border-[#D8D2C4] text-[#262320] gap-2">
                      <Package className="w-4 h-4 text-[#1B4332]" />
                      <span>{t.farmer.viewFullLot}</span>
                    </Button>
                  </Link>
                  <Link href="/transporter" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs border-[#D8D2C4] text-[#262320] gap-2">
                      <Truck className="w-4 h-4 text-[#1B4332]" />
                      <span>{t.farmer.findLogistics}</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Active Buyer Offer */}
              <div className="bg-white border border-[#D8D2C4] rounded-[10px] p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
                  <h4 className="font-heading font-bold text-sm text-[#262320] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1B4332]" />
                    <span>{t.farmer.activeBuyerOffer}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-[#1B4332] bg-[#EAF2ED] px-2 py-0.5 rounded border border-[#B7D5C4]">
                    {t.farmer.acceptedStatus}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-sm text-[#262320]">ABC Foods Pvt Ltd</div>
                  <div className="flex items-center gap-2">
                    <VerificationBadge customLabel="Verified FSSAI" />
                  </div>
                  <div className="pt-1">
                    <ReputationCluster ratingScore={4.7} completedDealsCount={140} onTimeDeliveryPercent={98} size="sm" />
                  </div>
                  <div className="pt-2 border-t border-[#D8D2C4] flex items-center justify-between text-xs">
                    <span className="text-[#635E59]">{t.buyerMatching.offeredPrice}</span>
                    <span className="font-bold text-[#1B4332] text-sm">₹2,420 {t.common.perQuintal} (80 {t.common.quintals})</span>
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedLotId(undefined);
                        setIsOffersModalOpen(true);
                      }}
                      className="w-full text-xs border-[#1B4332] text-[#1B4332] hover:bg-[#EAF2ED] font-semibold"
                    >
                      {t.farmer.viewOffers || 'Review All Offers'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Corridor Transport Request */}
              <div className="bg-white border border-[#D8D2C4] rounded-[10px] p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
                  <h4 className="font-heading font-bold text-sm text-[#262320] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#1B4332]" />
                    <span>{t.ecosystem.stepTransport}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-[#1B4332] bg-[#EAF2ED] px-2 py-0.5 rounded border border-[#B7D5C4]">
                    {t.farmer.assignedStatus}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-sm text-[#262320]">Sahyadri Agri Logistics</div>
                  <div className="flex items-center gap-2">
                    <VerificationBadge customLabel={t.farmer.commercialLicense} />
                  </div>
                  <div className="pt-1">
                    <ReputationCluster ratingScore={4.8} completedDealsCount={230} onTimeDeliveryPercent={96.5} size="sm" />
                  </div>
                  <div className="pt-2 border-t border-[#D8D2C4] space-y-1 text-xs text-[#635E59]">
                    <div className="flex justify-between">
                      <span>{t.farmer.vehicleLabel}</span>
                      <span className="font-semibold text-[#262320]">6 Tonnes Eicher Truck</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.farmer.corridorRoute}</span>
                      <span className="font-semibold text-[#262320]">Niphad → Local Hub (30 km)</span>
                    </div>
                    <div className="flex justify-between text-[#1B4332] font-bold pt-1 border-t border-[#D8D2C4]/50">
                      <span>{t.farmer.freightCost}</span>
                      <span>₹1,200</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Commercial Transaction Summary */}
              {(() => {
                const activeTxn = transactions[0];
                const txnId = activeTxn?.id || 'cmtpuvylf0003m0yf0gxrt25r';
                const txnCode = activeTxn?.transactionCode || 'TXN-2026-P8-3687';
                const txnStatus = activeTxn?.status || 'IN_TRANSIT';
                const txnCrop = activeTxn?.lot?.commodity || 'Onion';
                const txnQty = activeTxn?.quantityQuintals || 80;
                const txnBuyer = activeTxn?.buyer?.companyName || 'ABC Foods Pvt Ltd [Demo]';
                const txnPayment = activeTxn?.payments?.[0]?.paymentStatus || 'INITIATED';
                const txnNet = activeTxn?.netRealisation ? formatINR(activeTxn.netRealisation) : '₹1,91,200';
                const txnStatusLabel = txnStatus === 'COMPLETED' ? t.commonStatuses.completed : t.commonStatuses.inTransit;
                return (
                  <div className="bg-white border border-[#D8D2C4] rounded-[10px] p-5 space-y-3 shadow-none hover:border-[#1B4332] transition-all">
                    <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
                      <h4 className="font-heading font-bold text-sm text-[#262320] flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#1B4332]" />
                        <span>{t.farmer.commercialTransaction}</span>
                      </h4>
                      <StatusIndicator status={txnStatus === 'COMPLETED' ? 'success' : 'pending'} label={txnStatusLabel} />
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#1B4332] bg-[#EAF2ED] px-2 py-0.5 rounded-[4px] border border-[#B7D5C4]">
                          {txnCode}
                        </span>
                        <span className="text-[10px] text-[#635E59] font-mono">
                          Pay: <strong className="text-[#1B4332]">{txnPayment}</strong>
                        </span>
                      </div>
                      <div className="text-sm font-black font-heading text-[#262320]">
                        {txnCrop} ({txnQty} {t.common.quintals})
                      </div>
                      <div className="flex justify-between text-[#635E59]">
                        <span>{t.common.buyer}:</span>
                        <span className="font-semibold text-[#262320] truncate max-w-[150px]">{txnBuyer}</span>
                      </div>
                      <div className="flex justify-between text-[#635E59]">
                        <span>{t.farmer.netRealisationEst}:</span>
                        <span className="font-bold text-[#1B4332]">{txnNet}</span>
                      </div>
                      <div className="pt-2 flex flex-col gap-1.5">
                        <Link href={`/transactions/${txnId}`}>
                          <Button size="sm" variant="outline" className="w-full text-xs gap-1 border-[#D8D2C4] hover:bg-stone-50">
                            <span>{t.farmer.viewTxnDetails}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDisputeInitialTxnId(txnId);
                            setDisputeInitialReason('PAYMENT_NOT_RECEIVED');
                            setIsDisputeModalOpen(true);
                          }}
                          className="w-full text-xs gap-1 border-red-200 text-red-800 hover:bg-red-50"
                        >
                          <AlertTriangle className="w-3 h-3 text-red-700" />
                          <span>{t.disputes.reportIssueBtn || 'Report an Issue'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FIND BUYERS (PERSONA-AWARE, NO REDIRECTION TO /buyer) */}
      {activeTab === 'FIND_BUYERS' && (
        <div className="space-y-6">
          {/* Quick Direct Offers Banner */}
          <div className="p-4 sm:p-5 bg-[#1B4332] text-white rounded-[10px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#2D6A4F] text-[#B7D5C4] border border-[#52B788]/30">
                  {t.farmer.clarityDirectBids}
                </span>
                {pendingOffersCount > 0 ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 animate-pulse">
                    {pendingOffersCount} {t.commonStatuses.pending}
                  </span>
                ) : (
                  <span className="text-xs text-[#B7D5C4]">
                    {totalOffersCount} {t.buyerMatching.demandsCount || 'Total'}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold font-heading">
                {t.farmer.incomingOffersCard}
              </h3>
              <p className="text-xs text-[#B7D5C4]">
                {t.farmer.incomingOffersSub}
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedLotId(undefined);
                setIsOffersModalOpen(true);
              }}
              className="bg-white hover:bg-stone-100 text-[#1B4332] font-bold text-xs h-10 px-5 shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>{t.farmer.viewOffers}</span>
            </Button>
          </div>

          {/* Live Published Buyer Demands Stream */}
          <BuyerDemandsSection
            farmerDistrict="Nashik"
            farmerCrops={displayLots.map((l) => l.commodity)}
            onFulfillDemand={() => {
              setIsSellWizardOpen(true);
            }}
          />
        </div>
      )}

      {/* TAB 3: MY DELIVERIES */}
      {activeTab === 'MY_DELIVERIES' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#D8D2C4] rounded-[10px] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C4]">
              <div>
                <h3 className="text-lg font-bold font-heading text-[#262320]">
                  {t.farmer.tabMyDeliveries}
                </h3>
                <p className="text-xs text-[#635E59]">
                  {t.transport.activeDispatchesSubtitle || 'Live farm-gate vehicle dispatch, corridor tracking and delivery confirmations'}
                </p>
              </div>
              <Link href="/transporter">
                <Button size="sm" variant="outline" className="text-xs border-[#D8D2C4]">
                  {t.farmer.findLogistics}
                </Button>
              </Link>
            </div>

            {/* Active Delivery Dispatch Card */}
            <div className="p-4 rounded-[8px] border border-[#B7D5C4] bg-[#EAF2ED]/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#D8D2C4]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1B4332] bg-white px-2 py-0.5 rounded border border-[#B7D5C4]">
                      TRIP-2026-NIPHAD-042
                    </span>
                    <Badge variant="blue">{t.commonStatuses.inTransit}</Badge>
                  </div>
                  <h4 className="font-heading font-bold text-sm text-[#262320] mt-1">
                    Sahyadri Agri Logistics • 6 Tonnes Eicher Truck (MH-15-EG-4821)
                  </h4>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#635E59] block">Estimated Freight</span>
                  <strong className="text-sm text-[#1B4332]">₹1,200</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#635E59]">
                <div>
                  <span>Origin:</span> <strong className="text-[#262320]">Niphad Farm Gate</strong>
                </div>
                <div>
                  <span>Destination:</span> <strong className="text-[#262320]">Pune APMC Hub (195 km)</strong>
                </div>
                <div>
                  <span>Status:</span> <strong className="text-[#1B4332]">En route • ETA 4.5 hrs</strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end border-t border-[#D8D2C4]/40">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDisputeInitialTxnId(transactions[0]?.id);
                    setDisputeInitialReason('TRANSPORT_ISSUE');
                    setIsDisputeModalOpen(true);
                  }}
                  className="text-xs border-amber-300 text-amber-900 hover:bg-amber-50 gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t.disputes.reportIssueBtn || 'Report Transport Issue'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORY */}
      {activeTab === 'HISTORY' && (
        <RoleHistoryView role="FARMER" />
      )}

      {/* TAB 5: COMPLAINTS & ISSUES */}
      {activeTab === 'COMPLAINTS' && (
        <FarmerComplaintsSection />
      )}

      {/* 6. Modals */}
      {/* Sell My Crop Guided 4-Step Wizard Modal */}
      <SellMyCropWizard
        isOpen={isSellWizardOpen}
        onClose={() => setIsSellWizardOpen(false)}
        onSuccess={handleLotCreated}
        initialDistrict="Nashik"
        initialLocation="Niphad, Nashik"
      />

      {/* Farmer In-Dashboard Offers Modal */}
      <FarmerOffersModal
        isOpen={isOffersModalOpen}
        lotId={selectedLotId}
        onClose={() => setIsOffersModalOpen(false)}
        onOfferUpdated={loadData}
      />

      {/* Farmer Evidence-Based Grievance Modal */}
      <FarmerDisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => {
          setIsDisputeModalOpen(false);
          setSelectedLotId(undefined);
          setDisputeInitialTxnId(undefined);
          setDisputeInitialReason(undefined);
        }}
        initialTransactionId={disputeInitialTxnId}
        initialLotId={selectedLotId}
        initialReason={disputeInitialReason}
        onDisputeSubmitted={() => {
          setActiveTab('COMPLAINTS');
          setSelectedLotId(undefined);
          setDisputeInitialTxnId(undefined);
          setDisputeInitialReason(undefined);
          loadData();
        }}
      />

      {/* 7. Transparency & Demonstration Notice */}
      <div className="mt-8 p-4 rounded-[6px] bg-[#ECE7DE] border border-[#D8D2C4] text-xs text-[#635E59] space-y-1">
        <strong className="text-[#262320] block">{t.farmer.dataTransparencyTitle}</strong>
        <p>
          {t.farmer.dataTransparencyNotice}
        </p>
      </div>
    </PageContainer>
  );
}

export default function FarmerHubPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <FarmerHubContent />
    </Suspense>
  );
}
