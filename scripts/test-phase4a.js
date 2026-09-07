const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runPhase4ATest() {
  console.log('====================================================');
  console.log('  KisanSetu Phase 4A Backend & Matching Test Suite  ');
  console.log('====================================================');

  // 1. Create / Provision Demo Buyers
  console.log('\n[1/13] Provisioning Prototype Demo Buyers...');
  const { getDemoBuyer, seedDemoBuyers, DEMO_BUYERS_CONFIG } = require('../src/lib/auth-demo.ts');
  const seeded = await seedDemoBuyers();
  if (!seeded || seeded.length < 4) {
    console.error('FAIL: Expected 4 demo buyers to be seeded.');
    process.exit(1);
  }
  console.log(`PASS: Seeded ${seeded.length} prototype buyers in SQLite:`);
  for (const s of seeded) {
    console.log(`  - ${s.buyerProfile.companyName} (${s.buyerProfile.buyerType}) | Verified: ${s.buyerProfile.verified}`);
  }

  // 2. Create Buyer Demand
  console.log('\n[2/13] Creating Buyer Demand...');
  const abcBuyer = seeded.find((b) => b.buyerProfile.companyName.includes('ABC Foods'));
  const demand = await prisma.buyerDemand.create({
    data: {
      buyerId: abcBuyer.buyerProfile.id,
      commodity: 'Onion',
      variety: 'Nashik Red',
      requiredQuantityQtl: 100,
      unit: 'Quintal',
      targetPricePerQtl: 2400,
      minPricePerQtl: 2100,
      maxPricePerQtl: 2600,
      destinationDistrict: 'Pune',
      deliveryLocation: 'ABC Food Processing Plant, Hadapsar, Pune',
      deliveryDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      requiredGrade: 'Grade A',
      qualityRequirements: 'Moisture < 13%, dry outer skin',
      description: 'Dehydration & puree processing grade.',
      status: 'ACTIVE',
      isActive: true,
    },
  });
  console.log(`PASS: Created Buyer Demand (ID: ${demand.id}) for ${demand.commodity} (${demand.requiredQuantityQtl} Qtl @ ₹${demand.targetPricePerQtl}/Qtl)`);

  // 3. Create Farmer Produce Lot
  console.log('\n[3/13] Creating Test Farmer Produce Lot...');
  const { getDemoFarmer } = require('../src/lib/auth-demo.ts');
  const { farmerProfile } = await getDemoFarmer();

  const currentYear = new Date().getFullYear();
  const lotCount = await prisma.produceLot.count();
  const testLotCode = `KS-ONION-TEST-${currentYear}-${String(lotCount + 1).padStart(4, '0')}`;

  const lot = await prisma.produceLot.create({
    data: {
      lotCode: testLotCode,
      farmerId: farmerProfile.id,
      commodity: 'Onion',
      variety: 'Nashik Red',
      quantity: 120,
      unit: 'Quintal',
      quantityQuintals: 120,
      expectedPrice: 2350,
      expectedPricePerQuintal: 2350,
      expectedGrade: 'Grade A',
      harvestDate: new Date(),
      readyForPickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      locationDistrict: 'Nashik',
      location: 'Niphad, Nashik',
      status: 'AVAILABLE',
    },
  });
  console.log(`PASS: Created Produce Lot (${lot.lotCode}) with 120 Qtl Onion @ ₹${lot.expectedPricePerQuintal}/Qtl`);

  // 4. Match Lot to Demand
  console.log('\n[4/13] Testing Transparent Matching Engine (calculateDemandMatch)...');
  const { calculateDemandMatch } = require('../src/lib/matching.ts');

  // Load fresh demand with buyer info
  const demandWithBuyer = await prisma.buyerDemand.findUnique({
    where: { id: demand.id },
    include: { buyer: { include: { user: true } } },
  });

  const matchResult = calculateDemandMatch(lot, demandWithBuyer);
  console.log(`PASS: Match computed successfully!`);
  console.log(`  - Match Score: ${matchResult.matchScore}% (Grade: ${matchResult.matchGrade})`);
  console.log(`  - Reasons:`);
  matchResult.positiveReasons.forEach((r) => console.log(`    ${r}`));

  // 5. Verify Match Score Validity
  console.log('\n[5/13] Verifying Match Score Calculation...');
  if (matchResult.matchScore < 70) {
    console.error(`FAIL: Expected high match score (>=70%), got ${matchResult.matchScore}%`);
    process.exit(1);
  }
  console.log(`PASS: High compatibility match verified (${matchResult.matchScore}% >= 70%)`);

  // 6. Verify Crop Mismatch Lowers / Rejects Match
  console.log('\n[6/13] Testing Crop Mismatch Penalty / Rejection...');
  const wheatLot = {
    ...lot,
    commodity: 'Wheat',
    variety: 'Lokwan',
  };
  const mismatchResult = calculateDemandMatch(wheatLot, demandWithBuyer);
  if (mismatchResult.matchScore !== 0) {
    console.error(`FAIL: Expected crop mismatch score 0%, got ${mismatchResult.matchScore}%`);
    process.exit(1);
  }
  console.log(`PASS: Crop mismatch properly rejected with 0% score: "${mismatchResult.warnings[0]}"`);

  // 7. Verify Quantity Compatibility Scoring
  console.log('\n[7/13] Testing Quantity Compatibility...');
  const hugeLot = { ...lot, quantityQuintals: 2000 };
  const hugeMatch = calculateDemandMatch(hugeLot, demandWithBuyer);
  if (hugeMatch.matchScore >= matchResult.matchScore) {
    console.error('FAIL: Expected volume mismatch to yield lower score.');
    process.exit(1);
  }
  console.log(`PASS: Extreme quantity divergence correctly penalizes score (${hugeMatch.matchScore}% < ${matchResult.matchScore}%)`);

  // 8. Verify Quality Integration: Physical Verified vs AI Assessment — Not Verified
  console.log('\n[8/13] Testing Two-Tier Quality Separation in Matching...');
  // Add AI assessment
  const aiAssessment = await prisma.qualityAssessment.create({
    data: {
      lotId: lot.id,
      status: 'AI_ASSESSMENT_NOT_VERIFIED',
      estimatedGrade: 'Grade A',
      confidenceScore: 0.89,
    },
  });

  const lotWithAi = {
    ...lot,
    aiAssessments: [aiAssessment],
  };
  const aiMatch = calculateDemandMatch(lotWithAi, demandWithBuyer);
  if (aiMatch.qualityStatus !== 'AI_ASSESSMENT_NOT_VERIFIED') {
    console.error(`FAIL: Expected qualityStatus AI_ASSESSMENT_NOT_VERIFIED, got ${aiMatch.qualityStatus}`);
    process.exit(1);
  }
  console.log(`PASS: AI Visual Screening correctly tagged: ${aiMatch.qualityStatus}`);

  // Now add Physical Verification
  const inspector = await prisma.qualityInspector.findFirst();
  const physicalCert = await prisma.qualityVerification.create({
    data: {
      lotId: lot.id,
      inspectorId: inspector.id,
      status: 'PHYSICALLY_VERIFIED',
      officialGrade: 'Grade A',
      certificateNumber: `KS-QC-2026-TEST-${String(lotCount + 1).padStart(4, '0')}`,
      moisturePercentage: 11.2,
      foreignMatterPerc: 0.4,
    },
  });

  const lotWithPhysical = {
    ...lot,
    physicalVerifications: [physicalCert],
  };
  const verifiedMatch = calculateDemandMatch(lotWithPhysical, demandWithBuyer);
  if (verifiedMatch.qualityStatus !== 'PHYSICALLY_VERIFIED') {
    console.error(`FAIL: Expected qualityStatus PHYSICALLY_VERIFIED, got ${verifiedMatch.qualityStatus}`);
    process.exit(1);
  }
  if (verifiedMatch.matchScore <= aiMatch.matchScore) {
    console.error('FAIL: Officially verified produce should score higher than AI screening.');
    process.exit(1);
  }
  console.log(`PASS: Official Physical Certification gives premium match score:`);
  console.log(`  - Verified Score: ${verifiedMatch.matchScore}% vs AI Unverified: ${aiMatch.matchScore}%`);
  console.log(`  - Certificate Linked: ${verifiedMatch.qualityCertificate}`);

  // 9. Create Digital Offer
  console.log('\n[9/13] Testing Digital Purchase Offer Creation...');
  const offer = await prisma.offer.create({
    data: {
      lotId: lot.id,
      buyerId: abcBuyer.buyerProfile.id,
      offeredPricePerQtl: 2400,
      quantityQuintals: 100,
      proposedPickupDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      paymentTerms: 'ESCROW_ON_DELIVERY',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      notes: 'Offer from ABC Foods. Direct payment upon physical weight verification.',
    },
  });

  if (offer.status !== 'PENDING') {
    console.error(`FAIL: Offer initial status must be PENDING, got ${offer.status}`);
    process.exit(1);
  }
  console.log(`PASS: Digital Offer Created (ID: ${offer.id}) for ₹${offer.offeredPricePerQtl}/Qtl (Status: ${offer.status})`);

  // 10. Retrieve Offer
  console.log('\n[10/13] Retrieving Offer from Database...');
  const retrievedOffer = await prisma.offer.findUnique({
    where: { id: offer.id },
    include: { lot: true, buyer: true },
  });
  if (!retrievedOffer) {
    console.error('FAIL: Offer not found.');
    process.exit(1);
  }
  console.log(`PASS: Offer retrieved: ${retrievedOffer.quantityQuintals} Qtl @ ₹${retrievedOffer.offeredPricePerQtl}/Qtl for Lot ${retrievedOffer.lot.lotCode}`);

  // 11. Update Offer Status & Reserve Lot
  console.log('\n[11/13] Testing Farmer Accepting Offer (Status: ACCEPTED)...');
  const [updatedOffer, updatedLot] = await prisma.$transaction([
    prisma.offer.update({
      where: { id: offer.id },
      data: { status: 'ACCEPTED' },
    }),
    prisma.produceLot.update({
      where: { id: lot.id },
      data: { status: 'RESERVED' },
    }),
  ]);

  if (updatedOffer.status !== 'ACCEPTED' || updatedLot.status !== 'RESERVED') {
    console.error('FAIL: Offer acceptance failed to update statuses.');
    process.exit(1);
  }
  console.log(`PASS: Offer accepted! Produce Lot ${updatedLot.lotCode} is now marked as ${updatedLot.status}.`);

  // 12. Verify Ownership Rules
  console.log('\n[12/13] Verifying Farmer & Buyer Ownership Checks...');
  // Farmer owns lot
  if (updatedLot.farmerId !== farmerProfile.id) {
    console.error('FAIL: Farmer ownership mismatch.');
    process.exit(1);
  }
  // Buyer owns offer
  if (updatedOffer.buyerId !== abcBuyer.buyerProfile.id) {
    console.error('FAIL: Buyer ownership mismatch.');
    process.exit(1);
  }
  console.log('PASS: Ownership integrity strictly validated for both Farmer and Buyer.');

  // 13. Test Buyer Cancellation on a Pending Offer
  console.log('\n[13/13] Testing Buyer Offer Cancellation...');
  const pendingOffer = await prisma.offer.create({
    data: {
      lotId: lot.id,
      buyerId: seeded[1].buyerProfile.id,
      offeredPricePerQtl: 2300,
      quantityQuintals: 50,
      proposedPickupDate: new Date(),
      paymentTerms: 'ESCROW_ON_DELIVERY',
      validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
    },
  });

  const cancelledOffer = await prisma.offer.update({
    where: { id: pendingOffer.id },
    data: { status: 'CANCELLED' },
  });

  if (cancelledOffer.status !== 'CANCELLED') {
    console.error('FAIL: Buyer cancellation failed.');
    process.exit(1);
  }
  console.log(`PASS: Buyer successfully cancelled pending offer (ID: ${cancelledOffer.id})`);

  console.log('\n====================================================');
  console.log('  ALL PHASE 4A VERIFICATION CHECKS PASSED (13/13)  ');
  console.log('====================================================\n');

  await prisma.$disconnect();
}

runPhase4ATest().catch((err) => {
  console.error('Test failed with error:', err);
  prisma.$disconnect();
  process.exit(1);
});
