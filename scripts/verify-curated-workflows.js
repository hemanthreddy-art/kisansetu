const assert = require('assert');

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

async function runVerification() {
  console.log('====================================================');
  console.log('  KisanSetu — Curated Dataset Live Workflow Verification');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function check(name, fn) {
    total++;
    const ok = await testWorkflow(name, fn);
    if (ok) passed++;
  }

  // 1. Database Count Verification
  await check('Exact 13 ProduceLots in Database', async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const count = await prisma.produceLot.count();
    await prisma.$disconnect();
    assert.strictEqual(count, 13, `Expected exactly 13 ProduceLots in DB, found ${count}`);
  });

  // 2. Farmer My Crops (GET /api/lots)
  await check('Farmer My Crops API returns 13 curated lots with relational data', async () => {
    const res = await fetch(`${BASE_URL}/api/lots`);
    assert.strictEqual(res.status, 200, 'GET /api/lots must return 200');
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.length, 13, `Expected 13 lots in /api/lots, got ${data.data.length}`);
    
    // Check key commodities are present
    const commodities = data.data.map(l => l.commodity);
    ['Onion', 'Wheat', 'Tomato', 'Soybean', 'Cotton', 'Grapes', 'Rice', 'Maize', 'Potato'].forEach(c => {
      assert(commodities.includes(c), `Commodity ${c} must be present in curated dataset`);
    });

    // Check relations are loaded
    const onionLot = data.data.find(l => l.lotCode === 'KS-ONION-2026-0001');
    assert(onionLot, 'KS-ONION-2026-0001 must exist');
    assert(Array.isArray(onionLot.offers) && onionLot.offers.length >= 2, 'KS-ONION-2026-0001 must have 2 active offers');
  });

  // 3. Farmer History (GET /api/transactions?role=FARMER)
  await check('Farmer History API returns completed transactions', async () => {
    const res = await fetch(`${BASE_URL}/api/transactions?role=FARMER`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(Array.isArray(data.data) && data.data.length > 0, 'Farmer history must return transactions');
    const completed = data.data.filter(t => t.status === 'COMPLETED');
    assert(completed.length >= 2, `Expected at least 2 completed transactions, got ${completed.length}`);
    assert(completed.some(t => t.lot?.commodity === 'Potato'), 'Potato completed txn must exist');
    assert(completed.some(t => t.lot?.commodity === 'Onion'), 'Onion completed txn must exist');
  });

  // 4. Buyer Hub & Marketplace (GET /buyer & GET /api/buyer-demands)
  await check('Buyer Marketplace & Buyer Demands APIs are active', async () => {
    const pageRes = await fetch(`${BASE_URL}/buyer`);
    assert.strictEqual(pageRes.status, 200, '/buyer page must return 200');

    const demandsRes = await fetch(`${BASE_URL}/api/buyer-demands?status=ACTIVE`);
    assert.strictEqual(demandsRes.status, 200);
    const demandsData = await demandsRes.json();
    assert.strictEqual(demandsData.success, true);
    assert(Array.isArray(demandsData.demands) && demandsData.demands.length >= 4, 'Must have at least 4 active demands');
  });

  // 5. Offers Desk (GET /api/offers)
  await check('Offers API returns active pending offers', async () => {
    const res = await fetch(`${BASE_URL}/api/offers?role=FARMER`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(Array.isArray(data.offers) && data.offers.length >= 2, 'Must return at least 2 farmer offers');
  });

  // 6. Transporter Hub & Requests (GET /transporter & GET /api/transport-requests)
  await check('Transporter Hub & Transport Requests are active', async () => {
    const pageRes = await fetch(`${BASE_URL}/transporter`);
    assert.strictEqual(pageRes.status, 200, '/transporter page must return 200');

    const trRes = await fetch(`${BASE_URL}/api/transport-requests`);
    assert.strictEqual(trRes.status, 200);
    const trData = await trRes.json();
    assert.strictEqual(trData.success, true);
    const requests = trData.transportRequests || trData.data;
    assert(Array.isArray(requests) && requests.length >= 2, 'Must return transport requests');
  });

  // 7. Lot Details Page (/lots/[id])
  await check('Lot Details Page renders successfully for preserved lot', async () => {
    const res = await fetch(`${BASE_URL}/lots/cmtplfopt000311fhrrmu0jpj`);
    assert.strictEqual(res.status, 200, '/lots/cmtplfopt000311fhrrmu0jpj must return 200');
    const html = await res.text();
    assert(html.includes('KS-ONION-2026-0001') || html.includes('cmtplfopt000311fhrrmu0jpj'), 'Must display lot code or id');
  });

  // 8. Quality Inspector Portal (/inspector & /api/inspector/lots)
  await check('Quality Inspector Portal is active and lists lots', async () => {
    const pageRes = await fetch(`${BASE_URL}/inspector`);
    assert.strictEqual(pageRes.status, 200, '/inspector must return 200');

    const apiRes = await fetch(`${BASE_URL}/api/inspector/lots`);
    assert.strictEqual(apiRes.status, 200);
    const apiData = await apiRes.json();
    assert.strictEqual(apiData.success, true);
    const lots = apiData.lots || apiData.data;
    assert(Array.isArray(lots) && lots.length > 0, 'Must return lots for inspection');
  });

  // 9. Storage Discovery (/storage & /api/storage)
  await check('Storage Facility Discovery is active and WDRA-certified', async () => {
    const pageRes = await fetch(`${BASE_URL}/storage`);
    assert.strictEqual(pageRes.status, 200, '/storage must return 200');

    const apiRes = await fetch(`${BASE_URL}/api/storage`);
    assert.strictEqual(apiRes.status, 200);
    const apiData = await apiRes.json();
    assert.strictEqual(apiData.success, true);
    const facilities = apiData.data || apiData.facilities;
    assert(Array.isArray(facilities) && facilities.length >= 3, 'Must return 3 storage facilities');
  });

  // 10. FPO Aggregation Console (/fpo & /api/fpo/aggregate)
  await check('FPO Micro-Lot Aggregation Console returns micro-lots', async () => {
    const pageRes = await fetch(`${BASE_URL}/fpo`);
    assert.strictEqual(pageRes.status, 200, '/fpo must return 200');

    const apiRes = await fetch(`${BASE_URL}/api/fpo/aggregate`);
    assert.strictEqual(apiRes.status, 200);
    const apiData = await apiRes.json();
    assert.strictEqual(apiData.success, true);
    assert(apiData.fpo && apiData.fpo.name, 'Must return FPO details');
    assert(Array.isArray(apiData.eligibleLots) && apiData.eligibleLots.length > 0, 'Must return eligible smallholder lots');
  });

  // 11. Transactions & Payments (/transactions & /api/transactions)
  await check('Transactions Hub lists active escrow & commercial contracts', async () => {
    const pageRes = await fetch(`${BASE_URL}/transactions`);
    assert.strictEqual(pageRes.status, 200, '/transactions must return 200');

    const apiRes = await fetch(`${BASE_URL}/api/transactions`);
    assert.strictEqual(apiRes.status, 200);
    const apiData = await apiRes.json();
    assert.strictEqual(apiData.success, true);
    assert(Array.isArray(apiData.data) && apiData.data.length >= 8, 'Must return transactions');
  });

  // 12. APMC Mandi Tracker (/markets & /api/markets)
  await check('APMC Mandi Tracker is active', async () => {
    const pageRes = await fetch(`${BASE_URL}/markets`);
    assert.strictEqual(pageRes.status, 200, '/markets must return 200');

    const apiRes = await fetch(`${BASE_URL}/api/markets`);
    assert.strictEqual(apiRes.status, 200);
  });

  // 13. Net Realisation Calculator (/calculator)
  await check('Net Realisation Calculator page is active', async () => {
    const pageRes = await fetch(`${BASE_URL}/calculator`);
    assert.strictEqual(pageRes.status, 200, '/calculator must return 200');
  });

  console.log('\n====================================================');
  console.log(`  Live Workflow Verification: ${passed}/${total} PASSED`);
  console.log('====================================================\n');

  if (passed !== total) process.exit(1);
  process.exit(0);
}

runVerification().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
