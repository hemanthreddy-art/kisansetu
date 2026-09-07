import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDemoInspector } from '@/lib/auth-demo';
import { validatePhysicalVerificationInput } from '@/lib/validation';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/lots/[id]/verification
 * Retrieves official physical quality verification certificates for a lot.
 *
 * TIER 2 PRINCIPLE:
 * This is the official trade verification layer performed in-person by certified inspectors.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    const lot = await db.produceLot.findFirst({
      where: {
        OR: [{ id }, { lotCode: id }],
      },
      include: {
        physicalVerifications: {
          include: {
            inspector: {
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
          orderBy: { verifiedAt: 'desc' },
        },
      },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found.' },
        { status: 404 }
      );
    }

    const latestVerification = lot.physicalVerifications[0] || null;

    return NextResponse.json({
      success: true,
      tier: 'TIER_2_PHYSICAL_VERIFICATION',
      label: latestVerification?.status === 'PHYSICALLY_VERIFIED' ? 'Physically Verified' : 'Pending Physical Verification',
      isOfficialVerification: true,
      lot: {
        id: lot.id,
        lotCode: lot.lotCode,
        commodity: lot.commodity,
        variety: lot.variety,
        expectedGrade: lot.expectedGrade,
      },
      latestVerification,
      verifications: lot.physicalVerifications,
    });
  } catch (error) {
    console.error('Error fetching physical verification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve physical quality verifications.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lots/[id]/verification
 * Creates an official physical quality inspection record performed by an authorized inspector.
 *
 * TIER 2 PRINCIPLE:
 * In-person inspection tests physical parameters (moisture, foreign matter, sorting)
 * and issues a certified verification status.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();

    // 1. Verify target produce lot exists
    const lot = await db.produceLot.findFirst({
      where: {
        OR: [{ id }, { lotCode: id }],
      },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found.' },
        { status: 404 }
      );
    }

    // 2. Validate input parameters
    const validation = validatePhysicalVerificationInput(body);
    if (!validation.isValid || !validation.cleanedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for physical verification.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { cleanedData } = validation;

    // 3. Resolve authorized Inspector identity
    let inspectorId = body.inspectorId;
    if (!inspectorId) {
      // Use demo inspector (Dr. Vilas Shinde, MSAMB Quality Cell)
      const { inspectorProfile } = await getDemoInspector();
      inspectorId = inspectorProfile.id;
    } else {
      const inspectorExists = await db.qualityInspector.findUnique({
        where: { id: inspectorId },
      });
      if (!inspectorExists) {
        return NextResponse.json(
          { success: false, error: 'Authorized quality inspector not found.' },
          { status: 404 }
        );
      }
    }

    // 4. Generate unique Certificate Number
    const currentYear = new Date().getFullYear();
    const count = await db.qualityVerification.count();
    const seq = String(count + 1).padStart(4, '0');
    const certificateNumber = `KS-QC-${currentYear}-${seq}`;

    // 5. Persist official verification in SQLite database
    const verification = await db.qualityVerification.create({
      data: {
        lotId: lot.id,
        inspectorId: inspectorId,
        status: cleanedData.status,
        officialGrade: cleanedData.officialGrade,
        moisturePercentage: cleanedData.moisturePercentage,
        foreignMatterPerc: cleanedData.foreignMatterPerc,
        inspectionLocation: cleanedData.inspectionLocation,
        inspectionDate: cleanedData.inspectionDate,
        inspectionNotes: cleanedData.inspectionNotes,
        certificateNumber,
      },
      include: {
        inspector: {
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

    // 6. If verified, update the lot's expectedGrade to officialGrade cleanly
    if (cleanedData.status === 'PHYSICALLY_VERIFIED') {
      await db.produceLot.update({
        where: { id: lot.id },
        data: {
          expectedGrade: cleanedData.officialGrade,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        tier: 'TIER_2_PHYSICAL_VERIFICATION',
        label: cleanedData.status === 'PHYSICALLY_VERIFIED' ? 'Physically Verified' : 'Inspection Recorded',
        status: verification.status,
        isOfficialVerification: true,
        message: `Official physical verification certificate issued: ${certificateNumber}`,
        certificateNumber: certificateNumber,
        data: verification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating physical quality verification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record physical quality verification.' },
      { status: 500 }
    );
  }
}
