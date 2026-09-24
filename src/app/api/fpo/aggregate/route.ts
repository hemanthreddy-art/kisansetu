import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get or find FPO
    let fpo = await db.fPO.findFirst({
      where: { registrationNumber: 'MH-NSK-FPO-2024-8841' },
    });

    if (!fpo) {
      fpo = await db.fPO.findFirst();
    }

    // 2. Fetch active corporate buyer demands seeking large quantities
    let demands: Record<string, unknown>[] = [];
    try {
      demands = (await db.buyerDemand.findMany({
        where: { status: 'ACTIVE' },
        take: 4,
      })) as unknown as Record<string, unknown>[];
    } catch {
      demands = [];
    }

    const corporateDemands = [
      {
        id: (demands[0]?.id as string) || 'dem-corp-itc',
        buyerName: 'ITC Agri Business Division',
        commodity: 'Onion',
        variety: 'Nashik Red (Dehydration Grade)',
        requiredQuantityQtl: 100,
        offerPricePerQtl: 2450,
        destination: 'Hadapsar, Pune Processing Hub',
        deliveryDeadline: 'Within 7 Days',
        specifications: 'Moisture < 13%, dry outer skin, uniform 45-60mm diameter',
        procurementType: 'CORPORATE_DIRECT',
      },
      {
        id: (demands[1]?.id as string) || 'dem-corp-haldiram',
        buyerName: 'Haldiram Snacks Pvt Ltd',
        commodity: 'Soybean',
        variety: 'JS-335 (Grade A)',
        requiredQuantityQtl: 150,
        offerPricePerQtl: 4850,
        destination: 'Nagpur Central Food Park',
        deliveryDeadline: 'Within 10 Days',
        specifications: 'Oil content > 18.5%, max moisture 10%',
        procurementType: 'CORPORATE_DIRECT',
      },
      {
        id: 'dem-corp-sahyadri',
        buyerName: 'Sahyadri Agro Exports',
        commodity: 'Tomato',
        variety: 'Abhinav / Seminis',
        requiredQuantityQtl: 80,
        offerPricePerQtl: 1950,
        destination: 'Mohadi Packhouse, Nashik',
        deliveryDeadline: 'Immediate (48 Hours)',
        specifications: 'Firm red, export grade packaging',
        procurementType: 'EXPORT_PACKHOUSE',
      },
    ];

