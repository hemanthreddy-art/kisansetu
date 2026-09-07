import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { submitTransactionRating, RolePair } from '@/lib/transactions';

/**
 * GET /api/ratings
 * Retrieve ratings filtered by transactionId, raterId, or rateeId.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const raterId = searchParams.get('raterId');
    const rateeId = searchParams.get('rateeId');

    const where: Record<string, unknown> = {};
    if (transactionId) where.transactionId = transactionId;
    if (raterId) where.raterId = raterId;
    if (rateeId) where.rateeId = rateeId;

    const ratings = await db.rating.findMany({
      where,
      include: {
        rater: true,
        ratee: true,
        transaction: {
          select: {
            id: true,
            transactionCode: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: ratings,
      count: ratings.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching ratings:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch ratings';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/ratings
 * Submit a transaction-linked 3-way rating.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, raterId, rateeId, rolePair, ratingScore, feedback } = body;

    if (!transactionId || !raterId || !rateeId || !rolePair || ratingScore === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'transactionId, raterId, rateeId, rolePair, and ratingScore (1-5) are required.',
        },
        { status: 400 }
      );
    }

    const rating = await submitTransactionRating({
      transactionId,
      raterId,
      rateeId,
      rolePair: rolePair as RolePair,
      ratingScore: Number(ratingScore),
      feedback,
    });

    return NextResponse.json({
      success: true,
      rating,
      message: 'Rating recorded successfully.',
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error submitting rating:', error);
    const msg = error instanceof Error ? error.message : 'Failed to submit rating';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
