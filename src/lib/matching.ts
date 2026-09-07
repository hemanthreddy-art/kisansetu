import { DemandMatchResult } from '@/types';
import { getBuyerReputation } from './auth-demo';

export interface MatchingLot {
  id: string;
  lotCode: string;
  commodity: string;
  variety?: string | null;
  quantityQuintals: number;
  expectedPricePerQuintal: number;
  expectedGrade?: string | null;
  locationDistrict: string;
  location?: string | null;
  readyForPickupDate: Date | string;
  aiAssessments?: Array<{
    status: string;
    estimatedGrade: string;
    confidenceScore: number;
    assessedAt: Date | string;
  }>;
  physicalVerifications?: Array<{
    status: string;
    officialGrade: string;
    certificateNumber: string;
    moisturePercentage?: number | null;
    foreignMatterPerc?: number | null;
    verifiedAt: Date | string;
  }>;
}

export interface MatchingDemand {
  id: string;
  buyerId: string;
  commodity: string;
  variety?: string | null;
  requiredQuantityQtl: number;
  unit?: string;
  targetPricePerQtl: number;
  minPricePerQtl?: number | null;
  maxPricePerQtl?: number | null;
  destinationDistrict: string;
  deliveryLocation?: string | null;
  deliveryDeadline: Date | string;
  requiredGrade?: string | null;
  qualityRequirements?: string | null;
  description?: string | null;
  status: string;
  buyer: {
    id: string;
    companyName: string;
    buyerType: string;
    verified: boolean;
    user?: {
      fullName?: string;
    };
  };
}

/**
 * Calculates a transparent, weighted rule-based match score between a Farmer's ProduceLot
 * and an active BuyerDemand in Maharashtra.
 *
 * Scoring Breakdown (Total: 100 points):
 * 1. Crop Compatibility: 30 pts (Gatekeeper - mismatch drops score to 0)
 * 2. Quality & Grade Compatibility: 20 pts (Official physical vs AI non-binding screening)
 * 3. Price Compatibility: 15 pts (Expected lot price vs Buyer target budget)
 * 4. Quantity Compatibility: 15 pts (Volume alignment)
 * 5. Timeline / Deadline: 10 pts (Pickup readiness vs Delivery deadline)
 * 6. Location / Freight Corridor: 10 pts (Intra-district vs State trade corridor)
 */
