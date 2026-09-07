/**
 * KisanSetu - Phase 5: Transport & Logistics Engine
 * Deterministic Maharashtra corridor distance matrix, transparent trip & freight cost formulas,
 * and rule-based vehicle ranking for agricultural dispatches.
 * 
 * NOTE: Feeds deterministic transport cost directly into Phase 6 Net Realisation:
 * Net Realisation = Gross Sale Value - Transport Cost - Storage Cost - Other Applicable Costs
 */

export interface DistanceCorridor {
  from: string;
  to: string;
  distanceKm: number;
}

// Deterministic inter-district and intra-district distances between Maharashtra agricultural clusters and mandis
export const MAHARASHTRA_DISTANCE_MATRIX: DistanceCorridor[] = [
  // Niphad Hub (Nashik District)
  { from: 'Niphad', to: 'Nashik', distanceKm: 40 },
  { from: 'Niphad', to: 'Lasalgaon', distanceKm: 25 },
  { from: 'Niphad', to: 'Pune', distanceKm: 210 },
  { from: 'Niphad', to: 'Mumbai', distanceKm: 195 },
  { from: 'Niphad', to: 'Thane', distanceKm: 185 },
  { from: 'Niphad', to: 'Chhatrapati Sambhaji Nagar', distanceKm: 155 },
  { from: 'Niphad', to: 'Ahmednagar', distanceKm: 150 },
  { from: 'Niphad', to: 'Solapur', distanceKm: 345 },
  { from: 'Niphad', to: 'Dhule', distanceKm: 120 },
  { from: 'Niphad', to: 'Jalgaon', distanceKm: 190 },

  // Lasalgaon Hub (Major Onion Mandi)
  { from: 'Lasalgaon', to: 'Nashik', distanceKm: 55 },
  { from: 'Lasalgaon', to: 'Pune', distanceKm: 220 },
  { from: 'Lasalgaon', to: 'Mumbai', distanceKm: 205 },
  { from: 'Lasalgaon', to: 'Thane', distanceKm: 195 },
  { from: 'Lasalgaon', to: 'Chhatrapati Sambhaji Nagar', distanceKm: 140 },
  { from: 'Lasalgaon', to: 'Ahmednagar', distanceKm: 160 },
  { from: 'Lasalgaon', to: 'Solapur', distanceKm: 360 },

  // Nashik City / District
  { from: 'Nashik', to: 'Pune', distanceKm: 205 },
  { from: 'Nashik', to: 'Mumbai', distanceKm: 165 },
  { from: 'Nashik', to: 'Thane', distanceKm: 155 },
  { from: 'Nashik', to: 'Chhatrapati Sambhaji Nagar', distanceKm: 160 },
  { from: 'Nashik', to: 'Ahmednagar', distanceKm: 155 },
  { from: 'Nashik', to: 'Dhule', distanceKm: 140 },
  { from: 'Nashik', to: 'Jalgaon', distanceKm: 225 },
  { from: 'Nashik', to: 'Solapur', distanceKm: 380 },
  { from: 'Nashik', to: 'Kolhapur', distanceKm: 420 },
  { from: 'Nashik', to: 'Nagpur', distanceKm: 650 },

  // Pune Market Yard / District
  { from: 'Pune', to: 'Mumbai', distanceKm: 150 },
  { from: 'Pune', to: 'Thane', distanceKm: 145 },
  { from: 'Pune', to: 'Chhatrapati Sambhaji Nagar', distanceKm: 235 },
  { from: 'Pune', to: 'Ahmednagar', distanceKm: 125 },
  { from: 'Pune', to: 'Solapur', distanceKm: 250 },
  { from: 'Pune', to: 'Kolhapur', distanceKm: 235 },
  { from: 'Pune', to: 'Satara', distanceKm: 110 },
  { from: 'Pune', to: 'Sangli', distanceKm: 230 },
  { from: 'Pune', to: 'Nagpur', distanceKm: 710 },

  // Chhatrapati Sambhaji Nagar (Marathwada Hub)
  { from: 'Chhatrapati Sambhaji Nagar', to: 'Jalna', distanceKm: 60 },
  { from: 'Chhatrapati Sambhaji Nagar', to: 'Mumbai', distanceKm: 335 },
  { from: 'Chhatrapati Sambhaji Nagar', to: 'Ahmednagar', distanceKm: 115 },
  { from: 'Chhatrapati Sambhaji Nagar', to: 'Solapur', distanceKm: 300 },
  { from: 'Chhatrapati Sambhaji Nagar', to: 'Akola', distanceKm: 240 },
  { from: 'Chhatrapati Sambhaji Nagar', to: 'Nanded', distanceKm: 260 },

  // Solapur Hub
  { from: 'Solapur', to: 'Kolhapur', distanceKm: 230 },
  { from: 'Solapur', to: 'Satara', distanceKm: 220 },
  { from: 'Solapur', to: 'Sangli', distanceKm: 185 },
  { from: 'Solapur', to: 'Ahmednagar', distanceKm: 225 },
  { from: 'Solapur', to: 'Latur', distanceKm: 125 },

  // Vidarbha Hubs
  { from: 'Akola', to: 'Nagpur', distanceKm: 250 },
  { from: 'Akola', to: 'Amravati', distanceKm: 95 },
  { from: 'Akola', to: 'Yavatmal', distanceKm: 150 },
  { from: 'Nagpur', to: 'Amravati', distanceKm: 155 },
  { from: 'Nagpur', to: 'Wardha', distanceKm: 75 },

  // Andhra Pradesh / Vizag Coastal Agricultural Corridors
  { from: 'Visakhapatnam', to: 'Anakapalle', distanceKm: 34 },
  { from: 'Visakhapatnam', to: 'Vizianagaram', distanceKm: 60 },
  { from: 'Visakhapatnam', to: 'Srikakulam', distanceKm: 105 },
  { from: 'Visakhapatnam', to: 'Bheemunipatnam', distanceKm: 32 },
  { from: 'Visakhapatnam', to: 'Pendurthi', distanceKm: 22 },
  { from: 'Visakhapatnam', to: 'Araku', distanceKm: 112 },
  { from: 'Visakhapatnam', to: 'Tuni', distanceKm: 102 },
  { from: 'Visakhapatnam', to: 'Kakinada', distanceKm: 152 },
  { from: 'Visakhapatnam', to: 'Rajahmundry', distanceKm: 190 },
  { from: 'Anakapalle', to: 'Vizianagaram', distanceKm: 85 },
  { from: 'Anakapalle', to: 'Kakinada', distanceKm: 120 },
  { from: 'Anakapalle', to: 'Tuni', distanceKm: 70 },
  { from: 'Vizianagaram', to: 'Srikakulam', distanceKm: 65 },
  { from: 'Vizianagaram', to: 'Araku', distanceKm: 115 },
  { from: 'Kakinada', to: 'Rajahmundry', distanceKm: 60 },
  { from: 'Tuni', to: 'Kakinada', distanceKm: 55 },
];

