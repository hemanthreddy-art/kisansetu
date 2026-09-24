const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('====================================================');
  console.log('  KisanSetu — Database Curation to 13 Representative Lots');
  console.log('====================================================\n');

  // 1. Initial count
  const initialLots = await prisma.produceLot.findMany({ select: { id: true, lotCode: true } });
  console.log(`Initial ProduceLots in DB: ${initialLots.length}`);
  const initialTxns = await prisma.transaction.findMany({ select: { id: true, transactionCode: true } });
  console.log(`Initial Transactions in DB: ${initialTxns.length}`);

  // 2. Identify the 13 Retained Lots
  // We explicitly define the 13 target lots:
  const retainedLotConfigs = [
    {
      id: 'cmtplfopt000311fhrrmu0jpj', // CRITICAL PRESERVED FIXTURE
      lotCode: 'KS-ONION-2026-0001',
      scenario: '1. Available',
      commodity: 'Onion',
      variety: 'Nashik Red Garva',
      quantity: 80,
      unit: 'Quintal',
      quantityQuintals: 80,
      expectedPrice: 2400,
      expectedPricePerQuintal: 2400,
      expectedGrade: 'Grade A',
      locationDistrict: 'Nashik',
      locationTaluka: 'Niphad',
      locationVillage: 'Pimpalgaon Baswant',
      location: 'Niphad, Nashik',
      description: 'Prime kharif onion lot with high pungency and uniform 45-60mm bulb diameter. Tested and ready for APMC or corporate procurement.',
      status: 'AVAILABLE',
      harvestDate: new Date('2026-03-01'),
      readyForPickupDate: new Date('2026-03-05'),
    },
    {
      id: 'cmub3ejfr00051np0x5kgox4f',
      lotCode: 'KS-WHEAT-2026-0001',
      scenario: '2. Available',
      commodity: 'Wheat',
      variety: 'Lokwan',
      quantity: 120,
      unit: 'Quintal',
      quantityQuintals: 120,
      expectedPrice: 2250,
      expectedPricePerQuintal: 2250,
      expectedGrade: 'Grade A',
      locationDistrict: 'Nashik',
      locationTaluka: 'Dindori',
      locationVillage: 'Dindori',
      location: 'Dindori, Nashik',
      description: 'High-protein Lokwan golden wheat lot. Moisture 10.5%, clean harvested with zero foreign matter.',
      status: 'AVAILABLE',
      harvestDate: new Date('2026-02-25'),
      readyForPickupDate: new Date('2026-03-02'),
    },
    {
      id: 'cmtrhmocm000381h1f8s2whoh',
      lotCode: 'KS-TOMATO-2026-0001',
      scenario: '3. Sold — Handover Pending',
      commodity: 'Tomato',
      variety: 'Abhinav',
      quantity: 60,
      unit: 'Quintal',
      quantityQuintals: 60,
      expectedPrice: 1850,
      expectedPricePerQuintal: 1850,
      expectedGrade: 'Grade A',
      locationDistrict: 'Pune',
      locationTaluka: 'Junnar',
      locationVillage: 'Otur',
      location: 'Junnar, Pune',
      description: 'Firm red table tomatoes for commercial food processing. Bids accepted, escrow deposit locked, awaiting transport arrangement.',
      status: 'RESERVED',
      harvestDate: new Date('2026-03-08'),
      readyForPickupDate: new Date('2026-03-10'),
    },
    {
      id: 'cmtplfopy000511fh69rtywpk',
      lotCode: 'KS-SOYBEAN-2026-0001',
      scenario: '4. Sold — Handover Pending with transport selected',
      commodity: 'Soybean',
      variety: 'JS-335',
      quantity: 90,
      unit: 'Quintal',
      quantityQuintals: 90,
      expectedPrice: 4600,
      expectedPricePerQuintal: 4600,
      expectedGrade: 'Grade A',
      locationDistrict: 'Latur',
      locationTaluka: 'Ausa',
      locationVillage: 'Ausa',
      location: 'Ausa, Latur',
      description: 'Yellow seeded JS-335 soybean with 19% oil content. Transporter confirmed; ready for truck loading at farm gate.',
      status: 'TRANSPORT_SELECTED',
      harvestDate: new Date('2026-02-20'),
      readyForPickupDate: new Date('2026-02-28'),
    },
    {
      id: 'cmtpud3pb0001og9ekq4bf6wf',
      lotCode: 'KS-ONION-2026-0002',
      scenario: '5. Transport / Dispatch in progress',
      commodity: 'Onion',
      variety: 'Garva Red',
      quantity: 150,
      unit: 'Quintal',
      quantityQuintals: 150,
      expectedPrice: 2450,
      expectedPricePerQuintal: 2450,
      expectedGrade: 'Grade A',
      locationDistrict: 'Nashik',
      locationTaluka: 'Niphad',
      locationVillage: 'Pimpalgaon Baswant',
      location: 'Niphad, Nashik',
      description: 'Consignment loaded and currently en route via Sahyadri Logistics 6-Tonnes Eicher truck to Pune APMC Hub.',
      status: 'IN_TRANSIT',
      harvestDate: new Date('2026-03-02'),
      readyForPickupDate: new Date('2026-03-06'),
    },
    {
      id: 'cmtplgtgm0001n9paoe8i0r3t',
      lotCode: 'KS-COTTON-2026-0001',
      scenario: '6. Handed Over',
      commodity: 'Cotton',
      variety: 'Bunny BT',
      quantity: 40,
      unit: 'Quintal',
      quantityQuintals: 40,
      expectedPrice: 7200,
      expectedPricePerQuintal: 7200,
      expectedGrade: 'Grade A',
      locationDistrict: 'Yavatmal',
      locationTaluka: 'Ghatanji',
      locationVillage: 'Ghatanji',
      location: 'Ghatanji, Yavatmal',
      description: 'Long staple cotton. Delivered to buyer hub. Physically verified with official grade certificate.',
      status: 'HANDED_OVER',
      harvestDate: new Date('2026-02-15'),
      readyForPickupDate: new Date('2026-02-22'),
    },
    {
      id: 'cmtsa37w40003y2s6cyirdu9i',
      lotCode: 'KS-GRAPES-2026-0001',
      scenario: '7. Handed Over',
      commodity: 'Grapes',
      variety: 'Thompson Seedless',
      quantity: 45,
      unit: 'Quintal',
      quantityQuintals: 45,
      expectedPrice: 5400,
      expectedPricePerQuintal: 5400,
      expectedGrade: 'Grade A',
      locationDistrict: 'Nashik',
      locationTaluka: 'Niphad',
      locationVillage: 'Pimpalgaon Baswant',
      location: 'Pimpalgaon Baswant, Nashik',
      description: 'Export-grade Thompson Seedless table grapes delivered in cold chain reefer van to Vashi terminal.',
      status: 'HANDED_OVER',
      harvestDate: new Date('2026-03-04'),
      readyForPickupDate: new Date('2026-03-07'),
    },
    {
      id: 'cmtrhhf4m000181h1rijv74sy',
      lotCode: 'KS-RICE-2026-0001',
      scenario: '8. Payment Processing',
      commodity: 'Rice',
      variety: 'Indrayani',
      quantity: 75,
      unit: 'Quintal',
      quantityQuintals: 75,
      expectedPrice: 3800,
      expectedPricePerQuintal: 3800,
      expectedGrade: 'Grade A',
      locationDistrict: 'Nashik',
      locationTaluka: 'Igatpuri',
      locationVillage: 'Ghoti',
      location: 'Igatpuri, Nashik',
      description: 'Aromatic Indrayani rice. Quality inspection confirmed at warehouse gate; automated escrow release in progress.',
      status: 'PAYMENT_PROCESSING',
      harvestDate: new Date('2026-02-10'),
      readyForPickupDate: new Date('2026-02-18'),
    },
    {
      id: 'cmtsa2ttn0001y2s6dfdhjpye',
      lotCode: 'KS-MAIZE-2026-0001',
      scenario: '9. Payment Processing',
      commodity: 'Maize',
      variety: 'African Tall',
      quantity: 100,
      unit: 'Quintal',
      quantityQuintals: 100,
      expectedPrice: 2100,
      expectedPricePerQuintal: 2100,
      expectedGrade: 'Grade A',
      locationDistrict: 'Jalgaon',
      locationTaluka: 'Raver',
      locationVillage: 'Raver',
      location: 'Raver, Jalgaon',
      description: 'Industrial feed maize lot. Lab moisture 12% verified, buyer accepted delivery, payout initiated.',
      status: 'PAYMENT_PROCESSING',
      harvestDate: new Date('2026-02-28'),
      readyForPickupDate: new Date('2026-03-05'),
    },
    {
      id: 'cmub44xcu0009ia2a9n60uig6',
      lotCode: 'KS-POTATO-2026-0001',
      scenario: '10. Completed / History',
      commodity: 'Potato',
      variety: 'Kufri Jyoti',
      quantity: 110,
      unit: 'Quintal',
      quantityQuintals: 110,
      expectedPrice: 1650,
      expectedPricePerQuintal: 1650,
      expectedGrade: 'Grade A',
      locationDistrict: 'Pune',
      locationTaluka: 'Manchar',
      locationVillage: 'Manchar',
      location: 'Manchar, Pune',
      description: 'Fully settled commercial trade. Net realisation ₹1,78,200 deposited to farmer bank account. Receipt archived in History.',
      status: 'COMPLETED',
      harvestDate: new Date('2026-01-20'),
      readyForPickupDate: new Date('2026-01-25'),
    },
    {
      id: 'cmttj64oq00017yd5pnkt7aiz',
      lotCode: 'KS-ONION-2026-HIST-01',
      scenario: '11. Completed / History',
      commodity: 'Onion',
      variety: 'Nashik Red',
      quantity: 100,
      unit: 'Quintal',
      quantityQuintals: 100,
      expectedPrice: 2350,
      expectedPricePerQuintal: 2350,
      expectedGrade: 'Grade A',
      locationDistrict: 'Nashik',
      locationTaluka: 'Niphad',
      locationVillage: 'Pimpalgaon Baswant',
      location: 'Niphad, Nashik',
      description: 'Completed procurement contract TXN-2026-NIPHAD-0891 with Nashik Fresh Processors. Fully settled.',
      status: 'COMPLETED',
      harvestDate: new Date('2026-02-05'),
      readyForPickupDate: new Date('2026-02-12'),
    },
    {
      id: 'cmub45ya1000dia2az60h5pb9',
      lotCode: 'KS-SOYBEAN-2026-STORED',
      scenario: '12. Storage / Stored crop',
      commodity: 'Soybean',
      variety: 'JS-335 (Stored)',
      quantity: 70,
      unit: 'Quintal',
      quantityQuintals: 70,
      expectedPrice: 4800,
      expectedPricePerQuintal: 4800,
      expectedGrade: 'Grade A',
      locationDistrict: 'Nashik',
      locationTaluka: 'Niphad',
      locationVillage: 'Pimpalgaon Baswant',
      location: 'MSWC Pimpalgaon Baswant Agri Warehouse, Nashik',
      description: 'Stored at MSWC Pimpalgaon Baswant Agri Warehouse (WDRA e-NWR: MSWC-NIP-0492). Holding advantage +₹320/Qtl, pledge credit eligible.',
      status: 'AVAILABLE',
      harvestDate: new Date('2026-02-10'),
      readyForPickupDate: new Date('2026-02-15'),
    },
    {
      id: 'cmub46h3j000hia2axnfoc1xm',
      lotCode: 'KS-ONION-2026-FPO-01',
      scenario: '13. Small farmer lot for FPO aggregation',
      commodity: 'Onion',
      variety: 'Nashik Red',
      quantity: 20,
      unit: 'Quintal',
      quantityQuintals: 20,
      expectedPrice: 2350,
      expectedPricePerQuintal: 2350,
      expectedGrade: 'Grade A',
      locationDistrict: 'Nashik',
      locationTaluka: 'Niphad',
      locationVillage: 'Pimpalgaon Baswant',
      location: 'Niphad, Nashik',
      description: 'Smallholder micro-lot (20 Qtl) eligible for FPO collective bargaining and aggregation console.',
      status: 'AVAILABLE',
      harvestDate: new Date('2026-03-05'),
      readyForPickupDate: new Date('2026-03-08'),
    }
  ];

  const retainedLotIds = new Set(retainedLotConfigs.map(c => c.id));
  const lotsToDelete = initialLots.filter(l => !retainedLotIds.has(l.id));
  const lotIdsToDelete = lotsToDelete.map(l => l.id);

  console.log(`\nLots to retain: ${retainedLotConfigs.length}`);
  console.log(`Lots to actually delete: ${lotIdsToDelete.length}`);

  // 3. Clean up dependencies of lots to delete
  console.log('\n--- Step 1: Cleaning up dependencies of deleted lots ---');

  // Find transactions linked to deleted lots (except critical fixture TXN-2026-P8-3687)
  const txnsToDelete = await prisma.transaction.findMany({
    where: {
      OR: [
        { lotId: { in: lotIdsToDelete } },
        { transactionCode: { startsWith: 'TXN-2026-00' } } // cleanup ephemeral test txns
      ],
      NOT: {
        transactionCode: 'TXN-2026-P8-3687' // MUST NEVER DELETE CRITICAL TEST FIXTURE
      }
    },
    select: { id: true, transactionCode: true }
  });
  const txnIdsToDelete = txnsToDelete.map(t => t.id);
  console.log(`Transactions to delete: ${txnIdsToDelete.length}`);

  if (txnIdsToDelete.length > 0) {
    const deletedRatings = await prisma.rating.deleteMany({
      where: { transactionId: { in: txnIdsToDelete } }
    });
    console.log(`  Deleted ${deletedRatings.count} Ratings.`);

    const deletedPayments = await prisma.payment.deleteMany({
      where: { transactionId: { in: txnIdsToDelete } }
    });
    console.log(`  Deleted ${deletedPayments.count} Payments.`);

    const deletedDisputes = await prisma.dispute.deleteMany({
      where: { transactionId: { in: txnIdsToDelete } }
    });
    console.log(`  Deleted ${deletedDisputes.count} Disputes.`);

    const deletedTxns = await prisma.transaction.deleteMany({
      where: { id: { in: txnIdsToDelete } }
    });
    console.log(`  Deleted ${deletedTxns.count} Transactions.`);
  }

  // Delete transport requests of deleted lots
  const deletedTrReqs = await prisma.transportRequest.deleteMany({
    where: { lotId: { in: lotIdsToDelete } }
  });
  console.log(`  Deleted ${deletedTrReqs.count} TransportRequests for deleted lots.`);

  // Clean excessive transport requests from retained lot cmtplfopt000311fhrrmu0jpj (which accumulated 98)
  const excessiveTrReqs = await prisma.transportRequest.findMany({
    where: { lotId: 'cmtplfopt000311fhrrmu0jpj' },
    select: { id: true }
  });
  if (excessiveTrReqs.length > 1) {
    const idsToPrune = excessiveTrReqs.slice(1).map(r => r.id);
    const pruned = await prisma.transportRequest.deleteMany({
      where: { id: { in: idsToPrune } }
    });
    console.log(`  Pruned ${pruned.count} excess TransportRequests from KS-ONION-2026-0001.`);
  }

  // Delete offers of deleted lots
  const deletedOffers = await prisma.offer.deleteMany({
    where: { lotId: { in: lotIdsToDelete } }
  });
  console.log(`  Deleted ${deletedOffers.count} Offers for deleted lots.`);

  // Clean excessive offers from retained lot cmtplfopt000311fhrrmu0jpj (which accumulated 309)
  const excessiveOffers = await prisma.offer.findMany({
    where: { lotId: 'cmtplfopt000311fhrrmu0jpj' },
    select: { id: true }
  });
  if (excessiveOffers.length > 2) {
    const idsToPrune = excessiveOffers.slice(2).map(o => o.id);
    const pruned = await prisma.offer.deleteMany({
      where: { id: { in: idsToPrune } }
    });
    console.log(`  Pruned ${pruned.count} excess Offers from KS-ONION-2026-0001.`);
  }

  // Delete quality assessments and verifications for deleted lots
  const deletedQAs = await prisma.qualityAssessment.deleteMany({
    where: { lotId: { in: lotIdsToDelete } }
  });
  console.log(`  Deleted ${deletedQAs.count} QualityAssessments for deleted lots.`);

  const deletedQVs = await prisma.qualityVerification.deleteMany({
    where: { lotId: { in: lotIdsToDelete } }
  });
  console.log(`  Deleted ${deletedQVs.count} QualityVerifications for deleted lots.`);

  // Now delete the redundant produce lots
  const deletedLotsResult = await prisma.produceLot.deleteMany({
    where: { id: { in: lotIdsToDelete } }
  });
  console.log(`\n*** Successfully deleted ${deletedLotsResult.count} redundant ProduceLot records! ***\n`);

  // 4. Upsert/Update the 13 Retained Lots with pristine data
  console.log('--- Step 2: Configuring 13 pristine representative ProduceLots ---');
  const farmer = await prisma.farmerProfile.findFirst({
    where: { user: { phone: '+919822012345' } }
  });
  if (!farmer) throw new Error('Demo farmer not found!');

  const buyers = await prisma.buyerProfile.findMany({ include: { user: true } });
  const transporters = await prisma.transporterProfile.findMany({ include: { vehicles: true } });
  const inspector = await prisma.qualityInspector.findFirst();

  const abcFoods = buyers.find(b => b.companyName.includes('ABC Foods')) || buyers[0];
  const nashikFresh = buyers.find(b => b.companyName.includes('Nashik Fresh')) || buyers[1];
  const agroExports = buyers.find(b => b.companyName.includes('Agro Exports')) || buyers[2];
  const institutional = buyers.find(b => b.companyName.includes('Institutional')) || buyers[3];

  const sahyadri = transporters.find(t => t.businessName.includes('Sahyadri')) || transporters[0];
  const mahakisan = transporters.find(t => t.businessName.includes('MahaKisan')) || transporters[1];
  const godavari = transporters.find(t => t.businessName.includes('Godavari')) || transporters[2];

  for (const cfg of retainedLotConfigs) {
    const existing = await prisma.produceLot.findUnique({ where: { id: cfg.id } });
    if (existing) {
      await prisma.produceLot.update({
        where: { id: cfg.id },
        data: {
          lotCode: cfg.lotCode,
          farmerId: farmer.id,
          commodity: cfg.commodity,
          variety: cfg.variety,
          quantity: cfg.quantity,
          unit: cfg.unit,
          quantityQuintals: cfg.quantityQuintals,
          expectedPrice: cfg.expectedPrice,
          expectedPricePerQuintal: cfg.expectedPricePerQuintal,
          expectedGrade: cfg.expectedGrade,
          locationDistrict: cfg.locationDistrict,
          locationTaluka: cfg.locationTaluka,
          locationVillage: cfg.locationVillage,
          location: cfg.location,
          description: cfg.description,
          status: cfg.status,
          harvestDate: cfg.harvestDate,
          readyForPickupDate: cfg.readyForPickupDate,
        }
      });
      console.log(`  Updated lot ${cfg.lotCode} (${cfg.scenario})`);
    } else {
      await prisma.produceLot.create({
        data: {
          id: cfg.id,
          lotCode: cfg.lotCode,
          farmerId: farmer.id,
          commodity: cfg.commodity,
          variety: cfg.variety,
          quantity: cfg.quantity,
          unit: cfg.unit,
          quantityQuintals: cfg.quantityQuintals,
          expectedPrice: cfg.expectedPrice,
          expectedPricePerQuintal: cfg.expectedPricePerQuintal,
          expectedGrade: cfg.expectedGrade,
          locationDistrict: cfg.locationDistrict,
          locationTaluka: cfg.locationTaluka,
          locationVillage: cfg.locationVillage,
          location: cfg.location,
          description: cfg.description,
          status: cfg.status,
          harvestDate: cfg.harvestDate,
          readyForPickupDate: cfg.readyForPickupDate,
        }
      });
      console.log(`  Created lot ${cfg.lotCode} (${cfg.scenario})`);
    }
  }

  // 5. Connect Transactions and Demands for the scenarios
  console.log('\n--- Step 3: Establishing Relations for Retained Lots ---');

  // Scenario 1: KS-ONION-2026-0001 (Available) -> 2 active offers
  await prisma.offer.upsert({
    where: { id: 'offer-demo-onion-abc' },
    update: {
      lotId: 'cmtplfopt000311fhrrmu0jpj',
      buyerId: abcFoods.id,
      offeredPricePerQtl: 2420,
      quantityQuintals: 80,
      status: 'PENDING',
      proposedPickupDate: new Date('2026-03-25'),
      validUntil: new Date('2026-04-05'),
      notes: 'Direct APMC procurement offer from ABC Foods.'
    },
    create: {
      id: 'offer-demo-onion-abc',
      lotId: 'cmtplfopt000311fhrrmu0jpj',
      buyerId: abcFoods.id,
      offeredPricePerQtl: 2420,
      quantityQuintals: 80,
      status: 'PENDING',
      proposedPickupDate: new Date('2026-03-25'),
      validUntil: new Date('2026-04-05'),
      notes: 'Direct APMC procurement offer from ABC Foods.'
    }
  });

  await prisma.offer.upsert({
    where: { id: 'offer-demo-onion-nashik' },
    update: {
      lotId: 'cmtplfopt000311fhrrmu0jpj',
      buyerId: nashikFresh.id,
      offeredPricePerQtl: 2380,
      quantityQuintals: 80,
      status: 'PENDING',
      proposedPickupDate: new Date('2026-03-26'),
      validUntil: new Date('2026-04-05'),
      notes: 'Processing grade bulk offer from Nashik Fresh.'
    },
    create: {
      id: 'offer-demo-onion-nashik',
      lotId: 'cmtplfopt000311fhrrmu0jpj',
      buyerId: nashikFresh.id,
      offeredPricePerQtl: 2380,
      quantityQuintals: 80,
      status: 'PENDING',
      proposedPickupDate: new Date('2026-03-26'),
      validUntil: new Date('2026-04-05'),
      notes: 'Processing grade bulk offer from Nashik Fresh.'
    }
  });

  // Scenario 3: KS-TOMATO-2026-0001 (Sold - Handover Pending) -> Transaction
  await prisma.transaction.upsert({
    where: { transactionCode: 'TXN-2026-TOM-0101' },
    update: {
      lotId: 'cmtrhmocm000381h1f8s2whoh',
      farmerId: farmer.id,
      buyerId: abcFoods.id,
      agreedPricePerQuintal: 1850,
      quantityQuintals: 60,
      grossSaleValue: 111000,
      transportCost: 0,
      storageCost: 0,
      otherCosts: 900,
      netRealisation: 110100,
      status: 'OFFER_ACCEPTED'
    },
    create: {
      transactionCode: 'TXN-2026-TOM-0101',
      lotId: 'cmtrhmocm000381h1f8s2whoh',
      farmerId: farmer.id,
      buyerId: abcFoods.id,
      agreedPricePerQuintal: 1850,
      quantityQuintals: 60,
      grossSaleValue: 111000,
      transportCost: 0,
      storageCost: 0,
      otherCosts: 900,
      netRealisation: 110100,
      status: 'OFFER_ACCEPTED'
    }
  });

  // Scenario 4: KS-SOYBEAN-2026-0001 (Sold with transport selected) -> TransportRequest & Transaction
  await prisma.transportRequest.upsert({
    where: { id: 'tr-demo-soy-0102' },
    update: {
      lotId: 'cmtplfopy000511fh69rtywpk',
      transporterId: sahyadri.id,
      vehicleId: sahyadri.vehicles[0]?.id,
      pickupLocation: 'Ausa Farm Gate, Latur',
      dropLocation: 'Pune Market Yard',
      distanceKm: 280,
      quantityQuintals: 90,
      estimatedTrips: 2,
      ratePerKm: 28,
      estimatedCost: 7840,
      status: 'ACCEPTED',
      scheduledPickup: new Date('2026-03-24')
    },
    create: {
      id: 'tr-demo-soy-0102',
      lotId: 'cmtplfopy000511fh69rtywpk',
      transporterId: sahyadri.id,
      vehicleId: sahyadri.vehicles[0]?.id,
      pickupLocation: 'Ausa Farm Gate, Latur',
      dropLocation: 'Pune Market Yard',
      distanceKm: 280,
      quantityQuintals: 90,
      estimatedTrips: 2,
      ratePerKm: 28,
      estimatedCost: 7840,
      status: 'ACCEPTED',
      scheduledPickup: new Date('2026-03-24')
    }
  });

  await prisma.transaction.upsert({
    where: { transactionCode: 'TXN-2026-SOY-0102' },
    update: {
      lotId: 'cmtplfopy000511fh69rtywpk',
      farmerId: farmer.id,
      buyerId: nashikFresh.id,
      transporterId: sahyadri.id,
      agreedPricePerQuintal: 4600,
      quantityQuintals: 90,
      grossSaleValue: 414000,
      transportCost: 7840,
      storageCost: 0,
      otherCosts: 1350,
      netRealisation: 404810,
      status: 'TRANSPORT_ACCEPTED'
    },
    create: {
      transactionCode: 'TXN-2026-SOY-0102',
      lotId: 'cmtplfopy000511fh69rtywpk',
      farmerId: farmer.id,
      buyerId: nashikFresh.id,
      transporterId: sahyadri.id,
      agreedPricePerQuintal: 4600,
      quantityQuintals: 90,
      grossSaleValue: 414000,
      transportCost: 7840,
      storageCost: 0,
      otherCosts: 1350,
      netRealisation: 404810,
      status: 'TRANSPORT_ACCEPTED'
    }
  });

  // Scenario 5: KS-ONION-2026-0002 -> In-Transit Transaction TXN-2026-P8-3687 (Preserved)
  await prisma.transaction.update({
    where: { id: 'cmtpuvylf0003m0yf0gxrt25r' },
    data: {
      lotId: 'cmtpud3pb0001og9ekq4bf6wf', // link to KS-ONION-2026-0002
      farmerId: farmer.id,
      buyerId: abcFoods.id,
      transporterId: sahyadri.id,
      agreedPricePerQuintal: 2420,
      quantityQuintals: 150,
      grossSaleValue: 363000,
      transportCost: 2400,
      storageCost: 0,
      otherCosts: 2250,
      netRealisation: 358350,
      status: 'IN_TRANSIT'
    }
  });

  await prisma.transportRequest.upsert({
    where: { id: 'tr-demo-in-transit-p8' },
    update: {
      lotId: 'cmtpud3pb0001og9ekq4bf6wf',
      transporterId: sahyadri.id,
      vehicleId: sahyadri.vehicles[0]?.id,
      pickupLocation: 'Niphad Farm Gate, Nashik',
      dropLocation: 'Pune APMC Market Yard',
      distanceKm: 195,
      quantityQuintals: 150,
      estimatedTrips: 2,
      ratePerKm: 28,
      estimatedCost: 2400,
      status: 'IN_TRANSIT',
      scheduledPickup: new Date()
    },
    create: {
      id: 'tr-demo-in-transit-p8',
      lotId: 'cmtpud3pb0001og9ekq4bf6wf',
      transporterId: sahyadri.id,
      vehicleId: sahyadri.vehicles[0]?.id,
      pickupLocation: 'Niphad Farm Gate, Nashik',
      dropLocation: 'Pune APMC Market Yard',
      distanceKm: 195,
      quantityQuintals: 150,
      estimatedTrips: 2,
      ratePerKm: 28,
      estimatedCost: 2400,
      status: 'IN_TRANSIT',
      scheduledPickup: new Date()
    }
  });

  // Scenario 6: KS-COTTON-2026-0001 -> Handed Over with QualityVerification
  if (inspector) {
    await prisma.qualityVerification.upsert({
      where: { certificateNumber: 'MSAMB-CERT-2026-YVT-0812' },
      update: {
        lotId: 'cmtplgtgm0001n9paoe8i0r3t',
        inspectorId: inspector.id,
        officialGrade: 'Grade A',
        moisturePercentage: 7.8,
        foreignMatterPerc: 1.2,
        status: 'PHYSICALLY_VERIFIED',
        inspectionLocation: 'APMC Yard, Yavatmal',
        inspectionNotes: 'Premium long staple 31mm verified by MSAMB assayer.'
      },
      create: {
        certificateNumber: 'MSAMB-CERT-2026-YVT-0812',
        lotId: 'cmtplgtgm0001n9paoe8i0r3t',
        inspectorId: inspector.id,
        officialGrade: 'Grade A',
        moisturePercentage: 7.8,
        foreignMatterPerc: 1.2,
        status: 'PHYSICALLY_VERIFIED',
        inspectionLocation: 'APMC Yard, Yavatmal',
        inspectionNotes: 'Premium long staple 31mm verified by MSAMB assayer.'
      }
    });
  }

  await prisma.transaction.upsert({
    where: { transactionCode: 'TXN-2026-COT-0103' },
    update: {
      lotId: 'cmtplgtgm0001n9paoe8i0r3t',
      farmerId: farmer.id,
      buyerId: agroExports.id,
      agreedPricePerQuintal: 7200,
      quantityQuintals: 40,
      grossSaleValue: 288000,
      transportCost: 3200,
      storageCost: 0,
      otherCosts: 600,
      netRealisation: 284200,
      status: 'DELIVERED'
    },
    create: {
      transactionCode: 'TXN-2026-COT-0103',
      lotId: 'cmtplgtgm0001n9paoe8i0r3t',
      farmerId: farmer.id,
      buyerId: agroExports.id,
      agreedPricePerQuintal: 7200,
      quantityQuintals: 40,
      grossSaleValue: 288000,
      transportCost: 3200,
      storageCost: 0,
      otherCosts: 600,
      netRealisation: 284200,
      status: 'DELIVERED'
    }
  });

  // Scenario 7: KS-GRAPES-2026-0001 -> Handed Over with cold chain
  await prisma.transaction.upsert({
    where: { transactionCode: 'TXN-2026-GRP-0104' },
    update: {
      lotId: 'cmtsa37w40003y2s6cyirdu9i',
      farmerId: farmer.id,
      buyerId: institutional.id,
      transporterId: godavari.id,
      agreedPricePerQuintal: 5400,
      quantityQuintals: 45,
      grossSaleValue: 243000,
      transportCost: 4500,
      storageCost: 0,
      otherCosts: 900,
      netRealisation: 237600,
      status: 'DELIVERED'
    },
    create: {
      transactionCode: 'TXN-2026-GRP-0104',
      lotId: 'cmtsa37w40003y2s6cyirdu9i',
      farmerId: farmer.id,
      buyerId: institutional.id,
      transporterId: godavari.id,
      agreedPricePerQuintal: 5400,
      quantityQuintals: 45,
      grossSaleValue: 243000,
      transportCost: 4500,
      storageCost: 0,
      otherCosts: 900,
      netRealisation: 237600,
      status: 'DELIVERED'
    }
  });

  // Scenario 8: KS-RICE-2026-0001 -> Payment Processing
  const riceTxn = await prisma.transaction.upsert({
    where: { transactionCode: 'TXN-2026-RIC-0105' },
    update: {
      lotId: 'cmtrhhf4m000181h1rijv74sy',
      farmerId: farmer.id,
      buyerId: abcFoods.id,
      agreedPricePerQuintal: 3800,
      quantityQuintals: 75,
      grossSaleValue: 285000,
      transportCost: 1500,
      storageCost: 0,
      otherCosts: 1125,
      netRealisation: 282375,
      status: 'DELIVERED'
    },
    create: {
      transactionCode: 'TXN-2026-RIC-0105',
      lotId: 'cmtrhhf4m000181h1rijv74sy',
      farmerId: farmer.id,
      buyerId: abcFoods.id,
      agreedPricePerQuintal: 3800,
      quantityQuintals: 75,
      grossSaleValue: 285000,
      transportCost: 1500,
      storageCost: 0,
      otherCosts: 1125,
      netRealisation: 282375,
      status: 'DELIVERED'
    }
  });

  await prisma.payment.upsert({
    where: { id: 'pay-demo-rice-001' },
    update: {
      transactionId: riceTxn.id,
      amount: 285000,
      paymentMethod: 'ESCROW_RELEASE',
      paymentStatus: 'INITIATED',
      escrowReference: 'ESCROW-RIC-2026-9812'
    },
    create: {
      id: 'pay-demo-rice-001',
      transactionId: riceTxn.id,
      amount: 285000,
      paymentMethod: 'ESCROW_RELEASE',
      paymentStatus: 'INITIATED',
      escrowReference: 'ESCROW-RIC-2026-9812'
    }
  });

  // Scenario 9: KS-MAIZE-2026-0001 -> Payment Processing
  const maizeTxn = await prisma.transaction.upsert({
    where: { transactionCode: 'TXN-2026-MAI-0106' },
    update: {
      lotId: 'cmtsa2ttn0001y2s6dfdhjpye',
      farmerId: farmer.id,
      buyerId: nashikFresh.id,
      agreedPricePerQuintal: 2100,
      quantityQuintals: 100,
      grossSaleValue: 210000,
      transportCost: 1800,
      storageCost: 0,
      otherCosts: 1500,
      netRealisation: 206700,
      status: 'DELIVERED'
    },
    create: {
      transactionCode: 'TXN-2026-MAI-0106',
      lotId: 'cmtsa2ttn0001y2s6dfdhjpye',
      farmerId: farmer.id,
      buyerId: nashikFresh.id,
      agreedPricePerQuintal: 2100,
      quantityQuintals: 100,
      grossSaleValue: 210000,
      transportCost: 1800,
      storageCost: 0,
      otherCosts: 1500,
      netRealisation: 206700,
      status: 'DELIVERED'
    }
  });

  await prisma.payment.upsert({
    where: { id: 'pay-demo-maize-002' },
    update: {
      transactionId: maizeTxn.id,
      amount: 210000,
      paymentMethod: 'BANK_TRANSFER',
      paymentStatus: 'INITIATED',
      escrowReference: 'ESCROW-MAI-2026-4431'
    },
    create: {
      id: 'pay-demo-maize-002',
      transactionId: maizeTxn.id,
      amount: 210000,
      paymentMethod: 'BANK_TRANSFER',
      paymentStatus: 'INITIATED',
      escrowReference: 'ESCROW-MAI-2026-4431'
    }
  });

  // Scenario 10: KS-POTATO-2026-0001 -> Completed Transaction
  const potTxn = await prisma.transaction.upsert({
    where: { transactionCode: 'TXN-2026-POT-0107' },
    update: {
      lotId: 'cmub44xcu0009ia2a9n60uig6',
      farmerId: farmer.id,
      buyerId: abcFoods.id,
      agreedPricePerQuintal: 1650,
      quantityQuintals: 110,
      grossSaleValue: 181500,
      transportCost: 1800,
      storageCost: 0,
      otherCosts: 1500,
      netRealisation: 178200,
      status: 'COMPLETED'
    },
    create: {
      transactionCode: 'TXN-2026-POT-0107',
      lotId: 'cmub44xcu0009ia2a9n60uig6',
      farmerId: farmer.id,
      buyerId: abcFoods.id,
      agreedPricePerQuintal: 1650,
      quantityQuintals: 110,
      grossSaleValue: 181500,
      transportCost: 1800,
      storageCost: 0,
      otherCosts: 1500,
      netRealisation: 178200,
      status: 'COMPLETED'
    }
  });

  await prisma.payment.upsert({
    where: { id: 'pay-demo-pot-003' },
    update: {
      transactionId: potTxn.id,
      amount: 181500,
      paymentMethod: 'NEFT_RTGS',
      paymentStatus: 'PAID',
      payoutDate: new Date('2026-03-01'),
      escrowReference: 'ESCROW-POT-2026-7812'
    },
    create: {
      id: 'pay-demo-pot-003',
      transactionId: potTxn.id,
      amount: 181500,
      paymentMethod: 'NEFT_RTGS',
      paymentStatus: 'PAID',
      payoutDate: new Date('2026-03-01'),
      escrowReference: 'ESCROW-POT-2026-7812'
    }
  });

  // Scenario 11: KS-ONION-2026-HIST-01 -> Completed Transaction
  const histTxn = await prisma.transaction.upsert({
    where: { transactionCode: 'TXN-2026-NIPHAD-0891' },
    update: {
      lotId: 'cmttj64oq00017yd5pnkt7aiz',
      farmerId: farmer.id,
      buyerId: nashikFresh.id,
      transporterId: sahyadri.id,
      agreedPricePerQuintal: 2350,
      quantityQuintals: 100,
      grossSaleValue: 235000,
      transportCost: 1700,
      storageCost: 0,
      otherCosts: 1500,
      netRealisation: 231800,
      status: 'COMPLETED'
    },
    create: {
      transactionCode: 'TXN-2026-NIPHAD-0891',
      lotId: 'cmttj64oq00017yd5pnkt7aiz',
      farmerId: farmer.id,
      buyerId: nashikFresh.id,
      transporterId: sahyadri.id,
      agreedPricePerQuintal: 2350,
      quantityQuintals: 100,
      grossSaleValue: 235000,
      transportCost: 1700,
      storageCost: 0,
      otherCosts: 1500,
      netRealisation: 231800,
      status: 'COMPLETED'
    }
  });

  await prisma.payment.upsert({
    where: { id: 'pay-demo-hist-004' },
    update: {
      transactionId: histTxn.id,
      amount: 235000,
      paymentMethod: 'NEFT_RTGS',
      paymentStatus: 'PAID',
      payoutDate: new Date('2026-03-12'),
      escrowReference: 'ESCROW-ONION-2026-1189'
    },
    create: {
      id: 'pay-demo-hist-004',
      transactionId: histTxn.id,
      amount: 235000,
      paymentMethod: 'NEFT_RTGS',
      paymentStatus: 'PAID',
      payoutDate: new Date('2026-03-12'),
      escrowReference: 'ESCROW-ONION-2026-1189'
    }
  });

  // Step 4: Ensure rich buyer demands across commodities
  console.log('\n--- Step 4: Ensuring Active Buyer Demands across Commodities ---');
  const demandConfigs = [
    {
      id: 'dem-onion-abc',
      buyerId: abcFoods.id,
      commodity: 'Onion',
      variety: 'Nashik Red',
      requiredQuantityQtl: 100,
      targetPricePerQtl: 2400,
      minPricePerQtl: 2300,
      maxPricePerQtl: 2500,
      destinationDistrict: 'Pune',
      deliveryLocation: 'Pune Processing Hub',
      deliveryDeadline: new Date('2026-04-15'),
      status: 'ACTIVE'
    },
    {
      id: 'dem-wheat-agro',
      buyerId: agroExports.id,
      commodity: 'Wheat',
      variety: 'Lokwan',
      requiredQuantityQtl: 200,
      targetPricePerQtl: 2300,
      minPricePerQtl: 2200,
      maxPricePerQtl: 2350,
      destinationDistrict: 'Mumbai',
      deliveryLocation: 'Vashi Export Terminal',
      deliveryDeadline: new Date('2026-04-20'),
      status: 'ACTIVE'
    },
    {
      id: 'dem-soy-nashik',
      buyerId: nashikFresh.id,
      commodity: 'Soybean',
      variety: 'JS-335',
      requiredQuantityQtl: 150,
      targetPricePerQtl: 4650,
      minPricePerQtl: 4500,
      maxPricePerQtl: 4750,
      destinationDistrict: 'Nashik',
      deliveryLocation: 'Ozar Food Park',
      deliveryDeadline: new Date('2026-04-10'),
      status: 'ACTIVE'
    },
    {
      id: 'dem-tomato-abc',
      buyerId: abcFoods.id,
      commodity: 'Tomato',
      variety: 'Abhinav',
      requiredQuantityQtl: 80,
      targetPricePerQtl: 1900,
      minPricePerQtl: 1800,
      maxPricePerQtl: 2000,
      destinationDistrict: 'Pune',
      deliveryLocation: 'Hadapsar Facility',
      deliveryDeadline: new Date('2026-04-05'),
      status: 'ACTIVE'
    }
  ];

  for (const d of demandConfigs) {
    await prisma.buyerDemand.upsert({
      where: { id: d.id },
      update: {
        buyerId: d.buyerId,
        commodity: d.commodity,
        variety: d.variety,
        requiredQuantityQtl: d.requiredQuantityQtl,
        targetPricePerQtl: d.targetPricePerQtl,
        minPricePerQtl: d.minPricePerQtl,
        maxPricePerQtl: d.maxPricePerQtl,
        destinationDistrict: d.destinationDistrict,
        deliveryLocation: d.deliveryLocation,
        deliveryDeadline: d.deliveryDeadline,
        status: d.status
      },
      create: d
    });
  }
  console.log(`  Configured ${demandConfigs.length} active multi-commodity Buyer Demands.`);

  // 6. Final verification of counts
  console.log('\n====================================================');
  console.log('  FINAL DATABASE CURATION AUDIT SUMMARY');
  console.log('====================================================');
  const finalLots = await prisma.produceLot.findMany({
    select: { id: true, lotCode: true, commodity: true, status: true, quantityQuintals: true }
  });
  const finalTxns = await prisma.transaction.findMany({
    select: { id: true, transactionCode: true, status: true, lot: { select: { commodity: true } } }
  });
  const finalDemands = await prisma.buyerDemand.findMany({ select: { id: true, commodity: true } });
  const finalOffers = await prisma.offer.findMany({ select: { id: true, lot: { select: { lotCode: true } } } });

  console.log(`\nProduceLots Count: ${finalLots.length} (Expected: 13)`);
  console.log(`Transactions Count: ${finalTxns.length}`);
  console.log(`Buyer Demands Count: ${finalDemands.length}`);
  console.log(`Offers Count: ${finalOffers.length}`);

  console.log('\nCurated Lots Breakdown:');
  finalLots.forEach((l, idx) => {
    console.log(`  [${idx + 1}] ${l.lotCode.padEnd(24)} | ${l.commodity.padEnd(10)} | ${String(l.quantityQuintals).padStart(3)} Qtl | Status: ${l.status}`);
  });

  console.log('\nCurated Transactions Breakdown:');
  finalTxns.forEach((t, idx) => {
    console.log(`  [${idx + 1}] ${t.transactionCode.padEnd(24)} | ${t.status.padEnd(20)} | Crop: ${t.lot?.commodity || 'N/A'}`);
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Curation Error:', err);
  process.exit(1);
});
