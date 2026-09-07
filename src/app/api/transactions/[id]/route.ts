import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateTransactionStatus, updatePaymentStatus, TransactionStatus, PaymentStatus } from '@/lib/transactions';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/transactions/[id]
 * Fetch single transaction details with full relations.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const callerId = searchParams.get('callerId') || searchParams.get('userId');

    // Find transaction by either primary cuid id or human-readable transactionCode
    const transaction = await db.transaction.findFirst({
      where: {
        OR: [{ id }, { transactionCode: id }],
      },
      include: {
        lot: {
          include: {
            farmer: { include: { user: true } },
            physicalVerifications: {
              include: { inspector: true },
              orderBy: { verifiedAt: 'desc' },
            },
            aiAssessments: {
              orderBy: { assessedAt: 'desc' },
            },
            transportRequests: {
              include: {
                transporter: true,
                vehicle: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        farmer: { include: { user: true } },
        buyer: { include: { user: true } },
        transporter: {
          include: {
            user: true,
            vehicles: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        ratings: {
          include: {
            rater: true,
            ratee: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        disputes: {
          include: {
            raisedBy: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: `Transaction ${id} not found.` },
        { status: 404 }
      );
    }

    // Server-side authorization check if caller identity provided
    if (role && callerId) {
      const isFarmer =
        role === 'FARMER' &&
        (callerId === transaction.farmer.userId || callerId === transaction.farmerId);
      const isBuyer =
        role === 'BUYER' &&
        (callerId === transaction.buyer.userId || callerId === transaction.buyerId);
      const isTransporter =
        role === 'TRANSPORTER' &&
        (callerId === transaction.transporter?.userId ||
          callerId === transaction.transporterId);
      const isAdmin = role === 'ADMIN';

      if (!isFarmer && !isBuyer && !isTransporter && !isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You are not authorized to view this transaction.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error: unknown) {
    console.error('Error fetching transaction detail:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch transaction';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/transactions/[id]
 * Updates transaction status or payment status.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, paymentId, paymentStatus, role = 'FARMER', callerId, profileId } = body;

    // Locate transaction
    const existing = await db.transaction.findFirst({
      where: {
        OR: [{ id }, { transactionCode: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Transaction ${id} not found.` },
        { status: 404 }
      );
    }

    // 1. If paymentStatus update is requested
    if (paymentId && paymentStatus) {
      const updatedPayment = await updatePaymentStatus(
        paymentId,
        paymentStatus as PaymentStatus,
        { role, userId: callerId }
      );
      return NextResponse.json({
        success: true,
        payment: updatedPayment,
        message: `Payment status updated to ${paymentStatus}.`,
      });
    }

    // 2. If transaction status update is requested
    if (status) {
      const updatedTxn = await updateTransactionStatus(
        existing.id,
        status as TransactionStatus,
        { role, userId: callerId, profileId }
      );
      return NextResponse.json({
        success: true,
        transaction: updatedTxn,
        message: `Transaction status updated to ${status}.`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'No update parameters provided (status or paymentStatus required).' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Error updating transaction:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update transaction';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
