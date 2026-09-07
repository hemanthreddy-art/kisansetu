import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lotId = searchParams.get('lotId');
    const transporterId = searchParams.get('transporterId');
    const status = searchParams.get('status');

    const where: Record<string, string> = {};
    if (lotId) where.lotId = lotId;
    if (transporterId) where.transporterId = transporterId;
    if (status) where.status = status;

    const requests = await db.transportRequest.findMany({
      where,
      include: {
        lot: {
          select: {
            id: true,
            lotCode: true,
            commodity: true,
            variety: true,
            quantityQuintals: true,
            locationDistrict: true,
            status: true,
          },
        },
        transporter: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: requests.length,
      transportRequests: requests,
    });
  } catch (error: unknown) {
    console.error('Error fetching transport requests:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch transport requests';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lotId,
      transporterId,
      vehicleId,
      pickupLocation,
      dropLocation,
      pickupDistrict,
      dropDistrict,
      distanceKm,
      quantityQuintals,
      estimatedTrips,
      ratePerKm,
      estimatedCost,
      scheduledPickup,
      notes,
    } = body;

    if (!lotId) {
      return NextResponse.json(
        { success: false, error: 'lotId is required' },
        { status: 400 }
      );
    }

    if (!pickupLocation || !dropLocation) {
      return NextResponse.json(
        { success: false, error: 'pickupLocation and dropLocation are required' },
        { status: 400 }
      );
    }

    const lot = await db.produceLot.findUnique({
      where: { id: lotId },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found' },
        { status: 404 }
      );
    }

    // Parse scheduled date, default to tomorrow if invalid or absent
    let pickupDate = scheduledPickup ? new Date(scheduledPickup) : new Date(Date.now() + 86400000);
    if (isNaN(pickupDate.getTime())) {
      pickupDate = new Date(Date.now() + 86400000);
    }

    const transportRequest = await db.transportRequest.create({
      data: {
        lotId,
        transporterId: transporterId || null,
        vehicleId: vehicleId || null,
        pickupLocation: pickupLocation.trim(),
        dropLocation: dropLocation.trim(),
        pickupDistrict: pickupDistrict || lot.locationDistrict,
        dropDistrict: dropDistrict || null,
        distanceKm: Number(distanceKm) || 50,
        quantityQuintals: quantityQuintals ? Number(quantityQuintals) : lot.quantityQuintals,
        estimatedTrips: Number(estimatedTrips) || 1,
        ratePerKm: ratePerKm ? Number(ratePerKm) : null,
        estimatedCost: Number(estimatedCost) || 0,
        status: 'REQUESTED',
        scheduledPickup: pickupDate,
        notes: notes ? String(notes).trim() : null,
      },
      include: {
        lot: true,
        transporter: true,
        vehicle: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        transportRequest,
        message: 'Transport request submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating transport request:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create transport request';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
