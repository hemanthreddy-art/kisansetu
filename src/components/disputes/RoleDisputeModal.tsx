'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  AlertTriangle,
  Scale,
  CheckCircle2,
  X,
  CreditCard,
  Truck,
  Package,
  ShieldCheck,
  Building2,
  FileText,
  Paperclip,
  Mic,
  MicOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  MapPin,
} from 'lucide-react';

export interface RoleDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'FARMER' | 'BUYER' | 'TRANSPORTER';
  targetCounterparty?: 'FARMER' | 'BUYER' | 'TRANSPORTER';
  initialTransactionId?: string;
  initialLotId?: string;
  initialReason?: string;
  onDisputeSubmitted?: (disputeCode: string) => void;
}

interface TransactionRecord {
  id: string;
  transactionCode: string;
  status: string;
  agreedPricePerQuintal: number;
  quantityQuintals: number;
  grossSaleValue: number;
  transportCost: number;
  netRealisation: number;
  createdAt: string;
  lotId: string;
  lot?: {
    id: string;
    lotCode: string;
    commodity: string;
    variety?: string | null;
    quantityQuintals: number;
    expectedGrade?: string;
    mandi?: string;
    physicalVerifications?: Array<{
      officialGrade: string;
      certificateNumber: string;
      status: string;
    }>;
  };
  farmer?: {
    user?: { fullName: string; phone?: string };
  };
  buyer?: {
    companyName: string;
    user?: { fullName: string; phone?: string };
    buyerType?: string;
  };
  transporter?: {
    businessName: string;
    user?: { fullName: string; phone?: string };
  };
  payments?: Array<{
    paymentStatus: string;
    amount: number;
  }>;
}

interface EvidenceFile {
  name: string;
  sizeKb: number;
  type: string;
  dataUrl?: string;
}

