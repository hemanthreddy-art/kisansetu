'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MAHARASHTRA_DISTRICTS, ANDHRA_PRADESH_DISTRICTS } from '@/lib/constants';
import {
  Store,
  ShoppingCart,
  ShieldCheck,
  Building2,
  BadgeCheck,
  AlertCircle,
  PlusCircle,
  Package,
  Send,
  Star,
  CheckCircle2,
  MapPin,
  TrendingUp,
  X,
  Loader2,
  Filter,
  ArrowRight,
  Award,
  Camera,
  Ban,
  CreditCard,
  Truck,
} from 'lucide-react';
import { ProduceLot } from '@/types';

// Prototype Demo Buyers Configuration
const DEMO_BUYERS = [
  {
    key: 'ABC_FOODS' as const,
    companyName: 'ABC Foods Pvt Ltd [Prototype Demo]',
    name: 'Anand Deshmukh',
    buyerType: 'Food Processor',
    location: 'Pune, Maharashtra',
    district: 'Pune',
    gstin: '27AAACA0001A1Z5',
    tradeLicense: 'MH-FDA-PUN-2024-8891',
    verified: true,
    reputation: {
      ratingScore: 4.8,
      completedTradesCount: 48,
      paymentPunctualityPercent: 98,
      reliabilityScore: 96,
    },
    defaultCommodity: 'Onion',
    defaultDelivery: 'ABC Food Processing Plant, Hadapsar, Pune',
  },
  {
    key: 'NASHIK_FRESH' as const,
    companyName: 'Nashik Fresh Processors [Prototype Demo]',
    name: 'Sunil More',
    buyerType: 'Wholesaler & Aggregator',
    location: 'Nashik, Maharashtra',
    district: 'Nashik',
    gstin: '27AABCN1234B1Z2',
    tradeLicense: 'MH-APMC-NSK-2025-4122',
    verified: true,
    reputation: {
      ratingScore: 4.6,
      completedTradesCount: 34,
      paymentPunctualityPercent: 95,
      reliabilityScore: 92,
    },
    defaultCommodity: 'Onion',
    defaultDelivery: 'Nashik Fresh Packhouse, Pimpalgaon Baswant',
  },
  {
    key: 'MAHA_EXPORTS' as const,
    companyName: 'Maharashtra Agro Exports Ltd [Prototype Demo]',
    name: 'Rajendra Kadam',
    buyerType: 'Exporter',
    location: 'Navi Mumbai, Maharashtra',
    district: 'Thane',
    gstin: '27AAACM9988C1Z9',
    tradeLicense: 'APEDA-EXP-MH-2024-098',
    verified: true,
    reputation: {
      ratingScore: 4.9,
      completedTradesCount: 62,
      paymentPunctualityPercent: 99,
      reliabilityScore: 98,
    },
    defaultCommodity: 'Onion',
    defaultDelivery: 'JNPT Cold Storage Terminal, Navi Mumbai',
  },
  {
    key: 'PUNE_INSTITUTIONAL' as const,
    companyName: 'Pune Institutional Foods [Prototype Demo]',
    name: 'Pooja Jadhav',
    buyerType: 'Institutional Catering',
    location: 'Pune, Maharashtra',
    district: 'Pune',
    gstin: '27AAACP4455D1Z7',
    tradeLicense: 'MH-FMCG-PUN-2025-1109',
    verified: false, // Explicit prototype with unverified documents
    reputation: {
      ratingScore: 4.2,
      completedTradesCount: 12,
      paymentPunctualityPercent: 91,
      reliabilityScore: 88,
    },
    defaultCommodity: 'Tomato',
    defaultDelivery: 'Chakan Central Commissary, Pune',
  },
];

type DemoBuyerKey = (typeof DEMO_BUYERS)[number]['key'];

interface BuyerDemandItem {
  id: string;
  buyerId: string;
  companyName: string;
  buyerType: string;
  isBuyerVerified: boolean;
  commodity: string;
  variety?: string | null;
  requiredQuantityQtl: number;
  unit: string;
  targetPricePerQtl: number;
  minPricePerQtl?: number | null;
  maxPricePerQtl?: number | null;
  destinationDistrict: string;
  deliveryLocation?: string | null;
  deliveryDeadline?: string | null;
  requiredGrade?: string | null;
  qualityRequirements?: string | null;
  description?: string | null;
  status: string;
  createdAt: string;
}

interface BuyerOfferItem {
  id: string;
  lotId: string;
  lotCode: string;
  commodity: string;
  variety?: string | null;
  lotGrade?: string | null;
  lotStatus: string;
  lotDistrict?: string | null;
  offeredPricePerQtl: number;
  quantityQuintals: number;
  totalOfferValue: number;
  proposedPickupDate?: string | null;
  paymentTerms?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  notes?: string | null;
  validUntil?: string | null;
  createdAt: string;
}

interface LotWithQuality extends ProduceLot {
  qualityStatus?: string;
  officialGrade?: string;
  certificateNumber?: string;
  isPhysicallyVerified?: boolean;
  matchScore?: number;
}

interface PurchaseTransactionItem {
  id: string;
  transactionCode: string;
  status: string;
  quantityQuintals: number;
  agreedPricePerQuintal: number;
  grossSaleValue: number;
  createdAt: string;
  lot?: {
    lotCode: string;
    commodity: string;
    location?: string;
    transportRequests?: Array<{ status: string; dropLocation?: string }>;
  };
  farmer?: {
    user?: { fullName: string };
    district?: string;
  };
  payments?: Array<{ paymentStatus: string }>;
}

function BuyerPortalContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  // Active Buyer Enterprise
  const [selectedBuyerKey, setSelectedBuyerKey] = useState<DemoBuyerKey>('ABC_FOODS');
  const activeBuyer = DEMO_BUYERS.find((b) => b.key === selectedBuyerKey) || DEMO_BUYERS[0];

  // Active Tab: 'demands' | 'create_demand' | 'browse_lots' | 'my_offers'
  const initialTab = (searchParams?.get('tab') as string) || 'demands';
  const [activeTab, setActiveTab] = useState<'demands' | 'create_demand' | 'browse_lots' | 'my_offers' | 'purchases'>(
    initialTab === 'create'
      ? 'create_demand'
      : initialTab === 'lots'
      ? 'browse_lots'
      : initialTab === 'offers'
      ? 'my_offers'
      : initialTab === 'purchases'
      ? 'purchases'
      : 'demands'
  );

  // Data States
  const [demands, setDemands] = useState<BuyerDemandItem[]>([]);
  const [lots, setLots] = useState<LotWithQuality[]>([]);
  const [offers, setOffers] = useState<BuyerOfferItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demand Filter in Browse Lots
  const [selectedDemandFilter, setSelectedDemandFilter] = useState<string>('ALL');

  // Create Demand Form State
  const [demandForm, setDemandForm] = useState({
    commodity: 'Onion',
    variety: 'Nashik Red',
    requiredQuantityQtl: '100',
    unit: 'Quintal',
    targetPricePerQtl: '2400',
    minPricePerQtl: '2100',
    maxPricePerQtl: '2600',
    destinationDistrict: 'Pune',
    deliveryLocation: 'ABC Food Processing Plant, Hadapsar, Pune',
    deliveryDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    requiredGrade: 'Grade A',
    qualityRequirements: 'Moisture < 13%, dry outer skin, bulb size 50-65mm',
    description: 'Dehydration & puree processing grade. Prefer sorted farmgate pickup.',
  });
  const [demandSubmitting, setDemandSubmitting] = useState(false);
  const [demandErrors, setDemandErrors] = useState<Record<string, string>>({});
  const [demandSuccess, setDemandSuccess] = useState<string | null>(null);

  // Make Offer Modal State
  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(false);
  const [targetLot, setTargetLot] = useState<LotWithQuality | null>(null);
  const [offerForm, setOfferForm] = useState({
    offeredPricePerQtl: '',
    quantityQuintals: '',
    proposedPickupDate: '',
    deliveryTerms: 'Farm-gate pickup arranged by buyer',
    paymentTerms: 'Bank escrow release within 24h of physical receipt',
    notes: 'Binding offer backed by buyer escrow guarantee.',
    validityDays: 7,
  });
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Cancel Offer Action
  const [cancellingOfferId, setCancellingOfferId] = useState<string | null>(null);

  // Fetch Demands, Lots, Offers, and Purchases
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [resDemands, resLots, resOffers, resTxns] = await Promise.all([
        fetch('/api/buyer-demands'),
        fetch('/api/lots'),
        fetch(`/api/offers?buyerKey=${selectedBuyerKey}`),
        fetch('/api/transactions?role=BUYER'),
      ]);

      if (resDemands.ok) {
        const data = await resDemands.json();
        if (data.success && Array.isArray(data.demands)) {
          setDemands(data.demands);
        }
      }

      if (resTxns.ok) {
        const txnData = await resTxns.json();
        if (txnData.success && Array.isArray(txnData.data)) {
          setPurchases(txnData.data);
        }
      }

      if (resLots.ok) {
        const data = await resLots.json();
        if (data.success && Array.isArray(data.data)) {
          // For each lot, check if quality info is populated or augment
          const mappedLots: LotWithQuality[] = data.data.map((l: ProduceLot) => {
            const hasPhys = l.physicalVerifications && l.physicalVerifications.length > 0;
            const latestPhys = hasPhys ? l.physicalVerifications![0] : null;
            const hasAi = l.aiAssessments && l.aiAssessments.length > 0;
            const latestAi = hasAi ? l.aiAssessments![0] : null;

            return {
              ...l,
              isPhysicallyVerified: latestPhys?.status === 'PHYSICALLY_VERIFIED',
              qualityStatus: latestPhys?.status === 'PHYSICALLY_VERIFIED'
                ? 'PHYSICALLY_VERIFIED'
                : latestAi
                ? 'AI_ASSESSMENT_NOT_VERIFIED'
                : 'NOT_GRADED',
              officialGrade: latestPhys?.officialGrade || l.expectedGrade,
              certificateNumber: latestPhys?.certificateNumber || undefined,
            };
          });
          setLots(mappedLots);
        }
      }

      if (resOffers.ok) {
        const data = await resOffers.json();
        if (data.success && Array.isArray(data.offers)) {
          setOffers(data.offers);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to load buyer portal data:', err);
      setError(err instanceof Error ? err.message : 'Error loading procurement data');
    } finally {
      setLoading(false);
    }
  }, [selectedBuyerKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update defaults when active buyer changes
  const handleSwitchBuyer = (key: DemoBuyerKey) => {
    setSelectedBuyerKey(key);
    const buyer = DEMO_BUYERS.find((b) => b.key === key) || DEMO_BUYERS[0];
    setDemandForm((prev) => ({
      ...prev,
      commodity: buyer.defaultCommodity,
      destinationDistrict: buyer.district,
      deliveryLocation: buyer.defaultDelivery,
    }));
  };

  // Submit New Demand Handler
  const handleCreateDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemandErrors({});
    setDemandSuccess(null);

    const price = parseFloat(demandForm.targetPricePerQtl);
    const qty = parseFloat(demandForm.requiredQuantityQtl);
    const minP = demandForm.minPricePerQtl ? parseFloat(demandForm.minPricePerQtl) : undefined;
    const maxP = demandForm.maxPricePerQtl ? parseFloat(demandForm.maxPricePerQtl) : undefined;

    if (!demandForm.commodity.trim()) {
      setDemandErrors((prev) => ({ ...prev, commodity: 'Commodity is required' }));
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setDemandErrors((prev) => ({ ...prev, requiredQuantityQtl: 'Valid quantity required (> 0)' }));
      return;
    }
    if (isNaN(price) || price <= 0) {
      setDemandErrors((prev) => ({ ...prev, targetPricePerQtl: 'Valid target price required (> 0)' }));
      return;
    }

    try {
      setDemandSubmitting(true);
      const res = await fetch('/api/buyer-demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerKey: selectedBuyerKey,
          commodity: demandForm.commodity.trim(),
          variety: demandForm.variety.trim() || undefined,
          requiredQuantityQtl: qty,
          unit: demandForm.unit,
          targetPricePerQtl: price,
          minPricePerQtl: minP,
          maxPricePerQtl: maxP,
          destinationDistrict: demandForm.destinationDistrict,
          deliveryLocation: demandForm.deliveryLocation.trim(),
          deliveryDeadline: demandForm.deliveryDeadline ? new Date(demandForm.deliveryDeadline).toISOString() : undefined,
          requiredGrade: demandForm.requiredGrade,
          qualityRequirements: demandForm.qualityRequirements.trim() || undefined,
          description: demandForm.description.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to post demand.');
      }

      setDemandSuccess(t.buyerMatching.demandCreatedSuccess);
      await loadData();
      setTimeout(() => {
        setActiveTab('demands');
        setDemandSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      setDemandErrors((prev) => ({
        ...prev,
        general: err instanceof Error ? err.message : 'Error posting demand',
      }));
    } finally {
      setDemandSubmitting(false);
    }
  };

  // Open Make Offer Modal for a Lot
  const openMakeOffer = (lot: LotWithQuality) => {
    setTargetLot(lot);
    setOfferError(null);
    setOfferSuccess(null);
    setOfferForm({
      offeredPricePerQtl: String(lot.expectedPricePerQuintal || lot.expectedPrice),
      quantityQuintals: String(lot.quantityQuintals || lot.quantity),
      proposedPickupDate: lot.readyForPickupDate
        ? new Date(lot.readyForPickupDate).toISOString().split('T')[0]
        : '',
      deliveryTerms: 'Farm-gate pickup arranged by buyer',
      paymentTerms: 'Bank escrow release within 24h of physical receipt',
      notes: `Binding offer from ${activeBuyer.companyName}. Subject to official quality inspection.`,
      validityDays: 7,
    });
    setIsMakeOfferOpen(true);
  };

  // Submit Make Offer Handler
  const handleDispatchOffer = async () => {
    if (!targetLot) return;
    try {
      setOfferSubmitting(true);
      setOfferError(null);
      setOfferSuccess(null);

      const price = parseFloat(offerForm.offeredPricePerQtl);
      const qty = parseFloat(offerForm.quantityQuintals);
      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid offered price (> 0).');
      }
      if (isNaN(qty) || qty <= 0) {
        throw new Error('Please enter a valid offered quantity (> 0).');
      }

      const res = await fetch(`/api/lots/${encodeURIComponent(targetLot.id)}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoBuyerKey: selectedBuyerKey,
          offeredPricePerQtl: price,
          quantityQuintals: qty,
          proposedPickupDate: offerForm.proposedPickupDate || undefined,
          deliveryTerms: offerForm.deliveryTerms,
          paymentTerms: offerForm.paymentTerms,
          notes: offerForm.notes,
          validityDays: offerForm.validityDays,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch offer.');
      }

      setOfferSuccess(t.buyerMatching.offerCreatedSuccess);
      await loadData();
      setTimeout(() => {
        setIsMakeOfferOpen(false);
        setActiveTab('my_offers');
      }, 1500);
    } catch (err: unknown) {
      setOfferError(err instanceof Error ? err.message : 'Error submitting offer.');
    } finally {
      setOfferSubmitting(false);
    }
  };

  // Cancel Pending Offer Handler
  const handleCancelOffer = async (offerId: string) => {
    if (!confirm(t.buyerMatching.confirmCancel)) return;
    try {
      setCancellingOfferId(offerId);
      const res = await fetch(`/api/offers/${encodeURIComponent(offerId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          role: 'BUYER',
          callerId: activeBuyer.key,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel offer.');
      }
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error cancelling offer');
    } finally {
      setCancellingOfferId(null);
    }
  };

  // Filter lots based on selected demand or general criteria
  const activeDemandsList = demands.filter((d) => d.status === 'ACTIVE');
  const filteredLots = lots.filter((lot) => {
    if (selectedDemandFilter === 'ALL') return true;
    const matchedDemand = demands.find((d) => d.id === selectedDemandFilter);
    if (!matchedDemand) return true;
    return (
      lot.commodity.toLowerCase().includes(matchedDemand.commodity.toLowerCase()) ||
      matchedDemand.commodity.toLowerCase().includes(lot.commodity.toLowerCase())
    );
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="amber">Buyer Procurement</Badge>
            <span className="text-xs text-gray-500 font-mono font-bold">PROCUREMENT HUB</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-amber-600 ml-2" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Store className="w-8 h-8 text-amber-700 shrink-0" />
            <span>{t.buyerMatching.hubTitle}</span>
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm max-w-3xl">
            {t.buyerMatching.hubSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setActiveTab('create_demand')}
            className="gap-2 text-xs shadow-sm bg-amber-700 hover:bg-amber-800 text-white"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.buyerMatching.tabCreateDemand}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEMO BUYER SWITCHER & PROFILE CARD */}
      {/* ========================================================================= */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 shadow-sm">
        <CardHeader className="pb-3 border-b border-amber-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                {t.buyerMatching.activeBuyerProfile}
              </span>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <h2 className="text-xl font-black text-gray-900">{activeBuyer.companyName}</h2>
                {activeBuyer.verified ? (
                  <Badge variant="emerald" className="gap-1 text-xs py-0.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t.buyerMatching.verifiedCredentials}</span>
                  </Badge>
                ) : (
                  <Badge variant="amber" className="gap-1 text-xs py-0.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t.buyerMatching.unverifiedCredentials}</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Representative: <strong>{activeBuyer.name}</strong> • {activeBuyer.buyerType} • {activeBuyer.location}
              </p>
            </div>

            {/* Enterprise Switcher Dropdown */}
            <div className="flex items-center gap-2 shrink-0 bg-white p-2 rounded-2xl border border-amber-200 shadow-sm">
              <Building2 className="w-4 h-4 text-amber-700 shrink-0 ml-1" />
              <label htmlFor="buyer-select" className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                {t.buyerMatching.switchBuyer}:
              </label>
              <select
                id="buyer-select"
                value={selectedBuyerKey}
                onChange={(e) => handleSwitchBuyer(e.target.value as DemoBuyerKey)}
                className="text-xs font-bold text-gray-900 bg-transparent border-0 focus:ring-0 cursor-pointer"
              >
                {DEMO_BUYERS.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.companyName.replace(' [Prototype Demo]', '')} ({b.district})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Column 1: Credential Verification (Govt/Tax/APMC) */}
            <div className="bg-white/80 p-3 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Credential & Identity Verification</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">MSAMB / APMC</span>
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                {activeBuyer.verified
                  ? t.buyerMatching.credentialDetails
                  : 'Prototype testing entity with unverified documentation.'}
              </p>
              <div className="pt-1 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-400 block">GSTIN:</span>
                  <span className="font-mono font-bold text-gray-800">{activeBuyer.gstin}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Trade License:</span>
                  <span className="font-mono font-bold text-gray-800">{activeBuyer.tradeLicense}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Commercial Trade Performance (Separate Reputation!) */}
            <div className="bg-white/80 p-3 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-sky-700" />
                  <span>{t.buyerMatching.reputationMetrics}</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">COMMERCIAL AUDIT</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-gray-50 p-2 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                    {t.buyerMatching.rating}
                  </span>
                  <span className="font-black text-sm text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {activeBuyer.reputation.ratingScore}
                  </span>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                    {t.buyerMatching.tradesCompleted}
                  </span>
                  <span className="font-black text-sm text-gray-900 mt-0.5 block">
                    {activeBuyer.reputation.completedTradesCount}
                  </span>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                    {t.buyerMatching.paymentPunctualityScore}
                  </span>
                  <span className="font-black text-sm text-emerald-700 mt-0.5 block">
                    {activeBuyer.reputation.paymentPunctualityPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 text-sm">
        <button
          onClick={() => setActiveTab('demands')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'demands'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{t.buyerMatching.tabActiveDemands}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'demands' ? 'bg-amber-800 text-amber-100' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {demands.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('create_demand')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'create_demand'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.buyerMatching.tabCreateDemand}</span>
        </button>

        <button
          onClick={() => setActiveTab('browse_lots')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'browse_lots'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.buyerMatching.tabBrowseLots}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'browse_lots' ? 'bg-amber-800 text-amber-100' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {lots.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('my_offers')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'my_offers'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{t.buyerMatching.tabMyOffers}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'my_offers' ? 'bg-amber-800 text-amber-100' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {offers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'purchases'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t.transactions.myTransactionsTitle}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'purchases' ? 'bg-amber-800 text-amber-100' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {purchases.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE DEMANDS LIST */}
      {/* ========================================================================= */}
      {activeTab === 'demands' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t.buyerMatching.demandsCount}: {demands.length}
              </h2>
              <p className="text-xs text-gray-600">
                Open crop procurement requirements published across Maharashtra mandis.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('create_demand')}
              className="gap-1.5 text-xs self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.buyerMatching.tabCreateDemand}</span>
            </Button>
          </div>

          {demands.length === 0 ? (
            <Card className="border-dashed border-gray-300 bg-gray-50/50">
              <CardContent className="py-12 text-center space-y-3">
                <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-700">
                    {t.buyerMatching.noActiveDemands}
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Post your first crop demand to automatically match with certified produce lots across Maharashtra.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('create_demand')}
                  className="gap-2 text-xs bg-amber-700 hover:bg-amber-800 text-white mt-2"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{t.buyerMatching.tabCreateDemand}</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demands.map((demand) => (
                <Card
                  key={demand.id}
                  className="shadow-sm hover:shadow-md transition-all border border-gray-200 flex flex-col justify-between"
                >
                  <div>
                    <CardHeader className="pb-3 border-b border-gray-100 bg-amber-50/20">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-base">
                              {demand.commodity}
                            </span>
                            {demand.variety && (
                              <span className="text-xs text-gray-500 font-medium">
                                ({demand.variety})
                              </span>
                            )}
                            <Badge
                              variant={demand.status === 'ACTIVE' ? 'emerald' : 'gray'}
                              className="text-[10px] font-bold px-2 py-0.5"
                            >
                              {demand.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500 block mt-0.5">
                            Buyer: <strong>{demand.companyName}</strong>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 block uppercase font-bold">
                            Target Price
                          </span>
                          <span className="text-base font-black text-emerald-950">
                            ₹{demand.targetPricePerQtl}/Qtl
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 pb-3 space-y-2.5 text-xs text-gray-700">
                      <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <div>
                          <span className="text-gray-500 block text-[11px]">{t.buyerMatching.quantityLabel}:</span>
                          <strong className="text-gray-900 font-bold text-sm">
                            {demand.requiredQuantityQtl} {demand.unit || 'Quintals'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">{t.buyerMatching.requiredGradeLabel}:</span>
                          <strong className="text-gray-900 font-bold text-sm">
                            {demand.requiredGrade || 'Any Grade'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">{t.buyerMatching.priceRange}:</span>
                          <span className="font-semibold text-gray-800">
                            ₹{demand.minPricePerQtl || demand.targetPricePerQtl} - ₹
                            {demand.maxPricePerQtl || demand.targetPricePerQtl}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">{t.buyerMatching.deadline}:</span>
                          <span className="font-semibold text-gray-800">
                            {demand.deliveryDeadline
                              ? new Date(demand.deliveryDeadline).toLocaleDateString()
                              : 'Open'}
                          </span>
                        </div>
                      </div>

                      {demand.deliveryLocation && (
                        <div className="flex items-start gap-1.5 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <span>Destination: {demand.deliveryLocation}</span>
                        </div>
                      )}

                      {demand.description && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          {demand.description}
                        </p>
                      )}
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setSelectedDemandFilter(demand.id);
                        setActiveTab('browse_lots');
                      }}
                      className="gap-2 text-xs"
                    >
                      <Package className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t.buyerMatching.viewMatchesBtn}</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POST NEW DEMAND FORM */}
      {/* ========================================================================= */}
      {activeTab === 'create_demand' && (
        <Card className="max-w-3xl mx-auto shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Badge variant="amber">Post Procurement Demand</Badge>
              <span className="text-xs text-gray-500 font-mono">BUYER: {activeBuyer.companyName}</span>
            </div>
            <CardTitle className="text-xl text-gray-900 mt-1">
              {t.buyerMatching.createDemandTitle}
            </CardTitle>
            <CardDescription>{t.buyerMatching.createDemandSubtitle}</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleCreateDemand} className="space-y-5">
              {demandSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                  <span className="text-sm font-semibold">{demandSuccess}</span>
                </div>
              )}

              {demandErrors.general && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-sm font-semibold">{demandErrors.general}</span>
                </div>
              )}

              {/* Crop and Variety */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.commodityLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={demandForm.commodity}
                    onChange={(e) => setDemandForm({ ...demandForm, commodity: e.target.value })}
                    placeholder={t.buyerMatching.commodityPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                  {demandErrors.commodity && (
                    <p className="text-xs text-rose-600">{demandErrors.commodity}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">Variety / Type</label>
                  <input
                    type="text"
                    value={demandForm.variety}
                    onChange={(e) => setDemandForm({ ...demandForm, variety: e.target.value })}
                    placeholder="e.g. Nashik Red / Garva / Standard"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.quantityLabel} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={demandForm.requiredQuantityQtl}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, requiredQuantityQtl: e.target.value })
                    }
                    placeholder="e.g. 100"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                  {demandErrors.requiredQuantityQtl && (
                    <p className="text-xs text-rose-600">{demandErrors.requiredQuantityQtl}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.unitLabel}
                  </label>
                  <select
                    value={demandForm.unit}
                    onChange={(e) => setDemandForm({ ...demandForm, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white"
                  >
                    <option value="Quintal">Quintal (100 Kg)</option>
                    <option value="Tonnes">Tonnes (1000 Kg)</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>

              {/* Pricing Range */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    Target Price (₹/Qtl) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={demandForm.targetPricePerQtl}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, targetPricePerQtl: e.target.value })
                    }
                    placeholder="e.g. 2400"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                  {demandErrors.targetPricePerQtl && (
                    <p className="text-xs text-rose-600">{demandErrors.targetPricePerQtl}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.minPriceLabel}
                  </label>
                  <input
                    type="number"
                    value={demandForm.minPricePerQtl}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, minPricePerQtl: e.target.value })
                    }
                    placeholder="e.g. 2100"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.maxPriceLabel}
                  </label>
                  <input
                    type="number"
                    value={demandForm.maxPricePerQtl}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, maxPricePerQtl: e.target.value })
                    }
                    placeholder="e.g. 2600"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>

              {/* Grade and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.requiredGradeLabel}
                  </label>
                  <select
                    value={demandForm.requiredGrade}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, requiredGrade: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white"
                  >
                    <option value="Grade A">Grade A (Premium / Export Quality)</option>
                    <option value="Grade B">Grade B (Standard Market Quality)</option>
                    <option value="Grade C">Grade C (Fair Average Quality - FAQ)</option>
                    <option value="Any">Any Grade (Open Specification)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.locationLabel}
                  </label>
                  <select
                    value={demandForm.destinationDistrict}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, destinationDistrict: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white"
                  >
                    <optgroup label="Maharashtra Districts">
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Andhra Pradesh & Vizag Region">
                      {ANDHRA_PRADESH_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Delivery Destination and Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.deliveryLocationLabel}
                  </label>
                  <input
                    type="text"
                    value={demandForm.deliveryLocation}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, deliveryLocation: e.target.value })
                    }
                    placeholder={t.buyerMatching.deliveryLocationPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.deadlineLabel}
                  </label>
                  <input
                    type="date"
                    value={demandForm.deliveryDeadline}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, deliveryDeadline: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>

              {/* Description & Requirements */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">
                  {t.buyerMatching.descriptionLabel}
                </label>
                <textarea
                  rows={2}
                  value={demandForm.description}
                  onChange={(e) => setDemandForm({ ...demandForm, description: e.target.value })}
                  placeholder={t.buyerMatching.descriptionPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('demands')}
                >
                  {t.lots.cancelBtn}
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={demandSubmitting}
                  className="gap-2 bg-amber-700 hover:bg-amber-800 text-white"
                >
                  {demandSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  <span>
                    {demandSubmitting
                      ? t.buyerMatching.submittingDemand
                      : t.buyerMatching.submitDemandBtn}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BROWSE MATCHING LOTS */}
      {/* ========================================================================= */}
      {activeTab === 'browse_lots' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t.buyerMatching.browseLotsTitle}
              </h2>
              <p className="text-xs text-gray-600">
                {t.buyerMatching.browseLotsSubtitle}
              </p>
            </div>

            {/* Filter by demand */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedDemandFilter}
                onChange={(e) => setSelectedDemandFilter(e.target.value)}
                className="text-xs font-semibold text-gray-800 px-3 py-1.5 rounded-xl border border-gray-300 bg-white"
              >
                <option value="ALL">{t.buyerMatching.allDemands}</option>
                {activeDemandsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    Demand: {d.commodity} ({d.requiredQuantityQtl} Qtl @ ₹{d.targetPricePerQtl})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredLots.length === 0 ? (
            <Card className="border-dashed border-gray-300 bg-gray-50/50">
              <CardContent className="py-12 text-center space-y-3">
                <Package className="w-10 h-10 text-gray-300 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-700">
                    {t.buyerMatching.noMatchingLots}
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Try selecting &quot;All Active Demands&quot; or post a new procurement requirement.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLots.map((lot) => {
                const isReserved = lot.status === 'RESERVED';
                const isSold = lot.status === 'SOLD';

                return (
                  <Card
                    key={lot.id}
                    className="shadow-sm hover:shadow-md transition-all border border-gray-200 flex flex-col justify-between"
                  >
                    <div>
                      <CardHeader className="pb-3 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-gray-500 font-bold">
                                {lot.lotCode}
                              </span>
                              {isReserved && (
                                <Badge variant="blue" className="text-[10px] py-0.5">
                                  RESERVED
                                </Badge>
                              )}
                              {isSold && (
                                <Badge variant="purple" className="text-[10px] py-0.5">
                                  SOLD
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mt-1">
                              {lot.commodity}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {lot.variety || 'Standard Local'} • {lot.locationDistrict}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Ask Price
                            </span>
                            <span className="text-base font-black text-emerald-900">
                              ₹{lot.expectedPricePerQuintal || lot.expectedPrice}/Qtl
                            </span>
                          </div>
                        </div>

                        {/* Two-Tier Quality Status Badges */}
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          {lot.isPhysicallyVerified ? (
                            <div className="flex items-center justify-between text-[11px] bg-emerald-50 text-emerald-900 p-2 rounded-xl border border-emerald-200">
                              <span className="font-bold flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Physically Verified ({lot.officialGrade})</span>
                              </span>
                              <span className="font-mono text-[10px] font-semibold text-emerald-800">
                                {lot.certificateNumber || 'CERT-VERIFIED'}
                              </span>
                            </div>
                          ) : lot.qualityStatus === 'AI_ASSESSMENT_NOT_VERIFIED' ? (
                            <div className="flex items-center justify-between text-[11px] bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200">
                              <span className="font-bold flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5 text-amber-700" />
                                <span>AI Assessment — Not Verified</span>
                              </span>
                              <span className="text-[10px] text-amber-700 font-medium">Visual Screening</span>
                            </div>
                          ) : (
                            <div className="text-[11px] bg-gray-50 text-gray-500 p-1.5 rounded-lg text-center">
                              Quality Inspection Pending
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="pt-3 pb-3 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-xl text-gray-700">
                          <div>
                            <span className="text-gray-400 block text-[10px]">Quantity:</span>
                            <strong className="text-gray-900 font-bold">
                              {lot.quantity} {lot.unit} ({lot.quantityQuintals} Qtl)
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">Expected Grade:</span>
                            <strong className="text-gray-900 font-bold">
                              {lot.expectedGrade}
                            </strong>
                          </div>
                        </div>

                        {lot.location && (
                          <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{lot.location}, {lot.locationDistrict}</span>
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <div className="p-4 pt-0 flex items-center gap-2">
                      <Link href={`/lots/${lot.id}`} className="flex-1">
                        <Button variant="outline" size="sm" fullWidth className="text-xs">
                          {t.lots.viewDetails}
                        </Button>
                      </Link>

                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isReserved || isSold}
                        onClick={() => openMakeOffer(lot)}
                        className="gap-1.5 text-xs bg-amber-700 hover:bg-amber-800 text-white flex-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>{t.buyerMatching.makeOfferBtn}</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MY OFFERS SENT */}
      {/* ========================================================================= */}
      {activeTab === 'my_offers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t.buyerMatching.myOffersTitle}
              </h2>
              <p className="text-xs text-gray-600">
                {t.buyerMatching.myOffersSubtitle} (Sent as {activeBuyer.companyName})
              </p>
            </div>

            <Badge variant="amber" className="text-xs self-start sm:self-auto">
              {offers.length} Offers Dispatched
            </Badge>
          </div>

          {offers.length === 0 ? (
            <Card className="border-dashed border-gray-300 bg-gray-50/50">
              <CardContent className="py-12 text-center space-y-3">
                <Send className="w-10 h-10 text-gray-300 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-700">
                    {t.buyerMatching.noSentOffers}
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Browse farmer produce lots and dispatch binding digital purchase offers with guaranteed escrow release terms.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('browse_lots')}
                  className="gap-2 text-xs bg-amber-700 hover:bg-amber-800 text-white mt-2"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>{t.buyerMatching.tabBrowseLots}</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => {
                const isPending = offer.status === 'PENDING';
                const isAccepted = offer.status === 'ACCEPTED';
                const isRejected = offer.status === 'REJECTED';

                const statusVariant = isAccepted
                  ? 'emerald'
                  : isPending
                  ? 'amber'
                  : isRejected
                  ? 'red'
                  : 'gray';

                return (
                  <Card
                    key={offer.id}
                    className={`border transition-all ${
                      isAccepted
                        ? 'border-emerald-300 bg-emerald-50/10'
                        : isPending
                        ? 'border-amber-200'
                        : 'border-gray-200'
                    }`}
                  >
                    <CardHeader className="pb-3 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-base">
                              {offer.commodity} ({offer.lotCode})
                            </span>
                            <Badge variant={statusVariant} className="text-[11px] font-bold px-2 py-0.5">
                              {offer.status === 'PENDING'
                                ? t.buyerMatching.statusPending
                                : offer.status === 'ACCEPTED'
                                ? t.buyerMatching.statusAccepted
                                : offer.status === 'REJECTED'
                                ? t.buyerMatching.statusRejected
                                : offer.status === 'CANCELLED'
                                ? t.buyerMatching.statusCancelled
                                : offer.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500 block mt-0.5">
                            District: {offer.lotDistrict || 'Maharashtra'} • Lot Status: {offer.lotStatus}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">
                            Total Offer Value
                          </span>
                          <span className="text-lg font-black text-emerald-950">
                            ₹{offer.totalOfferValue.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 pb-3 space-y-3 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Offered Rate:</span>
                          <strong className="text-emerald-900 font-bold text-sm">
                            ₹{offer.offeredPricePerQtl}/Qtl
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Quantity:</span>
                          <strong className="text-gray-900 font-bold text-sm">
                            {offer.quantityQuintals} Quintals
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Payment Terms:</span>
                          <span className="text-gray-800 font-medium truncate block">
                            {offer.paymentTerms || 'Bank Escrow'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Valid Until:</span>
                          <span className="text-gray-800 font-medium block">
                            {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : '7 Days'}
                          </span>
                        </div>
                      </div>

                      {offer.notes && (
                        <p className="text-xs text-gray-600 bg-amber-50/40 p-2 rounded-lg border border-amber-100">
                          <span className="font-semibold text-gray-900">Notes: </span>
                          {offer.notes}
                        </p>
                      )}

                      {/* Cancel Action if Pending */}
                      <div className="flex items-center justify-between pt-1">
                        <Link
                          href={`/lots/${offer.lotId}`}
                          className="text-xs text-sky-700 hover:text-sky-800 font-semibold flex items-center gap-1"
                        >
                          <span>View Target Lot</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        {isPending && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={cancellingOfferId === offer.id}
                            onClick={() => handleCancelOffer(offer.id)}
                            className="gap-1.5 text-xs border-red-200 text-red-700 hover:bg-red-50"
                          >
                            {cancellingOfferId === offer.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Ban className="w-3.5 h-3.5" />
                            )}
                            <span>{t.buyerMatching.cancelOfferBtn}</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MY PURCHASES & TRANSACTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-700" />
                <span>Commercial Purchases & Contracts: {purchases.length}</span>
              </h2>
              <p className="text-xs text-gray-600">
                Track formal commercial procurement agreements, logistics transit, and milestone payment status.
              </p>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <span>View Transactions Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {purchases.length === 0 ? (
            <Card className="p-12 text-center text-xs text-gray-500 bg-gray-50 border-dashed space-y-2">
              <CreditCard className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm font-bold text-gray-700">No purchase contracts activated yet.</p>
              <p>When a farmer accepts your offer, an official trade transaction is automatically created here.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {purchases.map((txn) => {
                const latestPayment = txn.payments?.[0];
                const activeTransport = txn.lot?.transportRequests?.[0];
                return (
                  <Card key={txn.id} className="hover:border-amber-400 hover:shadow-md transition-all border-gray-200">
                    <CardHeader className="pb-3 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
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
                            <span className="text-xs text-gray-500">
                              • Lot: {txn.lot?.lotCode}
                            </span>
                          </div>
                          <span className="text-base font-black text-gray-900 block mt-1">
                            {txn.lot?.commodity} ({txn.quantityQuintals} Quintals @ ₹{txn.agreedPricePerQuintal.toLocaleString('en-IN')}/Qtl)
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Gross Contract Sum</span>
                          <div className="text-lg font-black text-amber-900">
                            ₹{txn.grossSaleValue.toLocaleString('en-IN')}
                          </div>
                          {latestPayment && (
                            <span className="text-[10px] text-gray-500 font-mono block">
                              Payment: <strong>{latestPayment.paymentStatus}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 text-xs space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-700 bg-gray-50/70 p-2.5 rounded-xl">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Seller Farmer / FPO</span>
                          <strong>{txn.farmer?.user?.fullName || 'Producer'}</strong>
                          <span className="text-gray-500 text-[10px] block">{txn.farmer?.district}, Maharashtra</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Delivery Destination</span>
                          <strong>{activeTransport?.dropLocation || txn.lot?.location || 'Buyer Facility'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Logistics Status</span>
                          <strong className="text-purple-800 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-purple-600" />
                            <span>{activeTransport ? activeTransport.status : 'Pending Dispatch Booking'}</span>
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-gray-500">
                          Executed on {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <Link href={`/transactions/${txn.id}`}>
                          <Button size="sm" variant="primary" className="text-xs gap-1.5 shadow-xs bg-amber-800 hover:bg-amber-900">
                            <span>{t.transactions.viewTransactionBtn}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAKE OFFER MODAL */}
      {/* ========================================================================= */}
      {isMakeOfferOpen && targetLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-8">
            <div className="px-6 py-5 bg-gradient-to-r from-amber-800 to-amber-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="amber" className="text-[10px] uppercase font-bold">
                    BINDING DIGITAL OFFER
                  </Badge>
                  <span className="text-xs font-mono text-amber-200">{targetLot.lotCode}</span>
                </div>
                <h2 className="text-xl font-bold mt-1">{t.buyerMatching.makeOfferTitle}</h2>
                <p className="text-xs text-amber-100">
                  Submitting as: <strong>{activeBuyer.companyName}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsMakeOfferOpen(false)}
                className="p-2 rounded-full hover:bg-amber-700 text-amber-100 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {offerSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                  <span className="text-sm font-semibold">{offerSuccess}</span>
                </div>
              )}

              {offerError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-sm font-semibold">{offerError}</span>
                </div>
              )}

              {/* Price and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.offerPriceLabel} *
                  </label>
                  <input
                    type="number"
                    value={offerForm.offeredPricePerQtl}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, offeredPricePerQtl: e.target.value })
                    }
                    placeholder="e.g. 2400"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                  <span className="text-[11px] text-gray-500">
                    Farmer Ask: ₹{targetLot.expectedPricePerQuintal || targetLot.expectedPrice}/Qtl
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">
                    {t.buyerMatching.offerQtyLabel} *
                  </label>
                  <input
                    type="number"
                    value={offerForm.quantityQuintals}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, quantityQuintals: e.target.value })
                    }
                    placeholder="e.g. 100"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                  <span className="text-[11px] text-gray-500">
                    Available: {targetLot.quantityQuintals || targetLot.quantity} Quintals
                  </span>
                </div>
              </div>

              {/* Dynamic Value Calculation */}
              {parseFloat(offerForm.offeredPricePerQtl) > 0 &&
                parseFloat(offerForm.quantityQuintals) > 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-800 uppercase tracking-wider text-[11px]">
                      {t.buyerMatching.totalOfferValue}
                    </span>
                    <strong className="text-base font-black text-amber-950">
                      ₹
                      {(
                        parseFloat(offerForm.offeredPricePerQtl) *
                        parseFloat(offerForm.quantityQuintals)
                      ).toLocaleString('en-IN')}
                    </strong>
                  </div>
                )}

              {/* Delivery Terms */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">
                  {t.buyerMatching.deliveryTermsLabel}
                </label>
                <input
                  type="text"
                  value={offerForm.deliveryTerms}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, deliveryTerms: e.target.value })
                  }
                  placeholder={t.buyerMatching.deliveryTermsPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              {/* Payment Terms */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">
                  {t.buyerMatching.paymentTermsLabel}
                </label>
                <input
                  type="text"
                  value={offerForm.paymentTerms}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, paymentTerms: e.target.value })
                  }
                  placeholder={t.buyerMatching.paymentTermsPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              {/* Proposed Pickup and Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">Proposed Pickup Date</label>
                  <input
                    type="date"
                    value={offerForm.proposedPickupDate}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, proposedPickupDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-900">Validity (Days)</label>
                  <select
                    value={offerForm.validityDays}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, validityDays: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white"
                  >
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days (Standard)</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-900">
                  {t.buyerMatching.offerNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={offerForm.notes}
                  onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                  placeholder={t.buyerMatching.offerNotesPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                <span className="font-semibold block">{t.buyerMatching.offerPendingNotice}</span>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsMakeOfferOpen(false)}
                disabled={offerSubmitting}
              >
                {t.lots.cancelBtn}
              </Button>

              <Button
                variant="primary"
                onClick={handleDispatchOffer}
                disabled={offerSubmitting}
                className="gap-2 bg-amber-700 hover:bg-amber-800 text-white"
              >
                {offerSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {offerSubmitting
                    ? t.buyerMatching.submittingOffer
                    : t.buyerMatching.submitOfferBtn}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TRUST & TRANSPARENCY ARCHITECTURE NOTICE */}
      {/* ========================================================================= */}
      <Card className="border-gray-200 bg-gray-50/70">
        <CardContent className="p-5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{t.buyerMatching.trustNoticeTitle}</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {t.buyerMatching.trustNoticeDesc}
          </p>
          <p className="text-amber-800 font-medium text-[11px] pt-1">
            {t.buyerMatching.demoNotice}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BuyerPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 text-amber-700 animate-spin mx-auto" />
        </div>
      }
    >
      <BuyerPortalContent />
    </Suspense>
  );
}
