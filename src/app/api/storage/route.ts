import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEMO_STORAGE_FACILITIES } from '@/lib/auth-demo';

export const dynamic = 'force-dynamic';

interface RawFacility {
  id?: string;
  name?: string;
  facilityType?: string;
  district?: string;
  state?: string;
  totalCapacityTonnes?: number;
  availableCapacityTonnes?: number;
  ratePerQuintalPerMonth?: number;
  contactPhone?: string;
}

export async function GET() {
  try {
    let facilities: RawFacility[] = [];
    try {
      facilities = (await db.storageFacility.findMany()) as RawFacility[];
    } catch {
      facilities = [];
    }

    // Fallback to seeded demo facilities if database empty
    const sourceList: RawFacility[] = facilities.length > 0 ? facilities : (DEMO_STORAGE_FACILITIES as RawFacility[]);

    const distances = [8.4, 14.2, 28.5, 11.6, 16.8, 42.0, 36.5, 52.0, 44.0, 31.5, 19.2, 58.0, 48.0, 64.0, 72.0];

    const enriched = sourceList.map((f: RawFacility, idx: number) => {
      const isCold = f.facilityType === 'COLD_STORAGE';
      const isChawl = f.facilityType === 'VENTILATED_CHAWL';
      const isScientific = f.facilityType === 'SCIENTIFIC_CHAWL';
      const dist = distances[idx] || Number((10 + idx * 3.7).toFixed(1));

      const typeLabel = isCold
        ? 'Cold Storage'
        : isScientific
        ? 'Scientific Onion Storage'
        : isChawl
        ? 'Ventilated Onion Chawl'
        : 'Dry Warehouse';

      const suitableCrops = isCold
        ? ['Tomato', 'Grapes', 'Potato', 'Pomegranate', 'Vegetables']
        : isScientific
        ? ['Onion', 'Garlic', 'Pulses']
        : isChawl
        ? ['Onion', 'Garlic']
        : ['Soybean', 'Wheat', 'Maize', 'Paddy / Rice', 'Pulses', 'Gram'];

      const tempRange = isCold
        ? '0°C to 4°C (90-95% RH Multi-Chamber)'
        : isScientific
        ? 'Forced Draft Aeration (22-26°C, <65% RH)'
        : isChawl
        ? 'Natural Air-Cooled Racks (Ambient)'
        : 'Moisture-Proof Dry Storage (Ambient 18-28°C)';

      const recommendedDuration = isCold
        ? '15 to 90 Days'
        : isScientific
        ? '2 to 6 Months'
        : isChawl
        ? '1 to 4 Months'
        : '3 to 12 Months';

      const operator = f.name?.includes('Sahyadri')
        ? 'Sahyadri Farmers Producer Co. & MSAMB'
        : f.name?.includes('Baramati')
        ? 'Baramati Agro Cold Chain Logistics'
        : f.name?.includes('APMC')
        ? 'APMC Co-operative Market Committee'
        : 'Maharashtra State Warehousing Corporation (MSWC)';

      return {
        id: f.id || `storage-fac-${idx + 1}`,
        name: f.name || 'MSWC Warehouse',
        facilityType: f.facilityType || 'DRY_WAREHOUSE',
        typeLabel,
        district: f.district || 'Nashik',
        state: f.state || 'Maharashtra',
        distanceKm: dist,
        totalCapacityTonnes: f.totalCapacityTonnes || 5000,
        availableCapacityTonnes: f.availableCapacityTonnes || 3200,
        availableCapacityQuintals: Math.round((f.availableCapacityTonnes || 3200) * 10),
        ratePerQuintalPerMonth: f.ratePerQuintalPerMonth || 45,
        dailyRatePerQuintal: Number(((f.ratePerQuintalPerMonth || 45) / 30).toFixed(2)),
        contactPhone: f.contactPhone || '+91 98224 40001',
        operator,
        suitableCrops,
        tempRange,
        recommendedDuration,
        wdraCertified: true,
        enwrEligible: true,
        status: 'AVAILABLE',
      };
    });

    return NextResponse.json({
      success: true,
      dataSource: 'MSWC_PROTOTYPE_NETWORK',
      disclaimer: 'Prototype storage facility discovery modeled on MSWC & APMC warehousing networks.',
      data: enriched,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch storage facilities';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
