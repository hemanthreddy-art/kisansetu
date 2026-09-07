'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { MAHARASHTRA_DISTRICTS } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageContainer } from '@/components/layout/PageContainer';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { ReputationCluster } from '@/components/ui/ReputationCluster';
import { formatINR } from '@/lib/utils';
import {
  Package,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Scale,
  Sparkles,
  ShieldCheck,
  Truck,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Copy,
  Check,
  Camera,
  ShieldAlert,
  FileCheck2,
  Award,
  Calendar,
  FileText,
  Building2,
  Star,
  Send,
  Lock,
  CheckCircle,
  XCircle,
  Clock,
  Warehouse,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  MapPin,
  Gauge,
  Upload,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { ProduceLot } from '@/types';
import { TransportOption } from '@/lib/transportMatching';
import { RecommendationResult } from '@/lib/recommendation';

interface BuyerReputationData {
  ratingScore: number;
  completedTradesCount: number;
  disputeResolutionPercent: number;
  paymentPunctualityPercent: number;
}

interface MatchedDemandData {
  demandId: string;
  buyerCompanyName: string;
  buyerType: string;
  isBuyerVerified: boolean;
  reputation: BuyerReputationData;
  requiredCommodity: string;
  requiredVariety?: string | null;
  requiredGrade?: string | null;
  requiredQuantityQtl: number;
  targetPricePerQtl: number;
  minPricePerQtl?: number | null;
  maxPricePerQtl?: number | null;
  deliveryLocation?: string | null;
  deliveryDeadline?: string | null;
  matchScore: number;
  matchStrength: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'LOW';
  breakdownReasons: string[];
  gapWarnings: string[];
}

interface OfferData {
  id: string;
  lotId: string;
  buyerId: string;
  buyerCompanyName: string;
  buyerName: string;
  buyerType: string;
  isBuyerVerified: boolean;
  reputation: BuyerReputationData;
  offeredPricePerQtl: number;
  quantityQuintals: number;
  totalOfferValue: number;
  proposedPickupDate?: string | null;
  paymentTerms?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  notes?: string | null;
  validUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface QualityAssessmentDetails {
  id: string;
  preliminaryGrade: string;
  confidenceScore: number;
  color?: string | null;
  visibleDamage?: string | null;
  sizeUniformity?: string | null;
  visibleDefects?: string | null;
  notes?: string | null;
  assessedAt: string;
}

interface QualityVerificationDetails {
  id: string;
  certificateNumber?: string | null;
  officialGrade: string;
  verificationStatus: string;
  moisturePercentage?: string | null;
  foreignMatterPerc?: string | null;
  location?: string | null;
  inspectionDate?: string | null;
  inspectorName?: string;
  agency?: string;
  licenseNumber?: string;
  notes?: string | null;
  verifiedAt: string;
}

interface TransportRequestDetails {
  id: string;
  lotId: string;
  transporterId?: string | null;
  vehicleId?: string | null;
  pickupLocation: string;
  dropLocation: string;
  pickupDistrict?: string | null;
  dropDistrict?: string | null;
  distanceKm: number;
  quantityQuintals?: number | null;
  estimatedTrips: number;
  ratePerKm?: number | null;
  estimatedCost: number;
  status: string;
  notes?: string | null;
  scheduledPickup?: string | null;
  actualDelivery?: string | null;
  transporter?: {
    businessName: string;
  } | null;
  vehicle?: {
    vehicleName?: string | null;
    registrationNumber: string;
  } | null;
}

function LotDetailPageContent() {
  const { t, locale } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();

  const lotId = (params?.id as string) || '';

  const [lot, setLot] = useState<ProduceLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // AI Assessment Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSubmitting, setAiSubmitting] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [aiErrors, setAiErrors] = useState<Record<string, string>>({});

  // Photo state for Tier 1 Visual Screening
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [persistedPhoto, setPersistedPhoto] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [photoFileSize, setPhotoFileSize] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reject non-image files
    if (!file.type.startsWith('image/')) {
      setPhotoError(t.quality.invalidImageError);
      e.target.value = '';
      return;
    }

    setPhotoError(null);
    setAiErrors({});
    setPhotoFileName(file.name);
    setPhotoFileSize(
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`
    );

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoFileName(null);
    setPhotoFileSize(null);
    setPhotoError(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Quality Data State
  const [qualityOverview, setQualityOverview] = useState<{
    tier1_aiAssessment: {
      status: string;
      label: string;
      details: QualityAssessmentDetails | null;
    };
    tier2_physicalVerification: {
      status: string;
      label: string;
      details: QualityVerificationDetails | null;
    };
    isPhysicallyVerified: boolean;
  } | null>(null);

  const [aiFormData, setAiFormData] = useState({
    estimatedGrade: 'Grade A',
    confidenceScore: 0.88,
    color: 'Deep Red, uniform pigmentation',
    visibleDamage: 'Under 1.5% minor surface skinning',
    sizeUniformity: '88',
    visibleDefects: '2',
    assessmentNotes: 'Bulb diameter consistent 50-65mm, dry outer skin, good firmness.',
  });

  // Edit form fields
  const [editFormData, setEditFormData] = useState({
    quantity: '',
    unit: 'Quintal' as 'Quintal' | 'Tonnes' | 'Kg',
    expectedPrice: '',
    expectedGrade: 'Grade A',
    availabilityDate: '',
    district: 'Nashik',
    location: '',
    description: '',
    status: 'AVAILABLE' as 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'CANCELLED',
  });

  // Buyer Matching & Offers State (Phase 4B)
  const [matches, setMatches] = useState<MatchedDemandData[]>([]);
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [actionOfferId, setActionOfferId] = useState<string | null>(null);
  const [offerActionSuccess, setOfferActionSuccess] = useState<string | null>(null);
  const [offerActionError, setOfferActionError] = useState<string | null>(null);

  // Make Offer Modal state (for prospective buyers / demo)
  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(false);
  const [makeOfferSubmitting, setMakeOfferSubmitting] = useState(false);
  const [makeOfferSuccess, setMakeOfferSuccess] = useState<string | null>(null);
  const [makeOfferError, setMakeOfferError] = useState<string | null>(null);
  const [offerFormData, setOfferFormData] = useState({
    buyerKey: 'ABC_FOODS' as 'ABC_FOODS' | 'NASHIK_FRESH' | 'MAHA_EXPORTS' | 'PUNE_INSTITUTIONAL',
    offeredPricePerQtl: '',
    quantityQuintals: '',
    proposedPickupDate: '',
    deliveryTerms: 'Farm-gate pickup arranged by buyer',
    paymentTerms: 'Bank escrow release within 24h of physical receipt',
    notes: 'Offer subject to verified quality parameters matching specifications.',
    validityDays: 7,
  });

  // Transport & Logistics State (Phase 5)
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [transportRequests, setTransportRequests] = useState<TransportRequestDetails[]>([]);
  const [loadingTransport, setLoadingTransport] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('Pune');
  const [preferRefrigerated, setPreferRefrigerated] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedOptionForBooking, setSelectedOptionForBooking] = useState<TransportOption | null>(null);
  const [bookingScheduledDate, setBookingScheduledDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [bookingErrorMsg, setBookingErrorMsg] = useState<string | null>(null);

  // Phase 6 Net Realisation State
  const [realisationData, setRealisationData] = useState<RecommendationResult | null>(null);
  const [realisationLoading, setRealisationLoading] = useState(false);
  const [holdingDaysInput, setHoldingDaysInput] = useState(25);
  const [showFormulaExplain, setShowFormulaExplain] = useState(false);

  // Dynamic re-calculation when holding days change
  const handleRecalculateStorage = async (days: number) => {
    setHoldingDaysInput(days);
    if (!lotId) return;
    try {
      setRealisationLoading(true);
      const res = await fetch(`/api/lots/${encodeURIComponent(lotId)}/net-realisation?holdingDays=${days}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRealisationData(data);
        }
      }
    } catch (e) {
      console.error('Error recalculating net realisation:', e);
    } finally {
      setRealisationLoading(false);
    }
  };

  // Fetch lot details & quality overview & buyer matches & digital offers & transport & net-realisation
  const fetchLotDetail = useCallback(async () => {
    if (!lotId) return;
    try {
      setLoading(true);
      setError(null);
      const [resLot, resQuality, resMatches, resOffers, resTransportOpts, resTransportReqs, resRealisation] = await Promise.all([
        fetch(`/api/lots/${encodeURIComponent(lotId)}`),
        fetch(`/api/lots/${encodeURIComponent(lotId)}/quality`),
        fetch(`/api/lots/${encodeURIComponent(lotId)}/matches`),
        fetch(`/api/lots/${encodeURIComponent(lotId)}/offers?role=FARMER`),
        fetch(`/api/lots/${encodeURIComponent(lotId)}/transport-options?dropDistrict=${encodeURIComponent(selectedDestination)}&preferRefrigerated=${preferRefrigerated ? 'true' : 'false'}`),
        fetch(`/api/transport-requests?lotId=${encodeURIComponent(lotId)}`),
        fetch(`/api/lots/${encodeURIComponent(lotId)}/net-realisation?holdingDays=${holdingDaysInput}`),
      ]);

      if (!resLot.ok) {
        if (resLot.status === 404) {
          throw new Error('Produce lot not found or access denied.');
        }
        throw new Error('Failed to retrieve produce lot details.');
      }

      // Populate Net Realisation data
      if (resRealisation && resRealisation.ok) {
        const dataRealisation = await resRealisation.json();
        if (dataRealisation.success) {
          setRealisationData(dataRealisation);
        }
      }

      const dataLot = await resLot.json();
      if (dataLot.success && dataLot.data) {
        setLot(dataLot.data);
        const l = dataLot.data;
        setEditFormData({
          quantity: String(l.quantity),
          unit: l.unit || 'Quintal',
          expectedPrice: String(l.expectedPrice),
          expectedGrade: l.expectedGrade || 'Grade A',
          availabilityDate: l.readyForPickupDate
            ? new Date(l.readyForPickupDate).toISOString().split('T')[0]
            : '',
          district: l.locationDistrict || 'Nashik',
          location: l.location || '',
          description: l.description || '',
          status: l.status || 'AVAILABLE',
        });

        // Set default offer form inputs if not yet populated
        setOfferFormData((prev) => ({
          ...prev,
          offeredPricePerQtl: prev.offeredPricePerQtl || String(l.expectedPricePerQuintal || l.expectedPrice),
          quantityQuintals: prev.quantityQuintals || String(l.quantityQuintals || l.quantity),
          proposedPickupDate: prev.proposedPickupDate || (l.readyForPickupDate ? new Date(l.readyForPickupDate).toISOString().split('T')[0] : ''),
        }));
      } else {
        setError(dataLot.error || 'Failed to load lot');
      }

      if (resQuality.ok) {
        const dataQuality = await resQuality.json();
        if (dataQuality.success && dataQuality.qualityOverview) {
          setQualityOverview(dataQuality.qualityOverview);
        }
      }

      if (resMatches.ok) {
        const dataMatches = await resMatches.json();
        if (dataMatches.success && Array.isArray(dataMatches.matches)) {
          setMatches(dataMatches.matches);
        }
      }

      if (resOffers.ok) {
        const dataOffers = await resOffers.json();
        if (dataOffers.success && Array.isArray(dataOffers.offers)) {
          setOffers(dataOffers.offers);
        }
      }

      if (resTransportOpts && resTransportOpts.ok) {
        const dataOpts = await resTransportOpts.json();
        if (dataOpts.success && Array.isArray(dataOpts.options)) {
          setTransportOptions(dataOpts.options);
        }
      }

      if (resTransportReqs && resTransportReqs.ok) {
        const dataReqs = await resTransportReqs.json();
        if (dataReqs.success && Array.isArray(dataReqs.transportRequests)) {
          setTransportRequests(dataReqs.transportRequests);
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching lot detail:', err);
      setError(err instanceof Error ? err.message : 'Error loading produce lot.');
    } finally {
      setLoading(false);
    }
  }, [lotId, selectedDestination, preferRefrigerated, holdingDaysInput]);

  // Recalculate transport options when destination or reefer preference changes
  const handleRecalculateTransport = async (destCity?: string, reeferPref?: boolean) => {
    if (!lotId) return;
    try {
      setLoadingTransport(true);
      const dest = destCity !== undefined ? destCity : selectedDestination;
      const reefer = reeferPref !== undefined ? reeferPref : preferRefrigerated;
      const res = await fetch(`/api/lots/${encodeURIComponent(lotId)}/transport-options?dropDistrict=${encodeURIComponent(dest)}&preferRefrigerated=${reefer ? 'true' : 'false'}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.options)) {
          setTransportOptions(data.options);
        }
      }
    } catch (err) {
      console.error('Error recalculating transport:', err);
    } finally {
      setLoadingTransport(false);
    }
  };

  // Handle transport booking creation
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionForBooking || !lot) return;
    try {
      setBookingSubmitting(true);
      setBookingErrorMsg(null);
      setBookingSuccessMsg(null);

      const res = await fetch('/api/transport-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId: lot.id,
          transporterId: selectedOptionForBooking.transporterId,
          vehicleId: selectedOptionForBooking.vehicleId,
          pickupLocation: selectedOptionForBooking.pickupLocation,
          dropLocation: selectedOptionForBooking.dropLocation,
          pickupDistrict: selectedOptionForBooking.pickupDistrict,
          dropDistrict: selectedOptionForBooking.dropDistrict,
          distanceKm: selectedOptionForBooking.distanceKm,
          quantityQuintals: selectedOptionForBooking.lotQuantityQuintals,
          estimatedTrips: selectedOptionForBooking.tripsRequired,
          ratePerKm: selectedOptionForBooking.ratePerKm,
          estimatedCost: selectedOptionForBooking.estimatedCost,
          scheduledPickup: bookingScheduledDate || new Date(Date.now() + 86400000).toISOString(),
          notes: bookingNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to book transport');
      }

      setBookingSuccessMsg(t.transport.bookingSuccess);
      setIsBookingModalOpen(false);
      setSelectedOptionForBooking(null);
      setBookingNotes('');

      // Refresh transport requests
      const resReqs = await fetch(`/api/transport-requests?lotId=${encodeURIComponent(lot.id)}`);
      if (resReqs.ok) {
        const dataReqs = await resReqs.json();
        if (dataReqs.success && Array.isArray(dataReqs.transportRequests)) {
          setTransportRequests(dataReqs.transportRequests);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error booking transport';
      setBookingErrorMsg(msg);
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Accept Offer Handler (Farmer action)
  const handleAcceptOffer = async (offerId: string) => {
    if (!confirm(t.buyerMatching.confirmAccept)) return;
    try {
      setActionOfferId(offerId);
      setOfferActionError(null);
      setOfferActionSuccess(null);
      const res = await fetch(`/api/offers/${encodeURIComponent(offerId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ACCEPTED',
          role: 'FARMER',
          callerId: lot?.farmerId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to accept offer.');
      }
      setOfferActionSuccess(t.buyerMatching.acceptSuccess);
      await fetchLotDetail();
    } catch (err: unknown) {
      setOfferActionError(err instanceof Error ? err.message : 'Error accepting offer');
    } finally {
      setActionOfferId(null);
    }
  };

  // Reject Offer Handler (Farmer action)
  const handleRejectOffer = async (offerId: string) => {
    if (!confirm(t.buyerMatching.confirmReject)) return;
    try {
      setActionOfferId(offerId);
      setOfferActionError(null);
      setOfferActionSuccess(null);
      const res = await fetch(`/api/offers/${encodeURIComponent(offerId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          role: 'FARMER',
          callerId: lot?.farmerId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject offer.');
      }
      setOfferActionSuccess(t.buyerMatching.rejectSuccess);
      await fetchLotDetail();
    } catch (err: unknown) {
      setOfferActionError(err instanceof Error ? err.message : 'Error rejecting offer');
    } finally {
      setActionOfferId(null);
    }
  };

  // Make Offer Submit Handler (Buyer action)
  const handleCreateOffer = async () => {
    if (!lot) return;
    try {
      setMakeOfferSubmitting(true);
      setMakeOfferError(null);
      setMakeOfferSuccess(null);

      const price = parseFloat(offerFormData.offeredPricePerQtl);
      const qty = parseFloat(offerFormData.quantityQuintals);
      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid offered price (greater than 0).');
      }
      if (isNaN(qty) || qty <= 0) {
        throw new Error('Please enter a valid offered quantity (greater than 0).');
      }

      const res = await fetch(`/api/lots/${encodeURIComponent(lot.id)}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoBuyerKey: offerFormData.buyerKey,
          offeredPricePerQtl: price,
          quantityQuintals: qty,
          proposedPickupDate: offerFormData.proposedPickupDate || undefined,
          deliveryTerms: offerFormData.deliveryTerms,
          paymentTerms: offerFormData.paymentTerms,
          notes: offerFormData.notes,
          validityDays: offerFormData.validityDays,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch offer.');
      }

      setMakeOfferSuccess(t.buyerMatching.offerCreatedSuccess);
      setTimeout(() => {
        setIsMakeOfferOpen(false);
      }, 1500);
      await fetchLotDetail();
    } catch (err: unknown) {
      setMakeOfferError(err instanceof Error ? err.message : 'Error creating offer.');
    } finally {
      setMakeOfferSubmitting(false);
    }
  };

  useEffect(() => {
    fetchLotDetail();
  }, [fetchLotDetail]);

  // Check URL query param to open edit modal directly
  useEffect(() => {
    if (searchParams?.get('edit') === 'true' && lot) {
      setIsEditOpen(true);
    }
  }, [searchParams, lot]);

  // Copy Lot Code
  const handleCopyCode = () => {
    if (lot?.lotCode) {
      navigator.clipboard.writeText(lot.lotCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Submit Edit Handler
  const handleUpdateLot = async () => {
    if (!lot) return;

    // Validate
    const errors: Record<string, string> = {};
    const qNum = Number(editFormData.quantity);
    if (isNaN(qNum) || qNum <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    const pNum = Number(editFormData.expectedPrice);
    if (isNaN(pNum) || pNum < 0) {
      errors.expectedPrice = 'Price cannot be negative';
    }
    if (!editFormData.location.trim()) {
      errors.location = 'Location cannot be empty';
    }
    if (Object.keys(errors).length > 0) {
      setUpdateErrors(errors);
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateErrors({});

      const payload = {
        quantity: qNum,
        unit: editFormData.unit,
        expectedPrice: pNum,
        expectedGrade: editFormData.expectedGrade,
        availabilityDate: editFormData.availabilityDate,
        district: editFormData.district,
        location: editFormData.location,
        description: editFormData.description,
        status: editFormData.status,
      };

      const res = await fetch(`/api/lots/${encodeURIComponent(lot.lotCode)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setUpdateErrors({ general: result.error || 'Failed to update lot' });
        return;
      }

      setUpdateSuccess(
        locale === 'mr'
          ? 'शेतमाल लॉट यशस्वीरित्या अद्यतनित केला!'
          : locale === 'te'
          ? 'పంట లాట్ వివరాలు విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి!'
          : 'Produce lot updated successfully!'
      );

      await fetchLotDetail();

      setTimeout(() => {
        setIsEditOpen(false);
        setUpdateSuccess(null);
      }, 1200);
    } catch (err: unknown) {
      console.error('Error updating lot:', err);
      setUpdateErrors({ general: err instanceof Error ? err.message : 'Error saving changes' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit AI Assessment Handler
  const handleRecordAiAssessment = async () => {
    if (!lot) return;

    // Strict requirement: Photo must be selected or captured before assessing quality
    if (!selectedPhoto) {
      setAiErrors({ general: t.quality.photoRequiredError });
      return;
    }

    try {
      setAiSubmitting(true);
      setAiErrors({});

      const payload = {
        estimatedGrade: aiFormData.estimatedGrade,
        confidenceScore: Number(aiFormData.confidenceScore),
        color: aiFormData.color,
        visibleDamage: aiFormData.visibleDamage,
        sizeUniformity: Number(aiFormData.sizeUniformity),
        visibleDefects: Number(aiFormData.visibleDefects),
        assessmentNotes: aiFormData.assessmentNotes,
      };

      const res = await fetch(`/api/lots/${encodeURIComponent(lot.lotCode)}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.details) {
          setAiErrors(data.details);
        } else {
          setAiErrors({ general: data.error || 'Failed to record AI assessment' });
        }
        return;
      }

      if (selectedPhoto) {
        setPersistedPhoto(selectedPhoto);
      }

      setAiSuccessMessage(
        locale === 'mr'
          ? 'एआय प्राथमिक व्हिज्युअल स्क्रिनिंग यशस्वीरित्या नोंदवले!'
          : locale === 'te'
          ? 'ప్రాథమిక AI స్క్రీనింగ్ విజయవంతంగా నమోదు చేయబడింది!'
          : locale === 'hi'
          ? 'AI प्रारंभिक दृश्य स्क्रीनिंग सफलतापूर्वक दर्ज की गई!'
          : 'AI visual screening recorded! Stamped as "AI Assessment — Not Verified".'
      );

      await fetchLotDetail();

      setTimeout(() => {
        setIsAiModalOpen(false);
        setAiSuccessMessage(null);
      }, 1400);
    } catch (err: unknown) {
      console.error('Error recording AI assessment:', err);
      setAiErrors({ general: err instanceof Error ? err.message : 'Error submitting AI assessment' });
    } finally {
      setAiSubmitting(false);
    }
  };

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
      case 'CANCELLED':
        return <Badge variant="red">Cancelled</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
        <p className="text-gray-500 font-medium">{t.lots.loading}</p>
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-[8px] bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#262320]">Lot Not Found</h2>
          <p className="text-gray-600 text-sm">
            {error || 'The requested produce lot could not be found or you do not have permission to view it.'}
          </p>
        </div>
        <Link href="/lots">
          <Button variant="primary" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>{t.lots.backToList}</span>
          </Button>
        </Link>
      </div>
    );
  }

  const latestAi = qualityOverview?.tier1_aiAssessment?.details || null;
  const latestPhysical = qualityOverview?.tier2_physicalVerification?.details || null;

  return (
    <PageContainer maxWidth="7xl" className="space-y-6 sm:space-y-8">
      {/* Back Link & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/lots"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.lots.backToList}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setUpdateErrors({});
              setUpdateSuccess(null);
              setIsEditOpen(true);
            }}
            className="gap-1.5"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t.lots.editLot}</span>
          </Button>
        </div>
      </div>

      {/* Lot Header Banner */}
      <div className="bg-white border border-[#D8D2C4] rounded-[8px] p-6 sm:p-8 shadow-none space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold bg-emerald-50 text-[#1B4332] px-3 py-1.5 rounded-xl border border-[#B7D5C4] flex items-center gap-2">
              <span>{lot.lotCode}</span>
              <button
                onClick={handleCopyCode}
                title="Copy Lot ID"
                className="text-emerald-700 hover:text-[#1B4332]"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </span>
            {getStatusBadge(lot.status)}
          </div>

          <div className="flex items-center gap-2">
            {qualityOverview?.isPhysicallyVerified ? (
              <VerificationBadge type="physical" customLabel={t.quality.tier2BadgeVerified} />
            ) : (
              <VerificationBadge type="provisional" customLabel={t.quality.tier2BadgePending} />
            )}
            <span className="text-xs text-[#1B4332] font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-[#B7D5C4] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lot.expectedGrade || 'Not Graded Yet'}</span>
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-[#262320] tracking-tight">
            {lot.commodity}
            {lot.variety && (
              <span className="text-gray-500 font-normal ml-3 text-2xl">
                • {lot.variety}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span>Created on {new Date(lot.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="font-mono text-xs">Standard Produce Lot</span>
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-[8px] p-3">
            <span className="text-xs text-gray-500 font-medium block">{t.lots.volume}</span>
            <div className="text-lg font-bold text-[#262320] mt-0.5">
              {lot.quantity} {lot.unit}
            </div>
            {lot.unit !== 'Quintal' && (
              <span className="text-xs text-gray-500 font-mono">
                {lot.quantityQuintals} Quintals
              </span>
            )}
          </div>

          <div className="bg-emerald-50/60 rounded-[8px] p-3">
            <span className="text-xs text-emerald-700 font-medium block">{t.lots.targetPrice}</span>
            <div className="text-lg font-bold text-[#1B4332] mt-0.5">
              ₹{lot.expectedPricePerQuintal || lot.expectedPrice}
              <span className="text-xs font-normal text-emerald-700">/Qtl</span>
            </div>
            <span className="text-xs text-emerald-600">
              Total: ₹{((lot.quantityQuintals || lot.quantity) * (lot.expectedPricePerQuintal || lot.expectedPrice)).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-gray-50 rounded-[8px] p-3">
            <span className="text-xs text-gray-500 font-medium block">{t.lots.location}</span>
            <div className="text-sm font-bold text-[#262320] mt-1 truncate" title={lot.location || lot.locationDistrict}>
              {lot.location || lot.locationDistrict}
            </div>
            <span className="text-xs text-gray-500">{lot.locationDistrict}</span>
          </div>

          <div className="bg-gray-50 rounded-[8px] p-3">
            <span className="text-xs text-gray-500 font-medium block">
              {t.lots.availabilityDateLabel}
            </span>
            <div className="text-sm font-bold text-[#262320] mt-1">
              {new Date(lot.readyForPickupDate).toLocaleDateString()}
            </div>
            <span className="text-xs text-emerald-700 font-medium">Ready for pickup</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-TIER QUALITY VERIFICATION SECTION */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="purple">Module B & O</Badge>
              <span className="text-xs font-mono text-gray-500 font-bold">TWO-TIER QUALITY ASSURANCE</span>
            </div>
            <h2 className="text-2xl font-heading font-black text-[#262320] tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-emerald-700" />
              <span>{t.quality.sectionTitle}</span>
            </h2>
            <p className="text-gray-600 text-sm">{t.quality.sectionSubtitle}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAiErrors({});
              setAiSuccessMessage(null);
              setIsAiModalOpen(true);
            }}
            className="gap-2 shrink-0 border-emerald-700 text-[#1B4332] hover:bg-emerald-50"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>{t.quality.requestAiAssessment}</span>
          </Button>
        </div>

        {/* Safety / Trust Architectural Principle Alert */}
        <div className="p-4 rounded-[8px] bg-amber-50/80 border border-[#FDE68A] text-amber-950 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-900 block">{t.quality.trustPrincipleTitle}</span>
            <p className="text-amber-900/90 leading-relaxed">{t.quality.trustPrincipleDesc}</p>
          </div>
        </div>

        {/* The Two Clearly Separated Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TIER 1: AI PRELIMINARY ASSESSMENT CARD */}
          <Card className="border-[#B7D5C4] shadow-none hover:shadow-none transition-all flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b border-gray-100 bg-emerald-50/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-mono font-bold text-gray-500 uppercase">Tier 1</span>
                  </div>
                  <Badge variant="amber" className="text-[11px] font-bold px-2.5 py-0.5">
                    {t.quality.tier1Badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-[#262320] mt-2">
                  {t.quality.tier1Title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t.quality.tier1Subtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                {/* Disclaimer banner */}
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 text-xs">
                  <span className="font-semibold">{t.quality.tier1Disclaimer}</span>
                </div>

                {/* Photo preview in Tier 1 card if available */}
                {(persistedPhoto || selectedPhoto) && (
                  <div className="rounded-xl overflow-hidden border border-[#B7D5C4] bg-gray-900/5 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={persistedPhoto || selectedPhoto || ''}
                      alt="Produce visual preview"
                      className="w-full h-36 object-contain bg-black/5"
                    />
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="amber" className="text-[10px] font-bold shadow-xs">
                        {t.quality.tier1Badge}
                      </Badge>
                    </div>
                  </div>
                )}

                {latestAi ? (
                  <div className="space-y-2.5 text-xs text-gray-700">
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">{t.quality.estimatedGradeLabel}:</span>
                      <strong className="text-[#1B4332] font-bold text-sm">
                        {latestAi.preliminaryGrade} ({(latestAi.confidenceScore * 100).toFixed(0)}% confidence)
                      </strong>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">{t.quality.colorLabel}:</span>
                      <span className="font-semibold text-[#262320]">{latestAi.color || 'Standard color'}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">{t.quality.visibleDamageLabel}:</span>
                      <span className="font-semibold text-[#262320]">{latestAi.visibleDamage || 'None detected'}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">{t.quality.sizeUniformityLabel}:</span>
                      <span className="font-semibold text-[#262320]">{latestAi.sizeUniformity || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">{t.quality.visibleDefectsLabel}:</span>
                      <span className="font-semibold text-[#262320]">{latestAi.visibleDefects || 'N/A'}</span>
                    </div>

                    {latestAi.notes && (
                      <div className="pt-1.5">
                        <span className="text-gray-500 block mb-0.5 font-medium">{t.quality.assessmentNotesLabel}:</span>
                        <p className="bg-gray-50 p-2.5 rounded-xl border border-[#D8D2C4] text-gray-800">
                          {latestAi.notes}
                        </p>
                      </div>
                    )}

                    <div className="text-[11px] text-gray-400 pt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Assessed: {new Date(latestAi.assessedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-2">
                    <Camera className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      No preliminary screening recorded yet. Request an AI screening to record initial visual observations.
                    </p>
                  </div>
                )}
              </CardContent>
            </div>

            <div className="p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  setAiErrors({});
                  setAiSuccessMessage(null);
                  setIsAiModalOpen(true);
                }}
                className="gap-2 text-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{latestAi ? 'Re-run Visual Screening' : t.quality.requestAiAssessment}</span>
              </Button>
            </div>
          </Card>

          {/* TIER 2: PHYSICAL QUALITY VERIFICATION CARD */}
          <Card
            className={`shadow-none hover:shadow-none transition-all flex flex-col justify-between ${
              latestPhysical?.verificationStatus === 'PHYSICALLY_VERIFIED'
                ? 'border-emerald-300 ring-1 ring-emerald-500/20'
                : 'border-[#D8D2C4]'
            }`}
          >
            <div>
              <CardHeader className="pb-3 border-b border-gray-100 bg-purple-50/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-mono font-bold text-gray-500 uppercase">Tier 2</span>
                  </div>
                  {latestPhysical?.verificationStatus === 'PHYSICALLY_VERIFIED' ? (
                    <Badge variant="emerald" className="text-[11px] font-bold px-2.5 py-0.5">
                      {t.quality.tier2BadgeVerified}
                    </Badge>
                  ) : latestPhysical?.verificationStatus === 'REJECTED' ? (
                    <Badge variant="red" className="text-[11px] font-bold px-2.5 py-0.5">
                      {t.quality.tier2BadgeRejected}
                    </Badge>
                  ) : latestPhysical?.verificationStatus === 'REQUIRES_REINSPECTION' ? (
                    <Badge variant="amber" className="text-[11px] font-bold px-2.5 py-0.5">
                      {t.quality.tier2BadgeReinspection}
                    </Badge>
                  ) : (
                    <Badge variant="amber" className="text-[11px] font-bold px-2.5 py-0.5">
                      {t.quality.tier2BadgePending}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg text-[#262320] mt-2">
                  {t.quality.tier2Title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t.quality.tier2Subtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                {latestPhysical ? (
                  <div className="space-y-2.5 text-xs text-gray-700">
                    {/* Certificate Badge */}
                    <div className="p-3 rounded-[8px] bg-emerald-50 border border-[#B7D5C4] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#1B4332] font-bold uppercase tracking-wider block">
                          {t.quality.certificateNumber}
                        </span>
                        <span className="font-mono font-black text-sm text-[#1B4332]">
                          {latestPhysical.certificateNumber}
                        </span>
                      </div>
                      <Award className="w-6 h-6 text-emerald-700" />
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">{t.quality.officialGrade}:</span>
                      <strong className="text-[#1B4332] font-bold text-sm">
                        {latestPhysical.officialGrade}
                      </strong>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">{t.quality.inspector}:</span>
                      <span className="font-semibold text-[#262320]">{latestPhysical.inspectorName}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">{t.quality.inspectionLocation}:</span>
                      <span className="font-semibold text-[#262320]">{latestPhysical.location}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-gray-100">
                      <div className="bg-gray-50 p-2 rounded-xl">
                        <span className="text-[10px] text-gray-500 block">{t.quality.moisturePercentage}</span>
                        <strong className="text-[#262320] font-bold text-xs">{latestPhysical.moisturePercentage || 'N/A'}</strong>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-xl">
                        <span className="text-[10px] text-gray-500 block">{t.quality.foreignMatter}</span>
                        <strong className="text-[#262320] font-bold text-xs">{latestPhysical.foreignMatterPerc || 'N/A'}</strong>
                      </div>
                    </div>

                    {latestPhysical.notes && (
                      <div className="pt-1">
                        <span className="text-gray-500 block mb-0.5 font-medium">{t.quality.inspectionNotes}:</span>
                        <p className="bg-gray-50 p-2.5 rounded-xl border border-[#D8D2C4] text-gray-800">
                          {latestPhysical.notes}
                        </p>
                      </div>
                    )}

                    <div className="text-[11px] text-gray-400 pt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{t.quality.verifiedAt}: {new Date(latestPhysical.verifiedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <FileCheck2 className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Physical verification pending. Authorized MSAMB / APMC quality inspectors will conduct in-person physical assaying.
                    </p>
                  </div>
                )}
              </CardContent>
            </div>

            <div className="p-4 pt-0">
              <Link href="/inspector">
                <Button variant="outline" size="sm" fullWidth className="gap-2 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open on Inspector Desk</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Specifications Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-700" />
            <span>{t.lots.specificationsTitle}</span>
          </CardTitle>
          <CardDescription>
            Detailed agronomic and commercial parameters recorded in local SQLite database.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-gray-500 font-medium">{t.lots.crop}</dt>
              <dd className="font-semibold text-[#262320]">{lot.commodity}</dd>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-gray-500 font-medium">{t.lots.variety}</dt>
              <dd className="font-semibold text-[#262320]">{lot.variety || 'Standard Local'}</dd>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-gray-500 font-medium">{t.lots.quantityLabel}</dt>
              <dd className="font-semibold text-[#262320]">
                {lot.quantity} {lot.unit} ({lot.quantityQuintals} Quintals standardized)
              </dd>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-gray-500 font-medium">{t.lots.expectedPriceLabel}</dt>
              <dd className="font-semibold text-[#1B4332]">
                ₹{lot.expectedPrice} / {lot.unit} (₹{lot.expectedPricePerQuintal}/Qtl)
              </dd>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-gray-500 font-medium">{t.lots.expectedGradeLabel}</dt>
              <dd className="font-semibold text-[#262320]">{lot.expectedGrade}</dd>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-gray-500 font-medium">{t.lots.harvestDateLabel}</dt>
              <dd className="font-semibold text-[#262320]">
                {new Date(lot.harvestDate).toLocaleDateString()}
              </dd>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-gray-500 font-medium">{t.lots.districtLabel}</dt>
              <dd className="font-semibold text-[#262320]">{lot.locationDistrict}</dd>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-gray-500 font-medium">{t.lots.locationLabel}</dt>
              <dd className="font-semibold text-[#262320]">{lot.location || 'N/A'}</dd>
            </div>

            <div className="sm:col-span-2 py-2">
              <dt className="text-gray-500 font-medium block mb-1">{t.lots.descriptionLabel}</dt>
              <dd className="text-gray-800 bg-gray-50 rounded-xl p-3 border border-[#D8D2C4]">
                {lot.description || 'No additional storage or quality notes provided.'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Net Realisation Action Card */}
      <Card className="border-[#B7D5C4] bg-[#FAFAF8]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">CORE USP</Badge>
            <span className="text-xs text-[#1B4332] font-mono font-bold">NET REALISATION</span>
          </div>
          <CardTitle className="text-xl text-[#1B4332] mt-1">
            {t.lots.futureNetTitle}
          </CardTitle>
          <CardDescription className="text-[#1B4332]">
            {t.lots.futureNetDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-[#1B4332]">
            Compare expected ₹{lot.expectedPricePerQuintal}/Qtl against Lasalgaon, Pune, Solapur mandis with real freight and cess deductions.
          </div>
          <Link
            href={`/calculator?price=${lot.expectedPricePerQuintal || lot.expectedPrice}&crop=${encodeURIComponent(lot.commodity)}&quantity=${lot.quantityQuintals || lot.quantity}&market=Lasalgaon+APMC&distance=35&lotId=${lot.lotCode}`}
          >
            <Button variant="primary" className="gap-2 shrink-0 shadow-none">
              <Scale className="w-4 h-4" />
              <span>{t.lots.calculateRealisation}</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Phase 4-6 Future Module Placeholders */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-[#262320]">Integrated Market Modules</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* ========================================================================= */}
      {/* PHASE 4: MATCHED COMMERCIAL BUYERS SECTION */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="blue">Phase 4 • Module D</Badge>
              <span className="text-xs text-gray-500 font-mono font-bold">SMART MATCHING</span>
            </div>
            <h2 className="text-xl font-bold text-[#262320] mt-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-700" />
              <span>{t.buyerMatching.matchedBuyersTitle}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {t.buyerMatching.matchedBuyersSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMakeOfferError(null);
                setMakeOfferSuccess(null);
                setIsMakeOfferOpen(true);
              }}
              className="gap-2 text-xs"
            >
              <Send className="w-3.5 h-3.5 text-sky-600" />
              <span>{t.buyerMatching.makeOfferBtn}</span>
            </Button>
          </div>
        </div>

        {matches.length === 0 ? (
          <Card className="border-dashed border-[#D8D2C4] bg-gray-50/50">
            <CardContent className="py-8 text-center space-y-3">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700">
                  {t.buyerMatching.noMatchesFound}
                </p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Commercial buyers regularly post new demands for {lot.commodity}. When a demand matches this lot’s grade ({lot.expectedGrade}) and quantity ({lot.quantity} {lot.unit}), it will appear here automatically.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMakeOfferOpen(true)}
                className="gap-2 text-xs mt-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Demo Buyer Offer</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => {
              const scoreBadgeVariant =
                m.matchScore >= 80 ? 'emerald' : m.matchScore >= 60 ? 'blue' : 'amber';
              return (
                <Card
                  key={m.demandId}
                  className="shadow-none hover:shadow-none transition-all border border-[#D8D2C4] flex flex-col justify-between"
                >
                  <div>
                    <CardHeader className="pb-3 border-b border-gray-100 bg-sky-50/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#262320] text-base">
                              {m.buyerCompanyName}
                            </span>
                            <VerificationBadge
                              type={m.isBuyerVerified ? 'identity' : 'provisional'}
                              customLabel={m.isBuyerVerified ? t.buyerMatching.buyerIdentityVerified : t.buyerMatching.buyerIdentityUnverified}
                            />
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{m.buyerType}</span>
                            <span>•</span>
                            <span>{m.deliveryLocation || 'Maharashtra'}</span>
                          </div>
                        </div>

                        <Badge variant={scoreBadgeVariant} className="text-xs font-bold px-2.5 py-1 shrink-0">
                          {m.matchScore}% {t.buyerMatching.matchScore}
                        </Badge>
                      </div>

                      {/* Commercial Trade Reputation Strip */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs bg-white/80 p-2 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">
                            {t.buyerMatching.rating}
                          </span>
                          <span className="font-bold text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {m.reputation.ratingScore.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">
                            {t.buyerMatching.completedTrades}
                          </span>
                          <span className="font-bold text-gray-800 mt-0.5 block">
                            {m.reputation.completedTradesCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">
                            {t.buyerMatching.punctuality}
                          </span>
                          <span className="font-bold text-emerald-700 mt-0.5 block">
                            {m.reputation.paymentPunctualityPercent}%
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 pb-3 space-y-3 text-xs">
                      {/* Pricing and demand parameters */}
                      <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl border border-[#D8D2C4]">
                        <div>
                          <span className="text-gray-500 block text-[11px]">Buyer Target Price:</span>
                          <strong className="text-[#1B4332] font-bold text-sm">
                            ₹{m.targetPricePerQtl}/Qtl
                          </strong>
                          {m.minPricePerQtl && m.maxPricePerQtl && (
                            <span className="text-[10px] text-gray-500 block">
                              Range: ₹{m.minPricePerQtl} - ₹{m.maxPricePerQtl}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Required Quantity:</span>
                          <strong className="text-[#262320] font-bold text-sm">
                            {m.requiredQuantityQtl} Quintals
                          </strong>
                          <span className="text-[10px] text-gray-500 block">
                            Target Grade: {m.requiredGrade || 'Any Grade'}
                          </span>
                        </div>
                      </div>

                      {/* Transparent Breakdown Reasons */}
                      {m.breakdownReasons && m.breakdownReasons.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-gray-600 block">
                            {t.buyerMatching.breakdownTitle}:
                          </span>
                          <div className="space-y-1">
                            {m.breakdownReasons.map((reason, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[#1B4332] text-[11px]">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gap Warnings */}
                      {m.gapWarnings && m.gapWarnings.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] font-bold text-amber-800 block">
                            {t.buyerMatching.gapWarningsTitle}:
                          </span>
                          <div className="space-y-1">
                            {m.gapWarnings.map((gap, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-amber-900 text-[11px] bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{gap}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setOfferFormData((prev) => ({
                          ...prev,
                          offeredPricePerQtl: String(m.targetPricePerQtl),
                        }));
                        setMakeOfferError(null);
                        setMakeOfferSuccess(null);
                        setIsMakeOfferOpen(true);
                      }}
                      className="gap-2 text-xs"
                    >
                      <Send className="w-3.5 h-3.5 text-sky-600" />
                      <span>{t.buyerMatching.makeOfferBtn}</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* INCOMING DIGITAL OFFERS SECTION (FARMER ACTION DESK) */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="amber">Module D • Direct Contracting</Badge>
              <span className="text-xs text-gray-500 font-mono font-bold">DIGITAL OFFERS</span>
            </div>
            <h2 className="text-xl font-bold text-[#262320] mt-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-700" />
              <span>{t.buyerMatching.incomingOffersTitle}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {t.buyerMatching.incomingOffersSubtitle}
            </p>
          </div>

          <Badge variant={offers.length > 0 ? 'amber' : 'gray'} className="text-xs font-bold self-start sm:self-auto">
            {offers.length} {offers.length === 1 ? 'Offer' : 'Offers'} Received
          </Badge>
        </div>

        {/* Reserved Status Alert if Lot is Reserved */}
        {lot.status === 'RESERVED' && (
          <div className="p-4 rounded-[8px] bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold block">{t.buyerMatching.lotReservedNotice}</span>
              <p className="text-blue-800 text-xs mt-0.5">
                An offer was accepted by the farmer. The lot is now blocked from competing bids while transport logistics and bank escrow are confirmed.
              </p>
            </div>
          </div>
        )}

        {/* Offer Action Toast Feedback */}
        {offerActionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-[#B7D5C4] text-[#1B4332] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{offerActionSuccess}</span>
          </div>
        )}

        {offerActionError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{offerActionError}</span>
          </div>
        )}

        {offers.length === 0 ? (
          <Card className="border-dashed border-[#D8D2C4] bg-gray-50/50">
            <CardContent className="py-8 text-center space-y-3">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700">
                  {t.buyerMatching.noOffersReceived}
                </p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  When verified commercial buyers dispatch binding offers on this lot, they will appear here with price, payment terms, and instant accept/reject options.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMakeOfferOpen(true)}
                className="gap-2 text-xs mt-2"
              >
                <Send className="w-3.5 h-3.5 text-sky-600" />
                <span>Simulate Digital Buyer Bid</span>
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
                      ? 'border-emerald-300 ring-1 ring-emerald-500/20 bg-emerald-50/10'
                      : isPending
                      ? 'border-amber-200 bg-amber-50/10'
                      : 'border-[#D8D2C4]'
                  }`}
                >
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#262320] text-base">
                            {offer.buyerCompanyName}
                          </span>
                          <VerificationBadge
                            type={offer.isBuyerVerified ? 'identity' : 'provisional'}
                            customLabel={offer.isBuyerVerified ? t.buyerMatching.buyerIdentityVerified : t.buyerMatching.buyerIdentityUnverified}
                          />
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
                        <div className="text-xs text-gray-500 flex items-center gap-3 pt-1">
                          <span>Representative: {offer.buyerName}</span>
                          <span>•</span>
                          <ReputationCluster
                            ratingScore={offer.reputation?.ratingScore || 4.5}
                            completedDealsCount={offer.reputation?.completedTradesCount || 0}
                            onTimeDeliveryPercent={offer.reputation?.paymentPunctualityPercent || 95}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-gray-500 block uppercase font-bold">
                          {t.buyerMatching.totalOfferValue}
                        </span>
                        <span className="text-xl font-heading font-black text-[#1B4332]">
                          {formatINR(offer.totalOfferValue)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-3 pb-3 space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-2.5 rounded-xl border border-[#D8D2C4]">
                      <div>
                        <span className="text-gray-500 block text-[11px]">{t.buyerMatching.offeredPrice}:</span>
                        <strong className="text-[#1B4332] font-bold text-sm">
                          ₹{offer.offeredPricePerQtl}/Qtl
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">{t.buyerMatching.offeredQuantity}:</span>
                        <strong className="text-[#262320] font-bold text-sm">
                          {offer.quantityQuintals} Quintals
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">{t.buyerMatching.paymentTerms}:</span>
                        <span className="text-[#262320] font-medium text-xs truncate block">
                          {offer.paymentTerms || 'Bank Escrow'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">{t.buyerMatching.validUntil}:</span>
                        <span className="text-[#262320] font-medium text-xs block">
                          {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : '7 Days'}
                        </span>
                      </div>
                    </div>

                    {offer.notes && (
                      <p className="text-xs text-gray-700 bg-amber-50/40 p-2 rounded-lg border border-amber-100">
                        <span className="font-semibold text-[#262320]">Buyer Notes: </span>
                        {offer.notes}
                      </p>
                    )}

                    {/* Farmer Action Buttons if Offer is Pending */}
                    {isPending && lot.status !== 'SOLD' && (
                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionOfferId === offer.id}
                          onClick={() => handleRejectOffer(offer.id)}
                          className="gap-2 text-xs border-red-200 text-red-700 hover:bg-red-50 w-full sm:w-auto"
                        >
                          {actionOfferId === offer.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span>{t.buyerMatching.rejectOfferBtn}</span>
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionOfferId === offer.id}
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="gap-2 text-xs shadow-none bg-emerald-700 hover:bg-emerald-800 text-white w-full sm:w-auto"
                        >
                          {actionOfferId === offer.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>{t.buyerMatching.acceptOfferBtn}</span>
                        </Button>
                      </div>
                    )}

                    {/* Trade Contract Activated Notice & Direct Link to Transactions */}
                    {isAccepted && (
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50/80 p-3 rounded-xl border border-[#B7D5C4]">
                        <div className="flex items-center gap-2 text-xs text-[#1B4332] font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Commercial Trade Contract Activated • Lot Reserved for Logistics</span>
                        </div>
                        <Link href="/transactions">
                          <Button size="sm" variant="primary" className="text-xs gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs w-full sm:w-auto">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>View Trade Transaction & Settlement</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* MODULE L & M: NET REALISATION & SMART SELLING RECOMMENDATION (PHASE 6) */}
      {/* ========================================================================= */}
      <section id="net-realisation" className="space-y-6 pt-6 border-t border-[#D8D2C4]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="amber" className="bg-amber-100 text-amber-900 border-[#FDE68A] font-bold">
                Module L & M • Phase 6 Active
              </Badge>
              <span className="text-xs font-mono text-purple-700 font-bold uppercase tracking-wider">
                CORE USP NET DISCOVERY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#262320] tracking-tight flex items-center gap-3">
              <Scale className="w-8 h-8 text-amber-600 shrink-0" />
              <span>{t.netRealisation.hubTitle}</span>
            </h2>
            <p className="text-sm text-gray-600 max-w-3xl">
              {t.netRealisation.hubSubtitle}
            </p>
          </div>

          {/* Holding Days Slider / Parameter Controller */}
          <div className="bg-gray-50 p-3 rounded-[8px] border border-[#D8D2C4] flex items-center gap-3 shrink-0">
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-gray-700 block">{t.netRealisation.holdingDaysLabel}</span>
              <span className="text-[11px] text-gray-500 font-mono">MSWC Storage Simulator</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={holdingDaysInput}
                onChange={(e) => handleRecalculateStorage(Number(e.target.value))}
                className="w-24 accent-purple-700 cursor-pointer"
              />
              <span className="text-xs font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-lg font-mono">
                {holdingDaysInput}d
              </span>
            </div>
          </div>
        </div>

        {realisationLoading && (
          <div className="p-8 text-center bg-gray-50 rounded-[8px] border border-[#D8D2C4]">
            <Loader2 className="w-6 h-6 text-purple-700 animate-spin mx-auto" />
            <p className="text-xs text-gray-500 mt-2">Computing deterministic Net Realisation...</p>
          </div>
        )}

        {realisationData && !realisationLoading && (
          <div className="space-y-6">
            {/* 1. PRIMARY RECOMMENDATION HERO CARD */}
            {realisationData.bestOption && (
              <Card className={`overflow-hidden border-2 shadow-none ${
                realisationData.recommendation === 'SELL_NOW'
                  ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40'
                  : realisationData.recommendation === 'STORE_AND_SELL_LATER'
                  ? 'border-amber-400 bg-gradient-to-br from-amber-50 via-white to-purple-50/40'
                  : 'border-sky-400 bg-gradient-to-br from-sky-50 via-white to-indigo-50/40'
              }`}>
                <CardHeader className="pb-4 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          realisationData.recommendation === 'SELL_NOW'
                            ? 'bg-emerald-600 text-white'
                            : realisationData.recommendation === 'STORE_AND_SELL_LATER'
                            ? 'bg-amber-600 text-white'
                            : 'bg-sky-600 text-white'
                        }`}>
                          {realisationData.recommendation === 'SELL_NOW'
                            ? t.netRealisation.sellNow
                            : realisationData.recommendation === 'STORE_AND_SELL_LATER'
                            ? t.netRealisation.storeAndSellLater
                            : t.netRealisation.waitAndWatch}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          {realisationData.recommendationTitle}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-heading font-black text-[#262320]">
                        {realisationData.bestOption.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {realisationData.bestOption.location} • {realisationData.bestOption.distanceKm} km • {realisationData.bestOption.dataSource}
                      </p>
                    </div>

                    <div className="text-left sm:text-right bg-white p-3 sm:p-4 rounded-[8px] border border-[#D8D2C4]/80 shadow-xs shrink-0">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        {t.netRealisation.netPerQuintal}
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                        ₹{realisationData.bestOption.netRealisationPerQtl.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-gray-500"> / Qtl</span>
                      </div>
                      <span className="text-xs font-bold text-purple-900 block mt-0.5">
                        Total Net: ₹{realisationData.bestOption.netRealisation.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown Formula Strip */}
                  <div className="mt-4 pt-3 border-t border-[#D8D2C4]/70 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">{t.netRealisation.grossSaleValue}</span>
                      <span className="font-bold text-gray-800">₹{realisationData.bestOption.grossSaleValue.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-500 block">(₹{realisationData.bestOption.sellingPricePerQtl}/Qtl)</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-gray-100">
                      <span className="text-rose-500 block text-[10px] uppercase font-bold">− {t.netRealisation.transportCost}</span>
                      <span className="font-bold text-rose-700">₹{realisationData.bestOption.transportCost.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-500 block">(₹{realisationData.bestOption.transportCostPerQtl}/Qtl)</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-gray-100">
                      <span className="text-purple-500 block text-[10px] uppercase font-bold">− {t.netRealisation.storageCost}</span>
                      <span className="font-bold text-purple-700">₹{realisationData.bestOption.storageCost.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-500 block">({realisationData.bestOption.storageDays} days)</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-gray-100">
                      <span className="text-amber-600 block text-[10px] uppercase font-bold">− {t.netRealisation.otherCosts}</span>
                      <span className="font-bold text-amber-800">₹{realisationData.bestOption.otherCosts.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-500 block">(Cess + Handling)</span>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl border border-[#B7D5C4] col-span-2 sm:col-span-1">
                      <span className="text-emerald-700 block text-[10px] uppercase font-bold">= {t.netRealisation.netRealisation}</span>
                      <span className="font-black text-[#1B4332] text-sm">₹{realisationData.bestOption.netRealisation.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-emerald-700 block font-bold">₹{realisationData.bestOption.netRealisationPerQtl}/Qtl</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-4">
                  {/* Why this recommendation? */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#262320] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>{t.netRealisation.whyThisRecommendation}</span>
                    </h4>
                    <div className="space-y-1.5">
                      {realisationData.reasons.map((reason, idx) => (
                        <div key={idx} className="text-xs text-gray-700 flex items-start gap-2 bg-white/80 p-2 rounded-xl border border-gray-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warnings if any */}
                  {realisationData.warnings.length > 0 && (
                    <div className="space-y-2">
                      <div className="space-y-1.5">
                        {realisationData.warnings.map((warn, idx) => (
                          <div key={idx} className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 2. THREE DECISION CARDS: SELL NOW | STORE & SELL LATER | WAIT & WATCH */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: SELL NOW */}
              <Card className={`border ${
                realisationData.recommendation === 'SELL_NOW'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                  : 'border-[#D8D2C4] bg-white'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1B4332] uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.netRealisation.sellNow}
                    </span>
                    {realisationData.recommendation === 'SELL_NOW' && (
                      <Badge variant="emerald" className="text-[10px]">{t.netRealisation.bestSellingOption}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base text-[#262320] mt-1">
                    Immediate Cash Settlement
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2 pt-2">
                  <div className="p-2.5 bg-gray-50 rounded-xl space-y-1">
                    <span className="text-[11px] text-gray-500 block">Best Immediate Net:</span>
                    <div className="text-xl font-black text-emerald-700">
                      ₹{realisationData.storeLaterComparison?.immediateNetPerQtl.toLocaleString('en-IN') || realisationData.bestOption?.netRealisationPerQtl.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-gray-500"> / Qtl</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Locks in immediate liquidity with zero holding charges and protects against downside market risk.
                  </p>
                </CardContent>
              </Card>

              {/* Card 2: STORE & SELL LATER */}
              <Card className={`border ${
                realisationData.recommendation === 'STORE_AND_SELL_LATER'
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                  : 'border-[#D8D2C4] bg-white'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <Warehouse className="w-3.5 h-3.5" />
                      {t.netRealisation.storeAndSellLater}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      {t.netRealisation.estimatedLabel}
                    </span>
                  </div>
                  <CardTitle className="text-base text-[#262320] mt-1">
                    Seasonal Post-Harvest Holding
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2 pt-2">
                  <div className="p-2.5 bg-gray-50 rounded-xl space-y-1">
                    <span className="text-[11px] text-gray-500 block">Projected Future Net:</span>
                    <div className="text-xl font-black text-purple-900">
                      ₹{realisationData.storeLaterComparison?.projectedNetPerQtl.toLocaleString('en-IN') || '—'}
                      <span className="text-xs font-normal text-gray-500"> / Qtl</span>
                    </div>
                    {realisationData.storeLaterComparison && (
                      <span className="text-[11px] text-purple-700 font-bold block">
                        Net Advantage: {realisationData.storeLaterComparison.netAdvantagePerQtl >= 0 ? '+' : ''}₹{realisationData.storeLaterComparison.netAdvantagePerQtl}/Qtl
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 italic">
                    {t.netRealisation.notGuaranteed}
                  </p>
                </CardContent>
              </Card>

              {/* Card 3: WAIT & WATCH */}
              <Card className={`border ${
                realisationData.recommendation === 'WAIT_AND_WATCH'
                  ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20'
                  : 'border-[#D8D2C4] bg-white'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-800 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t.netRealisation.waitAndWatch}
                    </span>
                    {realisationData.recommendation === 'WAIT_AND_WATCH' && (
                      <Badge variant="blue" className="text-[10px]">Active Guidance</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base text-[#262320] mt-1">
                    Market Intelligence Watch
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2 pt-2">
                  <div className="p-2.5 bg-gray-50 rounded-xl space-y-1">
                    <span className="text-[11px] text-gray-500 block">Market Signal:</span>
                    <div className="text-sm font-bold text-gray-800">
                      Arrival Volumes Active
                    </div>
                    <span className="text-[11px] text-gray-500 block">
                      Monitor APMC modal prices daily
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Recommended when arrivals are unstable or price trends suggest an impending pivot.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 3. COMPARISON TABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#262320] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-700" />
                  <span>{t.netRealisation.compareSellingOptions} ({realisationData.sellingOptions.length})</span>
                </h3>
              </div>

              <div className="overflow-x-auto rounded-[8px] border border-[#D8D2C4] bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-[#D8D2C4] text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      <th className="py-3 px-4">{t.netRealisation.tableOption}</th>
                      <th className="py-3 px-3 text-right">{t.netRealisation.tableGross}</th>
                      <th className="py-3 px-3 text-right text-rose-600">− {t.netRealisation.tableTransport}</th>
                      <th className="py-3 px-3 text-right text-purple-600">− {t.netRealisation.tableStorage}</th>
                      <th className="py-3 px-3 text-right text-amber-700">− {t.netRealisation.tableOther}</th>
                      <th className="py-3 px-4 text-right text-[#1B4332] font-black">= {t.netRealisation.tableNet}</th>
                      <th className="py-3 px-3 text-center">{t.netRealisation.reliability}</th>
                      <th className="py-3 px-4 text-center">{t.netRealisation.tableAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {realisationData.sellingOptions.map((opt) => {
                      const isBest = realisationData.bestOption?.id === opt.id;
                      return (
                        <tr
                          key={opt.id}
                          className={`hover:bg-gray-50/60 transition-colors ${
                            isBest ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#262320] flex items-center gap-1.5">
                              <span>{opt.name}</span>
                              {isBest && (
                                <Badge variant="emerald" className="text-[9px] px-1.5 py-0 font-bold">
                                  BEST
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-500 block">
                              {opt.location} • {opt.distanceKm} km
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-[#262320]">
                            ₹{opt.sellingPricePerQtl.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right text-rose-600 font-mono">
                            ₹{opt.transportCostPerQtl}
                          </td>
                          <td className="py-3 px-3 text-right text-purple-600 font-mono">
                            {opt.storageCostPerQtl > 0 ? `₹${opt.storageCostPerQtl}` : '—'}
                          </td>
                          <td className="py-3 px-3 text-right text-amber-700 font-mono">
                            ₹{opt.otherCostsPerQtl}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-black text-emerald-700 text-sm">
                              ₹{opt.netRealisationPerQtl.toLocaleString('en-IN')}
                            </div>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              Total: ₹{opt.netRealisation.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              opt.reliability.verified
                                ? 'bg-emerald-100 text-[#1B4332]'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {opt.reliability.verified ? (
                                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-amber-700" />
                              )}
                              <span>{opt.reliability.ratingScore ? `★ ${opt.reliability.ratingScore}` : 'Yard'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${
                              isBest
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {isBest ? 'Recommended' : 'Alternative'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. EXPANDABLE "HOW IS THIS CALCULATED?" FORMULA ACCORDION */}
            <div className="rounded-[8px] border border-[#D8D2C4] bg-gray-50/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowFormulaExplain(!showFormulaExplain)}
                className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-gray-800 hover:bg-gray-100/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-700" />
                  <span>{t.netRealisation.howIsThisCalculated}</span>
                </div>
                {showFormulaExplain ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {showFormulaExplain && (
                <div className="p-4 pt-0 text-xs text-gray-700 space-y-3 border-t border-[#D8D2C4]/60 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-[#D8D2C4]/80 space-y-1">
                      <span className="font-bold text-[#262320] block">1. Gross Sale Value</span>
                      <p className="text-[11px] text-gray-600 font-mono">{t.netRealisation.formulaGrossText}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-[#D8D2C4]/80 space-y-1">
                      <span className="font-bold text-[#262320] block">2. Phase 5 Deterministic Transport</span>
                      <p className="text-[11px] text-gray-600 font-mono">{t.netRealisation.formulaTransportText}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-[#D8D2C4]/80 space-y-1">
                      <span className="font-bold text-[#262320] block">3. MSWC Warehouse Storage</span>
                      <p className="text-[11px] text-gray-600 font-mono">{t.netRealisation.formulaStorageText}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-[#D8D2C4]/80 space-y-1">
                      <span className="font-bold text-[#262320] block">4. True Net Realisation</span>
                      <p className="text-[11px] text-[#1B4332] font-mono font-bold">{t.netRealisation.formulaNetText}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                    <span className="font-bold block">Data Provenance & Disclaimers:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      <li>Transport: {realisationData.dataSourceNotes.transportEngine}</li>
                      <li>Storage: {realisationData.dataSourceNotes.storageModel}</li>
                      <li>Markets: {realisationData.dataSourceNotes.marketData}</li>
                      <li>Projections: {realisationData.dataSourceNotes.futurePriceDisclaimer}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* MODULE T: TRANSPORT & LOGISTICS MANAGEMENT */}
      {/* ========================================================================= */}
      <section className="space-y-6 pt-4 border-t border-[#D8D2C4]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="gray">Transport & Logistics</Badge>
              <span className="text-xs font-mono text-[#5A5243] font-bold">CORRIDOR FREIGHT & BOOKING</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#262320] tracking-tight flex items-center gap-2.5">
              <Truck className="w-6 h-6 text-[#1B4332]" />
              <span>{t.transport.lotTransportTitle}</span>
            </h2>
            <p className="text-sm text-[#5A5243]">
              {t.transport.lotTransportSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#F4F1EA] text-[#1B4332] border border-[#D8D2C4] px-3 py-1 rounded font-bold">
              PICKUP: {lot.location || lot.locationDistrict}
            </span>
          </div>
        </div>

        {/* Transparent Cost Formula Banner */}
        <div className="p-4 rounded-lg bg-[#F4F1EA] border border-[#D8D2C4] text-xs text-[#262320] space-y-1.5 shadow-none">
          <div className="flex items-center gap-2 font-bold text-sm text-[#1B4332] font-heading">
            <Gauge className="w-4 h-4 text-[#1B4332]" />
            <span>{t.transport.formulaTitle}</span>
          </div>
          <p className="font-mono bg-white p-2 rounded border border-[#D8D2C4] font-semibold text-[11px] text-[#1B4332]">
            {t.transport.formulaText}
          </p>
          <p className="text-[11px] text-[#5A5243] leading-relaxed">
            {t.transport.netRealisationNote}
          </p>
        </div>

        {/* Active Transport Bookings for this Lot */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-heading text-[#262320] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5A5243]" />
              <span>{t.transport.activeBookingsTitle} ({transportRequests.length})</span>
            </h3>
          </div>

          {transportRequests.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#FDFBF7] border border-dashed border-[#D8D2C4] text-xs text-[#5A5243] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4F1EA] border border-[#D8D2C4] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-[#8C827A]" />
              </div>
              <p>{t.transport.noBookingsYet}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transportRequests.map((req) => {
                let statusBadgeVariant: 'emerald' | 'blue' | 'amber' | 'purple' | 'red' | 'gray' = 'amber';
                let statusText = t.transport.statusRequested;
                if (req.status === 'ACCEPTED') {
                  statusBadgeVariant = 'blue';
                  statusText = t.transport.statusAccepted;
                } else if (req.status === 'IN_TRANSIT') {
                  statusBadgeVariant = 'purple';
                  statusText = t.transport.statusInTransit;
                } else if (req.status === 'DELIVERED') {
                  statusBadgeVariant = 'emerald';
                  statusText = t.transport.statusDelivered;
                } else if (req.status === 'REJECTED') {
                  statusBadgeVariant = 'red';
                  statusText = t.transport.statusRejected;
                } else if (req.status === 'CANCELLED') {
                  statusBadgeVariant = 'gray';
                  statusText = t.transport.statusCancelled;
                }

                return (
                  <Card key={req.id} className="border-[#D8D2C4] bg-[#FDFBF7] shadow-none rounded-lg">
                    <CardHeader className="pb-2 border-b border-[#D8D2C4]/60">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#262320] text-sm font-heading">
                          {req.transporter?.businessName || 'Assigned Logistics Carrier'}
                        </span>
                        <Badge variant={statusBadgeVariant} className="text-[11px] font-bold">
                          {statusText}
                        </Badge>
                      </div>
                      <span className="text-xs text-[#8C827A] font-mono">
                        REQ #{req.id.slice(-8).toUpperCase()}
                      </span>
                    </CardHeader>
                    <CardContent className="pt-3 text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[#5A5243] block">Corridor:</span>
                          <span className="font-bold text-[#262320]">{req.pickupLocation} → {req.dropLocation}</span>
                        </div>
                        <div>
                          <span className="text-[#5A5243] block">Distance & Trips:</span>
                          <span className="font-bold text-[#262320]">{req.distanceKm} km • {req.estimatedTrips || 1} Trip(s)</span>
                        </div>
                        <div>
                          <span className="text-[#5A5243] block">Vehicle:</span>
                          <span className="font-bold text-[#262320]">{req.vehicle?.vehicleName || req.vehicle?.registrationNumber || 'Registered Cargo Fleet'}</span>
                        </div>
                        <div>
                          <span className="text-[#5A5243] block">Total Freight:</span>
                          <span className="font-black text-[#1B4332] text-sm font-heading">{formatINR(req.estimatedCost)}</span>
                        </div>
                      </div>

                      {req.scheduledPickup && (
                        <div className="text-[11px] text-[#5A5243] bg-white p-2 rounded-lg border border-[#D8D2C4] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#1B4332]" />
                          <span>{t.transport.scheduledPickupLabel}: <strong className="text-[#262320]">{new Date(req.scheduledPickup).toLocaleDateString()}</strong></span>
                        </div>
                      )}

                      {req.actualDelivery && (
                        <div className="text-[11px] text-[#1B4332] bg-emerald-50 p-2 rounded-lg border border-[#B7D5C4] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.transport.actualDeliveryLabel}: <strong>{new Date(req.actualDelivery).toLocaleDateString()}</strong></span>
                        </div>
                      )}

                      {req.notes && (
                        <p className="text-[11px] text-[#5A5243] italic bg-white p-2 rounded-lg border border-[#D8D2C4]">
                          &quot;{req.notes}&quot;
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Destination & Options Controls */}
        <div className="bg-white border border-[#D8D2C4] rounded-lg p-5 shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#262320] block mb-1">
                  {t.transport.destinationLabel}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8C827A] absolute left-3 top-2.5" />
                  <select
                    value={selectedDestination}
                    onChange={(e) => {
                      setSelectedDestination(e.target.value);
                      handleRecalculateTransport(e.target.value, preferRefrigerated);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-lg border border-[#D8D2C4] focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white text-[#262320]"
                  >
                    <option value="Pune">Pune Market Yard (Pune)</option>
                    <option value="Mumbai">Vashi APMC (Navi Mumbai / Thane)</option>
                    <option value="Nashik">Nashik City APMC (Nashik)</option>
                    <option value="Chhatrapati Sambhaji Nagar">Chhatrapati Sambhaji Nagar Mandi</option>
                    <option value="Solapur">Solapur APMC (Solapur)</option>
                    <option value="Ahmednagar">Ahmednagar APMC</option>
                    <option value="Kolhapur">Kolhapur APMC</option>
                    <option value="Akola">Akola Cotton Market</option>
                    <option value="Nagpur">Nagpur Cotton Market</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="preferReefer"
                  checked={preferRefrigerated}
                  onChange={(e) => {
                    setPreferRefrigerated(e.target.checked);
                    handleRecalculateTransport(selectedDestination, e.target.checked);
                  }}
                  className="w-4 h-4 text-[#1B4332] rounded border-[#D8D2C4] focus:ring-[#1B4332]"
                />
                <label htmlFor="preferReefer" className="text-xs font-semibold text-[#262320] cursor-pointer">
                  {t.transport.preferColdChainLabel}
                </label>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={loadingTransport}
              onClick={() => handleRecalculateTransport(selectedDestination, preferRefrigerated)}
              className="gap-2 text-xs border-[#D8D2C4] text-[#1B4332] hover:bg-[#F4F1EA] self-end sm:self-center min-h-[36px]"
            >
              {loadingTransport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gauge className="w-3.5 h-3.5" />}
              <span>{t.transport.findTransportersBtn}</span>
            </Button>
          </div>

          {/* Success / Error Messages */}
          {bookingSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-[#B7D5C4] text-[#1B4332] rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bookingSuccessMsg}</span>
            </div>
          )}
          {bookingErrorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{bookingErrorMsg}</span>
            </div>
          )}

          {/* Matching Vehicles Grid */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#5A5243] uppercase tracking-wider font-heading">
              {t.transport.matchingTransportersTitle} ({transportOptions.length})
            </h4>

            {loadingTransport ? (
              <div className="py-8 text-center text-xs text-[#5A5243] space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1B4332]" />
                <p>Calculating optimal corridors and freight rates...</p>
              </div>
            ) : transportOptions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5A5243] border border-dashed border-[#D8D2C4] rounded-lg bg-[#FDFBF7]">
                {t.transport.noTransportersAvailable}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transportOptions.map((opt) => (
                  <Card
                    key={`${opt.transporterId}-${opt.vehicleId}`}
                    className="border-[#D8D2C4] hover:border-[#1B4332]/40 transition-all shadow-none flex flex-col justify-between rounded-lg bg-white"
                  >
                    <div>
                      <CardHeader className="pb-3 border-b border-[#D8D2C4]/60">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="font-bold text-[#262320] text-sm block font-heading">
                              {opt.transporterName}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <VerificationBadge
                                type={opt.verified ? 'identity' : 'provisional'}
                                customLabel={opt.verified ? t.transport.verifiedPermit : t.transport.unverifiedPermit}
                              />
                              <ReputationCluster
                                ratingScore={opt.ratingScore}
                                completedDealsCount={100}
                                onTimeDeliveryPercent={opt.onTimeDeliveryPercent}
                                size="sm"
                              />
                            </div>
                          </div>

                          <Badge variant="gray" className="text-xs font-bold border border-[#D8D2C4]">
                            {opt.matchScore}% Match
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-3 text-xs space-y-3">
                        <div className="flex items-center justify-between bg-[#F4F1EA] p-2.5 rounded-lg border border-[#D8D2C4]/60">
                          <div>
                            <span className="font-bold text-[#262320] text-xs block font-heading">
                              {opt.vehicleName}
                            </span>
                            <span className="text-[10px] font-mono text-[#5A5243]">
                              {opt.registrationNumber} • {opt.capacityQuintals} Qtl ({opt.capacityTonnes} Tonnes)
                            </span>
                          </div>
                          {opt.isRefrigerated ? (
                            <Badge variant="blue" className="text-[10px]">
                              {t.transport.refrigeratedBadge}
                            </Badge>
                          ) : (
                            <Badge variant="gray" className="text-[10px]">
                              {t.transport.standardBadge}
                            </Badge>
                          )}
                        </div>

                        {/* Cost Equation Box */}
                        <div className="bg-[#FDFBF7] p-3 rounded-lg border border-[#D8D2C4] space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs font-medium text-[#5A5243]">Estimated Freight:</span>
                            <div className="text-right">
                              <span className="text-lg font-black text-[#1B4332] font-heading">
                                {formatINR(opt.estimatedCost)}
                              </span>
                              <span className="text-[11px] text-[#1B4332] font-bold block">
                                (₹{opt.costPerQuintal}/Qtl)
                              </span>
                            </div>
                          </div>
                          <div className="text-[11px] font-mono text-[#1B4332] pt-1 border-t border-[#D8D2C4]/60 flex items-center justify-between">
                            <span>Equation:</span>
                            <span>{opt.costEquation}</span>
                          </div>
                          <div className="text-[10px] text-[#5A5243] flex items-center justify-between pt-0.5">
                            <span>Transit corridor:</span>
                            <span>{opt.distanceKm} km (~{opt.estimatedHours} hrs)</span>
                          </div>
                        </div>

                        {/* Reasons checklist */}
                        {opt.reasons && opt.reasons.length > 0 && (
                          <div className="space-y-1 text-[11px]">
                            {opt.reasons.slice(0, 2).map((r, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[#1B4332]">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {opt.considerations && opt.considerations.length > 0 && (
                          <div className="space-y-1 text-[11px]">
                            {opt.considerations.slice(0, 1).map((c, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{c}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <div className="p-4 pt-0">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        disabled={lot.status === 'SOLD'}
                        onClick={() => {
                          setSelectedOptionForBooking(opt);
                          setBookingScheduledDate(
                            lot.readyForPickupDate
                              ? new Date(lot.readyForPickupDate).toISOString().split('T')[0]
                              : new Date(Date.now() + 86400000).toISOString().split('T')[0]
                          );
                          setBookingErrorMsg(null);
                          setBookingSuccessMsg(null);
                          setIsBookingModalOpen(true);
                        }}
                        className="gap-2 bg-[#1B4332] hover:bg-[#1B4332]/90 text-white shadow-none rounded-lg min-h-[36px]"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{t.transport.bookTransportBtn}</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

          {/* Module S: Safe Payment Escrow (Phase 6) */}
          <Card className="hover:border-[#D8D2C4] transition-all border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="gray">Phase 6</Badge>
                <span className="text-xs font-mono text-gray-500">MODULE S</span>
              </div>
              <CardTitle className="text-base text-[#262320] mt-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-700" />
                <span>{t.lots.futureEscrowTitle}</span>
              </CardTitle>
              <CardDescription className="text-xs">{t.lots.futureEscrowDesc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 text-xs text-gray-500 bg-gray-50/50 p-4 rounded-b-2xl border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="font-semibold text-gray-700">Escrow Standby</span>
              </div>
              <p className="mt-1">
                Full payment is securely held when the deal is struck and disbursed upon delivery verification.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REQUEST AI ASSESSMENT MODAL */}
      {/* ========================================================================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-[8px] shadow-2xl border border-[#D8D2C4] overflow-hidden my-8">
            <div className="px-6 py-5 bg-[#1B4332] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="amber" className="text-[10px] uppercase font-bold">
                    {t.quality.tier1Badge}
                  </Badge>
                  <span className="text-xs font-mono text-emerald-200">{lot.lotCode}</span>
                </div>
                <h2 className="text-xl font-bold mt-1">{t.quality.aiModalTitle}</h2>
                <p className="text-xs text-emerald-100">{t.quality.aiModalSubtitle}</p>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 rounded-full hover:bg-emerald-700 text-emerald-100 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Hidden file inputs for Desktop / Mobile Gallery and Mobile Camera */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                aria-label={t.quality.photoInputLabel}
                onChange={handlePhotoSelect}
                className="sr-only"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                aria-label={t.quality.cameraInputLabel}
                onChange={handlePhotoSelect}
                className="sr-only"
              />

              {aiSuccessMessage && (
                <div className="p-4 rounded-[8px] bg-emerald-50 border border-emerald-300 text-[#1B4332] flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                  <span className="text-sm font-semibold">{aiSuccessMessage}</span>
                </div>
              )}

              {aiErrors.general && (
                <div className="p-4 rounded-[8px] bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-sm font-semibold">{aiErrors.general}</span>
                </div>
              )}

              {photoError && (
                <div className="p-4 rounded-[8px] bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-sm font-semibold">{photoError}</span>
                </div>
              )}

              {/* Photo Input & Preview Section */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#262320] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>{t.quality.tier1Subtitle}</span>
                  </span>
                  <span className="text-xs font-semibold text-rose-600">* Required</span>
                </label>

                {!selectedPhoto ? (
                  /* Empty State: Prompt farmer to capture or select produce image */
                  <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-[8px] p-6 text-center bg-emerald-50/25 transition-all">
                    <div className="w-12 h-12 rounded-[8px] bg-emerald-100 text-[#1B4332] flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-6 h-6 text-emerald-700" />
                    </div>
                    <p className="text-sm font-bold text-[#262320] mb-1">
                      {t.quality.photoEmptyPrompt}
                    </p>
                    <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
                      {t.quality.ruleBasedNotice}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => cameraInputRef.current?.click()}
                        className="gap-2 text-xs shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{t.quality.takePhotoBtn}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => galleryInputRef.current?.click()}
                        className="gap-2 text-xs border-emerald-600 text-[#1B4332] hover:bg-emerald-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t.quality.uploadPhotoBtn}</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Selected State: Show photo preview with Change / Remove actions */
                  <div className="rounded-[8px] border border-emerald-300 overflow-hidden bg-gray-900/5 shadow-xs">
                    <div className="relative bg-black/10 flex items-center justify-center min-h-44 max-h-60 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPhoto}
                        alt="Produce sample preview"
                        className="w-full max-h-60 object-contain mx-auto"
                      />
                    </div>
                    <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold text-gray-800 truncate max-w-[180px]">
                          {photoFileName || 'produce_photo.jpg'}
                        </span>
                        {photoFileSize && (
                          <span className="text-[11px] font-mono text-gray-400 shrink-0">
                            ({photoFileSize})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => galleryInputRef.current?.click()}
                          className="text-xs py-1 px-2.5 h-7 gap-1 border-[#D8D2C4] hover:border-emerald-600 text-gray-700"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{t.quality.changePhotoBtn}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemovePhoto}
                          className="text-xs py-1 px-2.5 h-7 gap-1 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.quality.removePhotoBtn}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preliminary Grade Suggestion */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#262320]">
                  {t.quality.estimatedGradeLabel}
                </label>
                <select
                  value={aiFormData.estimatedGrade}
                  onChange={(e) => setAiFormData({ ...aiFormData, estimatedGrade: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm bg-white"
                >
                  <option value="Grade A">Grade A (Premium / Export Quality)</option>
                  <option value="Grade B">Grade B (Standard Market Quality)</option>
                  <option value="Grade C">Grade C (Fair Average Quality - FAQ)</option>
                </select>
              </div>

              {/* Color Consistency */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#262320]">{t.quality.colorLabel}</label>
                <input
                  type="text"
                  value={aiFormData.color}
                  onChange={(e) => setAiFormData({ ...aiFormData, color: e.target.value })}
                  placeholder={t.quality.colorPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                />
              </div>

              {/* Visible Surface Damage */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#262320]">{t.quality.visibleDamageLabel}</label>
                <input
                  type="text"
                  value={aiFormData.visibleDamage}
                  onChange={(e) => setAiFormData({ ...aiFormData, visibleDamage: e.target.value })}
                  placeholder={t.quality.visibleDamagePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                />
              </div>

              {/* Size Uniformity and Visible Defects */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#262320]">{t.quality.sizeUniformityLabel}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={aiFormData.sizeUniformity}
                    onChange={(e) => setAiFormData({ ...aiFormData, sizeUniformity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#262320]">{t.quality.visibleDefectsLabel}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={aiFormData.visibleDefects}
                    onChange={(e) => setAiFormData({ ...aiFormData, visibleDefects: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                  />
                </div>
              </div>

              {/* Assessment Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#262320]">{t.quality.assessmentNotesLabel}</label>
                <textarea
                  rows={2}
                  value={aiFormData.assessmentNotes}
                  onChange={(e) => setAiFormData({ ...aiFormData, assessmentNotes: e.target.value })}
                  placeholder={t.quality.assessmentNotesPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>AI Assessment — Not Verified</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  {t.quality.tier1Disclaimer}
                </p>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-[#D8D2C4] flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsAiModalOpen(false)}
                disabled={aiSubmitting}
              >
                {t.lots.cancelBtn}
              </Button>

              <Button
                variant="primary"
                onClick={handleRecordAiAssessment}
                disabled={!selectedPhoto || aiSubmitting}
                aria-disabled={!selectedPhoto || aiSubmitting}
                className={`gap-2 ${!selectedPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!selectedPhoto ? t.quality.photoEmptyPrompt : undefined}
              >
                {aiSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <span>{aiSubmitting ? t.quality.runningAssessment : t.quality.assessQualityBtn}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LOT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white rounded-[8px] shadow-2xl border border-[#D8D2C4] overflow-hidden my-8">
            <div className="px-6 py-5 bg-[#1B4332] text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  {lot.lotCode}
                </span>
                <h2 className="text-xl font-bold mt-0.5">{t.lots.editModalTitle}</h2>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 rounded-full hover:bg-emerald-700 text-emerald-100 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {updateSuccess && (
                <div className="p-4 rounded-[8px] bg-emerald-50 border border-emerald-300 text-[#1B4332] flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                  <span className="text-sm font-semibold">{updateSuccess}</span>
                </div>
              )}

              {updateErrors.general && (
                <div className="p-4 rounded-[8px] bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-sm font-semibold">{updateErrors.general}</span>
                </div>
              )}

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#262320]">{t.lots.status}</label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'CANCELLED',
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm bg-white"
                >
                  <option value="AVAILABLE">{t.lots.filterAvailable}</option>
                  <option value="DRAFT">{t.lots.filterDraft}</option>
                  <option value="RESERVED">{t.lots.filterReserved}</option>
                  <option value="SOLD">{t.lots.filterSold}</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-[#262320]">{t.lots.quantityLabel}</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={editFormData.quantity}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, quantity: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                  />
                  {updateErrors.quantity && (
                    <p className="text-xs text-rose-600">{updateErrors.quantity}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800">{t.lots.unitLabel}</label>
                  <select
                    value={editFormData.unit}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        unit: e.target.value as 'Quintal' | 'Tonnes' | 'Kg',
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm bg-white"
                  >
                    <option value="Quintal">Quintals</option>
                    <option value="Tonnes">Tonnes</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>

              {/* Price & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#262320]">{t.lots.expectedPriceLabel}</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={editFormData.expectedPrice}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, expectedPrice: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                  />
                  {updateErrors.expectedPrice && (
                    <p className="text-xs text-rose-600">{updateErrors.expectedPrice}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800">
                    {t.lots.expectedGradeLabel}
                  </label>
                  <select
                    value={editFormData.expectedGrade}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, expectedGrade: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm bg-white"
                  >
                    <option value="Grade A">{t.lots.gradeA}</option>
                    <option value="Grade B">{t.lots.gradeB}</option>
                    <option value="Grade C">{t.lots.gradeC}</option>
                    <option value="Not Graded Yet">{t.lots.gradeNotYet}</option>
                  </select>
                </div>
              </div>

              {/* Availability Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  {t.lots.availabilityDateLabel}
                </label>
                <input
                  type="date"
                  value={editFormData.availabilityDate}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, availabilityDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm bg-white"
                />
              </div>

              {/* District & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#262320]">{t.lots.districtLabel}</label>
                  <select
                    value={editFormData.district}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, district: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm bg-white"
                  >
                    {MAHARASHTRA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#262320]">{t.lots.locationLabel}</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, location: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                  />
                  {updateErrors.location && (
                    <p className="text-xs text-rose-600">{updateErrors.location}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  {t.lots.descriptionLabel}
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                />
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-[#D8D2C4] flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
                disabled={isUpdating}
              >
                {t.lots.cancelBtn}
              </Button>

              <Button
                variant="primary"
                onClick={handleUpdateLot}
                disabled={isUpdating}
                className="gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{t.lots.updateBtn}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAKE BUYER OFFER MODAL (PROSPECTIVE BUYERS / DEMO BIDDING) */}
      {/* ========================================================================= */}
      {isMakeOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-[8px] shadow-2xl border border-[#D8D2C4] overflow-hidden my-8">
            <div className="px-6 py-5 bg-gradient-to-r from-sky-800 to-sky-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="blue" className="text-[10px] uppercase font-bold">
                    BINDING DIGITAL OFFER
                  </Badge>
                  <span className="text-xs font-mono text-sky-200">{lot.lotCode}</span>
                </div>
                <h2 className="text-xl font-bold mt-1">{t.buyerMatching.makeOfferTitle}</h2>
                <p className="text-xs text-sky-100">{t.buyerMatching.makeOfferSubtitle}</p>
              </div>
              <button
                onClick={() => setIsMakeOfferOpen(false)}
                className="p-2 rounded-full hover:bg-sky-700 text-sky-100 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {makeOfferSuccess && (
                <div className="p-4 rounded-[8px] bg-emerald-50 border border-emerald-300 text-[#1B4332] flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                  <span className="text-sm font-semibold">{makeOfferSuccess}</span>
                </div>
              )}

              {makeOfferError && (
                <div className="p-4 rounded-[8px] bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-sm font-semibold">{makeOfferError}</span>
                </div>
              )}

              {/* Demo Buyer Selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#262320]">
                  {t.buyerMatching.demoBuyerSelector}
                </label>
                <select
                  value={offerFormData.buyerKey}
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      buyerKey: e.target.value as 'ABC_FOODS' | 'NASHIK_FRESH' | 'MAHA_EXPORTS' | 'PUNE_INSTITUTIONAL',
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm bg-white"
                >
                  <option value="ABC_FOODS">ABC Foods (Pune - Food Processor)</option>
                  <option value="NASHIK_FRESH">Nashik Fresh Processors (Nashik - Wholesale & Processing)</option>
                  <option value="MAHA_EXPORTS">Maharashtra Agro Exports (Navi Mumbai - Exporter)</option>
                  <option value="PUNE_INSTITUTIONAL">Pune Institutional Foods (Pune - Institutional Buyer, Unverified)</option>
                </select>
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#262320]">
                    {t.buyerMatching.offerPriceLabel}
                  </label>
                  <input
                    type="number"
                    value={offerFormData.offeredPricePerQtl}
                    onChange={(e) =>
                      setOfferFormData({ ...offerFormData, offeredPricePerQtl: e.target.value })
                    }
                    placeholder="e.g. 2400"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                  />
                  <span className="text-[11px] text-gray-500">
                    Farmer Ask: ₹{lot.expectedPricePerQuintal}/Qtl
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#262320]">
                    {t.buyerMatching.offerQtyLabel}
                  </label>
                  <input
                    type="number"
                    value={offerFormData.quantityQuintals}
                    onChange={(e) =>
                      setOfferFormData({ ...offerFormData, quantityQuintals: e.target.value })
                    }
                    placeholder="e.g. 100"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                  />
                  <span className="text-[11px] text-gray-500">
                    Available: {lot.quantityQuintals} Quintals
                  </span>
                </div>
              </div>

              {/* Total Calculation Card */}
              {parseFloat(offerFormData.offeredPricePerQtl) > 0 &&
                parseFloat(offerFormData.quantityQuintals) > 0 && (
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between text-xs">
                    <span className="font-medium text-sky-800 uppercase tracking-wider text-[11px]">
                      {t.buyerMatching.totalOfferValue}
                    </span>
                    <strong className="text-base font-black text-sky-950">
                      ₹
                      {(
                        parseFloat(offerFormData.offeredPricePerQtl) *
                        parseFloat(offerFormData.quantityQuintals)
                      ).toLocaleString('en-IN')}
                    </strong>
                  </div>
                )}

              {/* Delivery Terms */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#262320]">
                  {t.buyerMatching.deliveryTermsLabel}
                </label>
                <input
                  type="text"
                  value={offerFormData.deliveryTerms}
                  onChange={(e) =>
                    setOfferFormData({ ...offerFormData, deliveryTerms: e.target.value })
                  }
                  placeholder={t.buyerMatching.deliveryTermsPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                />
              </div>

              {/* Payment Terms */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#262320]">
                  {t.buyerMatching.paymentTermsLabel}
                </label>
                <input
                  type="text"
                  value={offerFormData.paymentTerms}
                  onChange={(e) =>
                    setOfferFormData({ ...offerFormData, paymentTerms: e.target.value })
                  }
                  placeholder={t.buyerMatching.paymentTermsPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                />
              </div>

              {/* Pickup Date & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#262320]">Proposed Pickup Date</label>
                  <input
                    type="date"
                    value={offerFormData.proposedPickupDate}
                    onChange={(e) =>
                      setOfferFormData({ ...offerFormData, proposedPickupDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#262320]">Validity (Days)</label>
                  <select
                    value={offerFormData.validityDays}
                    onChange={(e) =>
                      setOfferFormData({ ...offerFormData, validityDays: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm bg-white"
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
                <label className="text-sm font-bold text-[#262320]">
                  {t.buyerMatching.offerNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={offerFormData.notes}
                  onChange={(e) =>
                    setOfferFormData({ ...offerFormData, notes: e.target.value })
                  }
                  placeholder={t.buyerMatching.offerNotesPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C4] text-sm"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                <span className="font-semibold block">{t.buyerMatching.offerPendingNotice}</span>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-[#D8D2C4] flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsMakeOfferOpen(false)}
                disabled={makeOfferSubmitting}
              >
                {t.lots.cancelBtn}
              </Button>

              <Button
                variant="primary"
                onClick={handleCreateOffer}
                disabled={makeOfferSubmitting}
                className="gap-2 bg-sky-700 hover:bg-sky-800 text-white"
              >
                {makeOfferSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {makeOfferSubmitting
                    ? t.buyerMatching.submittingOffer
                    : t.buyerMatching.submitOfferBtn}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOOK TRANSPORT DISPATCH MODAL */}
      {/* ========================================================================= */}
      {isBookingModalOpen && selectedOptionForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-[#D8D2C4] overflow-hidden my-8">
            <div className="px-6 py-5 bg-[#1B4332] text-[#FDFBF7] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    TRANSPORT DISPATCH
                  </span>
                  <span className="text-xs font-mono text-[#E8E4D9]">{lot.lotCode}</span>
                </div>
                <h2 className="text-xl font-bold mt-1 font-heading">{t.transport.bookingModalTitle}</h2>
                <p className="text-xs text-[#E8E4D9]">{t.transport.bookingModalSubtitle}</p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#FDFBF7]/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              {/* Selected Carrier & Vehicle Summary */}
              <div className="p-4 rounded-lg bg-[#F4F1EA] border border-[#D8D2C4] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#262320] text-sm font-heading">
                    {selectedOptionForBooking.transporterName}
                  </span>
                  <Badge variant="gray" className="border border-[#D8D2C4]">
                    {selectedOptionForBooking.vehicleName}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#5A5243] text-[11px] pt-1 border-t border-[#D8D2C4]/60">
                  <div>
                    <span className="text-[#8C827A] block">Registration:</span>
                    <span className="font-mono font-bold text-[#262320]">{selectedOptionForBooking.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#8C827A] block">Corridor:</span>
                    <span className="font-bold text-[#262320]">{selectedOptionForBooking.pickupLocation} → {selectedOptionForBooking.dropLocation}</span>
                  </div>
                  <div>
                    <span className="text-[#8C827A] block">Trips & Distance:</span>
                    <span className="font-bold text-[#262320]">{selectedOptionForBooking.tripsRequired} trip(s) • {selectedOptionForBooking.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[#8C827A] block">Estimated Freight:</span>
                    <span className="font-black text-[#1B4332] text-sm font-heading">{formatINR(selectedOptionForBooking.estimatedCost)}</span>
                  </div>
                </div>
              </div>

              {/* Scheduled Pickup Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#262320] flex items-center gap-1.5 font-heading">
                  <Calendar className="w-4 h-4 text-[#1B4332]" />
                  <span>{t.transport.scheduledDateLabel}</span>
                </label>
                <input
                  type="date"
                  required
                  value={bookingScheduledDate}
                  onChange={(e) => setBookingScheduledDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#D8D2C4] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white text-[#262320]"
                />
              </div>

              {/* Special Handling / Landmark Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#262320] flex items-center gap-1.5 font-heading">
                  <FileText className="w-4 h-4 text-[#1B4332]" />
                  <span>{t.transport.transportNotesLabel}</span>
                </label>
                <textarea
                  rows={3}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder={t.transport.transportNotesPlaceholder}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#D8D2C4] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white text-[#262320]"
                />
              </div>

              {/* Demo Notice */}
              <p className="text-[11px] text-[#5A5243] bg-[#FDFBF7] p-2.5 rounded-lg border border-[#D8D2C4]">
                {t.transport.demoNotice}
              </p>

              {/* Error Alert */}
              {bookingErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{bookingErrorMsg}</span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsBookingModalOpen(false)}
                  disabled={bookingSubmitting}
                  className="min-h-[44px]"
                >
                  {t.lots.cancelBtn}
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={bookingSubmitting}
                  className="gap-2 bg-[#1B4332] hover:bg-[#1B4332]/90 text-white min-h-[44px]"
                >
                  {bookingSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  <span>{t.transport.confirmBookingBtn}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default function LotDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
        </div>
      }
    >
      <LotDetailPageContent />
    </Suspense>
  );
}
