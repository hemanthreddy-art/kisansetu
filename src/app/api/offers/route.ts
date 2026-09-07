import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getDemoBuyer, getBuyerReputation, DemoBuyerKey } from '@/lib/auth-demo';

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
    const lotId = searchParams.get('lotId');
    const status = searchParams.get('status');

    const whereClause: Prisma.OfferWhereInput = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (lotId) {
      whereClause.lotId = lotId;
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
