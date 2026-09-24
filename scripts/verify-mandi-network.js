const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

async function testMandiNetwork() {
  console.log('====================================================');
  console.log('  KisanSetu — Multi-Mandi Network Verification');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function runTest(name, fn) {
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  async function runAsyncTest(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // Load src/lib/mandi-network.ts via typescript transpileModule
  const mandiNetworkPath = path.resolve(__dirname, '../src/lib/mandi-network.ts');
  const mandiCode = fs.readFileSync(mandiNetworkPath, 'utf8');
  const transpiled = ts.transpileModule(mandiCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;

  const mandiModule = { exports: {} };
  const evalFn = new Function('module', 'exports', 'require', transpiled);
  evalFn(mandiModule, mandiModule.exports, require);

  const {
    MAHARASHTRA_MANDIS,
    generateMandiTrendSeries,
    getAvailableMandisForCrop,
    getMandiByName,
  } = mandiModule.exports;

  // 1. Verify Dataset: At least 10 Maharashtra mandis
  runTest('1. Dataset contains at least 10 distinct Maharashtra mandis', () => {
    assert(Array.isArray(MAHARASHTRA_MANDIS), 'MAHARASHTRA_MANDIS must be an array');
    assert(MAHARASHTRA_MANDIS.length >= 10, `Must have >= 10 mandis, got ${MAHARASHTRA_MANDIS.length}`);

    const requiredMandis = [
      'Lasalgaon',
      'Niphad',
      'Nashik',
      'Pune',
      'Ahmednagar',
      'Jalgaon',
      'Solapur',
      'Sangli',
      'Kolhapur',
      'Dhule',
    ];

    for (const name of requiredMandis) {
      const found = MAHARASHTRA_MANDIS.some((m) => m.name.toLowerCase().includes(name.toLowerCase()));
      assert(found, `Required mandi "${name}" not found in MAHARASHTRA_MANDIS`);
    }
    console.log(`       Found ${MAHARASHTRA_MANDIS.length} Maharashtra APMC mandis including all 10 target markets.`);
  });

  // 2. Verify Mandi Details have realistic metadata
  runTest('2. Mandi metadata includes district, state, hubType, code, and distances', () => {
    for (const mandi of MAHARASHTRA_MANDIS) {
      assert(mandi.id, `Mandi ${mandi.name} missing id`);
      assert(mandi.district, `Mandi ${mandi.name} missing district`);
      assert.strictEqual(mandi.state, 'Maharashtra', `Mandi ${mandi.name} state must be Maharashtra`);
      assert(mandi.code && mandi.code.startsWith('MH-'), `Mandi ${mandi.code} code invalid`);
      assert(mandi.hubType, `Mandi ${mandi.name} missing hubType`);
      assert(mandi.refDistanceKm > 0, `Mandi ${mandi.name} invalid distance`);
      assert(Array.isArray(mandi.specialtyCommodities) && mandi.specialtyCommodities.length > 0);
    }
  });

  // 3. Verify Mandi Trend Series changes genuinely across mandis for the same crop (e.g. Onion)
  runTest('3. Onion price trend genuinely changes across mandis (Lasalgaon vs Pune vs Solapur)', () => {
    const lasalgaonOnion = generateMandiTrendSeries('onion', 'Lasalgaon APMC', 15);
    const puneOnion = generateMandiTrendSeries('onion', 'Pune Market Yard', 15);
    const solapurOnion = generateMandiTrendSeries('onion', 'Solapur APMC', 15);
    const dhuleOnion = generateMandiTrendSeries('onion', 'Dhule APMC', 15);

    // Modal prices must differ
    assert.notStrictEqual(lasalgaonOnion.currentModalPrice, puneOnion.currentModalPrice, 'Lasalgaon and Pune onion prices must differ');
    assert(puneOnion.currentModalPrice > lasalgaonOnion.currentModalPrice, 'Pune (terminal consumption) modal price must be higher than Lasalgaon (primary assembly)');

    // Arrival volumes must differ
    assert.notStrictEqual(lasalgaonOnion.arrivalTonnes, puneOnion.arrivalTonnes, 'Arrival volumes must differ');
    assert(lasalgaonOnion.arrivalTonnes > puneOnion.arrivalTonnes, 'Lasalgaon onion arrivals must exceed Pune arrivals');

    // Min and Max ranges must differ
    assert.notStrictEqual(lasalgaonOnion.minPrice, puneOnion.minPrice, 'Min price must differ');
    assert.notStrictEqual(lasalgaonOnion.maxPrice, puneOnion.maxPrice, 'Max price must differ');

    // Historical points series must be genuinely distinct arrays of values
    const lasalgaonPoints = lasalgaonOnion.points.map((p) => p.modalPrice);
    const punePoints = puneOnion.points.map((p) => p.modalPrice);
    const solapurPoints = solapurOnion.points.map((p) => p.modalPrice);

    assert(JSON.stringify(lasalgaonPoints) !== JSON.stringify(punePoints), 'Price curves must be distinct between Lasalgaon and Pune');
    assert(JSON.stringify(punePoints) !== JSON.stringify(solapurPoints), 'Price curves must be distinct between Pune and Solapur');

    console.log(`       Onion: Lasalgaon modal=₹${lasalgaonOnion.currentModalPrice} (${lasalgaonOnion.arrivalTonnes}T), Pune modal=₹${puneOnion.currentModalPrice} (${puneOnion.arrivalTonnes}T), Solapur modal=₹${solapurOnion.currentModalPrice} (${solapurOnion.arrivalTonnes}T)`);
  });

  // 4. Verify Wheat trend genuinely changes across mandis (Jalgaon vs Pune vs Ahmednagar)
  runTest('4. Wheat price trend genuinely changes across mandis (Jalgaon vs Pune vs Ahmednagar)', () => {
    const jalgaonWheat = generateMandiTrendSeries('wheat', 'Jalgaon APMC', 15);
    const puneWheat = generateMandiTrendSeries('wheat', 'Pune Market Yard', 15);
    const ahmednagarWheat = generateMandiTrendSeries('wheat', 'Ahmednagar APMC', 15);

    assert.notStrictEqual(jalgaonWheat.currentModalPrice, puneWheat.currentModalPrice);
    assert.notStrictEqual(jalgaonWheat.arrivalTonnes, puneWheat.arrivalTonnes);
    assert(puneWheat.currentModalPrice > jalgaonWheat.currentModalPrice, 'Pune wheat terminal price higher than Jalgaon assembly');

    console.log(`       Wheat: Jalgaon modal=₹${jalgaonWheat.currentModalPrice}, Pune modal=₹${puneWheat.currentModalPrice}, Ahmednagar modal=₹${ahmednagarWheat.currentModalPrice}`);
  });

  // 5. Verify Specialty Crops reflect authentic regional strengths
  runTest('5. Specialty commodities exhibit authentic regional market pricing', () => {
    // Sangli Turmeric
    const sangliTurmeric = generateMandiTrendSeries('turmeric', 'Sangli APMC', 15);
    assert(sangliTurmeric.currentModalPrice > 10000, 'Turmeric must have high modal price');
    assert(sangliTurmeric.arrivalTonnes >= 500, 'Sangli must have high turmeric arrival volume');

    // Kolhapur Jaggery
    const kolhapurJaggery = generateMandiTrendSeries('jaggery', 'Kolhapur APMC', 15);
    assert(kolhapurJaggery.currentModalPrice >= 3800, 'Kolhapur jaggery modal price must be realistic');
    assert(kolhapurJaggery.arrivalTonnes >= 1000, 'Kolhapur must have dominant jaggery arrivals');

    // Dhule Cotton
    const dhuleCotton = generateMandiTrendSeries('cotton', 'Dhule APMC', 15);
    assert(dhuleCotton.currentModalPrice >= 7000, 'Dhule cotton modal price must be realistic');
    assert(dhuleCotton.arrivalTonnes >= 600, 'Dhule must have high cotton arrivals');

    // Solapur Pomegranate
    const solapurPom = generateMandiTrendSeries('pomegranate', 'Solapur APMC', 15);
    assert(solapurPom.currentModalPrice >= 8000, 'Solapur pomegranate modal price must be realistic');

    console.log(`       Specialties: Sangli Turmeric=₹${sangliTurmeric.currentModalPrice} (${sangliTurmeric.arrivalTonnes}T), Kolhapur Jaggery=₹${kolhapurJaggery.currentModalPrice} (${kolhapurJaggery.arrivalTonnes}T), Dhule Cotton=₹${dhuleCotton.currentModalPrice} (${dhuleCotton.arrivalTonnes}T)`);
  });

  // 6. Verify Timeframe toggles (7, 15, 30 days) generate accurate point counts
  runTest('6. Timeframe views (7D, 15D, 30D) return accurate point counts and date series', () => {
    const trend7 = generateMandiTrendSeries('onion', 'Lasalgaon APMC', 7);
    const trend15 = generateMandiTrendSeries('onion', 'Lasalgaon APMC', 15);
    const trend30 = generateMandiTrendSeries('onion', 'Lasalgaon APMC', 30);

    assert.strictEqual(trend7.points.length, 7, '7D must have 7 points');
    assert.strictEqual(trend15.points.length, 15, '15D must have 15 points');
    assert.strictEqual(trend30.points.length, 30, '30D must have 30 points');

    // Dates must be sequential
    for (let i = 1; i < trend15.points.length; i++) {
      assert(trend15.points[i].dayIndex > trend15.points[i - 1].dayIndex, 'dayIndex must increase');
    }
  });

  // 7. Verify Component code and exports
  runTest('7. HistoricalPriceTrendChart component conforms to all contract requirements', () => {
    const compContent = fs.readFileSync('src/components/markets/HistoricalPriceTrendChart.tsx', 'utf8');
    assert(compContent.includes('export function HistoricalPriceTrendChart'), 'Must export component');
    assert(compContent.includes('7 | 15 | 30'), 'Must support 7 | 15 | 30 timeframe');
    assert(compContent.includes('<svg') || compContent.includes('svg'), 'Must render SVG chart');
    assert(compContent.includes('Agmarknet'), 'Must include Agmarknet notice');
    assert(compContent.includes('MAHARASHTRA_MANDIS'), 'Must import MAHARASHTRA_MANDIS');
    assert(compContent.includes('generateMandiTrendSeries'), 'Must call generateMandiTrendSeries');
    assert(compContent.includes('currentMandi.hubType'), 'Must render hubType badge');
  });

  // 8. Verify GET /api/markets endpoint
  await runAsyncTest('8. GET /api/markets returns 200 with maharashtraNetwork', async () => {
    const res = await fetch('http://localhost:3000/api/markets');
    assert.strictEqual(res.status, 200, 'Markets API must return 200');
    const data = await res.json();
    assert.strictEqual(data.dataSource, 'DEMO_PROTOTYPE_DATA');
    assert(Array.isArray(data.maharashtraNetwork) && data.maharashtraNetwork.length >= 10, 'Must have >= 10 maharashtraNetwork mandis');
    assert(Array.isArray(data.latestPrices) && data.latestPrices.length >= 20, 'Must have >= 20 sample prices');
  });

  // 9. Verify GET /api/markets with query parameters returns trend result
  await runAsyncTest('9. GET /api/markets?crop=onion&mandi=Pune+Market+Yard returns dynamic trend', async () => {
    const res = await fetch('http://localhost:3000/api/markets?crop=onion&mandi=Pune+Market+Yard&timeframe=15');
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.trend, 'Must return trend data');
    assert.strictEqual(data.trend.timeframe, 15);
    assert.strictEqual(data.trend.points.length, 15);
    assert(data.trend.currentModalPrice > 0);
  });

  console.log('\n====================================================');
  console.log(`  Multi-Mandi Network Verification: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testMandiNetwork().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
