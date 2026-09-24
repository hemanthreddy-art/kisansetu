import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateAiAssessmentInput } from '@/lib/validation';
import { analyzeCropPhotos } from '@/lib/quality-ai';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/lots/[id]/assessment
 * Retrieves preliminary AI visual screening assessments for a specific produce lot.
 *
 * STRICT TRUTH-IN-AI PRINCIPLES:
 * 1. AI Visual Assessment is strictly PRELIMINARY and NON-BINDING.
 * 2. Clearly labeled "AI Visual Assessment — Preliminary" / "AI Assessment — Not Verified".
 * 3. Never presented as official MSAMB/AGMARK statutory certification.
 * 4. Never fabricates moisture %, chemical purity, or internal metrics ("Physical measurement required").
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    // Search by internal id or lotCode
    const lot = await db.produceLot.findFirst({
      where: {
        OR: [{ id }, { lotCode: id }],
      },
      include: {
        aiAssessments: {
          orderBy: { assessedAt: 'desc' },
        },
      },
    });

    if (!lot) {
      return NextResponse.json(
        { success: false, error: 'Produce lot not found.' },
        { status: 404 }
      );
    }

    const latestAssessment = lot.aiAssessments[0] || null;

    let parsedVisualDetails = null;
    if (latestAssessment?.visualParameters) {
      try {
        parsedVisualDetails = JSON.parse(latestAssessment.visualParameters);
      } catch {
        // Fallback if not valid JSON
      }
    }

    return NextResponse.json({
      success: true,
      tier: 'TIER_1_AI_ASSESSMENT',
      label: 'AI Assessment — Not Verified',
      displayLabel: 'AI Visual Assessment — Preliminary',
      status: latestAssessment?.status || 'AI_ASSESSMENT_NOT_VERIFIED',
      isOfficialVerification: false,
      disclaimer:
        'AI Visual Assessment — Preliminary. Non-binding visual analysis based on external photo indicators. Does not constitute official MSAMB/AGMARK statutory certification. Moisture and internal parameters require physical assaying.',
      lot: {
        id: lot.id,
        lotCode: lot.lotCode,
        commodity: lot.commodity,
        variety: lot.variety,
      },
      latestAssessment,
      visualDetails: parsedVisualDetails,
      physicalMeasurementsRequired: {
        moisturePercentage: 'Physical measurement required (Digital moisture meter at weighbridge)',
        internalQuality: 'Physical assay required (Destructive core cutting / laboratory refractometer)',
        chemicalResidue: 'Physical assay required (Accredited laboratory testing for export cert)',
      },
      assessments: lot.aiAssessments,
    });
  } catch (error) {
    console.error('Error fetching AI quality assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve AI quality assessment.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lots/[id]/assessment
 * Creates or records a preliminary AI visual screening assessment with multi-photo analysis.
 *
 * STRICT ARCHITECTURAL PRINCIPLES:
 * 1. Status is permanently tagged as "AI_ASSESSMENT_NOT_VERIFIED".
 * 2. Does NOT modify or overwrite official physical verification status.
 * 3. Does NOT claim that uploaded photograph completely determines quality.
 * 4. AI never fabricates moisture % or internal metrics.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();

    // 1. Verify that the target produce lot exists
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

    // 2. Perform AI visual photo assessment if photos are provided or registered on the lot
    let lotPhotos: string[] = [];
    if (Array.isArray(body.photos) && body.photos.length > 0) {
      lotPhotos = body.photos;
    } else if (lot.lotPhotosJson) {
      try {
        const parsed = JSON.parse(lot.lotPhotosJson);
        if (Array.isArray(parsed)) lotPhotos = parsed;
      } catch {
        // Fallback
      }
    }

    const aiAnalysis = analyzeCropPhotos({
      commodity: lot.commodity,
      variety: lot.variety,
      photos: lotPhotos,
      quantityQuintals: lot.quantityQuintals,
      expectedPricePerQuintal: lot.expectedPricePerQuintal,
      farmerNotes: body.assessmentNotes,
    });

    // 3. Server-side validation of AI preliminary parameters (with fallbacks from aiAnalysis)
    const assessmentPayload = {
      estimatedGrade: body.estimatedGrade || aiAnalysis.estimatedGrade,
      confidenceScore: body.confidenceScore ?? aiAnalysis.confidenceScore,
      color: body.color || aiAnalysis.visualParameters.color,
      visibleDamage: body.visibleDamage || aiAnalysis.visualParameters.visibleDamage,
      sizeUniformity: body.sizeUniformity ?? aiAnalysis.visualParameters.sizeUniformity,
      visibleDefects: body.visibleDefects ?? aiAnalysis.visualParameters.visibleDefects,
      assessmentNotes: body.assessmentNotes || aiAnalysis.assessmentNotes,
    };

    const validation = validateAiAssessmentInput(assessmentPayload);
    if (!validation.isValid || !validation.cleanedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for AI preliminary assessment.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { cleanedData } = validation;

    // 4. Persist AI Assessment in SQLite database
    const assessment = await db.qualityAssessment.create({
      data: {
        lotId: lot.id,
        status: 'AI_ASSESSMENT_NOT_VERIFIED',
        estimatedGrade: cleanedData.estimatedGrade,
        confidenceScore: cleanedData.confidenceScore,
        color: cleanedData.color,
        visibleDamage: cleanedData.visibleDamage,
        sizeUniformity: cleanedData.sizeUniformity,
        visibleDefects: cleanedData.visibleDefects,
        assessmentNotes: cleanedData.assessmentNotes,
        visualParameters: JSON.stringify(aiAnalysis),
        disclaimer:
          'AI Visual Assessment — Preliminary. Non-binding visual analysis based on external photo indicators. Does not constitute official MSAMB/AGMARK statutory certification. Moisture and internal parameters require physical assaying.',
      },
    });

    return NextResponse.json(
      {
        success: true,
        tier: 'TIER_1_AI_ASSESSMENT',
        label: 'AI Assessment — Not Verified',
        displayLabel: 'AI Visual Assessment — Preliminary',
        status: assessment.status,
        isOfficialVerification: false,
        message:
          'AI preliminary visual screening recorded. Note: This is NOT an official trade grade and must be physically verified by an authorized inspector.',
        data: assessment,
        aiAnalysis,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating AI quality assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record AI quality assessment.' },
      { status: 500 }
    );
  }
}
