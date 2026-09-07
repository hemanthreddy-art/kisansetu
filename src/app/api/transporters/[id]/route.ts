import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const transporter = await db.transporterProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        vehicles: true,
        transportRequests: {
          include: {
            lot: true,
            vehicle: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!transporter) {
      return NextResponse.json(
        { success: false, error: 'Transporter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transporter,
    });
  } catch (error: unknown) {
    console.error('Error fetching transporter details:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch transporter';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
