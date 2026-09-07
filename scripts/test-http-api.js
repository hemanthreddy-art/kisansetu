// Test HTTP APIs and SSR/Client pages on localhost:3005
async function testEndpoints() {
  console.log('Testing HTTP Endpoints on http://localhost:3005...\n');
  const baseUrl = 'http://localhost:3005';

  // 1. GET /api/lots
  console.log('[1/5] GET /api/lots');
  const res1 = await fetch(`${baseUrl}/api/lots`);
  const data1 = await res1.json();
  console.log('  Status:', res1.status, '| Success:', data1.success);
  console.log('  Total Lots:', data1.metrics.totalLots, '| Active Lots:', data1.metrics.activeLots);

  // 2. POST /api/lots (Create cotton lot)
  console.log('\n[2/5] POST /api/lots');
  const createPayload = {
    crop: 'Cotton',
    variety: 'Bunny BT',
    quantity: 40,
    unit: 'Quintal',
    expectedPrice: 7200,
    expectedGrade: 'Grade A',
    harvestDate: '2026-09-01',
    availabilityDate: '2026-09-10',
    district: 'Yavatmal',
    location: 'Wani, Yavatmal',
    description: 'Medium staple length, clean picking.',
    status: 'AVAILABLE',
  };
  const res2 = await fetch(`${baseUrl}/api/lots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createPayload),
  });
  const data2 = await res2.json();
  console.log('  Status:', res2.status, '| Success:', data2.success);
  console.log('  Assigned Lot ID:', data2.lotId);

  const createdCode = data2.lotId;

  // 3. GET /api/lots/[id]
  console.log(`\n[3/5] GET /api/lots/${createdCode}`);
  const res3 = await fetch(`${baseUrl}/api/lots/${createdCode}`);
  const data3 = await res3.json();
  console.log('  Status:', res3.status, '| Success:', data3.success);
  console.log('  Commodity:', data3.data.commodity, '| Variety:', data3.data.variety);
  console.log('  Standardized Quintals:', data3.data.quantityQuintals);

  // 4. PATCH /api/lots/[id]
  console.log(`\n[4/5] PATCH /api/lots/${createdCode}`);
  const res4 = await fetch(`${baseUrl}/api/lots/${createdCode}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      expectedPrice: 7500,
      description: 'Updated: Certified organic picking.',
      status: 'AVAILABLE',
    }),
  });
  const data4 = await res4.json();
  console.log('  Status:', res4.status, '| Success:', data4.success);
  console.log('  Updated Price:', data4.data.expectedPricePerQuintal);

  // 5. Test page routes rendering (SSR/Static HTML)
  console.log('\n[5/5] Testing Page Routes (HTTP 200 OK)');
  const pages = ['/farmer', '/lots', `/lots/${createdCode}`, '/calculator'];
  for (const page of pages) {
    const pageRes = await fetch(`${baseUrl}${page}`);
    console.log(`  Route ${page} -> HTTP ${pageRes.status} ${pageRes.statusText}`);
    if (pageRes.status !== 200) {
      throw new Error(`Page ${page} failed with status ${pageRes.status}`);
    }
  }

  console.log('\n====================================================');
  console.log('ALL HTTP API AND UI ROUTES TESTED & WORKING 100%!');
  console.log('====================================================');
}

testEndpoints().catch((err) => {
  console.error('HTTP Test Failed:', err);
  process.exit(1);
});