export function calculateDemandMatch(
  lot: MatchingLot,
  demand: MatchingDemand
): DemandMatchResult {
  const positiveReasons: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // ----------------------------------------------------
  // 1. CROP COMPATIBILITY (30 PTS - GATEKEEPER)
  // ----------------------------------------------------
  const lotCrop = (lot.commodity || '').trim().toLowerCase();
  const demandCrop = (demand.commodity || '').trim().toLowerCase();

  if (lotCrop !== demandCrop) {
    warnings.push(`✗ Crop mismatch: Lot is ${lot.commodity}, but buyer demand requires ${demand.commodity}`);
    const rep = getBuyerReputation(demand.buyer.companyName);
    return {
      demandId: demand.id,
      buyerId: demand.buyerId,
      buyerName: demand.buyer.user?.fullName || demand.buyer.companyName,
      companyName: demand.buyer.companyName,
      buyerType: demand.buyer.buyerType,
      isBuyerVerified: demand.buyer.verified,
      reputation: rep,
      commodity: demand.commodity,
      variety: demand.variety || undefined,
      requiredQuantityQtl: demand.requiredQuantityQtl,
      targetPricePerQtl: demand.targetPricePerQtl,
      minPricePerQtl: demand.minPricePerQtl || undefined,
      maxPricePerQtl: demand.maxPricePerQtl || undefined,
      destinationDistrict: demand.destinationDistrict,
      deliveryDeadline: new Date(demand.deliveryDeadline).toISOString(),
      requiredGrade: demand.requiredGrade || undefined,
      qualityRequirements: demand.qualityRequirements || undefined,
      description: demand.description || undefined,
      matchScore: 0,
      matchGrade: 'POOR',
      positiveReasons: [],
      warnings,
      qualityStatus: 'NOT_GRADED',
    };
  }

  score += 30;
  positiveReasons.push(`✓ Crop matches: ${lot.commodity}`);

  // Variety bonus / confirmation
  if (demand.variety && lot.variety) {
    if (lot.variety.toLowerCase().includes(demand.variety.toLowerCase()) ||
        demand.variety.toLowerCase().includes(lot.variety.toLowerCase())) {
      positiveReasons.push(`✓ Variety matches: ${lot.variety}`);
    }
  }

  // ----------------------------------------------------
  // 2. QUALITY & GRADE COMPATIBILITY (20 PTS)
  // Strict Two-Tier Quality Separation:
  // - Physically Verified: Full official weight
  // - AI Assessment — Not Verified: Capped preliminary estimate
  // ----------------------------------------------------
  const latestPhysical = lot.physicalVerifications?.[0];
  const latestAi = lot.aiAssessments?.[0];

  let qualityStatus: 'PHYSICALLY_VERIFIED' | 'AI_ASSESSMENT_NOT_VERIFIED' | 'NOT_GRADED' = 'NOT_GRADED';
  let qualityCertificate: string | undefined = undefined;

  const requiredGrade = (demand.requiredGrade || 'Grade A').trim();

  if (latestPhysical && latestPhysical.status === 'PHYSICALLY_VERIFIED') {
    qualityStatus = 'PHYSICALLY_VERIFIED';
    qualityCertificate = latestPhysical.certificateNumber;
    const officialGrade = latestPhysical.officialGrade;

    if (officialGrade.toLowerCase() === requiredGrade.toLowerCase() ||
        (officialGrade.toLowerCase().includes('grade a') && requiredGrade.toLowerCase().includes('grade b'))) {
      score += 20;
      positiveReasons.push(
        `✓ Official ${officialGrade} verified by certified inspector (Cert: ${qualityCertificate})`
      );
    } else {
      score += 12;
      warnings.push(
        `⚠ Certified grade is ${officialGrade}, while buyer requested ${requiredGrade}`
      );
    }
  } else if (latestAi) {
    qualityStatus = 'AI_ASSESSMENT_NOT_VERIFIED';
    // AI assessment cannot declare official trade grade; award capped preliminary points
    score += 10;
    positiveReasons.push(
      `ℹ Preliminary visual screening suggests ${latestAi.estimatedGrade} (AI Assessment — Not Verified; physical assay pending)`
    );
  } else {
    qualityStatus = 'NOT_GRADED';
    score += 5;
    warnings.push('ℹ Produce has not undergone official quality grading');
  }

  // ----------------------------------------------------
  // 3. PRICE COMPATIBILITY (15 PTS)
  // ----------------------------------------------------
  const lotPrice = lot.expectedPricePerQuintal;
  const buyerTarget = demand.targetPricePerQtl;
  const buyerMax = demand.maxPricePerQtl || buyerTarget * 1.15;

  if (lotPrice <= buyerTarget) {
    score += 15;
    positiveReasons.push(
      `✓ Farmer expected price (₹${lotPrice}/Qtl) is within buyer target budget (₹${buyerTarget}/Qtl)`
    );
  } else if (lotPrice <= buyerMax) {
    score += 10;
    const premium = (((lotPrice - buyerTarget) / buyerTarget) * 100).toFixed(1);
    positiveReasons.push(
      `✓ Price (₹${lotPrice}/Qtl) is within buyer negotiable ceiling (+${premium}% above target)`
    );
  } else {
    const diff = (((lotPrice - buyerTarget) / buyerTarget) * 100).toFixed(0);
    score += 3;
    warnings.push(
      `⚠ Farmer expected price (₹${lotPrice}/Qtl) is ${diff}% higher than buyer target (₹${buyerTarget}/Qtl)`
    );
  }

  // ----------------------------------------------------
  // 4. QUANTITY COMPATIBILITY (15 PTS)
  // ----------------------------------------------------
  const lotQty = lot.quantityQuintals;
  const demandQty = demand.requiredQuantityQtl;
  const ratio = lotQty / demandQty;

  if (ratio >= 0.5 && ratio <= 1.5) {
    score += 15;
    positiveReasons.push(
      `✓ Lot volume (${lotQty} Qtl) closely matches buyer demand (${demandQty} Qtl)`
    );
  } else if (ratio >= 0.2 && ratio <= 3.0) {
    score += 10;
    if (ratio < 0.5) {
      positiveReasons.push(
        `✓ Lot can fulfill ${(ratio * 100).toFixed(0)}% of buyer requirement (${lotQty}/${demandQty} Qtl)`
      );
    } else {
      positiveReasons.push(
        `✓ Lot offers ample volume for buyer procurement requirement (${lotQty} Qtl available)`
      );
    }
  } else {
    score += 5;
    warnings.push(
      `ℹ Significant volume gap: Lot is ${lotQty} Qtl vs demand of ${demandQty} Qtl`
    );
  }

  // ----------------------------------------------------
  // 5. TIMELINE / DEADLINE COMPATIBILITY (10 PTS)
  // ----------------------------------------------------
  const pickupDate = new Date(lot.readyForPickupDate);
  const deadlineDate = new Date(demand.deliveryDeadline);

  if (!isNaN(pickupDate.getTime()) && !isNaN(deadlineDate.getTime())) {
    const msDiff = deadlineDate.getTime() - pickupDate.getTime();
    const daysBuffer = msDiff / (1000 * 60 * 60 * 24);

    if (daysBuffer >= 2) {
      score += 10;
      positiveReasons.push(
        `✓ Ready for pickup ${Math.floor(daysBuffer)} days before buyer delivery deadline`
      );
    } else if (daysBuffer >= 0) {
      score += 7;
      positiveReasons.push('✓ Harvest readiness timing aligns with delivery deadline');
    } else {
      score += 0;
      warnings.push('⚠ Produce ready date is after buyer delivery deadline');
    }
  } else {
    score += 5;
  }

  // ----------------------------------------------------
  // 6. LOCATION / FREIGHT CORRIDOR (10 PTS)
  // ----------------------------------------------------
  const origin = (lot.locationDistrict || '').trim().toLowerCase();
  const destination = (demand.destinationDistrict || '').trim().toLowerCase();

  // Primary Maharashtra agricultural trade corridors
  const majorCorridors: Record<string, string[]> = {
    nashik: ['pune', 'mumbai', 'thane', 'palghar', 'ahmednagar', 'dhule', 'jalgaon'],
    pune: ['nashik', 'mumbai', 'thane', 'solapur', 'satara', 'ahmednagar', 'kolhapur'],
    solapur: ['pune', 'osmanabad', 'latur', 'sangli', 'ahmednagar', 'mumbai'],
    mumbai: ['nashik', 'pune', 'thane', 'raigad', 'palghar'],
  };

  if (origin === destination) {
    score += 10;
    positiveReasons.push(
      `✓ Same district intra-hub trade (${lot.locationDistrict}), minimizing transport overhead`
    );
  } else if (majorCorridors[origin]?.includes(destination) || majorCorridors[destination]?.includes(origin)) {
    score += 7;
    positiveReasons.push(
      `✓ High-frequency Maharashtra trade corridor (${lot.locationDistrict} ↔ ${demand.destinationDistrict})`
    );
  } else {
    score += 4;
    positiveReasons.push(
      `✓ Inter-district delivery within Maharashtra (${lot.locationDistrict} to ${demand.destinationDistrict})`
    );
  }

  // Ensure score stays in 0 - 100 range
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let matchGrade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'POOR';
  if (finalScore >= 85) matchGrade = 'EXCELLENT';
  else if (finalScore >= 70) matchGrade = 'GOOD';
  else if (finalScore >= 50) matchGrade = 'FAIR';

  const reputation = getBuyerReputation(demand.buyer.companyName);

  return {
    demandId: demand.id,
    buyerId: demand.buyerId,
    buyerName: demand.buyer.user?.fullName || demand.buyer.companyName,
    companyName: demand.buyer.companyName,
    buyerType: demand.buyer.buyerType,
    isBuyerVerified: demand.buyer.verified,
    reputation,
    commodity: demand.commodity,
    variety: demand.variety || undefined,
    requiredQuantityQtl: demand.requiredQuantityQtl,
    targetPricePerQtl: demand.targetPricePerQtl,
    minPricePerQtl: demand.minPricePerQtl || undefined,
    maxPricePerQtl: demand.maxPricePerQtl || undefined,
    destinationDistrict: demand.destinationDistrict,
    deliveryDeadline: deadlineDate.toISOString(),
    requiredGrade: demand.requiredGrade || undefined,
    qualityRequirements: demand.qualityRequirements || undefined,
    description: demand.description || undefined,
    matchScore: finalScore,
    matchGrade,
    positiveReasons,
    warnings,
    qualityStatus,
    qualityCertificate,
  };
}
