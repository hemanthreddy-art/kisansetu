import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDemandMatch, MatchingLot, MatchingDemand } from '@/lib/matching';
import { seedDemoBuyers, DEMO_BUYERS_CONFIG } from '@/lib/auth-demo';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * Seed realistic Maharashtra buyer procurement demands if table is empty.
 */
async function ensureSampleDemands() {
  const count = await db.buyerDemand.count();
  if (count > 0) return;

  await seedDemoBuyers();

  const buyers = await db.buyerProfile.findMany();
  const buyerMap = new Map(buyers.map((b) => [b.companyName, b.id]));

  const sampleDemands = [
    // 1. ABC Foods (Pune - Food Processor) -> Red Onion demand
    {
      company: DEMO_BUYERS_CONFIG.ABC_FOODS.companyName,
      commodity: 'Onion',
      variety: 'Nashik Red',
      requiredQuantityQtl: 100,
      unit: 'Quintal',
      targetPricePerQtl: 2400,
      minPricePerQtl: 2100,
      maxPricePerQtl: 2600,
      destinationDistrict: 'Pune',
      deliveryLocation: 'ABC Food Processing Plant, Hadapsar, Pune',
      deliveryDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      requiredGrade: 'Grade A',
      qualityRequirements: 'Moisture < 13%, dry outer skin, bulb size 50-65mm',
      description: 'Dehydration & puree processing grade. Prefer sorted farmgate pickup.',
    },
    // 2. Nashik Fresh Processors (Nashik - Wholesale & Processing) -> Red Onion demand
    {
      company: DEMO_BUYERS_CONFIG.NASHIK_FRESH.companyName,
      commodity: 'Onion',
      variety: 'Garva / Red',
      requiredQuantityQtl: 150,
      unit: 'Quintal',
      targetPricePerQtl: 2350,
      minPricePerQtl: 2000,
      maxPricePerQtl: 2500,
      destinationDistrict: 'Nashik',
      deliveryLocation: 'Nashik Fresh Packhouse, Pimpalgaon Baswant',
      deliveryDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      requiredGrade: 'Grade A',
      qualityRequirements: 'Standard market FAQ / Grade A. No rot or sprouting.',
      description: 'Immediate procurement for Mumbai wholesale distribution.',
    },
    // 3. Maharashtra Agro Exports (Navi Mumbai - Exporter) -> Export Grade Onion
    {
      company: DEMO_BUYERS_CONFIG.MAHA_EXPORTS.companyName,
      commodity: 'Onion',
      variety: 'Nashik Red Garva',
      requiredQuantityQtl: 250,
      unit: 'Quintal',
      targetPricePerQtl: 2550,
      minPricePerQtl: 2300,
      maxPricePerQtl: 2750,
      destinationDistrict: 'Thane',
      deliveryLocation: 'APEDA Cold Store & Export Hub, Vashi, Navi Mumbai',
      deliveryDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      requiredGrade: 'Grade A',
      qualityRequirements: 'Export Quality: Moisture 10-12%, sorting done, zero skin peel, certified assaying mandatory',
      description: 'Gulf export shipment. Physical MSAMB inspection certificate required.',
    },
    // 4. Pune Institutional Foods (Pune - Institutional) -> Soybean demand
    {
      company: DEMO_BUYERS_CONFIG.PUNE_INSTITUTIONAL.companyName,
      commodity: 'Soybean',
      variety: 'JS-335',
      requiredQuantityQtl: 80,
      unit: 'Quintal',
      targetPricePerQtl: 4800,
      minPricePerQtl: 4500,
      maxPricePerQtl: 5000,
      destinationDistrict: 'Pune',
      deliveryLocation: 'Central Kitchen Depot, Bhosari MIDC, Pune',
      deliveryDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      requiredGrade: 'Grade A',
      qualityRequirements: 'Moisture < 12%, foreign matter < 1%',
      description: 'Direct procurement for institutional midday meal supply.',
    },
    // 5. ABC Foods -> Tomato demand
    {
      company: DEMO_BUYERS_CONFIG.ABC_FOODS.companyName,
      commodity: 'Tomato',
      variety: 'Abhinav / Hybrid',
      requiredQuantityQtl: 60,
      unit: 'Quintal',
      targetPricePerQtl: 1600,
      minPricePerQtl: 1400,
      maxPricePerQtl: 1800,
      destinationDistrict: 'Pune',
      deliveryLocation: 'ABC Food Processing Plant, Hadapsar, Pune',
      deliveryDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      requiredGrade: 'Grade B',
      qualityRequirements: 'Ketchup processing standard. Firm, ripe red coloration.',
      description: 'Tomato paste manufacturing run.',
    },
  ];

  for (const item of sampleDemands) {
    const buyerId = buyerMap.get(item.company);
    if (buyerId) {
      await db.buyerDemand.create({
        data: {
          buyerId,
          commodity: item.commodity,
          variety: item.variety,
          requiredQuantityQtl: item.requiredQuantityQtl,
          unit: item.unit,
          targetPricePerQtl: item.targetPricePerQtl,
          minPricePerQtl: item.minPricePerQtl,
          maxPricePerQtl: item.maxPricePerQtl,
          destinationDistrict: item.destinationDistrict,
          deliveryLocation: item.deliveryLocation,
          deliveryDeadline: item.deliveryDeadline,
          requiredGrade: item.requiredGrade,
          qualityRequirements: item.qualityRequirements,
          description: item.description,
          status: 'ACTIVE',
          isActive: true,
        },
      });
    }
  }
}

