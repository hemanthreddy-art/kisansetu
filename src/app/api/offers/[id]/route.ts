import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getBuyerReputation } from '@/lib/auth-demo';
import { validateOfferStatusUpdate } from '@/lib/validation';
import { createTransactionFromOffer } from '@/lib/transactions';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/offers/[id]
 * Retrieves single digital offer details.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    const offer = await db.offer.findUnique({
      where: { id },
      include: {
        lot: {
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

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found.' },
        { status: 404 }
      );
    }

    const rep = getBuyerReputation(offer.buyer.companyName);

    return NextResponse.json({
      success: true,
      offer: {
        id: offer.id,
        lotId: offer.lotId,
        lotCode: offer.lot.lotCode,
        commodity: offer.lot.commodity,
        variety: offer.lot.variety,
        farmerName: offer.lot.farmer?.user?.fullName || 'Registered Farmer',
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
        updatedAt: offer.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve offer details.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/offers/[id]
 * Updates offer status (ACCEPTED, REJECTED, CANCELLED).
 *
 * OWNERSHIP & ROLE AUTHORIZATION:
 * - Farmer who owns the lot can ACCEPT or REJECT an offer.
 *   (Accepting also sets ProduceLot status to RESERVED).
 * - Buyer who created the offer can CANCEL their pending offer.
 * - Buyers cannot accept their own offers.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();

    const targetStatus = (body.status || '').trim().toUpperCase();
    const role = (body.role || 'FARMER').trim().toUpperCase(); // 'FARMER' | 'BUYER'
    const callerId = body.callerId; // farmerId or buyerId

    const validation = validateOfferStatusUpdate(targetStatus);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 1. Locate Offer with Lot and Farmer info
    const offer = await db.offer.findUnique({
      where: { id },
      include: {
        lot: {
          include: {
            farmer: true,
          },
        },
        buyer: true,
      },
    });

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found.' },
        { status: 404 }
      );
    }

    // 2. Authorization & Role Checks
    if (targetStatus === 'ACCEPTED' || targetStatus === 'REJECTED') {
      // Only the Farmer who owns the lot can accept or reject an offer
      if (role === 'BUYER') {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Buyers cannot accept or reject offers.' },
          { status: 403 }
        );
      }

      if (callerId && callerId !== offer.lot.farmerId && callerId !== offer.lot.farmer.userId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only decide on offers for your own produce lot.' },
          { status: 403 }
        );
      }

      if (offer.status !== 'PENDING') {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot ${targetStatus.toLowerCase()} offer. Current status is already ${offer.status}.`,
          },
          { status: 400 }
        );
      }

      // Perform update in transaction
      const [updatedOffer] = await db.$transaction([
        db.offer.update({
          where: { id },
          data: {
            status: targetStatus,
            notes: body.notes ? `${offer.notes ? offer.notes + ' | ' : ''}${body.notes}` : offer.notes,
          },
        }),
        // If ACCEPTED, mark the produce lot as RESERVED
        ...(targetStatus === 'ACCEPTED'
          ? [
              db.produceLot.update({
                where: { id: offer.lotId },
                data: { status: 'RESERVED' },
              }),
            ]
          : []),
      ]);

      let transaction = null;
      if (targetStatus === 'ACCEPTED') {
        try {
          transaction = await createTransactionFromOffer(id);
        } catch (txnErr) {
          console.error('Auto transaction creation error:', txnErr);
        }
      }

      return NextResponse.json({
        success: true,
        message:
          targetStatus === 'ACCEPTED'
            ? `Offer accepted. Produce lot ${offer.lot.lotCode} is now RESERVED for ${offer.buyer.companyName}. Transaction activated.`
            : `Offer rejected.`,
        offer: updatedOffer,
        transaction,
      });
    }

    if (targetStatus === 'CANCELLED') {
      // Buyer cancels their own offer
      if (callerId && callerId !== offer.buyerId && callerId !== offer.buyer.userId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only cancel your own purchase offers.' },
          { status: 403 }
        );
      }

      if (offer.status !== 'PENDING') {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot cancel offer with status ${offer.status}. Only PENDING offers can be cancelled.`,
          },
          { status: 400 }
        );
      }

      const updatedOffer = await db.offer.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: body.notes ? `${offer.notes ? offer.notes + ' | ' : ''}Cancelled: ${body.notes}` : offer.notes,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Offer cancelled successfully by buyer.',
        offer: updatedOffer,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported status transition to ${targetStatus}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update offer status.' },
      { status: 500 }
    );
  }
}
