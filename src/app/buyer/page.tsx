'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { ReputationCluster } from '@/components/ui/ReputationCluster';
import { MAHARASHTRA_DISTRICTS, ANDHRA_PRADESH_DISTRICTS, KEY_CROPS } from '@/lib/constants';
import { formatINR } from '@/lib/utils';
import {
  Store,
  ShoppingCart,
  ShieldCheck,
  Building2,
  PlusCircle,
  Package,
  Send,
  MapPin,
  X,
  Loader2,
  Filter,
  ArrowRight,
  Ban,
  CreditCard,
  Truck,
  Scale,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ProduceLot, DemandMatchResult } from '@/types';

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
  reputation?: {
    ratingScore: number;
    completedTradesCount: number;
    paymentPunctualityPercent: number;
    reliabilityScore: number;
  };
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

  // Active Tab: 'demands' | 'create_demand' | 'browse_lots' | 'my_offers' | 'purchases'
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
  const [lotMatchesMap, setLotMatchesMap] = useState<Record<string, DemandMatchResult[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demands Filter Controls (Tab 1)
  const [demandSearchQuery, setDemandSearchQuery] = useState('');
  const [demandCropFilter, setDemandCropFilter] = useState('ALL');
  const [demandDistrictFilter, setDemandDistrictFilter] = useState('ALL');

  // Demand Filter in Browse Lots (Tab 3)
  const [selectedDemandFilter, setSelectedDemandFilter] = useState<string>('ALL');

  // Create Demand Form State (Tab 2)
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
    paymentTerms: 'Payment tracking upon weighbridge delivery and physical inspection',
    notes: 'Digital purchase offer subject to official quality inspection.',
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

      let loadedLots: LotWithQuality[] = [];
      if (resLots.ok) {
        const data = await resLots.json();
        if (data.success && Array.isArray(data.data)) {
          loadedLots = data.data.map((l: ProduceLot) => {
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
          setLots(loadedLots);
        }
      }

      if (resOffers.ok) {
        const data = await resOffers.json();
        if (data.success && Array.isArray(data.offers)) {
          setOffers(data.offers);
        }
      }

      // Fetch matches from existing matching engine for loaded lots
      if (loadedLots.length > 0) {
        const matchPromises = loadedLots.map(async (lot) => {
          try {
            const res = await fetch(`/api/lots/${encodeURIComponent(lot.id)}/matches`);
            if (res.ok) {
              const matchData = await res.json();
              if (matchData.success && Array.isArray(matchData.matches)) {
                return { lotId: lot.id, matches: matchData.matches as DemandMatchResult[] };
              }
            }
          } catch {
            // Non-blocking for individual lot matches
          }
          return { lotId: lot.id, matches: [] };
        });

        const results = await Promise.all(matchPromises);
        const map: Record<string, DemandMatchResult[]> = {};
        results.forEach((r) => {
          map[r.lotId] = r.matches;
        });
        setLotMatchesMap(map);
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
      paymentTerms: 'Payment tracking upon weighbridge delivery and physical inspection',
      notes: `Digital offer from ${activeBuyer.companyName}. Subject to official quality inspection.`,
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

  // Filtered Demands for Tab 1
  const filteredDemands = useMemo(() => {
    return demands.filter((d) => {
      if (demandCropFilter !== 'ALL' && !d.commodity.toLowerCase().includes(demandCropFilter.toLowerCase())) {
        return false;
      }
      if (demandDistrictFilter !== 'ALL' && d.destinationDistrict !== demandDistrictFilter) {
        return false;
      }
      if (demandSearchQuery.trim()) {
        const q = demandSearchQuery.toLowerCase();
        const matchesName = d.companyName.toLowerCase().includes(q);
        const matchesCrop = d.commodity.toLowerCase().includes(q);
        const matchesDistrict = d.destinationDistrict.toLowerCase().includes(q);
        if (!matchesName && !matchesCrop && !matchesDistrict) return false;
      }
      return true;
    });
  }, [demands, demandCropFilter, demandDistrictFilter, demandSearchQuery]);

  // Active Demands List for Tab 3 filter
  const activeDemandsList = demands.filter((d) => d.status === 'ACTIVE');

  // Filtered Lots for Tab 3 (Matching Lots)
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      if (selectedDemandFilter === 'ALL') return true;
      const matchedDemand = demands.find((d) => d.id === selectedDemandFilter);
      if (!matchedDemand) return true;
      return (
        lot.commodity.toLowerCase().includes(matchedDemand.commodity.toLowerCase()) ||
        matchedDemand.commodity.toLowerCase().includes(lot.commodity.toLowerCase())
      );
    });
  }, [lots, selectedDemandFilter, demands]);

  return (
    <PageContainer className="py-6 sm:py-8 space-y-6">
      {/* Header */}
      <PageHeader
        title={t.buyerMatching.hubTitle}
        description={t.buyerMatching.hubSubtitle}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="amber">{t.buyerMatching.buyerMarketplace}</Badge>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1B4332]" />}
          </div>
        }
        action={
          <Button
            variant="primary"
            onClick={() => setActiveTab('create_demand')}
            className="gap-2 text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-none"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.buyerMatching.tabCreateDemand}</span>
          </Button>
        }
      />

      {error && (
        <div className="p-4 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEMO BUYER SWITCHER & PROFILE CARD */}
      {/* ========================================================================= */}
      <Card className="border-[#D8D2C4] bg-[#F4F1EA] shadow-none">
        <CardHeader className="pb-3 border-b border-[#D8D2C4]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wider block font-heading">
                {t.buyerMatching.activeBuyerProfile}
              </span>
              <div className="flex items-center gap-2.5 flex-wrap mt-1">
                <h2 className="text-xl font-heading font-black text-[#262320]">
                  {activeBuyer.companyName}
                </h2>
                {activeBuyer.verified ? (
                  <VerificationBadge type="identity" customLabel={t.buyerMatching.verifiedCredentials} />
                ) : (
                  <VerificationBadge type="provisional" customLabel={t.buyerMatching.unverifiedCredentials} />
                )}
              </div>
              <p className="text-xs text-[#5A554E] mt-1 font-body">
                Representative: <strong>{activeBuyer.name}</strong> • {activeBuyer.buyerType} • {activeBuyer.location}
              </p>
            </div>

            {/* Enterprise Switcher Dropdown */}
            <div className="flex items-center gap-2 shrink-0 bg-white p-2 rounded-[6px] border border-[#D8D2C4]">
              <Building2 className="w-4 h-4 text-[#1B4332] shrink-0 ml-1" />
              <label htmlFor="buyer-select" className="text-xs font-semibold text-[#262320] whitespace-nowrap">
                {t.buyerMatching.switchBuyer}:
              </label>
              <select
                id="buyer-select"
                value={selectedBuyerKey}
                onChange={(e) => handleSwitchBuyer(e.target.value as DemoBuyerKey)}
                className="text-xs font-bold text-[#1B4332] bg-transparent border-0 focus:ring-0 cursor-pointer"
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
            <div className="bg-white p-3.5 rounded-[6px] border border-[#D8D2C4] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#262320] text-xs flex items-center gap-1.5 font-heading">
                  <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                  <span>Credential & License Verification</span>
                </span>
                <span className="text-[10px] text-[#5A554E] font-mono">MSAMB / APMC</span>
              </div>
              <p className="text-[#5A554E] text-[11px] leading-relaxed">
                {activeBuyer.verified
                  ? t.buyerMatching.credentialDetails
                  : 'Prototype testing entity with unverified documentation.'}
              </p>
              <div className="pt-1 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#5A554E] block">GSTIN:</span>
                  <span className="font-mono font-bold text-[#262320]">{activeBuyer.gstin}</span>
                </div>
                <div>
                  <span className="text-[#5A554E] block">Trade License:</span>
                  <span className="font-mono font-bold text-[#262320]">{activeBuyer.tradeLicense}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Commercial Trade Performance (Separate Reputation!) */}
            <div className="bg-white p-3.5 rounded-[6px] border border-[#D8D2C4] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#262320] text-xs flex items-center gap-1.5 font-heading">
                  <Store className="w-4 h-4 text-[#B45309]" />
                  <span>{t.buyerMatching.reputationMetrics}</span>
                </span>
                <span className="text-[10px] text-[#5A554E] font-mono">{t.buyerMatching.tradeAudit}</span>
              </div>
              <div className="pt-1">
                <ReputationCluster
                  ratingScore={activeBuyer.reputation.ratingScore}
                  completedDealsCount={activeBuyer.reputation.completedTradesCount}
                  onTimeDeliveryPercent={activeBuyer.reputation.paymentPunctualityPercent}
                />
              </div>
              <p className="text-[#5A554E] text-[11px] leading-relaxed pt-1">
                Performance metrics track on-time order acceptance, weighbridge reconciliation, and payment execution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 border-b border-[#D8D2C4] overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('demands')}
          className={`px-3.5 py-2.5 rounded-[4px] font-bold flex items-center gap-2 transition-all shrink-0 min-h-[44px] ${
            activeTab === 'demands'
              ? 'bg-[#1B4332] text-white'
              : 'text-[#262320] bg-white border border-[#D8D2C4] hover:bg-[#F4F1EA]'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{t.buyerMatching.tabActiveDemands}</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded-[3px] font-mono font-bold ${
              activeTab === 'demands' ? 'bg-[#2D6A4F] text-white' : 'bg-[#EAE6DF] text-[#262320]'
            }`}
          >
            {demands.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create_demand')}
          className={`px-3.5 py-2.5 rounded-[4px] font-bold flex items-center gap-2 transition-all shrink-0 min-h-[44px] ${
            activeTab === 'create_demand'
              ? 'bg-[#1B4332] text-white'
              : 'text-[#262320] bg-white border border-[#D8D2C4] hover:bg-[#F4F1EA]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.buyerMatching.tabCreateDemand}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('browse_lots')}
          className={`px-3.5 py-2.5 rounded-[4px] font-bold flex items-center gap-2 transition-all shrink-0 min-h-[44px] ${
            activeTab === 'browse_lots'
              ? 'bg-[#1B4332] text-white'
              : 'text-[#262320] bg-white border border-[#D8D2C4] hover:bg-[#F4F1EA]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.buyerMatching.tabBrowseLots}</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded-[3px] font-mono font-bold ${
              activeTab === 'browse_lots' ? 'bg-[#2D6A4F] text-white' : 'bg-[#EAE6DF] text-[#262320]'
            }`}
          >
            {lots.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my_offers')}
          className={`px-3.5 py-2.5 rounded-[4px] font-bold flex items-center gap-2 transition-all shrink-0 min-h-[44px] ${
            activeTab === 'my_offers'
              ? 'bg-[#1B4332] text-white'
              : 'text-[#262320] bg-white border border-[#D8D2C4] hover:bg-[#F4F1EA]'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{t.buyerMatching.tabMyOffers}</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded-[3px] font-mono font-bold ${
              activeTab === 'my_offers' ? 'bg-[#2D6A4F] text-white' : 'bg-[#EAE6DF] text-[#262320]'
            }`}
          >
            {offers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('purchases')}
          className={`px-3.5 py-2.5 rounded-[4px] font-bold flex items-center gap-2 transition-all shrink-0 min-h-[44px] ${
            activeTab === 'purchases'
              ? 'bg-[#1B4332] text-white'
              : 'text-[#262320] bg-white border border-[#D8D2C4] hover:bg-[#F4F1EA]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t.transactions.myTransactionsTitle}</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded-[3px] font-mono font-bold ${
              activeTab === 'purchases' ? 'bg-[#2D6A4F] text-white' : 'bg-[#EAE6DF] text-[#262320]'
            }`}
          >
            {purchases.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE DEMANDS LIST / DEMAND DISCOVERY */}
      {/* ========================================================================= */}
      {activeTab === 'demands' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-heading font-black text-[#262320]">
                {t.buyerMatching.demandsCount}: {demands.length}
              </h2>
              <p className="text-xs text-[#5A554E]">
                Open crop procurement requirements published by verified processors and wholesalers across Maharashtra.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('create_demand')}
              className="gap-1.5 text-xs self-start sm:self-auto border-[#D8D2C4]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>{t.buyerMatching.tabCreateDemand}</span>
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="p-3 bg-white rounded-[6px] border border-[#D8D2C4] flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-[#5A554E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={demandSearchQuery}
                onChange={(e) => setDemandSearchQuery(e.target.value)}
                placeholder="Search demands by buyer, crop, or district..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#D8D2C4] rounded-[4px] bg-[#FAFAF8] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select
                value={demandCropFilter}
                onChange={(e) => setDemandCropFilter(e.target.value)}
                className="text-xs min-w-[140px]"
              >
                <option value="ALL">{t.common.allCommodities}</option>
                {KEY_CROPS.map((c) => (
                  <option key={c.id} value={c.nameEn}>
                    {c.icon} {c.nameEn}
                  </option>
                ))}
              </Select>

              <Select
                value={demandDistrictFilter}
                onChange={(e) => setDemandDistrictFilter(e.target.value)}
                className="text-xs min-w-[140px]"
              >
                <option value="ALL">{t.common.allDistricts}</option>
                <optgroup label="Maharashtra">
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </optgroup>
              </Select>

              {(demandCropFilter !== 'ALL' || demandDistrictFilter !== 'ALL' || demandSearchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDemandCropFilter('ALL');
                    setDemandDistrictFilter('ALL');
                    setDemandSearchQuery('');
                  }}
                  className="text-xs text-[#B91C1C] shrink-0"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {filteredDemands.length === 0 ? (
            <Card className="border-dashed border-[#D8D2C4] bg-[#FAFAF8]">
              <CardContent className="py-12 text-center space-y-3">
                <ShoppingCart className="w-10 h-10 text-[#5A554E] mx-auto opacity-50" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#262320]">
                    {t.buyerMatching.noActiveDemands}
                  </p>
                  <p className="text-xs text-[#5A554E] max-w-sm mx-auto">
                    No active buyer demands match the selected criteria. Post a demand to start procurement.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('create_demand')}
                  className="gap-2 text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white mt-2 shadow-none"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{t.buyerMatching.tabCreateDemand}</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDemands.map((demand) => (
                <Card
                  key={demand.id}
                  className="border border-[#D8D2C4] bg-white shadow-none hover:border-[#1B4332] transition-all flex flex-col justify-between"
                >
                  <div>
                    <CardHeader className="pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-black text-base text-[#1B4332]">
                              {demand.commodity}
                            </span>
                            {demand.variety && (
                              <span className="text-xs text-[#5A554E] font-medium">
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
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-[#262320] font-semibold">
                              {demand.companyName}
                            </span>
                            <VerificationBadge
                              type="identity"
                              customLabel={demand.isBuyerVerified ? '✓ Verified' : 'Provisional'}
                            />
                          </div>
                          {demand.reputation && (
                            <div className="mt-1">
                              <ReputationCluster
                                ratingScore={demand.reputation.ratingScore}
                                completedDealsCount={demand.reputation.completedTradesCount}
                                onTimeDeliveryPercent={demand.reputation.paymentPunctualityPercent}
                                size="sm"
                              />
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-[#5A554E] block uppercase font-bold tracking-wider">
                            Target Price
                          </span>
                          <span className="text-base font-heading font-black text-[#1B4332]">
                            ₹{demand.targetPricePerQtl}/Qtl
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 pb-3 space-y-2.5 text-xs text-[#262320]">
                      <div className="grid grid-cols-2 gap-2 bg-[#FAFAF8] p-2.5 rounded-[4px] border border-[#D8D2C4]">
                        <div>
                          <span className="text-[#5A554E] block text-[11px]">{t.buyerMatching.quantityLabel}:</span>
                          <strong className="text-[#262320] font-bold text-sm font-heading">
                            {demand.requiredQuantityQtl} {demand.unit || 'Quintals'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#5A554E] block text-[11px]">{t.buyerMatching.requiredGradeLabel}:</span>
                          <strong className="text-[#262320] font-bold text-sm font-heading">
                            {demand.requiredGrade || 'Any Grade'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#5A554E] block text-[11px]">{t.buyerMatching.priceRange}:</span>
                          <span className="font-semibold text-[#1B4332]">
                            ₹{demand.minPricePerQtl || demand.targetPricePerQtl} - ₹
                            {demand.maxPricePerQtl || demand.targetPricePerQtl}/Qtl
                          </span>
                        </div>
                        <div>
                          <span className="text-[#5A554E] block text-[11px]">{t.buyerMatching.deadline}:</span>
                          <span className="font-semibold text-[#262320]">
                            {demand.deliveryDeadline
                              ? new Date(demand.deliveryDeadline).toLocaleDateString()
                              : 'Open'}
                          </span>
                        </div>
                      </div>

                      {demand.deliveryLocation && (
                        <div className="flex items-start gap-1.5 text-[#5A554E]">
                          <MapPin className="w-3.5 h-3.5 text-[#1B4332] shrink-0 mt-0.5" />
                          <span className="truncate">Destination: {demand.deliveryLocation}</span>
                        </div>
                      )}

                      {demand.description && (
                        <p className="text-xs text-[#5A554E] bg-[#FAFAF8] p-2 rounded-[4px] border border-[#D8D2C4]">
                          {demand.description}
                        </p>
                      )}
                    </CardContent>
                  </div>

                  <div className="p-3 bg-[#FAFAF8] border-t border-[#D8D2C4] flex items-center gap-2">
                    <Link
                      href={`/calculator?price=${demand.targetPricePerQtl}&crop=${encodeURIComponent(demand.commodity)}&quantity=${demand.requiredQuantityQtl}&market=${encodeURIComponent(demand.destinationDistrict)}&distance=50`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        className="gap-1 text-xs border-[#D8D2C4] text-[#1B4332] hover:bg-white"
                      >
                        <Scale className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span>{t.markets.calculateNetRealisation}</span>
                      </Button>
                    </Link>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedDemandFilter(demand.id);
                        setActiveTab('browse_lots');
                      }}
                      className="gap-1.5 text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white flex-1 shadow-none"
                    >
                      <Package className="w-3.5 h-3.5" />
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
        <Card className="max-w-3xl mx-auto shadow-none border border-[#D8D2C4]">
          <CardHeader className="border-b border-[#D8D2C4] pb-4 bg-[#FAFAF8]">
            <div className="flex items-center gap-2">
              <Badge variant="amber">{t.buyerMatching.postProcurementDemand}</Badge>
              <span className="text-xs text-[#5A554E] font-mono">BUYER: {activeBuyer.companyName}</span>
            </div>
            <CardTitle className="text-xl font-heading font-black text-[#262320] mt-1">
              {t.buyerMatching.createDemandTitle}
            </CardTitle>
            <CardDescription className="text-xs text-[#5A554E]">
              {t.buyerMatching.createDemandSubtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleCreateDemand} className="space-y-5">
              {demandSuccess && (
                <div className="p-4 rounded-[6px] bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                  <span className="text-sm font-semibold">{demandSuccess}</span>
                </div>
              )}

              {demandErrors.general && (
                <div className="p-4 rounded-[6px] bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-sm font-semibold">{demandErrors.general}</span>
                </div>
              )}

              {/* Crop and Variety */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={`${t.buyerMatching.commodityLabel} *`}
                    required
                    value={demandForm.commodity}
                    onChange={(e) => setDemandForm({ ...demandForm, commodity: e.target.value })}
                    placeholder={t.buyerMatching.commodityPlaceholder}
                    error={demandErrors.commodity}
                  />
                </div>

                <div>
                  <Input
                    label="Variety / Type"
                    value={demandForm.variety}
                    onChange={(e) => setDemandForm({ ...demandForm, variety: e.target.value })}
                    placeholder="e.g. Nashik Red / Garva / Standard"
                  />
                </div>
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    required
                    min="1"
                    label={`${t.buyerMatching.quantityLabel} *`}
                    value={demandForm.requiredQuantityQtl}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, requiredQuantityQtl: e.target.value })
                    }
                    placeholder="e.g. 100"
                    error={demandErrors.requiredQuantityQtl}
                  />
                </div>

                <div>
                  <Select
                    label={t.buyerMatching.unitLabel}
                    value={demandForm.unit}
                    onChange={(e) => setDemandForm({ ...demandForm, unit: e.target.value })}
                  >
                    <option value="Quintal">Quintals (क्विंटल - 100 Kg)</option>
                    <option value="Tonnes">Tonnes (टन - 1000 Kg)</option>
                    <option value="Kg">Kilograms (किलो)</option>
                  </Select>
                </div>
              </div>

              {/* Pricing Range */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Input
                    type="number"
                    required
                    min="1"
                    label="Target Price (₹/Qtl) *"
                    value={demandForm.targetPricePerQtl}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, targetPricePerQtl: e.target.value })
                    }
                    placeholder="e.g. 2400"
                    error={demandErrors.targetPricePerQtl}
                  />
                </div>

                <div>
                  <Input
                    type="number"
                    label={t.buyerMatching.minPriceLabel}
                    value={demandForm.minPricePerQtl}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, minPricePerQtl: e.target.value })
                    }
                    placeholder="e.g. 2100"
                  />
                </div>

                <div>
                  <Input
                    type="number"
                    label={t.buyerMatching.maxPriceLabel}
                    value={demandForm.maxPricePerQtl}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, maxPricePerQtl: e.target.value })
                    }
                    placeholder="e.g. 2600"
                  />
                </div>
              </div>

              {/* Grade and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Select
                    label={t.buyerMatching.requiredGradeLabel}
                    value={demandForm.requiredGrade}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, requiredGrade: e.target.value })
                    }
                  >
                    <option value="Grade A">Grade A (Premium / Export Quality)</option>
                    <option value="Grade B">Grade B (Standard Market Quality)</option>
                    <option value="Grade C">Grade C (Fair Average Quality - FAQ)</option>
                    <option value="Any">Any Grade (Open Specification)</option>
                  </Select>
                </div>

                <div>
                  <Select
                    label={t.buyerMatching.locationLabel}
                    value={demandForm.destinationDistrict}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, destinationDistrict: e.target.value })
                    }
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
                  </Select>
                </div>
              </div>

              {/* Delivery Destination and Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={t.buyerMatching.deliveryLocationLabel}
                    value={demandForm.deliveryLocation}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, deliveryLocation: e.target.value })
                    }
                    placeholder={t.buyerMatching.deliveryLocationPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#262320] mb-1.5">
                    {t.buyerMatching.deadlineLabel}
                  </label>
                  <input
                    type="date"
                    value={demandForm.deliveryDeadline}
                    onChange={(e) =>
                      setDemandForm({ ...demandForm, deliveryDeadline: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm text-[#262320] bg-white border border-[#D8D2C4] rounded-[4px] min-h-[44px] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              {/* Description & Requirements */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#262320]">
                  {t.buyerMatching.descriptionLabel}
                </label>
                <textarea
                  rows={2}
                  value={demandForm.description}
                  onChange={(e) => setDemandForm({ ...demandForm, description: e.target.value })}
                  placeholder={t.buyerMatching.descriptionPlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm text-[#262320] bg-white border border-[#D8D2C4] rounded-[4px] focus:outline-none focus:border-[#1B4332]"
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
                  className="gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-none"
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
              <h2 className="text-lg font-heading font-black text-[#262320]">
                {t.buyerMatching.browseLotsTitle}
              </h2>
              <p className="text-xs text-[#5A554E]">
                {t.buyerMatching.browseLotsSubtitle}
              </p>
            </div>

            {/* Filter by demand */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Filter className="w-4 h-4 text-[#5A554E]" />
              <select
                value={selectedDemandFilter}
                onChange={(e) => setSelectedDemandFilter(e.target.value)}
                className="text-xs font-semibold text-[#262320] px-3 py-2 rounded-[4px] border border-[#D8D2C4] bg-white min-h-[44px]"
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
            <Card className="border-dashed border-[#D8D2C4] bg-[#FAFAF8]">
              <CardContent className="py-12 text-center space-y-3">
                <Package className="w-10 h-10 text-[#5A554E] mx-auto opacity-50" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#262320]">
                    {t.buyerMatching.noMatchingLots}
                  </p>
                  <p className="text-xs text-[#5A554E] max-w-sm mx-auto">
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

                // Resolve Match Details from existing matching engine
                const matches = lotMatchesMap[lot.id] || [];
                const specificMatch = selectedDemandFilter !== 'ALL'
                  ? matches.find((m) => m.demandId === selectedDemandFilter)
                  : matches[0]; // Best match when ALL is selected

                const matchScore = specificMatch ? specificMatch.matchScore : null;
                const positiveReasons = specificMatch ? specificMatch.positiveReasons : [];
                const warnings = specificMatch ? specificMatch.warnings : [];

                return (
                  <Card
                    key={lot.id}
                    className="border border-[#D8D2C4] bg-white shadow-none hover:border-[#1B4332] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <CardHeader className="pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs text-[#5A554E] font-bold">
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
                            <h3 className="text-base font-heading font-black text-[#1B4332] mt-1">
                              {lot.commodity}
                            </h3>
                            <span className="text-xs text-[#5A554E]">
                              {lot.variety || 'Standard Local'} • {lot.locationDistrict}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-[#5A554E] uppercase font-bold tracking-wider block">
                              Ask Price
                            </span>
                            <span className="text-base font-heading font-black text-[#1B4332]">
                              ₹{lot.expectedPricePerQuintal || lot.expectedPrice}/Qtl
                            </span>
                          </div>
                        </div>

                        {/* Match Score Strip (Rule-Based Matching Engine) */}
                        {matchScore !== null && (
                          <div className="mt-3 pt-2.5 border-t border-[#D8D2C4] space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A554E] font-heading">
                                {t.buyerMatching.matchScore}
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-[4px] font-heading border ${
                                  matchScore >= 85
                                    ? 'bg-[#EAF2ED] text-[#1B4332] border-[#B7D5C4]'
                                    : matchScore >= 70
                                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                                    : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                                }`}
                              >
                                {matchScore >= 85 ? 'Strong Match' : matchScore >= 70 ? 'Good Match' : 'Fair Match'} {matchScore} / 100
                              </span>
                            </div>

                            {/* Transparent Match Reasons from Engine */}
                            {positiveReasons.length > 0 && (
                              <div className="bg-[#FAFAF8] p-2 rounded-[4px] border border-[#D8D2C4] space-y-1 text-[11px] text-[#262320]">
                                <span className="font-semibold text-[#1B4332] block">
                                  Why this matches:
                                </span>
                                {positiveReasons.slice(0, 3).map((r, idx) => (
                                  <p key={idx} className="leading-snug">
                                    {r}
                                  </p>
                                ))}
                                {warnings.length > 0 && (
                                  <p className="text-[#B45309] font-medium leading-snug">
                                    {warnings[0]}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Two-Tier Quality Status Badges */}
                        <div className="mt-2.5 pt-2 border-t border-[#D8D2C4]">
                          {lot.isPhysicallyVerified ? (
                            <VerificationBadge
                              type="physical"
                              customLabel={`Physically Verified (${lot.officialGrade})`}
                              className="w-full justify-center"
                            />
                          ) : lot.qualityStatus === 'AI_ASSESSMENT_NOT_VERIFIED' ? (
                            <VerificationBadge
                              type="provisional"
                              customLabel="AI Assessment — Not Verified"
                              className="w-full justify-center"
                            />
                          ) : (
                            <div className="text-[11px] bg-[#FAFAF8] text-[#5A554E] p-1.5 rounded-[4px] border border-[#D8D2C4] text-center">
                              Quality Inspection Pending
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="pt-3 pb-3 space-y-2 text-xs text-[#262320]">
                        <div className="grid grid-cols-2 gap-2 bg-[#FAFAF8] p-2 rounded-[4px] border border-[#D8D2C4]">
                          <div>
                            <span className="text-[#5A554E] block text-[10px]">Quantity:</span>
                            <strong className="text-[#262320] font-bold font-heading">
                              {lot.quantity} {lot.unit} ({lot.quantityQuintals} Qtl)
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#5A554E] block text-[10px]">Expected Grade:</span>
                            <strong className="text-[#262320] font-bold font-heading">
                              {lot.expectedGrade}
                            </strong>
                          </div>
                        </div>

                        {lot.location && (
                          <div className="flex items-center gap-1 text-[#5A554E] text-[11px]">
                            <MapPin className="w-3 h-3 text-[#1B4332] shrink-0" />
                            <span className="truncate">{lot.location}, {lot.locationDistrict}</span>
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <div className="p-3 bg-[#FAFAF8] border-t border-[#D8D2C4] space-y-2">
                      <div className="flex items-center gap-2">
                        <Link href={`/lots/${lot.id}`} className="flex-1">
                          <Button variant="outline" size="sm" fullWidth className="text-xs border-[#D8D2C4]">
                            {t.lots.viewDetails}
                          </Button>
                        </Link>

                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isReserved || isSold}
                          onClick={() => openMakeOffer(lot)}
                          className="gap-1.5 text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white flex-1 shadow-none"
                        >
                          <Send className="w-3 h-3" />
                          <span>{t.buyerMatching.makeOfferBtn}</span>
                        </Button>
                      </div>

                      <Link
                        href={`/calculator?price=${lot.expectedPricePerQuintal || lot.expectedPrice}&crop=${encodeURIComponent(lot.commodity)}&quantity=${lot.quantityQuintals || lot.quantity}&market=${encodeURIComponent(activeBuyer.district)}&distance=45`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          fullWidth
                          className="text-xs text-[#1B4332] hover:bg-white gap-1"
                        >
                          <Scale className="w-3 h-3 text-[#1B4332]" />
                          <span>Check Net Realisation</span>
                        </Button>
                      </Link>
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
              <h2 className="text-lg font-heading font-black text-[#262320]">
                {t.buyerMatching.myOffersTitle}
              </h2>
              <p className="text-xs text-[#5A554E]">
                {t.buyerMatching.myOffersSubtitle} (Sent as {activeBuyer.companyName})
              </p>
            </div>

            <Badge variant="amber" className="text-xs self-start sm:self-auto">
              {offers.length} Offers Dispatched
            </Badge>
          </div>

          {offers.length === 0 ? (
            <Card className="border-dashed border-[#D8D2C4] bg-[#FAFAF8]">
              <CardContent className="py-12 text-center space-y-3">
                <Send className="w-10 h-10 text-[#5A554E] mx-auto opacity-50" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#262320]">
                    {t.buyerMatching.noSentOffers}
                  </p>
                  <p className="text-xs text-[#5A554E] max-w-sm mx-auto">
                    Browse farmer produce lots and dispatch transparent digital purchase offers with agreed payment terms.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('browse_lots')}
                  className="gap-2 text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white mt-2 shadow-none"
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
                    className={`border transition-all bg-white shadow-none ${
                      isAccepted
                        ? 'border-emerald-300'
                        : isPending
                        ? 'border-[#D8D2C4]'
                        : 'border-[#D8D2C4]'
                    }`}
                  >
                    <CardHeader className="pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-black text-[#1B4332] text-base">
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
                          <span className="text-xs text-[#5A554E] block mt-0.5">
                            District: {offer.lotDistrict || 'Maharashtra'} • Lot Status: {offer.lotStatus}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-[#5A554E] uppercase font-bold tracking-wider block">
                            Total Offer Value
                          </span>
                          <span className="text-lg font-heading font-black text-[#1B4332]">
                            {formatINR(offer.totalOfferValue)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 pb-3 space-y-3 text-xs text-[#262320]">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FAFAF8] p-2.5 rounded-[4px] border border-[#D8D2C4]">
                        <div>
                          <span className="text-[#5A554E] block text-[10px]">Offered Rate:</span>
                          <strong className="text-[#1B4332] font-bold text-sm font-heading">
                            ₹{offer.offeredPricePerQtl}/Qtl
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#5A554E] block text-[10px]">Quantity:</span>
                          <strong className="text-[#262320] font-bold text-sm font-heading">
                            {offer.quantityQuintals} Quintals
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#5A554E] block text-[10px]">Payment Terms:</span>
                          <span className="text-[#262320] font-medium truncate block">
                            {offer.paymentTerms || 'Payment on Weighbridge Receipt'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#5A554E] block text-[10px]">Valid Until:</span>
                          <span className="text-[#262320] font-medium block">
                            {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : '7 Days'}
                          </span>
                        </div>
                      </div>

                      {offer.notes && (
                        <p className="text-xs text-[#5A554E] bg-[#FAFAF8] p-2 rounded-[4px] border border-[#D8D2C4]">
                          <span className="font-semibold text-[#262320]">Notes: </span>
                          {offer.notes}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/lots/${offer.lotId}`}
                            className="text-xs text-[#1B4332] hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>View Target Lot</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/calculator?price=${offer.offeredPricePerQtl}&crop=${encodeURIComponent(offer.commodity)}&quantity=${offer.quantityQuintals}`}
                            className="text-xs text-[#5A554E] hover:underline flex items-center gap-1"
                          >
                            <Scale className="w-3 h-3 text-[#1B4332]" />
                            <span>Check Net Realisation</span>
                          </Link>
                        </div>

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
              <h2 className="text-lg font-heading font-black text-[#262320] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#1B4332]" />
                <span>Commercial Purchases & Contracts: {purchases.length}</span>
              </h2>
              <p className="text-xs text-[#5A554E]">
                Track formal commercial procurement agreements, logistics transit, and milestone payment status.
              </p>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size="sm" className="text-xs gap-1 border-[#D8D2C4]">
                <span>View Transactions Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {purchases.length === 0 ? (
            <Card className="p-12 text-center text-xs text-[#5A554E] bg-[#FAFAF8] border-dashed border-[#D8D2C4] space-y-2">
              <CreditCard className="w-8 h-8 mx-auto text-[#5A554E] opacity-50" />
              <p className="text-sm font-bold text-[#262320]">No purchase contracts activated yet.</p>
              <p>When a farmer accepts your offer, an official trade transaction is automatically created here.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {purchases.map((txn) => {
                const latestPayment = txn.payments?.[0];
                const activeTransport = txn.lot?.transportRequests?.[0];
                return (
                  <Card key={txn.id} className="border border-[#D8D2C4] bg-white shadow-none hover:border-[#1B4332] transition-all">
                    <CardHeader className="pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#1B4332] bg-[#EAF2ED] px-2 py-0.5 rounded-[4px] border border-[#B7D5C4]">
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
                            <span className="text-xs text-[#5A554E]">
                              • Lot: {txn.lot?.lotCode}
                            </span>
                          </div>
                          <span className="text-base font-heading font-black text-[#262320] block mt-1">
                            {txn.lot?.commodity} ({txn.quantityQuintals} Quintals @ ₹{txn.agreedPricePerQuintal.toLocaleString('en-IN')}/Qtl)
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-[#5A554E] uppercase font-bold tracking-wider block">
                            Gross Contract Sum
                          </span>
                          <div className="text-lg font-heading font-black text-[#1B4332]">
                            {formatINR(txn.grossSaleValue)}
                          </div>
                          {latestPayment && (
                            <span className="text-[10px] text-[#5A554E] font-mono block">
                              Payment: <strong>{latestPayment.paymentStatus}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 text-xs space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#262320] bg-[#FAFAF8] p-2.5 rounded-[4px] border border-[#D8D2C4]">
                        <div>
                          <span className="text-[#5A554E] block text-[10px]">Seller Farmer / FPO</span>
                          <strong>{txn.farmer?.user?.fullName || 'Producer'}</strong>
                          <span className="text-[#5A554E] text-[10px] block">{txn.farmer?.district}, Maharashtra</span>
                        </div>
                        <div>
                          <span className="text-[#5A554E] block text-[10px]">Delivery Destination</span>
                          <strong>{activeTransport?.dropLocation || txn.lot?.location || 'Buyer Facility'}</strong>
                        </div>
                        <div>
                          <span className="text-[#5A554E] block text-[10px]">Logistics Status</span>
                          <strong className="text-[#1B4332] flex items-center gap-1">
                            <Truck className="w-3 h-3 text-[#1B4332]" />
                            <span>{activeTransport ? activeTransport.status : 'Pending Dispatch Booking'}</span>
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#5A554E]">
                          Executed on {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <Link href={`/transactions/${txn.id}`}>
                          <Button size="sm" variant="primary" className="text-xs gap-1.5 shadow-none bg-[#1B4332] hover:bg-[#2D6A4F] text-white">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-[8px] shadow-2xl border border-[#D8D2C4] overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#1B4332] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="amber" className="text-[10px] uppercase font-bold">
                    DIGITAL PURCHASE OFFER
                  </Badge>
                  <span className="text-xs font-mono text-[#D8D2C4]">{targetLot.lotCode}</span>
                </div>
                <h2 className="text-lg font-heading font-bold mt-1">{t.buyerMatching.makeOfferTitle}</h2>
                <p className="text-xs text-[#EAE6DF]">
                  Submitting as: <strong>{activeBuyer.companyName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMakeOfferOpen(false)}
                className="p-1.5 rounded-[4px] hover:bg-[#2D6A4F] text-[#EAE6DF] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {offerSuccess && (
                <div className="p-3.5 rounded-[6px] bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span className="text-xs font-semibold">{offerSuccess}</span>
                </div>
              )}

              {offerError && (
                <div className="p-3.5 rounded-[6px] bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-xs font-semibold">{offerError}</span>
                </div>
              )}

              {/* Price and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    label={`${t.buyerMatching.offerPriceLabel} *`}
                    value={offerForm.offeredPricePerQtl}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, offeredPricePerQtl: e.target.value })
                    }
                    placeholder="e.g. 2400"
                    helperText={`Farmer Ask: ₹${targetLot.expectedPricePerQuintal || targetLot.expectedPrice}/Qtl`}
                  />
                </div>

                <div>
                  <Input
                    type="number"
                    label={`${t.buyerMatching.offerQtyLabel} *`}
                    value={offerForm.quantityQuintals}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, quantityQuintals: e.target.value })
                    }
                    placeholder="e.g. 100"
                    helperText={`Available: ${targetLot.quantityQuintals || targetLot.quantity} Quintals`}
                  />
                </div>
              </div>

              {/* Dynamic Value Calculation */}
              {parseFloat(offerForm.offeredPricePerQtl) > 0 &&
                parseFloat(offerForm.quantityQuintals) > 0 && (
                  <div className="p-3 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#5A554E] uppercase tracking-wider text-[11px] font-heading">
                      {t.buyerMatching.totalOfferValue}
                    </span>
                    <strong className="text-base font-heading font-black text-[#1B4332]">
                      {formatINR(
                        parseFloat(offerForm.offeredPricePerQtl) *
                        parseFloat(offerForm.quantityQuintals)
                      )}
                    </strong>
                  </div>
                )}

              {/* Delivery Terms */}
              <div>
                <Input
                  label={t.buyerMatching.deliveryTermsLabel}
                  value={offerForm.deliveryTerms}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, deliveryTerms: e.target.value })
                  }
                  placeholder={t.buyerMatching.deliveryTermsPlaceholder}
                />
              </div>

              {/* Payment Terms */}
              <div>
                <Input
                  label={t.buyerMatching.paymentTermsLabel}
                  value={offerForm.paymentTerms}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, paymentTerms: e.target.value })
                  }
                  placeholder={t.buyerMatching.paymentTermsPlaceholder}
                />
              </div>

              {/* Proposed Pickup and Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#262320] mb-1.5">
                    Proposed Pickup Date
                  </label>
                  <input
                    type="date"
                    value={offerForm.proposedPickupDate}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, proposedPickupDate: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm text-[#262320] bg-white border border-[#D8D2C4] rounded-[4px] min-h-[44px] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <Select
                    label="Validity (Days)"
                    value={String(offerForm.validityDays)}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, validityDays: parseInt(e.target.value, 10) })
                    }
                  >
                    <option value="3">3 Days</option>
                    <option value="7">7 Days (Standard)</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#262320]">
                  {t.buyerMatching.offerNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={offerForm.notes}
                  onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                  placeholder={t.buyerMatching.offerNotesPlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm text-[#262320] bg-white border border-[#D8D2C4] rounded-[4px] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="p-3 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] text-[#5A554E] text-[11px]">
                <span className="font-semibold text-[#262320] block mb-0.5">{t.buyerMatching.offerPendingNotice}</span>
                <span>Offers dispatched are subject to physical quality verification upon farmgate pickup or mandi arrival.</span>
              </div>
            </div>

            <div className="p-4 bg-[#F4F1EA] border-t border-[#D8D2C4] flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsMakeOfferOpen(false)}
                disabled={offerSubmitting}
                className="text-xs"
              >
                {t.lots.cancelBtn}
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleDispatchOffer}
                disabled={offerSubmitting}
                className="gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs shadow-none"
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
      <Card className="border-[#D8D2C4] bg-[#F4F1EA] shadow-none">
        <CardContent className="p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#262320] font-bold font-heading">
            <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
            <span>{t.buyerMatching.trustNoticeTitle}</span>
          </div>
          <p className="text-[#5A554E] leading-relaxed">
            {t.buyerMatching.trustNoticeDesc}
          </p>
          <p className="text-[#1B4332] font-medium text-[11px] pt-0.5">
            {t.buyerMatching.demoNotice}
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default function BuyerPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-[#1B4332] animate-spin mx-auto" />
        </div>
      }
    >
      <BuyerPortalContent />
    </Suspense>
  );
}
