'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
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
  FileCheck2,
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
        setSuccessMessage(`Dispute ${data.dispute.disputeCode} formally registered. An authorized grievance officer will review digital evidence.`);
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
      <PageContainer className="py-20 text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#1B4332]" />
        <p className="text-[#635E59] text-sm">Loading commercial transaction records...</p>
      </PageContainer>
    );
  }

  if (!transaction) {
    return (
      <PageContainer className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold font-heading text-[#262320]">Transaction Not Found</h2>
        <p className="text-[#635E59] text-sm">The requested transaction could not be located in the database.</p>
        <Link href="/transactions">
          <Button variant="primary" className="bg-[#1B4332] text-white">Back to Transactions</Button>
        </Link>
      </PageContainer>
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
    <PageContainer className="py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8D2C4]">
        <div className="space-y-1">
          <Link
            href="/transactions"
            className="text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Transactions Ledger</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#262320] tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#1B4332]" />
              <span>{transaction.transactionCode}</span>
            </h1>
            <Badge
              variant={
                transaction.status === 'COMPLETED' || transaction.status === 'PAYMENT_RECEIVED'
                  ? 'emerald'
                  : transaction.status === 'DISPUTED'
                  ? 'red'
                  : transaction.status === 'IN_TRANSIT'
                  ? 'purple'
                  : 'blue'
              }
            >
              {transaction.status}
            </Badge>
          </div>
          <p className="text-xs text-[#635E59]">
            Executed on {new Date(transaction.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Dispute Button */}
        <div className="flex items-center gap-2">
          {transaction.status !== 'DISPUTED' && transaction.status !== 'CANCELLED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDisputeModal(true)}
              className="text-xs gap-1.5 text-rose-800 border-rose-200 hover:bg-rose-50 bg-white"
            >
              <Scale className="w-4 h-4 text-rose-700" />
              <span>{t.transactions.raiseDisputeBtn}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="p-4 rounded-[8px] bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-[8px] bg-rose-50 border border-rose-300 text-rose-950 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Dispute Banner if any */}
      {transaction.disputes.length > 0 && (
        <div className="p-4 rounded-[8px] bg-rose-50 border border-rose-300 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-950 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <span>Grievance Registered: {transaction.disputes[0].disputeCode}</span>
            </span>
            <Badge variant="red">{transaction.disputes[0].status}</Badge>
          </div>
          <p className="text-xs text-rose-900 leading-relaxed">
            <strong>Reason:</strong> {transaction.disputes[0].reason} • <strong>Summary:</strong> {transaction.disputes[0].evidenceSummary}
          </p>
          {transaction.disputes[0].resolutionNotes && (
            <div className="p-3 bg-white rounded-[4px] border border-rose-200 text-xs text-gray-800 mt-2">
              <strong className="text-emerald-900 block">Adjudication Notes:</strong>
              {transaction.disputes[0].resolutionNotes}
            </div>
          )}
        </div>
      )}

      {/* Prototype Notice Banner */}
      <div className="p-4 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3 text-xs text-[#92400E] shadow-xs">
        <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold block text-[#B45309]">
            Payment Tracking — Prototype Simulation
          </span>
          <p className="leading-relaxed text-[#78350F]">
            {t.transactions.prototypeNotice} This is a prototype commercial tracking simulation. No real money movement, banking gateways, or escrow accounts are involved. Milestone transitions reflect operational dispatch, physical quality assaying, and direct counterparty confirmations.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9-STEP MILESTONE TIMELINE */}
      {/* ========================================================================= */}
      <Card className="bg-white border border-[#D8D2C4] shadow-none rounded-[8px]">
        <CardHeader className="p-4 pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
          <CardTitle className="text-sm font-bold font-heading text-[#262320] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1B4332]" />
            <span>{t.transactions.timelineTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <div className="min-w-[700px] flex items-center justify-between relative py-2">
            {/* Background Connector Line */}
            <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-[#D8D2C4] -translate-y-1/2 z-0" />

            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex || transaction.status === 'COMPLETED';
              const isCurrent = idx === currentStepIndex && transaction.status !== 'COMPLETED';
              return (
                <div key={step.key} className="flex flex-col items-center relative z-10 space-y-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#1B4332] text-white ring-4 ring-[#B7D5C4] animate-pulse'
                        : 'bg-white border-2 border-[#D8D2C4] text-[#635E59]'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold text-center max-w-[75px] leading-tight ${
                      isPast
                        ? 'text-[#1B4332]'
                        : isCurrent
                        ? 'text-[#1B4332] font-black'
                        : 'text-[#635E59] font-normal'
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
        {/* Section 1: Commercial Agreement Record */}
        <Card className="border border-[#D8D2C4] bg-white rounded-[8px] shadow-none">
          <CardHeader className="p-4 pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
            <CardTitle className="text-sm font-bold font-heading text-[#262320] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1B4332]" />
              <span>{t.transactions.commercialAgreement}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] space-y-0.5">
                <span className="text-[#635E59] text-[10px] font-bold uppercase">{t.transactions.farmerLabel}</span>
                <div className="font-bold text-[#262320]">{transaction.farmer.user.fullName}</div>
                <span className="text-[#635E59] text-[10px] block">{transaction.farmer.district}, Maharashtra</span>
              </div>
              <div className="p-2.5 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] space-y-0.5">
                <span className="text-[#635E59] text-[10px] font-bold uppercase">{t.transactions.buyerLabel}</span>
                <div className="font-bold text-[#262320] flex items-center gap-1">
                  <span>{transaction.buyer.companyName}</span>
                  {transaction.buyer.verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <span className="text-[#635E59] text-[10px] block">{transaction.buyer.buyerType} [Demo]</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between py-1 border-b border-[#D8D2C4]">
                <span className="text-[#635E59]">Commodity & Lot Code:</span>
                <span className="font-bold text-[#262320]">
                  <Link href={`/lots/${transaction.lot.id}`} className="text-[#1B4332] hover:underline">
                    {transaction.lot.commodity} ({transaction.lot.lotCode})
                  </Link>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D8D2C4]">
                <span className="text-[#635E59]">Agreed Quantity:</span>
                <span className="font-bold text-[#262320]">{transaction.quantityQuintals} Quintals</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D8D2C4]">
                <span className="text-[#635E59]">{t.transactions.agreedPricePerQtl}:</span>
                <span className="font-bold text-[#1B4332]">{formatINR(transaction.agreedPricePerQuintal)}/Qtl</span>
              </div>
              <div className="flex justify-between py-1.5 bg-[#EAF2ED] px-2.5 rounded-[4px] font-bold text-[#262320] border border-[#B7D5C4]">
                <span>{t.transactions.grossContractValue}:</span>
                <span className="text-sm font-black font-heading text-[#1B4332]">{formatINR(transaction.grossSaleValue)}</span>
              </div>
            </div>

            <p className="text-[10px] text-[#635E59] italic pt-1">
              * Structured digital record of agreed commercial terms. Non-binding prototype demonstration.
            </p>
          </CardContent>
        </Card>

        {/* Section 2: Produce & Quality (Strict Two-Tier Separation) */}
        <Card className="border border-[#D8D2C4] bg-white rounded-[8px] shadow-none">
          <CardHeader className="p-4 pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
            <CardTitle className="text-sm font-bold font-heading text-[#262320] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1B4332]" />
              <span>{t.transactions.qualityStatus}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            {/* Tier 2: Physical Verification */}
            <div className="p-3 bg-emerald-50/40 rounded-[6px] border border-[#B7D5C4] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1B4332] flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#1B4332]" />
                  <span>Tier 2: Physical Verification</span>
                </span>
                <Badge variant={physicalCert ? 'emerald' : 'gray'}>
                  {physicalCert ? 'PHYSICALLY_VERIFIED' : 'PENDING'}
                </Badge>
              </div>
              {physicalCert ? (
                <div className="space-y-0.5 text-[#262320] text-[11px] pt-1">
                  <div><strong>Official Grade:</strong> {physicalCert.officialGrade}</div>
                  <div><strong>Certificate No:</strong> <span className="font-mono">{physicalCert.certificateNumber}</span></div>
                  <div><strong>Inspecting Body:</strong> {physicalCert.inspector?.agencyName || 'MSAMB Quality Assurance Desk [Demo]'}</div>
                </div>
              ) : (
                <p className="text-[11px] text-[#635E59] italic">
                  Formal physical assay pending from authorized quality assayer.
                </p>
              )}
            </div>

            {/* Tier 1: AI Visual Screening (Zero Confidence Percentage Displayed) */}
            <div className="p-3 bg-amber-50/30 rounded-[6px] border border-dashed border-amber-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-700" />
                  <span>Tier 1: AI Visual Screening</span>
                </span>
                <Badge variant="amber" className="text-[10px] py-0 px-1.5 font-bold">
                  AI Assessment — Not Verified
                </Badge>
              </div>
              {aiAssessment ? (
                <div className="space-y-0.5 text-[#262320] text-[11px] pt-1">
                  <div><strong>Visual Estimate:</strong> {aiAssessment.estimatedGrade}</div>
                  <p className="text-[10px] text-[#78350F] italic leading-snug">
                    {aiAssessment.disclaimer || 'Preliminary screening based on submitted images. Physical verification required before settlement.'}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-[#635E59] italic">
                  Preliminary visual screening not recorded for this lot.
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
        {/* Section 3: Logistics & Transport */}
        <Card className="border border-[#D8D2C4] bg-white rounded-[8px] shadow-none">
          <CardHeader className="p-4 pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
            <CardTitle className="text-sm font-bold font-heading text-[#262320] flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-700" />
              <span>{t.transactions.transportStatus}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            {transportRequest ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#262320] flex items-center gap-1.5">
                    <span>{transportRequest.transporter?.businessName || 'Assigned Transporter'} [Demo]</span>
                    {transportRequest.transporter?.verified && (
                      <Badge variant="purple" className="text-[9px]">RTO Verified</Badge>
                    )}
                  </div>
                  <Badge variant="blue">{transportRequest.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#262320]">
                  <div className="p-2 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4]">
                    <span className="text-[#635E59] block text-[10px]">Pickup Origin</span>
                    <strong className="text-[#262320]">{transportRequest.pickupLocation}</strong>
                  </div>
                  <div className="p-2 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4]">
                    <span className="text-[#635E59] block text-[10px]">Destination Drop</span>
                    <strong className="text-[#262320]">{transportRequest.dropLocation}</strong>
                  </div>
                </div>

                <div className="flex justify-between py-1 border-t border-[#D8D2C4] text-[#635E59]">
                  <span>Corridor Distance:</span>
                  <span className="font-bold text-[#262320]">{transportRequest.distanceKm} km</span>
                </div>
                <div className="flex justify-between py-1 border-t border-[#D8D2C4] text-[#635E59]">
                  <span>Freight Cost:</span>
                  <span className="font-bold text-rose-800">{formatINR(transportRequest.estimatedCost)}</span>
                </div>
                {transportRequest.actualDelivery && (
                  <div className="flex justify-between py-1 bg-emerald-50 px-2 rounded-[4px] text-emerald-950 font-bold border border-emerald-200">
                    <span>e-POD Delivery Timestamp:</span>
                    <span>{new Date(transportRequest.actualDelivery).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-2 text-[#635E59]">
                <Truck className="w-6 h-6 mx-auto text-[#635E59] opacity-50" />
                <p>No active transport request linked yet.</p>
                <Link href={`/lots/${transaction.lot.id}`}>
                  <Button variant="outline" size="sm" className="text-xs border-[#D8D2C4]">
                    Book Logistics Dispatch
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Payment Tracking (Prototype Simulation) */}
        <Card className="border border-[#D8D2C4] bg-white rounded-[8px] shadow-none">
          <CardHeader className="p-4 pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold font-heading text-[#262320] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#1B4332]" />
                <span>{t.transactions.paymentTracking}</span>
              </CardTitle>
              <Badge variant={isPaid ? 'emerald' : 'blue'}>
                {latestPayment ? latestPayment.paymentStatus : 'PENDING'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="p-3 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#635E59]">Gross Contract Sum:</span>
                <span className="font-black font-heading text-[#262320]">{formatINR(transaction.grossSaleValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#635E59]">Demo Reference:</span>
                <span className="font-mono text-[#1B4332] font-bold">{latestPayment?.escrowReference || 'DEMO-PAY-2026-XXXX'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#635E59]">Simulation Method:</span>
                <span className="font-medium text-[#262320]">{latestPayment?.paymentMethod || 'ESCROW_GATEWAY'} [Demo]</span>
              </div>
            </div>

            {/* Prototype Milestone Stepper */}
            <div className="p-2.5 bg-emerald-50/40 rounded-[4px] border border-[#B7D5C4] space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                <span className="font-bold text-[#1B4332]">Offer Accepted & Prototype Escrow Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${latestPayment?.paymentStatus !== 'PENDING' ? 'text-[#1B4332]' : 'text-gray-300'}`} />
                <span className={latestPayment?.paymentStatus !== 'PENDING' ? 'font-bold text-[#1B4332]' : 'text-[#635E59]'}>
                  {t.transactions.paymentInitiated}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isPaid ? 'text-[#1B4332]' : 'text-gray-300'}`} />
                <span className={isPaid ? 'font-bold text-[#1B4332]' : 'text-[#635E59]'}>
                  {t.transactions.paymentPaid}
                </span>
              </div>
            </div>

            {/* Demo Mark Paid Action for Farmer */}
            {!isPaid && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleMarkPaymentReceived}
                  disabled={actionLoading}
                  className="w-full text-xs gap-1.5 shadow-none bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-[4px]"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{t.transactions.markPaymentReceivedBtn}</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: NET REALISATION ACCOUNTING */}
      {/* ========================================================================= */}
      <Card className="border border-[#1B4332] bg-[#1B4332] text-white rounded-[8px] shadow-xs">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-700/60 pb-3">
            <div>
              <span className="text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Transparent Net Realisation Ledger</span>
              </span>
              <h3 className="text-lg font-black font-heading text-white mt-0.5">{t.transactions.takeHomeEstimate}</h3>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-black font-heading text-emerald-300">
                {formatINR(transaction.netRealisation)}
              </div>
              <span className="text-xs text-emerald-200 font-mono">
                ({formatINR(Math.round(transaction.netRealisation / transaction.quantityQuintals))}/Qtl Estimated Net)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-white/10 rounded-[4px]">
              <span className="text-emerald-200 text-[10px] uppercase font-bold block">Gross Contract</span>
              <div className="font-black text-white text-sm">{formatINR(transaction.grossSaleValue)}</div>
              <span className="text-[10px] text-emerald-200 block">{formatINR(transaction.agreedPricePerQuintal)}/Qtl</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-[4px]">
              <span className="text-rose-300 text-[10px] uppercase font-bold block">− Freight Cost</span>
              <div className="font-black text-rose-300 text-sm">{formatINR(transaction.transportCost)}</div>
              <span className="text-[10px] text-rose-200 block">Logistics Corridor</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-[4px]">
              <span className="text-purple-300 text-[10px] uppercase font-bold block">− Storage Cost</span>
              <div className="font-black text-purple-300 text-sm">{formatINR(transaction.storageCost)}</div>
              <span className="text-[10px] text-purple-200 block">Direct Farmgate</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-[4px]">
              <span className="text-amber-300 text-[10px] uppercase font-bold block">− Other Mandi Fees</span>
              <div className="font-black text-amber-300 text-sm">{formatINR(transaction.otherCosts)}</div>
              <span className="text-[10px] text-amber-200 block">Handling & Loading</span>
            </div>
          </div>
          <p className="text-[10px] text-emerald-200/80 italic">
            * Estimated net realisation. Subject to final delivery weight and physical quality confirmation at buyer yard.
          </p>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION 6: TRUST & 3-WAY RATINGS */}
      {/* ========================================================================= */}
      <Card className="border border-[#D8D2C4] bg-white rounded-[8px] shadow-none">
        <CardHeader className="p-4 pb-3 border-b border-[#D8D2C4] bg-[#FAFAF8]">
          <CardTitle className="text-sm font-bold font-heading text-[#262320] flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{t.transactions.threeWayRatings}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <p className="text-xs text-[#635E59] leading-relaxed">
            Ratings are tied strictly to verified trade transactions. Arbitrary or unverified feedback is prohibited.
          </p>

          {/* Existing Ratings List */}
          {transaction.ratings.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#635E59] uppercase">Recorded Counterparty Feedback:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {transaction.ratings.map((r) => (
                  <div key={r.id} className="p-3 bg-[#FAFAF8] rounded-[4px] border border-[#D8D2C4] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#262320]">{r.rolePair.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-1 text-amber-600 font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{r.ratingScore} / 5</span>
                      </div>
                    </div>
                    {r.feedback && <p className="text-[#635E59] italic text-[11px]">&quot;{r.feedback}&quot;</p>}
                    <span className="text-[10px] text-[#635E59] block">
                      By {r.rater.fullName} on {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Rating Form (Available after delivery) */}
          {isDeliveredOrLater && (
            <form onSubmit={handleSubmitRating} className="p-4 bg-emerald-50/30 rounded-[6px] border border-[#B7D5C4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1B4332] text-xs">{t.transactions.rateThisTransaction}</span>
                <span className="text-[10px] text-[#1B4332] font-bold bg-[#EAF2ED] px-2 py-0.5 rounded-[4px] border border-[#B7D5C4]">
                  Verified Trade Counterparty
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#262320] font-medium mb-1">Select Counterparty Pair</label>
                  <select
                    value={ratingRolePair}
                    onChange={(e) => setRatingRolePair(e.target.value)}
                    className="w-full p-2 border border-[#D8D2C4] rounded-[4px] bg-white text-xs font-medium"
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
                  <label className="block text-[#262320] font-medium mb-1">Commercial Rating Score (1 to 5 Stars)</label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRatingScore(num)}
                        className={`w-8 h-8 rounded-[4px] flex items-center justify-center font-black transition-all ${
                          ratingScore >= num
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-stone-100 text-[#635E59] hover:bg-stone-200'
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
                <label className="block text-[#262320] font-medium mb-1 text-xs">Operational Feedback (Optional)</label>
                <input
                  type="text"
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder={t.transactions.ratingFeedbackPlaceholder}
                  className="w-full p-2 border border-[#D8D2C4] rounded-[4px] text-xs bg-white"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={actionLoading}
                  className="text-xs gap-1.5 shadow-none bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-[4px]"
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
          <div className="bg-white rounded-[8px] max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#D8D2C4]">
            <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-3">
              <h3 className="text-base font-black font-heading text-[#262320] flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-700" />
                <span>{t.disputes.raiseGrievanceTitle}</span>
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-[#635E59] hover:text-[#262320] font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#262320] mb-1">{t.disputes.categoryLabel}</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
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
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
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
                  onClick={() => setShowDisputeModal(false)}
                  className="border-[#D8D2C4]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={actionLoading}
                  className="bg-rose-700 hover:bg-rose-800 text-white rounded-[4px]"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
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
