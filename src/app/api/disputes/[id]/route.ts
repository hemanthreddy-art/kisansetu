import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTransactionDispute, DisputeStatus } from '@/lib/transactions';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/disputes/[id]
 * Fetch single dispute details.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    const dispute = await db.dispute.findFirst({
      where: {
        OR: [{ id }, { disputeCode: id }],
      },
      include: {
        raisedBy: true,
        transaction: {
          include: {
            farmer: { include: { user: true } },
            buyer: { include: { user: true } },
            transporter: { include: { user: true } },
            lot: {
              include: {
                physicalVerifications: true,
                aiAssessments: true,
                transportRequests: true,
              },
            },
            payments: true,
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: `Dispute ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      dispute,
    });
  } catch (error: unknown) {
    console.error('Error fetching dispute detail:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch dispute';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/disputes/[id]
 * Adjudicate or resolve dispute (Authorized Admin only).
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, resolutionNotes, role, adminUserId } = body;

    // Only ADMIN or authorized officer can adjudicate disputes
    if (role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only authorized administrators can adjudicate disputes.' },
        { status: 403 }
      );
    }

    if (!status || !resolutionNotes || resolutionNotes.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'status and detailed resolutionNotes (minimum 10 characters explaining the decision/reason) are required.' },
        { status: 400 }
      );
    }

    const existing = await db.dispute.findFirst({
      where: {
        OR: [{ id }, { disputeCode: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Dispute ${id} not found.` },
        { status: 404 }
      );
    }

    const resolved = await resolveTransactionDispute({
      disputeId: existing.id,
      targetStatus: status as DisputeStatus,
      resolutionNotes,
      adminUserId,
    });

    return NextResponse.json({
      success: true,
      dispute: resolved,
      message: `Dispute updated to ${status}.`,
    });
  } catch (error: unknown) {
    console.error('Error resolving dispute:', error);
    const msg = error instanceof Error ? error.message : 'Failed to resolve dispute';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
