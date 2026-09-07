import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateAiAssessmentInput } from '@/lib/validation';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/lots/[id]/assessment
 * Retrieves preliminary AI visual screening assessments for a specific produce lot.
 *
 * STRICT PRINCIPLE:
 * Clearly labeled "AI Assessment — Not Verified".
 * This is non-binding visual screening and NOT official trade grading.
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

    return NextResponse.json({
      success: true,
      tier: 'TIER_1_AI_ASSESSMENT',
      label: 'AI Assessment — Not Verified',
      status: latestAssessment?.status || 'AI_ASSESSMENT_NOT_VERIFIED',
      isOfficialVerification: false,
      disclaimer:
        'AI Assessment — Not Verified. Preliminary visual estimate only. Requires authorized physical verification for formal trade grading.',
      lot: {
        id: lot.id,
        lotCode: lot.lotCode,
        commodity: lot.commodity,
        variety: lot.variety,
      },
      latestAssessment,
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
 * Creates or records a preliminary AI visual screening assessment.
 *
 * STRICT ARCHITECTURAL PRINCIPLES:
 * 1. Status is permanently tagged as "AI_ASSESSMENT_NOT_VERIFIED".
 * 2. Does NOT modify or overwrite official physical verification status.
 * 3. Does NOT claim that uploaded photograph completely determines quality.
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

    // 2. Server-side validation of AI preliminary parameters
    const validation = validateAiAssessmentInput(body);
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

    // 3. Persist AI Assessment in SQLite database
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
        disclaimer: cleanedData.disclaimer,
      },
    });

    return NextResponse.json(
      {
        success: true,
        tier: 'TIER_1_AI_ASSESSMENT',
        label: 'AI Assessment — Not Verified',
        status: assessment.status,
        isOfficialVerification: false,
        message:
          'AI preliminary visual screening recorded. Note: This is NOT an official trade grade and must be physically verified by an authorized inspector.',
        data: assessment,
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
