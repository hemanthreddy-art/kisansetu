import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = [
  'REQUESTED',
  'ACCEPTED',
  'REJECTED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const transportRequest = await db.transportRequest.findUnique({
      where: { id },
      include: {
        lot: true,
        transporter: {
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
        vehicle: true,
      },
    });

    if (!transportRequest) {
      return NextResponse.json(
        { success: false, error: 'Transport request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transportRequest,
    });
  } catch (error: unknown) {
    console.error('Error fetching transport request:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch transport request';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, notes, scheduledPickup } = body;

    const existing = await db.transportRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Transport request not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          },
          { status: 400 }
        );
      }
      updateData.status = status;

      // Automatically set delivery timestamp on delivery completion
      if (status === 'DELIVERED' && !existing.actualDelivery) {
        updateData.actualDelivery = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes ? String(notes).trim() : null;
    }

    if (scheduledPickup) {
      const parsedDate = new Date(scheduledPickup);
      if (!isNaN(parsedDate.getTime())) {
        updateData.scheduledPickup = parsedDate;
      }
    }

    const updated = await db.transportRequest.update({
      where: { id },
      data: updateData,
      include: {
        lot: true,
        transporter: true,
        vehicle: true,
      },
    });

    return NextResponse.json({
      success: true,
      transportRequest: updated,
      message: `Transport request updated to ${updated.status}`,
    });
  } catch (error: unknown) {
    console.error('Error updating transport request:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update transport request';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transport-requests/[id]
 * Cancels and removes a transport request.
 * Strictly prevents cancellation if involved in active transit/delivery/transaction.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existing = await db.transportRequest.findUnique({
      where: { id },
      include: {
        lot: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Transport request not found' },
        { status: 404 }
      );
    }

    // Active delivery prevention
    if (['IN_TRANSIT', 'DELIVERED'].includes(existing.status)) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove while transaction is active' },
        { status: 400 }
      );
    }

    // Check if associated lot is part of an active transaction
    if (existing.lot?.transactions?.some((tx) => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(tx.status))) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove while transaction is active' },
        { status: 400 }
      );
    }

    const updated = await db.transportRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Transport request cancelled successfully',
      transportRequest: updated,
    });
  } catch (error: unknown) {
    console.error('Error deleting transport request:', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete transport request';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