/**
 * GET /api/lots/[id]/matches
 * Matches a farmer's ProduceLot against all active commercial BuyerDemands in Maharashtra.
 * Returns transparent weighted match scores with reasons checklist.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    // 1. Fetch Target Produce Lot with Two-Tier Quality records
    const lot = await db.produceLot.findFirst({
      where: {
        OR: [{ id }, { lotCode: id }],
      },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
        aiAssessments: {
          orderBy: { assessedAt: 'desc' },
          take: 1,
        },
        physicalVerifications: {
          orderBy: { verifiedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found.' },
        { status: 404 }
      );
    }

    // 2. Ensure sample prototype demands exist in database
    await ensureSampleDemands();

    // 3. Query all ACTIVE buyer demands
    const demands = await db.buyerDemand.findMany({
      where: {
        status: 'ACTIVE',
        isActive: true,
      },
      include: {
        buyer: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Run rule-based matching engine
    const allMatches = demands.map((demand) =>
      calculateDemandMatch(lot as unknown as MatchingLot, demand as unknown as MatchingDemand)
    );

    // 5. Sort matches: Highest match score first
    allMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Relevant matches (score > 0)
    const compatibleMatches = allMatches.filter((m) => m.matchScore > 0);

    const latestPhysical = lot.physicalVerifications[0];
    const latestAi = lot.aiAssessments[0];

    const qualityLabel = latestPhysical && latestPhysical.status === 'PHYSICALLY_VERIFIED'
      ? 'Physically Verified'
      : latestAi
      ? 'AI Assessment — Not Verified'
      : 'Not Graded Yet';

    return NextResponse.json({
      success: true,
      lotSummary: {
        id: lot.id,
        lotCode: lot.lotCode,
        commodity: lot.commodity,
        variety: lot.variety,
        quantityQuintals: lot.quantityQuintals,
        expectedPricePerQuintal: lot.expectedPricePerQuintal,
        expectedGrade: lot.expectedGrade,
        locationDistrict: lot.locationDistrict,
        location: lot.location,
        readyForPickupDate: lot.readyForPickupDate,
        qualityStatus: latestPhysical?.status === 'PHYSICALLY_VERIFIED'
          ? 'PHYSICALLY_VERIFIED'
          : latestAi
          ? 'AI_ASSESSMENT_NOT_VERIFIED'
          : 'NOT_GRADED',
        qualityLabel,
        qualityCertificate: latestPhysical?.certificateNumber || null,
      },
      totalDemandsScanned: demands.length,
      matchCount: compatibleMatches.length,
      matches: compatibleMatches,
      allEvaluatedMatches: allMatches,
    });
  } catch (error) {
    console.error('Error matching produce lot to buyer demands:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute buyer demand matches.' },
      { status: 500 }
    );
  }
}
