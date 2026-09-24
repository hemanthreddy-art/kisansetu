import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDemoInspector } from '@/lib/auth-demo';

/**
 * GET /api/inspector/lots
 * Retrieves produce lots for authorized quality inspectors.
 * Acts as an Exception & Escalation Assaying Desk for high-value trades,
 * low AI confidence, trade disputes, and official certification requests.
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
        transactions: {
          include: {
            disputes: true,
          },
        },
      },
    });

    // Compute Inspector metrics
    let pendingCount = 0;
    let verifiedCount = 0;
    let reinspectionCount = 0;
    let rejectedCount = 0;
    let highValueEscalationsCount = 0;
    let lowConfidenceEscalationsCount = 0;
    let disputeEscalationsCount = 0;

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

      // Parse AI visual parameters if available
      let visualDetails = null;
      if (latestAi?.visualParameters) {
        try {
          visualDetails = JSON.parse(latestAi.visualParameters);
        } catch {
          // Fallback
        }
      }

      // Check Escalation & Exception Criteria
      const grossVal = lot.quantityQuintals * (lot.expectedPricePerQuintal || 2000);
      const isHighVal = lot.quantityQuintals >= 500 || grossVal >= 500000;
      const isLowConf = (latestAi?.confidenceScore ?? 0.85) < 0.65;
      const hasDispute = lot.transactions?.some((tx) => tx.disputes?.length > 0) ?? false;

      let escalationCategory: 'HIGH_VALUE_TRADE' | 'LOW_AI_CONFIDENCE' | 'DISPUTED_TRADE' | 'REINSPECTION_REQUIRED' | 'CERTIFIED' | 'ROUTINE_FAST_TRACK' = 'ROUTINE_FAST_TRACK';
      let escalationReason = 'Routine listing fast-tracked with AI photo assessment. Physical officer inspection waived.';

      if (latestVerification?.status === 'REQUIRES_REINSPECTION') {
        escalationCategory = 'REINSPECTION_REQUIRED';
        escalationReason = 'Lot failed prior physical verification; mandatory reinspection required.';
      } else if (latestVerification?.status === 'PHYSICALLY_VERIFIED') {
        escalationCategory = 'CERTIFIED';
        escalationReason = `Certified with official MSAMB Certificate ${latestVerification.certificateNumber}.`;
      } else if (hasDispute) {
        escalationCategory = 'DISPUTED_TRADE';
        escalationReason = 'Active counterparty trade grievance filed. Neutral official assaying required.';
        disputeEscalationsCount++;
      } else if (isHighVal) {
        escalationCategory = 'HIGH_VALUE_TRADE';
        escalationReason = `High-volume institutional trade (${lot.quantityQuintals} Qtl / ₹${grossVal.toLocaleString('en-IN')}) escalated for spot verification.`;
        highValueEscalationsCount++;
      } else if (isLowConf) {
        escalationCategory = 'LOW_AI_CONFIDENCE';
        escalationReason = 'AI visual screening confidence is below threshold. Human inspector review queued.';
        lowConfidenceEscalationsCount++;
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
              displayLabel: 'AI Visual Assessment — Preliminary',
              estimatedGrade: latestAi.estimatedGrade,
              confidenceScore: latestAi.confidenceScore,
              color: latestAi.color,
              sizeUniformity: latestAi.sizeUniformity,
              visibleDefects: latestAi.visibleDefects,
              assessedAt: latestAi.assessedAt,
              visualDetails,
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
        escalationCategory,
        escalationReason,
        isEscalated: escalationCategory !== 'ROUTINE_FAST_TRACK' && escalationCategory !== 'CERTIFIED',
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
        escalations: {
          highValue: highValueEscalationsCount,
          lowConfidence: lowConfidenceEscalationsCount,
          disputes: disputeEscalationsCount,
        },
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
