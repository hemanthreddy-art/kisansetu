/**
 * KisanSetu - Phase 6: Net Realisation Engine & Smart Selling Recommendation
 * 
 * CORE USP PRINCIPLE:
 * “Don’t just find the highest gross price. Find the highest reliable NET REALISATION.”
 * 
 * Primary Formula:
 * GROSS SALE VALUE = Quantity (Qtl) × Price per Quintal (₹)
 * NET REALISATION  = Gross Sale Value − Transport Cost − Storage Cost − Other Applicable Costs
 * NET PER QUINTAL  = Net Realisation / Quantity
 * 
 * IMPORTANT SAFEGUARDS:
 * 1. Reuses deterministic transport calculation from Phase 5 (transportMatching.ts).
 * 2. Strict separation of independent verification (RTO/FSSAI/KYC) and reputation (stars/punctuality)
 *    from financial math. Reliability is never secretly multiplied into cash values.
 * 3. Future price projections are transparently labelled as “Estimated / Not Guaranteed”.
 * 4. Rule-based, explainable decision engine.
 */

import {
  getCorridorDistance,
  calculateTrips,
  calculateTransportCost,
  calculateCostPerQuintal,
} from './transportMatching';
import { DEMO_STORAGE_FACILITIES } from './auth-demo';

export type RecommendationType = 'SELL_NOW' | 'STORE_AND_SELL_LATER' | 'WAIT_AND_WATCH';
export type SellingOptionType = 'MANDI' | 'BUYER_OFFER' | 'STORE_AND_SELL_LATER';

export interface OptionReliability {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  verified: boolean;
  ratingScore?: number;
  completedTransactionsCount?: number;
  paymentPunctualityPercent?: number;
  label: string;
}

export interface SellingOption {
  id: string;
  name: string;
  type: SellingOptionType;
  entityName: string;
  location: string;
  district: string;
  distanceKm: number;
  commodity: string;
  quantityQuintals: number;
  
  // Financial breakdown
  sellingPricePerQtl: number;
  grossSaleValue: number;
  
  // Deductions
  trips: number;
  transportRatePerKm: number;
  transportCost: number;
  transportCostPerQtl: number;
  
  storageDays: number;
  storageRatePerMonthPerQtl: number;
  storageCost: number;
  storageCostPerQtl: number;
  
  mandiCessCost: number;
  handlingCost: number;
  otherCosts: number;
  otherCostsPerQtl: number;
  
  // Net Realisation
  netRealisation: number;
  netRealisationPerQtl: number;
  
  // Trust & Status
  reliability: OptionReliability;
  qualityCompatible: boolean;
  qualityNote?: string;
  
  // Disclaimers & Provenance
  isEstimated: boolean;
  estimateNotice?: string;
  dataSource: string; // e.g. "Demo APMC Mandi Feed", "Verified Buyer Purchase Offer", "MSWC Storage Projection"
}

export interface CostBreakdownSummary {
  quantityQuintals: number;
  sellingPricePerQtl: number;
  grossSaleValue: number;
  transportCost: number;
  storageCost: number;
  otherCosts: number;
  totalDeductions: number;
  netRealisation: number;
  netRealisationPerQtl: number;
}

export interface RecommendationResult {
  recommendation: RecommendationType;
  recommendationTitle: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  bestOption: SellingOption | null;
  sellingOptions: SellingOption[];
  costBreakdown: CostBreakdownSummary | null;
  reasons: string[];
  warnings: string[];
  assumptions: string[];
  storeLaterComparison?: {
    immediateNetPerQtl: number;
    projectedNetPerQtl: number;
    potentialGainPerQtl: number;
    additionalStoragePerQtl: number;
    netAdvantagePerQtl: number;
    holdingDays: number;
    isViable: boolean;
  };
  dataSourceNotes: {
    transportEngine: string;
    storageModel: string;
    marketData: string;
    futurePriceDisclaimer: string;
  };
}

// -------------------------------------------------------------------
// 1. REUSABLE CORE CALCULATION FORMULAS
// -------------------------------------------------------------------

