const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const facilitiesToSeed = [
  {
    name: 'Sahyadri Agro Cold Chain & Packhouse [Demo]',
    facilityType: 'COLD_STORAGE',
    district: 'Nashik',
    state: 'Maharashtra',
    totalCapacityTonnes: 6000.0,
    availableCapacityTonnes: 2600.0,
    ratePerQuintalPerMonth: 95.0,
    contactPhone: '+919822440004',
  },
  {
    name: 'Niphad Taluka Farmer Co-op Onion Chawl [Demo]',
    facilityType: 'VENTILATED_CHAWL',
    district: 'Nashik',
    state: 'Maharashtra',
    totalCapacityTonnes: 2800.0,
    availableCapacityTonnes: 1400.0,
    ratePerQuintalPerMonth: 48.0,
    contactPhone: '+919822440005',
  },
  {
    name: 'Ahmednagar APMC Scientific Grain Silo [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    totalCapacityTonnes: 10000.0,
    availableCapacityTonnes: 5200.0,
    ratePerQuintalPerMonth: 38.0,
    contactPhone: '+919822440006',
  },
  {
    name: 'Sangamner Agro Processing & Dry Storage [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    totalCapacityTonnes: 4200.0,
    availableCapacityTonnes: 2100.0,
    ratePerQuintalPerMonth: 42.0,
    contactPhone: '+919822440007',
  },
  {
    name: 'Jalgaon District Warehouse & Pulses Terminal [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    district: 'Jalgaon',
    state: 'Maharashtra',
    totalCapacityTonnes: 7500.0,
    availableCapacityTonnes: 3800.0,
    ratePerQuintalPerMonth: 40.0,
    contactPhone: '+919822440008',
  },
  {
    name: 'Baramati Agro Multi-Chamber Cold Storage [Demo]',
    facilityType: 'COLD_STORAGE',
    district: 'Pune',
    state: 'Maharashtra',
    totalCapacityTonnes: 5500.0,
    availableCapacityTonnes: 2900.0,
    ratePerQuintalPerMonth: 90.0,
    contactPhone: '+919822440009',
  },
  {
    name: 'Talegaon Dabhade Controlled Atmosphere Cold Hub [Demo]',
    facilityType: 'COLD_STORAGE',
    district: 'Pune',
    state: 'Maharashtra',
    totalCapacityTonnes: 4800.0,
    availableCapacityTonnes: 1950.0,
    ratePerQuintalPerMonth: 85.0,
    contactPhone: '+919822440010',
  },
  {
    name: 'Sinnar Farmers Scientific Onion Chawl [Demo]',
    facilityType: 'SCIENTIFIC_CHAWL',
    district: 'Nashik',
    state: 'Maharashtra',
    totalCapacityTonnes: 3200.0,
    availableCapacityTonnes: 1650.0,
    ratePerQuintalPerMonth: 52.0,
    contactPhone: '+919822440011',
  },
  {
    name: 'Solapur APMC Scientific Agro Warehouse [Demo]',
    facilityType: 'SCIENTIFIC_CHAWL',
    district: 'Solapur',
    state: 'Maharashtra',
    totalCapacityTonnes: 6200.0,
    availableCapacityTonnes: 3100.0,
    ratePerQuintalPerMonth: 46.0,
    contactPhone: '+919822440012',
  },
  {
    name: 'Satara Multi-Commodity Cold Storage [Demo]',
    facilityType: 'COLD_STORAGE',
    district: 'Satara',
    state: 'Maharashtra',
    totalCapacityTonnes: 3800.0,
    availableCapacityTonnes: 1700.0,
    ratePerQuintalPerMonth: 88.0,
    contactPhone: '+919822440013',
  },
  {
    name: 'Dhule National Highway Agrilogistics Center [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    district: 'Dhule',
    state: 'Maharashtra',
    totalCapacityTonnes: 9000.0,
    availableCapacityTonnes: 4400.0,
    ratePerQuintalPerMonth: 36.0,
    contactPhone: '+919822440014',
  },
  {
    name: 'Kolhapur Regional Agricultural Warehouse [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    district: 'Kolhapur',
    state: 'Maharashtra',
    totalCapacityTonnes: 6500.0,
    availableCapacityTonnes: 3300.0,
    ratePerQuintalPerMonth: 44.0,
    contactPhone: '+919822440015',
  },
];

async function main() {
  const existing = await prisma.storageFacility.findMany();
  const existingNames = new Set(existing.map((e) => e.name));

  let added = 0;
  for (const fac of facilitiesToSeed) {
    if (!existingNames.has(fac.name)) {
      await prisma.storageFacility.create({ data: fac });
      added++;
    }
  }

  const total = await prisma.storageFacility.count();
  const lotCount = await prisma.produceLot.count();
  console.log(`[SEED STORAGE] Added: ${added} facilities. Total in DB: ${total}. ProduceLots count: ${lotCount}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
