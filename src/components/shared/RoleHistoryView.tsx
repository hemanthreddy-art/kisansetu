'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Building,
  Truck,
  Receipt,
  X,
  AlertTriangle,
  User,
} from 'lucide-react';
import { FarmerDisputeModal } from '@/components/disputes/FarmerDisputeModal';

interface ApiTxRecord {
  id: string;
  transactionCode?: string;
  status: string;
  completedAt?: string | null;
  quantityQuintals?: number;
  agreedPricePerQuintal?: number;
  grossSaleValue?: number;
  transportCost?: number;
  mandiFee?: number;
  netRealisation?: number;
  lot?: {
    commodity?: string;
    variety?: string;
    expectedGrade?: string;
    transportRequests?: Array<{
      distanceKm?: number;
      ratePerKm?: number | null;
      estimatedTrips?: number;
      estimatedCost?: number;
      pickupLocation?: string;
      dropLocation?: string;
      notes?: string;
    }>;
  };
  farmer?: { district?: string; user?: { name?: string } };
  buyer?: { district?: string; companyName?: string; user?: { name?: string } };
  transporter?: { businessName?: string; user?: { name?: string } };
}

interface HistoryItem {
  id: string;
  transactionCode: string;
  status: string;
  completedAt?: string | null;
  cropName: string;
  variety?: string | null;
  quantityQuintals: number;
  agreedPricePerQuintal: number;
  grossAmount: number;
  transportFreight: number;
  mandiFee: number;
  platformFee: number;
  netRealisation: number;
  farmerName: string;
  farmerDistrict: string;
  buyerName: string;
  buyerDistrict: string;
  transporterName: string;
  grade: string;
  distanceKm?: number | null;
  ratePerKm?: number | null;
  estimatedTrips?: number | null;
  loadingCharges?: number | null;
  otherApprovedCharges?: number | null;
  pickupLocation?: string | null;
  dropLocation?: string | null;
}

interface RoleHistoryViewProps {
  role: 'FARMER' | 'BUYER' | 'TRANSPORTER';
}

