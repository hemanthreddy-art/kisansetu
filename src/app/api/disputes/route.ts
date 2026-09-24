import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { raiseTransactionDispute, DisputeReason } from '@/lib/transactions';

/**
 * GET /api/disputes
 * List disputes with optional filters and full relational trade context.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const raisedById = searchParams.get('raisedById');
    const status = searchParams.get('status');
    const roleParam = searchParams.get('role')?.toUpperCase();

    const where: Record<string, unknown> = {};
    if (transactionId) where.transactionId = transactionId;
    if (raisedById) where.raisedById = raisedById;
    if (status) where.status = status;

    let disputes = await db.dispute.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    if (roleParam) {
      disputes = disputes.filter((d) => {
        const farmerUserId = d.transaction?.farmer?.userId;
        const buyerUserId = d.transaction?.buyer?.userId;
        const transporterUserId = d.transaction?.transporter?.userId;
        const reporterId = d.raisedById;

        if (roleParam === 'FARMER') {
          return reporterId === farmerUserId || d.transaction?.farmerId != null;
        }
        if (roleParam === 'BUYER') {
          return reporterId === buyerUserId || d.transaction?.buyerId != null;
        }
        if (roleParam === 'TRANSPORTER') {
          return reporterId === transporterUserId || d.transaction?.transporterId != null;
        }
        return true;
      });
    }

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
    const { transactionId, raisedById, role, reason, evidenceSummary, evidenceFilesJson } = body;

    if (!transactionId || !reason || !evidenceSummary) {
      return NextResponse.json(
        {
          success: false,
          error: 'transactionId, reason, and evidenceSummary are required.',
        },
        { status: 400 }
      );
    }

    const dispute = await raiseTransactionDispute({
      transactionId,
      raisedById,
      role: role as 'FARMER' | 'BUYER' | 'TRANSPORTER' | undefined,
      reason: reason as DisputeReason,
      evidenceSummary,
      evidenceFilesJson:
        typeof evidenceFilesJson === 'string'
          ? evidenceFilesJson
          : evidenceFilesJson
          ? JSON.stringify(evidenceFilesJson)
          : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        dispute,
        message: `Dispute ${dispute.disputeCode} registered. An authorized grievance officer will review the digital evidence.`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error raising dispute:', error);
    const msg = error instanceof Error ? error.message : 'Failed to raise dispute';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
