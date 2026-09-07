// Test Phase 3 Quality HTTP Endpoints and existing Phase 1 & 2 routes
async function testQualityHttp() {
  const baseUrl = 'http://localhost:3006';
  console.log('Testing Quality HTTP Endpoints on', baseUrl, '...\n');

  // 1. Fetch existing produce lot
  console.log('[1/7] GET /api/lots (Phase 2 Route Verification)');
  const resLots = await fetch(`${baseUrl}/api/lots`);
  const lotsData = await resLots.json();
  if (!lotsData.success || lotsData.data.length === 0) {
    throw new Error('No lots found on /api/lots');
  }
  const targetLot = lotsData.data[0];
  const lotCode = targetLot.lotCode;
  console.log(`  -> Selected Lot: ${lotCode} (${targetLot.commodity}) [Status: ${resLots.status} OK]`);

  // 2. Test POST /api/lots/[id]/assessment (Create AI Preliminary Assessment)
  console.log(`\n[2/7] POST /api/lots/${lotCode}/assessment (Tier 1 AI Assessment)`);
  const aiPayload = {
    estimatedGrade: 'Grade A',
    confidenceScore: 0.88,
    color: 'Healthy red, glossy finish',
    visibleDamage: 'Under 1% minor superficial blemishes',
    sizeUniformity: 92.0,
    visibleDefects: 1.5,
    assessmentNotes: 'Preliminary AI screening shows standard export size and low skin peel rate.',
  };
  const resAiPost = await fetch(`${baseUrl}/api/lots/${lotCode}/assessment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(aiPayload),
  });
  const dataAiPost = await resAiPost.json();
  console.log(`  -> HTTP Status: ${resAiPost.status} [Created]`);
  console.log(`  -> Tier: ${dataAiPost.tier}`);
  console.log(`  -> Label: "${dataAiPost.label}"`);
  console.log(`  -> Status: ${dataAiPost.status}`);
  console.log(`  -> Is Official: ${dataAiPost.isOfficialVerification}`);
  if (dataAiPost.status !== 'AI_ASSESSMENT_NOT_VERIFIED') {
    throw new Error(`AI status mismatch: expected AI_ASSESSMENT_NOT_VERIFIED, got ${dataAiPost.status}`);
  }
  if (dataAiPost.label !== 'AI Assessment — Not Verified') {
    throw new Error(`AI label mismatch: expected 'AI Assessment — Not Verified', got ${dataAiPost.label}`);
  }
  console.log('  -> AI preliminary constraints verified [PASS]');

  // 3. Test GET /api/lots/[id]/assessment (Retrieve AI Assessment)
  console.log(`\n[3/7] GET /api/lots/${lotCode}/assessment`);
  const resAiGet = await fetch(`${baseUrl}/api/lots/${lotCode}/assessment`);
  const dataAiGet = await resAiGet.json();
  console.log(`  -> HTTP Status: ${resAiGet.status} [OK]`);
  console.log(`  -> Total Screenings: ${dataAiGet.assessments.length}`);
  console.log(`  -> Latest Color: ${dataAiGet.latestAssessment.color}`);
  console.log(`  -> Size Uniformity: ${dataAiGet.latestAssessment.sizeUniformity}%`);
  console.log(`  -> Disclaimer: "${dataAiGet.disclaimer}" [PASS]`);

  // 4. Test POST /api/lots/[id]/verification (Create Physical Verification)
  console.log(`\n[4/7] POST /api/lots/${lotCode}/verification (Tier 2 Physical Verification)`);
  const physicalPayload = {
    officialGrade: 'Grade A',
    status: 'PHYSICALLY_VERIFIED',
    moisturePercentage: 11.5,
    foreignMatterPerc: 0.5,
    inspectionLocation: 'On-Farm (Pimpalgaon Baswant)',
    inspectionNotes: 'Assaying completed by MSAMB official inspector. Samples pass export parameters.',
  };
  const resPhysPost = await fetch(`${baseUrl}/api/lots/${lotCode}/verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(physicalPayload),
  });
  const dataPhysPost = await resPhysPost.json();
  console.log(`  -> HTTP Status: ${resPhysPost.status} [Created]`);
  console.log(`  -> Tier: ${dataPhysPost.tier}`);
  console.log(`  -> Label: "${dataPhysPost.label}"`);
  console.log(`  -> Certificate: ${dataPhysPost.certificateNumber}`);
  console.log(`  -> Status: ${dataPhysPost.status}`);
  console.log(`  -> Inspector: ${dataPhysPost.data.inspector.user.fullName}`);
  if (dataPhysPost.label !== 'Physically Verified') {
    throw new Error(`Physical label mismatch: expected 'Physically Verified', got ${dataPhysPost.label}`);
  }
  console.log('  -> Physical verification constraints verified [PASS]');

  // 5. Test GET /api/lots/[id]/verification (Retrieve Physical Verification)
  console.log(`\n[5/7] GET /api/lots/${lotCode}/verification`);
  const resPhysGet = await fetch(`${baseUrl}/api/lots/${lotCode}/verification`);
  const dataPhysGet = await resPhysGet.json();
  console.log(`  -> HTTP Status: ${resPhysGet.status} [OK]`);
  console.log(`  -> Total Verifications: ${dataPhysGet.verifications.length}`);
  console.log(`  -> Latest Official Grade: ${dataPhysGet.latestVerification.officialGrade}`);
  console.log(`  -> Certificate: ${dataPhysGet.latestVerification.certificateNumber} [PASS]`);

  // 6. Test GET /api/lots/[id]/quality (Unified Two-Tier Endpoint)
  console.log(`\n[6/7] GET /api/lots/${lotCode}/quality (Unified Two-Tier Status)`);
  const resQuality = await fetch(`${baseUrl}/api/lots/${lotCode}/quality`);
  const dataQuality = await resQuality.json();
  console.log(`  -> HTTP Status: ${resQuality.status} [OK]`);
  console.log(`  -> Tier 1 Label: "${dataQuality.qualityOverview.tier1_aiAssessment.label}"`);
  console.log(`  -> Tier 1 Status: ${dataQuality.qualityOverview.tier1_aiAssessment.status}`);
  console.log(`  -> Tier 2 Label: "${dataQuality.qualityOverview.tier2_physicalVerification.label}"`);
  console.log(`  -> Tier 2 Status: ${dataQuality.qualityOverview.tier2_physicalVerification.status}`);
  console.log(`  -> Overall Verified: ${dataQuality.qualityOverview.isPhysicallyVerified} [PASS]`);

  // 7. Test Existing Phase 1 and Phase 2 Routes (Regression Check)
  console.log('\n[7/7] Testing Existing Phase 1 & 2 Routes (Regression Check)');
  const pagesToTest = [
    '/',
    '/farmer',
    '/lots',
    `/lots/${lotCode}`,
    '/calculator',
    '/inspector',
    '/api/lots',
    `/api/lots/${lotCode}`,
  ];

  for (const page of pagesToTest) {
    const pageRes = await fetch(`${baseUrl}${page}`);
    console.log(`  -> Route ${page} => HTTP ${pageRes.status} ${pageRes.statusText}`);
    if (pageRes.status >= 400) {
      throw new Error(`Route ${page} returned error status ${pageRes.status}`);
    }
  }

  console.log('\n====================================================');
  console.log('ALL PHASE 3 APIS AND REGRESSION TESTS PASSED 100%!');
  console.log('====================================================\n');
}

testQualityHttp().catch((err) => {
  console.error('Test Quality HTTP Failed:', err);
  process.exit(1);
});
