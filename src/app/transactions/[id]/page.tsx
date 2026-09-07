'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Star,
  Scale,
  FileText,
  Loader2,
  Sparkles,
  Package,
} from 'lucide-react';

interface TransactionDetail {
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
  updatedAt: string;
  lotId: string;
  lot: {
    id: string;
    lotCode: string;
    commodity: string;
    variety: string | null;
    quantityQuintals: number;
    expectedPricePerQuintal: number;
    locationDistrict: string;
    locationTaluka: string | null;
    location: string | null;
    harvestDate: string;
    readyForPickupDate: string;
    physicalVerifications: Array<{
      id: string;
      status: string;
      officialGrade: string;
      certificateNumber: string;
      verifiedAt: string;
      inspector?: {
        agencyName: string;
        licenseNumber: string;
      };
    }>;
    aiAssessments: Array<{
      id: string;
      status: string;
      estimatedGrade: string;
      confidenceScore: number;
      disclaimer: string;
    }>;
    transportRequests: Array<{
      id: string;
      status: string;
      pickupLocation: string;
      dropLocation: string;
      distanceKm: number;
      estimatedCost: number;
      scheduledPickup: string;
      actualDelivery: string | null;
      transporter?: {
        businessName: string;
        commercialLicenseNo: string | null;
        verified: boolean;
        ratingScore: number;
      };
      vehicle?: {
        vehicleType: string;
        registrationNumber: string;
      };
    }>;
  };
  farmerId: string;
  farmer: {
    id: string;
    district: string;
    taluka: string;
    village: string | null;
    user: {
      id: string;
      fullName: string;
      phone: string;
    };
  };
  buyerId: string;
  buyer: {
    id: string;
    companyName: string;
    buyerType: string;
    gstin: string | null;
    tradeLicenseNo: string | null;
    registeredState: string;
    verified: boolean;
    user: {
      id: string;
      fullName: string;
      phone: string;
    };
  };
  transporterId?: string | null;
  transporter?: {
    id: string;
    businessName: string;
    commercialLicenseNo: string | null;
    verified: boolean;
    ratingScore: number;
    user: {
      id: string;
      fullName: string;
    };
  } | null;
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    escrowReference: string | null;
    payoutDate: string | null;
    createdAt: string;
  }>;
  ratings: Array<{
    id: string;
    raterId: string;
    rateeId: string;
    rolePair: string;
    ratingScore: number;
    feedback: string | null;
    createdAt: string;
    rater: {
      fullName: string;
      role: string;
    };
    ratee: {
      fullName: string;
      role: string;
    };
  }>;
  disputes: Array<{
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
  }>;
}

const LIFECYCLE_STEPS = [
  { key: 'OFFER_ACCEPTED', label: 'Offer Accepted' },
  { key: 'TRANSPORT_REQUESTED', label: 'Transport Booked' },
  { key: 'TRANSPORT_ACCEPTED', label: 'Vehicle Assigned' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'QUALITY_CONFIRMED', label: 'Quality Assayed' },
  { key: 'PAYMENT_INITIATED', label: 'Payment Scheduled' },
  { key: 'PAYMENT_RECEIVED', label: 'Payment Settled' },
  { key: 'COMPLETED', label: 'Completed' },
];

