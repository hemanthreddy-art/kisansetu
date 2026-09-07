import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDemoFarmer } from '@/lib/auth-demo';
import { Prisma } from '@prisma/client';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/lots/[id]
 * Retrieves a single produce lot if owned by the demo farmer.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { farmerProfile } = await getDemoFarmer();
    const { id } = params;

    // Search by either internal id or human-readable lotCode
    const lot = await db.produceLot.findFirst({
      where: {
        farmerId: farmerProfile.id,
        OR: [{ id }, { lotCode: id }],
      },
      include: {
        offers: true,
        aiAssessments: true,
        physicalVerifications: true,
        transportRequests: true,
      },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lot,
    });
  } catch (error) {
    console.error('Error fetching produce lot details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/lots/[id]
 * Updates editable fields of an existing produce lot.
 * Strictly forbids altering lotCode, id, farmerId, or createdAt.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { farmerProfile } = await getDemoFarmer();
    const { id } = params;
    const body = await request.json();

    // 1. Check if lot exists and belongs to the farmer
    const existingLot = await db.produceLot.findFirst({
      where: {
        farmerId: farmerProfile.id,
        OR: [{ id }, { lotCode: id }],
      },
    });

    if (!existingLot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found or access denied.' },
        { status: 404 }
      );
    }

    // 2. Validate and prepare editable fields
    const updateData: Prisma.ProduceLotUpdateInput = {};

    // Unit
    let activeUnit = existingLot.unit;
    if (body.unit !== undefined) {
      const u = String(body.unit).trim();
      if (!['Quintal', 'Tonnes', 'Kg'].includes(u)) {
        return NextResponse.json(
          { success: false, error: 'Unit must be Quintal, Tonnes, or Kg.' },
          { status: 400 }
        );
      }
      activeUnit = u;
      updateData.unit = u;
    }

    // Quantity
    let activeQuantity = existingLot.quantity;
    if (body.quantity !== undefined) {
      const q = Number(body.quantity);
      if (isNaN(q) || q <= 0) {
        return NextResponse.json(
          { success: false, error: 'Quantity must be greater than 0.' },
          { status: 400 }
        );
      }
      activeQuantity = q;
      updateData.quantity = q;
    }

    // Recalculate standardized Quintals
    if (body.quantity !== undefined || body.unit !== undefined) {
      let qtl = activeQuantity;
      if (activeUnit === 'Tonnes') qtl = activeQuantity * 10;
      if (activeUnit === 'Kg') qtl = activeQuantity * 0.01;
      updateData.quantityQuintals = qtl;
    }

    // Expected Price
    let activePrice = existingLot.expectedPrice;
    if (body.expectedPrice !== undefined) {
      const p = Number(body.expectedPrice);
      if (isNaN(p) || p < 0) {
        return NextResponse.json(
          { success: false, error: 'Expected price cannot be negative.' },
          { status: 400 }
        );
      }
      activePrice = p;
      updateData.expectedPrice = p;
    }

    // Recalculate normalized Price per Quintal
    if (body.expectedPrice !== undefined || body.unit !== undefined) {
      let pricePerQtl = activePrice;
      if (activeUnit === 'Tonnes') pricePerQtl = activePrice / 10;
      if (activeUnit === 'Kg') pricePerQtl = activePrice * 100;
      updateData.expectedPricePerQuintal = pricePerQtl;
    }

    // Grade
    if (body.expectedGrade !== undefined) {
      const validGrades = ['A', 'B', 'C', 'Not Graded Yet'];
      if (!validGrades.includes(body.expectedGrade)) {
        return NextResponse.json(
          { success: false, error: 'Invalid grade selected.' },
          { status: 400 }
        );
      }
      updateData.expectedGrade = body.expectedGrade;
    }

    // Availability Date
    if (body.availabilityDate !== undefined) {
      const d = new Date(body.availabilityDate);
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid availability date.' },
          { status: 400 }
        );
      }
      updateData.readyForPickupDate = d;
    }

    // Location
    if (body.location !== undefined) {
      const loc = String(body.location).trim();
      if (!loc) {
        return NextResponse.json(
          { success: false, error: 'Location cannot be empty.' },
          { status: 400 }
        );
      }
      updateData.location = loc;
    }

    // District
    if (body.district !== undefined) {
      const dist = String(body.district).trim();
      if (!dist) {
        return NextResponse.json(
          { success: false, error: 'District cannot be empty.' },
          { status: 400 }
        );
      }
      updateData.locationDistrict = dist;
    }

    // Description
    if (body.description !== undefined) {
      updateData.description = String(body.description).trim() || null;
    }

    // Status
    if (body.status !== undefined) {
      const validStatuses = ['DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD', 'CANCELLED'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status specified.' },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    // 3. Persist update in database
    const updatedLot = await db.produceLot.update({
      where: { id: existingLot.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Produce lot ${updatedLot.lotCode} updated successfully.`,
      data: updatedLot,
    });
  } catch (error) {
    console.error('Error updating produce lot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update produce lot.' },
      { status: 500 }
    );
  }
}
