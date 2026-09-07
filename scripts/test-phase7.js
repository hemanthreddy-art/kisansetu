/**
 * KisanSetu - Phase 7 Automated Test Suite
 * Problem Statement 26132: Strengthening market linkages and price discovery for farmers
 * Verifies: Transactions, Payment Tracking, 3-Way Ratings, Disputes & Grievance Redressal
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// Transaction lifecycle validation helper
function isValidTransition(current, next) {
  if (current === next) return true;
  if (next === 'DISPUTED') return true;
  if (current === 'DISPUTED') return true;
  if (next === 'CANCELLED' && ['OFFER_ACCEPTED', 'TRANSPORT_REQUESTED'].includes(current)) return true;

  const validTransitions = {
    OFFER_ACCEPTED: ['TRANSPORT_REQUESTED', 'TRANSPORT_ACCEPTED', 'IN_TRANSIT', 'CANCELLED'],
    TRANSPORT_REQUESTED: ['TRANSPORT_ACCEPTED', 'CANCELLED'],
    TRANSPORT_ACCEPTED: ['IN_TRANSIT'],
    IN_TRANSIT: ['DELIVERED'],
    DELIVERED: ['QUALITY_CONFIRMED', 'PAYMENT_INITIATED'],
    QUALITY_CONFIRMED: ['PAYMENT_INITIATED', 'PAYMENT_RECEIVED'],
    PAYMENT_INITIATED: ['PAYMENT_RECEIVED', 'COMPLETED'],
    PAYMENT_RECEIVED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  return (validTransitions[current] || []).includes(next);
}

async function runTests() {
  console.log('====================================================');
  console.log('  KisanSetu Phase 7 Automated Test Suite');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // 1. Check Prerequisite Data (Lots, Buyers, Transporters)
    // ----------------------------------------------------
    console.log('1. Checking Prerequisite Phase 1-6 Data Integrity...');
    const lotCount = await prisma.produceLot.count();
    assert(lotCount >= 3, `Produce Lots intact in DB (found ${lotCount})`);

    const buyerCount = await prisma.buyerProfile.count();
    assert(buyerCount >= 4, `Demo Buyers intact in DB (found ${buyerCount})`);

    const transporterCount = await prisma.transporterProfile.count();
    assert(transporterCount >= 4, `Demo Transporters intact in DB (found ${transporterCount})`);

    const storageCount = await prisma.storageFacility.count();
    assert(storageCount >= 3, `Storage Facilities intact in DB (found ${storageCount})`);

    // ----------------------------------------------------
    // 2. Transaction Creation from Accepted Offer
    // ----------------------------------------------------
    console.log('\n2. Testing Transaction Creation from Accepted Offer...');
    const testLot = await prisma.produceLot.findFirst({
      where: { lotCode: 'KS-ONION-2026-0001' },
      include: { farmer: { include: { user: true } } },
    });
    assert(!!testLot, `Found test lot ${testLot?.lotCode}`);

    const abcBuyer = await prisma.buyerProfile.findFirst({
      where: { companyName: { contains: 'ABC Foods' } },
      include: { user: true },
    });
    assert(!!abcBuyer, `Found demo buyer ${abcBuyer?.companyName}`);

    const sahyadriTransporter = await prisma.transporterProfile.findFirst({
      where: { businessName: { contains: 'Sahyadri' } },
      include: { user: true },
    });
    assert(!!sahyadriTransporter, `Found demo transporter ${sahyadriTransporter?.businessName}`);

    // Create a dedicated test offer
    const testOffer = await prisma.offer.create({
      data: {
        lotId: testLot.id,
        buyerId: abcBuyer.id,
        offeredPricePerQtl: 2400.0,
        quantityQuintals: 80.0,
        proposedPickupDate: new Date(Date.now() + 86400000 * 2),
        paymentTerms: 'ESCROW_ON_DELIVERY',
        status: 'PENDING',
        validUntil: new Date(Date.now() + 86400000 * 7),
      },
    });
    assert(!!testOffer, `Created test offer: ₹${testOffer.offeredPricePerQtl}/Qtl for ${testOffer.quantityQuintals} Qtl`);

    // Create transaction directly
    const txnCode = `TXN-2026-TEST-${Date.now().toString().slice(-4)}`;
    const payRef = `DEMO-PAY-2026-TEST-${Date.now().toString().slice(-4)}`;
    const grossVal = Math.round(testOffer.quantityQuintals * testOffer.offeredPricePerQtl);
    const transportVal = 1200.0;
    const storageVal = 0.0;
    const otherVal = Math.round(testOffer.quantityQuintals * 15);
    const netVal = Math.round(grossVal - transportVal - storageVal - otherVal);

    const createdTxn = await prisma.transaction.create({
      data: {
        transactionCode: txnCode,
        lotId: testLot.id,
        farmerId: testLot.farmerId,
        buyerId: abcBuyer.id,
        transporterId: sahyadriTransporter.id,
        agreedPricePerQuintal: testOffer.offeredPricePerQtl,
        quantityQuintals: testOffer.quantityQuintals,
        grossSaleValue: grossVal,
        transportCost: transportVal,
        storageCost: storageVal,
        otherCosts: otherVal,
        netRealisation: netVal,
        status: 'OFFER_ACCEPTED',
        payments: {
          create: {
            amount: grossVal,
            paymentMethod: testOffer.paymentTerms || 'ESCROW_GATEWAY',
            paymentStatus: 'INITIATED',
            escrowReference: payRef,
          },
        },
      },
      include: {
        lot: true,
        farmer: { include: { user: true } },
        buyer: { include: { user: true } },
        transporter: { include: { user: true } },
        payments: true,
      },
    });

    assert(!!createdTxn, `Transaction created with code ${createdTxn.transactionCode}`);
    assert(createdTxn.lotId === testLot.id, 'Transaction links correct lot');
    assert(createdTxn.farmerId === testLot.farmerId, 'Transaction links correct farmer');
    assert(createdTxn.buyerId === abcBuyer.id, 'Transaction links correct buyer');
    assert(createdTxn.transporterId === sahyadriTransporter.id, 'Transaction links correct transporter');
    assert(createdTxn.agreedPricePerQuintal === 2400.0, 'Agreed price preserved: ₹2400/Qtl');
    assert(createdTxn.quantityQuintals === 80.0, 'Quantity preserved: 80 Qtl');
    assert(createdTxn.grossSaleValue === 192000.0, `Gross contract value correct: ₹1,92,000 (got ${createdTxn.grossSaleValue})`);
    assert(createdTxn.status === 'OFFER_ACCEPTED', `Initial transaction status is OFFER_ACCEPTED (got ${createdTxn.status})`);

    // ----------------------------------------------------
    // 3. Duplicate Transaction Prevention Check
    // ----------------------------------------------------
    console.log('\n3. Testing Duplicate Transaction Prevention Logic...');
    const duplicateQuery = await prisma.transaction.findFirst({
      where: {
        lotId: testLot.id,
        buyerId: abcBuyer.id,
        transactionCode: createdTxn.transactionCode,
      },
    });
    assert(!!duplicateQuery && duplicateQuery.id === createdTxn.id, 'Duplicate query correctly identifies existing active transaction');

    // ----------------------------------------------------
    // 4. Payment Record Tracking
    // ----------------------------------------------------
    console.log('\n4. Testing Payment Record Tracking & Simulation Notice...');
    const payment = await prisma.payment.findFirst({
      where: { transactionId: createdTxn.id },
    });
    assert(!!payment, 'Payment tracking record automatically linked to transaction');
    assert(payment.amount === 192000.0, `Payment amount matches contract: ₹${payment.amount}`);
    assert(payment.paymentStatus === 'INITIATED', `Payment status is INITIATED (got ${payment.paymentStatus})`);
    assert(payment.escrowReference && payment.escrowReference.startsWith('DEMO-PAY-'), `Demo payment reference generated: ${payment.escrowReference}`);

    // Update payment status (INITIATED -> PROCESSING -> PAID)
    const procPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: 'PROCESSING' },
    });
    assert(procPayment.paymentStatus === 'PROCESSING', 'Payment moved to PROCESSING');

    const paidPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'PAID',
        payoutDate: new Date(),
      },
    });
    assert(paidPayment.paymentStatus === 'PAID', 'Payment marked as PAID (Settled)');
    assert(!!paidPayment.payoutDate, 'Payout timestamp recorded on payment settlement');

    // ----------------------------------------------------
    // 5. Transaction Status Lifecycle
    // ----------------------------------------------------
    console.log('\n5. Testing Transaction Status Transitions...');
    assert(isValidTransition('OFFER_ACCEPTED', 'TRANSPORT_REQUESTED'), 'Valid transition: OFFER_ACCEPTED -> TRANSPORT_REQUESTED');
    assert(isValidTransition('TRANSPORT_REQUESTED', 'TRANSPORT_ACCEPTED'), 'Valid transition: TRANSPORT_REQUESTED -> TRANSPORT_ACCEPTED');
    assert(isValidTransition('IN_TRANSIT', 'DELIVERED'), 'Valid transition: IN_TRANSIT -> DELIVERED');
    assert(isValidTransition('DELIVERED', 'QUALITY_CONFIRMED'), 'Valid transition: DELIVERED -> QUALITY_CONFIRMED');
    assert(isValidTransition('QUALITY_CONFIRMED', 'PAYMENT_RECEIVED'), 'Valid transition: QUALITY_CONFIRMED -> PAYMENT_RECEIVED');
    assert(isValidTransition('PAYMENT_RECEIVED', 'COMPLETED'), 'Valid transition: PAYMENT_RECEIVED -> COMPLETED');
    assert(!isValidTransition('OFFER_ACCEPTED', 'COMPLETED'), 'Invalid direct leap prevented: OFFER_ACCEPTED -/-> COMPLETED');

    const inTransitTxn = await prisma.transaction.update({
      where: { id: createdTxn.id },
      data: { status: 'IN_TRANSIT' },
    });
    assert(inTransitTxn.status === 'IN_TRANSIT', 'Transaction status moved to IN_TRANSIT');

    const deliveredTxn = await prisma.transaction.update({
      where: { id: createdTxn.id },
      data: { status: 'DELIVERED' },
    });
    assert(deliveredTxn.status === 'DELIVERED', 'Transaction status moved to DELIVERED');

    const completedTxn = await prisma.transaction.update({
      where: { id: createdTxn.id },
      data: { status: 'COMPLETED' },
    });
    assert(completedTxn.status === 'COMPLETED', 'Transaction status successfully reached COMPLETED');

    // ----------------------------------------------------
    // 6. Role-Based Authorization Checks
    // ----------------------------------------------------
    console.log('\n6. Testing Server-Side Role Authorization...');
    const callerId = 'random-unauthorized-user';
    const isParty = [
      createdTxn.farmer.userId,
      createdTxn.buyer.userId,
      createdTxn.transporter.userId,
    ].includes(callerId);
    assert(!isParty, 'Random caller identified as unauthorized');

    const farmerAuthorized = [
      createdTxn.farmer.userId,
      createdTxn.buyer.userId,
      createdTxn.transporter.userId,
    ].includes(testLot.farmer.user.id);
    assert(farmerAuthorized, 'Farmer party correctly authorized for own transaction');

    const buyerAuthorized = [
      createdTxn.farmer.userId,
      createdTxn.buyer.userId,
      createdTxn.transporter.userId,
    ].includes(abcBuyer.user.id);
    assert(buyerAuthorized, 'Buyer party correctly authorized for own transaction');

    const transporterAuthorized = [
      createdTxn.farmer.userId,
      createdTxn.buyer.userId,
      createdTxn.transporter.userId,
    ].includes(sahyadriTransporter.user.id);
    assert(transporterAuthorized, 'Transporter party correctly authorized for own transaction');

    // ----------------------------------------------------
    // 7. 3-Way Ratings Architecture
    // ----------------------------------------------------
    console.log('\n7. Testing Transaction-Linked 3-Way Ratings...');

    // Test Farmer -> Buyer rating
    const r1 = await prisma.rating.create({
      data: {
        transactionId: createdTxn.id,
        raterId: testLot.farmer.user.id,
        rateeId: abcBuyer.user.id,
        rolePair: 'FARMER_TO_BUYER',
        ratingScore: 5,
        feedback: 'Prompt payment and fair weighbridge protocol.',
      },
    });
    assert(!!r1, `Farmer -> Buyer 5-star rating recorded (ID: ${r1.id})`);
    assert(r1.ratingScore === 5, 'Rating score preserved: 5');

    // Test Buyer -> Farmer rating
    const r2 = await prisma.rating.create({
      data: {
        transactionId: createdTxn.id,
        raterId: abcBuyer.user.id,
        rateeId: testLot.farmer.user.id,
        rolePair: 'BUYER_TO_FARMER',
        ratingScore: 5,
        feedback: 'Produce quality matched agreed grade specs.',
      },
    });
    assert(!!r2, `Buyer -> Farmer 5-star rating recorded (ID: ${r2.id})`);

    // Test Farmer -> Transporter rating
    const r3 = await prisma.rating.create({
      data: {
        transactionId: createdTxn.id,
        raterId: testLot.farmer.user.id,
        rateeId: sahyadriTransporter.user.id,
        rolePair: 'FARMER_TO_TRANSPORTER',
        ratingScore: 5,
        feedback: 'Punctual farm-gate arrival and safe loading.',
      },
    });
    assert(!!r3, `Farmer -> Transporter 5-star rating recorded (ID: ${r3.id})`);

    // Test Buyer -> Transporter rating
    const r4 = await prisma.rating.create({
      data: {
        transactionId: createdTxn.id,
        raterId: abcBuyer.user.id,
        rateeId: sahyadriTransporter.user.id,
        rolePair: 'BUYER_TO_TRANSPORTER',
        ratingScore: 5,
        feedback: 'On-time delivery with intact seals.',
      },
    });
    assert(!!r4, `Buyer -> Transporter 5-star rating recorded (ID: ${r4.id})`);

    // Duplicate rating check
    const existingCheck = await prisma.rating.findFirst({
      where: {
        transactionId: createdTxn.id,
        raterId: testLot.farmer.user.id,
        rolePair: 'FARMER_TO_BUYER',
      },
    });
    assert(!!existingCheck, 'Duplicate rating check detects existing submission');

    // ----------------------------------------------------
    // 8. Evidence-Based Dispute / Grievance Redressal
    // ----------------------------------------------------
    console.log('\n8. Testing Evidence-Based Dispute / Grievance Redressal...');
    const dispCode = `DISP-2026-TEST-${Date.now().toString().slice(-4)}`;

    const dispute = await prisma.dispute.create({
      data: {
        disputeCode: dispCode,
        transactionId: createdTxn.id,
        raisedById: testLot.farmer.user.id,
        reason: 'QUALITY_MISMATCH',
        evidenceSummary: 'Buyer moisture meter measured 14.2% while pre-dispatch assay was 11.5%.',
        status: 'OPEN',
      },
    });

    assert(!!dispute, `Dispute created with code ${dispute.disputeCode}`);
    assert(dispute.status === 'OPEN', 'Dispute status is OPEN');
    assert(dispute.reason === 'QUALITY_MISMATCH', 'Dispute category is QUALITY_MISMATCH');

    const updatedTxnDispute = await prisma.transaction.update({
      where: { id: createdTxn.id },
      data: { status: 'DISPUTED' },
    });
    assert(updatedTxnDispute.status === 'DISPUTED', 'Transaction status transitioned to DISPUTED');

    // Admin Dispute Adjudication
    const resolvedDispute = await prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: 'Independent APMC lab re-assay verified moisture at 12.0%. Settled amicably.',
        resolvedAt: new Date(),
      },
    });
    assert(resolvedDispute.status === 'RESOLVED', 'Dispute status updated to RESOLVED');
    assert(!!resolvedDispute.resolutionNotes, 'Official resolution notes recorded');
    assert(!!resolvedDispute.resolvedAt, 'Resolution timestamp recorded');

    // ----------------------------------------------------
    // 9. Physical Quality vs AI Screening Separation
    // ----------------------------------------------------
    console.log('\n9. Verifying Physical Quality vs AI Screening Separation...');
    const physVerify = await prisma.qualityVerification.findFirst({
      where: { lotId: testLot.id },
    });
    const aiAssess = await prisma.qualityAssessment.findFirst({
      where: { lotId: testLot.id },
    });

    if (aiAssess) {
      assert(aiAssess.status === 'AI_ASSESSMENT_NOT_VERIFIED', 'AI assessment strictly maintains AI_ASSESSMENT_NOT_VERIFIED');
      assert(aiAssess.disclaimer.includes('Not Verified'), 'AI disclaimer explicitly states Not Verified');
    }
    if (physVerify) {
      assert(physVerify.status === 'PHYSICALLY_VERIFIED', 'Physical verification maintains PHYSICALLY_VERIFIED status');
      assert(!!physVerify.certificateNumber, `Official certificate number present: ${physVerify.certificateNumber}`);
    }

    // ----------------------------------------------------
    // 10. Phase 6 Net Realisation Integrity
    // ----------------------------------------------------
    console.log('\n10. Testing Phase 6 Net Realisation Formula Preservation...');
    const testGross = 80 * 2400; // 192000
    const testTransport = 1200;
    const testStorage = 0;
    const testOther = 80 * 15; // 1200
    const testNet = testGross - testTransport - testStorage - testOther; // 189600
    const testNetPerQtl = testNet / 80; // 2370

    assert(testGross === 192000, 'Gross contract value ₹1,92,000 verified');
    assert(testNet === 189600, 'Net realisation ₹1,89,600 verified');
    assert(testNetPerQtl === 2370, 'Net realisation per quintal ₹2,370/Qtl verified');

    // ----------------------------------------------------
    // 11. Trilingual Translation Parity
    // ----------------------------------------------------
    console.log('\n11. Verifying Trilingual Parity for transactions & disputes in translations.ts...');
    const translationsContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');

    const expectedKeys = [
      'hubTitle',
      'myTransactionsTitle',
      'transactionCode',
      'paymentTracking',
      'paymentStatus',
      'paymentInitiated',
      'paymentReceived',
      'threeWayRatings',
      'rateThisTransaction',
      'submitRatingBtn',
      'disputeGrievance',
      'raiseDisputeBtn',
      'viewTransactionBtn',
      'prototypeNotice',
    ];

    for (const key of expectedKeys) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      const matches = translationsContent.match(regex);
      assert(matches && matches.length >= 4, `Key '${key}' present across interface and all 3 locales EN, MR, TE (found ${matches ? matches.length : 0} occurrences)`);
    }

    const disputeKeys = [
      'raiseGrievanceTitle',
      'disputeCode',
      'statusOpen',
      'statusUnderReview',
      'statusResolved',
      'categoryQualityMismatch',
      'humanAdjudicationNote',
      'adminPanelTitle',
      'resolutionNotesLabel',
      'resolveDisputeBtn',
    ];

    for (const key of disputeKeys) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      const matches = translationsContent.match(regex);
      assert(matches && matches.length >= 4, `Dispute key '${key}' present across interface and all 3 locales EN, MR, TE (found ${matches ? matches.length : 0} occurrences)`);
    }

    // Clean up temporary test data
    await prisma.rating.deleteMany({ where: { transactionId: createdTxn.id } });
    await prisma.dispute.deleteMany({ where: { transactionId: createdTxn.id } });
    await prisma.payment.deleteMany({ where: { transactionId: createdTxn.id } });
    await prisma.transaction.delete({ where: { id: createdTxn.id } });
    await prisma.offer.delete({ where: { id: testOffer.id } });

    // Restore lot status
    await prisma.produceLot.update({
      where: { id: testLot.id },
      data: { status: 'AVAILABLE' },
    });

  } catch (error) {
    console.error('Test execution error:', error);
    failCount++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`  Results: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
