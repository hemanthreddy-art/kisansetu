const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const lots = await prisma.produceLot.findMany({
    include: {
      offers: true,
      transactions: {
        include: {
          payments: true
        }
      },
      transportRequests: true,
      aiAssessments: true,
      physicalVerifications: true,
      farmer: { include: { user: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Total lots: ${lots.length}`);

  const counts = {};
  lots.forEach(l => {
    counts[l.commodity] = (counts[l.commodity] || 0) + 1;
  });
  console.log('\n=== Commodities Breakdown ===', counts);

  console.log('\n=== Non-Repeated Lots (Original Seeds / Unique) ===');
  lots.forEach(l => {
    if (!l.lotCode.match(/-(000[4-9]|00[1-9]\d)$/)) {
      console.log(`  ${l.lotCode} | id: ${l.id} | ${l.commodity} (${l.variety}) | Qty: ${l.quantity} | Status: ${l.status} | Dist: ${l.locationDistrict} | Tx: ${l.transactions.length} | Tr: ${l.transportRequests.length} | QA: ${l.aiAssessments.length} | QV: ${l.physicalVerifications.length} | Offers: ${l.offers.length} | FPO: ${l.fpoId || 'none'}`);
    }
  });

  // Check Farmer Profiles and Users
  const farmers = await prisma.farmerProfile.findMany({
    include: { user: true, produceLots: true }
  });
  console.log(`\n=== Farmers (${farmers.length}) ===`);
  farmers.forEach(f => {
    console.log(`Farmer ${f.id} (${f.user.name}, ${f.user.phone}): ${f.produceLots.length} lots`);
  });

  // Check Buyer Demands
  const demands = await prisma.buyerDemand.findMany({
    include: { buyer: { include: { user: true } } }
  });
  console.log(`\n=== Buyer Demands (${demands.length}) ===`);
  demands.forEach(d => {
    console.log(`Demand ${d.id}: ${d.commodity} (${d.variety}) ${d.requiredQuantityQtl} Qtl, target ₹${d.targetPricePerQtl}, buyer: ${d.buyer.user.name}`);
  });

  await prisma.$disconnect();
}

inspect().catch(console.error);