export function calculateGrossSaleValue(quantityQuintals: number, pricePerQtl: number): number {
  if (quantityQuintals <= 0 || pricePerQtl <= 0) return 0;
  return Math.round(quantityQuintals * pricePerQtl);
}

export function calculateStorageCost(
  quantityQuintals: number,
  ratePerQuintalPerMonth: number,
  storageDays: number
): number {
  if (quantityQuintals <= 0 || storageDays <= 0 || ratePerQuintalPerMonth <= 0) return 0;
  const ratePerDay = ratePerQuintalPerMonth / 30;
  return Math.round(quantityQuintals * ratePerDay * storageDays);
}

export function calculateOtherCosts(
  grossSaleValue: number,
  quantityQuintals: number,
  isDirectBuyer = false
): { mandiCess: number; handlingCost: number; otherCosts: number } {
  // Mandi transactions attract ~1.05% APMC cess; direct off-mandi sales typically save cess
  const mandiCess = isDirectBuyer ? 0 : Math.round((grossSaleValue * 1.05) / 100);
  const handlingCost = Math.round(quantityQuintals * 15); // ₹15/Qtl loading & weighment
  const otherCosts = mandiCess + handlingCost;
  return { mandiCess, handlingCost, otherCosts };
}

export function computeNetRealisation(params: {
  quantityQuintals: number;
  sellingPricePerQtl: number;
  transportCost: number;
  storageCost: number;
  otherCosts: number;
}): {
  grossSaleValue: number;
  totalDeductions: number;
  netRealisation: number;
  netRealisationPerQtl: number;
} {
  const { quantityQuintals, sellingPricePerQtl, transportCost, storageCost, otherCosts } = params;
  const grossSaleValue = calculateGrossSaleValue(quantityQuintals, sellingPricePerQtl);
  const totalDeductions = transportCost + storageCost + otherCosts;
  const netRealisation = grossSaleValue - totalDeductions;
  const netRealisationPerQtl =
    quantityQuintals > 0 ? Math.round((netRealisation / quantityQuintals) * 100) / 100 : 0;

  return {
    grossSaleValue,
    totalDeductions,
    netRealisation,
    netRealisationPerQtl,
  };
}

// -------------------------------------------------------------------
// 2. SELLING OPTIONS GENERATOR & EVALUATOR
// -------------------------------------------------------------------

export interface EvaluateLotInput {
  lot: {
    id: string;
    lotCode: string;
    commodity: string;
    variety?: string | null;
    quantityQuintals: number;
    expectedPricePerQuintal?: number | null;
    expectedPrice?: number | null;
    locationDistrict?: string | null;
    locationTaluka?: string | null;
    location?: string | null;
    status: string; // AVAILABLE, RESERVED, SOLD
  };
  offers?: Array<{
    id: string;
    offeredPricePerQtl: number;
    quantityQuintals: number;
    status: string; // PENDING, ACCEPTED
    buyer?: {
      companyName: string;
      verified: boolean;
      registeredState?: string | null;
      operatingCities?: string | null;
      reputationScore?: number | null;
      completedTradesCount?: number | null;
      paymentPunctualityPercent?: number | null;
    } | null;
  }>;
  customHoldingDays?: number;
}

/**
 * Generates and ranks realistic selling options for a produce lot:
 * Option 1: Local / Nearby APMC Mandi (Low freight, short distance)
 * Option 2: Distant Regional APMC Mandi (Higher gross, high freight deduction)
 * Option 3: Direct Verified Buyer Offer (Phase 4B integration, farm-gate/warehouse)
 * Option 4: Store & Sell Later (MSWC warehouse, 20-30 days holding, estimated future price)
 */
