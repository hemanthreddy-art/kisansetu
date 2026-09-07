import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seedDemoTransporters } from '@/lib/auth-demo';
import {
  evaluateTransportOptions,
  getCorridorDistance,
} from '@/lib/transportMatching';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);

    const lot = await db.produceLot.findUnique({
      where: { id },
      include: {
        farmer: true,
        offers: {
          where: { status: 'ACCEPTED' },
          include: {
            buyer: true,
          },
        },
        transportRequests: {
          include: {
            transporter: true,
            vehicle: true,
          },
        },
      },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found' },
        { status: 404 }
      );
    }

    // Auto-seed transporters if none exist
    const count = await db.transporterProfile.count();
    if (count === 0) {
      await seedDemoTransporters();
    }

    const transporters = await db.transporterProfile.findMany({
      include: {
        vehicles: {
          where: { isAvailable: true },
        },
      },
      orderBy: [
        { verified: 'desc' },
        { ratingScore: 'desc' },
      ],
    });

    // Determine pickup
    const pickupDistrict = lot.locationDistrict || lot.farmer?.district || 'Nashik';
    const pickupLocation = lot.location || lot.locationTaluka || `${pickupDistrict} Farm Gate`;

    // Determine destination: query param > accepted offer buyer location > default
    let dropDistrict = searchParams.get('dropDistrict') || '';
    let dropLocation = searchParams.get('dropLocation') || '';

    if (!dropDistrict && lot.offers && lot.offers.length > 0) {
      const acceptedOffer = lot.offers[0];
      const buyerProfile = acceptedOffer.buyer;
      if (buyerProfile?.operatingCities) {
        const firstCity = buyerProfile.operatingCities.split(',')[0].trim();
        dropDistrict = firstCity;
        dropLocation = `${buyerProfile.companyName} Warehouse (${firstCity})`;
      }
    }

    if (!dropDistrict) {
      dropDistrict = 'Pune';
      dropLocation = 'Pune Market Yard / APMC Terminal';
    }

    const preferRefrigerated = searchParams.get('preferRefrigerated') === 'true';

    const distanceKm = getCorridorDistance(pickupDistrict, dropDistrict);

    const options = evaluateTransportOptions({
      lot: {
        id: lot.id,
        commodity: lot.commodity,
        quantityQuintals: lot.quantityQuintals,
        locationDistrict: pickupDistrict,
        locationTaluka: lot.locationTaluka,
        location: pickupLocation,
      },
      destination: {
        district: dropDistrict,
        location: dropLocation,
      },
      transporters,
      preferRefrigerated,
    });

    return NextResponse.json({
      success: true,
      lotId: lot.id,
      lotCode: lot.lotCode,
      commodity: lot.commodity,
      quantityQuintals: lot.quantityQuintals,
      pickupLocation,
      pickupDistrict,
      dropLocation,
      dropDistrict,
      distanceKm,
      preferRefrigerated,
      count: options.length,
      options,
      existingRequests: lot.transportRequests,
    });
  } catch (error: unknown) {
    console.error('Error calculating transport options:', error);
    const msg = error instanceof Error ? error.message : 'Failed to calculate transport options';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
