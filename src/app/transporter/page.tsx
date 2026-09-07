'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Truck,
  Gauge,
  Building2,
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Loader2,
  XCircle,
  Star,
  RefreshCw,
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

type ActiveTab = 'fleet' | 'requests' | 'dispatches';

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
    (t) =>
      t.businessName.toLowerCase().includes(activeKey.toLowerCase().replace('_', ' ')) ||
      (activeKey === 'SAHYADRI_LOGISTICS' && t.businessName.includes('Sahyadri')) ||
      (activeKey === 'MAHAKISAN_FREIGHT' && t.businessName.includes('MahaKisan')) ||
      (activeKey === 'GODAVARI_COLDCHAIN' && t.businessName.includes('Godavari')) ||
      (activeKey === 'GRAMIN_VAHAN' && t.businessName.includes('Gramin'))
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl space-y-8 animate-fadeIn">
      {/* Top Breadcrumb / Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="purple">Module T • Phase 5</Badge>
            <span className="text-xs text-gray-500 font-mono font-bold">
              {t.transport.roleBadge}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-purple-700" />
            <span>{t.transport.hubTitle}</span>
          </h1>
          <p className="text-gray-600 text-sm max-w-3xl">
            {t.transport.hubSubtitle}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="gap-2 text-xs border-purple-200 text-purple-900 hover:bg-purple-50 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Network</span>
        </Button>
      </div>

      {/* Demo Transporter Switcher */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-purple-700" />
            <span>{t.transport.demoTransporterSelector}</span>
          </span>
          <span className="text-[11px] text-purple-800 font-mono bg-white px-2.5 py-0.5 rounded-full border border-purple-200">
            Fleet Profile Selector
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DEMO_TRANSPORTERS_META.map((meta) => {
            const isSelected = activeKey === meta.key;
            return (
              <button
                key={meta.key}
                type="button"
                onClick={() => setActiveKey(meta.key)}
                className={`text-left p-3 rounded-2xl border transition-all text-xs space-y-1 ${
                  isSelected
                    ? 'bg-purple-900 text-white border-purple-900 shadow-md ring-2 ring-purple-600/30'
                    : 'bg-white text-gray-800 border-purple-100 hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                <div className="font-bold truncate">{meta.businessName.split('[')[0]}</div>
                <div className="flex items-center justify-between text-[10px] opacity-85">
                  <span>{meta.operationalDistricts.split(',')[0]}</span>
                  <span>★ {meta.ratingScore.toFixed(1)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Transporter Identity Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-black text-gray-900">
                {activeProfile?.businessName || activeMeta.businessName}
              </h2>
              {activeMeta.verified ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <BadgeCheck className="w-4 h-4 text-emerald-700" />
                  {t.transport.verifiedPermit}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  {t.transport.unverifiedPermit}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
              <span>Contact: {activeMeta.representative} ({activeMeta.phone})</span>
              <span>•</span>
              <span className="font-mono">RTO Permit: {activeMeta.commercialLicenseNo}</span>
              <span>•</span>
              <span>{t.transport.operationalDistrictsLabel}: {activeMeta.operationalDistricts}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-purple-50 border border-purple-100 rounded-2xl px-4 py-2 text-center">
              <span className="text-[10px] text-purple-700 uppercase font-bold block">
                {t.transport.fleetRating}
              </span>
              <span className="text-lg font-black text-purple-900 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {activeMeta.ratingScore.toFixed(1)}
              </span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2 text-center">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">
                {t.transport.onTimeRate}
              </span>
              <span className="text-lg font-black text-emerald-900">
                {activeMeta.onTimeDeliveryPercent}%
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 text-center">
              <span className="text-[10px] text-gray-600 uppercase font-bold block">
                {t.transport.tripsCompleted}
              </span>
              <span className="text-lg font-black text-gray-900">
                {activeMeta.completedTripsCount}
              </span>
            </div>
          </div>
        </div>

        {/* SIH Transparent Cost Formula Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 text-xs text-purple-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-purple-950">
            <Gauge className="w-4 h-4 text-purple-700" />
            <span>{t.transport.formulaTitle}</span>
          </div>
          <p className="font-mono text-[11px] bg-white/70 p-2 rounded-xl border border-purple-200/50">
            {t.transport.formulaText}
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.transport.tabRequests} ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dispatches')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'dispatches'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{t.transport.tabDispatches} ({activeOrPastDispatches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeTab === 'fleet'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t.transport.tabFleet} ({activeProfile?.vehicles?.length || 0})</span>
        </button>
      </div>

      {/* Action Notification Banners */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
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
              <h3 className="text-lg font-bold text-gray-900">
                {t.transport.incomingRequestsTitle}
              </h3>
              <p className="text-xs text-gray-500">
                {t.transport.incomingRequestsSubtitle}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {pendingRequests.length} Pending
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-gray-500 text-xs space-y-2">
              <Truck className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="font-semibold text-gray-700">{t.transport.noRequestsReceived}</p>
              <p className="text-gray-400">
                When farmers or FPOs select your fleet vehicles on their lot details page, dispatch requests will appear here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <Card
                  key={req.id}
                  className="border-gray-200 hover:border-purple-300 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <CardHeader className="pb-3 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-base">
                              {req.lot?.commodity} ({req.quantityQuintals || req.lot?.quantityQuintals || 'Lot'} Qtl)
                            </span>
                            <Badge variant="amber" className="text-[11px] font-bold">
                              {t.transport.statusRequested}
                            </Badge>
                          </div>
                          <span className="text-xs font-mono text-gray-500">
                            LOT #{req.lot?.lotCode || req.lotId}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-purple-900 block">
                            ₹{Number(req.estimatedCost).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-gray-500">Gross Freight</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 text-xs space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-gray-400 block">{t.transport.pickupLocationLabel}:</span>
                          <span className="font-bold text-gray-800">{req.pickupLocation}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">{t.transport.dropLocationLabel}:</span>
                          <span className="font-bold text-gray-800">{req.dropLocation}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">{t.transport.distanceLabel}:</span>
                          <span className="font-bold text-gray-800">{req.distanceKm} km</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">{t.transport.tripsLabel}:</span>
                          <span className="font-bold text-gray-800">{req.estimatedTrips || 1} Trip(s)</span>
                        </div>
                      </div>

                      {req.vehicle && (
                        <div className="text-[11px] text-purple-900 bg-purple-50 p-2 rounded-lg border border-purple-100 flex items-center justify-between">
                          <span>Requested Vehicle: <b>{req.vehicle.vehicleName}</b></span>
                          <span className="font-mono text-[10px]">{req.vehicle.registrationNumber}</span>
                        </div>
                      )}

                      {req.scheduledPickup && (
                        <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-700" />
                          <span>{t.transport.scheduledPickupLabel}: <b>{new Date(req.scheduledPickup).toLocaleDateString()}</b></span>
                        </div>
                      )}

                      {req.notes && (
                        <p className="text-[11px] text-gray-500 italic bg-white p-2 rounded-lg border border-gray-200">
                          &quot;{req.notes}&quot;
                        </p>
                      )}
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0 flex items-center gap-2 justify-end border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionReqId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                      className="gap-1.5 text-xs text-red-700 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t.transport.declineRequestBtn}</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      disabled={actionReqId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                      className="gap-1.5 text-xs bg-purple-700 hover:bg-purple-800 text-white shadow-sm"
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
              <h3 className="text-lg font-bold text-gray-900">
                {t.transport.activeDispatchesTitle}
              </h3>
              <p className="text-xs text-gray-500">
                {t.transport.activeDispatchesSubtitle}
              </p>
            </div>
          </div>

          {activeOrPastDispatches.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-gray-500 text-xs space-y-2">
              <Truck className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="font-semibold text-gray-700">{t.transport.noDispatchesFound}</p>
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
                  <Card key={req.id} className="border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-gray-900 text-sm block">
                              {req.lot?.commodity} ({req.quantityQuintals || req.lot?.quantityQuintals || ''} Qtl)
                            </span>
                            <span className="text-xs font-mono text-gray-500">
                              REQ #{req.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <Badge variant={badgeVariant} className="text-xs font-bold">
                            {statusLabel}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-3 text-xs space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-gray-400 block">{t.transport.pickupLocationLabel}:</span>
                            <span className="font-bold text-gray-800">{req.pickupLocation}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">{t.transport.dropLocationLabel}:</span>
                            <span className="font-bold text-gray-800">{req.dropLocation}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Corridor:</span>
                            <span className="font-bold text-gray-800">{req.distanceKm} km • {req.estimatedTrips || 1} Trip(s)</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Earnings:</span>
                            <span className="font-black text-purple-900">₹{Number(req.estimatedCost).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {req.scheduledPickup && (
                          <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-700" />
                            <span>{t.transport.scheduledPickupLabel}: <b>{new Date(req.scheduledPickup).toLocaleDateString()}</b></span>
                          </div>
                        )}

                        {req.actualDelivery && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t.transport.actualDeliveryLabel}: <b>{new Date(req.actualDelivery).toLocaleDateString()}</b></span>
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-end gap-2">
                      {req.status === 'ACCEPTED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionReqId === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'IN_TRANSIT')}
                          className="gap-2 text-xs bg-indigo-700 hover:bg-indigo-800 text-white"
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
                          className="gap-2 text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.transport.markDeliveredBtn}</span>
                        </Button>
                      )}

                      {req.status === 'DELIVERED' && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Transit Completed</span>
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FLEET VEHICLES */}
      {/* ========================================================================= */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {t.transport.fleetOverviewTitle}
              </h3>
              <p className="text-xs text-gray-500">
                {t.transport.fleetOverviewSubtitle}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs border-purple-300 text-purple-900 hover:bg-purple-50 self-start sm:self-center"
              onClick={() => alert('Demo prototype fleet is pre-configured with RTO permits for testing.')}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t.transport.registerVehicleBtn}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(activeProfile?.vehicles || []).map((vehicle: TransporterVehicleItem) => (
              <Card key={vehicle.id} className="border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-gray-900 text-sm block">
                          {vehicle.vehicleName || vehicle.vehicleType}
                        </span>
                        <span className="text-[11px] font-mono text-gray-500">
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
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-400 block">{t.transport.capacityLabel}:</span>
                        <span className="font-bold text-gray-800">
                          {vehicle.capacityQuintals || vehicle.capacityTonnes * 10} Qtl ({vehicle.capacityTonnes} Tonnes)
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">{t.transport.ratePerKmLabel}:</span>
                        <span className="font-black text-purple-900 text-sm">
                          ₹{vehicle.ratePerKm || 35}/km
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">{t.transport.coldChainLabel}:</span>
                      {vehicle.isRefrigerated ? (
                        <Badge variant="blue" className="text-[10px]">
                          {t.transport.refrigeratedBadge}
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
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600">
                    Calculated in Phase 5 Matching Engine • Feeds Phase 6 Net Realisation
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransporterNetworkPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 text-purple-700 animate-spin mx-auto" />
        </div>
      }
    >
      <TransporterHubContent />
    </Suspense>
  );
}
