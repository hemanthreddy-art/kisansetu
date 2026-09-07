import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDemoFarmer } from '@/lib/auth-demo';
import { generateUniqueLotId } from '@/lib/lot-id';
import { validateLotInput } from '@/lib/validation';

/**
 * GET /api/lots
 * Retrieves produce lots belonging exclusively to the authenticated/demo farmer.
 */
export async function GET() {
  try {
    const { farmerProfile } = await getDemoFarmer();

    const lots = await db.produceLot.findMany({
      where: {
        farmerId: farmerProfile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        offers: {
          select: { id: true, status: true },
        },
      },
    });

    // Compute live summary statistics
    const totalLots = lots.length;
    const activeLots = lots.filter((lot) => lot.status === 'AVAILABLE').length;
    const draftLots = lots.filter((lot) => lot.status === 'DRAFT').length;
    const totalQuantityQuintals = lots
      .filter((lot) => lot.status === 'AVAILABLE')
      .reduce((sum, lot) => sum + lot.quantityQuintals, 0);
    const totalOffers = lots.reduce((sum, lot) => sum + (lot.offers?.length || 0), 0);
    const pendingOffers = lots.reduce(
      (sum, lot) => sum + (lot.offers?.filter((o) => o.status === 'PENDING').length || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: lots,
      metrics: {
        totalLots,
        activeLots,
        draftLots,
        totalQuantityQuintals: Math.round(totalQuantityQuintals * 10) / 10,
        totalOffers,
        pendingOffers,
      },
      farmer: {
        id: farmerProfile.id,
        district: farmerProfile.district,
        taluka: farmerProfile.taluka,
      },
    });
  } catch (error) {
    console.error('Error fetching produce lots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve produce lots' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lots
 * Creates a new Produce Lot for the farmer with server validation & unique Lot ID.
 */
export async function POST(request: NextRequest) {
  try {
    const { farmerProfile } = await getDemoFarmer();
    const body = await request.json();

    // 1. Server-side validation
    const validation = validateLotInput(body, false);
    if (!validation.isValid || !validation.cleanedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed. Please correct the highlighted fields.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { cleanedData } = validation;

    // 2. Generate unique human-readable Lot ID (e.g. KS-ONION-2026-0001)
    const lotId = await generateUniqueLotId(cleanedData.crop);

    // 3. Persist lot in SQLite database
    const newLot = await db.produceLot.create({
      data: {
        lotCode: lotId,
        farmerId: farmerProfile.id,
        commodity: cleanedData.crop,
        variety: cleanedData.variety || null,
        quantity: cleanedData.quantity,
        unit: cleanedData.unit,
        quantityQuintals: cleanedData.quantityQuintals,
        expectedPrice: cleanedData.expectedPrice,
        expectedPricePerQuintal: cleanedData.expectedPricePerQuintal,
        expectedGrade: cleanedData.expectedGrade,
        harvestDate: cleanedData.harvestDate,
        readyForPickupDate: cleanedData.availabilityDate,
        locationDistrict: cleanedData.district,
        location: cleanedData.location,
        description: cleanedData.description || null,
        status: cleanedData.status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Produce lot created successfully with Lot ID ${newLot.lotCode}`,
        lotId: newLot.lotCode,
        data: newLot,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating produce lot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create produce lot. Please try again.' },
      { status: 500 }
    );
  }
}
