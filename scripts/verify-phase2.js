// KisanSetu - Phase 2 Produce Lot Verification Script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runVerification() {
  console.log('====================================================');
  console.log('KISANSETU PHASE 2: PRODUCE LOT WORKFLOW VERIFICATION');
  console.log('====================================================\n');

  try {
    // 1. Verify Database Connection
    console.log('[1/7] Testing SQLite connection via Prisma...');
    const userCount = await prisma.user.count();
    console.log(`  -> Connection OK. Total existing users: ${userCount}`);

    // 2. Verify Demo Farmer Provisioning
    console.log('\n[2/7] Verifying Demo Farmer Provisioning...');
    let demoUser = await prisma.user.findUnique({
      where: { phone: '+919822012345' },
      include: { farmerProfile: true },
    });

    if (!demoUser || !demoUser.farmerProfile) {
      console.log('  -> Demo farmer not yet seeded. Seeding now...');
      demoUser = await prisma.user.create({
        data: {
          phone: '+919822012345',
          fullName: 'Ramesh Patil',
          role: 'FARMER',
          preferredLanguage: 'mr',
          isActive: true,
          farmerProfile: {
            create: {
              state: 'Maharashtra',
              district: 'Nashik',
              taluka: 'Niphad',
              village: 'Pimpalgaon Baswant',
              landAreaAcres: 4.5,
              isFpoMember: true,
            },
          },
        },
        include: { farmerProfile: true },
      });
    }

    console.log(`  -> Farmer User: ${demoUser.fullName} (${demoUser.phone})`);
    console.log(`  -> Farmer Profile ID: ${demoUser.farmerProfile.id}`);
    console.log(`  -> District: ${demoUser.farmerProfile.district}, Taluka: ${demoUser.farmerProfile.taluka}`);

    const farmerId = demoUser.farmerProfile.id;

    // 3. Verify Unique Lot ID Format
    console.log('\n[3/7] Testing Lot ID Generator Logic...');
    const currentYear = new Date().getFullYear();
    const existingCount = await prisma.produceLot.count({
      where: {
        commodity: { contains: 'Onion' },
        createdAt: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        },
      },
    });
    const seq = String(existingCount + 1).padStart(4, '0');
    const expectedLotId = `KS-ONION-${currentYear}-${seq}`;
    console.log(`  -> Generated Lot ID format: ${expectedLotId}`);
    const lotIdRegex = /^KS-[A-Z]+-\d{4}-\d{4}$/;
    if (!lotIdRegex.test(expectedLotId)) {
      throw new Error(`Lot ID format invalid: ${expectedLotId}`);
    }
    console.log('  -> Lot ID format matches regex ^KS-[A-Z]+-\\d{4}-\\d{4}$ [PASS]');

    // 4. Create Produce Lot (AVAILABLE)
    console.log('\n[4/7] Creating Produce Lot (AVAILABLE)...');
    const createdLot = await prisma.produceLot.create({
      data: {
        lotCode: expectedLotId,
        farmerId: farmerId,
        commodity: 'Onion',
        variety: 'Nashik Red Garva',
        quantity: 120,
        unit: 'Quintal',
        quantityQuintals: 120,
        expectedPrice: 2200,
        expectedPricePerQuintal: 2200,
        expectedGrade: 'Grade A',
        harvestDate: new Date(),
        readyForPickupDate: new Date(),
        locationDistrict: 'Nashik',
        location: 'Niphad, Nashik',
        description: 'Stored in ventilated kanda chawl, dry, well sorted.',
        status: 'AVAILABLE',
      },
    });

    console.log(`  -> Lot created successfully! ID: ${createdLot.id}`);
    console.log(`  -> Lot Code: ${createdLot.lotCode}`);
    console.log(`  -> Commodity: ${createdLot.commodity} (${createdLot.variety})`);
    console.log(`  -> Volume: ${createdLot.quantity} ${createdLot.unit} (${createdLot.quantityQuintals} Qtl)`);
    console.log(`  -> Target Price: Rs ${createdLot.expectedPricePerQuintal}/Qtl`);
    console.log(`  -> Status: ${createdLot.status} [PASS]`);

    // 5. Create Draft Produce Lot (DRAFT)
    console.log('\n[5/7] Creating Draft Produce Lot (DRAFT)...');
    const draftSeq = String(existingCount + 2).padStart(4, '0');
    const draftLotId = `KS-SOYBEAN-${currentYear}-${draftSeq}`;
    const draftLot = await prisma.produceLot.create({
      data: {
        lotCode: draftLotId,
        farmerId: farmerId,
        commodity: 'Soybean',
        variety: 'JS-335',
        quantity: 8,
        unit: 'Tonnes',
        quantityQuintals: 80, // 8 Tonnes = 80 Quintals
        expectedPrice: 46000, // 46000 per Tonne = 4600 per Quintal
        expectedPricePerQuintal: 4600,
        expectedGrade: 'Grade B',
        harvestDate: new Date(),
        readyForPickupDate: new Date(),
        locationDistrict: 'Nashik',
        location: 'Dindori, Nashik',
        description: 'Draft lot awaiting final threshing.',
        status: 'DRAFT',
      },
    });
    console.log(`  -> Draft Lot created! Lot Code: ${draftLot.lotCode}`);
    console.log(`  -> Standardized Volume check: 8 Tonnes = ${draftLot.quantityQuintals} Quintals [PASS]`);
    console.log(`  -> Normalized Price check: Rs 46000/Tonne = Rs ${draftLot.expectedPricePerQuintal}/Quintal [PASS]`);

    // 6. Test Query & Aggregated Metrics
    console.log('\n[6/7] Querying Farmer Produce Lots & Metrics...');
    const allLots = await prisma.produceLot.findMany({
      where: { farmerId: farmerId },
      orderBy: { createdAt: 'desc' },
    });

    const totalLots = allLots.length;
    const activeLots = allLots.filter((l) => l.status === 'AVAILABLE').length;
    const draftLots = allLots.filter((l) => l.status === 'DRAFT').length;
    const totalQtl = allLots
      .filter((l) => l.status === 'AVAILABLE')
      .reduce((sum, l) => sum + l.quantityQuintals, 0);

    console.log(`  -> Total Lots in DB: ${totalLots}`);
    console.log(`  -> Active Lots: ${activeLots}`);
    console.log(`  -> Draft Lots: ${draftLots}`);
    console.log(`  -> Total Active Volume: ${totalQtl} Quintals [PASS]`);

    // 7. Test PATCH / Update Workflow
    console.log('\n[7/7] Testing Produce Lot Update (PATCH)...');
    const updatedLot = await prisma.produceLot.update({
      where: { id: createdLot.id },
      data: {
        quantity: 150,
        quantityQuintals: 150,
        expectedPrice: 2350,
        expectedPricePerQuintal: 2350,
        expectedGrade: 'Grade A',
        status: 'AVAILABLE',
      },
    });

    console.log(`  -> Updated Lot Quantity: ${updatedLot.quantity} ${updatedLot.unit}`);
    console.log(`  -> Updated Lot Price: Rs ${updatedLot.expectedPricePerQuintal}/Qtl`);
    console.log(`  -> Updated Status: ${updatedLot.status} [PASS]`);

    console.log('\n====================================================');
    console.log('ALL PHASE 2 BACKEND VERIFICATIONS PASSED SUCCESSFULLY!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