interface ProduceLotWithFarmer {
  id: string;
  quantityQuintals: number;
  farmer?: {
    user?: {
      fullName?: string;
    };
  };
}

    // 3. Fetch eligible smallholder lots (< 40 Qtl)
    let dbLots: ProduceLotWithFarmer[] = [];
    try {
      dbLots = (await db.produceLot.findMany({
        where: {
          status: 'AVAILABLE',
          quantityQuintals: { lte: 45 },
        },
        include: { farmer: { include: { user: true } } },
        take: 6,
      })) as unknown as ProduceLotWithFarmer[];
    } catch {
      dbLots = [];
    }

    // Fallback/Seed eligible smallholder micro-lots for demo if DB lots are few
    const eligibleLots = [
      {
        id: dbLots[0]?.id || 'fpo-lot-s1',
        farmerName: dbLots[0]?.farmer?.user?.fullName || 'Ramesh Patil',
        village: 'Niphad, Nashik',
        commodity: 'Onion',
        variety: 'Nashik Red',
        quantityQuintals: dbLots[0]?.quantityQuintals || 20,
        individualMandiPrice: 2150,
        fpoPooledPrice: 2450,
        fpoPremiumPerQtl: 300,
        moisturePct: 11.8,
        status: 'AVAILABLE',
      },
      {
        id: dbLots[1]?.id || 'fpo-lot-s2',
        farmerName: 'Tukaram Shinde',
        village: 'Ozar, Nashik',
        commodity: 'Onion',
        variety: 'Nashik Red',
        quantityQuintals: 25,
        individualMandiPrice: 2180,
        fpoPooledPrice: 2450,
        fpoPremiumPerQtl: 270,
        moisturePct: 12.1,
        status: 'AVAILABLE',
      },
      {
        id: dbLots[2]?.id || 'fpo-lot-s3',
        farmerName: 'Sunita Gaikwad',
        village: 'Dindori, Nashik',
        commodity: 'Onion',
        variety: 'Nashik Red',
        quantityQuintals: 15,
        individualMandiPrice: 2140,
        fpoPooledPrice: 2450,
        fpoPremiumPerQtl: 310,
        moisturePct: 11.5,
        status: 'AVAILABLE',
      },
      {
        id: dbLots[3]?.id || 'fpo-lot-s4',
        farmerName: 'Dnyaneshwar Bhor',
        village: 'Sinnar, Nashik',
        commodity: 'Onion',
        variety: 'Nashik Red',
        quantityQuintals: 20,
        individualMandiPrice: 2160,
        fpoPooledPrice: 2450,
        fpoPremiumPerQtl: 290,
        moisturePct: 12.0,
        status: 'AVAILABLE',
      },
      {
        id: dbLots[4]?.id || 'fpo-lot-s5',
        farmerName: 'Baburao Kadam',
        village: 'Yeola, Nashik',
        commodity: 'Onion',
        variety: 'Nashik Red',
        quantityQuintals: 20,
        individualMandiPrice: 2150,
        fpoPooledPrice: 2450,
        fpoPremiumPerQtl: 300,
        moisturePct: 11.9,
        status: 'AVAILABLE',
      },
    ];

    return NextResponse.json({
      success: true,
      fpo: fpo || {
        name: 'Nashik Agro Farmer Producer Co. Ltd.',
        registrationNumber: 'MH-NSK-FPO-2024-8841',
        district: 'Nashik',
        taluka: 'Niphad',
        totalMembersCount: 428,
        contactPerson: 'Vilasrao Shinde',
      },
      corporateDemands,
      eligibleLots,
      stats: {
        totalLotsAggregatedSeason: 28,
        totalQuintalsAggregated: 2450,
        avgPriceImprovementPct: 14.2,
        totalFarmerPremiumPaidINR: 490000,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch FPO aggregation data';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lotIds, corporateBuyerName, pooledPricePerQtl = 2450, commodity = 'Onion' } = body;

    if (!lotIds || !Array.isArray(lotIds) || lotIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one micro-lot must be selected for aggregation' },
        { status: 400 }
      );
    }

    // Find FPO
    const fpo = await db.fPO.findFirst();
    const farmer = await db.farmerProfile.findFirst();

    if (!farmer) {
      return NextResponse.json(
        { success: false, error: 'No active farmer profile found' },
        { status: 400 }
      );
    }

    // Calculate aggregated quantity from selected lots
    const lotQuantitiesMap: Record<string, number> = {
      'fpo-lot-s1': 20,
      'fpo-lot-s2': 25,
      'fpo-lot-s3': 15,
      'fpo-lot-s4': 20,
      'fpo-lot-s5': 20,
    };

    let totalQuantity = 0;
    for (const id of lotIds) {
      totalQuantity += lotQuantitiesMap[id] || 20;
    }

    const finalPrice = Number(pooledPricePerQtl) || 2450;
    const finalValuation = totalQuantity * finalPrice;
    const pooledTransportSavings = Math.round(totalQuantity * 65); // ~₹65/Qtl freight saving on full 10T truck vs small tempos
    const fpoCollectiveBonus = Math.round(totalQuantity * 280); // ~₹280/Qtl premium over APMC local spot

    const newLotCode = `FPO-AGGR-${Date.now().toString().slice(-6)}`;

    const aggregatedLot = await db.produceLot.create({
      data: {
        lotCode: newLotCode,
        farmerId: farmer.id,
        fpoId: fpo ? fpo.id : undefined,
        commodity: commodity,
        variety: 'Nashik Red - FPO Pooled Grade A',
        quantity: totalQuantity,
        quantityQuintals: totalQuantity,
        unit: 'Quintal',
        expectedPricePerQuintal: finalPrice,
        expectedPrice: finalValuation,
        expectedGrade: 'Grade A',
        harvestDate: new Date(),
        readyForPickupDate: new Date(),
        locationDistrict: 'Nashik',
        locationTaluka: 'Niphad',
        locationVillage: 'Pimpalgaon / Lasalgaon Hub',
        description: `Aggregated bulk lot formed from ${lotIds.length} smallholder micro-lots by Nashik Agro FPO for corporate buyer ${corporateBuyerName || 'ITC Agri Business'}.`,
        status: 'AVAILABLE',
      },
    });

    // Mark any existing database lots as RESERVED
    try {
      await db.produceLot.updateMany({
        where: { id: { in: lotIds } },
        data: { status: 'RESERVED' },
      });
    } catch {
      // Non-critical if IDs were virtual demo lots
    }

    return NextResponse.json({
      success: true,
      message: 'FPO Micro-lots aggregated successfully into bulk corporate supply contract lot',
      aggregatedLot: {
        id: aggregatedLot.id,
        lotCode: aggregatedLot.lotCode,
        commodity: aggregatedLot.commodity,
        quantityQuintals: totalQuantity,
        expectedPricePerQuintal: finalPrice,
        totalValuation: finalValuation,
        pooledTransportSavings,
        fpoCollectiveBonus,
        sourceLotsCount: lotIds.length,
        status: aggregatedLot.status,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to create aggregated FPO lot';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
