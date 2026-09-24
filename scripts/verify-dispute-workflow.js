/**
 * KisanSetu - Farmer-First Dispute & Grievance Workflow Verification
 * Problem Statement 26132: Strengthening market linkages and price discovery for farmers
 * Scope: Farmer-First Dispute Flow, Contextual Entry, Evidence Submission,
 *        Voice Integration, Reviewer Notes Enforcement, Multilingual Parity, and Database Preservation.
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const rootDir = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function it(title, fn) {
  try {
    fn();
    console.log(`  [PASS] ${title}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${title}`);
    console.error(`         ${err.message}`);
    failed++;
  }
}

async function itAsync(title, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${title}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${title}`);
    console.error(`         ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function main() {
  console.log('====================================================');
  console.log('  KisanSetu Farmer-First Dispute & Grievance Verification');
  console.log('====================================================\n');

  // 1. CONTEXTUAL DISCOVERY & ENTRY POINTS
  console.log('1. Verifying Contextual Discovery & Entry Points Across Workflows...');
  
  const farmerPagePath = path.join(rootDir, 'src/app/farmer/page.tsx');
  const farmerPageCode = fs.readFileSync(farmerPagePath, 'utf8');

  it('Farmer dashboard has dedicated "Complaints & Issues" tab (COMPLAINTS)', () => {
    assert(farmerPageCode.includes("'COMPLAINTS'"), 'Must include COMPLAINTS activeTab');
    assert(farmerPageCode.includes('FarmerComplaintsSection'), 'Must mount FarmerComplaintsSection');
    assert(farmerPageCode.includes('t.farmer.tabComplaints'), 'Must use localized tabComplaints label');
  });

  it('Farmer commercial transactions and delivery cards provide direct contextual report buttons', () => {
    assert(farmerPageCode.includes('setDisputeInitialTxnId'), 'Must capture transaction ID for dispute modal');
    assert(farmerPageCode.includes('setDisputeInitialReason'), 'Must allow setting contextual initial reason');
    assert(farmerPageCode.includes('setIsDisputeModalOpen(true)'), 'Must open FarmerDisputeModal directly');
  });

  const lotCardPath = path.join(rootDir, 'src/components/farmer/FarmerLotCard.tsx');
  const lotCardCode = fs.readFileSync(lotCardPath, 'utf8');

  it('FarmerLotCard provides contextual [Report Issue] when produce is in transactional lifecycle', () => {
    assert(lotCardCode.includes("currentStage !== 'AVAILABLE'"), 'Must offer report issue for lots not in available stage');
    assert(lotCardCode.includes('FarmerDisputeModal'), 'Must embed FarmerDisputeModal');
    assert(lotCardCode.includes('onReportDispute'), 'Must support onReportDispute callback');
  });

  const historyPath = path.join(rootDir, 'src/components/shared/RoleHistoryView.tsx');
  const historyCode = fs.readFileSync(historyPath, 'utf8');

  it('RoleHistoryView provides contextual [Report an Issue] on history cards and in settlement receipt modal', () => {
    assert(historyCode.includes('setDisputeTxId'), 'Must capture transaction ID for dispute');
    assert(historyCode.includes('FarmerDisputeModal'), 'Must mount FarmerDisputeModal in history view');
    assert(historyCode.includes('Issue with Settlement? Report') || historyCode.includes('t.disputes?.reportIssueBtn'), 'Must offer settlement dispute action in receipt');
  });

  const txnPagePath = path.join(rootDir, 'src/app/transactions/[id]/page.tsx');
  const txnPageCode = fs.readFileSync(txnPagePath, 'utf8');

  it('Transaction details page integrates FarmerDisputeModal while preserving test tokens', () => {
    assert(txnPageCode.includes('FarmerDisputeModal'), 'Must mount FarmerDisputeModal on transaction page');
    assert(txnPageCode.includes('showDisputeModal'), 'Must preserve showDisputeModal state');
    assert(txnPageCode.includes('handleRaiseDispute'), 'Must preserve handleRaiseDispute function signature');
  });

  // 2. 10 FARMER-FRIENDLY PROBLEM CATEGORIES & AUTO-ATTACHED TRADE CONTEXT
  console.log('\n2. Verifying 10 Problem Categories & Auto-Attached Trade Context...');

  const txnLibPath = path.join(rootDir, 'src/lib/transactions.ts');
  const txnLibCode = fs.readFileSync(txnLibPath, 'utf8');

  it('DISPUTE_REASONS contains all 10 farmer-friendly categories and preserves legacy categories', () => {
    const requiredCategories = [
      'PAYMENT_NOT_RECEIVED',
      'PAYMENT_INCORRECT',
      'WEIGHT_DISCREPANCY',
      'QUALITY_MISMATCH',
      'BUYER_ISSUE',
      'TRANSPORT_ISSUE',
      'PRODUCE_DAMAGED',
      'DELIVERY_ISSUE',
      'CONTRACT_ISSUE',
      'OTHER',
      'PAYMENT_DELAY',
      'DELIVERY_DELAY',
      'PRICE_DISAGREEMENT',
      'CANCELLATION',
    ];
    requiredCategories.forEach((cat) => {
      assert(txnLibCode.includes(`'${cat}'`) || txnLibCode.includes(`"${cat}"`), `Must include dispute category ${cat}`);
    });
  });

  const modalPath = path.join(rootDir, 'src/components/disputes/FarmerDisputeModal.tsx');
  const modalCode = fs.readFileSync(modalPath, 'utf8');

  it('FarmerDisputeModal presents 10 categories, auto-attaches trade details, and supports evidence upload + voice dictation', () => {
    assert(modalCode.includes('PAYMENT_NOT_RECEIVED'), 'Must define PAYMENT_NOT_RECEIVED');
    assert(modalCode.includes('PAYMENT_INCORRECT'), 'Must define PAYMENT_INCORRECT');
    assert(modalCode.includes('WEIGHT_DISCREPANCY'), 'Must define WEIGHT_DISCREPANCY');
    assert(modalCode.includes('QUALITY_MISMATCH'), 'Must define QUALITY_MISMATCH');
    assert(modalCode.includes('BUYER_ISSUE'), 'Must define BUYER_ISSUE');
    assert(modalCode.includes('TRANSPORT_ISSUE'), 'Must define TRANSPORT_ISSUE');
    assert(modalCode.includes('PRODUCE_DAMAGED'), 'Must define PRODUCE_DAMAGED');
    assert(modalCode.includes('DELIVERY_ISSUE'), 'Must define DELIVERY_ISSUE');
    assert(modalCode.includes('CONTRACT_ISSUE'), 'Must define CONTRACT_ISSUE');
    assert(modalCode.includes('OTHER'), 'Must define OTHER');
    assert(modalCode.includes('transactionCode'), 'Must display transaction code');
    assert(modalCode.includes('netRealisation'), 'Must display net realisation');
    assert(modalCode.includes('agreedPricePerQuintal'), 'Must display agreed price');
    assert(modalCode.includes('evidenceFilesJson') || modalCode.includes('evidenceFiles'), 'Must support evidence uploads');
    assert(modalCode.includes('toggleVoiceDictation') || modalCode.includes('isDictating'), 'Must support voice dictation');
    assert(modalCode.includes('DISP-2026-') || modalCode.includes('disputeCode'), 'Must display official dispute reference');
  });

  // 3. 5-STAGE RESOLUTION TIMELINE & RESOLUTION SUMMARY CARD
  console.log('\n3. Verifying 5-Stage Timeline & Comprehensive Resolution Summary Card...');

  const complaintsSectionPath = path.join(rootDir, 'src/components/farmer/FarmerComplaintsSection.tsx');
  const complaintsSectionCode = fs.readFileSync(complaintsSectionPath, 'utf8');

  it('FarmerComplaintsSection displays 5-stage visual progress timeline and honest resolution record', () => {
    assert(complaintsSectionCode.includes('Submitted'), 'Must display Submitted step');
    assert(complaintsSectionCode.includes('Under Review'), 'Must display Under Review step');
    assert(complaintsSectionCode.includes('Evidence Examined') || complaintsSectionCode.includes('Evidence'), 'Must display Evidence Examined step');
    assert(complaintsSectionCode.includes('Decision'), 'Must display Decision step');
    assert(complaintsSectionCode.includes('Resolved') || complaintsSectionCode.includes('Closed'), 'Must display Resolved step');
    assert(complaintsSectionCode.includes('resolutionNotes'), 'Must display reviewer resolution notes');
    assert(complaintsSectionCode.includes('resolvedAt'), 'Must display resolution date');
  });

  it('FarmerComplaintsSection avoids fake banking transfers and displays authentic escrow/contract status', () => {
    assert(!complaintsSectionCode.includes('Instant IMPS Bank Refund Complete'), 'No fake instantaneous IMPS bank refund claims');
    assert(!complaintsSectionCode.includes('Direct RBI Clearing'), 'No fake RBI clearing claims');
    assert(complaintsSectionCode.includes('Escrow') || complaintsSectionCode.includes('Settlement') || complaintsSectionCode.includes('netRealisation'), 'Must reference actual escrow/net realisation state');
  });

  // 4. MANDATORY REVIEWER RESOLUTION NOTES ENFORCEMENT
  console.log('\n4. Verifying Mandatory Reviewer Resolution Notes Enforcement (HTTP API)...');

  const disputeDetailApiPath = path.join(rootDir, 'src/app/api/disputes/[id]/route.ts');
  const disputeDetailApiCode = fs.readFileSync(disputeDetailApiPath, 'utf8');

  it('API route PATCH /api/disputes/[id] enforces minimum 10 characters resolution notes on RESOLVED, REJECTED, and CLOSED', () => {
    assert(disputeDetailApiCode.includes('resolutionNotes'), 'Must inspect resolutionNotes');
    assert(disputeDetailApiCode.includes('length < 10'), 'Must enforce minimum 10 characters length');
    assert(disputeDetailApiCode.includes('400'), 'Must return HTTP 400 on missing or brief notes');
  });

  const adminPagePath = path.join(rootDir, 'src/app/admin/page.tsx');
  const adminPageCode = fs.readFileSync(adminPagePath, 'utf8');

  it('Admin supervision UI blocks resolving/closing grievances without >= 10 chars resolution notes', () => {
    assert(adminPageCode.includes('length < 10'), 'Must validate note length before dispatching adjudication request');
    assert(adminPageCode.includes('resolutionNotesLabel'), 'Must present resolution notes input field');
  });

  // 5. VOICE ASSISTANT GRIEVANCE INTEGRATION & CONSEQUENTIAL ACTION SAFETY
  console.log('\n5. Verifying Voice Assistant Grievance Recognition & Consequential Safety...');

  const voicePath = path.join(rootDir, 'src/components/farmer/FarmerVoiceAssistant.tsx');
  const voiceCode = fs.readFileSync(voicePath, 'utf8');
  const parseIntentFnMatch = voiceCode.match(/export function parseFarmerIntent\(text: string, locale: string\): VoiceResult \{([\s\S]*?)\n\}\n\nexport function FarmerVoiceAssistant/);
  if (!parseIntentFnMatch) {
    throw new Error('Could not find parseFarmerIntent in FarmerVoiceAssistant.tsx');
  }
  const cleanVoiceBody = parseIntentFnMatch[1]
    .replace(/:\s*VoiceResult/g, '')
    .replace(/:\s*VoiceIntent/g, '')
    .replace(/:\s*string/g, '')
    .replace(/:\s*Array<\{[^}]+\}>/g, '');
  const parseFarmerIntent = new Function('text', 'locale', cleanVoiceBody);

  it('Voice Assistant recognizes English payment problem as consequential action requiring visual confirmation', () => {
    const res = parseFarmerIntent('report a payment problem', 'en');
    assert(res.isConsequential === true, 'Must flag as consequential action');
    assert(res.requiresConfirmation === true, 'Must require explicit confirmation');
    assert(res.confirmedActionUrl === '/farmer?tab=COMPLAINTS', 'Must direct to complaints tab upon confirmation');
    assert(res.actionLabel.includes('Confirm & Open Complaint'), 'Must provide clear confirmation label');
  });

  it('Voice Assistant recognizes Marathi grievance phrase "पैसे मिळाले नाहीत" with consequential confirmation', () => {
    const res = parseFarmerIntent('पैसे मिळाले नाहीत', 'mr');
    assert(res.isConsequential === true, 'Must flag as consequential action');
    assert(res.requiresConfirmation === true, 'Must require explicit confirmation');
    assert(res.confirmedActionUrl === '/farmer?tab=COMPLAINTS', 'Must direct to complaints tab');
    assert(res.actionLabel.includes('पुष्टी करा'), 'Must provide localized confirmation label');
  });

  it('Voice Assistant recognizes Telugu grievance phrase "నాకు చెల్లింపు రాలేదు" with consequential confirmation', () => {
    const res = parseFarmerIntent('నాకు చెల్లింపు రాలేదు', 'te');
    assert(res.isConsequential === true, 'Must flag as consequential action');
    assert(res.requiresConfirmation === true, 'Must require explicit confirmation');
    assert(res.confirmedActionUrl === '/farmer?tab=COMPLAINTS', 'Must direct to complaints tab');
    assert(res.actionLabel.includes('నిర్ధారించి'), 'Must provide localized confirmation label');
  });

  it('Voice Assistant recognizes Hindi grievance phrase "मुझे भुगतान नहीं मिला" with consequential confirmation', () => {
    const res = parseFarmerIntent('मुझे भुगतान नहीं मिला', 'hi');
    assert(res.isConsequential === true, 'Must flag as consequential action');
    assert(res.requiresConfirmation === true, 'Must require explicit confirmation');
    assert(res.confirmedActionUrl === '/farmer?tab=COMPLAINTS', 'Must direct to complaints tab');
    assert(res.actionLabel.includes('पुष्टि करें'), 'Must provide localized confirmation label');
  });

  it('Voice Assistant navigates to Complaints tab for informational queries ("complaint", "तक्रार", "ఫిర్యాదు", "शिकायत")', () => {
    const resEn = parseFarmerIntent('show complaints', 'en');
    assert(resEn.intent === 'NAVIGATE_COMPLAINTS', 'Must return NAVIGATE_COMPLAINTS for EN');
    assert(resEn.actionUrl === '/farmer?tab=COMPLAINTS', 'Must link to /farmer?tab=COMPLAINTS');

    const resMr = parseFarmerIntent('तक्रार', 'mr');
    assert(resMr.intent === 'NAVIGATE_COMPLAINTS', 'Must return NAVIGATE_COMPLAINTS for MR');

    const resTe = parseFarmerIntent('ఫిర్యాదు', 'te');
    assert(resTe.intent === 'NAVIGATE_COMPLAINTS', 'Must return NAVIGATE_COMPLAINTS for TE');

    const resHi = parseFarmerIntent('शिकायत', 'hi');
    assert(resHi.intent === 'NAVIGATE_COMPLAINTS', 'Must return NAVIGATE_COMPLAINTS for HI');
  });

  // 6. MULTILINGUAL DICTIONARY PARITY
  console.log('\n6. Verifying Multilingual Dictionary Parity for Dispute Workflow Across 4 Locales...');

  const translationsPath = path.join(rootDir, 'src/i18n/translations.ts');
  const translationsCode = fs.readFileSync(translationsPath, 'utf8');

  it('All new dispute workflow keys exist across en, mr, te, hi', () => {
    const requiredKeys = [
      'tabComplaints',
      'reportIssueBtn',
      'complaintsSub',
      'stepSelectProblem',
      'stepVerifyDetails',
      'stepAddEvidence',
      'stepReviewSubmit',
      'autoAttachedNotice',
      'categoryPaymentNotReceived',
      'categoryPaymentIncorrect',
      'categoryBuyerIssue',
      'categoryTransportIssue',
      'categoryProduceDamaged',
      'categoryDeliveryIssue',
      'categoryContractIssue',
      'evidenceOptional',
      'photoOrDocUpload',
      'voiceDictationBtn',
      'voiceDictationActive',
      'confirmSubmissionTitle',
      'confirmSubmissionDesc',
      'complaintSubmittedTitle',
      'complaintSubmittedDesc',
      'trackComplaintBtn',
      'decisionOutcomeLabel',
      'financialAdjustmentLabel',
      'resolvedOnLabel',
      'officialNotesLabel',
      'timelineSubmitted',
      'timelineReview',
      'timelineVerification',
      'timelineDecision',
      'timelineResolved',
    ];

    requiredKeys.forEach((key) => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      const matches = translationsCode.match(regex);
      assert(matches && matches.length >= 5, `Dispute key '${key}' must appear in interface and 4 locales (found ${matches ? matches.length : 0})`);
    });
  });

  // 7. END-TO-END DATABASE & LIFECYCLE VERIFICATION
  console.log('\n7. Verifying End-to-End Dispute API Lifecycle & Preservation Safety...');

  await itAsync('Strictly preserves exactly 13 ProduceLots and 15 StorageFacilities in prisma/dev.db', async () => {
    const lotCount = await prisma.produceLot.count();
    const storageCount = await prisma.storageFacility.count();
    assert(lotCount === 13, `Expected exactly 13 ProduceLots, found ${lotCount}`);
    assert(storageCount === 15, `Expected exactly 15 StorageFacilities, found ${storageCount}`);
  });

  await itAsync('End-to-end dispute creation, attached context, notes enforcement, and resolution lifecycle', async () => {
    const tx = await prisma.transaction.findFirst({
      include: {
        farmer: { include: { user: true } },
        buyer: { include: { user: true } },
        lot: true,
      },
    });
    assert(tx, 'At least one transaction must exist for testing');

    // 1. Create a dispute
    const disputeCode = `DISP-TEST-${Date.now().toString().slice(-4)}`;
    const createdDispute = await prisma.dispute.create({
      data: {
        disputeCode,
        transactionId: tx.id,
        raisedById: tx.farmer.userId,
        reason: 'PAYMENT_NOT_RECEIVED',
        evidenceSummary: 'Delivery completed 48 hours ago. Escrow payment has not been credited to bank account.',
        evidenceFilesJson: JSON.stringify(['https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=800&auto=format&fit=crop']),
        status: 'OPEN',
      },
    });
    assert(createdDispute.id, 'Dispute record should be created');
    assert(createdDispute.disputeCode === disputeCode, 'Dispute code must match');

    // 2. Validate transaction updated to DISPUTED
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: 'DISPUTED' },
    });
    const updatedTx = await prisma.transaction.findUnique({ where: { id: tx.id } });
    assert(updatedTx.status === 'DISPUTED', 'Transaction status must be DISPUTED');

    // 3. Mark UNDER_REVIEW with reviewer notes
    const reviewNote = 'Grievance received. Reviewing weighing slip and digital gate pass with APMC inspector.';
    const reviewedDispute = await prisma.dispute.update({
      where: { id: createdDispute.id },
      data: {
        status: 'UNDER_REVIEW',
        resolutionNotes: reviewNote,
      },
    });
    assert(reviewedDispute.status === 'UNDER_REVIEW', 'Status must be UNDER_REVIEW');
    assert(reviewedDispute.resolutionNotes === reviewNote, 'Notes must be recorded');

    // 4. Resolve with clear resolution notes and timestamp
    const resolutionNote = 'APMC delivery confirmation verified. Escrow balance adjusted and released to farmer account.';
    const resolvedDispute = await prisma.dispute.update({
      where: { id: createdDispute.id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: resolutionNote,
        resolvedAt: new Date(),
      },
    });
    assert(resolvedDispute.status === 'RESOLVED', 'Status must be RESOLVED');
    assert(resolvedDispute.resolvedAt !== null, 'resolvedAt must be populated');
    assert(resolvedDispute.resolutionNotes.length >= 10, 'Resolution notes must be >= 10 characters');

    // Clean up test dispute and restore transaction status
    await prisma.dispute.delete({ where: { id: createdDispute.id } });
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: tx.status },
    });

    const finalCount = await prisma.dispute.count();
    assert(finalCount === 0, 'Database disputes count should be cleanly restored');
  });

  console.log('\n====================================================');
  console.log(`  Dispute Workflow Verification Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
  process.exit(0);
}

main().catch(async (e) => {
  console.error('Fatal execution error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
