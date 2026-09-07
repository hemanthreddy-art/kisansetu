import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { raiseTransactionDispute, DisputeReason } from '@/lib/transactions';

/**
 * GET /api/disputes
 * List disputes with optional filters.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const raisedById = searchParams.get('raisedById');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (transactionId) where.transactionId = transactionId;
    if (raisedById) where.raisedById = raisedById;
    if (status) where.status = status;

    const disputes = await db.dispute.findMany({
      where,
      include: {
        raisedBy: true,
        transaction: {
          include: {
            farmer: { include: { user: true } },
            buyer: { include: { user: true } },
            lot: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: disputes,
      count: disputes.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching disputes:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch disputes';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/disputes
 * Raise an evidence-based trade dispute.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, raisedById, reason, evidenceSummary, evidenceFilesJson } = body;

    if (!transactionId || !raisedById || !reason || !evidenceSummary) {
      return NextResponse.json(
        {
          success: false,
          error: 'transactionId, raisedById, reason, and evidenceSummary are required.',
        },
        { status: 400 }
      );
    }

    const dispute = await raiseTransactionDispute({
      transactionId,
      raisedById,
      reason: reason as DisputeReason,
      evidenceSummary,
      evidenceFilesJson,
    });

    return NextResponse.json({
      success: true,
      dispute,
      message: `Dispute ${dispute.disputeCode} registered. An authorized grievance officer will review the digital evidence.`,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error raising dispute:', error);
    const msg = error instanceof Error ? error.message : 'Failed to raise dispute';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
