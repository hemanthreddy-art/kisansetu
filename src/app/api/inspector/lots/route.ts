import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDemoInspector } from '@/lib/auth-demo';

/**
 * GET /api/inspector/lots
 * Retrieves produce lots for authorized quality inspectors.
 * Returns lots requiring inspection, completed certificates, and reinspections.
 */
export async function GET() {
  try {
    const { inspectorProfile } = await getDemoInspector();

    const lots = await db.produceLot.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        farmer: {
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

    // Compute Inspector metrics
    let pendingCount = 0;
    let verifiedCount = 0;
    let reinspectionCount = 0;
    let rejectedCount = 0;

    const formattedLots = lots.map((lot) => {
      const latestVerification = lot.physicalVerifications[0] || null;
      const latestAi = lot.aiAssessments[0] || null;

      let inspectionStatus = 'PENDING';
      if (latestVerification) {
        inspectionStatus = latestVerification.status;
      }

      if (inspectionStatus === 'PHYSICALLY_VERIFIED') {
        verifiedCount++;
      } else if (inspectionStatus === 'REQUIRES_REINSPECTION') {
        reinspectionCount++;
      } else if (inspectionStatus === 'REJECTED') {
        rejectedCount++;
      } else {
        pendingCount++;
      }

      return {
        id: lot.id,
        lotCode: lot.lotCode,
        commodity: lot.commodity,
        variety: lot.variety,
        quantity: lot.quantity,
        unit: lot.unit,
        quantityQuintals: lot.quantityQuintals,
        expectedPricePerQuintal: lot.expectedPricePerQuintal,
        currentGrade: lot.expectedGrade,
        locationDistrict: lot.locationDistrict,
        location: lot.location,
        farmerName: lot.farmer?.user?.fullName || 'Registered Farmer',
        farmerPhone: lot.farmer?.user?.phone,
        createdAt: lot.createdAt,
        aiAssessment: latestAi
          ? {
              status: latestAi.status,
              label: 'AI Assessment — Not Verified',
              estimatedGrade: latestAi.estimatedGrade,
              confidenceScore: latestAi.confidenceScore,
              color: latestAi.color,
              sizeUniformity: latestAi.sizeUniformity,
              visibleDefects: latestAi.visibleDefects,
              assessedAt: latestAi.assessedAt,
            }
          : null,
        latestVerification: latestVerification
          ? {
              id: latestVerification.id,
              status: latestVerification.status,
              label:
                latestVerification.status === 'PHYSICALLY_VERIFIED'
                  ? 'Physically Verified'
                  : latestVerification.status,
              officialGrade: latestVerification.officialGrade,
              certificateNumber: latestVerification.certificateNumber,
              moisturePercentage: latestVerification.moisturePercentage,
              foreignMatterPerc: latestVerification.foreignMatterPerc,
              location: latestVerification.inspectionLocation,
              notes: latestVerification.inspectionNotes,
              verifiedAt: latestVerification.verifiedAt,
            }
          : null,
        inspectionStatus,
      };
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalLots: lots.length,
        pendingInspections: pendingCount,
        completedVerifications: verifiedCount,
        reinspectionRequired: reinspectionCount,
        rejected: rejectedCount,
      },
      inspector: {
        id: inspectorProfile.id,
        agencyName: inspectorProfile.agencyName,
        licenseNumber: inspectorProfile.licenseNumber,
        assignedDistricts: inspectorProfile.assignedDistricts,
      },
      lots: formattedLots,
    });
  } catch (error) {
    console.error('Error fetching inspector lots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve inspector produce lots.' },
      { status: 500 }
    );
  }
}
