/**
 * KisanSetu — Storage Discovery Realism, Dynamic Store-vs-Sell Intelligence & Voice Assistant Verification
 * SIH Problem Statement 26132 (Govt of Maharashtra)
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('====================================================');
console.log('  KisanSetu Storage Discovery, Dynamic Store-vs-Sell & Voice Assistant Verification');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  [PASS] ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${desc}:`, err.message);
    failCount++;
  }
}

const kisansetuRoot = path.resolve(__dirname, '..');

// 1. Load storage calculator using typescript transpileModule
const ts = require('typescript');
const storageCalcPath = path.join(kisansetuRoot, 'src/lib/storage-calculator.ts');
const storageCalcCode = fs.readFileSync(storageCalcPath, 'utf8');

const transpiledJs = ts.transpileModule(storageCalcCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;

const calcExports = {};
const calcModule = { exports: calcExports };
const evalFn = new Function('module', 'exports', 'require', transpiledJs);
evalFn(calcModule, calcExports, require);
const { calculateStoreVsSell, getCropProfile } = calcModule.exports;

// 2. Load parseFarmerIntent from FarmerVoiceAssistant.tsx
const voicePath = path.join(kisansetuRoot, 'src/components/farmer/FarmerVoiceAssistant.tsx');
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

// ==========================================
// SECTION 1: STORAGE DISCOVERY REALISM
// ==========================================
console.log('1. Verifying Storage Discovery Realism & Maharashtra Coverage...');

const authDemoPath = path.join(kisansetuRoot, 'src/lib/auth-demo.ts');
const authDemoCode = fs.readFileSync(authDemoPath, 'utf8');

it('Storage Facility Network contains 15 facilities across Maharashtra', () => {
  const match = authDemoCode.match(/export const DEMO_STORAGE_FACILITIES[^=]*=\s*(\[[\s\S]*?\n\]);/);
  assert(match, 'DEMO_STORAGE_FACILITIES array not found');
  const facilities = eval(match[1]);
  assert.strictEqual(facilities.length, 15, `Expected 15 facilities, got ${facilities.length}`);

  // Verify diverse districts
  const districts = new Set(facilities.map(f => f.district));
  assert(districts.size >= 8, `Expected at least 8 districts, got ${districts.size}`);
  assert(districts.has('Nashik'), 'Must cover Nashik');
  assert(districts.has('Pune'), 'Must cover Pune');
  assert(districts.has('Solapur'), 'Must cover Solapur');
  assert(districts.has('Ahmednagar'), 'Must cover Ahmednagar');

  // Verify storage facility types
  const types = new Set(facilities.map(f => f.facilityType));
  assert(types.has('DRY_WAREHOUSE'), 'Must include Dry Warehouse');
  assert(types.has('VENTILATED_CHAWL'), 'Must include Ventilated Chawl');
  assert(types.has('COLD_STORAGE'), 'Must include Cold Storage');
  assert(types.has('SCIENTIFIC_CHAWL'), 'Must include Scientific Onion Chawl');

  // Verify rich attributes on all facilities
  facilities.forEach((f, idx) => {
    assert(f.name, `Facility #${idx} missing name`);
    assert(f.facilityType, `Facility #${idx} missing facilityType`);
    assert(f.district, `Facility #${idx} missing district`);
    assert(f.totalCapacityTonnes > 0, `Facility #${idx} missing totalCapacityTonnes`);
    assert(f.availableCapacityTonnes >= 0, `Facility #${idx} missing availableCapacityTonnes`);
    assert(f.ratePerQuintalPerMonth > 0, `Facility #${idx} missing ratePerQuintalPerMonth`);
  });
});

it('Storage Discovery UI supports scannable filters, type pills, and Inward Gate Pass', () => {
  const storageUiPath = path.join(kisansetuRoot, 'src/app/storage/page.tsx');
  const storageUiCode = fs.readFileSync(storageUiPath, 'utf8');

  assert(storageUiCode.includes('filterType'), 'Missing filterType state');
  assert(storageUiCode.includes('filterCrop'), 'Missing filterCrop state');
  assert(storageUiCode.includes('searchDistrict'), 'Missing searchDistrict state');
  assert(storageUiCode.includes('searchQuery'), 'Missing search filter state');
  assert(storageUiCode.includes('VENTILATED_CHAWL'), 'Missing Ventilated Chawl filter');
  assert(storageUiCode.includes('SCIENTIFIC_CHAWL'), 'Missing Scientific Chawl filter');
  assert(storageUiCode.includes('COLD_STORAGE'), 'Missing Cold Storage filter');
  assert(storageUiCode.includes('DRY_WAREHOUSE'), 'Missing Dry Warehouse filter');
  assert(storageUiCode.includes('Generate Inward Gate Pass') || storageUiCode.includes('GeneratedGatePass'), 'Missing Inward Gate Pass');
  assert(storageUiCode.includes('calcResult.scenarios.map'), 'Missing dynamic scenarios stack rendering');
  assert(storageUiCode.includes('SELL_NOW'), 'Missing Sell Now scenario comparison');
});

// ==========================================
// SECTION 2: GENUINELY DYNAMIC STORE-VS-SELL ENGINE
// ==========================================
console.log('\n2. Verifying Genuinely Dynamic Store vs Sell Engine across Crops...');

// Crop 1: Onion
it('Onion: Outcomes change dynamically when varying quantity, storage type, duration, and price', () => {
  // Base Onion run: 50 Qtl in Ventilated Chawl, Moderate trend
  const baseRes = calculateStoreVsSell({
    crop: 'Onion',
    quantityQuintals: 50,
    currentSpotPricePerQtl: 2150,
    trend: 'MODERATE',
    storageFacilityType: 'VENTILATED_CHAWL',
  });

  assert.strictEqual(baseRes.scenarios.length, 5, 'Must calculate 5 distinct scenarios');
  assert.strictEqual(baseRes.scenarios[0].id, 'SELL_NOW');
  assert.strictEqual(baseRes.scenarios[1].id, 'STORE_15_DAYS');
  assert.strictEqual(baseRes.scenarios[2].id, 'STORE_30_DAYS');
  assert.strictEqual(baseRes.scenarios[3].id, 'STORE_60_DAYS');
  assert.strictEqual(baseRes.scenarios[4].id, 'STORE_90_DAYS');

  // Verify scenarios have strictly distinct price, shrinkage loss, and net realisations
  const netVals = baseRes.scenarios.map(s => s.netRealisation);
  assert(new Set(netVals).size >= 4, 'Scenarios must have distinctly calculated net realisations');

  // Verify quantity scaling: 100 Qtl vs 50 Qtl
  const doubleRes = calculateStoreVsSell({
    crop: 'Onion',
    quantityQuintals: 100,
    currentSpotPricePerQtl: 2150,
    trend: 'MODERATE',
    storageFacilityType: 'VENTILATED_CHAWL',
  });
  assert(doubleRes.scenarios[0].grossValue > baseRes.scenarios[0].grossValue * 1.9, 'Gross value must scale dynamically with quantity');
  assert(doubleRes.scenarios[2].storageTariffTotal === baseRes.scenarios[2].storageTariffTotal * 2, 'Tariff must scale proportionally with quantity');

  // Verify storage type variation: Scientific Chawl reduces shrinkage compared to Ventilated Chawl
  const sciRes = calculateStoreVsSell({
    crop: 'Onion',
    quantityQuintals: 50,
    currentSpotPricePerQtl: 2150,
    trend: 'MODERATE',
    storageFacilityType: 'SCIENTIFIC_CHAWL',
  });
  assert(sciRes.scenarios[3].shrinkageLossPct < baseRes.scenarios[3].shrinkageLossPct, 'Scientific Chawl must dynamically reduce shrinkage loss %');
  assert(sciRes.scenarios[3].netRealisation > baseRes.scenarios[3].netRealisation, 'Scientific Chawl must yield higher net realisation');

  // Verify price expectation variation: Bearish trend makes storage unfavorable
  const bearishRes = calculateStoreVsSell({
    crop: 'Onion',
    quantityQuintals: 50,
    currentSpotPricePerQtl: 2150,
    trend: 'BEARISH',
    storageFacilityType: 'VENTILATED_CHAWL',
  });
  assert.strictEqual(bearishRes.recommendationType, 'SELL_NOW', 'Bearish trend for Onion must recommend SELL_NOW');
});

// Crop 2: Tomato (Perishable)
it('Tomato: Perishable economics dynamically recommend SELL NOW when holding is unfavorable', () => {
  // Tomato in cold storage under STABLE market conditions
  const stableRes = calculateStoreVsSell({
    crop: 'Tomato',
    quantityQuintals: 60,
    currentSpotPricePerQtl: 1600,
    trend: 'STABLE',
    storageFacilityType: 'COLD_STORAGE',
  });

  // At 30, 60, 90 days, shrinkage loss is 16%, 42%, 80% and tariffs are high
  assert(stableRes.scenarios[2].shrinkageLossPct >= 16, 'Tomato 30-day loss must reflect perishability');
  assert(stableRes.scenarios[3].shrinkageLossPct >= 40, 'Tomato 60-day loss must reflect extreme decay');
  assert(stableRes.recommendationType === 'SELL_NOW' || stableRes.recommendationType === 'STORAGE_NOT_ECONOMIC',
    'Tomato under stable market must recommend SELL_NOW or STORAGE_NOT_ECONOMIC');

  // Tomato in ordinary dry warehouse (severe spoilage penalty)
  const dryRes = calculateStoreVsSell({
    crop: 'Tomato',
    quantityQuintals: 60,
    currentSpotPricePerQtl: 1600,
    trend: 'MODERATE',
    storageFacilityType: 'DRY_WAREHOUSE',
  });
  assert(dryRes.recommendationType === 'SELL_NOW' || dryRes.recommendationType === 'STORAGE_NOT_ECONOMIC',
    'Perishable Tomato in dry warehouse must strictly recommend SELL_NOW or STORAGE_NOT_ECONOMIC');
});

// Crop 3: Grapes (High-Value Perishable)
it('Grapes: Cold-chain economics dynamically distinguish viable short-term vs long-term decay', () => {
  const grapesRes = calculateStoreVsSell({
    crop: 'Grapes',
    quantityQuintals: 40,
    currentSpotPricePerQtl: 4200,
    trend: 'STABLE',
    storageFacilityType: 'COLD_STORAGE',
  });

  // 90 days of grape cold storage has 55% loss and ₹315/Qtl tariff
  const d90 = grapesRes.scenarios.find(s => s.id === 'STORE_90_DAYS');
  assert(d90.shrinkageLossPct > 50, 'Grape 90-day holding has excessive shrinkage');
  assert(d90.netAdvantageVsImmediate < 0, 'Long-term grape storage must yield negative economic advantage');
  assert(grapesRes.recommendationType === 'SELL_NOW' || grapesRes.recommendationType === 'STORAGE_NOT_ECONOMIC',
    'Grapes under stable price must recommend SELL NOW');
});

// Crop 4: Potato (Tuber Cold Storage)
it('Potato: Cold storage holds quality with low shrinkage over multi-month holding', () => {
  const potatoRes = calculateStoreVsSell({
    crop: 'Potato',
    quantityQuintals: 150,
    currentSpotPricePerQtl: 1800,
    trend: 'HIGH',
    storageFacilityType: 'COLD_STORAGE',
  });

  // Potato has only ~4.8% shrinkage at 60 days
  const d60 = potatoRes.scenarios.find(s => s.id === 'STORE_60_DAYS');
  assert(d60.shrinkageLossPct <= 6, 'Potato cold storage shrinkage must remain under 6% at 60 days');
  assert(d60.netAdvantageVsImmediate > 0, 'High trend potato storage must yield positive net gain');
  assert(potatoRes.recommendationType.startsWith('STORE_'), 'Potato under high trend must recommend storage holding');
});

// Crop 5: Wheat (Durable Dry Grain)
it('Wheat: Minimal shrinkage in dry warehouse supports long-term holding scenarios', () => {
  const wheatRes = calculateStoreVsSell({
    crop: 'Wheat',
    quantityQuintals: 200,
    currentSpotPricePerQtl: 2450,
    trend: 'MODERATE',
    storageFacilityType: 'DRY_WAREHOUSE',
  });

  // Wheat shrinkage at 90 days is only 1.8%
  const d90 = wheatRes.scenarios.find(s => s.id === 'STORE_90_DAYS');
  assert(d90.shrinkageLossPct <= 2.0, 'Wheat dry warehouse shrinkage must be ≤ 2.0% at 90 days');
  assert(d90.netRealisation > wheatRes.scenarios[0].netRealisation, 'Wheat 90d must beat immediate sale under moderate trend');
  assert(wheatRes.recommendationType === 'STORE_60_DAYS' || wheatRes.recommendationType === 'STORE_90_DAYS',
    'Wheat must recommend 60 or 90 days storage holding');
});

// Crop 6: Soybean (Oilseed)
it('Soybean: Storage economics dynamically evaluate moisture protection and oilseed price trend', () => {
  const soyRes = calculateStoreVsSell({
    crop: 'Soybean',
    quantityQuintals: 80,
    currentSpotPricePerQtl: 4600,
    trend: 'HIGH',
    storageFacilityType: 'DRY_WAREHOUSE',
  });

  assert(soyRes.scenarios[2].saleableQuantityQtl < 80, 'Must deduct moisture shrinkage loss');
  assert(soyRes.scenarios[2].storageTariffTotal > 0, 'Must charge dry warehouse tariff');
  assert(soyRes.recommendationType.startsWith('STORE_'), 'Soybean under high trend must recommend storing');

  // Verify sensitivity: changing duration from 15 to 90 days dynamically increases storage tariff
  assert(soyRes.scenarios[4].storageTariffTotal > soyRes.scenarios[1].storageTariffTotal * 5,
    '90d tariff must be 6x the 15d tariff');
});

// ==========================================
// SECTION 3: ADVANCED FARMER VOICE ASSISTANT
// ==========================================
console.log('\n3. Verifying Farmer Voice Assistant Commands & Safety...');

it('Voice command "Show my crops" navigates to Farmer My Crops', () => {
  const res = parseFarmerIntent('Show my crops', 'en');
  assert.strictEqual(res.intent, 'NAVIGATE_CROPS');
  assert.strictEqual(res.actionUrl, '/farmer');
  assert(res.responseText.length > 0);
});

it('Voice command "Find buyers" navigates to Buyer Marketplace', () => {
  const res = parseFarmerIntent('Find buyers', 'en');
  assert.strictEqual(res.intent, 'FIND_BUYER');
  assert(res.actionUrl === '/buyer' || res.actionUrl.includes('buyer'));
});

it('Voice command "Show onion storage" navigates to Storage Discovery', () => {
  const res = parseFarmerIntent('Show onion storage', 'en');
  assert.strictEqual(res.intent, 'NAVIGATE_STORAGE');
  assert.strictEqual(res.actionUrl, '/storage');
  assert(res.responseText.includes('15'));
});

it('Voice command "Open calculator" navigates to Standalone Net Realisation Calculator', () => {
  const res = parseFarmerIntent('Open calculator', 'en');
  assert.strictEqual(res.intent, 'NAVIGATE_CALCULATOR');
  assert.strictEqual(res.actionUrl, '/calculator');
});

it('Voice command "Show buyer demands" navigates to Buyer Demands Tab', () => {
  const res = parseFarmerIntent('Show buyer demands', 'en');
  assert.strictEqual(res.intent, 'NAVIGATE_DEMANDS');
  assert.strictEqual(res.actionUrl, '/farmer?tab=FIND_BUYERS');
});

it('Voice command "Show my deliveries" navigates to Deliveries Tab', () => {
  const res = parseFarmerIntent('Show my deliveries', 'en');
  assert.strictEqual(res.intent, 'NAVIGATE_DELIVERIES');
  assert.strictEqual(res.actionUrl, '/farmer?tab=MY_DELIVERIES');
});

it('Consequential action "Accept offer" strictly requires explicit confirmation', () => {
  const res = parseFarmerIntent('Accept offer', 'en');
  assert.strictEqual(res.intent, 'CONSEQUENTIAL_ACTION');
  assert.strictEqual(res.isConsequential, true);
  assert.strictEqual(res.requiresConfirmation, true);
  assert(res.confirmationWarning.includes('consequential') || res.confirmationWarning.includes('offer'));
  assert.strictEqual(res.confirmedActionUrl, '/lots');
});

it('Consequential action "Book transport" strictly requires explicit confirmation', () => {
  const res = parseFarmerIntent('Book transport', 'en');
  assert.strictEqual(res.intent, 'CONSEQUENTIAL_ACTION');
  assert.strictEqual(res.isConsequential, true);
  assert.strictEqual(res.requiresConfirmation, true);
  assert(res.confirmedActionUrl, '/transporter');
});

it('Multilingual voice navigation and safety works authentically in Marathi, Hindi and Telugu', () => {
  // Marathi
  const mrCrops = parseFarmerIntent('माझी पिके दाखवा', 'mr');
  assert.strictEqual(mrCrops.intent, 'NAVIGATE_CROPS');
  assert.strictEqual(mrCrops.actionUrl, '/farmer');

  const mrStorage = parseFarmerIntent('कांदा साठवणूक गोदाम दाखवा', 'mr');
  assert.strictEqual(mrStorage.intent, 'NAVIGATE_STORAGE');
  assert.strictEqual(mrStorage.actionUrl, '/storage');

  const mrConfirm = parseFarmerIntent('ऑफर स्वीकार करा', 'mr');
  assert.strictEqual(mrConfirm.intent, 'CONSEQUENTIAL_ACTION');
  assert.strictEqual(mrConfirm.isConsequential, true);

  // Hindi
  const hiDemands = parseFarmerIntent('खरीदार मांगें दिखाओ', 'hi');
  assert.strictEqual(hiDemands.intent, 'NAVIGATE_DEMANDS');
  assert.strictEqual(hiDemands.actionUrl, '/farmer?tab=FIND_BUYERS');

  const hiStorage = parseFarmerIntent('प्याज भंडारण गोदाम', 'hi');
  assert.strictEqual(hiStorage.intent, 'NAVIGATE_STORAGE');
  assert.strictEqual(hiStorage.actionUrl, '/storage');

  // Telugu
  const teDeliveries = parseFarmerIntent('నా డెలివరీలు చూపించు', 'te');
  assert.strictEqual(teDeliveries.intent, 'NAVIGATE_DELIVERIES');
  assert.strictEqual(teDeliveries.actionUrl, '/farmer?tab=MY_DELIVERIES');

  const teCalc = parseFarmerIntent('కాలిక్యులేటర్ తెరవండి', 'te');
  assert.strictEqual(teCalc.intent, 'NAVIGATE_CALCULATOR');
  assert.strictEqual(teCalc.actionUrl, '/calculator');
});

// ==========================================
// SECTION 4: DATABASE INTEGRITY
// ==========================================
console.log('\n4. Verifying Database Curation & ProduceLot Count...');

const dbPath = path.join(kisansetuRoot, 'prisma/dev.db');
assert(fs.existsSync(dbPath), 'prisma/dev.db must exist');

const { execSync } = require('child_process');

it('Database contains exactly 13 curated ProduceLots', () => {
  const countOutput = execSync(`node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.produceLot.count().then(c => { console.log('COUNT:' + c); process.exit(0); });"`, {
    cwd: kisansetuRoot,
    encoding: 'utf8',
  });
  const match = countOutput.match(/COUNT:(\d+)/);
  assert(match, 'Failed to query produceLot count');
  const count = parseInt(match[1], 10);
  assert.strictEqual(count, 13, `Expected strictly 13 ProduceLots, found ${count}`);
});

it('Database contains exactly 15 StorageFacilities', () => {
  const countOutput = execSync(`node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.storageFacility.count().then(c => { console.log('STORAGE_COUNT:' + c); process.exit(0); });"`, {
    cwd: kisansetuRoot,
    encoding: 'utf8',
  });
  const match = countOutput.match(/STORAGE_COUNT:(\d+)/);
  assert(match, 'Failed to query storageFacility count');
  const count = parseInt(match[1], 10);
  assert.strictEqual(count, 15, `Expected strictly 15 StorageFacilities, found ${count}`);
});

console.log('====================================================');
console.log(`  Storage Discovery & Voice Results: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================\n');

if (failCount > 0) process.exit(1);
process.exit(0);
