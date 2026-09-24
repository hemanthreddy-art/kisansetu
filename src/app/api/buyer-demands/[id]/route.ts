import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getBuyerReputation, getDemoBuyer } from '@/lib/auth-demo';
import { validateBuyerDemandInput } from '@/lib/validation';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/buyer-demands/[id]
 * Retrieves a single commercial buyer demand with full profile and reputation specs.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    const demand = await db.buyerDemand.findUnique({
      where: { id },
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

    if (!demand) {
      return NextResponse.json(
        { success: false, error: 'Buyer demand not found.' },
        { status: 404 }
      );
    }

    const rep = getBuyerReputation(demand.buyer.companyName);

    return NextResponse.json({
      success: true,
      demand: {
        id: demand.id,
        buyerId: demand.buyerId,
        buyerName: demand.buyer.user?.fullName || demand.buyer.companyName,
        companyName: demand.buyer.companyName,
        buyerType: demand.buyer.buyerType,
        isBuyerVerified: demand.buyer.verified,
        reputation: rep,
        commodity: demand.commodity,
        variety: demand.variety,
        requiredQuantityQtl: demand.requiredQuantityQtl,
        unit: demand.unit,
        targetPricePerQtl: demand.targetPricePerQtl,
        minPricePerQtl: demand.minPricePerQtl,
        maxPricePerQtl: demand.maxPricePerQtl,
        destinationDistrict: demand.destinationDistrict,
        deliveryLocation: demand.deliveryLocation,
        deliveryDeadline: demand.deliveryDeadline,
        requiredGrade: demand.requiredGrade,
        qualityRequirements: demand.qualityRequirements,
        description: demand.description,
        status: demand.status,
        isActive: demand.isActive,
        createdAt: demand.createdAt,
        updatedAt: demand.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching buyer demand:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve buyer demand.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/buyer-demands/[id]
 * Updates demand status or parameters with ownership check.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await db.buyerDemand.findUnique({
      where: { id },
      include: { buyer: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Buyer demand not found.' },
        { status: 404 }
      );
    }

    // Ownership check: If caller provides buyerId, verify ownership
    if (body.buyerId && body.buyerId !== existing.buyerId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You can only modify your own buyer demands.' },
        { status: 403 }
      );
    }

    const validation = validateBuyerDemandInput(body, true);
    if (!validation.isValid || !validation.cleanedData) {
      return NextResponse.json(
        { success: false, error: 'Validation failed for update.', details: validation.errors },
        { status: 400 }
      );
    }

    const updateData: Prisma.BuyerDemandUpdateInput = {};
    if (body.status) {
      updateData.status = validation.cleanedData.status;
      updateData.isActive = validation.cleanedData.status === 'ACTIVE';
    }
    if (body.targetPricePerQtl) updateData.targetPricePerQtl = validation.cleanedData.targetPricePerQtl;
    if (body.requiredQuantityQtl) updateData.requiredQuantityQtl = validation.cleanedData.requiredQuantityQtl;
    if (body.deliveryDeadline) updateData.deliveryDeadline = validation.cleanedData.deliveryDeadline;
    if (body.description !== undefined) updateData.description = validation.cleanedData.description;

    const updated = await db.buyerDemand.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Buyer demand updated successfully.',
      demand: updated,
    });
  } catch (error) {
    console.error('Error updating buyer demand:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update buyer demand.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/buyer-demands/[id]
 * Removes an active buyer demand owned by the buyer.
 * Strictly prevents deletion if involved in active transaction/fulfillment.
 * Sets status to 'CANCELLED', isActive to false.
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const queryBuyerId = searchParams.get('buyerId');

    const existing = await db.buyerDemand.findUnique({
      where: { id },
      include: { buyer: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Buyer demand not found.' },
        { status: 404 }
      );
    }

    let defaultBuyerId: string | null = null;
    try {
      const demoBuyer = await getDemoBuyer();
      defaultBuyerId = demoBuyer.buyerProfile.id;
    } catch {
      // ignore
    }

    if (queryBuyerId && queryBuyerId !== existing.buyerId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You can only remove your own buyer demands.' },
        { status: 403 }
      );
    } else if (!queryBuyerId && defaultBuyerId && existing.buyerId !== defaultBuyerId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You can only remove your own buyer demands.' },
        { status: 403 }
      );
    }

    // Check if demand is fulfilled or involved in active transactions
    if (existing.status === 'FULFILLED') {
      return NextResponse.json(
        { success: false, error: 'Cannot remove while transaction is active' },
        { status: 400 }
      );
    }

    // Soft delete: status CANCELLED, isActive false
    const updated = await db.buyerDemand.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Buyer demand removed successfully.',
      demand: updated,
    });
  } catch (error) {
    console.error('Error removing buyer demand:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove buyer demand.' },
      { status: 500 }
    );
  }
}

