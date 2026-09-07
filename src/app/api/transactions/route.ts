import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createTransactionFromOffer } from '@/lib/transactions';
import { seedDemoTransactions } from '@/lib/auth-demo';

/**
 * GET /api/transactions
 * List transactions with server-side authorization and role filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const farmerId = searchParams.get('farmerId');
    const buyerId = searchParams.get('buyerId');
    const transporterId = searchParams.get('transporterId');
    const status = searchParams.get('status');
    const lotId = searchParams.get('lotId');

    // Auto-seed demo transactions if DB is empty
    await seedDemoTransactions();

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (lotId) {
      where.lotId = lotId;
    }

    // Server-side authorization & isolation
    if (role === 'FARMER') {
      if (userId) {
        where.farmer = { userId };
      } else if (farmerId) {
        where.farmerId = farmerId;
      }
    } else if (role === 'BUYER') {
      if (userId) {
        where.buyer = { userId };
      } else if (buyerId) {
        where.buyerId = buyerId;
      }
    } else if (role === 'TRANSPORTER') {
      if (userId) {
        where.transporter = { userId };
      } else if (transporterId) {
        where.transporterId = transporterId;
      }
    } else if (role === 'ADMIN') {
      // Admin can view all transactions
      if (farmerId) where.farmerId = farmerId;
      if (buyerId) where.buyerId = buyerId;
    } else {
      // Fallbacks if specific ID query parameters passed
      if (farmerId) where.farmerId = farmerId;
      if (buyerId) where.buyerId = buyerId;
      if (transporterId) where.transporterId = transporterId;
    }

    const transactions = await db.transaction.findMany({
      where,
      include: {
        lot: {
          include: {
            farmer: { include: { user: true } },
            physicalVerifications: true,
            aiAssessments: true,
            transportRequests: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        farmer: { include: { user: true } },
        buyer: { include: { user: true } },
        transporter: { include: { user: true } },
        payments: { orderBy: { createdAt: 'desc' } },
        ratings: true,
        disputes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching transactions:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch transactions';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/transactions
 * Create or activate a transaction from an accepted offer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId } = body;

    if (!offerId) {
      return NextResponse.json(
        { success: false, error: 'offerId is required to create a transaction.' },
        { status: 400 }
      );
    }

    const transaction = await createTransactionFromOffer(offerId);

    return NextResponse.json({
      success: true,
      transaction,
      message: `Transaction ${transaction.transactionCode} activated successfully.`,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating transaction:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create transaction';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
