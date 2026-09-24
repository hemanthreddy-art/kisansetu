const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectRoles() {
  const users = await prisma.user.findMany({
    include: {
      farmerProfile: true,
      buyerProfile: true,
      transporterProfile: true,
      inspectorProfile: true
    }
  });

  console.log(`=== Total Users (${users.length}) ===`);
  users.forEach(u => {
    console.log(`User: ${u.id} | ${u.name || u.fullName} | Phone: ${u.phone} | Role: ${u.role} | Farmer: ${u.farmerProfile?.id || '-'} | Buyer: ${u.buyerProfile?.id || '-'} | Transporter: ${u.transporterProfile?.id || '-'}`);
  });

  const buyers = await prisma.buyerProfile.findMany({
    include: { user: true, demands: true, offers: true, transactions: true }
  });
  console.log(`\n=== Buyers (${buyers.length}) ===`);
  buyers.forEach(b => {
    console.log(`Buyer: ${b.id} | ${b.companyName} (${b.user.name || b.user.fullName}) | Demands: ${b.demands.length} | Offers: ${b.offers.length} | Tx: ${b.transactions.length}`);
  });

  const transporters = await prisma.transporterProfile.findMany({
    include: { user: true, vehicles: true, transportRequests: true, transactions: true }
  });
  console.log(`\n=== Transporters (${transporters.length}) ===`);
  transporters.forEach(t => {
    console.log(`Transporter: ${t.id} | ${t.businessName} (${t.user.name || t.user.fullName}) | Vehicles: ${t.vehicles.length} | TrReqs: ${t.transportRequests.length} | Tx: ${t.transactions.length}`);
  });

  const inspectors = await prisma.qualityInspector.findMany({
    include: { user: true, physicalInspections: true }
  });
  console.log(`\n=== Quality Inspectors (${inspectors.length}) ===`);
  inspectors.forEach(qi => {
    console.log(`Inspector: ${qi.id} | ${qi.agencyName} (${qi.user.name || qi.user.fullName}) | Inspections: ${qi.physicalInspections.length}`);
  });

  const storages = await prisma.storageFacility.findMany();
  console.log(`\n=== Storage Facilities (${storages.length}) ===`);
  storages.forEach(s => {
    console.log(`Storage: ${s.id} | ${s.name} | ${s.district} | Cap: ${s.availableCapacityTonnes}/${s.totalCapacityTonnes} T`);
  });

  await prisma.$disconnect();
}

inspectRoles().catch(console.error);
