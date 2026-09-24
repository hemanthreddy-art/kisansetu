'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import { ProduceLot } from '@/types';
import {
  MapPin,
  CheckCircle2,
  Truck,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  ArrowRight,
  Warehouse,
  AlertTriangle,
  Trash2,
  Loader2,
} from 'lucide-react';
import { SellingWindowCard } from '@/components/farmer/SellingWindowCard';
import { FarmerDisputeModal } from '@/components/disputes/FarmerDisputeModal';

export type LifecycleStage =
  | 'AVAILABLE'
  | 'SOLD_PENDING_HANDOVER'
  | 'HANDED_OVER'
  | 'PAYMENT_PROCESSING'
  | 'COMPLETED';

interface FarmerLotCardProps {
  lot: ProduceLot;
  onRefresh?: () => void;
  mockStageOverride?: LifecycleStage;
  onViewOffers?: (lot: ProduceLot) => void;
  onReportDispute?: (lot: ProduceLot) => void;
}

export function FarmerLotCard({
  lot,
  onRefresh,
  mockStageOverride,
  onViewOffers,
  onReportDispute,
}: FarmerLotCardProps) {
  const { t } = useLanguage();
  const [showTransportPicker, setShowTransportPicker] = useState(false);
  const [selectedTransportMode, setSelectedTransportMode] = useState<
    'KISANSETU' | 'SELF' | null
  >(() => {
    if (
      String(lot.status) === 'TRANSPORT_SELECTED' ||
      (lot.transportRequests && lot.transportRequests.length > 0)
    ) {
      return 'KISANSETU';
    }
    return null;
  });
  const [selectedTransporterId, setSelectedTransporterId] = useState<string | null>(
    'sahyadri'
  );
  const [isHandedOver, setIsHandedOver] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteLot = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await fetch(`/api/lots/${lot.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeleteError(data.error || 'Cannot remove while transaction is active');
        return;
      }
      setShowDeleteConfirm(false);
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove produce lot';
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine Lifecycle Stage
  // Available -> Sold/Handover Pending -> Handed Over -> Payment Processing -> Completed -> History
  let currentStage: LifecycleStage = 'AVAILABLE';

  const statusStr = String(lot.status);
  if (mockStageOverride) {
    currentStage = mockStageOverride;
  } else if (statusStr === 'COMPLETED' || statusStr === 'SETTLED') {
    currentStage = 'COMPLETED';
  } else if (statusStr === 'PAYMENT_PROCESSING' || statusStr === 'QUALITY_CONFIRMED') {
    currentStage = 'PAYMENT_PROCESSING';
  } else if (statusStr === 'HANDED_OVER' || statusStr === 'IN_TRANSIT' || isHandedOver) {
    currentStage = 'HANDED_OVER';
  } else if (
    statusStr === 'RESERVED' ||
    statusStr === 'SOLD' ||
    statusStr === 'SOLD_PENDING_HANDOVER' ||
    statusStr === 'TRANSPORT_SELECTED'
  ) {
    currentStage = 'SOLD_PENDING_HANDOVER';
  } else {
    currentStage = 'AVAILABLE';
  }

  // Pre-calculated transport options (respecting rule #3: Proximity vs Delivery Route Distance)
  const pickupDistrict = lot.locationDistrict || 'Nashik';
  const dropDistrict = 'Pune'; // Major APMC Corridor Hub
  const routeDeliveryDistanceKm = 195; // Delivery corridor distance (used for freight calculation)

  const transporters = [
    {
      id: 'sahyadri',
      name: 'Sahyadri Agri Logistics',
      proximityToFarmKm: 4.2, // Proximity to farmer (shown for transporter selection)
      vehicleType: '6 Tonnes Eicher Truck',
      capacityTonnes: 6,
      capacityQuintals: 60,
      ratePerKm: 28,
      verified: true,
      rating: 4.8,
    },
    {
      id: 'mahakisan',
      name: 'MahaKisan Freight Lines',
      proximityToFarmKm: 8.5, // Proximity to farmer (shown for transporter selection)
      vehicleType: '2.5 Tonnes Tata 407',
      capacityTonnes: 2.5,
      capacityQuintals: 25,
      ratePerKm: 22,
      verified: true,
      rating: 4.6,
    },
  ];

  // Freight calculation formula: Trips = ceil(Qty / Cap) * Route Distance * Rate/km
  const calculateFreight = (capQtl: number, rateKm: number) => {
    const qty = lot.quantityQuintals || lot.quantity || 80;
    const trips = Math.ceil(qty / capQtl);
    return trips * routeDeliveryDistanceKm * rateKm;
  };

  const stagesList = [
    { key: 'AVAILABLE', label: t.farmer.stageAvailable },
    { key: 'SOLD_PENDING_HANDOVER', label: t.farmer.stageSold },
    { key: 'HANDED_OVER', label: t.farmer.stageHandedOver },
    { key: 'PAYMENT_PROCESSING', label: t.farmer.stagePaymentProcessing },
    { key: 'COMPLETED', label: t.farmer.stageCompleted },
  ];

  const currentStageIndex = stagesList.findIndex((s) => s.key === currentStage);

  const pricePerQtl = lot.expectedPricePerQuintal || lot.expectedPrice || 2350;
  const qtyQtl = lot.quantityQuintals || lot.quantity || 80;
  const grossValue = Math.round(qtyQtl * pricePerQtl);

  // Extract first image if available (checking lotPhotosJson first, then images)
  let firstImage: string | null = null;
  if (lot.lotPhotosJson) {
    try {
      const parsed = JSON.parse(lot.lotPhotosJson);
      if (Array.isArray(parsed) && parsed.length > 0) firstImage = parsed[0];
      else if (typeof parsed === 'string' && parsed.length > 10) firstImage = parsed;
    } catch {
      if (typeof lot.lotPhotosJson === 'string' && lot.lotPhotosJson.length > 10) {
        firstImage = lot.lotPhotosJson;
      }
    }
  }
  if (!firstImage && lot.images) {
    try {
      const parsed = JSON.parse(lot.images);
      if (Array.isArray(parsed) && parsed.length > 0) firstImage = parsed[0];
    } catch {
      if (typeof lot.images === 'string' && lot.images.startsWith('http')) {
        firstImage = lot.images;
      }
    }
  }

  const handleConfirmSelfTransport = () => {
    setSelectedTransportMode('SELF');
    setShowTransportPicker(false);
  };

  const handleConfirmKisanSetuTransport = (tId: string) => {
    setSelectedTransporterId(tId);
    setSelectedTransportMode('KISANSETU');
    setShowTransportPicker(false);
  };

  const handleMarkHandedOver = () => {
    setIsHandedOver(true);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="bg-white border border-[#D8D2C4] rounded-[10px] p-5 space-y-4 hover:border-[#1B4332]/60 transition-all shadow-sm">
      {/* 1. Lot Top Bar: Lot Code, Location, & Stage Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D8D2C4]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-[#1B4332] bg-[#EAF2ED] px-2.5 py-0.5 rounded border border-[#B7D5C4]">
            {lot.lotCode || 'KS-LOT-ACTIVE'}
          </span>
          <span className="text-xs text-[#635E59] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{lot.location || lot.locationDistrict || 'Niphad, Nashik'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentStage === 'AVAILABLE' && (
            <Badge variant="emerald" className="font-bold text-xs">
              {t.farmer.stageAvailable}
            </Badge>
          )}
          {currentStage === 'SOLD_PENDING_HANDOVER' && (
            <Badge variant="amber" className="font-bold text-xs bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]">
              {t.farmer.stageSold}
            </Badge>
          )}
          {currentStage === 'HANDED_OVER' && (
            <Badge variant="blue" className="font-bold text-xs">
              {t.farmer.stageHandedOver}
            </Badge>
          )}
          {currentStage === 'PAYMENT_PROCESSING' && (
            <Badge variant="amber" className="font-bold text-xs">
              {t.farmer.stagePaymentProcessing}
            </Badge>
          )}
          {currentStage === 'COMPLETED' && (
            <Badge variant="emerald" className="font-bold text-xs">
              {t.farmer.stageCompleted}
            </Badge>
          )}

          <span className="text-[10px] font-semibold text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
            {lot.expectedGrade || 'Grade A'} ({t.farmer.aiScreeningNotice ? 'AI Screened' : 'Preliminary'})
          </span>

          {(lot.location?.includes('MSWC') || lot.description?.includes('MSWC') || lot.description?.includes('WDRA')) && (
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
              <Warehouse className="w-3 h-3 text-emerald-700" />
              <span>WDRA Stored</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Main Produce Info Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {firstImage ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[8px] overflow-hidden border border-[#D8D2C4] shrink-0 bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={firstImage} alt={lot.commodity} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[8px] border border-[#D8D2C4] bg-[#F4F1EA] flex items-center justify-center shrink-0">
            <Package className="w-8 h-8 text-[#1B4332] opacity-70" />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-xl font-bold font-heading text-[#262320]">
            {lot.commodity} {lot.variety && <span className="font-normal text-sm text-[#635E59]">({lot.variety})</span>}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#635E59]">
            <span>
              <strong>{qtyQtl} {t.common.quintals}</strong>
            </span>
            <span>•</span>
            <span>
              {t.common.targetPrice}: <strong className="text-[#1B4332]">₹{pricePerQtl} {t.common.perQuintal}</strong>
            </span>
            <span>•</span>
            <span>
              Est. Value: <strong>{formatINR(grossValue)}</strong>
            </span>
          </div>
        </div>

        {/* Action button trigger */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {onViewOffers && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewOffers(lot)}
              className="border-[#52B788] text-[#1B4332] bg-[#EAF2ED] hover:bg-[#D8EADF] text-xs font-semibold"
            >
              <Users className="w-3.5 h-3.5 mr-1" />
              Offers
            </Button>
          )}
          <Link href={`/lots/${lot.lotCode || lot.id}`}>
            <Button size="sm" variant="outline" className="border-[#D8D2C4] text-[#262320] text-xs">
              {t.common.viewDetails}
            </Button>
          </Link>
          {currentStage === 'AVAILABLE' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDeleteError(null);
                setShowDeleteConfirm(true);
              }}
              className="border-red-200 text-red-700 hover:bg-red-50 text-xs"
              title="Remove produce lot listing"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Remove
            </Button>
          )}
          {currentStage !== 'AVAILABLE' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReportDispute ? onReportDispute(lot) : setIsDisputeOpen(true)}
              className="text-xs border-amber-300 text-amber-900 hover:bg-amber-50 gap-1 font-semibold"
              title={t.disputes?.reportIssueBtn || 'Report Issue'}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.disputes?.reportIssueBtn || 'Report Issue'}</span>
            </Button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 border border-[#D8D2C4] rounded hover:bg-stone-50 text-[#635E59]"
            title="Expand lifecycle controls"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2.5 Actionable Sale-Window Advisory (SIH PS 26132) */}
      <div className="pt-1">
        <SellingWindowCard
          commodity={lot.commodity}
          expectedPricePerQuintal={pricePerQtl}
          quantityQuintals={qtyQtl}
          compact={true}
        />
      </div>

      {/* 3. Five-Stage Visual Progress Stepper */}
      <div className="pt-2 pb-1">
        <div className="grid grid-cols-5 gap-1 text-center">
          {stagesList.map((st, idx) => {
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div key={st.key} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-[#1B4332]'
                      : isDone
                      ? 'bg-[#2D6A4F]'
                      : 'bg-[#ECE7DE]'
                  }`}
                />
                <span
                  className={`text-[10px] block truncate px-0.5 ${
                    isCurrent
                      ? 'font-bold text-[#1B4332]'
                      : isDone
                      ? 'font-medium text-[#2D6A4F]'
                      : 'text-[#635E59]'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Context / Expandable Lifecycle Drawer */}
      {(expanded || currentStage !== 'AVAILABLE') && (
        <div className="pt-3 border-t border-[#D8D2C4] space-y-3 bg-[#FAF8F5] -mx-5 -mb-5 p-5 rounded-b-[10px]">
          {/* AVAILABLE STAGE CONTEXT */}
          {currentStage === 'AVAILABLE' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#635E59]">
                <Users className="w-4 h-4 text-[#1B4332]" />
                <span>Active in Mandi network. Buyers matching your variety can submit offers.</span>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onViewOffers?.(lot)}
                className="bg-[#1B4332] text-white gap-1 text-xs"
              >
                <span>{t.farmer.viewBuyerOffers}</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* SOLD — HANDOVER PENDING STAGE */}
          {currentStage === 'SOLD_PENDING_HANDOVER' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FEF3C7]/60 border border-[#FDE68A] rounded-[6px] text-[#92400E] flex items-center justify-between">
                <div>
                  <strong className="block text-sm font-bold">Offer Accepted • Escrow Locked</strong>
                  <span>Buyer: ABC Foods Pvt Ltd (Agreed: ₹2,420/qtl • ₹1,93,600)</span>
                </div>
                <Badge variant="emerald">₹1,93,600 Locked</Badge>
              </div>

              {/* Choose Transporter vs Own Transport */}
              <div className="space-y-2">
                <span className="font-bold text-[#262320] block">
                  {t.farmer.transportArrangement || 'Transport Arrangement'}
                </span>

                {selectedTransportMode === null && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => setShowTransportPicker(true)}
                      className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-1.5 text-xs font-semibold"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{t.farmer.chooseTransporterBtn}</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleConfirmSelfTransport}
                      className="border-[#D8D2C4] text-[#262320] text-xs"
                    >
                      <span>{t.farmer.ownTransportBtn}</span>
                    </Button>
                  </div>
                )}

                {selectedTransportMode === 'SELF' && (
                  <div className="p-2.5 bg-white border border-[#D8D2C4] rounded-[6px] flex items-center justify-between">
                    <div>
                      <strong className="text-[#1B4332] block">{t.farmer.selfTransport || 'Self-Arranged Transport'}</strong>
                      <span className="text-[11px] text-[#635E59]">
                        Delivering directly to Pune APMC Gate. Freight deduction: ₹0.
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTransportMode(null)}
                      className="text-[10px] h-7 border-[#D8D2C4]"
                    >
                      {t.farmer.changeBtn || 'Change'}
                    </Button>
                  </div>
                )}

                {selectedTransportMode === 'KISANSETU' && (
                  <div className="p-2.5 bg-white border border-[#B7D5C4] rounded-[6px] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[#1B4332] font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {transporters.find((t) => t.id === selectedTransporterId)?.name ||
                            'Sahyadri Agri Logistics'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#635E59]">
                        Distance to farm: 4.2 km • Route: 195 km to Pune APMC • Freight: ₹1,200
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTransportMode(null)}
                      className="text-[10px] h-7 border-[#D8D2C4]"
                    >
                      {t.farmer.changeBtn || 'Change'}
                    </Button>
                  </div>
                )}

                {/* Transporter Selection Modal/Drawer */}
                {showTransportPicker && (
                  <div className="p-3.5 bg-white border border-[#1B4332]/30 rounded-[8px] space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-[#D8D2C4]">
                      <span className="font-bold text-[#1B4332]">
                        {t.farmer.availTransporters || 'Available Verified Transporters'}
                      </span>
                      <span className="text-[11px] text-[#635E59]">
                        Route corridor: {pickupDistrict} → {dropDistrict} ({routeDeliveryDistanceKm} km)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {transporters.map((tr) => {
                        const qty = lot.quantityQuintals || lot.quantity || 80;
                        const tripsNeeded = Math.ceil(qty / tr.capacityQuintals);
                        const estimatedCost = calculateFreight(tr.capacityQuintals, tr.ratePerKm);
                        return (
                          <div
                            key={tr.id}
                            className="p-3 rounded-[6px] border border-[#D8D2C4] hover:border-[#1B4332] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <strong className="text-[#262320]">{tr.name}</strong>
                                <span className="text-[10px] px-1.5 py-0.2 bg-[#EAF2ED] text-[#1B4332] rounded font-semibold">
                                  ★ {tr.rating}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 bg-[#FEF3C7] text-[#92400E] rounded font-semibold">
                                  {tr.proximityToFarmKm} km {t.farmer.transporterProximity}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#635E59] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span>{tr.vehicleType}</span>
                                <span>•</span>
                                <span>Cap: <strong>{tr.capacityQuintals} Qtl</strong> ({tr.capacityTonnes} Tonnes)</span>
                                <span>•</span>
                                <span>Rate: <strong>₹{tr.ratePerKm}/km</strong></span>
                                <span>•</span>
                                <span>Trips: <strong>{tripsNeeded}</strong> ({tripsNeeded} × {routeDeliveryDistanceKm} km × ₹{tr.ratePerKm})</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-right shrink-0">
                              <div>
                                <span className="text-[10px] text-[#635E59] block">{t.farmer.freightEstimate}</span>
                                <strong className="text-sm text-[#1B4332]">{formatINR(estimatedCost)}</strong>
                              </div>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleConfirmKisanSetuTransport(tr.id)}
                                className="bg-[#1B4332] text-white text-xs"
                              >
                                Select
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Handover Button */}
              <div className="pt-2 flex items-center justify-between border-t border-[#D8D2C4]">
                <span className="text-[#635E59]">
                  Once loaded into truck or dropped at aggregation hub, confirm dispatch:
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleMarkHandedOver}
                  className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white gap-1 text-xs font-bold shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.farmer.stageHandedOver}</span>
                </Button>
              </div>
            </div>
          )}

          {/* HANDED OVER STAGE */}
          {currentStage === 'HANDED_OVER' && (
            <div className="p-3 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[6px] text-xs text-[#1B4332] space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>Produce in Transit to Buyer Terminal (Pune APMC)</span>
                </span>
                <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#B7D5C4]">
                  Gate Pass #GP-2026-9921
                </span>
              </div>
              <p className="text-[11px] text-[#2D6A4F]">
                Estimated delivery in 4.5 hours. Quality confirmation by buyer will trigger automated payout.
              </p>
            </div>
          )}

          {/* PAYMENT PROCESSING STAGE */}
          {currentStage === 'PAYMENT_PROCESSING' && (
            <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-[6px] text-xs text-[#92400E] space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Quality Confirmed • Releasing Escrow Funds</span>
                </span>
                <span>Net ₹1,91,200</span>
              </div>
              <p className="text-[11px]">
                Physical inspection passed Grade A. Funds are transferring to your registered bank account / UPI.
              </p>
            </div>
          )}

          {/* COMPLETED STAGE */}
          {currentStage === 'COMPLETED' && (
            <div className="p-3 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[6px] text-xs text-[#1B4332] flex items-center justify-between">
              <div>
                <strong className="block font-bold">Payout Completed</strong>
                <span>₹1,91,200 transferred to Bank Account. Archived in History.</span>
              </div>
              <Badge variant="emerald">Settled</Badge>
            </div>
          )}
        </div>
      )}

      {/* Embedded Dispute Modal */}
      {isDisputeOpen && (
        <FarmerDisputeModal
          isOpen={isDisputeOpen}
          onClose={() => setIsDisputeOpen(false)}
          initialLotId={lot.id}
          onDisputeSubmitted={() => {
            setIsDisputeOpen(false);
            onRefresh?.();
          }}
        />
      )}

      {/* Confirmation Modal for Listing Removal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] border border-[#D8D2C4] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#262320]">Confirm Produce Lot Removal</h3>
                <p className="text-xs text-[#635E59]">Action requires explicit confirmation</p>
              </div>
            </div>

            <p className="text-xs text-[#262320] leading-relaxed">
              Are you sure you want to remove produce lot <strong className="font-mono">{lot.lotCode || lot.id}</strong> ({lot.commodity} - {qtyQtl} Qtl)? This will remove your listing from the active marketplace.
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[6px] text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D8D2C4]">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                className="text-xs border-[#D8D2C4] text-[#262320]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteLot}
                className="text-xs bg-red-600 hover:bg-red-700 text-white gap-1"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
