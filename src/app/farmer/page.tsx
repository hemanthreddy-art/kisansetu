'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { ReputationCluster } from '@/components/ui/ReputationCluster';
import { NetRealisationLedger } from '@/components/ui/NetRealisationLedger';
import { FarmerVoiceAssistant } from '@/components/farmer/FarmerVoiceAssistant';
import { ProduceLot } from '@/types';
import {
  Users,
  PlusCircle,
  TrendingUp,
  Truck,
  CreditCard,
  ArrowRight,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface FarmerTransactionItem {
  id: string;
  transactionCode: string;
  status: string;
  quantityQuintals: number;
  agreedPricePerQuintal: number;
  netRealisation: number;
  lot?: { commodity: string };
  buyer?: { companyName: string };
  transporter?: { businessName: string };
  payments?: Array<{ paymentStatus: string }>;
}

export default function FarmerHubPage() {
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [transactions, setTransactions] = useState<FarmerTransactionItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [lotsRes, txnsRes] = await Promise.all([
          fetch('/api/lots'),
          fetch('/api/transactions?role=FARMER'),
        ]);
        if (lotsRes.ok) {
          const data = await lotsRes.json();
          if (data.success) {
            setLots(data.data || []);
          }
        }
        if (txnsRes.ok) {
          const txnData = await txnsRes.json();
          if (txnData.success) {
            setTransactions(txnData.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load farmer data:', err);
      }
    }
    loadData();
  }, []);

  // Primary active lot from DB or fallback Niphad Onion scenario
  const activeLot = lots[0] || {
    id: 'cmtplfopt000311fhrrmu0jpj',
    lotCode: 'KS-ONION-2026-0001',
    commodity: 'Onion',
    variety: 'Nashik Red Garva',
    quantity: 80,
    unit: 'Quintals',
    quantityQuintals: 80,
    expectedPrice: 2350,
    expectedPricePerQuintal: 2350,
    expectedGrade: 'Grade A',
    locationDistrict: 'Nashik',
    location: 'Niphad, Nashik',
    status: 'AVAILABLE',
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* 1. Farmer Profile & Dashboard Header */}
      <div className="pb-6 mb-6 border-b border-[#D8D2C4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald">Farmer / FPO Portal</Badge>
            <span className="text-[11px] font-semibold text-[#635E59] bg-[#ECE7DE] px-2 py-0.5 rounded-[2px] border border-[#D8D2C4]">
              Demo Profile • Ramesh Patil (Niphad, Nashik)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
            Farmer Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-body text-[#635E59]">
            Nashik Agro FPO Member • Aggregated Volume: 420 Tonnes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/lots?action=create">
            <Button variant="primary" className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Produce Lot</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Embedded Voice Assistant (Preserving Auto-Speech Recitation) */}
      <div id="voice" className="mb-8">
        <FarmerVoiceAssistant />
      </div>

      {/* 3. Operational Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Col 1 & 2: Active Produce Lot & Net Realisation Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Produce Lot Card */}
          <div className="bg-white border border-[#D8D2C4] rounded-[8px] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D8D2C4]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1B4332] bg-[#EAF2ED] px-2 py-0.5 rounded border border-[#B7D5C4]">
                    {activeLot.lotCode}
                  </span>
                  <StatusIndicator status="active" label={activeLot.status} />
                </div>
                <h2 className="text-xl font-bold font-heading text-[#262320] mt-1">
                  {activeLot.commodity} {activeLot.variety && <span className="font-normal text-[#635E59]">• {activeLot.variety}</span>}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[#635E59] mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activeLot.location || activeLot.locationDistrict}</span>
                  </span>
                  <span>•</span>
                  <span><strong>{activeLot.quantity} {activeLot.unit}</strong></span>
                  <span>•</span>
                  <span>Target: ₹{activeLot.expectedPricePerQuintal || activeLot.expectedPrice}/Qtl</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] font-bold text-[#635E59] uppercase block">Quality Screening</span>
                <span className="inline-block px-2 py-0.5 rounded-[4px] text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  AI Screening — Not Physically Verified
                </span>
              </div>
            </div>

            {/* Quick Lot Action Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link href={`/lots/${activeLot.lotCode || activeLot.id}`}>
                <Button size="sm" variant="outline" className="text-xs border-[#D8D2C4] text-[#262320]">
                  View Full Lot
                </Button>
              </Link>
              <Link href="/markets">
                <Button size="sm" variant="outline" className="text-xs border-[#D8D2C4] text-[#262320] gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Compare Mandis</span>
                </Button>
              </Link>
              <Link href="/buyer">
                <Button size="sm" variant="outline" className="text-xs border-[#D8D2C4] text-[#262320] gap-1">
                  <Users className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>View Buyer Offers</span>
                </Button>
              </Link>
              <Link href="/transporter">
                <Button size="sm" variant="outline" className="text-xs border-[#D8D2C4] text-[#262320] gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Find Logistics</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Prominent Net Realisation & Recommendation Card */}
          <div className="bg-white border border-[#D8D2C4] rounded-[8px] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8D2C4]">
              <div>
                <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
                  Core Agricultural Decision
                </span>
                <h3 className="font-heading font-bold text-lg text-[#262320]">
                  Estimated Net Realisation
                </h3>
                <p className="text-xs text-[#635E59]">
                  Take-home earnings calculated for 80 Quintals after logistics and handling deductions.
                </p>
              </div>

              {/* Recommendation Box */}
              <div className="p-2.5 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[4px] text-right">
                <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-[#1B4332]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SELL NOW</span>
                </div>
                <span className="text-[11px] text-[#2D6A4F] block mt-0.5">
                  Direct Buyer provides highest take-home
                </span>
              </div>
            </div>

            {/* Structured Net Realisation Ledger */}
            <NetRealisationLedger
              grossSaleValue={193600}
              transportFreight={1200}
              mandiFee={0}
              storageOrOtherCosts={1200}
              netRealisation={191200}
              lotQuantityQuintals={80}
              cropName="Onion (Nashik Red)"
            />

            {/* Recommendation "Why?" Explanation */}
            <div className="p-3 bg-[#F4F1EA] border border-[#D8D2C4] rounded-[4px] text-xs text-[#262320] space-y-1">
              <strong className="text-[#1B4332] block">Why Sell Now to ABC Foods?</strong>
              <p className="text-[#635E59] leading-relaxed">
                Direct procurement buyer ABC Foods offers ₹2,420/Qtl with local Niphad hub pickup (30 km). Transport freight is only ₹1,200 with zero APMC mandi cess, locking in <strong>₹1,91,200 (₹2,390/Qtl net)</strong> compared to ₹1,78,000 at distant mandis after long-haul deductions.
              </p>
            </div>
          </div>
        </div>

        {/* Col 3: Incoming Offers, Transport & Live Transaction */}
        <div className="space-y-6">
          {/* Active Buyer Offer */}
          <div className="bg-white border border-[#D8D2C4] rounded-[8px] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
              <h3 className="font-heading font-bold text-sm text-[#262320] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1B4332]" />
                <span>Active Buyer Offer</span>
              </h3>
              <span className="text-[10px] font-bold text-[#1B4332] bg-[#EAF2ED] px-2 py-0.5 rounded border border-[#B7D5C4]">
                ACCEPTED
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-sm text-[#262320]">ABC Foods Pvt Ltd</div>
              <div className="flex items-center gap-2">
                <VerificationBadge customLabel="Verified FSSAI" />
              </div>
              <div className="pt-1">
                <ReputationCluster ratingScore={4.7} completedDealsCount={140} onTimeDeliveryPercent={98} size="sm" />
              </div>
              <div className="pt-2 border-t border-[#D8D2C4] flex items-center justify-between text-xs">
                <span className="text-[#635E59]">Agreed Bid:</span>
                <span className="font-bold text-[#1B4332] text-sm">₹2,420 / Qtl (80 Qtl)</span>
              </div>
            </div>
          </div>

          {/* Corridor Transport Request */}
          <div className="bg-white border border-[#D8D2C4] rounded-[8px] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
              <h3 className="font-heading font-bold text-sm text-[#262320] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#1B4332]" />
                <span>Corridor Logistics</span>
              </h3>
              <span className="text-[10px] font-bold text-[#1B4332] bg-[#EAF2ED] px-2 py-0.5 rounded border border-[#B7D5C4]">
                ASSIGNED
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-sm text-[#262320]">Sahyadri Agri Logistics</div>
              <div className="flex items-center gap-2">
                <VerificationBadge customLabel="Commercial License" />
              </div>
              <div className="pt-1">
                <ReputationCluster ratingScore={4.8} completedDealsCount={230} onTimeDeliveryPercent={96.5} size="sm" />
              </div>
              <div className="pt-2 border-t border-[#D8D2C4] space-y-1 text-xs text-[#635E59]">
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-semibold text-[#262320]">6 Tonnes Eicher Truck</span>
                </div>
                <div className="flex justify-between">
                  <span>Corridor Route:</span>
                  <span className="font-semibold text-[#262320]">Niphad → Local Hub (30 km)</span>
                </div>
                <div className="flex justify-between text-[#1B4332] font-bold pt-1 border-t border-[#D8D2C4]/50">
                  <span>Freight Cost:</span>
                  <span>₹1,200</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Commercial Transaction */}
          {(() => {
            const activeTxn = transactions[0];
            const txnCode = activeTxn?.transactionCode || 'TXN-2026-P8-3687';
            const txnStatus = activeTxn?.status || 'IN_TRANSIT';
            const txnNet = activeTxn?.netRealisation ? '₹' + activeTxn.netRealisation.toLocaleString('en-IN') : '₹1,91,200';
            return (
              <div className="bg-white border border-[#D8D2C4] rounded-[8px] p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
                  <h3 className="font-heading font-bold text-sm text-[#262320] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#1B4332]" />
                    <span>Active Transaction</span>
                  </h3>
                  <StatusIndicator status="pending" label={txnStatus} />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-mono text-xs font-bold text-[#1B4332]">
                    {txnCode}
                  </div>
                  <div className="flex justify-between text-[#635E59]">
                    <span>Escrow Milestone:</span>
                    <span className="font-semibold text-[#262320]">20% Advance Deposited</span>
                  </div>
                  <div className="flex justify-between text-[#635E59]">
                    <span>Locked Net Realisation:</span>
                    <span className="font-bold text-[#1B4332]">{txnNet}</span>
                  </div>
                  <div className="pt-2">
                    <Link href="/transactions">
                      <Button size="sm" variant="outline" className="w-full text-xs gap-1 border-[#D8D2C4]">
                        <span>View Transaction Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 4. Transparency & Demonstration Notice */}
      <div className="p-4 rounded-[4px] bg-[#ECE7DE] border border-[#D8D2C4] text-xs text-[#635E59] space-y-1">
        <strong className="text-[#262320] block">Agricultural Data Transparency</strong>
        <p>
          Demonstration scenario modeled for Maharashtra APMC market linkages. All calculations follow actual distance-weighted freight formulas and physical assayer standards.
        </p>
      </div>
    </PageContainer>
  );
}