/**
 * Normalizes location or district name for robust corridor lookup.
 */
function normalizePlace(name: string): string {
  if (!name) return '';
  const clean = name.trim().toLowerCase();
  if (clean.includes('niphad')) return 'niphad';
  if (clean.includes('lasalgaon')) return 'lasalgaon';
  if (clean.includes('nashik') || clean.includes('nasik')) return 'nashik';
  if (clean.includes('pune') || clean.includes('pimpr')) return 'pune';
  if (clean.includes('mumbai') || clean.includes('vashi') || clean.includes('navi mumbai')) return 'mumbai';
  if (clean.includes('thane')) return 'thane';
  if (clean.includes('sambhaji') || clean.includes('aurangabad')) return 'chhatrapati sambhaji nagar';
  if (clean.includes('solapur') || clean.includes('sholapur')) return 'solapur';
  if (clean.includes('ahmednagar') || clean.includes('nagar')) return 'ahmednagar';
  if (clean.includes('kolhapur')) return 'kolhapur';
  if (clean.includes('satara')) return 'satara';
  if (clean.includes('sangli')) return 'sangli';
  if (clean.includes('akola')) return 'akola';
  if (clean.includes('nagpur')) return 'nagpur';
  if (clean.includes('amravati')) return 'amravati';
  if (clean.includes('jalna')) return 'jalna';
  if (clean.includes('jalgaon')) return 'jalgaon';
  if (clean.includes('dhule')) return 'dhule';
  if (clean.includes('latur')) return 'latur';
  if (clean.includes('nanded')) return 'nanded';
  // Vizag & Nearby Cities Normalization
  if (clean.includes('visakhapatnam') || clean.includes('vizag') || clean.includes('waltair')) return 'visakhapatnam';
  if (clean.includes('anakapalle') || clean.includes('anakapalli')) return 'anakapalle';
  if (clean.includes('vizianagaram')) return 'vizianagaram';
  if (clean.includes('srikakulam') || clean.includes('palasa')) return 'srikakulam';
  if (clean.includes('kakinada')) return 'kakinada';
  if (clean.includes('rajahmundry') || clean.includes('rajamahendravaram')) return 'rajahmundry';
  if (clean.includes('tuni')) return 'tuni';
  if (clean.includes('bheemunipatnam') || clean.includes('bheemili')) return 'bheemunipatnam';
  if (clean.includes('pendurthi')) return 'pendurthi';
  if (clean.includes('araku')) return 'araku';
  return clean;
}

