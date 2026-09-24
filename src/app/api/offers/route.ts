import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getDemoFarmer, getDemoBuyer, getBuyerReputation, DemoBuyerKey } from '@/lib/auth-demo';
import { validateOfferInput } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/offers
 * Retrieves digital purchase offers with filtering by buyerKey, buyerId, lotId, or status.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerKey = searchParams.get('buyerKey');
    const buyerIdParam = searchParams.get('buyerId');
    const farmerIdParam = searchParams.get('farmerId');
    const roleParam = searchParams.get('role');
    const lotId = searchParams.get('lotId');
    const status = searchParams.get('status');

    const whereClause: Prisma.OfferWhereInput = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (lotId) {
      whereClause.lotId = lotId;
    }

    if (farmerIdParam) {
      whereClause.lot = { farmerId: farmerIdParam };
    } else if (roleParam === 'FARMER') {
      try {
        const { farmerProfile } = await getDemoFarmer();
        whereClause.lot = { farmerId: farmerProfile.id };
      } catch (err) {
        console.error('Error resolving farmer by role:', err);
      }
    }

    if (buyerKey) {
      try {
        const { buyerProfile } = await getDemoBuyer(buyerKey as DemoBuyerKey);
        whereClause.buyerId = buyerProfile.id;
      } catch (err) {
        console.error('Error resolving buyer by key:', err);
      }
    } else if (buyerIdParam) {
      whereClause.buyerId = buyerIdParam;
    }

    const offers = await db.offer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        lot: {
          select: {
            id: true,
            lotCode: true,
            commodity: true,
            variety: true,
            expectedGrade: true,
            quantity: true,
            unit: true,
            quantityQuintals: true,
            expectedPricePerQuintal: true,
            locationDistrict: true,
            status: true,
          },
        },
        buyer: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const formattedOffers = offers.map((o) => {
      const rep = getBuyerReputation(o.buyer.companyName);
      return {
        id: o.id,
        lotId: o.lotId,
        lotCode: o.lot.lotCode,
        commodity: o.lot.commodity,
        variety: o.lot.variety,
        lotGrade: o.lot.expectedGrade,
        lotStatus: o.lot.status,
        lotDistrict: o.lot.locationDistrict,
        buyerId: o.buyerId,
        buyerCompanyName: o.buyer.companyName,
        buyerName: o.buyer.user?.fullName || o.buyer.companyName,
        buyerType: o.buyer.buyerType,
        buyerLocation: o.buyer.operatingCities || o.buyer.registeredState || 'Pune APMC, Maharashtra',
        isBuyerVerified: o.buyer.verified,
        reputation: rep,
        offeredPricePerQtl: o.offeredPricePerQtl,
        quantityQuintals: o.quantityQuintals,
        totalOfferValue: o.offeredPricePerQtl * o.quantityQuintals,
        proposedPickupDate: o.proposedPickupDate,
        paymentTerms: o.paymentTerms,
        status: o.status,
        notes: o.notes,
        validUntil: o.validUntil,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedOffers.length,
      offers: formattedOffers,
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve offers.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/offers
 * Creates a digital purchase offer on a produce lot.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lotId = (body.lotId || '').trim();

    if (!lotId) {
      return NextResponse.json(
        { success: false, error: 'Target lotId is required to submit an offer.' },
        { status: 400 }
      );
    }

    const lot = await db.produceLot.findFirst({
      where: {
        OR: [{ id: lotId }, { lotCode: lotId }],
      },
      include: { farmer: true },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found.' },
        { status: 404 }
      );
    }

    const validation = validateOfferInput(body);
    if (!validation.isValid || !validation.cleanedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for purchase offer.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { cleanedData } = validation;

    let buyerProfileId = body.buyerId;
    if (body.buyerKey) {
      const { buyerProfile } = await getDemoBuyer(body.buyerKey as DemoBuyerKey);
      buyerProfileId = buyerProfile.id;
    } else if (buyerProfileId) {
      const existing = await db.buyerProfile.findUnique({
        where: { id: buyerProfileId },
      });
      if (!existing) {
        const { buyerProfile } = await getDemoBuyer('ABC_FOODS');
        buyerProfileId = buyerProfile.id;
      }
    } else {
      const { buyerProfile } = await getDemoBuyer('ABC_FOODS');
      buyerProfileId = buyerProfile.id;
    }

    const offer = await db.offer.create({
      data: {
        lotId: lot.id,
        buyerId: buyerProfileId,
        offeredPricePerQtl: cleanedData.offeredPricePerQtl,
        quantityQuintals: cleanedData.quantityQuintals,
        proposedPickupDate: cleanedData.proposedPickupDate,
        paymentTerms: cleanedData.paymentTerms,
        validUntil: cleanedData.validUntil,
        notes: cleanedData.notes,
        status: 'PENDING',
      },
      include: {
        buyer: {
          include: {
            user: {
              select: { fullName: true, phone: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Digital offer submitted with PENDING status.',
        offer: {
          id: offer.id,
          lotId: offer.lotId,
          buyerId: offer.buyerId,
          buyerCompanyName: offer.buyer.companyName,
          offeredPricePerQtl: offer.offeredPricePerQtl,
          quantityQuintals: offer.quantityQuintals,
          totalOfferValue: offer.offeredPricePerQtl * offer.quantityQuintals,
          proposedPickupDate: offer.proposedPickupDate,
          paymentTerms: offer.paymentTerms,
          status: offer.status,
          notes: offer.notes,
          validUntil: offer.validUntil,
          createdAt: offer.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create offer.' },
      { status: 500 }
    );
  }
}
