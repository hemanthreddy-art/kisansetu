import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seedDemoTransporters } from '@/lib/auth-demo';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const verifiedParam = searchParams.get('verified');

    // Auto-seed demo transporters if table is empty
    const count = await db.transporterProfile.count();
    if (count === 0) {
      await seedDemoTransporters();
    }

    const where: Record<string, boolean> = {};
    if (verifiedParam !== null) {
      where.verified = verifiedParam === 'true';
    }

    let transporters = await db.transporterProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        vehicles: {
          where: { isAvailable: true },
        },
        _count: {
          select: { transportRequests: true },
        },
      },
      orderBy: [
        { verified: 'desc' },
        { ratingScore: 'desc' },
      ],
    });

    // Optional district filtering
    if (district) {
      const distLower = district.toLowerCase();
      transporters = transporters.filter((t) => {
        if (!t.operationalDistricts) return true;
        return t.operationalDistricts.toLowerCase().includes(distLower);
      });
    }

    return NextResponse.json({
      success: true,
      count: transporters.length,
      transporters,
    });
  } catch (error: unknown) {
    console.error('Error fetching transporters:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch transporters';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
