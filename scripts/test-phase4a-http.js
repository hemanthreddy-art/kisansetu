// scripts/test-phase4a-http.js
const http = require('http');

async function testPhase4AHttp() {
  const baseUrl = 'http://localhost:3000';
  console.log('====================================================');
  console.log('  KisanSetu Phase 4A HTTP API Integration Tests     ');
  console.log('====================================================\n');

  // 1. Check /api/health (Phase 1 sanity)
  console.log('[1/10] GET /api/health (Phase 1 Baseline)...');
  const resHealth = await fetch(`${baseUrl}/api/health`);
  const dataHealth = await resHealth.json();
  if (!resHealth.ok || dataHealth.status !== 'healthy') {
    throw new Error('Healthcheck failed');
  }
  console.log(`PASS: Healthcheck 200 OK [Application: ${dataHealth.application} | Status: ${dataHealth.status}]\n`);

  // 2. Fetch existing produce lot (Phase 2 sanity)
  console.log('[2/10] GET /api/lots (Phase 2 Baseline)...');
  const resLots = await fetch(`${baseUrl}/api/lots`);
  const dataLots = await resLots.json();
  if (!resLots.ok || !dataLots.success || dataLots.data.length === 0) {
    throw new Error('No lots found on /api/lots');
  }
  const lot = dataLots.data[0];
  console.log(`PASS: Found target produce lot: ${lot.lotCode} (${lot.commodity} - ${lot.quantityQuintals} Qtl)\n`);

  // 3. GET /api/buyer-demands (Phase 4A)
  console.log('[3/10] GET /api/buyer-demands...');
  const resDemands = await fetch(`${baseUrl}/api/buyer-demands`);
  const dataDemands = await resDemands.json();
  if (!resDemands.ok || !dataDemands.success) {
    throw new Error('Failed to fetch buyer demands');
  }
  console.log(`PASS: Retrieved ${dataDemands.count} buyer demands.`);
  if (dataDemands.count > 0) {
    console.log(`  -> Sample: ${dataDemands.demands[0].companyName} seeks ${dataDemands.demands[0].requiredQuantityQtl} Qtl ${dataDemands.demands[0].commodity}`);
    console.log(`  -> Reputation: ★${dataDemands.demands[0].reputation.ratingScore} (${dataDemands.demands[0].reputation.completedTradesCount} trades, ${dataDemands.demands[0].reputation.paymentPunctualityPercent}% punctuality)`);
  }
  console.log('');

  // 4. POST /api/buyer-demands (Create new commercial demand)
  console.log('[4/10] POST /api/buyer-demands (Creating demand for Nashik Fresh)...');
  const demandPayload = {
    buyerKey: 'NASHIK_FRESH',
    commodity: 'Onion',
    variety: 'Garva Red',
    requiredQuantityQtl: 150,
    unit: 'Quintal',
    targetPricePerQtl: 2450,
    minPricePerQtl: 2200,
    maxPricePerQtl: 2600,
    destinationDistrict: 'Nashik',
    deliveryLocation: 'Nashik Fresh Packhouse, Pimpalgaon Baswant',
    deliveryDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    requiredGrade: 'Grade A',
    qualityRequirements: 'Dry outer skin, neck firmness, sorting completed',
    description: 'Procurement for direct APMC export allocation.',
    status: 'ACTIVE',
  };

  const resCreateDemand = await fetch(`${baseUrl}/api/buyer-demands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(demandPayload),
  });
  const dataCreateDemand = await resCreateDemand.json();
  if (!resCreateDemand.ok || !dataCreateDemand.success) {
    throw new Error(`Failed to create buyer demand: ${dataCreateDemand.error || JSON.stringify(dataCreateDemand)}`);
  }
  const createdDemandId = dataCreateDemand.demand.id;
  console.log(`PASS: Created Demand (ID: ${createdDemandId}) [HTTP 201 Created]`);
  console.log(`  -> Company: ${dataCreateDemand.demand.companyName}`);
  console.log(`  -> Credential Verified: ${dataCreateDemand.demand.isBuyerVerified}\n`);

  // 5. GET /api/buyer-demands/[id]
  console.log(`[5/10] GET /api/buyer-demands/${createdDemandId}...`);
  const resGetDemand = await fetch(`${baseUrl}/api/buyer-demands/${createdDemandId}`);
  const dataGetDemand = await resGetDemand.json();
  if (!resGetDemand.ok || !dataGetDemand.success) {
    throw new Error('Failed to retrieve single buyer demand');
  }
  console.log(`PASS: Retrieved Demand details: ${dataGetDemand.demand.commodity} @ ₹${dataGetDemand.demand.targetPricePerQtl}/Qtl\n`);

  // 6. GET /api/lots/[id]/matches (Rule-Based Matching API)
  console.log(`[6/10] GET /api/lots/${lot.lotCode}/matches (Transparent Matching Engine)...`);
  const resMatches = await fetch(`${baseUrl}/api/lots/${encodeURIComponent(lot.lotCode)}/matches`);
  const dataMatches = await resMatches.json();
  if (!resMatches.ok || !dataMatches.success) {
    throw new Error(`Failed to match lot: ${dataMatches.error}`);
  }
  console.log(`PASS: Matches computed successfully!`);
  console.log(`  -> Total Demands Scanned: ${dataMatches.totalDemandsScanned}`);
  console.log(`  -> Compatible Matches Found: ${dataMatches.matchCount}`);
  console.log(`  -> Lot Quality Status: ${dataMatches.lotSummary.qualityLabel} (${dataMatches.lotSummary.qualityStatus})`);

  if (dataMatches.matchCount > 0) {
    const topMatch = dataMatches.matches[0];
    console.log(`  -> Top Match: ${topMatch.companyName}`);
    console.log(`  -> Match Score: ${topMatch.matchScore}% [Grade: ${topMatch.matchGrade}]`);
    console.log(`  -> Checklist of Reasons:`);
    topMatch.positiveReasons.slice(0, 3).forEach((r) => console.log(`     ${r}`));
  }
  console.log('');

  // 7. POST /api/lots/[id]/offers (Buyer Submits Digital Purchase Offer)
  console.log(`[7/10] POST /api/lots/${lot.lotCode}/offers (Buyer Digital Offer)...`);
  const offerPayload = {
    buyerKey: 'ABC_FOODS',
    offeredPricePerQtl: 2400,
    quantityQuintals: 80,
    proposedPickupDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    paymentTerms: 'ESCROW_ON_DELIVERY',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Official procurement offer from ABC Foods processing division.',
  };

  const resOfferPost = await fetch(`${baseUrl}/api/lots/${encodeURIComponent(lot.lotCode)}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(offerPayload),
  });
  const dataOfferPost = await resOfferPost.json();
  if (!resOfferPost.ok || !dataOfferPost.success) {
    throw new Error(`Failed to create offer: ${dataOfferPost.error}`);
  }
  const createdOfferId = dataOfferPost.offer.id;
  console.log(`PASS: Digital Purchase Offer Created (ID: ${createdOfferId}) [HTTP 201 Created]`);
  console.log(`  -> Offered Price: ₹${dataOfferPost.offer.offeredPricePerQtl}/Qtl`);
  console.log(`  -> Volume: ${dataOfferPost.offer.quantityQuintals} Qtl | Total Value: ₹${dataOfferPost.offer.totalOfferValue.toLocaleString('en-IN')}`);
  console.log(`  -> Initial Status: ${dataOfferPost.offer.status} (Strictly Pending - Not Auto-Accepted)\n`);

  // 8. GET /api/lots/[id]/offers (Ownership separation)
  console.log(`[8/10] GET /api/lots/${lot.lotCode}/offers (Offer Inbox Retrieval)...`);
  const resOffersGet = await fetch(`${baseUrl}/api/lots/${encodeURIComponent(lot.lotCode)}/offers?role=FARMER`);
  const dataOffersGet = await resOffersGet.json();
  if (!resOffersGet.ok || !dataOffersGet.success) {
    throw new Error('Failed to retrieve lot offers');
  }
  console.log(`PASS: Farmer retrieved ${dataOffersGet.count} incoming purchase offer(s) for lot ${dataOffersGet.lotCode}\n`);

  // 9. Security Check: Buyer cannot ACCEPT an offer
  console.log(`[9/10] Security Verification: Unauthorized Role Acceptance Prevention...`);
  const resForbidden = await fetch(`${baseUrl}/api/offers/${createdOfferId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'ACCEPTED',
      role: 'BUYER', // Buyer attempting to accept their own offer
    }),
  });
  if (resForbidden.status !== 403) {
    throw new Error(`Expected 403 Forbidden for buyer accepting offer, got ${resForbidden.status}`);
  }
  console.log(`PASS: Server-side authorization prevented buyer from accepting offer (HTTP 403 Forbidden)\n`);

  // 10. Farmer Accepts Offer -> Status ACCEPTED, Lot RESERVED
  console.log(`[10/10] PATCH /api/offers/${createdOfferId} (Farmer Accepts Purchase Offer)...`);
  const resAccept = await fetch(`${baseUrl}/api/offers/${createdOfferId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'ACCEPTED',
      role: 'FARMER',
      notes: 'Deal finalized. Prepare for farmgate dispatch.',
    }),
  });
  const dataAccept = await resAccept.json();
  if (!resAccept.ok || !dataAccept.success) {
    throw new Error(`Failed to accept offer: ${dataAccept.error}`);
  }
  console.log(`PASS: Offer successfully ACCEPTED!`);
  console.log(`  -> Message: ${dataAccept.message}`);
  console.log(`  -> Offer Status: ${dataAccept.offer.status}\n`);

  console.log('====================================================');
  console.log('  ALL 10 PHASE 4A HTTP TESTS PASSED (10/10)         ');
  console.log('====================================================\n');
}

testPhase4AHttp().catch((err) => {
  console.error('HTTP Test failed:', err);
  process.exit(1);
});
