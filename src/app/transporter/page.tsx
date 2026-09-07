'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { ReputationCluster } from '@/components/ui/ReputationCluster';
import { formatINR } from '@/lib/utils';
import {
  Truck,
  Gauge,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Loader2,
  XCircle,
  RefreshCw,
  Info,
  Snowflake,
} from 'lucide-react';

interface TransporterVehicleItem {
  id: string;
  vehicleName?: string | null;
  vehicleType: string;
  registrationNumber: string;
  capacityTonnes: number;
  capacityQuintals?: number | null;
  ratePerKm: number;
  isRefrigerated: boolean;
  isAvailable: boolean;
}

interface TransporterProfileItem {
  id: string;
  businessName: string;
  commercialLicenseNo?: string | null;
  operationalDistricts?: string | null;
  verified: boolean;
  ratingScore: number;
  completedTripsCount: number;
  onTimeDeliveryPercent: number;
  vehicles: TransporterVehicleItem[];
}

interface TransportRequestItem {
  id: string;
  lotId: string;
  transporterId?: string | null;
  pickupLocation: string;
  dropLocation: string;
  distanceKm: number;
  quantityQuintals?: number | null;
  estimatedTrips: number;
  estimatedCost: number;
  status: string;
  scheduledPickup?: string | null;
  actualDelivery?: string | null;
  notes?: string | null;
  lot?: {
    commodity: string;
    lotCode: string;
    quantityQuintals: number;
  } | null;
  vehicle?: TransporterVehicleItem | null;
  transporter?: {
    businessName: string;
  } | null;
}

const DEMO_TRANSPORTERS_META = [
  {
    key: 'SAHYADRI_LOGISTICS',
    businessName: 'Sahyadri Agri Logistics [Demo]',
    representative: 'Sanjay Deshmukh',
    phone: '+919822330001',
    commercialLicenseNo: 'MH-TRANS-NSK-2024-101',
    operationalDistricts: 'Nashik, Pune, Mumbai, Ahmednagar, Dhule',
    verified: true,
    ratingScore: 4.8,
    completedTripsCount: 156,
    onTimeDeliveryPercent: 96.0,
  },
  {
    key: 'MAHAKISAN_FREIGHT',
    businessName: 'MahaKisan Freight Carriers [Demo]',
    representative: 'Datta Chavan',
    phone: '+919822330002',
    commercialLicenseNo: 'MH-TRANS-PUN-2023-404',
    operationalDistricts: 'Pune, Satara, Solapur, Ahmednagar, Nashik',
    verified: true,
    ratingScore: 4.7,
    completedTripsCount: 142,
    onTimeDeliveryPercent: 94.0,
  },
  {
    key: 'GODAVARI_COLDCHAIN',
    businessName: 'Godavari Cold Chain & Express [Demo]',
    representative: 'Mahesh Wagh',
    phone: '+919822330003',
    commercialLicenseNo: 'MH-TRANS-CSN-2024-770',
    operationalDistricts: 'Chhatrapati Sambhaji Nagar, Jalna, Nashik, Pune, Mumbai',
    verified: true,
    ratingScore: 4.9,
    completedTripsCount: 98,
    onTimeDeliveryPercent: 98.0,
  },
  {
    key: 'GRAMIN_VAHAN',
    businessName: 'Gramin Vahan Seva Niphad [Demo]',
    representative: 'Pravin Gaikwad',
    phone: '+919822330004',
    commercialLicenseNo: 'PENDING_VERIFICATION',
    operationalDistricts: 'Nashik, Niphad, Lasalgaon, Sinnar',
    verified: false,
    ratingScore: 4.3,
    completedTripsCount: 28,
    onTimeDeliveryPercent: 89.0,
  },
];

type ActiveTab = 'requests' | 'dispatches' | 'fleet';