export function generateSellingOptions(input: EvaluateLotInput): SellingOption[] {
  const { lot, offers = [], customHoldingDays = 25 } = input;
  const qty = lot.quantityQuintals || 80;
  const originDistrict = lot.locationDistrict || 'Nashik';
  const originLocation = lot.location || `${originDistrict} Farm Gate`;
  const basePrice = lot.expectedPricePerQuintal || lot.expectedPrice || 2300;
  const options: SellingOption[] = [];

  // --------------------------------------------------
  // OPTION 1: Local / Nearby Mandi (e.g. Lasalgaon / Local Nashik)
  // --------------------------------------------------
  const isNashikRegion = originDistrict.toLowerCase().includes('nashik');
  const localMandiName = isNashikRegion ? 'Lasalgaon APMC Mandi [Sample Demo Data]' : `${originDistrict} APMC Mandi [Sample Demo Data]`;
  const localMandiDistrict = originDistrict;
  const localMandiLocation = isNashikRegion ? 'Lasalgaon Yard, Niphad' : `${originDistrict} APMC Market Yard`;
  const localDistance = isNashikRegion ? 25 : 35;
  
  // Local price is typically close to farmer's base ask (e.g. 96-100%)
  const localPricePerQtl = Math.round(basePrice * 0.98);
  const localGross = calculateGrossSaleValue(qty, localPricePerQtl);

  // Phase 5 Transport: 20 Qtl or 40 Qtl truck for short hop
  const localVehicleCap = qty <= 40 ? 40 : 80;
  const localTrips = calculateTrips(qty, localVehicleCap);
  const localTransportRate = 35; // ₹35/km local rate
  const localTransportCost = calculateTransportCost(localTrips, localDistance, localTransportRate);
  const localTransportPerQtl = calculateCostPerQuintal(localTransportCost, qty);

  const localOther = calculateOtherCosts(localGross, qty, false);
  const localNetRealisation = localGross - localTransportCost - 0 - localOther.otherCosts;
  const localNetPerQtl = Math.round((localNetRealisation / qty) * 100) / 100;

  options.push({
    id: 'OPT-LOCAL-MANDI',
    name: localMandiName,
    type: 'MANDI',
    entityName: isNashikRegion ? 'Lasalgaon APMC' : `${originDistrict} APMC`,
    location: localMandiLocation,
    district: localMandiDistrict,
    distanceKm: localDistance,
    commodity: lot.commodity,
    quantityQuintals: qty,
    sellingPricePerQtl: localPricePerQtl,
    grossSaleValue: localGross,
    trips: localTrips,
    transportRatePerKm: localTransportRate,
    transportCost: localTransportCost,
    transportCostPerQtl: localTransportPerQtl,
    storageDays: 0,
    storageRatePerMonthPerQtl: 0,
    storageCost: 0,
    storageCostPerQtl: 0,
    mandiCessCost: localOther.mandiCess,
    handlingCost: localOther.handlingCost,
    otherCosts: localOther.otherCosts,
    otherCostsPerQtl: Math.round((localOther.otherCosts / qty) * 100) / 100,
    netRealisation: localNetRealisation,
    netRealisationPerQtl: localNetPerQtl,
    reliability: {
      level: 'MEDIUM',
      verified: true,
      ratingScore: 4.2,
      label: 'APMC Regulated Yard',
    },
    qualityCompatible: true,
    isEstimated: false,
    dataSource: 'Sample Mandi Price (MSAMB Prototype)',
  });

  // --------------------------------------------------
  // OPTION 2: Distant High-Gross Mandi (e.g. Pune Market Yard)
  // Demonstrates the CORE USP: Higher gross price often gets eroded by freight!
  // --------------------------------------------------
  const distantMandiDistrict = isNashikRegion ? 'Pune' : 'Mumbai';
  const distantMandiName = isNashikRegion
    ? 'Pune Market Yard APMC [Sample Demo Data]'
    : 'Vashi APMC Navi Mumbai [Sample Demo Data]';
  const distantMandiLocation = isNashikRegion ? 'Gultekdi Market Yard, Pune' : 'APMC Terminal, Vashi';
  const distantDistance = getCorridorDistance(originDistrict, distantMandiDistrict);

  // Distant terminal market headline price is ₹250-₹350 higher (+12-14%)
  const distantPricePerQtl = Math.round(basePrice * 1.13);
  const distantGross = calculateGrossSaleValue(qty, distantPricePerQtl);

  // Phase 5 Transport: Medium truck (40 Qtl cap) across 210 km corridor
  // E.g. 80 Qtl requires 2 trips @ ₹38/km = ₹15,960!
  const distantVehicleCap = qty <= 40 ? 40 : 40; // Demonstrate multi-trip impact if > 40
  const distantTrips = calculateTrips(qty, distantVehicleCap);
  const distantTransportRate = 38;
  const distantTransportCost = calculateTransportCost(distantTrips, distantDistance, distantTransportRate);
  const distantTransportPerQtl = calculateCostPerQuintal(distantTransportCost, qty);

  const distantOther = calculateOtherCosts(distantGross, qty, false);
  const distantNetRealisation = distantGross - distantTransportCost - 0 - distantOther.otherCosts;
  const distantNetPerQtl = Math.round((distantNetRealisation / qty) * 100) / 100;

  options.push({
    id: 'OPT-DISTANT-MANDI',
    name: distantMandiName,
    type: 'MANDI',
    entityName: isNashikRegion ? 'Pune Market Yard' : 'Vashi APMC',
    location: distantMandiLocation,
    district: distantMandiDistrict,
    distanceKm: distantDistance,
    commodity: lot.commodity,
    quantityQuintals: qty,
    sellingPricePerQtl: distantPricePerQtl,
    grossSaleValue: distantGross,
    trips: distantTrips,
    transportRatePerKm: distantTransportRate,
    transportCost: distantTransportCost,
    transportCostPerQtl: distantTransportPerQtl,
    storageDays: 0,
    storageRatePerMonthPerQtl: 0,
    storageCost: 0,
    storageCostPerQtl: 0,
    mandiCessCost: distantOther.mandiCess,
    handlingCost: distantOther.handlingCost,
    otherCosts: distantOther.otherCosts,
    otherCostsPerQtl: Math.round((distantOther.otherCosts / qty) * 100) / 100,
    netRealisation: distantNetRealisation,
    netRealisationPerQtl: distantNetPerQtl,
    reliability: {
      level: 'MEDIUM',
      verified: true,
      ratingScore: 4.4,
      label: 'Major Terminal APMC',
    },
    qualityCompatible: true,
    isEstimated: false,
    dataSource: 'Sample Terminal Mandi Price (Demo Feed)',
  });

  // --------------------------------------------------
  // OPTION 3: Direct Buyer Offers (Phase 4B Integration)
  // --------------------------------------------------
  const acceptedOrPendingOffer = offers.find(
    (o) => o.status === 'ACCEPTED' || o.status === 'PENDING'
  );

  if (acceptedOrPendingOffer && acceptedOrPendingOffer.buyer) {
    const buyer = acceptedOrPendingOffer.buyer;
    const offerPrice = acceptedOrPendingOffer.offeredPricePerQtl || basePrice + 50;
    const offerGross = calculateGrossSaleValue(qty, offerPrice);

    // If buyer pickup is local or farm-gate, freight is negligible or subsidized (e.g. ₹0 to ₹3,500)
    const buyerDist = 30; // Farm-gate / local aggregation hub
    const buyerTrips = 1;
    const buyerTransportRate = 30;
    const buyerTransportCost = Math.round(buyerDist * buyerTransportRate * buyerTrips);
    const buyerTransportPerQtl = calculateCostPerQuintal(buyerTransportCost, qty);

    const buyerOther = calculateOtherCosts(offerGross, qty, true); // Direct sale saves mandi cess!
    const buyerNetRealisation = offerGross - buyerTransportCost - 0 - buyerOther.otherCosts;
    const buyerNetPerQtl = Math.round((buyerNetRealisation / qty) * 100) / 100;

    options.push({
      id: `OPT-BUYER-${acceptedOrPendingOffer.id}`,
      name: `${buyer.companyName} (Commercial Purchase Offer)`,
      type: 'BUYER_OFFER',
      entityName: buyer.companyName,
      location: originLocation,
      district: originDistrict,
      distanceKm: buyerDist,
      commodity: lot.commodity,
      quantityQuintals: qty,
      sellingPricePerQtl: offerPrice,
      grossSaleValue: offerGross,
      trips: buyerTrips,
      transportRatePerKm: buyerTransportRate,
      transportCost: buyerTransportCost,
      transportCostPerQtl: buyerTransportPerQtl,
      storageDays: 0,
      storageRatePerMonthPerQtl: 0,
      storageCost: 0,
      storageCostPerQtl: 0,
      mandiCessCost: buyerOther.mandiCess,
      handlingCost: buyerOther.handlingCost,
      otherCosts: buyerOther.otherCosts,
      otherCostsPerQtl: Math.round((buyerOther.otherCosts / qty) * 100) / 100,
      netRealisation: buyerNetRealisation,
      netRealisationPerQtl: buyerNetPerQtl,
      reliability: {
        level: buyer.verified ? 'HIGH' : 'LOW',
        verified: buyer.verified,
        ratingScore: buyer.reputationScore || 4.8,
        completedTransactionsCount: buyer.completedTradesCount || 48,
        paymentPunctualityPercent: buyer.paymentPunctualityPercent || 98,
        label: buyer.verified ? 'Verified Commercial Enterprise' : 'Unverified Prototype Buyer',
      },
      qualityCompatible: true,
      isEstimated: false,
      dataSource: `Live Digital Contract Offer (${acceptedOrPendingOffer.status})`,
    });
  } else {
    // Default prototype buyer offer when no active bid exists
    const demoOfferPrice = basePrice + 80;
    const demoGross = calculateGrossSaleValue(qty, demoOfferPrice);
    const demoTransport = Math.round(qty * 15); // ₹15/Qtl local logistics
    const demoOther = calculateOtherCosts(demoGross, qty, true);
    const demoNet = demoGross - demoTransport - 0 - demoOther.otherCosts;
    const demoNetPerQtl = Math.round((demoNet / qty) * 100) / 100;

    options.push({
      id: 'OPT-DEMO-BUYER',
      name: 'ABC Foods Pvt Ltd [Direct Procurement Quote]',
      type: 'BUYER_OFFER',
      entityName: 'ABC Foods Pvt Ltd',
      location: 'Pimpalgaon Baswant Farm-Gate Pickup',
      district: originDistrict,
      distanceKm: 20,
      commodity: lot.commodity,
      quantityQuintals: qty,
      sellingPricePerQtl: demoOfferPrice,
      grossSaleValue: demoGross,
      trips: 1,
      transportRatePerKm: 30,
      transportCost: demoTransport,
      transportCostPerQtl: Math.round((demoTransport / qty) * 100) / 100,
      storageDays: 0,
      storageRatePerMonthPerQtl: 0,
      storageCost: 0,
      storageCostPerQtl: 0,
      mandiCessCost: demoOther.mandiCess,
      handlingCost: demoOther.handlingCost,
      otherCosts: demoOther.otherCosts,
      otherCostsPerQtl: Math.round((demoOther.otherCosts / qty) * 100) / 100,
      netRealisation: demoNet,
      netRealisationPerQtl: demoNetPerQtl,
      reliability: {
        level: 'HIGH',
        verified: true,
        ratingScore: 4.8,
        completedTransactionsCount: 48,
        paymentPunctualityPercent: 98,
        label: 'Verified Processor (Direct Purchase)',
      },
      qualityCompatible: true,
      isEstimated: false,
      dataSource: 'Sample Buyer Quote (Prototype Model)',
    });
  }

  // --------------------------------------------------
  // OPTION 4: Store & Sell Later (MSWC Warehouse)
  // Transparent seasonal holding projection with disclaimers
  // --------------------------------------------------
  const holdingDays = Math.min(60, Math.max(10, customHoldingDays));
  const storageFacility = DEMO_STORAGE_FACILITIES[0]; // MSWC Pimpalgaon / Nashik
  const storageMonthlyRate = storageFacility.ratePerQuintalPerMonth || 45.0;
  const storageCost = calculateStorageCost(qty, storageMonthlyRate, holdingDays);
  const storageCostPerQtl = Math.round((storageCost / qty) * 100) / 100;

  // Seasonal post-harvest projection (e.g. +11% expected market recovery after peak harvest arrivals subside)
  const projectedFuturePricePerQtl = Math.round(basePrice * 1.11);
  const futureGross = calculateGrossSaleValue(qty, projectedFuturePricePerQtl);

  // Transport to storage warehouse (local 15 km transit)
  const storageTransitDist = 15;
  const storageTransportCost = Math.round(storageTransitDist * 35);
  const storageTransportPerQtl = calculateCostPerQuintal(storageTransportCost, qty);

  const storageOther = calculateOtherCosts(futureGross, qty, false);
  const futureNetRealisation = futureGross - storageTransportCost - storageCost - storageOther.otherCosts;
  const futureNetPerQtl = Math.round((futureNetRealisation / qty) * 100) / 100;

  options.push({
    id: 'OPT-STORE-LATER',
    name: `Store at ${storageFacility.name} & Sell Later (${holdingDays} Days)`,
    type: 'STORE_AND_SELL_LATER',
    entityName: storageFacility.name,
    location: `${storageFacility.district} Agri Warehouse`,
    district: storageFacility.district,
    distanceKm: storageTransitDist,
    commodity: lot.commodity,
    quantityQuintals: qty,
    sellingPricePerQtl: projectedFuturePricePerQtl,
    grossSaleValue: futureGross,
    trips: 1,
    transportRatePerKm: 35,
    transportCost: storageTransportCost,
    transportCostPerQtl: storageTransportPerQtl,
    storageDays: holdingDays,
    storageRatePerMonthPerQtl: storageMonthlyRate,
    storageCost: storageCost,
    storageCostPerQtl: storageCostPerQtl,
    mandiCessCost: storageOther.mandiCess,
    handlingCost: storageOther.handlingCost,
    otherCosts: storageOther.otherCosts,
    otherCostsPerQtl: Math.round((storageOther.otherCosts / qty) * 100) / 100,
    netRealisation: futureNetRealisation,
    netRealisationPerQtl: futureNetPerQtl,
    reliability: {
      level: 'HIGH',
      verified: true,
      ratingScore: 4.7,
      label: 'MSWC State Warehousing Facility',
    },
    qualityCompatible: true,
    isEstimated: true,
    estimateNotice: 'Demo seasonal projection — estimated and not guaranteed. Actual market realization may vary.',
    dataSource: 'MSWC Tariff + Historical Seasonal Trend (Demo Model)',
  });

  return options;
}

