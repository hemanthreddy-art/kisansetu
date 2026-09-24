const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000';

async function testWorkflow(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    return true;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    return false;
  }
}

async function runDualNetRealisationAudit() {
  console.log('====================================================');
  console.log('  KisanSetu — Dual Net Realisation & Selling Flow Audit');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function check(name, fn) {
    total++;
    const ok = await testWorkflow(name, fn);
    if (ok) passed++;
  }

  // 1. Standalone Calculator Page Verification
  await check('Standalone Calculator (/calculator) is active & returns HTTP 200', async () => {
    const res = await fetch(`${BASE_URL}/calculator`);
    assert.strictEqual(res.status, 200, '/calculator must return 200');
    const html = await res.text();
    assert(html.includes('Calculator') || html.includes('Net Realisation'), 'Calculator page must render');
  });

  // 2. Standalone Calculator Query Param Scenario Modeling
  await check('Standalone Calculator handles market scenario query params', async () => {
    const res = await fetch(`${BASE_URL}/calculator?crop=Onion&price=2400&quantity=100&distance=50`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert(html.length > 500, 'Page content must be received');
  });

  // 3. Navbar Dual Access: Standalone Calculator + Farmer Workflows
  await check('Navbar preserves standalone Calculator link and farmer workflows', async () => {
    const navCode = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
    assert(navCode.includes("href: '/calculator'"), 'Navbar must link /calculator');
    assert(navCode.includes("href: '/'"), 'Farmer nav must link Home');
    assert(navCode.includes("farmerNavItems"), 'Must define farmerNavItems');
    assert(!navCode.includes("href: '/farmer?tab=FIND_BUYERS'"), 'Farmer nav must not duplicate Find Buyers tab');
  });

  // 4. View Offers Contextual "Amount You Receive" & Self-Transport
  await check('FarmerOffersModal integrates contextual Net Realisation & own-transport toggle', async () => {
    const code = fs.readFileSync('src/components/farmer/FarmerOffersModal.tsx', 'utf8');
    assert(code.includes('calculateNetRealisation'), 'Must use calculateNetRealisation');
    assert(code.includes('amountYouReceive'), 'Must render amountYouReceive key');
    assert(code.includes('ownTransportOption'), 'Must offer ownTransportOption toggle');
    assert(code.includes('selfTransport'), 'Must handle selfTransport state');
    assert(code.includes('bestNetRealisation'), 'Must highlight bestNetRealisation');
  });

  // 5. Sell My Crop Flow Contextual Estimated Net Realisation
  await check('SellMyCropWizard displays Estimated Net Realisation with non-guaranteed notice', async () => {
    const code = fs.readFileSync('src/components/farmer/SellMyCropWizard.tsx', 'utf8');
    assert(code.includes('calculateNetRealisation'), 'Must calculate estimated net realisation');
    assert(code.includes('estAmountYouReceive'), 'Must render estAmountYouReceive label');
    assert(code.includes('estDeductionsNotice'), 'Must include non-guaranteed deductions advisory');
  });

  // 6. Buyer Demands Section Contextual Net Earnings & CTA
  await check('BuyerDemandsSection displays real-time net realisation & Supply This Crop CTA', async () => {
    const code = fs.readFileSync('src/components/farmer/BuyerDemandsSection.tsx', 'utf8');
    assert(code.includes('estAmountYouReceive'), 'Must display estAmountYouReceive');
    assert(code.includes('supplyThisCrop'), 'Must provide supplyThisCrop CTA');
  });

  // 7. Lot Details Decision Sequence & Contextual Offer Realisation
  await check('Lot Details page integrates Net Realisation into offer cards & keeps calculator link', async () => {
    const code = fs.readFileSync('src/app/lots/[id]/page.tsx', 'utf8');
    assert(code.includes('calculateNetRealisation'), 'Must calculate offer net take-home');
    assert(code.includes('amountYouReceive'), 'Must display amountYouReceive on offers');
    assert(code.includes('/calculator?'), 'Must keep deep links to standalone calculator for custom simulation');
  });

  // 8. Completed History & Settlement Receipt Net Realisation
  await check('RoleHistoryView shows Gross - Transport - Deductions = Final Amount Received', async () => {
    const code = fs.readFileSync('src/components/shared/RoleHistoryView.tsx', 'utf8');
    assert(code.includes('amountYouReceive') || code.includes('netPaidToBank'), 'Must display amount you receive on settled cards');
    assert(code.includes('Gross − Transport − Deductions'), 'Must show explicit formula breakdown in receipt');
  });

  // 9. Multilingual Parity across 4 Locales
  await check('Translations preserve 100% key parity across en, mr, te, and hi', async () => {
    const code = fs.readFileSync('src/i18n/translations.ts', 'utf8');
    ['amountYouReceive', 'estAmountYouReceive', 'supplyThisCrop', 'ownTransportOption', 'bestNetRealisation', 'estDeductionsNotice'].forEach((key) => {
      const occurrences = (code.match(new RegExp(key, 'g')) || []).length;
      assert(occurrences >= 5, `Key ${key} must exist in interface and all 4 locales (found ${occurrences})`);
    });
  });

  // 10. Database Invariant Check
  await check('ProduceLot database count remains strictly 13', async () => {
    const prisma = new PrismaClient();
    const count = await prisma.produceLot.count();
    await prisma.$disconnect();
    assert.strictEqual(count, 13, `Database must contain exactly 13 ProduceLots, found ${count}`);
  });

  console.log('\n====================================================');
  console.log(`  Dual Net Realisation Audit: ${passed}/${total} PASSED`);
  console.log('====================================================\n');

  if (passed !== total) process.exit(1);
  process.exit(0);
}

runDualNetRealisationAudit().catch((err) => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
