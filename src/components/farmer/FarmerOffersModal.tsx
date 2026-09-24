'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { X, CheckCircle2, XCircle, ShieldCheck, AlertCircle, RefreshCw, Store, MapPin, Truck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { calculateNetRealisation, formatINR } from '@/lib/utils';

interface OfferItem {
  id: string;
  lotId: string;
  lotCode: string;
  commodity: string;
  variety?: string | null;
  lotGrade?: string;
  lotDistrict?: string;
  buyerCompanyName: string;
  buyerName: string;
  buyerType: string;
  buyerLocation?: string;
  isBuyerVerified: boolean;
  reputation?: { rating: number; reviewCount: number };
  offeredPricePerQtl: number;
  quantityQuintals: number;
  totalOfferValue: number;
  proposedPickupDate?: string | null;
  paymentTerms?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
}

interface FarmerOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotId?: string;
  onOfferUpdated?: () => void;
}

export function FarmerOffersModal({
  isOpen,
  onClose,
  lotId,
  onOfferUpdated,
}: FarmerOffersModalProps) {
  const { t } = useLanguage();
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = lotId
        ? `/api/offers?lotId=${encodeURIComponent(lotId)}`
        : `/api/offers?role=FARMER`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.offers)) {
        setOffers(data.offers);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error('Failed to load offers:', err);
      setError('Unable to load offers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [lotId]);

  useEffect(() => {
    if (isOpen) {
      fetchOffers();
      setActionSuccess(null);
    }
  }, [isOpen, fetchOffers]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (offerId: string, targetStatus: 'ACCEPTED' | 'REJECTED') => {
    try {
      setActionInProgress(offerId);
      setError(null);
      setActionSuccess(null);

      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          role: 'FARMER',
          notes: targetStatus === 'ACCEPTED' ? 'Accepted by farmer via marketplace' : 'Declined by farmer',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to ${targetStatus.toLowerCase()} offer.`);
      }

      setActionSuccess(
        targetStatus === 'ACCEPTED'
          ? 'Offer Accepted! 100% Escrow security locked in ICICI Bank nodal account. Next Step: Arrange transport or dispatch produce from your farm gate.'
          : 'Offer declined.'
      );

      // Refresh list
      await fetchOffers();
      if (onOfferUpdated) onOfferUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setError(msg);
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingOffers = offers.filter((o) => o.status === 'PENDING');
  const otherOffers = offers.filter((o) => o.status !== 'PENDING');

  // Identify the pending offer with the highest net realisation
  const bestPendingOfferId =
    pendingOffers.length > 1
      ? pendingOffers.reduce((best, cur) => {
          const curDist = cur.buyerLocation?.includes('Pune') ? 210 : cur.buyerLocation?.includes('Mumbai') ? 180 : 45;
          const bestDist = best.buyerLocation?.includes('Pune') ? 210 : best.buyerLocation?.includes('Mumbai') ? 180 : 45;
          const curNet = calculateNetRealisation({ pricePerQuintal: cur.offeredPricePerQtl, quantityQuintals: cur.quantityQuintals, distanceKm: curDist }).netRealisationPerQuintal;
          const bestNet = calculateNetRealisation({ pricePerQuintal: best.offeredPricePerQtl, quantityQuintals: best.quantityQuintals, distanceKm: bestDist }).netRealisationPerQuintal;
          return curNet > bestNet ? cur : best;
        }, pendingOffers[0])?.id
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] rounded-[10px] shadow-2xl border border-[#D8D2C4] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#1B4332] text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold font-serif flex items-center gap-2">
              <span>{t.farmer.viewOffers || 'Buyer Offers & Bids'}</span>
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-[#2D6A4F] text-[#D8D2C4] border border-[#52B788]/30">
                {offers.length} {offers.length === 1 ? 'Offer' : 'Offers'}
              </span>
            </h2>
            <p className="text-xs text-[#B7D5C4] mt-0.5">
              Review direct purchase bids from verified buyers with escrow guarantee.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#B7D5C4] hover:text-white hover:bg-[#2D6A4F] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {actionSuccess && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="px-5 py-2.5 bg-red-50 border-b border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-[#635E59] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1B4332]" />
              <p className="text-xs">Fetching latest buyer offers...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Store className="w-12 h-12 text-[#635E59]/40 mx-auto" />
              <h3 className="text-sm font-bold text-[#262320]">No Buyer Offers Yet</h3>
              <p className="text-xs text-[#635E59] max-w-md mx-auto">
                Buyers browse your active lots and submit binding purchase offers with escrow protection.
                You can also browse active Buyer Procurement Demands and respond directly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="mt-2 text-xs text-[#1B4332] border-[#1B4332]"
              >
                Browse Buyer Demands
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* PENDING OFFERS FIRST */}
              {pendingOffers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#92400E]">
                      Pending Decision ({pendingOffers.length})
                    </span>
                    <span className="text-[11px] text-[#635E59]">Action required</span>
                  </div>

                  {pendingOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      isProcessing={actionInProgress === offer.id}
                      isBestNetOffer={offer.id === bestPendingOfferId}
                      onAccept={() => handleUpdateStatus(offer.id, 'ACCEPTED')}
                      onReject={() => handleUpdateStatus(offer.id, 'REJECTED')}
                    />
                  ))}
                </div>
              )}

              {/* PAST / DECIDED OFFERS */}
              {otherOffers.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[#D8D2C4]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#635E59]">
                    History ({otherOffers.length})
                  </span>

                  {otherOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      isProcessing={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#F4F1EA] border-t border-[#D8D2C4] flex items-center justify-between shrink-0 text-xs text-[#635E59]">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
            <span>All accepted offers automatically trigger 100% Escrow deposit into ICICI Bank nodal account.</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-8">
            {t.common.close || 'Close'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OfferCard({
  offer,
  isProcessing,
  isBestNetOffer,
  onAccept,
  onReject,
}: {
  offer: OfferItem;
  isProcessing: boolean;
  isBestNetOffer?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const { t } = useLanguage();
  const isPending = offer.status === 'PENDING';
  const isAccepted = offer.status === 'ACCEPTED';

  // Interactive Self Transport Toggle (₹0 freight deduction)
  const [selfTransport, setSelfTransport] = useState(false);

  // Corridor distance based on buyer location
  const distanceKm = offer.buyerLocation?.includes('Pune') ? 210 : offer.buyerLocation?.includes('Mumbai') ? 180 : 45;

  const calc = calculateNetRealisation({
    pricePerQuintal: offer.offeredPricePerQtl,
    quantityQuintals: offer.quantityQuintals,
    distanceKm: selfTransport ? 0 : distanceKm,
  });

  const grossAmount = calc.grossSaleValue;
  const transportCost = selfTransport ? 0 : calc.transportCost;
  const otherDeductions = calc.otherCosts;
  const netPayout = grossAmount - transportCost - otherDeductions;
  const netPayoutPerQtl = offer.quantityQuintals > 0 ? Math.round(netPayout / offer.quantityQuintals) : 0;

  return (
    <div
      className={`rounded-[8px] border p-4 transition-all ${
        isPending
          ? 'bg-white border-[#B7D5C4] shadow-sm hover:border-[#1B4332]'
          : isAccepted
          ? 'bg-emerald-50/50 border-emerald-300'
          : 'bg-stone-50 border-stone-200 opacity-75'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Buyer & Lot Info */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-[#262320]">
              {offer.buyerCompanyName}
            </span>
            {offer.isBuyerVerified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Verified Buyer
              </span>
            )}
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#ECE7DE] text-[#635E59]">
              {offer.buyerType}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isPending
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : isAccepted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {offer.status}
            </span>
            {isBestNetOffer && isPending && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>★ {t.farmer.bestNetRealisation}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#635E59] flex-wrap">
            <span>
              Lot: <strong className="font-mono text-[#262320]">{offer.lotCode}</strong> ({offer.commodity} {offer.variety ? `• ${offer.variety}` : ''})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#1B4332] shrink-0" />
              <strong>{offer.buyerLocation || 'Pune APMC, Maharashtra'}</strong>
            </span>
            <span>
              Quality: <strong className="text-[#1B4332]">{offer.lotGrade || 'Grade A'}</strong>
            </span>
            {offer.proposedPickupDate && (
              <span>
                Pickup: <strong className="text-[#262320]">{offer.proposedPickupDate}</strong>
              </span>
            )}
          </div>

          {offer.notes && (
            <p className="text-xs text-[#635E59] italic bg-[#F4F1EA] p-2 rounded border border-[#D8D2C4]/60">
              &ldquo;{offer.notes}&rdquo;
            </p>
          )}
        </div>

        {/* HERO: "AMOUNT YOU RECEIVE" (NET REALISATION) CARD */}
        <div className="bg-[#EAF2ED] border border-[#52B788] rounded-[8px] p-3 text-right sm:min-w-[210px] shadow-xs shrink-0">
          <div className="text-[10px] font-bold text-[#1B4332] uppercase tracking-wider flex items-center justify-end gap-1">
            <span>💰 {t.farmer.amountYouReceive} (Net Realisation):</span>
          </div>
          <div className="text-xl font-heading font-black text-[#1B4332] mt-0.5">
            {formatINR(netPayout)}
          </div>
          <div className="text-xs font-semibold text-[#2D6A4F]">
            ₹{netPayoutPerQtl.toLocaleString('en-IN')} / {t.common.unitQuintal || 'Qtl'}
          </div>
          <div className="text-[10px] text-[#635E59] mt-1 border-t border-[#B7D5C4]/60 pt-1">
            Gross: {formatINR(grossAmount)} • {offer.quantityQuintals} Qtl
          </div>
        </div>
      </div>

      {/* Transparent Financial Deductions Ledger */}
      <div className="mt-3 p-3 bg-[#F4F1EA] rounded-[6px] border border-[#D8D2C4] text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-[#262320]">
            Net Realisation: {t.farmer.netRealisationEst || 'Breakdown'}
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-[#1B4332] bg-white px-2 py-0.5 rounded border border-[#D8D2C4]">
            <input
              type="checkbox"
              checked={selfTransport}
              onChange={(e) => setSelfTransport(e.target.checked)}
              className="rounded text-[#1B4332] focus:ring-[#1B4332]"
            />
            <span>{t.farmer.ownTransportOption}</span>
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-[#D8D2C4]/60">
          <div>
            <span className="text-[#635E59] block">Buyer Offer</span>
            <strong className="text-[#262320]">₹{offer.offeredPricePerQtl}/Qtl</strong>
          </div>
          <div>
            <span className="text-[#635E59] block">Transport Freight</span>
            <strong className={selfTransport ? 'text-emerald-700 font-bold' : 'text-red-700'}>
              {selfTransport ? '₹0 (Self Deliver)' : `-${formatINR(transportCost)} (~${distanceKm}km)`}
            </strong>
          </div>
          <div>
            <span className="text-[#635E59] block">Mandi Fee Saved:</span>
            <strong className="text-emerald-700 font-bold">₹0 (Direct Trade)</strong>
          </div>
          <div>
            <span className="text-[#635E59] block">Net Per Quintal</span>
            <strong className="text-[#1B4332] font-black">₹{netPayoutPerQtl}/Qtl</strong>
          </div>
        </div>
        <p className="text-[10px] text-[#635E59] italic">
          {t.farmer.estDeductionsNotice}
        </p>
      </div>

      {/* Action Buttons for Pending Offers */}
      {isPending && onAccept && onReject && (
        <div className="mt-3 pt-3 border-t border-[#D8D2C4]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-[11px] text-[#635E59]">
            <Truck className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>Buyer delivery point: <strong>{offer.buyerLocation || 'Local Hub'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              disabled={isProcessing}
              className="text-xs h-8 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Decline
            </Button>
            <Button
              size="sm"
              onClick={onAccept}
              disabled={isProcessing}
              className="text-xs h-8 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold shadow-sm"
            >
              {isProcessing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              )}
              Accept Offer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