export function RoleDisputeModal({
  isOpen,
  onClose,
  role,
  targetCounterparty,
  initialTransactionId,
  initialLotId,
  initialReason,
  onDisputeSubmitted,
}: RoleDisputeModalProps) {
  const { t, locale: language } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [, setLoadingTxns] = useState<boolean>(true);
  const [selectedTxnId, setSelectedTxnId] = useState<string>(initialTransactionId || '');
  const [selectedReason, setSelectedReason] = useState<string>(initialReason || '');
  const [evidenceSummary, setEvidenceSummary] = useState<string>('');
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedDisputeCode, setSubmittedDisputeCode] = useState<string | null>(null);

  // Structured Discrepancy Inputs
  const [actualDeliveredWeight, setActualDeliveredWeight] = useState<string>('');
  const [actualReceivedGrade, setActualReceivedGrade] = useState<string>('');
  const [actualReceivedVariety, setActualReceivedVariety] = useState<string>('');
  const [waitingHours, setWaitingHours] = useState<string>('');
  const [extraKm, setExtraKm] = useState<string>('');
  const [unpaidFreight, setUnpaidFreight] = useState<string>('');

  // Fetch transactions on mount
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchTransactions() {
      try {
        setLoadingTxns(true);
        const res = await fetch(`/api/transactions?role=${role}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            setTransactions(json.data);
            if (!selectedTxnId && json.data.length > 0) {
              const matched = initialTransactionId
                ? json.data.find((tx: TransactionRecord) => tx.id === initialTransactionId)
                : initialLotId
                ? json.data.find((tx: TransactionRecord) => tx.lotId === initialLotId)
                : json.data[0];
              if (matched) setSelectedTxnId(matched.id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch transactions for dispute modal:', err);
      } finally {
        if (isMounted) setLoadingTxns(false);
      }
    }

    fetchTransactions();
    return () => {
      isMounted = false;
    };
  }, [isOpen, role, initialTransactionId, initialLotId, selectedTxnId]);

  const selectedTxn = useMemo(
    () => transactions.find((tx) => tx.id === selectedTxnId) || transactions[0] || null,
    [transactions, selectedTxnId]
  );

  // Set default initial reason based on role
  useEffect(() => {
    if (initialReason) {
      setSelectedReason(initialReason);
    } else if (role === 'BUYER') {
      setSelectedReason('QUALITY_MISMATCH');
    } else if (role === 'TRANSPORTER') {
      setSelectedReason('FARMER_NOT_READY');
    } else {
      setSelectedReason('PAYMENT_NOT_RECEIVED');
    }
  }, [role, initialReason]);

  // Available categories based on active persona
  const categories = useMemo(() => {
    if (role === 'BUYER') {
      return [
        {
          key: 'CROP_VARIETY_MISMATCH',
          label: t.disputes.categoryCropVarietyMismatch || 'Crop Variety Mismatch',
          desc: 'Delivered produce is of a different variety than contracted',
          icon: Package,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
        },
        {
          key: 'QUALITY_MISMATCH',
          label: t.disputes.categoryQualityMismatch || 'Quality & Grade Discrepancy',
          desc: 'Moisture, foreign matter, rot, or size below promised grade',
          icon: Scale,
          color: 'text-rose-600 bg-rose-50 border-rose-200',
        },
        {
          key: 'QUANTITY_SHORTFALL',
          label: t.disputes.categoryQuantityShortfall || 'Quantity Shortfall / Weight Missing',
          desc: 'Weighbridge weight or bag count is less than contracted invoice',
          icon: Scale,
          color: 'text-orange-600 bg-orange-50 border-orange-200',
        },
        {
          key: 'MOISTURE_OR_FOREIGN_MATTER',
          label: t.disputes.categoryMoistureOrForeignMatter || 'High Moisture or Foreign Matter',
          desc: 'Moisture meter reading or debris exceeds contractual tolerance',
          icon: AlertTriangle,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
        },
        {
          key: 'PRODUCE_NOT_AS_LISTED',
          label: t.disputes.categoryProduceNotAsListed || 'Produce Not as Listed',
          desc: 'Crop is spoiled, immature, decayed, or severely damaged',
          icon: AlertCircle,
          color: 'text-red-600 bg-red-50 border-red-200',
        },
        {
          key: 'FARMER_FAILED_TO_DELIVER',
          label: t.disputes.categoryFarmerFailedToDeliver || 'Farmer Failed to Deliver / No-Show',
          desc: 'Farmer failed to provide produce at dispatch time',
          icon: X,
          color: 'text-slate-600 bg-slate-50 border-slate-200',
        },
        {
          key: 'DELIVERY_DELAY',
          label: t.disputes.categoryDeliveryDelay || 'Logistics / Delivery Delay',
          desc: 'Consignment arrived late causing factory or processing delay',
          icon: Clock,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
        },
        {
          key: 'PRODUCE_DAMAGED_IN_TRANSIT',
          label: t.disputes.categoryProduceDamagedInTransit || 'Produce Damaged in Transit',
          desc: 'Bags torn, crushed, or water-damaged during road transport',
          icon: Truck,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
        },
        {
          key: 'WRONG_DELIVERY_LOCATION',
          label: t.disputes.categoryWrongDeliveryLocation || 'Delivered at Wrong Location',
          desc: 'Consignment offloaded at incorrect warehouse or yard',
          icon: MapPin,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
        },
        {
          key: 'CONTRACT_OR_OFFER_ISSUE',
          label: t.disputes.categoryContractOrOfferIssue || 'Contract Terms Not Honored',
          desc: 'Discrepancy in agreed billing terms or platform payment rules',
          icon: FileText,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        },
        {
          key: 'FARMER_CANCELLATION',
          label: t.disputes.categoryFarmerCancellation || 'Farmer Unilateral Cancellation',
          desc: 'Farmer backed out of deal after buyer escrow confirmation',
          icon: AlertTriangle,
          color: 'text-rose-600 bg-rose-50 border-rose-200',
        },
        {
          key: 'OTHER',
          label: t.disputes.categoryOther || 'Other Issue',
          desc: 'Any other commercial or fulfillment dispute',
          icon: AlertCircle,
          color: 'text-slate-600 bg-slate-50 border-slate-200',
        },
      ];
    }

    if (role === 'TRANSPORTER') {
      return [
        {
          key: 'FARMER_NOT_READY',
          label: t.disputes.categoryFarmerNotReady || 'Farmer Not Ready at Scheduled Pickup',
          desc: 'Vehicle arrived at farm on time but farmer or produce was unavailable',
          icon: Clock,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
        },
        {
          key: 'LOADING_ISSUE',
          label: t.disputes.categoryLoadingIssue || 'Loading Delay / Refusal to Load',
          desc: 'Excessive waiting hours, labor shortage, or farmer refusal to load bags',
          icon: AlertCircle,
          color: 'text-orange-600 bg-orange-50 border-orange-200',
        },
        {
          key: 'WEIGHT_DISCREPANCY',
          label: t.disputes.categoryWeightDiscrepancy || 'Weight / Bags Discrepancy',
          desc: 'Actual loaded weight exceeds contracted freight capacity without compensation',
          icon: Scale,
          color: 'text-rose-600 bg-rose-50 border-rose-200',
        },
        {
          key: 'PICKUP_LOCATION_ISSUE',
          label: t.disputes.categoryPickupLocationIssue || 'Pickup Location Inaccessible / Bad Roads',
          desc: 'Reported farm location inaccurate or road impassable for assigned truck',
          icon: MapPin,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
        },
        {
          key: 'BUYER_DELIVERY_ISSUE',
          label: t.disputes.categoryBuyerDeliveryIssue || 'Buyer Unloading Issue / Gate Closed',
          desc: 'Buyer rejected unloading, warehouse closed, or unreachable at destination',
          icon: Building2,
          color: 'text-red-600 bg-red-50 border-red-200',
        },
        {
          key: 'DELIVERY_INSTRUCTION_CHANGED',
          label: t.disputes.categoryDeliveryInstructionChanged || 'Delivery Route Changed Mid-Transit',
          desc: 'Destination redirected mid-journey requiring additional unagreed mileage',
          icon: Truck,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
        },
        {
          key: 'FREIGHT_PAYMENT_ISSUE',
          label: t.disputes.categoryFreightPaymentIssue || 'Freight Payment Unpaid or Delayed',
          desc: 'Agreed transport freight withheld, delayed, or deducted without justification',
          icon: CreditCard,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        },
        {
          key: 'CANCELLATION_AFTER_CONFIRMATION',
          label: t.disputes.categoryCancellationAfterConfirmation || 'Cancelled After Dispatch / Dead Mileage',
          desc: 'Trip cancelled by farmer/buyer after truck was mobilized to pickup point',
          icon: AlertTriangle,
          color: 'text-rose-600 bg-rose-50 border-rose-200',
        },
        {
          key: 'UNSAFE_OR_IMPOSSIBLE_PICKUP',
          label: t.disputes.categoryUnsafeOrImpossiblePickup || 'Unsafe or Impossible Pickup Condition',
          desc: 'Severe weather, flooded approach, or hazardous condition preventing haul',
          icon: AlertTriangle,
          color: 'text-slate-600 bg-slate-50 border-slate-200',
        },
        {
          key: 'OTHER',
          label: t.disputes.categoryOther || 'Other Issue',
          desc: 'Other logistics or haul payment dispute',
          icon: AlertCircle,
          color: 'text-slate-600 bg-slate-50 border-slate-200',
        },
      ];
    }

    // Default Farmer Categories
    return [
      {
        key: 'PAYMENT_NOT_RECEIVED',
        label: t.disputes.categoryPaymentNotReceived || 'Payment Not Received',
        desc: 'Produce delivered but escrow/buyer settlement has not reached account',
        icon: CreditCard,
        color: 'text-red-600 bg-red-50 border-red-200',
      },
      {
        key: 'PAYMENT_INCORRECT',
        label: t.disputes.categoryPaymentIncorrect || 'Payment Amount Incorrect',
        desc: 'Received amount is less than agreed Net Realisation contract value',
        icon: Scale,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
      },
      {
        key: 'WEIGHT_DISCREPANCY',
        label: t.disputes.categoryWeightDiscrepancy || 'Weight / Quantity Disagreement',
        desc: 'Buyer weighbridge recorded less weight than farm-gate scale',
        icon: Scale,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
      },
      {
        key: 'QUALITY_MISMATCH',
        label: t.disputes.categoryQualityMismatch || 'Quality / Grade Disagreement',
        desc: 'Buyer disputes official assessor grade or deducted price post-delivery',
        icon: ShieldCheck,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
      },
      {
        key: 'PRODUCE_DAMAGED',
        label: t.disputes.categoryProduceDamaged || 'Produce Damaged During Transit',
        desc: 'Loss or spoilage occurred while cargo was in transporter custody',
        icon: Truck,
        color: 'text-rose-600 bg-rose-50 border-rose-200',
      },
      {
        key: 'TRANSPORTER_NO_SHOW',
        label: t.disputes.categoryTransporterNoShow || 'Transporter No-Show at Scheduled Time',
        desc: 'Assigned transporter failed to arrive at pickup location',
        icon: Clock,
        color: 'text-orange-600 bg-orange-50 border-orange-200',
      },
      {
        key: 'PICKUP_DELAYED',
        label: t.disputes.categoryPickupDelayed || 'Pickup Delayed Beyond Agreed Window',
        desc: 'Truck arrival delayed causing harvest deterioration or logistics disruption',
        icon: Clock,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
      },
      {
        key: 'BUYER_ISSUE',
        label: t.disputes.categoryBuyerIssue || 'Buyer Issue / Non-Responsiveness',
        desc: 'Buyer unreachable, delaying unloading, or refusing delivery without cause',
        icon: Building2,
        color: 'text-slate-600 bg-slate-50 border-slate-200',
      },
      {
        key: 'CONTRACT_ISSUE',
        label: t.disputes.categoryContractIssue || 'Contract / Offer Terms Issue',
        desc: 'Discrepancy in agreed digital contract terms or deductions',
        icon: FileText,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      },
      {
        key: 'OTHER',
        label: t.disputes.categoryOther || 'Other Problem',
        desc: 'Any other commercial or fulfillment issue requiring mediation',
        icon: AlertCircle,
        color: 'text-slate-600 bg-slate-50 border-slate-200',
      },
    ];
  }, [role, t]);

  // Determine Counterparty Name and Role
  const counterpartyInfo = useMemo(() => {
    if (!selectedTxn) {
      return {
        role: targetCounterparty || (role === 'BUYER' ? 'FARMER' : role === 'TRANSPORTER' ? 'BUYER' : 'BUYER'),
        name: 'Counterparty',
        contact: 'Not recorded',
      };
    }

    if (role === 'BUYER') {
      const isTransporterTarget =
        targetCounterparty === 'TRANSPORTER' ||
        selectedReason === 'PRODUCE_DAMAGED_IN_TRANSIT' ||
        selectedReason === 'DELIVERY_DELAY' ||
        selectedReason === 'WRONG_DELIVERY_LOCATION';

      if (isTransporterTarget && selectedTxn.transporter) {
        return {
          role: 'TRANSPORTER' as const,
          name: selectedTxn.transporter.businessName,
          contact: selectedTxn.transporter.user?.phone || 'Not recorded',
        };
      }
      return {
        role: 'FARMER' as const,
        name: selectedTxn.farmer?.user?.fullName || 'Farmer Partner',
        contact: selectedTxn.farmer?.user?.phone || 'Not recorded',
      };
    }

    if (role === 'TRANSPORTER') {
      const isFarmerTarget =
        targetCounterparty === 'FARMER' ||
        selectedReason === 'FARMER_NOT_READY' ||
        selectedReason === 'LOADING_ISSUE' ||
        selectedReason === 'PICKUP_LOCATION_ISSUE';

      if (isFarmerTarget) {
        return {
          role: 'FARMER' as const,
          name: selectedTxn.farmer?.user?.fullName || 'Farmer Partner',
          contact: selectedTxn.farmer?.user?.phone || 'Not recorded',
        };
      }
      return {
        role: 'BUYER' as const,
        name: selectedTxn.buyer?.companyName || selectedTxn.buyer?.user?.fullName || 'Buyer Entity',
        contact: selectedTxn.buyer?.user?.phone || 'Not recorded',
      };
    }

    // role === 'FARMER'
    const isTransporterTarget =
      targetCounterparty === 'TRANSPORTER' ||
      selectedReason === 'TRANSPORT_ISSUE' ||
      selectedReason === 'PRODUCE_DAMAGED' ||
      selectedReason === 'TRANSPORTER_NO_SHOW' ||
      selectedReason === 'PICKUP_DELAYED';

    if (isTransporterTarget && selectedTxn.transporter) {
      return {
        role: 'TRANSPORTER' as const,
        name: selectedTxn.transporter.businessName,
        contact: selectedTxn.transporter.user?.phone || 'Not recorded',
      };
    }
    return {
      role: 'BUYER' as const,
      name: selectedTxn.buyer?.companyName || selectedTxn.buyer?.user?.fullName || 'Buyer Partner',
      contact: selectedTxn.buyer?.user?.phone || 'Not recorded',
    };
  }, [selectedTxn, role, targetCounterparty, selectedReason]);

  // Compute Promised vs Actual Metrics
  const promisedVsActualList = useMemo(() => {
    if (!selectedTxn) return [];

    const notRec = t.disputes.promisedNotRecorded || 'Not recorded';

    if (role === 'BUYER') {
      const contractedQty = `${selectedTxn.quantityQuintals} qtl`;
      const deliveredQtyVal = actualDeliveredWeight.trim() ? `${actualDeliveredWeight.trim()} qtl` : notRec;
      const shortfallVal =
        actualDeliveredWeight.trim() && !isNaN(Number(actualDeliveredWeight))
          ? `${(selectedTxn.quantityQuintals - Number(actualDeliveredWeight)).toFixed(1)} qtl`
          : notRec;

      const agreedVariety = selectedTxn.lot?.variety || selectedTxn.lot?.commodity || notRec;
      const deliveredVarietyVal = actualReceivedVariety.trim() || notRec;

      const agreedGrade = selectedTxn.lot?.expectedGrade || 'Grade A';
      const verifiedGrade =
        selectedTxn.lot?.physicalVerifications?.[0]?.officialGrade ||
        actualReceivedGrade.trim() ||
        notRec;

      const scheduledDelivery = `${new Date(selectedTxn.createdAt).toLocaleDateString()} (Contract Window)`;
      const actualDelivery =
        selectedTxn.status === 'DELIVERED' || selectedTxn.status === 'COMPLETED'
          ? `${new Date().toLocaleDateString()}`
          : notRec;

      const agreedPrice = `${formatINR(selectedTxn.agreedPricePerQuintal)} /qtl`;
      const billedPrice = `${formatINR(selectedTxn.agreedPricePerQuintal)} /qtl`;

      return [
        {
          metric: t.disputes.promisedMetric || 'Quantity (qtl)',
          promised: contractedQty,
          actual: deliveredQtyVal,
          shortfall: shortfallVal,
        },
        {
          metric: t.disputes.promisedAgreedVariety || 'Crop Variety',
          promised: agreedVariety,
          actual: deliveredVarietyVal,
          shortfall: deliveredVarietyVal !== notRec && deliveredVarietyVal !== agreedVariety ? 'Mismatch' : notRec,
        },
        {
          metric: t.disputes.promisedAgreedGrade || 'Quality Grade',
          promised: agreedGrade,
          actual: verifiedGrade,
          shortfall: verifiedGrade !== notRec && verifiedGrade !== agreedGrade ? 'Grade Discrepancy' : notRec,
        },
        {
          metric: t.disputes.promisedScheduledDelivery || 'Delivery Window',
          promised: scheduledDelivery,
          actual: actualDelivery,
          shortfall: notRec,
        },
        {
          metric: t.disputes.promisedAgreedPrice || 'Contract Price',
          promised: agreedPrice,
          actual: billedPrice,
          shortfall: '₹0 (Match)',
        },
      ];
    }

    if (role === 'TRANSPORTER') {
      const scheduledPickup = `${new Date(selectedTxn.createdAt).toLocaleDateString()} 09:00 AM`;
      const actualArrivalVal = waitingHours.trim() ? `Delayed by +${waitingHours.trim()}h` : notRec;

      const requestedQty = `${selectedTxn.quantityQuintals} qtl`;
      const loadedQtyVal = actualDeliveredWeight.trim() ? `${actualDeliveredWeight.trim()} qtl` : notRec;
      const excessWeightVal =
        actualDeliveredWeight.trim() && !isNaN(Number(actualDeliveredWeight))
          ? `${(Number(actualDeliveredWeight) - selectedTxn.quantityQuintals).toFixed(1)} qtl excess`
          : notRec;

      const agreedPickupLoc = selectedTxn.lot?.mandi || 'Farm Gate';
      const actualLocVal = extraKm.trim() ? `+${extraKm.trim()} km road detour` : notRec;

      const agreedFreight = formatINR(selectedTxn.transportCost || 0);
      const claimedFreightVal = unpaidFreight.trim() ? `Claiming ${formatINR(Number(unpaidFreight))}` : notRec;

      return [
        {
          metric: t.disputes.promisedScheduledPickup || 'Pickup Time',
          promised: scheduledPickup,
          actual: actualArrivalVal,
          shortfall: waitingHours.trim() ? `${waitingHours.trim()}h waiting delay` : notRec,
        },
        {
          metric: t.disputes.promisedContracted || 'Loaded Quantity',
          promised: requestedQty,
          actual: loadedQtyVal,
          shortfall: excessWeightVal,
        },
        {
          metric: 'Pickup Location / Route',
          promised: agreedPickupLoc,
          actual: actualLocVal,
          shortfall: extraKm.trim() ? `+${extraKm.trim()} km extra` : notRec,
        },
        {
          metric: t.disputes.promisedAgreedFreight || 'Agreed Freight',
          promised: agreedFreight,
          actual: claimedFreightVal,
          shortfall: unpaidFreight.trim() ? `Unpaid / Disputed` : notRec,
        },
      ];
    }

    // Default Farmer Comparison
    const contractedQty = `${selectedTxn.quantityQuintals} qtl`;
    const agreedGrade = selectedTxn.lot?.expectedGrade || 'Grade A';
    const verifiedGrade = selectedTxn.lot?.physicalVerifications?.[0]?.officialGrade || notRec;
    const agreedPrice = `${formatINR(selectedTxn.agreedPricePerQuintal)} /qtl`;
    const netRealisation = formatINR(selectedTxn.netRealisation || selectedTxn.grossSaleValue);

    return [
      {
        metric: 'Contract Quantity',
        promised: contractedQty,
        actual: contractedQty,
        shortfall: notRec,
      },
      {
        metric: 'Quality Grade',
        promised: agreedGrade,
        actual: verifiedGrade,
        shortfall: verifiedGrade !== notRec && verifiedGrade !== agreedGrade ? 'Grade Discrepancy' : notRec,
      },
      {
        metric: 'Agreed Price / Quintal',
        promised: agreedPrice,
        actual: agreedPrice,
        shortfall: '₹0 (Match)',
      },
      {
        metric: 'Net Realisation Take-Home',
        promised: netRealisation,
        actual:
          selectedTxn.payments && selectedTxn.payments.length > 0
            ? formatINR(selectedTxn.payments.reduce((acc, p) => acc + p.amount, 0))
            : notRec,
        shortfall: notRec,
      },
    ];
  }, [
    selectedTxn,
    role,
    t,
    actualDeliveredWeight,
    actualReceivedGrade,
    actualReceivedVariety,
    waitingHours,
    extraKm,
    unpaidFreight,
  ]);

  // Voice Dictation Helper
  const handleToggleDictation = () => {
    if (isDictating) {
      setIsDictating(false);
      return;
    }

    interface SpeechResultItem {
      transcript: string;
    }
    interface SpeechEvent {
      results: Array<Array<SpeechResultItem>>;
    }
    interface SpeechInstance {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: (event: SpeechEvent) => void;
      onerror: () => void;
      onend?: () => void;
      start: () => void;
    }
    type SpeechConstructor = new () => SpeechInstance;

    // Check browser speech recognition support
    const WinSpeech = window as unknown as {
      SpeechRecognition?: SpeechConstructor;
      webkitSpeechRecognition?: SpeechConstructor;
    };
    const SpeechRecognitionClass = WinSpeech.SpeechRecognition || WinSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert('Speech recognition is not supported in this browser. Please type your explanation.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Locale mapping
      if (language === 'mr') recognition.lang = 'mr-IN';
      else if (language === 'te') recognition.lang = 'te-IN';
      else if (language === 'hi') recognition.lang = 'hi-IN';
      else recognition.lang = 'en-IN';

      setIsDictating(true);

      recognition.onresult = (event: SpeechEvent) => {
        const transcript = event.results[0][0].transcript;
        setEvidenceSummary((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsDictating(false);
      };

      recognition.onerror = () => {
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsDictating(false);
    }
  };

  // Mock Evidence Upload Simulation
  const handleSimulateFileUpload = () => {
    const fileTypes = [
      { name: 'weighbridge_slip_wb892.pdf', sizeKb: 340, type: 'application/pdf' },
      { name: 'delivered_produce_sample.jpg', sizeKb: 850, type: 'image/jpeg' },
      { name: 'moisture_meter_report.pdf', sizeKb: 210, type: 'application/pdf' },
      { name: 'unloading_gate_receipt.jpg', sizeKb: 620, type: 'image/jpeg' },
    ];
    const picked = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const alreadyExists = evidenceFiles.some((f) => f.name === picked.name);
    if (!alreadyExists) {
      setEvidenceFiles((prev) => [...prev, picked]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Complaint
  const handleSubmitComplaint = async () => {
    if (!selectedTxn) {
      setSubmitError('No transaction selected.');
      return;
    }

    if (!evidenceSummary.trim() || evidenceSummary.trim().length < 5) {
      setSubmitError('Please provide a detailed explanation of the issue (minimum 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        transactionId: selectedTxn.id,
        role,
        reason: selectedReason,
        evidenceSummary: evidenceSummary.trim(),
        evidenceFilesJson: {
          files: evidenceFiles,
          counterparty: counterpartyInfo,
          promisedVsActual: promisedVsActualList,
          structuredDiscrepancy: {
            actualDeliveredWeight: actualDeliveredWeight || null,
            actualReceivedGrade: actualReceivedGrade || null,
            actualReceivedVariety: actualReceivedVariety || null,
            waitingHours: waitingHours || null,
            extraKm: extraKm || null,
            unpaidFreight: unpaidFreight || null,
          },
        },
      };

      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit grievance');
      }

      setSubmittedDisputeCode(json.dispute.disputeCode);
      setStep(5);
      if (onDisputeSubmitted) {
        onDisputeSubmitted(json.dispute.disputeCode);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEvidenceSummary('');
    setEvidenceFiles([]);
    setSubmitError(null);
    setSubmittedDisputeCode(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {t.disputes.raiseGrievanceTitle || 'Report an Issue / Raise Complaint'}
                </h2>
                <Badge variant="amber" className="font-semibold text-xs">
                  {role} PORTAL
                </Badge>
              </div>
              <p className="text-xs text-slate-300">
                {t.disputes.hubSubtitle ||
                  'Transparent, evidence-based dispute redressal conducted with human officer oversight'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {step < 5 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary font-bold' : 'text-slate-400'}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                1
              </div>
              <span>1. {t.disputes.stepSelectProblem || 'Problem'}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary font-bold' : 'text-slate-400'}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                2
              </div>
              <span>2. {t.disputes.stepVerifyDetails || 'Verify & Comparison'}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary font-bold' : 'text-slate-400'}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </div>
              <span>3. {t.disputes.stepAddEvidence || 'Evidence'}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <div className={`flex items-center gap-2 ${step >= 4 ? 'text-primary font-bold' : 'text-slate-400'}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 4 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                4
              </div>
              <span>4. {t.disputes.stepReviewSubmit || 'Confirm'}</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Select Category */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t.disputes.stepSelectProblem || 'What issue are you facing with this trade?'}
                </h3>
                <p className="text-xs text-slate-500">
                  Select the category that best describes your discrepancy. Official reviewers evaluate based on this classification.
                </p>
              </div>

              {/* Transaction Selector */}
              {transactions.length > 1 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Transaction / Order to Dispute:
                  </label>
                  <select
                    value={selectedTxnId}
                    onChange={(e) => setSelectedTxnId(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {transactions.map((tx) => (
                      <option key={tx.id} value={tx.id}>
                        {tx.transactionCode} — {tx.lot?.commodity || 'Produce'} ({tx.quantityQuintals} qtl) ·{' '}
                        {role === 'BUYER'
                          ? `Farmer: ${tx.farmer?.user?.fullName || 'Farmer Partner'}`
                          : `Buyer: ${tx.buyer?.companyName || 'Buyer'}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedReason === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedReason(cat.key)}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 leading-snug">{cat.label}</p>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Trade Details & Promised vs Actual Comparison */}
          {step === 2 && selectedTxn && (
            <div className="space-y-5">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">
                    {t.disputes.stepVerifyDetails || 'Automatically Attached Trade Records'}
                  </p>
                  <p className="text-blue-700 mt-0.5">
                    {t.disputes.autoAttachedNotice ||
                      'Transaction, lot, buyer, transporter, and escrow records were automatically attached.'}
                  </p>
                </div>
              </div>

              {/* Trade Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Order Code</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedTxn.transactionCode}</p>
                  <Badge variant="blue" className="mt-1 text-[10px]">
                    {selectedTxn.status}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Lot & Commodity</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {selectedTxn.lot?.commodity || 'Produce'}{' '}
                    {selectedTxn.lot?.variety ? `(${selectedTxn.lot.variety})` : ''}
                  </p>
                  <p className="text-[11px] text-slate-500">{selectedTxn.quantityQuintals} Quintals</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {t.disputes.complaintAgainst || 'Target Counterparty'}
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{counterpartyInfo.name}</p>
                  <Badge variant="gray" className="mt-1 text-[10px]">
                    {counterpartyInfo.role}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Financial Terms</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {formatINR(selectedTxn.agreedPricePerQuintal)} /qtl
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    Net: {formatINR(selectedTxn.netRealisation || selectedTxn.grossSaleValue)}
                  </p>
                </div>
              </div>

              {/* PROMISED VS ACTUAL COMPARISON ENGINE */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      {t.disputes.promisedVsActualTitle || 'Promised vs Actual Verification'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 italic">
                    Values absent in platform records marked as &quot;Not recorded&quot;
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4 font-bold">{t.disputes.promisedMetric || 'Metric'}</th>
                        <th className="py-2.5 px-4 font-bold text-slate-700">
                          {t.disputes.promisedContracted || 'Contracted / Promised'}
                        </th>
                        <th className="py-2.5 px-4 font-bold text-slate-700">
                          {t.disputes.promisedDelivered || 'Delivered / Recorded'}
                        </th>
                        <th className="py-2.5 px-4 font-bold text-slate-700">
                          {t.disputes.promisedShortfall || 'Discrepancy / Shortfall'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {promisedVsActualList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-medium text-slate-800">{row.metric}</td>
                          <td className="py-2.5 px-4 text-slate-900 font-semibold">{row.promised}</td>
                          <td className="py-2.5 px-4">
                            {row.actual === (t.disputes.promisedNotRecorded || 'Not recorded') ? (
                              <span className="text-slate-400 italic">
                                {t.disputes.promisedNotRecorded || 'Not recorded'}
                              </span>
                            ) : (
                              <span className="text-slate-900 font-semibold">{row.actual}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            {row.shortfall === (t.disputes.promisedNotRecorded || 'Not recorded') ? (
                              <span className="text-slate-400 italic">—</span>
                            ) : (
                              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {row.shortfall}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Structured Discrepancy Inputs */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Record Specific Discrepancy Inputs (Optional)
                </h4>

                {role === 'BUYER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.disputes.deliveredWeightLabel || 'Actual Delivered Weight (qtl)'}:
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 85.5"
                        value={actualDeliveredWeight}
                        onChange={(e) => setActualDeliveredWeight(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.disputes.promisedDeliveredVariety || 'Actual Delivered Variety'}:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hybrid Red instead of Garwa"
                        value={actualReceivedVariety}
                        onChange={(e) => setActualReceivedVariety(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.disputes.promisedVerifiedGrade || 'Verified Grade / Moisture'}:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Grade B / 16% moisture"
                        value={actualReceivedGrade}
                        onChange={(e) => setActualReceivedGrade(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {role === 'TRANSPORTER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.disputes.waitingHoursLabel || 'Extra Waiting Hours'}:
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 4.5"
                        value={waitingHours}
                        onChange={(e) => setWaitingHours(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.disputes.extraKmLabel || 'Extra Kilometers Travelled'}:
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 25"
                        value={extraKm}
                        onChange={(e) => setExtraKm(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.disputes.promisedClaimedFreight || 'Claimed / Unpaid Freight (₹)'}:
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2500"
                        value={unpaidFreight}
                        onChange={(e) => setUnpaidFreight(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Evidence & Voice Dictation */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t.disputes.stepAddEvidence || 'Explain the Problem & Attach Evidence'}
                </h3>
                <p className="text-xs text-slate-500">
                  Detail what happened. You may use voice-to-text dictation in your regional language.
                </p>
              </div>

              {/* Text Description with Speech Dictation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t.disputes.descriptionLabel || 'Detailed Description'}:
                  </label>
                  <Button
                    type="button"
                    variant={isDictating ? 'primary' : 'outline'}
                    size="sm"
                    onClick={handleToggleDictation}
                    className="flex items-center gap-1.5 text-xs py-1 px-2.5 h-auto"
                  >
                    {isDictating ? (
                      <MicOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span>
                      {isDictating
                        ? t.disputes.voiceDictationActive || 'Listening...'
                        : t.disputes.voiceDictationBtn || 'Speak to dictate'}
                    </span>
                  </Button>
                </div>
                <textarea
                  rows={4}
                  value={evidenceSummary}
                  onChange={(e) => setEvidenceSummary(e.target.value)}
                  placeholder={
                    role === 'BUYER'
                      ? 'Detail discrepancy in received quantity, grade, moisture meter reading, or variety mismatch...'
                      : role === 'TRANSPORTER'
                      ? 'Detail loading delay hours, inaccessible farm road, buyer refusal to unload, or unpaid freight...'
                      : t.disputes.descriptionPlaceholder ||
                        'Detail specific issues regarding weight, grade mismatch, delivery delay, or payment...'
                  }
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Minimum 5 characters required for administrative review</span>
                  <span>{evidenceSummary.length} characters</span>
                </div>
              </div>

              {/* Supporting Document / Slip Attachments */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    {t.disputes.evidenceOptional || 'Add supporting documents / photos (optional)'}:
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSimulateFileUpload}
                    className="text-xs py-1 px-2.5 h-auto flex items-center gap-1.5"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{t.disputes.photoOrDocUpload || 'Upload Photo / Weighing Slip'}</span>
                  </Button>
                </div>

                {evidenceFiles.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
                    <p className="text-xs text-slate-500">
                      No documents attached yet. You can attach weighbridge slips, moisture tests, or unloading photos.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {evidenceFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400">{file.sizeKb} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1 text-slate-400 hover:text-red-500 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Consequential Confirmation */}
          {step === 4 && selectedTxn && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">
                    {t.disputes.confirmSubmissionTitle || 'Review & Confirm Complaint Submission'}
                  </p>
                  <p className="text-amber-700 mt-0.5">
                    {t.disputes.confirmSubmissionDesc ||
                      'Submitting this grievance will pause automatic transaction completion and notify the authorized grievance officer for administrative examination.'}
                  </p>
                </div>
              </div>

              {/* Review Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-600">Dispute Category:</span>
                  <Badge variant="amber" className="font-bold">
                    {selectedReason.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporting Persona</span>
                    <span className="font-bold text-slate-800">{role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Counterparty</span>
                    <span className="font-bold text-slate-800">
                      {counterpartyInfo.name} ({counterpartyInfo.role})
                    </span>
                  </div>
                </div>

                {/* Promised vs Actual Summary Table */}
                <div className="pt-1">
                  <span className="font-bold text-slate-700 block mb-1.5 uppercase text-[10px]">
                    Promised vs Actual Comparison
                  </span>
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-1.5 px-3">Metric</th>
                          <th className="py-1.5 px-3">Promised</th>
                          <th className="py-1.5 px-3">Actual</th>
                          <th className="py-1.5 px-3">Discrepancy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {promisedVsActualList.map((row, i) => (
                          <tr key={i}>
                            <td className="py-1.5 px-3 text-slate-700 font-medium">{row.metric}</td>
                            <td className="py-1.5 px-3 font-semibold">{row.promised}</td>
                            <td className="py-1.5 px-3">{row.actual}</td>
                            <td className="py-1.5 px-3 font-bold text-amber-700">{row.shortfall}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="font-bold text-slate-600 block mb-1">Your Explanation:</span>
                  <p className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 italic leading-relaxed">
                    &ldquo;{evidenceSummary}&rdquo;
                  </p>
                </div>

                {evidenceFiles.length > 0 && (
                  <div className="pt-1">
                    <span className="font-bold text-slate-600 block mb-1">Attached Files ({evidenceFiles.length}):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {evidenceFiles.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px]">
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Success & Tracking */}
          {step === 5 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.disputes.complaintSubmittedTitle || 'Grievance Formally Registered'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {t.disputes.complaintSubmittedDesc ||
                    'Your grievance has been safely logged. An authorized review officer will examine digital contract records and attached evidence.'}
                </p>
              </div>

              {submittedDisputeCode && (
                <div className="inline-block px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Complaint Tracking Code</span>
                  <span className="text-sm font-mono font-bold text-primary">{submittedDisputeCode}</span>
                </div>
              )}

              <div className="pt-4">
                <Button variant="primary" size="md" onClick={handleClose} className="px-6">
                  {t.disputes.trackComplaintBtn || 'Done & Track Status'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step < 5 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
                disabled={submitting}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
            )}

            <div className="flex items-center gap-2">
              {step < 4 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (step === 1 && !selectedReason) {
                      alert('Please select a problem category.');
                      return;
                    }
                    if (step === 3 && (!evidenceSummary.trim() || evidenceSummary.trim().length < 5)) {
                      alert('Please provide at least 5 characters describing the discrepancy.');
                      return;
                    }
                    setStep((prev) => (prev + 1) as 2 | 3 | 4);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitComplaint}
                  disabled={submitting}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.disputes.submitGrievanceBtn || 'Confirm & Submit Complaint'}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
