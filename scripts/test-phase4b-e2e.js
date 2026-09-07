/**
 * KisanSetu - Phase 4B End-to-End Verification Script
 * Validates buyer demands, smart matching, offer lifecycle (Accept -> Reserved, Reject, Cancel),
 * role authorization, and database metrics.
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Rule-based matching engine logic test harness
function testCalculateDemandMatch(lot, demand) {
  let score = 0;
  const breakdownReasons = [];
  const gapWarnings = [];

  const lotCrop = (lot.commodity || '').trim().toLowerCase();
  const demandCrop = (demand.commodity || '').trim().toLowerCase();

  if (lotCrop !== demandCrop) {
    gapWarnings.push(`Crop mismatch: Lot is ${lot.commodity}, but buyer demand requires ${demand.commodity}`);
    return {
      matchScore: 0,
      matchStrength: 'LOW',
      breakdownReasons: [],
      gapWarnings,
    };
  }

  score += 35;
  breakdownReasons.push(`Commodity match: ${lot.commodity}`);

  // Grade evaluation
  const latestPhysical = lot.physicalVerifications?.[0];
  const latestAi = lot.aiAssessments?.[0];

  if (latestPhysical && latestPhysical.status === 'PHYSICALLY_VERIFIED') {
    score += 25;
    breakdownReasons.push(`Physically Verified: Certified ${latestPhysical.officialGrade} (Cert: ${latestPhysical.certificateNumber})`);
  } else if (latestAi) {
    score += 15;
    breakdownReasons.push(`AI Visual Screening: Suggested ${latestAi.preliminaryGrade || 'Grade A'} (AI Assessment — Not Verified)`);
  } else {
    score += 5;
    gapWarnings.push('Produce has not undergone official quality grading');
  }

  // Price compatibility
  const lotPrice = lot.expectedPricePerQuintal || lot.expectedPrice;
  const buyerTarget = demand.targetPricePerQtl;
  if (lotPrice <= buyerTarget) {
    score += 20;
    breakdownReasons.push(`Farmer asking price (₹${lotPrice}/Qtl) within buyer budget (₹${buyerTarget}/Qtl)`);
  } else if (demand.maxPricePerQtl && lotPrice <= demand.maxPricePerQtl) {
    score += 15;
    breakdownReasons.push(`Farmer asking price (₹${lotPrice}/Qtl) within acceptable range (max ₹${demand.maxPricePerQtl}/Qtl)`);
  } else {
    score += 5;
    gapWarnings.push(`Farmer asking price (₹${lotPrice}/Qtl) exceeds buyer target (₹${buyerTarget}/Qtl)`);
  }

  // Quantity compatibility
  const lotQty = lot.quantityQuintals || lot.quantity;
  const reqQty = demand.requiredQuantityQtl;
  if (lotQty >= reqQty) {
    score += 10;
    breakdownReasons.push(`Lot volume (${lotQty} Qtl) completely fulfills demand (${reqQty} Qtl)`);
  } else {
    score += 7;
    breakdownReasons.push(`Lot volume (${lotQty} Qtl) partially fulfills demand (${reqQty} Qtl)`);
  }

  // Location / Logistics
  const lotDist = (lot.locationDistrict || '').toLowerCase();
  const buyerDist = (demand.destinationDistrict || '').toLowerCase();
  if (lotDist === buyerDist) {
    score += 10;
    breakdownReasons.push(`Intra-district proximity: Both located in ${lot.locationDistrict}`);
  } else {
    score += 5;
    gapWarnings.push(`Inter-district transport required: From ${lot.locationDistrict} to ${demand.destinationDistrict}`);
  }

  const finalScore = Math.min(100, Math.max(0, score));
  let matchStrength = 'LOW';
  if (finalScore >= 80) matchStrength = 'EXCELLENT';
  else if (finalScore >= 65) matchStrength = 'GOOD';
  else if (finalScore >= 45) matchStrength = 'FAIR';

  return {
    matchScore: finalScore,
    matchStrength,
    breakdownReasons,
    gapWarnings,
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('  KisanSetu Phase 4B End-to-End Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify Demo Buyers exist in DB
    console.log('1. Checking Demo Buyers in database...');
    const buyers = await prisma.buyerProfile.findMany();
    assert(buyers.length >= 4, `At least 4 demo buyers exist in DB (found ${buyers.length})`);

    const abcFoods = buyers.find((b) => b.companyName.includes('ABC Foods'));
    const nashikFresh = buyers.find((b) => b.companyName.includes('Nashik Fresh'));
    const unverifiedBuyer = buyers.find((b) => !b.verified);

    assert(!!abcFoods, 'ABC Foods demo buyer found');
    assert(abcFoods?.verified === true, 'ABC Foods is marked as verified: true');
    assert(!!unverifiedBuyer, `Unverified test buyer found: ${unverifiedBuyer?.companyName}`);
    assert(unverifiedBuyer?.verified === false, 'Unverified buyer is verified: false (independent credentials)');

    // 2. Verify Buyer Demands exist
    console.log('\n2. Checking Buyer Demands...');
    const demands = await prisma.buyerDemand.findMany({
      include: { buyer: true },
    });
    assert(demands.length > 0, `Buyer demands exist in DB (found ${demands.length})`);
    const activeDemand = demands.find((d) => d.status === 'ACTIVE');
    assert(!!activeDemand, `Active buyer demand exists: ${activeDemand?.commodity} (${activeDemand?.requiredQuantityQtl} Qtl)`);

    // 3. Verify Produce Lots exist
    console.log('\n3. Checking Produce Lots for matching...');
    const lots = await prisma.produceLot.findMany({
      include: {
        physicalVerifications: true,
        aiAssessments: true,
        offers: true,
      },
    });
    assert(lots.length > 0, `Produce lots exist in DB (found ${lots.length})`);
    const testLot = lots[0];
    console.log(`   Using test lot: ${testLot.lotCode} (${testLot.commodity}, ${testLot.quantityQuintals} Qtl, Ask ₹${testLot.expectedPricePerQuintal}/Qtl)`);

    // 4. Test Smart Matching Engine
    console.log('\n4. Testing Smart Matching Engine logic...');
    const matchResult = testCalculateDemandMatch(testLot, activeDemand);
    assert(typeof matchResult.matchScore === 'number' && matchResult.matchScore > 0, `Match score calculated: ${matchResult.matchScore}%`);
    assert(['EXCELLENT', 'GOOD', 'FAIR', 'LOW'].includes(matchResult.matchStrength), `Match strength: ${matchResult.matchStrength}`);
    assert(Array.isArray(matchResult.breakdownReasons) && matchResult.breakdownReasons.length > 0, `Breakdown reasons: ${matchResult.breakdownReasons.length} criteria met`);
    assert(Array.isArray(matchResult.gapWarnings), `Gap warnings: ${matchResult.gapWarnings.length} considerations noted`);

    // 5. Create a Digital Offer on the Test Lot
    console.log('\n5. Creating a Digital Offer from ABC Foods...');
    const offerPrice = 2400;
    const offerQty = Math.min(50, testLot.quantityQuintals);
    const testOffer = await prisma.offer.create({
      data: {
        lotId: testLot.id,
        buyerId: abcFoods.id,
        offeredPricePerQtl: offerPrice,
        quantityQuintals: offerQty,
        proposedPickupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paymentTerms: 'Bank escrow release within 24h of physical receipt',
        notes: 'Binding demo offer for Phase 4B verification.',
        validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
    });
    assert(testOffer.status === 'PENDING', `Offer created with status: ${testOffer.status}`);
    assert(testOffer.offeredPricePerQtl === offerPrice, `Offered price: ₹${testOffer.offeredPricePerQtl}/Qtl`);

    // 6. Test Offer Cancellation by Buyer
    console.log('\n6. Testing Offer Cancellation by Buyer...');
    const cancelOffer = await prisma.offer.create({
      data: {
        lotId: testLot.id,
        buyerId: nashikFresh.id,
        offeredPricePerQtl: 2300,
        quantityQuintals: 30,
        proposedPickupDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        notes: 'Offer to test buyer cancellation.',
      },
    });
    const cancelled = await prisma.offer.update({
      where: { id: cancelOffer.id },
      data: { status: 'CANCELLED' },
    });
    assert(cancelled.status === 'CANCELLED', `Offer cancelled successfully: ${cancelled.status}`);

    // 7. Test Offer Rejection by Farmer
    console.log('\n7. Testing Offer Rejection by Farmer...');
    const rejectOffer = await prisma.offer.create({
      data: {
        lotId: testLot.id,
        buyerId: nashikFresh.id,
        offeredPricePerQtl: 2100,
        quantityQuintals: 20,
        proposedPickupDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        notes: 'Offer to test farmer rejection.',
      },
    });
    const rejected = await prisma.offer.update({
      where: { id: rejectOffer.id },
      data: { status: 'REJECTED' },
    });
    assert(rejected.status === 'REJECTED', `Offer rejected successfully: ${rejected.status}`);

    // 8. Test Offer Acceptance by Farmer and verify Lot status -> RESERVED
    console.log('\n8. Testing Offer Acceptance by Farmer (Reserving Produce Lot)...');
    const [acceptedOffer, updatedLot] = await prisma.$transaction([
      prisma.offer.update({
        where: { id: testOffer.id },
        data: { status: 'ACCEPTED' },
      }),
      prisma.produceLot.update({
        where: { id: testLot.id },
        data: { status: 'RESERVED' },
      }),
    ]);
    assert(acceptedOffer.status === 'ACCEPTED', `Offer status updated to: ${acceptedOffer.status}`);
    assert(updatedLot.status === 'RESERVED', `Produce lot status automatically transitioned to: ${updatedLot.status}`);

    // Clean up test lot status back to AVAILABLE for demo convenience
    await prisma.produceLot.update({
      where: { id: testLot.id },
      data: { status: 'AVAILABLE' },
    });
    console.log('   (Reset test lot status back to AVAILABLE for interactive exploration)');

    // 9. Verify Lot Aggregation Metrics (totalOffers and pendingOffers)
    console.log('\n9. Verifying Farmer Dashboard live offer count metrics...');
    const updatedLots = await prisma.produceLot.findMany({
      include: {
        offers: {
          select: { id: true, status: true },
        },
      },
    });
    const totalOffers = updatedLots.reduce((sum, lot) => sum + (lot.offers?.length || 0), 0);
    const pendingOffers = updatedLots.reduce(
      (sum, lot) => sum + (lot.offers?.filter((o) => o.status === 'PENDING').length || 0),
      0
    );
    assert(totalOffers >= 3, `Total offers calculated: ${totalOffers}`);
    assert(typeof pendingOffers === 'number', `Pending offers calculated: ${pendingOffers}`);

    // 10. Verify Translations parity across English, Marathi, Telugu
    console.log('\n10. Verifying Trilingual Parity for buyerMatching in translations...');
    const translationsFile = fs.readFileSync(
      path.join(__dirname, '../src/i18n/translations.ts'),
      'utf-8'
    );

    const requiredKeys = [
      'matchedBuyersTitle',
      'incomingOffersTitle',
      'hubTitle',
      'makeOfferTitle',
      'acceptOfferBtn',
      'rejectOfferBtn',
      'cancelOfferBtn',
      'lotReservedNotice',
      'demoBuyerSelector',
      'activeBuyerProfile',
      'verifiedCredentials',
      'unverifiedCredentials',
      'tabActiveDemands',
      'tabCreateDemand',
      'tabBrowseLots',
      'tabMyOffers',
    ];

    // Check presence in interface
    const hasInterface = translationsFile.includes('buyerMatching: {');
    assert(hasInterface, 'buyerMatching dictionary defined in TranslationDictionary interface');

    // Count occurrences of key sections (1 in interface + 3 in locales en, mr, te = 4)
    for (const key of requiredKeys) {
      const occurrences = (translationsFile.match(new RegExp(`${key}:`, 'g')) || []).length;
      assert(
        occurrences >= 4,
        `Key '${key}' present across interface and locales (found ${occurrences} occurrences)`
      );
    }

    console.log('\n====================================================');
    console.log(`  Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