/**
 * Returns deterministic distance in kilometers between two locations or districts in Maharashtra.
 */
export function getCorridorDistance(origin: string, destination: string): number {
  const normOrigin = normalizePlace(origin);
  const normDest = normalizePlace(destination);

  if (!normOrigin || !normDest) return 50;
  if (normOrigin === normDest) return 35; // Intra-district local mandi transit

  for (const c of MAHARASHTRA_DISTANCE_MATRIX) {
    const fromNorm = normalizePlace(c.from);
    const toNorm = normalizePlace(c.to);
    if (
      (normOrigin === fromNorm && normDest === toNorm) ||
      (normOrigin === toNorm && normDest === fromNorm)
    ) {
      return c.distanceKm;
    }
  }

  // Consistent regional fallback for unmapped corridors
  return 180;
}

/**
 * Calculates number of trips required for a produce lot:
 * Trips = Math.ceil(lotQuantityQuintals / vehicleCapacityQuintals)
 */
export function calculateTrips(quantityQuintals: number, vehicleCapacityQuintals: number): number {
  if (!vehicleCapacityQuintals || vehicleCapacityQuintals <= 0) return 1;
  const qty = Math.max(0, quantityQuintals);
  if (qty === 0) return 1;
  return Math.max(1, Math.ceil(qty / vehicleCapacityQuintals));
}

/**
 * Calculates deterministic estimated transport cost:
 * Estimated Cost = Trips × Distance (km) × Rate per km
 */
export function calculateTransportCost(trips: number, distanceKm: number, ratePerKm: number): number {
  const safeTrips = Math.max(1, trips);
  const safeDistance = Math.max(1, distanceKm);
  const safeRate = Math.max(1, ratePerKm);
  return Math.round(safeTrips * safeDistance * safeRate);
}

/**
 * Calculates freight cost per quintal for the produce lot:
 * Cost per Quintal = Estimated Transport Cost / Lot Quantity
 */
export function calculateCostPerQuintal(totalCost: number, quantityQuintals: number): number {
  if (!quantityQuintals || quantityQuintals <= 0) return 0;
  return Math.round((totalCost / quantityQuintals) * 100) / 100;
}

/**
 * Estimates transit turnaround time in hours based on corridor distance:
 * Turnaround = (Distance / 40 km/h) + 1.5 hr buffer for loading/unloading
 */
