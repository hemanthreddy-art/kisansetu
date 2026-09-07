import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getDemoBuyer, getBuyerReputation, DemoBuyerKey } from '@/lib/auth-demo';
import { validateBuyerDemandInput } from '@/lib/validation';

/**
 * GET /api/buyer-demands
 * Retrieves active commercial buyer procurement demands across Maharashtra.
 * Supports filtering by commodity, district, status, and buyerId.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity');
    const district = searchParams.get('district');
    const status = searchParams.get('status') || 'ACTIVE';
    const buyerId = searchParams.get('buyerId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const whereClause: Prisma.BuyerDemandWhereInput = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (commodity) {
      whereClause.commodity = { contains: commodity };
    }
    if (district) {
      whereClause.destinationDistrict = district;
    }
    if (buyerId) {
      whereClause.buyerId = buyerId;
    }

    const demands = await db.buyerDemand.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      include: {
        buyer: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const formattedDemands = demands.map((d) => {
      const rep = getBuyerReputation(d.buyer.companyName);
      return {
        id: d.id,
        buyerId: d.buyerId,
        buyerName: d.buyer.user?.fullName || d.buyer.companyName,
        companyName: d.buyer.companyName,
        buyerType: d.buyer.buyerType,
        isBuyerVerified: d.buyer.verified,
        reputation: rep,
        commodity: d.commodity,
        variety: d.variety,
        requiredQuantityQtl: d.requiredQuantityQtl,
        unit: d.unit,
        targetPricePerQtl: d.targetPricePerQtl,
        minPricePerQtl: d.minPricePerQtl,
        maxPricePerQtl: d.maxPricePerQtl,
        destinationDistrict: d.destinationDistrict,
        deliveryLocation: d.deliveryLocation,
        deliveryDeadline: d.deliveryDeadline,
        requiredGrade: d.requiredGrade,
        qualityRequirements: d.qualityRequirements,
        description: d.description,
        status: d.status,
        isActive: d.isActive,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedDemands.length,
      demands: formattedDemands,
    });
  } catch (error) {
    console.error('Error fetching buyer demands:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve buyer procurement demands.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/buyer-demands
 * Creates a new commercial buyer procurement demand.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Server-side input validation
    const validation = validateBuyerDemandInput(body);
    if (!validation.isValid || !validation.cleanedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for buyer demand.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { cleanedData } = validation;

    // 2. Resolve Buyer identity
    let buyerProfileId = body.buyerId;
    let companyName = '';

    if (body.buyerKey) {
      const { buyerProfile } = await getDemoBuyer(body.buyerKey as DemoBuyerKey);
      buyerProfileId = buyerProfile.id;
      companyName = buyerProfile.companyName;
    } else if (buyerProfileId) {
      const existing = await db.buyerProfile.findUnique({
        where: { id: buyerProfileId },
      });
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Target buyer profile not found.' },
          { status: 404 }
        );
      }
      companyName = existing.companyName;
    } else {
      // Default to ABC Foods demo buyer
      const { buyerProfile } = await getDemoBuyer('ABC_FOODS');
      buyerProfileId = buyerProfile.id;
      companyName = buyerProfile.companyName;
    }

    // 3. Create Demand record in SQLite
    const demand = await db.buyerDemand.create({
      data: {
        buyerId: buyerProfileId,
        commodity: cleanedData.commodity!,
        variety: cleanedData.variety,
        requiredQuantityQtl: cleanedData.requiredQuantityQtl,
        unit: cleanedData.unit,
        targetPricePerQtl: cleanedData.targetPricePerQtl,
        minPricePerQtl: cleanedData.minPricePerQtl,
        maxPricePerQtl: cleanedData.maxPricePerQtl,
        destinationDistrict: cleanedData.destinationDistrict!,
        deliveryLocation: cleanedData.deliveryLocation,
        deliveryDeadline: cleanedData.deliveryDeadline,
        requiredGrade: cleanedData.requiredGrade,
        qualityRequirements: cleanedData.qualityRequirements,
        description: cleanedData.description,
        status: cleanedData.status,
        isActive: cleanedData.status === 'ACTIVE',
      },
      include: {
        buyer: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    const rep = getBuyerReputation(companyName);

    return NextResponse.json(
      {
        success: true,
        message: 'Buyer procurement demand published successfully.',
        demand: {
          id: demand.id,
          buyerId: demand.buyerId,
          buyerName: demand.buyer.user?.fullName || demand.buyer.companyName,
          companyName: demand.buyer.companyName,
          buyerType: demand.buyer.buyerType,
          isBuyerVerified: demand.buyer.verified,
          reputation: rep,
          commodity: demand.commodity,
          variety: demand.variety,
          requiredQuantityQtl: demand.requiredQuantityQtl,
          unit: demand.unit,
          targetPricePerQtl: demand.targetPricePerQtl,
          minPricePerQtl: demand.minPricePerQtl,
          maxPricePerQtl: demand.maxPricePerQtl,
          destinationDistrict: demand.destinationDistrict,
          deliveryLocation: demand.deliveryLocation,
          deliveryDeadline: demand.deliveryDeadline,
          requiredGrade: demand.requiredGrade,
          qualityRequirements: demand.qualityRequirements,
          description: demand.description,
          status: demand.status,
          isActive: demand.isActive,
          createdAt: demand.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating buyer demand:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create buyer procurement demand.' },
      { status: 500 }
    );
  }
}
