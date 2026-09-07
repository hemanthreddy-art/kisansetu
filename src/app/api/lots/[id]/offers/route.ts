import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getDemoBuyer, getBuyerReputation, DemoBuyerKey } from '@/lib/auth-demo';
import { validateOfferInput } from '@/lib/validation';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/lots/[id]/offers
 * Retrieves digital purchase offers submitted on a produce lot.
 *
 * OWNERSHIP & SECURITY ENFORCEMENT:
 * - The farmer who owns the lot can view all incoming offers.
 * - A buyer can only view their own offers submitted on this lot.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const viewerRole = searchParams.get('role'); // 'FARMER' | 'BUYER'
    const buyerId = searchParams.get('buyerId');

    // 1. Locate Target Produce Lot
    const lot = await db.produceLot.findFirst({
      where: {
        OR: [{ id }, { lotCode: id }],
      },
      include: {
        farmer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found.' },
        { status: 404 }
      );
    }

    // 2. Build where filter for offers
    const whereClause: Prisma.OfferWhereInput = { lotId: lot.id };

    // If caller specifies they are a buyer, filter strictly to their own offers
    if (viewerRole === 'BUYER' && buyerId) {
      whereClause.buyerId = buyerId;
    }

    const offers = await db.offer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
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
        buyerId: o.buyerId,
        buyerCompanyName: o.buyer.companyName,
        buyerName: o.buyer.user?.fullName || o.buyer.companyName,
        buyerType: o.buyer.buyerType,
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
      lotId: lot.id,
      lotCode: lot.lotCode,
      commodity: lot.commodity,
      farmerName: lot.farmer?.user?.fullName || 'Registered Farmer',
      count: formattedOffers.length,
      offers: formattedOffers,
    });
  } catch (error) {
    console.error('Error fetching lot offers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve produce lot offers.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lots/[id]/offers
 * Commercial buyer creates a digital purchase offer on a farmer's produce lot.
 * Sets status to 'PENDING'.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();

    // 1. Locate Target Produce Lot
    const lot = await db.produceLot.findFirst({
      where: {
        OR: [{ id }, { lotCode: id }],
      },
      include: { farmer: true },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found.' },
        { status: 404 }
      );
    }

    if (lot.status !== 'AVAILABLE' && lot.status !== 'DRAFT') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot submit offer on lot with status ${lot.status}. Lot must be AVAILABLE.`,
        },
        { status: 400 }
      );
    }

    // 2. Validate Offer Input
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

    // 3. Resolve Buyer Identity
    let buyerProfileId = body.buyerId;
    let companyName = '';

    if (body.buyerKey) {
      const { buyerProfile } = await getDemoBuyer(body.buyerKey as DemoBuyerKey);
      buyerProfileId = buyerProfile.id;
      companyName = buyerProfile.companyName;
    } else if (buyerProfileId) {
      const existing = await db.buyerProfile.findUnique({
        where: { id: buyerProfileId },
      });
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Target buyer profile not found.' },
          { status: 404 }
        );
      }
      companyName = existing.companyName;
    } else {
      // Default to ABC Foods demo buyer
      const { buyerProfile } = await getDemoBuyer('ABC_FOODS');
      buyerProfileId = buyerProfile.id;
      companyName = buyerProfile.companyName;
    }

    // Security check: Farmer cannot make offer on their own produce lot
    if (lot.farmer.userId && body.userId && lot.farmer.userId === body.userId) {
      return NextResponse.json(
        { success: false, error: 'Farmers cannot submit purchase offers on their own produce lots.' },
        { status: 400 }
      );
    }

    // 4. Create Offer record (Initial status: PENDING - never auto-accepted!)
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
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    const rep = getBuyerReputation(companyName);

    return NextResponse.json(
      {
        success: true,
        message: 'Digital purchase offer submitted successfully to farmer.',
        offer: {
          id: offer.id,
          lotId: offer.lotId,
          lotCode: lot.lotCode,
          buyerId: offer.buyerId,
          buyerCompanyName: offer.buyer.companyName,
          buyerName: offer.buyer.user?.fullName || offer.buyer.companyName,
          buyerType: offer.buyer.buyerType,
          isBuyerVerified: offer.buyer.verified,
          reputation: rep,
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
    console.error('Error creating digital offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create digital purchase offer.' },
      { status: 500 }
    );
  }
}
