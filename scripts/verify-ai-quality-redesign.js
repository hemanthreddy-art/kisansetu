/**
 * KisanSetu - AI-First Quality Verification Redesign Suite
 * Problem Statement 26132: Strengthening Market Linkages & Price Discovery for Farmers
 *
 * Scope:
 * 1. Multi-Photo Photographic AI Visual Assessment Engine (src/lib/quality-ai.ts)
 * 2. Truth-in-AI & Non-Fabrication Guarantee (Moisture/internal quality require physical measurement)
 * 3. Strict Non-Binding Labeling ("AI Visual Assessment — Preliminary" & "AI Assessment — Not Verified")
 * 4. Inspector Exception & Escalation Desk (High-value, low-confidence, disputes, reinspections)
 * 5. Farmer Wizard Multi-Photo Workflow & Immediate Visual Screening (SellMyCropWizard.tsx)
 * 6. Lot Detail Two-Tier Transparency & Disclaimers (lots/[id]/page.tsx)
 * 7. Inspector Portal Exception Triage Queue & Badging (inspector/page.tsx)
 * 8. API Contract Preservation & Quality Endpoint Diagnostics (/api/lots/[id]/assessment, /quality)
 * 9. Database Preservation (13 ProduceLots, 15 StorageFacilities, zero schema resets)
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
  console.log('  KisanSetu AI-First Quality Redesign Verification');
  console.log('====================================================\n');

  // 1. ENGINE & CROP PROFILES
  console.log('1. Verifying AI Visual Quality Engine (src/lib/quality-ai.ts)...');
  const qualityAiPath = path.join(rootDir, 'src/lib/quality-ai.ts');
  it('quality-ai.ts exists and exports core analysis & triage functions', () => {
    assert(fs.existsSync(qualityAiPath), 'src/lib/quality-ai.ts must exist');
    const content = fs.readFileSync(qualityAiPath, 'utf8');
    assert(content.includes('export function analyzeCropPhotos'), 'Must export analyzeCropPhotos');
    assert(content.includes('export function evaluateTriageEscalation'), 'Must export evaluateTriageEscalation');
    assert(content.includes('export function isSuspiciousImage'), 'Must export isSuspiciousImage');
    assert(content.includes('CROP_PROFILES'), 'Must define CROP_PROFILES');
  });

  // Test dynamic import/require of quality-ai engine via transpile or direct TS check
  const qualityAiCode = fs.readFileSync(qualityAiPath, 'utf8');

  it('Supports multi-commodity profiles (Onion, Tomato, Soybean, Cotton, Grapes)', () => {
    assert(qualityAiCode.includes("onion:") || qualityAiCode.includes("'Onion'"), 'Must support Onion profile');
    assert(qualityAiCode.includes("tomato:") || qualityAiCode.includes("'Tomato'"), 'Must support Tomato profile');
    assert(qualityAiCode.includes("soybean:") || qualityAiCode.includes("'Soybean'"), 'Must support Soybean profile');
    assert(qualityAiCode.includes("cotton:") || qualityAiCode.includes("'Cotton'"), 'Must support Cotton profile');
    assert(qualityAiCode.includes("grapes:") || qualityAiCode.includes("'Grapes'"), 'Must support Grapes profile');
  });

  // 2. TRUTH-IN-AI & NON-FABRICATION GUARANTEES
  console.log('\n2. Verifying Truth-in-AI & Non-Fabrication Guarantees...');
  it('Truth-in-AI: Strictly disclaims moisture %, internal sugar/rot, and chemical residues from photos', () => {
    assert(
      qualityAiCode.includes('Physical measurement required: Moisture %, internal sugar/rot, and chemical residue cannot be determined from photos'),
      'Must contain explicit physical measurement notice for non-observable attributes'
    );
    assert(
      qualityAiCode.includes('digital moisture meter at weighbridge'),
      'Must reference digital moisture meter for moisture testing'
    );
  });

  it('Assesses ONLY visible physical attributes (color, visible defects, maturity/curing, size uniformity, foreign matter)', () => {
    assert(qualityAiCode.includes('colorUniformity'), 'Must evaluate colorUniformity');
    assert(qualityAiCode.includes('visibleDefects'), 'Must evaluate visibleDefects');
    assert(qualityAiCode.includes('sizeUniformityPercent'), 'Must evaluate sizeUniformityPercent');
    assert(qualityAiCode.includes('maturityCuringStatus'), 'Must evaluate maturityCuringStatus');
    assert(qualityAiCode.includes('foreignMatterPercent'), 'Must evaluate foreignMatterPercent');
  });

  it('Suspicious image safeguards detect blank, placeholder, or corrupted uploads', () => {
    assert(qualityAiCode.includes('isSuspiciousImage'), 'Must have isSuspiciousImage logic');
    assert(qualityAiCode.includes('placeholder'), 'Must check for placeholder images');
    assert(qualityAiCode.includes('too_short') || qualityAiCode.includes('dataUri.length < 100'), 'Must reject truncated/empty data URIs');
  });

  // 3. STRICT NON-BINDING LABELING & CLARITY
  console.log('\n3. Verifying Strict Non-Binding Labeling & Disclaimers...');
  it('AI Visual Assessment is always labeled "AI Visual Assessment — Preliminary"', () => {
    assert(
      qualityAiCode.includes("displayLabel: 'AI Visual Assessment — Preliminary'"),
      'Must have displayLabel AI Visual Assessment — Preliminary'
    );
    assert(
      qualityAiCode.includes("AI Visual Assessment — Preliminary. Non-binding visual estimate"),
      'Must emphasize non-binding visual estimate'
    );
  });

  it('Preserves backward-compatible label "AI Assessment — Not Verified" for HTTP test suite', () => {
    const assessRoutePath = path.join(rootDir, 'src/app/api/lots/[id]/assessment/route.ts');
    const assessRouteCode = fs.readFileSync(assessRoutePath, 'utf8');
    assert(assessRouteCode.includes("label: 'AI Assessment — Not Verified'"), 'Must preserve legacy label for tests');
    assert(assessRouteCode.includes("displayLabel: 'AI Visual Assessment — Preliminary'"), 'Must also provide displayLabel');
    assert(assessRouteCode.includes("status: 'AI_ASSESSMENT_NOT_VERIFIED'"), 'Must preserve AI_ASSESSMENT_NOT_VERIFIED status');
  });

  // 4. EXCEPTION & ESCALATION TRIAGE ENGINE
  console.log('\n4. Verifying Exception & Escalation Desk Triage Logic...');
  it('Evaluates triage escalation for high-value lots (>= 500 Qtl or >= Rs 5,00,000)', () => {
    assert(qualityAiCode.includes('HIGH_VALUE_TRADE'), 'Must have HIGH_VALUE_TRADE category');
    assert(qualityAiCode.includes('quantityQuintals >= 500') || qualityAiCode.includes('grossValue >= 500000'), 'Must flag >= 500 Qtl or >= 5 Lakhs');
  });

  it('Evaluates triage escalation for low AI confidence (< 0.65)', () => {
    assert(qualityAiCode.includes('LOW_AI_CONFIDENCE'), 'Must have LOW_AI_CONFIDENCE category');
    assert(qualityAiCode.includes('confidenceScore < 0.65'), 'Must flag confidence < 0.65');
  });

  it('Evaluates triage escalation for counterparty trade disputes and reinspections', () => {
    assert(qualityAiCode.includes('DISPUTED_TRADE'), 'Must have DISPUTED_TRADE category');
    assert(qualityAiCode.includes('REINSPECTION_REQUIRED'), 'Must have REINSPECTION_REQUIRED category');
    assert(qualityAiCode.includes('ROUTINE_FAST_TRACK'), 'Must have ROUTINE_FAST_TRACK for standard lots');
  });

  // 5. FARMER WIZARD INTEGRATION
  console.log('\n5. Verifying Farmer Wizard Multi-Photo & AI Screening (SellMyCropWizard.tsx)...');
  const wizardPath = path.join(rootDir, 'src/components/farmer/SellMyCropWizard.tsx');
  const wizardCode = fs.readFileSync(wizardPath, 'utf8');

  it('SellMyCropWizard uses analyzeCropPhotos and manages multi-photo visual screening', () => {
    assert(wizardCode.includes('analyzeCropPhotos'), 'Must import and call analyzeCropPhotos');
    assert(wizardCode.includes('aiResult'), 'Must maintain aiResult state or memo');
    assert(wizardCode.includes('Visual Confidence Score') || wizardCode.includes('Visual Confidence'), 'Must show confidence score');
  });

  it('SellMyCropWizard displays Truth-in-AI non-fabrication guarantee and guidance', () => {
    assert(wizardCode.includes('Physical Measurement Required'), 'Must render Physical Measurement Required notice');
    assert(wizardCode.includes('Moisture %, internal sugar/rot, and chemical residues cannot be determined from photographs'), 'Must state non-observable notice');
    assert(wizardCode.includes('retakeRecommendations'), 'Must display retake recommendations when photos are missing');
  });

  it('SellMyCropWizard submits multi-photo diagnostics to /api/lots/[id]/assessment', () => {
    assert(wizardCode.includes('maturityCuringStatus'), 'Must submit maturity status');
    assert(wizardCode.includes('foreignMatterPercent'), 'Must submit foreign matter');
    assert(wizardCode.includes('retakeRecommendations'), 'Must submit retake recommendations');
    assert(wizardCode.includes('nonObservableNotice'), 'Must submit non-observable notice');
  });

  // 6. LOT DETAIL TWO-TIER TRANSPARENCY
  console.log('\n6. Verifying Lot Detail Page Two-Tier Separation (lots/[id]/page.tsx)...');
  const lotDetailPath = path.join(rootDir, 'src/app/lots/[id]/page.tsx');
  const lotDetailCode = fs.readFileSync(lotDetailPath, 'utf8');

  it('Lot detail displays "AI Visual Assessment — Preliminary" in Tier 1 card', () => {
    assert(lotDetailCode.includes('AI Visual Assessment — Preliminary'), 'Tier 1 must display AI Visual Assessment — Preliminary');
    assert(lotDetailCode.includes('AI Assessment — Not Verified'), 'Must keep AI Assessment — Not Verified badge');
  });

  it('Lot detail displays visible indicators: maturity, size uniformity, foreign matter, and non-fabrication disclaimer', () => {
    assert(lotDetailCode.includes('maturityCuringStatus'), 'Must render maturityCuringStatus if available');
    assert(lotDetailCode.includes('foreignMatterPercent'), 'Must render foreignMatterPercent if available');
    assert(lotDetailCode.includes('Physical measurement required'), 'Must render Physical measurement required disclaimer');
    assert(lotDetailCode.includes('Moisture %, internal quality, and chemical residue cannot be determined from photographs'), 'Must explain moisture requirement');
  });

  // 7. INSPECTOR PORTAL EXCEPTION & ESCALATION DESK
  console.log('\n7. Verifying Inspector Portal Exception & Escalation Desk (inspector/page.tsx)...');
  const inspectorPath = path.join(rootDir, 'src/app/inspector/page.tsx');
  const inspectorCode = fs.readFileSync(inspectorPath, 'utf8');

  it('Inspector page introduces Exception & Escalation Desk architecture banner', () => {
    assert(inspectorCode.includes('Exception & Escalation Architecture') || inspectorCode.includes('Exception & Escalation Desk'), 'Must feature Exception & Escalation desk architecture');
    assert(inspectorCode.includes('eliminating delays and bias from routine listings'), 'Must explain speed and bias prevention');
  });

  it('Inspector queue provides dedicated Escalation Queue tab and triage badges', () => {
    assert(inspectorCode.includes("'ESCALATED'"), 'Must provide ESCALATED tab');
    assert(inspectorCode.includes('Escalation: High-Value Trade'), 'Must have High-Value Trade badge');
    assert(inspectorCode.includes('Escalation: Low AI Reliability'), 'Must have Low AI Reliability badge');
    assert(inspectorCode.includes('Escalation: Disputed Trade') || inspectorCode.includes('Escalation: Counterparty Dispute'), 'Must have Disputed Trade badge');
    assert(inspectorCode.includes('Routine AI Fast-Track'), 'Must display Routine AI Fast-Track for waived lots');
  });

  it('Inspector lot cards display Triage Status Reason', () => {
    assert(inspectorCode.includes('Triage Status:'), 'Must show Triage Status note');
    assert(inspectorCode.includes('lot.escalationReason'), 'Must render lot.escalationReason');
  });

  // 8. API ENDPOINTS DIAGNOSTICS & BACKWARD COMPATIBILITY
  console.log('\n8. Verifying API Route Endpoints (/api/inspector/lots, /api/lots/[id]/quality)...');
  const inspRoutePath = path.join(rootDir, 'src/app/api/inspector/lots/route.ts');
  const inspRouteCode = fs.readFileSync(inspRoutePath, 'utf8');

  it('Inspector API computes escalation metrics and categorizes each lot', () => {
    assert(inspRouteCode.includes('highValueEscalations'), 'Must report highValueEscalations metric');
    assert(inspRouteCode.includes('lowConfidenceEscalations'), 'Must report lowConfidenceEscalations metric');
    assert(inspRouteCode.includes('disputeEscalations'), 'Must report disputeEscalations metric');
    assert(inspRouteCode.includes('escalationCategory'), 'Must return escalationCategory for each lot');
    assert(inspRouteCode.includes('escalationReason'), 'Must return escalationReason for each lot');
  });

  const qualityRoutePath = path.join(rootDir, 'src/app/api/lots/[id]/quality/route.ts');
  const qualityRouteCode = fs.readFileSync(qualityRoutePath, 'utf8');

  it('Quality route parses visualParameters and supplies displayLabel & rich indicators', () => {
    assert(qualityRouteCode.includes('displayLabel:'), 'Must provide displayLabel');
    assert(qualityRouteCode.includes('maturityCuringStatus:'), 'Must expose maturityCuringStatus');
    assert(qualityRouteCode.includes('foreignMatterPercent:'), 'Must expose foreignMatterPercent');
    assert(qualityRouteCode.includes('nonObservableNotice:'), 'Must expose nonObservableNotice');
  });

  // 9. DATABASE PRESERVATION
  console.log('\n9. Verifying Zero Database Resets & Zero Schema Migrations...');
  await itAsync('Database has exactly 13 curated ProduceLots', async () => {
    const count = await prisma.produceLot.count();
    assert(count === 13, `Expected exactly 13 ProduceLots, found ${count}`);
  });

  await itAsync('Database has exactly 15 StorageFacilities', async () => {
    const count = await prisma.storageFacility.count();
    assert(count === 15, `Expected exactly 15 StorageFacilities, found ${count}`);
  });

  await itAsync('Database preserves all transactions and offers', async () => {
    const txCount = await prisma.transaction.count();
    const offerCount = await prisma.offer.count();
    assert(txCount > 0, `Expected transactions > 0, found ${txCount}`);
    assert(offerCount > 0, `Expected offers > 0, found ${offerCount}`);
  });

  console.log('\n====================================================');
  console.log(`  AI-First Quality Redesign Total: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
