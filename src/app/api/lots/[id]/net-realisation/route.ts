import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seedDemoStorageFacilities } from '@/lib/auth-demo';
import { evaluateSellingOptionsAndRecommend } from '@/lib/recommendation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const holdingDaysParam = searchParams.get('holdingDays');
    const customHoldingDays = holdingDaysParam ? parseInt(holdingDaysParam, 10) : 25;

    // Support lookup by either cuid id or lotCode
    const lot = await db.produceLot.findFirst({
      where: {
        OR: [{ id }, { lotCode: id }],
      },
      include: {
        farmer: true,
        offers: {
          include: {
            buyer: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        physicalVerifications: {
          include: {
            inspector: true,
          },
          orderBy: { verifiedAt: 'desc' },
        },
        aiAssessments: {
          orderBy: { assessedAt: 'desc' },
        },
      },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found' },
        { status: 404 }
      );
    }

    // Auto-seed storage facilities if table is empty
    await seedDemoStorageFacilities();

    // Map Prisma lot and offers to recommendation engine input
    const recommendationResult = evaluateSellingOptionsAndRecommend({
      lot: {
        id: lot.id,
        lotCode: lot.lotCode,
        commodity: lot.commodity,
        variety: lot.variety,
        quantityQuintals: lot.quantityQuintals,
        expectedPricePerQuintal: lot.expectedPricePerQuintal,
        expectedPrice: lot.expectedPrice,
        locationDistrict: lot.locationDistrict || lot.farmer?.district || 'Nashik',
        locationTaluka: lot.locationTaluka || lot.farmer?.taluka || 'Niphad',
        location: lot.location || lot.farmer?.village || 'Pimpalgaon Baswant',
        status: lot.status,
      },
      offers: lot.offers.map((o) => ({
        id: o.id,
        offeredPricePerQtl: o.offeredPricePerQtl,
        quantityQuintals: o.quantityQuintals,
        status: o.status,
        buyer: o.buyer
          ? {
              companyName: o.buyer.companyName,
              verified: o.buyer.verified,
              registeredState: o.buyer.registeredState,
              operatingCities: o.buyer.operatingCities,
              reputationScore: 4.8,
              completedTradesCount: 48,
              paymentPunctualityPercent: 98,
            }
          : null,
      })),
      customHoldingDays,
    });

    // Quality context (Tier 1 vs Tier 2)
    const latestPhysical = lot.physicalVerifications?.[0];
    const latestAi = lot.aiAssessments?.[0];
    const qualityContext = {
      isPhysicallyVerified: !!latestPhysical && latestPhysical.status === 'PHYSICALLY_VERIFIED',
      grade: latestPhysical?.officialGrade || latestAi?.estimatedGrade || 'Grade A',
      certificateNumber: latestPhysical?.certificateNumber || null,
      aiNotice: latestPhysical
        ? null
        : 'AI Assessment — Not Verified. Preliminary visual estimate only.',
    };

    return NextResponse.json({
      success: true,
      lot: {
        id: lot.id,
        lotCode: lot.lotCode,
        commodity: lot.commodity,
        variety: lot.variety,
        quantityQuintals: lot.quantityQuintals,
        expectedPricePerQuintal: lot.expectedPricePerQuintal,
        locationDistrict: lot.locationDistrict || lot.farmer?.district || 'Nashik',
        status: lot.status,
        qualityContext,
      },
      ...recommendationResult,
    });
  } catch (error: unknown) {
    console.error('Error computing Net Realisation analysis:', error);
    const msg = error instanceof Error ? error.message : 'Failed to compute Net Realisation';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
