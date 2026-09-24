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
} from 'lucide-react';

export interface FarmerDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    physicalVerifications?: Array<{
      officialGrade: string;
      certificateNumber: string;
      status: string;
    }>;
  };
  buyer?: {
    companyName: string;
    buyerType?: string;
  };
  transporter?: {
    businessName: string;
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

export function FarmerDisputeModal({
  isOpen,
  onClose,
  initialTransactionId,
  initialLotId,
  initialReason = 'PAYMENT_NOT_RECEIVED',
  onDisputeSubmitted,
}: FarmerDisputeModalProps) {
  const { t, locale: language } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedReason, setSelectedReason] = useState<string>(initialReason);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loadingTxns, setLoadingTxns] = useState<boolean>(true);
  const [selectedTxnId, setSelectedTxnId] = useState<string>(initialTransactionId || '');
  const [evidenceSummary, setEvidenceSummary] = useState<string>('');
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdDispute, setCreatedDispute] = useState<{
    disputeCode: string;
    createdAt: string;
  } | null>(null);

  // 10 farmer-friendly dispute problem categories
  const categories = useMemo(() => [
    {
      id: 'PAYMENT_NOT_RECEIVED',
      icon: CreditCard,
      label: t.disputes.categoryPaymentNotReceived || 'Payment Not Received',
      desc: language === 'mr' ? 'खरेदीदाराकडून ठरलेली रक्कम बँकेत जमा झाली नाही' : language === 'te' ? 'చెల్లింపు ఇంకా బ్యాంకులో జమ కాలేదు' : language === 'hi' ? 'तय समय पर बैंक खाते में भुगतान नहीं मिला' : 'Agreed settlement amount not credited to farmer account',
      severity: 'critical',
    },
    {
      id: 'PAYMENT_INCORRECT',
      icon: Scale,
      label: t.disputes.categoryPaymentIncorrect || 'Payment Amount Incorrect',
      desc: language === 'mr' ? 'प्रत्यक्ष जमा झालेली रक्कम ठरलेल्या रकमेपेक्षा कमी आहे' : language === 'te' ? 'జమ అయిన మొత్తం అంగీకరించిన దానికంటే తక్కువగా ఉంది' : language === 'hi' ? 'प्राप्त राशि तय सौदे से कम है' : 'Amount credited is less than agreed Net Realisation',
      severity: 'critical',
    },
    {
      id: 'WEIGHT_DISCREPANCY',
      icon: Scale,
      label: t.disputes.categoryWeightDiscrepancy || 'Weight / Quantity Disagreement',
      desc: language === 'mr' ? 'वजनकाट्यावर दाखवलेले वजन शेतातील वजनाशी जुळत नाही' : language === 'te' ? 'వేబ్రిడ్జి బరువు పొలంలో తూకం కంటే తక్కువగా ఉంది' : language === 'hi' ? 'धर्मकांटा वजन में अत्यधिक अंतर या अनुचित घटत' : 'Weighbridge reading differs from farm-gate recorded weight',
      severity: 'high',
    },
    {
      id: 'QUALITY_MISMATCH',
      icon: ShieldCheck,
      label: t.disputes.categoryQualityMismatch || 'Quality / Grade Disagreement',
      desc: language === 'mr' ? 'खरेदीदाराने मालाची प्रतवारी अयोग्य ठरवून दर कमी केला' : language === 'te' ? 'కొనుగోలుదారు గ్రేడ్‌ను తప్పుగా తిరస్కరించారు' : language === 'hi' ? 'खरीदार द्वारा गलत ग्रेड बताकर अनुचित कटौती' : 'Buyer unilaterally disputed grade or rejected verified lot',
      severity: 'high',
    },
    {
      id: 'PRODUCE_DAMAGED',
      icon: AlertTriangle,
      label: t.disputes.categoryProduceDamaged || 'Produce Damaged During Transit',
      desc: language === 'mr' ? 'गाडीतील निष्काळजीपणामुळे शेतीमालाचे नुकसान झाले' : language === 'te' ? 'రవాణాలో పంట వర్షం లేదా ప్రమాదం వల్ల దెబ్బతిన్నది' : language === 'hi' ? 'गाड़ी में ढुलाई के दौरान माल की टूट-फूट या नुकसान' : 'Produce physically damaged due to improper transport handling',
      severity: 'high',
    },
    {
      id: 'TRANSPORT_ISSUE',
      icon: Truck,
      label: t.disputes.categoryTransportIssue || 'Transport / Vehicle Issue',
      desc: language === 'mr' ? 'वाहतूकदार वेळेवर आला नाही किंवा अवाजवी भाडे मागितले' : language === 'te' ? 'వాహనం సమయానికి రాలేదు లేదా అధిక ఛార్జ్ కోరారు' : language === 'hi' ? 'वाहन समय पर नहीं पहुंचा या अधिक भाड़ा मांगा गया' : 'Vehicle delayed, failed pickup, or excess freight claimed',
      severity: 'medium',
    },
    {
      id: 'DELIVERY_ISSUE',
      icon: Package,
      label: t.disputes.categoryDeliveryIssue || 'Delivery / Handover Issue',
      desc: language === 'mr' ? 'गोदाम किंवा खरेदीदार गेटवर माल स्वीकारण्यास नकार' : language === 'te' ? 'డెలివరీ పాయింట్ వద్ద స్వీకరించడానికి నిరాకరణ' : language === 'hi' ? 'मंडी या गोदाम गेट पर माल उतारने में अनुचित विलंब' : 'Buyer warehouse refused gate entry or delayed unloading',
      severity: 'medium',
    },
    {
      id: 'BUYER_ISSUE',
      icon: Building2,
      label: t.disputes.categoryBuyerIssue || 'Buyer Issue / Non-Responsiveness',
      desc: language === 'mr' ? 'खरेदीदार फोन उचलत नाही किंवा संपर्कात नाही' : language === 'te' ? 'కొనుగోలుదారు ప్రతిస్పందించడం లేదు' : language === 'hi' ? 'खरीदार संपर्क नहीं कर रहा या उत्तर नहीं दे रहा' : 'Buyer unresponsive, untraceable, or breaching trade terms',
      severity: 'medium',
    },
    {
      id: 'CONTRACT_ISSUE',
      icon: FileText,
      label: t.disputes.categoryContractIssue || 'Contract / Offer Terms Issue',
      desc: language === 'mr' ? 'स्वीकारलेल्या ऑफरच्या अटींचे खरेदीदाराकडून उल्लंघन' : language === 'te' ? 'అంగీకరించిన ఆఫర్ నిబంధనల ఉల్లంఘన' : language === 'hi' ? 'स्वीकृत ऑफर की शर्तों का पालन नहीं किया गया' : 'Accepted commercial offer terms violated',
      severity: 'medium',
    },
    {
      id: 'OTHER',
      icon: AlertCircle,
      label: t.disputes.categoryOther || 'Other Problem',
      desc: language === 'mr' ? 'इतर कोणतीही शेतीमाल व्यवहार समस्या' : language === 'te' ? 'ఇతర వ్యవసాయ వాణిజ్య సమస్య' : language === 'hi' ? 'अन्य कोई कृषि व्यापार संबंधी समस्या' : 'Any other trade discrepancy or operational grievance',
      severity: 'low',
    },
  ], [t, language]);

  // Load farmer's transactions
  useEffect(() => {
    async function fetchTxns() {
      try {
        setLoadingTxns(true);
        const res = await fetch('/api/transactions?role=FARMER');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setTransactions(json.data);
            if (!selectedTxnId && json.data.length > 0) {
              if (initialLotId) {
                const match = json.data.find((t: TransactionRecord) => t.lotId === initialLotId);
                setSelectedTxnId(match ? match.id : json.data[0].id);
              } else {
                setSelectedTxnId(json.data[0].id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load transactions for dispute:', err);
      } finally {
        setLoadingTxns(false);
      }
    }

    if (isOpen) {
      fetchTxns();
    }
  }, [isOpen, initialLotId, selectedTxnId]);

  // Currently attached transaction object
  const attachedTxn = useMemo(() => {
    return transactions.find((t) => t.id === selectedTxnId) || transactions[0] || null;
  }, [transactions, selectedTxnId]);

  // Voice dictation toggle
  const toggleVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your explanation.');
      return;
    }

    if (isDictating) {
      setIsDictating(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => setIsDictating(true);
      recognition.onend = () => setIsDictating(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setEvidenceSummary((prev) => (prev ? `${prev} ${text}` : text));
        setIsDictating(false);
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.start();
    } catch {
      setIsDictating(false);
    }
  };

  // Handle mock / client file upload preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const newFile: EvidenceFile = {
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        type: file.type,
        dataUrl: uploadEvent.target?.result as string,
      };
      setEvidenceFiles((prev) => [...prev, newFile]);
    };
    reader.readAsDataURL(file);
  };

  // Submit Complaint
  const handleSubmitComplaint = async () => {
    if (!attachedTxn) {
      setSubmitError('No active transaction selected.');
      return;
    }

    if (!evidenceSummary.trim() || evidenceSummary.trim().length < 5) {
      setSubmitError('Please provide at least a brief sentence explaining what went wrong.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        transactionId: attachedTxn.id,
        reason: selectedReason,
        evidenceSummary: evidenceSummary.trim(),
        evidenceFilesJson: evidenceFiles.length > 0 ? JSON.stringify(evidenceFiles) : null,
      };

      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedDispute({
          disputeCode: data.dispute.disputeCode,
          createdAt: data.dispute.createdAt || new Date().toISOString(),
        });
        setStep(5);
        if (onDisputeSubmitted) {
          onDisputeSubmitted(data.dispute.disputeCode);
        }
      } else {
        setSubmitError(data.error || 'Failed to register complaint. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Network connection error submitting complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-[12px] border border-[#D8D2C4] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#D8D2C4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[6px] bg-red-100 text-red-800">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#262320]">
                {t.disputes.raiseGrievanceTitle || 'Report an Issue / Raise Complaint'}
              </h3>
              <p className="text-xs text-[#635E59]">
                {t.disputes.hubSubtitle || 'Evidence-based grievance resolution conducted with human oversight'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#635E59] hover:text-[#262320] p-1.5 rounded-full hover:bg-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Steps Indicator */}
        {step < 5 && (
          <div className="bg-[#F4F1EA] px-4 py-2 border-b border-[#D8D2C4] flex items-center justify-between text-[11px] font-semibold text-[#635E59] overflow-x-auto">
            <span className={step === 1 ? 'text-[#1B4332] font-bold' : ''}>
              1. {t.disputes.stepSelectProblem || 'Problem'}
            </span>
            <span>→</span>
            <span className={step === 2 ? 'text-[#1B4332] font-bold' : ''}>
              2. {t.disputes.stepVerifyDetails || 'Verify Details'}
            </span>
            <span>→</span>
            <span className={step === 3 ? 'text-[#1B4332] font-bold' : ''}>
              3. {t.disputes.stepAddEvidence || 'Evidence'}
            </span>
            <span>→</span>
            <span className={step === 4 ? 'text-[#1B4332] font-bold' : ''}>
              4. {t.disputes.stepReviewSubmit || 'Confirm'}
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs font-body">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[6px] text-red-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1: SELECT PROBLEM CATEGORY */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <h4 className="font-heading font-bold text-sm text-[#262320]">
                  {t.disputes.stepSelectProblem || 'What issue are you facing with this trade?'}
                </h4>
                <p className="text-xs text-[#635E59]">
                  Select the main problem category. We will automatically attach your trade contract and evidence.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedReason === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedReason(cat.id)}
                      className={`p-3 rounded-[8px] border cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-[#1B4332] bg-[#EAF2ED]/50 shadow-xs'
                          : 'border-[#D8D2C4] bg-white hover:border-[#8C827A] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-[6px] shrink-0 ${
                          isSelected
                            ? 'bg-[#1B4332] text-white'
                            : 'bg-[#FAF8F5] text-[#1B4332] border border-[#D8D2C4]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <strong className="text-xs text-[#262320] block font-heading font-bold">
                          {cat.label}
                        </strong>
                        <p className="text-[11px] text-[#635E59] leading-tight">
                          {cat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: VERIFY AUTOMATICALLY ATTACHED CONTEXT */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading font-bold text-sm text-[#262320] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
                  <span>{t.disputes.stepVerifyDetails || 'Automatically Attached Trade Records'}</span>
                </h4>
                <p className="text-xs text-[#635E59]">
                  {t.disputes.autoAttachedNotice ||
                    'Transaction, lot, buyer, transporter, and escrow records were automatically attached. Review before proceeding.'}
                </p>
              </div>

              {/* Transaction Selector if multiple available */}
              {transactions.length > 1 && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#635E59] uppercase tracking-wider">
                    Select Transaction / Lot to Dispute
                  </label>
                  <select
                    value={selectedTxnId}
                    onChange={(e) => setSelectedTxnId(e.target.value)}
                    className="w-full p-2.5 border border-[#D8D2C4] rounded-[6px] bg-white text-xs font-semibold text-[#262320]"
                  >
                    {transactions.map((tx) => (
                      <option key={tx.id} value={tx.id}>
                        {tx.transactionCode} • {tx.lot?.commodity} ({tx.quantityQuintals} Qtl) — {tx.buyer?.companyName} [{formatINR(tx.grossSaleValue)}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {loadingTxns ? (
                <div className="p-8 text-center text-[#635E59]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1B4332]" />
                  <span className="text-xs mt-2 block">Loading trade details...</span>
                </div>
              ) : attachedTxn ? (
                <div className="p-4 bg-[#FAF8F5] border border-[#D8D2C4] rounded-[8px] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#1B4332] bg-white px-2 py-0.5 rounded border border-[#B7D5C4]">
                        {attachedTxn.transactionCode}
                      </span>
                      <strong className="text-sm font-heading text-[#262320] block mt-1">
                        {attachedTxn.lot?.commodity || 'Produce Lot'} ({attachedTxn.quantityQuintals} Quintals)
                      </strong>
                    </div>
                    <Badge variant="emerald" className="text-xs">
                      {attachedTxn.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#635E59] block text-[10px] uppercase">Buyer:</span>
                      <strong className="text-[#262320]">{attachedTxn.buyer?.companyName || 'Verified Buyer'}</strong>
                    </div>
                    <div>
                      <span className="text-[#635E59] block text-[10px] uppercase">Transporter:</span>
                      <strong className="text-[#262320]">{attachedTxn.transporter?.businessName || 'Sahyadri Agri Logistics'}</strong>
                    </div>
                    <div>
                      <span className="text-[#635E59] block text-[10px] uppercase">Agreed Farmgate Price:</span>
                      <strong className="text-[#1B4332]">₹{attachedTxn.agreedPricePerQuintal} / Qtl</strong>
                    </div>
                    <div>
                      <span className="text-[#635E59] block text-[10px] uppercase">Expected Net Realisation:</span>
                      <strong className="text-[#1B4332] font-black text-sm">{formatINR(attachedTxn.netRealisation)}</strong>
                    </div>
                  </div>

                  {/* Quality & Escrow Status */}
                  <div className="pt-2 border-t border-[#D8D2C4] grid grid-cols-2 gap-2 text-[11px] text-[#635E59]">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" />
                      <span>Grade: <strong className="text-[#262320]">{attachedTxn.lot?.physicalVerifications?.[0]?.officialGrade || 'Grade A (FAQ)'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                      <span>Escrow: <strong className="text-blue-900">{attachedTxn.payments?.[0]?.paymentStatus || 'HELD_IN_ESCROW'}</strong></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-[6px] text-amber-900 text-xs">
                  No active transactions found. You can still report a general grievance.
                </div>
              )}
            </div>
          )}

          {/* STEP 3: ADD DETAILS & EVIDENCE */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading font-bold text-sm text-[#262320]">
                  {t.disputes.stepAddEvidence || 'Explain the Problem & Attach Evidence'}
                </h4>
                <p className="text-xs text-[#635E59]">
                  Describe what happened in simple words. Supporting photos or weighbridge slips are optional.
                </p>
              </div>

              {/* Text Description with Voice Dictation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#262320]">
                    {t.disputes.descriptionLabel || 'Detailed Description'}:
                  </label>
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      isDictating
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-[#EAF2ED] text-[#1B4332] hover:bg-[#D8EADF]'
                    }`}
                  >
                    {isDictating ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isDictating ? t.disputes.voiceDictationActive || 'Listening...' : t.disputes.voiceDictationBtn || 'Speak to dictate'}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={evidenceSummary}
                  onChange={(e) => setEvidenceSummary(e.target.value)}
                  placeholder={
                    selectedReason === 'PAYMENT_NOT_RECEIVED'
                      ? 'Describe payment delay, e.g. "Produce delivered on 20 Sep but payout has not arrived in bank account..."'
                      : selectedReason === 'WEIGHT_DISCREPANCY'
                      ? 'Describe weight difference, e.g. "Loaded 80 quintals at farm, buyer slip claims only 74 quintals..."'
                      : t.disputes.descriptionPlaceholder || 'Detail specific issues regarding weight, grade mismatch, delivery delay, or payment...'
                  }
                  className="w-full p-3 border border-[#D8D2C4] rounded-[6px] text-xs bg-white text-[#262320] focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332]"
                />
              </div>

              {/* Optional Photo or Document Upload */}
              <div className="space-y-2">
                <label className="font-bold text-[#262320] block">
                  {t.disputes.evidenceOptional || 'Add supporting documents / photos (optional)'}:
                </label>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3.5 py-2 rounded-[6px] border border-dashed border-[#1B4332] bg-[#FAF8F5] hover:bg-[#EAF2ED] text-[#1B4332] font-semibold text-xs flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4" />
                    <span>{t.disputes.photoOrDocUpload || 'Upload Photo / Weighing Slip'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-[#635E59]">PNG, JPG or PDF up to 10MB</span>
                </div>

                {/* Evidence files preview list */}
                {evidenceFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {evidenceFiles.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-[4px] border border-[#D8D2C4] bg-white flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#1B4332]" />
                          <span className="font-medium text-[#262320]">{f.name}</span>
                          <span className="text-[10px] text-[#635E59]">({f.sizeKb} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEvidenceFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-800 p-1"
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

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-[8px] space-y-1.5">
                <h4 className="font-heading font-bold text-sm text-[#92400E] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>{t.disputes.confirmSubmissionTitle || 'Review & Confirm Complaint Submission'}</span>
                </h4>
                <p className="text-xs text-[#92400E]/90 leading-relaxed">
                  {t.disputes.confirmSubmissionDesc ||
                    'An authorized APMC / FPO grievance officer will review this report alongside the digital trade contract and digital weighing logs.'}
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] border border-[#D8D2C4] rounded-[8px] space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#D8D2C4] pb-1.5">
                  <span className="text-[#635E59]">Problem Category:</span>
                  <strong className="text-red-900 font-bold">
                    {categories.find((c) => c.id === selectedReason)?.label}
                  </strong>
                </div>

                <div className="flex justify-between border-b border-[#D8D2C4] pb-1.5">
                  <span className="text-[#635E59]">Transaction / Lot:</span>
                  <strong className="text-[#262320]">
                    {attachedTxn?.transactionCode} ({attachedTxn?.lot?.commodity})
                  </strong>
                </div>

                <div className="flex justify-between border-b border-[#D8D2C4] pb-1.5">
                  <span className="text-[#635E59]">Buyer / Company:</span>
                  <strong className="text-[#262320]">{attachedTxn?.buyer?.companyName}</strong>
                </div>

                <div className="flex justify-between border-b border-[#D8D2C4] pb-1.5">
                  <span className="text-[#635E59]">Net Realisation Value:</span>
                  <strong className="text-[#1B4332] font-black">{formatINR(attachedTxn?.netRealisation || 0)}</strong>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[#635E59] block font-bold">Farmer Statement:</span>
                  <p className="p-2.5 bg-white border border-[#D8D2C4] rounded-[4px] text-[#262320] leading-relaxed">
                    {evidenceSummary}
                  </p>
                </div>

                {evidenceFiles.length > 0 && (
                  <div className="pt-1 text-[11px] text-[#635E59]">
                    Attached files: <strong>{evidenceFiles.length} file(s)</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: SUBMITTED CONFIRMATION & TRACKING */}
          {step === 5 && createdDispute && (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="font-heading font-black text-lg text-[#262320]">
                  {t.disputes.complaintSubmittedTitle || 'Complaint Successfully Registered'}
                </h4>
                <p className="text-xs text-[#635E59] max-w-md mx-auto">
                  {t.disputes.complaintSubmittedDesc ||
                    'Your grievance has been submitted with full digital trade context. An authorized reviewer will examine the transaction records.'}
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] border border-[#B7D5C4] rounded-[8px] max-w-md mx-auto text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#635E59]">Complaint Reference ID:</span>
                  <span className="font-mono text-xs font-bold text-red-950 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {createdDispute.disputeCode}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#635E59]">Status:</span>
                  <Badge variant="amber">OPEN — Under Review</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#635E59]">Registered On:</span>
                  <span className="font-semibold text-[#262320]">
                    {new Date(createdDispute.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onClose}
                  className="bg-[#1B4332] text-white text-xs px-6"
                >
                  {t.disputes.trackComplaintBtn || 'Done & Track Status'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step < 5 && (
          <div className="p-4 bg-[#FAF8F5] border-t border-[#D8D2C4] flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
                className="text-xs border-[#D8D2C4] gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs border-[#D8D2C4]"
              >
                Cancel
              </Button>
            )}

            {step < 4 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (step === 3 && (!evidenceSummary.trim() || evidenceSummary.trim().length < 5)) {
                    setSubmitError('Please enter at least a brief explanation before proceeding.');
                    return;
                  }
                  setSubmitError(null);
                  setStep((prev) => (prev + 1) as 2 | 3 | 4);
                }}
                className="bg-[#1B4332] text-white text-xs gap-1"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled={submitting}
                onClick={handleSubmitComplaint}
                className="bg-red-700 hover:bg-red-800 text-white text-xs gap-1 font-bold shadow-xs px-5"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
                <span>{submitting ? 'Submitting...' : t.disputes.submitGrievanceBtn || 'Confirm & Submit Complaint'}</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