export function estimateTransitHours(distanceKm: number): number {
  return Math.round(((distanceKm / 40) + 1.5) * 10) / 10;
}

export interface TransportOption {
  transporterId: string;
  transporterName: string;
  commercialLicenseNo: string | null;
  verified: boolean;
  ratingScore: number;
  completedTripsCount: number;
  onTimeDeliveryPercent: number;
  operationalDistricts: string | null;

  vehicleId: string;
  vehicleName: string;
  vehicleType: string;
  registrationNumber: string;
  capacityTonnes: number;
  capacityQuintals: number;
  ratePerKm: number;
  isRefrigerated: boolean;
  isAvailable: boolean;

  pickupLocation: string;
  pickupDistrict: string;
  dropLocation: string;
  dropDistrict: string;
  distanceKm: number;

  lotQuantityQuintals: number;
  tripsRequired: number;
  estimatedCost: number;
  costPerQuintal: number;
  estimatedHours: number;

  matchScore: number;
  matchStrength: 'EXCELLENT' | 'GOOD' | 'FAIR';
  costEquation: string;
  reasons: string[];
  considerations: string[];
}

/**
 * Evaluates and ranks all available transporter fleet vehicles for a given produce lot and delivery destination.
 */
export function evaluateTransportOptions(params: {
  lot: {
    id: string;
    commodity: string;
    quantityQuintals: number;
    locationDistrict: string;
    locationTaluka?: string | null;
    location?: string | null;
  };
  destination: {
    location?: string;
    district: string;
  };
  transporters: Array<{
    id: string;
    businessName: string;
    commercialLicenseNo: string | null;
    verified: boolean;
    ratingScore?: number | null;
    completedTripsCount?: number | null;
    onTimeDeliveryPercent?: number | null;
    operationalDistricts?: string | null;
    vehicles: Array<{
      id: string;
      vehicleName?: string | null;
      vehicleType: string;
      registrationNumber: string;
      capacityTonnes: number;
      capacityQuintals?: number | null;
      ratePerKm: number;
      isRefrigerated: boolean;
      isAvailable: boolean;
    }>;
  }>;
  preferRefrigerated?: boolean;
}): TransportOption[] {
  const { lot, destination, transporters, preferRefrigerated } = params;
  const pickupDistrict = lot.locationDistrict || 'Nashik';
  const pickupLocation = lot.location || lot.locationTaluka || pickupDistrict;
  const dropDistrict = destination.district || 'Pune';
  const dropLocation = destination.location || dropDistrict;

  const distanceKm = getCorridorDistance(pickupDistrict, dropDistrict);
  const lotQty = lot.quantityQuintals || 10;
  const commodityLower = (lot.commodity || '').toLowerCase();
  const isPerishable = ['grapes', 'tomato', 'pomegranate', 'द्राक्षे', 'टोमॅटो', 'डाळिंब'].some((c) =>
    commodityLower.includes(c)
  );

  const options: TransportOption[] = [];

  for (const t of transporters) {
    const verified = !!t.verified;
    const rating = t.ratingScore ?? 4.5;
    const completedTrips = t.completedTripsCount ?? 20;
    const onTime = t.onTimeDeliveryPercent ?? 94;

    // Check operational districts coverage if specified
    const opDistricts = (t.operationalDistricts || '').toLowerCase();
    const coversPickup = !opDistricts || opDistricts.includes(pickupDistrict.toLowerCase()) || opDistricts.includes('all');
    const coversDrop = !opDistricts || opDistricts.includes(dropDistrict.toLowerCase()) || opDistricts.includes('all');

    for (const v of t.vehicles) {
      if (!v.isAvailable) continue;

      const vehicleCapacity = v.capacityQuintals ?? (v.capacityTonnes * 10);
      const vehicleName = v.vehicleName || `${v.vehicleType} (${vehicleCapacity} Qtl)`;
      const ratePerKm = v.ratePerKm || 35.0;

      const trips = calculateTrips(lotQty, vehicleCapacity);
      const estimatedCost = calculateTransportCost(trips, distanceKm, ratePerKm);
      const costPerQtl = calculateCostPerQuintal(estimatedCost, lotQty);
      const estHours = estimateTransitHours(distanceKm);

      const reasons: string[] = [];
      const considerations: string[] = [];
      let score = 50; // Baseline

      // 1. Capacity & Trip Efficiency (0 - 30 pts)
      if (trips === 1) {
        score += 25;
        reasons.push(`Single trip direct dispatch (${vehicleCapacity} Qtl capacity accommodates ${lotQty} Qtl lot without splitting)`);
      } else {
        score += Math.max(5, 20 - (trips - 2) * 5);
        considerations.push(`${trips} trips required due to ${vehicleCapacity} Qtl vehicle limit for ${lotQty} Qtl lot`);
      }

      // 2. Commercial Reputation & Verification (0 - 25 pts)
      if (verified) {
        score += 15;
        reasons.push(`RTO verified commercial transport permit (${t.commercialLicenseNo || 'Verified'})`);
      } else {
        considerations.push('Unverified transporter (credentials pending independent verification)');
      }

      if (rating >= 4.7 && onTime >= 95) {
        score += 10;
        reasons.push(`High reliability rating: ${rating} ★ with ${onTime}% on-time delivery across ${completedTrips} trips`);
      }

      // 3. Refrigeration Suitability
      if (v.isRefrigerated) {
        if (preferRefrigerated || isPerishable) {
          score += 10;
          reasons.push('Refrigerated cold-chain body preserves perishable quality');
        } else {
          reasons.push('Temperature-controlled reefer body equipped');
        }
      } else if (preferRefrigerated && isPerishable) {
        considerations.push('Non-refrigerated standard cargo body');
      }

      // 4. District Corridor Alignment
      if (coversPickup && coversDrop) {
        reasons.push(`Regular operational corridor covers ${pickupDistrict} to ${dropDistrict}`);
      } else if (!coversPickup || !coversDrop) {
        score -= 10;
        considerations.push(`Corridor outside standard operational routes (${t.operationalDistricts || 'Regional'})`);
      }

      // Clamp score
      const finalScore = Math.min(99, Math.max(35, Math.round(score)));
      let matchStrength: 'EXCELLENT' | 'GOOD' | 'FAIR' = 'FAIR';
      if (finalScore >= 80) matchStrength = 'EXCELLENT';
      else if (finalScore >= 65) matchStrength = 'GOOD';

      const costEquation = `${trips} trip${trips > 1 ? 's' : ''} × ${distanceKm} km × ₹${ratePerKm}/km = ₹${estimatedCost.toLocaleString('en-IN')}`;

      options.push({
        transporterId: t.id,
        transporterName: t.businessName,
        commercialLicenseNo: t.commercialLicenseNo,
        verified,
        ratingScore: rating,
        completedTripsCount: completedTrips,
        onTimeDeliveryPercent: onTime,
        operationalDistricts: t.operationalDistricts || null,

        vehicleId: v.id,
        vehicleName,
        vehicleType: v.vehicleType,
        registrationNumber: v.registrationNumber,
        capacityTonnes: v.capacityTonnes,
        capacityQuintals: vehicleCapacity,
        ratePerKm,
        isRefrigerated: v.isRefrigerated,
        isAvailable: v.isAvailable,

        pickupLocation,
        pickupDistrict,
        dropLocation,
        dropDistrict,
        distanceKm,

        lotQuantityQuintals: lotQty,
        tripsRequired: trips,
        estimatedCost,
        costPerQuintal: costPerQtl,
        estimatedHours: estHours,

        matchScore: finalScore,
        matchStrength,
        costEquation,
        reasons,
        considerations,
      });
    }
  }

  // Sort by match score descending, then by total estimated cost ascending
  return options.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.estimatedCost - b.estimatedCost;
  });
}