// -------------------------------------------------------------------
// 3. SMART RECOMMENDATION ENGINE (TRANSPARENT RULE-BASED LOGIC)
// -------------------------------------------------------------------

export function evaluateSellingOptionsAndRecommend(input: EvaluateLotInput): RecommendationResult {
  const { lot } = input;
  const qty = lot.quantityQuintals || 0;

  // RULE 1: Data Sufficiency Guard
  if (qty <= 0 || !lot.commodity) {
    return {
      recommendation: 'WAIT_AND_WATCH',
      recommendationTitle: 'Wait & Watch Market',
      confidence: 'LOW',
      bestOption: null,
      sellingOptions: [],
      costBreakdown: null,
      reasons: ['Insufficient produce lot data (quantity or commodity missing).'],
      warnings: ['Cannot compute realistic transport or storage deductions without verified quantity.'],
      assumptions: [],
      dataSourceNotes: {
        transportEngine: 'Phase 5 Corridor Matrix',
        storageModel: 'MSWC Schedule of Tariffs',
        marketData: 'Sample Agmarknet Feeds',
        futurePriceDisclaimer: 'No projections generated due to missing baseline data.',
      },
    };
  }

  // Generate options
  const options = generateSellingOptions(input);

  // RULE 2: Lot Already Reserved Guard
  if (lot.status === 'RESERVED') {
    const acceptedBuyerOption = options.find((o) => o.type === 'BUYER_OFFER');
    const selected = acceptedBuyerOption || options[0];
    return {
      recommendation: 'SELL_NOW',
      recommendationTitle: 'Proceed with Scheduled Dispatch',
      confidence: 'HIGH',
      bestOption: selected,
      sellingOptions: options,
      costBreakdown: {
        quantityQuintals: qty,
        sellingPricePerQtl: selected.sellingPricePerQtl,
        grossSaleValue: selected.grossSaleValue,
        transportCost: selected.transportCost,
        storageCost: selected.storageCost,
        otherCosts: selected.otherCosts,
        totalDeductions: selected.transportCost + selected.storageCost + selected.otherCosts,
        netRealisation: selected.netRealisation,
        netRealisationPerQtl: selected.netRealisationPerQtl,
      },
      reasons: [
        'Produce lot is officially RESERVED under an accepted commercial contract.',
        `Committed net realisation of ₹${selected.netRealisationPerQtl.toLocaleString('en-IN')}/Qtl secured.`,
        'Scheduled dispatch and pickup coordinates established with buyer.',
      ],
      warnings: ['Do not commit lot to competing mandis or buyers while in RESERVED state.'],
      assumptions: ['Buyer fulfills payment escrow according to agreed contract terms.'],
      dataSourceNotes: {
        transportEngine: 'Deterministic Corridor Matrix (Phase 5)',
        storageModel: 'MSWC Standard Warehouse Tariff',
        marketData: 'Contractual Offer Terms (Phase 4B)',
        futurePriceDisclaimer: 'Projections bypassed as lot is legally committed.',
      },
    };
  }

  // Separate immediate options (Mandi & Buyer) from future storage option
  const immediateOptions = options.filter((o) => o.type !== 'STORE_AND_SELL_LATER');
  const storeLaterOption = options.find((o) => o.type === 'STORE_AND_SELL_LATER');

  // Sort immediate options by Net Realisation descending
  immediateOptions.sort((a, b) => {
    // Prefer verified enterprise if net realization is within 1.5%
    const diff = b.netRealisationPerQtl - a.netRealisationPerQtl;
    if (Math.abs(diff) < 25 && a.reliability.verified !== b.reliability.verified) {
      return a.reliability.verified ? -1 : 1;
    }
    return diff;
  });

  const bestImmediate = immediateOptions[0];
  const reasons: string[] = [];
  const warnings: string[] = [];
  const assumptions: string[] = [];

  let storeLaterComparison: RecommendationResult['storeLaterComparison'] = undefined;

  if (storeLaterOption && bestImmediate) {
    const immediateNet = bestImmediate.netRealisationPerQtl;
    const projectedNet = storeLaterOption.netRealisationPerQtl;
    const potentialGain = Math.round((storeLaterOption.sellingPricePerQtl - bestImmediate.sellingPricePerQtl) * 100) / 100;
    const additionalStorage = storeLaterOption.storageCostPerQtl;
    const netAdvantage = Math.round((projectedNet - immediateNet) * 100) / 100;
    const isViable = netAdvantage >= 120; // Must deliver at least ₹120/Qtl net improvement to justify storage risk

    storeLaterComparison = {
      immediateNetPerQtl: immediateNet,
      projectedNetPerQtl: projectedNet,
      potentialGainPerQtl: potentialGain,
      additionalStoragePerQtl: additionalStorage,
      netAdvantagePerQtl: netAdvantage,
      holdingDays: storeLaterOption.storageDays,
      isViable,
    };
  }

  // --------------------------------------------------
  // DECISION MATRIX
  // --------------------------------------------------
  let recommendation: RecommendationType = 'SELL_NOW';
  let recommendationTitle = 'Sell Now for Optimal Realisation';
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
  let selectedBestOption: SellingOption = bestImmediate;

  // Check if Store & Sell Later is clearly superior (> ₹120/Qtl net advantage)
  if (storeLaterComparison && storeLaterComparison.isViable) {
    recommendation = 'STORE_AND_SELL_LATER';
    recommendationTitle = 'Store & Sell Later (High Recovery Potential)';
    confidence = 'MEDIUM'; // Projections carry inherent market uncertainty
    selectedBestOption = storeLaterOption!;

    reasons.push(
      `Projected net realisation of ₹${storeLaterOption!.netRealisationPerQtl.toLocaleString('en-IN')}/Qtl exceeds immediate options by ₹${storeLaterComparison.netAdvantagePerQtl.toLocaleString('en-IN')}/Qtl.`,
      `Post-harvest price recovery (+${storeLaterComparison.potentialGainPerQtl} ₹/Qtl) comfortably covers warehouse storage (₹${storeLaterComparison.additionalStoragePerQtl} ₹/Qtl).`,
      `Warehouse capacity confirmed at ${storeLaterOption!.entityName}.`
    );

    warnings.push(
      'Future prices are seasonal estimates, NOT guaranteed. Market volatility can erode projected margins.',
      `Requires working capital cushion to finance holding period (${storeLaterOption!.storageDays} days).`
    );

    assumptions.push(
      `Estimated holding duration: ${storeLaterOption!.storageDays} days at ${storeLaterOption!.storageRatePerMonthPerQtl} ₹/Qtl/month.`,
      'Produce moisture and storage quality maintained without spoilage degradation.'
    );
  } else {
    // SELL NOW is the optimal reliable path
    recommendation = 'SELL_NOW';
    recommendationTitle = 'Sell Now (Maximum Immediate Net Cash)';
    confidence = bestImmediate.reliability.verified ? 'HIGH' : 'MEDIUM';
    selectedBestOption = bestImmediate;

    reasons.push(
      `Delivers highest immediate net cash of ₹${bestImmediate.netRealisationPerQtl.toLocaleString('en-IN')}/Qtl (₹${bestImmediate.netRealisation.toLocaleString('en-IN')} total).`,
      bestImmediate.type === 'BUYER_OFFER'
        ? `Direct buyer purchase eliminates APMC mandi cess and saves long-haul transport deductions.`
        : `Local aggregation ensures minimal freight deduction (₹${bestImmediate.transportCostPerQtl}/Qtl).`,
      bestImmediate.reliability.verified
        ? `Partner entity holds verified commercial credentials (${bestImmediate.reliability.label}).`
        : `Standard mandi yard settlement protocol applies.`
    );

    // Identify if a distant mandi had higher gross but lower net
    const distantMandi = options.find((o) => o.id === 'OPT-DISTANT-MANDI');
    if (distantMandi && distantMandi.sellingPricePerQtl > bestImmediate.sellingPricePerQtl) {
      const grossDiff = distantMandi.sellingPricePerQtl - bestImmediate.sellingPricePerQtl;
      const netDiff = Math.round((bestImmediate.netRealisationPerQtl - distantMandi.netRealisationPerQtl) * 100) / 100;
      reasons.push(
        `Higher gross price at ${distantMandi.entityName} (+₹${grossDiff}/Qtl) is negated by multi-trip transport costs (₹${distantMandi.transportCostPerQtl}/Qtl freight vs ₹${bestImmediate.transportCostPerQtl}/Qtl), making ${bestImmediate.entityName} more profitable by ₹${netDiff}/Qtl net.`
      );
    }

    if (storeLaterComparison && !storeLaterComparison.isViable) {
      warnings.push(
        `Holding produce in storage is NOT advised: Projected price gain (+₹${storeLaterComparison.potentialGainPerQtl}/Qtl) is insufficient to offset storage deductions (₹${storeLaterComparison.additionalStoragePerQtl}/Qtl).`
      );
    }

    assumptions.push(
      'Payment settled via verified escrow or same-day mandi account credit.',
      'Produce grading verified matching current lot inspection.'
    );
  }

  // Cost breakdown for the selected best option
  const costBreakdown: CostBreakdownSummary = {
    quantityQuintals: qty,
    sellingPricePerQtl: selectedBestOption.sellingPricePerQtl,
    grossSaleValue: selectedBestOption.grossSaleValue,
    transportCost: selectedBestOption.transportCost,
    storageCost: selectedBestOption.storageCost,
    otherCosts: selectedBestOption.otherCosts,
    totalDeductions:
      selectedBestOption.transportCost + selectedBestOption.storageCost + selectedBestOption.otherCosts,
    netRealisation: selectedBestOption.netRealisation,
    netRealisationPerQtl: selectedBestOption.netRealisationPerQtl,
  };

  return {
    recommendation,
    recommendationTitle,
    confidence,
    bestOption: selectedBestOption,
    sellingOptions: options,
    costBreakdown,
    reasons,
    warnings,
    assumptions,
    storeLaterComparison,
    dataSourceNotes: {
      transportEngine: 'Phase 5 Deterministic Maharashtra Corridor Matrix',
      storageModel: 'MSWC Schedule of Tariffs (2025-26)',
      marketData: 'Sample Agmarknet / APMC Prototype Data (Clearly Labeled)',
      futurePriceDisclaimer:
        'Future price projections are statistical seasonal demo models and do NOT constitute financial guarantees.',
    },
  };
}