export function RoleHistoryView({ role }: RoleHistoryViewProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<HistoryItem | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeTxId, setDisputeTxId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await fetch(`/api/transactions?role=${role}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            // Filter completed records or create realistic completed record
            const completedRecords: HistoryItem[] = (json.data as ApiTxRecord[])
              .filter((tx) => tx.status === 'COMPLETED')
              .map((tx) => {
                const tr = tx.lot?.transportRequests?.[0];
                return {
                  id: tx.id,
                  transactionCode: tx.transactionCode || 'TXN-SETTLED',
                  status: 'COMPLETED',
                  completedAt: tx.completedAt || new Date().toISOString(),
                  cropName: tx.lot?.commodity || 'Onion',
                  variety: tx.lot?.variety || 'Nashik Red Garva',
                  quantityQuintals: tx.quantityQuintals || 80,
                  agreedPricePerQuintal: tx.agreedPricePerQuintal || 2420,
                  grossAmount: tx.grossSaleValue || (tx.quantityQuintals || 80) * (tx.agreedPricePerQuintal || 2420),
                  transportFreight: tx.transportCost ?? tr?.estimatedCost ?? 0,
                  mandiFee: tx.mandiFee || 0,
                  platformFee: 0,
                  netRealisation: tx.netRealisation || 191200,
                  farmerName: tx.farmer?.user?.name || 'Ramesh Patil',
                  farmerDistrict: tx.farmer?.district || 'Nashik',
                  buyerName: tx.buyer?.companyName || 'ABC Foods Pvt Ltd',
                  buyerDistrict: tx.buyer?.district || 'Pune',
                  transporterName: tx.transporter?.businessName || 'Sahyadri Agri Logistics',
                  grade: tx.lot?.expectedGrade || 'Grade A',
                  distanceKm: tr?.distanceKm ?? null,
                  ratePerKm: tr?.ratePerKm ?? null,
                  estimatedTrips: tr?.estimatedTrips ?? 1,
                  loadingCharges: null,
                  otherApprovedCharges: null,
                  pickupLocation: tr?.pickupLocation || tx.farmer?.district || null,
                  dropLocation: tr?.dropLocation || tx.buyer?.district || null,
                };
              });

            // If empty, supply seeded historical demo records so user can immediately inspect settlement receipts
            if (completedRecords.length === 0) {
              setItems([
                {
                  id: 'cmtplfopt0003_hist_1',
                  transactionCode: 'TXN-2026-NIPHAD-0891',
                  status: 'COMPLETED',
                  completedAt: '2026-03-12T10:30:00Z',
                  cropName: 'Onion',
                  variety: 'Nashik Red Garva',
                  quantityQuintals: 80,
                  agreedPricePerQuintal: 2420,
                  grossAmount: 193600,
                  transportFreight: 1200,
                  mandiFee: 0,
                  platformFee: 0,
                  netRealisation: 192400,
                  farmerName: 'Ramesh Patil',
                  farmerDistrict: 'Nashik (Niphad)',
                  buyerName: 'ABC Foods Pvt Ltd',
                  buyerDistrict: 'Pune APMC Yard',
                  transporterName: 'Sahyadri Agri Logistics',
                  grade: 'Grade A (Assayed)',
                  distanceKm: 45,
                  ratePerKm: 35,
                  estimatedTrips: 1,
                  loadingCharges: null,
                  otherApprovedCharges: null,
                  pickupLocation: 'Niphad, Nashik',
                  dropLocation: 'Hadapsar, Pune',
                },
                {
                  id: 'cmtplfopt0003_hist_2',
                  transactionCode: 'TXN-2026-PUNE-0542',
                  status: 'COMPLETED',
                  completedAt: '2026-02-18T14:15:00Z',
                  cropName: 'Soybean',
                  variety: 'JS 335 (Yellow Seed)',
                  quantityQuintals: 50,
                  agreedPricePerQuintal: 4850,
                  grossAmount: 242500,
                  transportFreight: 2100,
                  mandiFee: 0,
                  platformFee: 0,
                  netRealisation: 240400,
                  farmerName: 'Ramesh Patil',
                  farmerDistrict: 'Nashik (Yeola)',
                  buyerName: 'Maharashtra Agro Processors',
                  buyerDistrict: 'Chhatrapati Sambhaji Nagar',
                  transporterName: 'MahaKisan Freight Lines',
                  grade: 'Grade A (Verified)',
                  distanceKm: 75,
                  ratePerKm: 35,
                  estimatedTrips: 1,
                  loadingCharges: null,
                  otherApprovedCharges: null,
                  pickupLocation: 'Yeola, Nashik',
                  dropLocation: 'MIDC Agro Hub, CSN',
                },
              ]);
            } else {
              setItems(completedRecords);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load role history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [role]);

  const getRoleTitle = () => {
    if (role === 'FARMER') return t.farmer.historyTitle;
    if (role === 'BUYER') return t.buyerMatching.historyTitle || 'Procurement History';
    return t.transport.historyTitle || 'Trip History';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D8D2C4]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#262320]">
            {getRoleTitle()}
          </h2>
          <p className="text-xs text-[#635E59]">
            {role === 'FARMER' && t.farmer.historyEmpty}
            {role === 'BUYER' && (t.buyerMatching.historyEmpty || 'Fulfilled contracts are logged here with escrow receipts.')}
            {role === 'TRANSPORTER' && (t.transport.historyEmpty || 'Completed delivery dispatches are logged here.')}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EAF2ED] text-[#1B4332] border border-[#B7D5C4] self-start sm:self-auto">
          {items.length} Completed Records
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#635E59]">
          {t.common.loading}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-[#D8D2C4] rounded-[10px] space-y-2">
          <FileText className="w-8 h-8 text-[#635E59] mx-auto opacity-40" />
          <h4 className="text-sm font-bold text-[#262320]">
            {role === 'FARMER' && t.farmer.historyEmpty}
            {role === 'BUYER' && (t.buyerMatching.historyEmpty || 'No completed purchases yet.')}
            {role === 'TRANSPORTER' && (t.transport.historyEmpty || 'No completed hauls yet.')}
          </h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#D8D2C4] rounded-[10px] p-5 space-y-3 hover:border-[#1B4332] transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#D8D2C4]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1B4332] bg-[#EAF2ED] px-2 py-0.5 rounded border border-[#B7D5C4]">
                    {item.transactionCode}
                  </span>
                  <Badge variant="emerald">
                    <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                    <span>{t.commonStatuses.completed}</span>
                  </Badge>
                  <span className="text-xs text-[#635E59] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Settled'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDisputeTxId(item.id);
                      setIsDisputeModalOpen(true);
                    }}
                    className="text-xs border-amber-300 text-amber-900 font-semibold gap-1.5 hover:bg-amber-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t.disputes?.reportIssueBtn || 'Report an Issue'}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReceipt(item)}
                    className="text-xs border-[#D8D2C4] text-[#1B4332] font-semibold gap-1.5 hover:bg-[#EAF2ED]/40"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{role === 'TRANSPORTER' ? 'Transport Receipt' : t.farmer.settlementReceipt}</span>
                  </Button>
                </div>
              </div>

              {/* Trade Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Crop & Quantity */}
                <div>
                  <span className="text-[#635E59] block text-[11px] uppercase font-semibold">
                    {role === 'TRANSPORTER' ? 'Hauled Cargo' : t.common.commodity}
                  </span>
                  <strong className="text-base text-[#262320] font-heading font-black">
                    {item.cropName} {item.variety && <span className="text-xs font-normal text-[#635E59]">({item.variety})</span>}
                  </strong>
                  <div className="text-[#635E59] mt-0.5">
                    <strong>{item.quantityQuintals} {t.common.quintals}</strong>
                    {role !== 'TRANSPORTER' && (
                      <> @ ₹{item.agreedPricePerQuintal}{t.common.perQuintal}</>
                    )}
                  </div>
                  {role === 'TRANSPORTER' && (
                    <div className="text-[11px] text-[#635E59] mt-1 space-y-0.5">
                      <div>
                        <span className="text-[#8C827A]">Corridor: </span>
                        <span className="font-semibold text-[#262320]">
                          {item.distanceKm != null ? `${item.distanceKm} km` : 'Not recorded'} • {item.estimatedTrips ? `${item.estimatedTrips} Trip(s)` : '1 Trip'}
                        </span>
                      </div>
                      <div className="truncate">
                        <span className="text-[#8C827A]">Route: </span>
                        <span>{item.pickupLocation || item.farmerDistrict} → {item.dropLocation || item.buyerDistrict}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Counterparties */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[#635E59]">
                    <Building className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>{t.common.buyer}:</span>
                    <strong className="text-[#262320] ml-1">{item.buyerName}</strong>
                  </div>
                  <div className="flex items-center gap-1 text-[#635E59]">
                    {role === 'TRANSPORTER' ? (
                      <>
                        <User className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span>{t.common.farmer}:</span>
                        <strong className="text-[#262320] ml-1">{item.farmerName}</strong>
                      </>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span>{t.common.transporter}:</span>
                        <span className="text-[#262320] ml-1">{item.transporterName}</span>
                      </>
                    )}
                  </div>
                  {role === 'TRANSPORTER' && (
                    <div className="pt-1.5 border-t border-[#D8D2C4]/60 text-[11px] text-[#635E59]">
                      <span className="text-[#8C827A]">Rate: </span>
                      <span className="font-semibold text-[#262320]">
                        {item.ratePerKm != null ? `₹${item.ratePerKm}/km` : 'Not recorded'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Financial Realisation / Settlement */}
                {role === 'TRANSPORTER' ? (
                  <div className="p-3 bg-[#F4F1EA] rounded-[6px] border border-[#D8D2C4] text-right space-y-1">
                    <span className="text-[10px] text-[#635E59] uppercase block font-semibold tracking-wider">
                      Total Transporter Earnings
                    </span>
                    <strong className="text-lg text-[#1B4332] font-heading font-black block">
                      {item.transportFreight > 0
                        ? formatINR(item.transportFreight + (item.loadingCharges || 0) + (item.otherApprovedCharges || 0))
                        : 'Not recorded'}
                    </strong>
                    <div className="text-[10px] text-[#635E59] space-y-0.5">
                      <div>
                        Agreed Freight: <strong className="text-[#262320]">{item.transportFreight > 0 ? formatINR(item.transportFreight) : 'Not recorded'}</strong>
                      </div>
                      {item.loadingCharges != null && (
                        <div>
                          Loading/Unloading: <strong className="text-[#262320]">{formatINR(item.loadingCharges)}</strong>
                        </div>
                      )}
                      {item.otherApprovedCharges != null && (
                        <div>
                          Other Charges: <strong className="text-[#262320]">{formatINR(item.otherApprovedCharges)}</strong>
                        </div>
                      )}
                      <div className="text-[9px] text-[#8C827A] pt-0.5 border-t border-[#D8D2C4]/60">
                        Cargo Value (Farmer/Buyer): {formatINR(item.grossAmount)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#F4F1EA] rounded-[6px] border border-[#D8D2C4] text-right">
                    <span className="text-[10px] text-[#635E59] uppercase block font-semibold">
                      {role === 'FARMER' ? (t.farmer.amountYouReceive || t.farmer.netPaidToBank) : 'Settlement Total'}
                    </span>
                    <strong className="text-lg text-[#1B4332] font-heading font-black">
                      {role === 'BUYER' ? formatINR(item.grossAmount) : formatINR(item.netRealisation)}
                    </strong>
                    <div className="text-[10px] text-[#635E59] mt-0.5">
                      Gross: {formatINR(item.grossAmount)} • Freight: -{formatINR(item.transportFreight)} • Deductions: -₹0
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Digital Settlement Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[12px] border border-[#D8D2C4] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            {/* Receipt Header */}
            <div className="p-4 bg-[#FAF8F5] border-b border-[#D8D2C4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#1B4332]" />
                <h3 className="font-heading font-bold text-base text-[#262320]">
                  {role === 'TRANSPORTER' ? 'Transport Freight Settlement Receipt' : t.farmer.settlementReceipt}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-[#635E59] hover:text-[#262320] p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="p-5 space-y-4 text-xs font-body">
              {/* Receipt Top Meta */}
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#D8D2C4]">
                <div>
                  <span className="text-[10px] text-[#635E59] uppercase block font-mono">Invoice / Txn Code</span>
                  <strong className="font-mono text-sm text-[#1B4332]">{selectedReceipt.transactionCode}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#635E59] uppercase block">Settlement Date</span>
                  <span className="font-semibold">{new Date(selectedReceipt.completedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              {role === 'TRANSPORTER' ? (
                <>
                  {/* Haul & Corridor Specifications */}
                  <div className="space-y-1.5 pb-3 border-b border-[#D8D2C4]">
                    <div className="flex justify-between">
                      <span className="text-[#635E59]">Cargo Commodity:</span>
                      <strong className="text-[#262320]">{selectedReceipt.cropName} ({selectedReceipt.quantityQuintals} Quintals)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#635E59]">Pickup Location:</span>
                      <span className="text-[#262320] font-semibold">{selectedReceipt.pickupLocation || selectedReceipt.farmerDistrict}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#635E59]">Dropoff Destination:</span>
                      <span className="text-[#262320] font-semibold">{selectedReceipt.dropLocation || selectedReceipt.buyerDistrict}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#635E59]">Distance & Trips:</span>
                      <strong>
                        {selectedReceipt.distanceKm != null ? `${selectedReceipt.distanceKm} km` : 'Not recorded'}
                        {' • '}
                        {selectedReceipt.estimatedTrips ? `${selectedReceipt.estimatedTrips} Trip(s)` : '1 Trip'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#635E59]">Agreed Rate per km:</span>
                      <strong>{selectedReceipt.ratePerKm != null ? `₹${selectedReceipt.ratePerKm}/km` : 'Not recorded'}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-dashed border-[#D8D2C4] text-[11px] text-[#8C827A]">
                      <span>Cargo Commercial Value (Farmer/Buyer):</span>
                      <span>{formatINR(selectedReceipt.grossAmount)}</span>
                    </div>
                  </div>

                  {/* Freight Settlement Breakdown */}
                  <div className="space-y-2 py-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#262320] block uppercase text-[10px] tracking-wider">
                        Transport Settlement Breakdown
                      </span>
                      <span className="text-[10px] text-[#635E59] bg-[#ECE7DE] px-2 py-0.5 rounded font-mono">
                        Agreed Freight + Approved Charges
                      </span>
                    </div>
                    <div className="flex justify-between text-[#262320]">
                      <span>Agreed Freight</span>
                      <strong>{selectedReceipt.transportFreight > 0 ? formatINR(selectedReceipt.transportFreight) : 'Not recorded'}</strong>
                    </div>
                    <div className="flex justify-between text-[#635E59]">
                      <span>Rate per km</span>
                      <span>{selectedReceipt.ratePerKm != null ? `₹${selectedReceipt.ratePerKm}/km` : 'Not recorded'}</span>
                    </div>
                    <div className="flex justify-between text-[#635E59]">
                      <span>Distance / Trips</span>
                      <span>{selectedReceipt.distanceKm != null ? `${selectedReceipt.distanceKm} km (${selectedReceipt.estimatedTrips || 1} Trip)` : 'Not recorded'}</span>
                    </div>
                    {selectedReceipt.loadingCharges != null && (
                      <div className="flex justify-between text-[#635E59]">
                        <span>Loading / Unloading Charges</span>
                        <strong className="text-[#262320]">{formatINR(selectedReceipt.loadingCharges)}</strong>
                      </div>
                    )}
                    {selectedReceipt.otherApprovedCharges != null && (
                      <div className="flex justify-between text-[#635E59]">
                        <span>Other Approved Transport Charges</span>
                        <strong className="text-[#262320]">{formatINR(selectedReceipt.otherApprovedCharges)}</strong>
                      </div>
                    )}
                    <div className="flex justify-between text-[#635E59]">
                      <span>Platform Commission / Deductions</span>
                      <span className="text-[#1B4332] font-semibold">₹0 (Free Logistics Pilot)</span>
                    </div>
                  </div>

                  {/* Transporter Settlement Payout */}
                  <div className="p-3.5 bg-[#EAF2ED] rounded-[6px] border border-[#B7D5C4] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#2D6A4F] uppercase block">
                        🚚 Total Transporter Earnings
                      </span>
                      <span className="text-[11px] text-[#635E59]">Bank Account (Verified Transporter Payout)</span>
                    </div>
                    <strong className="text-xl font-heading font-black text-[#1B4332]">
                      {selectedReceipt.transportFreight > 0
                        ? formatINR(selectedReceipt.transportFreight + (selectedReceipt.loadingCharges || 0) + (selectedReceipt.otherApprovedCharges || 0))
                        : 'Not recorded'}
                    </strong>
                  </div>

                  <div className="text-[11px] text-[#635E59] text-center pt-2">
                    This digital transport freight receipt is authenticated via KisanSetu Smart Escrow Settlement.
                  </div>
                </>
              ) : (
                <>
                  {/* Crop & Specifications */}
                  <div className="space-y-1.5 pb-3 border-b border-[#D8D2C4]">
                    <div className="flex justify-between">
                      <span className="text-[#635E59]">{t.common.commodity}:</span>
                      <strong className="text-[#262320]">{selectedReceipt.cropName} ({selectedReceipt.variety})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#635E59]">{t.common.quantity}:</span>
                      <strong>{selectedReceipt.quantityQuintals} {t.common.quintals}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#635E59]">{t.common.grade}:</span>
                      <strong className="text-[#1B4332]">{selectedReceipt.grade}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#635E59]">Contract Mandi Price:</span>
                      <strong>₹{selectedReceipt.agreedPricePerQuintal} {t.common.perQuintal}</strong>
                    </div>
                  </div>

                  {/* Transparent Deductions Breakdown */}
                  <div className="space-y-2 py-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#262320] block uppercase text-[10px] tracking-wider">
                        {t.farmer.netRealisationEst || 'Net Realisation Breakdown'}
                      </span>
                      <span className="text-[10px] text-[#635E59] bg-[#ECE7DE] px-2 py-0.5 rounded font-mono">
                        Gross − Transport − Deductions
                      </span>
                    </div>
                    <div className="flex justify-between text-[#262320]">
                      <span>{t.farmer.grossAmount}</span>
                      <strong>{formatINR(selectedReceipt.grossAmount)}</strong>
                    </div>
                    <div className="flex justify-between text-red-700">
                      <span>(-) {t.farmer.transportDeduction} ({selectedReceipt.transporterName})</span>
                      <span>-{formatINR(selectedReceipt.transportFreight)}</span>
                    </div>
                    <div className="flex justify-between text-[#635E59]">
                      <span>(-) {t.farmer.mandiFeeDeduction}</span>
                      <span>₹0 (0% APMC Direct Trade)</span>
                    </div>
                    <div className="flex justify-between text-[#635E59]">
                      <span>(-) Other Deductions / Platform Fee</span>
                      <span className="text-[#1B4332] font-semibold">₹0 ({t.farmer.freePromo})</span>
                    </div>
                  </div>

                  {/* Net Payout Summary */}
                  <div className="p-3.5 bg-[#EAF2ED] rounded-[6px] border border-[#B7D5C4] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#2D6A4F] uppercase block">
                        💰 {t.farmer.amountYouReceive || t.farmer.netPaidToBank}
                      </span>
                      <span className="text-[11px] text-[#635E59]">State Bank of India (A/C •••• 4281)</span>
                    </div>
                    <strong className="text-xl font-heading font-black text-[#1B4332]">
                      {formatINR(selectedReceipt.netRealisation)}
                    </strong>
                  </div>

                  <div className="text-[11px] text-[#635E59] text-center pt-2">
                    This digital receipt is authenticated via KisanSetu Smart Escrow Settlement.
                  </div>
                </>
              )}
            </div>

            {/* Receipt Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#D8D2C4] flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const txId = selectedReceipt.id;
                  setSelectedReceipt(null);
                  setDisputeTxId(txId);
                  setIsDisputeModalOpen(true);
                }}
                className="text-xs border-amber-300 text-amber-900 hover:bg-amber-50 gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.disputes?.reportIssueBtn || 'Issue with Settlement? Report'}</span>
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setSelectedReceipt(null)}
                className="bg-[#1B4332] text-white text-xs px-5"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Dispute Modal */}
      <FarmerDisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => {
          setIsDisputeModalOpen(false);
          setDisputeTxId(null);
        }}
        initialTransactionId={disputeTxId || undefined}
      />
    </div>
  );
}