function TransporterHubContent() {
  const { t } = useLanguage();

  const [activeKey, setActiveKey] = useState<string>('SAHYADRI_LOGISTICS');
  const [activeTab, setActiveTab] = useState<ActiveTab>('requests');
  const [transporters, setTransporters] = useState<TransporterProfileItem[]>([]);
  const [allRequests, setAllRequests] = useState<TransportRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionReqId, setActionReqId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Active transporter profile resolution
  const activeProfile = transporters.find(
    (tr) =>
      tr.businessName.toLowerCase().includes(activeKey.toLowerCase().replace('_', ' ')) ||
      (activeKey === 'SAHYADRI_LOGISTICS' && tr.businessName.includes('Sahyadri')) ||
      (activeKey === 'MAHAKISAN_FREIGHT' && tr.businessName.includes('MahaKisan')) ||
      (activeKey === 'GODAVARI_COLDCHAIN' && tr.businessName.includes('Godavari')) ||
      (activeKey === 'GRAMIN_VAHAN' && tr.businessName.includes('Gramin'))
  ) || transporters[0];

  const activeMeta =
    DEMO_TRANSPORTERS_META.find((m) => m.key === activeKey) || DEMO_TRANSPORTERS_META[0];

  // Fetch Transporters and Transport Requests
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resTrans, resReqs] = await Promise.all([
        fetch('/api/transporters'),
        fetch('/api/transport-requests'),
      ]);

      if (resTrans.ok) {
        const dataTrans = await resTrans.json();
        if (dataTrans.success && Array.isArray(dataTrans.transporters)) {
          setTransporters(dataTrans.transporters);
        }
      }

      if (resReqs.ok) {
        const dataReqs = await resReqs.json();
        if (dataReqs.success && Array.isArray(dataReqs.transportRequests)) {
          setAllRequests(dataReqs.transportRequests);
        }
      }
    } catch (err) {
      console.error('Error fetching transporter hub data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter requests for currently selected transporter (or unassigned requests)
  const currentTransporterRequests = allRequests.filter((req) => {
    if (!activeProfile) return true;
    return (
      req.transporterId === activeProfile.id ||
      !req.transporterId ||
      req.transporter?.businessName === activeProfile.businessName
    );
  });

  const pendingRequests = currentTransporterRequests.filter(
    (req) => req.status === 'REQUESTED'
  );

  const activeOrPastDispatches = currentTransporterRequests.filter(
    (req) => req.status !== 'REQUESTED'
  );

  // Status transition handler
  const handleUpdateStatus = async (requestId: string, nextStatus: string) => {
    try {
      setActionReqId(requestId);
      setActionError(null);
      setActionSuccess(null);

      const res = await fetch(`/api/transport-requests/${encodeURIComponent(requestId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update transport request status');
      }

      setActionSuccess(`Status updated to ${nextStatus}`);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating status';
      setActionError(msg);
    } finally {
      setActionReqId(null);
    }
  };

  return (
    <PageContainer maxWidth="7xl" className="py-6 space-y-6 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title={t.transport.hubTitle}
        description={t.transport.hubSubtitle}
        badge={
          <Badge variant="gray">
            {t.transport.roleBadge}
          </Badge>
        }
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-2 text-xs border-[#D8D2C4] text-[#1B4332] hover:bg-[#F4F1EA]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.transport.refreshNetwork}</span>
          </Button>
        }
      />

      {/* Demo Transporter Switcher */}
      <div className="bg-[#FDFBF7] border border-[#D8D2C4] rounded-lg p-4 sm:p-5 shadow-none space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-1.5 font-heading">
            <Building2 className="w-4 h-4 text-[#1B4332]" />
            <span>{t.transport.demoTransporterSelector}</span>
          </span>
          <span className="text-[11px] text-[#5A5243] font-mono bg-[#F4F1EA] px-2.5 py-0.5 rounded border border-[#D8D2C4]">
            [Prototype Demo Profiles]
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {DEMO_TRANSPORTERS_META.map((meta) => {
            const isSelected = activeKey === meta.key;
            return (
              <button
                key={meta.key}
                type="button"
                onClick={() => setActiveKey(meta.key)}
                className={`text-left p-3 rounded-lg border transition-all text-xs space-y-1 ${
                  isSelected
                    ? 'bg-[#1B4332] text-[#FDFBF7] border-[#1B4332] shadow-sm'
                    : 'bg-white text-[#262320] border-[#D8D2C4] hover:border-[#1B4332]/50 hover:bg-[#F4F1EA]/50'
                }`}
              >
                <div className="font-bold truncate font-heading">{meta.businessName}</div>
                <div className="flex items-center justify-between text-[11px] opacity-85">
                  <span>{meta.operationalDistricts.split(',')[0]}</span>
                  <span className="font-mono">★ {meta.ratingScore.toFixed(1)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Transporter Identity Card with Strict Trust Decoupling */}
      <div className="bg-white border border-[#D8D2C4] rounded-lg p-5 sm:p-6 shadow-none space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-[#262320]">
                {activeProfile?.businessName || activeMeta.businessName}
              </h2>
              <VerificationBadge
                type={activeMeta.verified ? 'identity' : 'provisional'}
                customLabel={activeMeta.verified ? t.transport.verifiedPermit : t.transport.unverifiedPermit}
              />
            </div>
            <div className="text-xs text-[#5A5243] flex items-center gap-2 flex-wrap">
              <span>Contact: <strong className="text-[#262320]">{activeMeta.representative}</strong> ({activeMeta.phone})</span>
              <span className="text-[#D8D2C4]">•</span>
              <span className="font-mono">{t.transport.rtoPermit}: <strong className="text-[#262320]">{activeMeta.commercialLicenseNo}</strong></span>
              <span className="text-[#D8D2C4]">•</span>
              <span>{t.transport.operationalDistrictsLabel}: <strong className="text-[#262320]">{activeMeta.operationalDistricts}</strong></span>
            </div>
          </div>

          {/* Reputation Metrics (Strictly Decoupled from Permit Verification) */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <ReputationCluster
              ratingScore={activeMeta.ratingScore}
              completedDealsCount={activeMeta.completedTripsCount}
              onTimeDeliveryPercent={activeMeta.onTimeDeliveryPercent}
              size="md"
            />
          </div>
        </div>

        {/* Transparent Cost Formula Banner */}
        <div className="p-3.5 rounded-lg bg-[#F4F1EA] border border-[#D8D2C4] text-xs text-[#262320] space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-[#1B4332] font-heading">
            <Gauge className="w-4 h-4 text-[#1B4332]" />
            <span>{t.transport.formulaTitle}</span>
          </div>
          <p className="font-mono text-[11px] bg-white p-2 rounded border border-[#D8D2C4] text-[#1B4332] font-bold">
            {t.transport.formulaText}
          </p>
          <p className="text-[11px] text-[#5A5243] leading-relaxed">
            {t.transport.netRealisationNote}
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#D8D2C4] pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] ${
            activeTab === 'requests'
              ? 'bg-[#1B4332] text-[#FDFBF7] shadow-sm'
              : 'text-[#5A5243] hover:text-[#262320] hover:bg-[#F4F1EA]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.transport.tabRequests} ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dispatches')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] ${
            activeTab === 'dispatches'
              ? 'bg-[#1B4332] text-[#FDFBF7] shadow-sm'
              : 'text-[#5A5243] hover:text-[#262320] hover:bg-[#F4F1EA]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{t.transport.tabDispatches} ({activeOrPastDispatches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px] ${
            activeTab === 'fleet'
              ? 'bg-[#1B4332] text-[#FDFBF7] shadow-sm'
              : 'text-[#5A5243] hover:text-[#262320] hover:bg-[#F4F1EA]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t.transport.tabFleet} ({activeProfile?.vehicles?.length || 0})</span>
        </button>
      </div>

      {/* Action Notification Banners */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-[#B7D5C4] text-[#1B4332] rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: INCOMING REQUESTS */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-[#262320]">
                {t.transport.incomingRequestsTitle}
              </h3>
              <p className="text-xs text-[#5A5243]">
                {t.transport.incomingRequestsSubtitle}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#1B4332] bg-[#F4F1EA] px-3 py-1 rounded border border-[#D8D2C4]">
              {pendingRequests.length} Pending
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <Card className="border-dashed border-[#D8D2C4] p-8 text-center text-[#5A5243] text-xs space-y-2 rounded-lg bg-white shadow-none">
              <Truck className="w-8 h-8 text-[#8C827A] mx-auto" />
              <p className="font-semibold text-[#262320]">{t.transport.noRequestsReceived}</p>
              <p className="text-[#8C827A]">
                When farmers or FPOs select your fleet vehicles on their lot details page, dispatch requests will appear here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <Card
                  key={req.id}
                  className="border-[#D8D2C4] hover:border-[#1B4332]/40 transition-all shadow-none flex flex-col justify-between rounded-lg bg-white"
                >
                  <div>
                    <CardHeader className="pb-3 border-b border-[#D8D2C4]/60">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#262320] text-base font-heading">
                              {req.lot?.commodity} ({req.quantityQuintals || req.lot?.quantityQuintals || 'Lot'} Qtl)
                            </span>
                            <Badge variant="amber" className="text-[10px] font-bold">
                              {t.transport.statusRequested}
                            </Badge>
                          </div>
                          <span className="text-xs font-mono text-[#8C827A]">
                            LOT #{req.lot?.lotCode || req.lotId}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-[#1B4332] block font-heading">
                            {formatINR(req.estimatedCost)}
                          </span>
                          <span className="text-[10px] text-[#5A5243]">Estimated Freight</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 text-xs space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F4F1EA] p-2.5 rounded-lg border border-[#D8D2C4]/60">
                        <div>
                          <span className="text-[#5A5243] block">{t.transport.pickupLocationLabel}:</span>
                          <span className="font-bold text-[#262320]">{req.pickupLocation}</span>
                        </div>
                        <div>
                          <span className="text-[#5A5243] block">{t.transport.dropLocationLabel}:</span>
                          <span className="font-bold text-[#262320]">{req.dropLocation}</span>
                        </div>
                        <div>
                          <span className="text-[#5A5243] block">{t.transport.distanceLabel}:</span>
                          <span className="font-bold text-[#262320]">{req.distanceKm} km</span>
                        </div>
                        <div>
                          <span className="text-[#5A5243] block">{t.transport.tripsLabel}:</span>
                          <span className="font-bold text-[#262320]">{req.estimatedTrips || 1} Trip(s)</span>
                        </div>
                      </div>

                      {req.vehicle && (
                        <div className="text-[11px] text-[#1B4332] bg-emerald-50/50 p-2 rounded-lg border border-[#B7D5C4] flex items-center justify-between">
                          <span>Requested Vehicle: <b>{req.vehicle.vehicleName}</b></span>
                          <span className="font-mono text-[10px] text-[#5A5243]">{req.vehicle.registrationNumber}</span>
                        </div>
                      )}

                      {req.scheduledPickup && (
                        <div className="text-[11px] text-[#5A5243] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#1B4332]" />
                          <span>{t.transport.scheduledPickupLabel}: <strong className="text-[#262320]">{new Date(req.scheduledPickup).toLocaleDateString()}</strong></span>
                        </div>
                      )}

                      {req.notes && (
                        <p className="text-[11px] text-[#5A5243] italic bg-[#FDFBF7] p-2 rounded-lg border border-[#D8D2C4]">
                          &quot;{req.notes}&quot;
                        </p>
                      )}
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0 flex items-center gap-2 justify-end border-t border-[#D8D2C4]/60">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionReqId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                      className="gap-1.5 text-xs text-red-700 border-red-200 hover:bg-red-50 min-h-[36px]"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t.transport.declineRequestBtn}</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      disabled={actionReqId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                      className="gap-1.5 text-xs bg-[#1B4332] hover:bg-[#1B4332]/90 text-white min-h-[36px]"
                    >
                      {actionReqId === req.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>{t.transport.acceptRequestBtn}</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTIVE & COMPLETED DISPATCHES */}
      {/* ========================================================================= */}
      {activeTab === 'dispatches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-[#262320]">
                {t.transport.activeDispatchesTitle}
              </h3>
              <p className="text-xs text-[#5A5243]">
                {t.transport.activeDispatchesSubtitle}
              </p>
            </div>
          </div>

          {activeOrPastDispatches.length === 0 ? (
            <Card className="border-dashed border-[#D8D2C4] p-8 text-center text-[#5A5243] text-xs space-y-2 rounded-lg bg-white shadow-none">
              <Truck className="w-8 h-8 text-[#8C827A] mx-auto" />
              <p className="font-semibold text-[#262320]">{t.transport.noDispatchesFound}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOrPastDispatches.map((req) => {
                let badgeVariant: 'blue' | 'purple' | 'emerald' | 'red' | 'gray' = 'blue';
                let statusLabel = t.transport.statusAccepted;

                if (req.status === 'IN_TRANSIT') {
                  badgeVariant = 'purple';
                  statusLabel = t.transport.statusInTransit;
                } else if (req.status === 'DELIVERED') {
                  badgeVariant = 'emerald';
                  statusLabel = t.transport.statusDelivered;
                } else if (req.status === 'REJECTED') {
                  badgeVariant = 'red';
                  statusLabel = t.transport.statusRejected;
                } else if (req.status === 'CANCELLED') {
                  badgeVariant = 'gray';
                  statusLabel = t.transport.statusCancelled;
                }

                return (
                  <Card key={req.id} className="border-[#D8D2C4] shadow-none flex flex-col justify-between rounded-lg bg-white">
                    <div>
                      <CardHeader className="pb-3 border-b border-[#D8D2C4]/60">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-[#262320] text-sm block font-heading">
                              {req.lot?.commodity} ({req.quantityQuintals || req.lot?.quantityQuintals || ''} Qtl)
                            </span>
                            <span className="text-xs font-mono text-[#8C827A]">
                              REQ #{req.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <Badge variant={badgeVariant} className="text-xs font-bold">
                            {statusLabel}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-3 text-xs space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F4F1EA] p-2.5 rounded-lg border border-[#D8D2C4]/60">
                          <div>
                            <span className="text-[#5A5243] block">{t.transport.pickupLocationLabel}:</span>
                            <span className="font-bold text-[#262320]">{req.pickupLocation}</span>
                          </div>
                          <div>
                            <span className="text-[#5A5243] block">{t.transport.dropLocationLabel}:</span>
                            <span className="font-bold text-[#262320]">{req.dropLocation}</span>
                          </div>
                          <div>
                            <span className="text-[#5A5243] block">Corridor:</span>
                            <span className="font-bold text-[#262320]">{req.distanceKm} km • {req.estimatedTrips || 1} Trip(s)</span>
                          </div>
                          <div>
                            <span className="text-[#5A5243] block">Earnings:</span>
                            <span className="font-black text-[#1B4332] font-heading">{formatINR(req.estimatedCost)}</span>
                          </div>
                        </div>

                        {req.scheduledPickup && (
                          <div className="text-[11px] text-[#5A5243] flex items-center gap-1.5">
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
                      </CardContent>
                    </div>

                    <div className="p-4 pt-0 border-t border-[#D8D2C4]/60 flex items-center justify-end gap-2">
                      {req.status === 'ACCEPTED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionReqId === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'IN_TRANSIT')}
                          className="gap-2 text-xs bg-[#1B4332] hover:bg-[#1B4332]/90 text-white min-h-[36px]"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{t.transport.markInTransitBtn}</span>
                        </Button>
                      )}

                      {req.status === 'IN_TRANSIT' && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionReqId === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'DELIVERED')}
                          className="gap-2 text-xs bg-emerald-700 hover:bg-emerald-800 text-white min-h-[36px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.transport.markDeliveredBtn}</span>
                        </Button>
                      )}

                      {req.status === 'DELIVERED' && (
                        <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{t.transport.transitCompleted}</span>
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Honest Tracking Notice */}
          <div className="p-3 bg-[#FDFBF7] border border-[#D8D2C4] rounded-lg text-xs text-[#5A5243] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
            <p>
              <strong>{t.transport.corridorMilestoneTracking}:</strong> Dispatches record status milestones confirmed by the transporter, driver, or receiving mandi gate receipt. No continuous GPS or simulated live vehicle maps are displayed.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FLEET VEHICLES */}
      {/* ========================================================================= */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-[#262320]">
                {t.transport.fleetOverviewTitle}
              </h3>
              <p className="text-xs text-[#5A5243]">
                {t.transport.fleetOverviewSubtitle}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs border-[#D8D2C4] text-[#1B4332] hover:bg-[#F4F1EA] self-start sm:self-center"
              onClick={() => alert('Demo prototype fleet is pre-configured with RTO permits for testing.')}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t.transport.registerVehicleBtn}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(activeProfile?.vehicles || []).map((vehicle: TransporterVehicleItem) => (
              <Card key={vehicle.id} className="border-[#D8D2C4] shadow-none flex flex-col justify-between rounded-lg bg-white">
                <div>
                  <CardHeader className="pb-3 border-b border-[#D8D2C4]/60">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-[#262320] text-sm block font-heading">
                          {vehicle.vehicleName || vehicle.vehicleType}
                        </span>
                        <span className="text-[11px] font-mono text-[#8C827A]">
                          {vehicle.registrationNumber}
                        </span>
                      </div>
                      {vehicle.isAvailable ? (
                        <Badge variant="emerald" className="text-[10px]">
                          {t.transport.availableBadge}
                        </Badge>
                      ) : (
                        <Badge variant="gray" className="text-[10px]">
                          {t.transport.busyBadge}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-3 text-xs space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F4F1EA] p-2.5 rounded-lg border border-[#D8D2C4]/60">
                      <div>
                        <span className="text-[#5A5243] block">{t.transport.capacityLabel}:</span>
                        <span className="font-bold text-[#262320]">
                          {vehicle.capacityQuintals || vehicle.capacityTonnes * 10} Qtl ({vehicle.capacityTonnes} Tonnes)
                        </span>
                      </div>
                      <div>
                        <span className="text-[#5A5243] block">{t.transport.ratePerKmLabel}:</span>
                        <span className="font-black text-[#1B4332] text-sm font-heading">
                          ₹{vehicle.ratePerKm || 35}/km
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#D8D2C4]/60 flex items-center justify-between">
                      <span className="text-[11px] text-[#5A5243]">{t.transport.coldChainLabel}:</span>
                      {vehicle.isRefrigerated ? (
                        <Badge variant="blue" className="text-[10px] flex items-center gap-1">
                          <Snowflake className="w-3 h-3" />
                          <span>{t.transport.refrigeratedBadge}</span>
                        </Badge>
                      ) : (
                        <Badge variant="gray" className="text-[10px]">
                          {t.transport.standardBadge}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <div className="p-2.5 bg-[#FDFBF7] rounded-lg border border-[#D8D2C4] text-[11px] text-[#5A5243]">
                    Corridor Rates: Dynamic lookup based on vehicle capacity & roundtrip economics
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default function TransporterNetworkPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 text-[#1B4332] animate-spin mx-auto" />
        </div>
      }
    >
      <TransporterHubContent />
    </Suspense>
  );
}
