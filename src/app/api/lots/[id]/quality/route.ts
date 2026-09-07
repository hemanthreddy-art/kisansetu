import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/lots/[id]/quality
 * Unified quality overview endpoint for a lot displaying both tiers side-by-side.
 *
 * ENFORCES THE STRICT TWO-TIER ARCHITECTURAL PRINCIPLE:
 * Tier 1: AI Visual Screening -> "AI Assessment — Not Verified" (Non-binding)
 * Tier 2: Official Physical Inspection -> "Physically Verified" (Binding Certificate)
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    const lot = await db.produceLot.findFirst({
      where: {
        OR: [{ id }, { lotCode: id }],
      },
      include: {
        aiAssessments: {
          orderBy: { assessedAt: 'desc' },
          take: 1,
        },
        physicalVerifications: {
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
          orderBy: { verifiedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found.' },
        { status: 404 }
      );
    }

    const latestAi = lot.aiAssessments[0] || null;
    const latestPhysical = lot.physicalVerifications[0] || null;

    const tier1 = {
      name: 'Tier 1: AI Visual Screening',
      status: latestAi ? 'AI_ASSESSMENT_NOT_VERIFIED' : 'NOT_ASSESSED',
      label: 'AI Assessment — Not Verified',
      isOfficial: false,
      disclaimer:
        'AI Assessment — Not Verified. Preliminary visual estimate only. An ordinary photograph cannot completely determine produce quality.',
      details: latestAi
        ? {
            id: latestAi.id,
            preliminaryGrade: latestAi.estimatedGrade,
            confidenceScore: latestAi.confidenceScore,
            color: latestAi.color,
            visibleDamage: latestAi.visibleDamage,
            sizeUniformity: latestAi.sizeUniformity ? `${latestAi.sizeUniformity}%` : null,
            visibleDefects: latestAi.visibleDefects ? `${latestAi.visibleDefects}%` : null,
            notes: latestAi.assessmentNotes,
            assessedAt: latestAi.assessedAt,
          }
        : null,
    };

    const tier2 = {
      name: 'Tier 2: Physical Quality Verification',
      status: latestPhysical ? latestPhysical.status : 'NOT_INSPECTED',
      label: latestPhysical?.status === 'PHYSICALLY_VERIFIED' ? 'Physically Verified' : 'Pending Physical Inspection',
      isOfficial: true,
      details: latestPhysical
        ? {
            id: latestPhysical.id,
            certificateNumber: latestPhysical.certificateNumber,
            officialGrade: latestPhysical.officialGrade,
            verificationStatus: latestPhysical.status,
            moisturePercentage: latestPhysical.moisturePercentage ? `${latestPhysical.moisturePercentage}%` : null,
            foreignMatterPerc: latestPhysical.foreignMatterPerc ? `${latestPhysical.foreignMatterPerc}%` : null,
            location: latestPhysical.inspectionLocation,
            inspectionDate: latestPhysical.inspectionDate,
            inspectorName: latestPhysical.inspector?.user?.fullName || 'MSAMB Authorized Inspector',
            agency: latestPhysical.inspector?.agencyName || 'MSAMB Quality Cell',
            licenseNumber: latestPhysical.inspector?.licenseNumber,
            notes: latestPhysical.inspectionNotes,
            verifiedAt: latestPhysical.verifiedAt,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      lot: {
        id: lot.id,
        lotCode: lot.lotCode,
        commodity: lot.commodity,
        variety: lot.variety,
        currentGrade: lot.expectedGrade,
        status: lot.status,
      },
      qualityOverview: {
        tier1_aiAssessment: tier1,
        tier2_physicalVerification: tier2,
        isPhysicallyVerified: latestPhysical?.status === 'PHYSICALLY_VERIFIED',
        principle:
          'KisanSetu Two-Tier Quality Principle: AI output is strictly labeled "AI Assessment — Not Verified". Official grading requires authorized physical inspection.',
      },
    });
  } catch (error) {
    console.error('Error fetching quality overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve quality overview.' },
      { status: 500 }
    );
  }
}