export default function TransactionDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params?.id as string;

  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rating State
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingRolePair, setRatingRolePair] = useState<string>('FARMER_TO_BUYER');
  const [ratingFeedback, setRatingFeedback] = useState<string>('');

  // Dispute State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState<string>('QUALITY_MISMATCH');
  const [disputeEvidence, setDisputeEvidence] = useState<string>('');

  const fetchTransaction = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transactions/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTransaction(data.transaction);
        }
      }
    } catch (err) {
      console.error('Failed to load transaction detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTransaction();
    }
  }, [id, fetchTransaction]);

  // Handle Mark Payment Received
  const handleMarkPaymentReceived = async () => {
    if (!transaction || transaction.payments.length === 0) return;
    const payment = transaction.payments[0];
    try {
      setActionLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          paymentStatus: 'PAID',
          role: 'FARMER',
          callerId: transaction.farmer.user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Payment marked as received! Trade progressing toward settlement.');
        await fetchTransaction();
      } else {
        setErrorMessage(data.error || 'Failed to update payment status.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error marking payment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Submit Rating
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    try {
      setActionLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      let raterId = transaction.farmer.user.id;
      let rateeId = transaction.buyer.user.id;

      if (ratingRolePair === 'FARMER_TO_TRANSPORTER' && transaction.transporter?.user?.id) {
        raterId = transaction.farmer.user.id;
        rateeId = transaction.transporter.user.id;
      } else if (ratingRolePair === 'BUYER_TO_TRANSPORTER' && transaction.transporter?.user?.id) {
        raterId = transaction.buyer.user.id;
        rateeId = transaction.transporter.user.id;
      } else if (ratingRolePair === 'BUYER_TO_FARMER') {
        raterId = transaction.buyer.user.id;
        rateeId = transaction.farmer.user.id;
      }

      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          raterId,
          rateeId,
          rolePair: ratingRolePair,
          ratingScore,
          feedback: ratingFeedback,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Verified commercial rating submitted successfully!');
        setRatingFeedback('');
        await fetchTransaction();
      } else {
        setErrorMessage(data.error || 'Failed to submit rating.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error submitting rating.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Raise Dispute
  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    try {
      setActionLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          raisedById: transaction.farmer.user.id,
          reason: disputeReason,
          evidenceSummary: disputeEvidence,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Dispute ${data.dispute.disputeCode} formally registered. An authorized officer will review digital evidence.`);
        setShowDisputeModal(false);
        setDisputeEvidence('');
        await fetchTransaction();
      } else {
        setErrorMessage(data.error || 'Failed to raise dispute.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error raising dispute.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-3 max-w-4xl">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-600" />
        <p className="text-gray-500 text-sm">Loading transaction records...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4 max-w-md">
        <h2 className="text-xl font-bold text-gray-900">Transaction Not Found</h2>
        <p className="text-gray-500 text-sm">The requested transaction could not be located.</p>
        <Link href="/transactions">
          <Button variant="primary">Back to Transactions</Button>
        </Link>
      </div>
    );
  }

  // Step index calculation for timeline
  const currentStepIndex = LIFECYCLE_STEPS.findIndex((s) => s.key === transaction.status);
  const isDeliveredOrLater = currentStepIndex >= 4;
  const isPaid = transaction.payments.some((p) => p.paymentStatus === 'PAID');
  const physicalCert = transaction.lot.physicalVerifications[0];
  const aiAssessment = transaction.lot.aiAssessments[0];
  const transportRequest = transaction.lot.transportRequests[0];
  const latestPayment = transaction.payments[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="space-y-1">
          <Link
            href="/transactions"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Transactions</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-emerald-700" />
              <span>{transaction.transactionCode}</span>
            </h1>
            <Badge
              variant={
                transaction.status === 'COMPLETED' || transaction.status === 'PAYMENT_RECEIVED'
                  ? 'emerald'
                  : transaction.status === 'DISPUTED'
                  ? 'red'
                  : 'blue'
              }
            >
              {transaction.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Created on {new Date(transaction.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Dispute Button */}
        <div className="flex items-center gap-2">
          {transaction.status !== 'DISPUTED' && transaction.status !== 'CANCELLED' && (
            <Button
              variant="outline"
              onClick={() => setShowDisputeModal(true)}
              className="text-xs gap-1.5 text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              <Scale className="w-4 h-4" />
              <span>{t.transactions.raiseDisputeBtn}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Dispute Banner if any */}
      {transaction.disputes.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-rose-950 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <span>Grievance Registered: {transaction.disputes[0].disputeCode}</span>
            </span>
            <Badge variant="red">{transaction.disputes[0].status}</Badge>
          </div>
          <p className="text-xs text-rose-900 leading-relaxed">
            <strong>Reason:</strong> {transaction.disputes[0].reason} • <strong>Summary:</strong> {transaction.disputes[0].evidenceSummary}
          </p>
          {transaction.disputes[0].resolutionNotes && (
            <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-gray-800">
              <strong className="text-emerald-800 block">Adjudication Notes:</strong>
              {transaction.disputes[0].resolutionNotes}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9-STEP VISUAL TIMELINE */}
      {/* ========================================================================= */}
      <Card className="bg-white border-gray-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-700" />
            <span>{t.transactions.timelineTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 overflow-x-auto">
          <div className="min-w-[650px] flex items-center justify-between relative py-2">
            {/* Background Line */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />

            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex || transaction.status === 'COMPLETED';
              const isCurrent = idx === currentStepIndex && transaction.status !== 'COMPLETED';
              return (
                <div key={step.key} className="flex flex-col items-center relative z-10 space-y-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-purple-900 text-white ring-4 ring-purple-100 animate-pulse'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold text-center max-w-[70px] leading-tight ${
                      isPast
                        ? 'text-emerald-950'
                        : isCurrent
                        ? 'text-purple-900 font-black'
                        : 'text-gray-400 font-normal'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* GRID: SECTIONS 1 & 2 (Commercial Agreement + Produce Quality) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Commercial Agreement */}
        <Card className="border-gray-200 bg-white">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>{t.transactions.commercialAgreement}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-gray-50 rounded-xl space-y-0.5">
                <span className="text-gray-400 text-[10px] font-bold uppercase">{t.transactions.farmerLabel}</span>
                <div className="font-bold text-gray-900">{transaction.farmer.user.fullName}</div>
                <span className="text-gray-500 text-[10px] block">{transaction.farmer.district}, Maharashtra</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl space-y-0.5">
                <span className="text-gray-400 text-[10px] font-bold uppercase">{t.transactions.buyerLabel}</span>
                <div className="font-bold text-gray-900 flex items-center gap-1">
                  <span>{transaction.buyer.companyName}</span>
                  {transaction.buyer.verified && (
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  )}
                </div>
                <span className="text-gray-500 text-[10px] block">{transaction.buyer.buyerType}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Commodity & Lot Code</span>
                <span className="font-bold text-gray-900">
                  <Link href={`/lots/${transaction.lot.id}`} className="text-emerald-800 hover:underline">
                    {transaction.lot.commodity} ({transaction.lot.lotCode})
                  </Link>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Agreed Quantity</span>
                <span className="font-bold text-gray-900">{transaction.quantityQuintals} Quintals</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{t.transactions.agreedPricePerQtl}</span>
                <span className="font-bold text-emerald-700">₹{transaction.agreedPricePerQuintal.toLocaleString('en-IN')}/Qtl</span>
              </div>
              <div className="flex justify-between py-1.5 bg-emerald-50/60 px-2 rounded-lg font-bold text-gray-900">
                <span>{t.transactions.grossContractValue}</span>
                <span className="text-sm font-black text-emerald-800">₹{transaction.grossSaleValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Produce & Quality (Phase 3 Separation) */}
        <Card className="border-gray-200 bg-white">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t.transactions.qualityStatus}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            {/* Tier 2: Physical Verification */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tier 2: Physical Verification</span>
                </span>
                <Badge variant={physicalCert ? 'emerald' : 'gray'}>
                  {physicalCert ? 'VERIFIED' : 'PENDING'}
                </Badge>
              </div>
              {physicalCert ? (
                <div className="space-y-0.5 text-gray-700 text-[11px] pt-1">
                  <div><strong>Official Grade:</strong> {physicalCert.officialGrade}</div>
                  <div><strong>Certificate No:</strong> <span className="font-mono">{physicalCert.certificateNumber}</span></div>
                  <div><strong>Inspecting Body:</strong> {physicalCert.inspector?.agencyName || 'MSAMB Authorized Cell'}</div>
                </div>
              ) : (
                <p className="text-[11px] text-gray-600 italic">
                  Formal physical assay pending from authorized APMC inspector.
                </p>
              )}
            </div>

            {/* Tier 1: AI Visual Screening */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-gray-500" />
                  <span>Tier 1: AI Visual Screening</span>
                </span>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {t.transactions.aiVisualScreening}
                </span>
              </div>
              {aiAssessment ? (
                <div className="space-y-0.5 text-gray-600 text-[11px] pt-1">
                  <div><strong>Visual Estimate:</strong> {aiAssessment.estimatedGrade} ({(aiAssessment.confidenceScore * 100).toFixed(0)}% confidence)</div>
                  <p className="text-[10px] text-gray-400 italic leading-snug">
                    {aiAssessment.disclaimer}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-gray-500 italic">
                  Preliminary visual screening not available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* GRID: SECTIONS 3 & 4 (Logistics & Payment Tracking) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 3: Logistics & Transport (Phase 5) */}
        <Card className="border-gray-200 bg-white">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-700" />
              <span>{t.transactions.transportStatus}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            {transportRequest ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <span>{transportRequest.transporter?.businessName || 'Assigned Transporter'}</span>
                    {transportRequest.transporter?.verified && (
                      <Badge variant="purple" className="text-[9px]">RTO Verified</Badge>
                    )}
                  </div>
                  <Badge variant="blue">{transportRequest.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px]">Pickup Origin</span>
                    <strong className="text-gray-800">{transportRequest.pickupLocation}</strong>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px]">Destination Drop</span>
                    <strong className="text-gray-800">{transportRequest.dropLocation}</strong>
                  </div>
                </div>

                <div className="flex justify-between py-1 border-t border-gray-100 text-gray-600">
                  <span>Corridor Distance:</span>
                  <span className="font-bold text-gray-900">{transportRequest.distanceKm} km</span>
                </div>
                <div className="flex justify-between py-1 border-t border-gray-100 text-gray-600">
                  <span>Freight Cost:</span>
                  <span className="font-bold text-rose-700">₹{transportRequest.estimatedCost.toLocaleString('en-IN')}</span>
                </div>
                {transportRequest.actualDelivery && (
                  <div className="flex justify-between py-1 bg-emerald-50 px-2 rounded-lg text-emerald-900 font-bold">
                    <span>e-POD Delivery Timestamp:</span>
                    <span>{new Date(transportRequest.actualDelivery).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-2 text-gray-500">
                <Truck className="w-6 h-6 mx-auto text-gray-400" />
                <p>No active transport request linked yet.</p>
                <Link href={`/lots/${transaction.lot.id}`}>
                  <Button variant="outline" className="text-xs">Book Transport via Phase 5</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Payment Tracking (Phase 7 Core USP) */}
        <Card className="border-gray-200 bg-white">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>{t.transactions.paymentTracking}</span>
              </CardTitle>
              <Badge variant={isPaid ? 'emerald' : 'blue'}>
                {latestPayment ? latestPayment.paymentStatus : 'PENDING'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Gross Contract Sum:</span>
                <span className="font-black text-gray-900">₹{transaction.grossSaleValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Demo Reference:</span>
                <span className="font-mono text-emerald-800 font-bold">{latestPayment?.escrowReference || 'DEMO-PAY-2026-0001'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Settlement Method:</span>
                <span className="font-medium text-gray-700">{latestPayment?.paymentMethod || 'ESCROW_GATEWAY'}</span>
              </div>
            </div>

            {/* Prototype Milestone Stepper */}
            <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-bold text-emerald-950">Offer Accepted & Escrow Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${latestPayment?.paymentStatus !== 'PENDING' ? 'text-emerald-700' : 'text-gray-300'}`} />
                <span className={latestPayment?.paymentStatus !== 'PENDING' ? 'font-bold text-emerald-950' : 'text-gray-400'}>
                  {t.transactions.paymentInitiated}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isPaid ? 'text-emerald-700' : 'text-gray-300'}`} />
                <span className={isPaid ? 'font-bold text-emerald-950' : 'text-gray-400'}>
                  {t.transactions.paymentPaid}
                </span>
              </div>
            </div>

            {/* Demo Mark Paid Action */}
            {!isPaid && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleMarkPaymentReceived}
                  disabled={actionLoading}
                  className="w-full text-xs gap-1.5 shadow-xs bg-emerald-700 hover:bg-emerald-800"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{t.transactions.markPaymentReceivedBtn}</span>
                </Button>
              </div>
            )}

            <p className="text-[10px] text-amber-800 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200">
              {t.transactions.prototypeNotice}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: NET REALISATION ACCOUNTING (Phase 6 Integration) */}
      {/* ========================================================================= */}
      <Card className="bg-gradient-to-br from-emerald-950 via-teal-900 to-indigo-950 text-white border-0 shadow-md">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/60 pb-3">
            <div>
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Phase 6 Transparent Net Realisation Engine</span>
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">{t.transactions.takeHomeEstimate}</h3>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                ₹{transaction.netRealisation.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-emerald-200 font-mono">
                (₹{(transaction.netRealisation / transaction.quantityQuintals).toFixed(2)}/Qtl Net)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-emerald-300 text-[10px] uppercase font-bold block">Gross Contract</span>
              <div className="font-black text-white text-sm">₹{transaction.grossSaleValue.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-emerald-200 block">₹{transaction.agreedPricePerQuintal}/Qtl</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-rose-300 text-[10px] uppercase font-bold block">− Freight Cost</span>
              <div className="font-black text-rose-300 text-sm">₹{transaction.transportCost.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-rose-200 block">Phase 5 Logistics</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-purple-300 text-[10px] uppercase font-bold block">− Storage Cost</span>
              <div className="font-black text-purple-300 text-sm">₹{transaction.storageCost.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-purple-200 block">Direct Farm Gate</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-amber-300 text-[10px] uppercase font-bold block">− Other Fees</span>
              <div className="font-black text-amber-300 text-sm">₹{transaction.otherCosts.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-amber-200 block">Handling / Loading</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION 6: TRUST & 3-WAY RATINGS (Phase 7 Core USP) */}
      {/* ========================================================================= */}
      <Card className="border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{t.transactions.threeWayRatings}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Ratings are tied strictly to completed trade transactions. Arbitrary or unverified feedback is prohibited.
          </p>

          {/* Existing Ratings List */}
          {transaction.ratings.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Recorded Feedback:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {transaction.ratings.map((r) => (
                  <div key={r.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">{r.rolePair.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-1 text-amber-600 font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{r.ratingScore} / 5</span>
                      </div>
                    </div>
                    {r.feedback && <p className="text-gray-600 italic text-[11px]">&quot;{r.feedback}&quot;</p>}
                    <span className="text-[10px] text-gray-400 block">
                      By {r.rater.fullName} on {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Rating Form (Available after delivery) */}
          {isDeliveredOrLater && (
            <form onSubmit={handleSubmitRating} className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-xs">{t.transactions.rateThisTransaction}</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified Trade Counterparty
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Select Counterparty Pair</label>
                  <select
                    value={ratingRolePair}
                    onChange={(e) => setRatingRolePair(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl bg-white text-xs font-medium"
                  >
                    <option value="FARMER_TO_BUYER">Farmer → Buyer ({transaction.buyer.companyName})</option>
                    <option value="BUYER_TO_FARMER">Buyer → Farmer ({transaction.farmer.user.fullName})</option>
                    {transaction.transporter && (
                      <>
                        <option value="FARMER_TO_TRANSPORTER">Farmer → Transporter ({transaction.transporter.businessName})</option>
                        <option value="BUYER_TO_TRANSPORTER">Buyer → Transporter ({transaction.transporter.businessName})</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Commercial Rating Score (1 to 5 Stars)</label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRatingScore(num)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-all ${
                          ratingScore >= num
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-800 ml-1">{ratingScore} / 5 Stars</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 text-xs">Operational Feedback (Optional)</label>
                <input
                  type="text"
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder={t.transactions.ratingFeedbackPlaceholder}
                  className="w-full p-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={actionLoading}
                  className="text-xs gap-1.5 shadow-xs"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                  <span>{t.transactions.submitRatingBtn}</span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* RAISE DISPUTE MODAL */}
      {/* ========================================================================= */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-700" />
                <span>{t.disputes.raiseGrievanceTitle}</span>
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t.disputes.categoryLabel}</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl bg-white text-xs font-medium"
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
                <label className="block font-bold text-gray-700 mb-1">{t.disputes.descriptionLabel}</label>
                <textarea
                  rows={4}
                  required
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  placeholder={t.disputes.descriptionPlaceholder}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Important Principle:</strong> {t.disputes.humanAdjudicationNote}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDisputeModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={actionLoading}
                  className="bg-rose-700 hover:bg-rose-800 text-white"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{t.disputes.submitGrievanceBtn}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
