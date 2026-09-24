import { db } from './db';

/**
 * DEVELOPMENT ONLY - Demo Farmer Identity Mechanism
 * 
 * IMPORTANT ARCHITECTURAL NOTE:
 * This mechanism provides a consistent demo identity for testing the Produce Lot
 * workflow in Phase 2 without requiring a full production authentication/OTP system.
 * 
 * Do NOT use in production.
 * This is cleanly isolated so Phase 3 can replace `getCurrentUser()` with NextAuth/JWT
 * without modifying the ProduceLot data models or business logic.
 */

export const DEMO_FARMER_CONFIG = {
  phone: '+919822012345',
  email: 'ramesh.patil@demo.kisansetu.in',
  fullName: 'Ramesh Patil (रमेश पाटील)',
  role: 'FARMER',
  preferredLanguage: 'mr',
  district: 'Nashik',
  taluka: 'Niphad',
  village: 'Pimpalgaon Baswant',
  state: 'Maharashtra',
  landAreaAcres: 4.5,
  preferredCrops: 'Onion,Tomato,Grapes',
};

export async function getDemoFarmer() {
  try {
    // Check if demo user already exists
    let user = await db.user.findUnique({
      where: { phone: DEMO_FARMER_CONFIG.phone },
      include: { farmerProfile: true },
    });

    if (!user) {
      // Create user with attached farmer profile
      user = await db.user.create({
        data: {
          phone: DEMO_FARMER_CONFIG.phone,
          email: DEMO_FARMER_CONFIG.email,
          fullName: DEMO_FARMER_CONFIG.fullName,
          role: DEMO_FARMER_CONFIG.role,
          preferredLanguage: DEMO_FARMER_CONFIG.preferredLanguage,
          farmerProfile: {
            create: {
              state: DEMO_FARMER_CONFIG.state,
              district: DEMO_FARMER_CONFIG.district,
              taluka: DEMO_FARMER_CONFIG.taluka,
              village: DEMO_FARMER_CONFIG.village,
              landAreaAcres: DEMO_FARMER_CONFIG.landAreaAcres,
              preferredCrops: DEMO_FARMER_CONFIG.preferredCrops,
              isFpoMember: false,
            },
          },
        },
        include: { farmerProfile: true },
      });
    } else if (!user.farmerProfile) {
      // User exists but farmer profile missing
      const profile = await db.farmerProfile.create({
        data: {
          userId: user.id,
          state: DEMO_FARMER_CONFIG.state,
          district: DEMO_FARMER_CONFIG.district,
          taluka: DEMO_FARMER_CONFIG.taluka,
          village: DEMO_FARMER_CONFIG.village,
          landAreaAcres: DEMO_FARMER_CONFIG.landAreaAcres,
          preferredCrops: DEMO_FARMER_CONFIG.preferredCrops,
          isFpoMember: false,
        },
      });
      user = { ...user, farmerProfile: profile };
    }

    return {
      user,
      farmerProfile: user.farmerProfile!,
      isDemo: true,
    };
  } catch (error) {
    console.error('Error provisioning demo farmer:', error);
    throw new Error('Failed to resolve demo farmer identity');
  }
}

export const DEMO_INSPECTOR_CONFIG = {
  phone: '+919822998877',
  email: 'vilas.shinde@msamb.gov.in',
  fullName: 'Dr. Vilas Shinde (डॉ. विलास शिंदे)',
  role: 'QUALITY_INSPECTOR',
  agencyName: 'MSAMB Quality Assurance Cell',
  licenseNumber: 'MSAMB-QI-MH-2026-089',
  assignedDistricts: 'Nashik, Pune, Ahmednagar, Dhule',
};

export async function getDemoInspector() {
  try {
    let user = await db.user.findUnique({
      where: { phone: DEMO_INSPECTOR_CONFIG.phone },
      include: { inspectorProfile: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          phone: DEMO_INSPECTOR_CONFIG.phone,
          email: DEMO_INSPECTOR_CONFIG.email,
          fullName: DEMO_INSPECTOR_CONFIG.fullName,
          role: DEMO_INSPECTOR_CONFIG.role,
          preferredLanguage: 'mr',
          inspectorProfile: {
            create: {
              agencyName: DEMO_INSPECTOR_CONFIG.agencyName,
              licenseNumber: DEMO_INSPECTOR_CONFIG.licenseNumber,
              assignedDistricts: DEMO_INSPECTOR_CONFIG.assignedDistricts,
              isActive: true,
            },
          },
        },
        include: { inspectorProfile: true },
      });
    } else if (!user.inspectorProfile) {
      const profile = await db.qualityInspector.create({
        data: {
          userId: user.id,
          agencyName: DEMO_INSPECTOR_CONFIG.agencyName,
          licenseNumber: DEMO_INSPECTOR_CONFIG.licenseNumber,
          assignedDistricts: DEMO_INSPECTOR_CONFIG.assignedDistricts,
          isActive: true,
        },
      });
      user = { ...user, inspectorProfile: profile };
    }

    return {
      user,
      inspectorProfile: user.inspectorProfile!,
      isDemo: true,
    };
  } catch (error) {
    console.error('Error provisioning demo inspector:', error);
    throw new Error('Failed to resolve demo inspector identity');
  }
}

/**
 * -------------------------------------------------------------------
 * DEMO BUYERS CONFIGURATION & PROVISIONING (MAHARASHTRA PROTOTYPES)
 * -------------------------------------------------------------------
 * IMPORTANT: These are prototype demo entities clearly labeled as such.
 * Real businesses must be verified separately before claiming verified status.
 */
export const DEMO_BUYERS_CONFIG = {
  ABC_FOODS: {
    key: 'ABC_FOODS',
    phone: '+919822110001',
    email: 'procurement@abcfoods.demo.kisansetu.in',
    fullName: 'Anand Deshmukh (आनंद देशमुख)',
    companyName: 'ABC Foods Pvt Ltd [Prototype Demo]',
    buyerType: 'FOOD_PROCESSOR',
    gstin: '27AAACA0001A1Z5',
    tradeLicenseNo: 'MH-FDA-PUN-2024-8891',
    registeredState: 'Maharashtra',
    operatingCities: 'Pune, Mumbai, Nashik',
    verified: true,
    reputation: {
      ratingScore: 4.8,
      completedTradesCount: 48,
      paymentPunctualityPercent: 98,
      reliabilityScore: 96,
    },
  },
  NASHIK_FRESH: {
    key: 'NASHIK_FRESH',
    phone: '+919822110002',
    email: 'sourcing@nashikfresh.demo.kisansetu.in',
    fullName: 'Sunil More (सुनील मोरे)',
    companyName: 'Nashik Fresh Processors [Prototype Demo]',
    buyerType: 'WHOLESALER',
    gstin: '27AABCN1234B1Z2',
    tradeLicenseNo: 'MH-APMC-NSK-2025-4122',
    registeredState: 'Maharashtra',
    operatingCities: 'Nashik, Lasalgaon, Dhule',
    verified: true,
    reputation: {
      ratingScore: 4.6,
      completedTradesCount: 34,
      paymentPunctualityPercent: 95,
      reliabilityScore: 92,
    },
  },
  MAHA_EXPORTS: {
    key: 'MAHA_EXPORTS',
    phone: '+919822110003',
    email: 'trade@mahaagroexports.demo.kisansetu.in',
    fullName: 'Rajendra Kadam (राजेन्द्र कदम)',
    companyName: 'Maharashtra Agro Exports Ltd [Prototype Demo]',
    buyerType: 'EXPORTER',
    gstin: '27AAACM9988C1Z9',
    tradeLicenseNo: 'APEDA-EXP-MH-2024-098',
    registeredState: 'Maharashtra',
    operatingCities: 'Navi Mumbai, Vashi, Pune',
    verified: true,
    reputation: {
      ratingScore: 4.9,
      completedTradesCount: 62,
      paymentPunctualityPercent: 99,
      reliabilityScore: 98,
    },
  },
  PUNE_INSTITUTIONAL: {
    key: 'PUNE_INSTITUTIONAL',
    phone: '+919822110004',
    email: 'admin@puneinstifoods.demo.kisansetu.in',
    fullName: 'Pooja Jadhav (पूजा जाधव)',
    companyName: 'Pune Institutional Foods [Prototype Demo]',
    buyerType: 'INSTITUTIONAL',
    gstin: '27AAACP4455D1Z7',
    tradeLicenseNo: 'MH-FMCG-PUN-2025-1109',
    registeredState: 'Maharashtra',
    operatingCities: 'Pune, Pimpri-Chinchwad',
    verified: false, // Explicitly UNVERIFIED prototype for testing
    reputation: {
      ratingScore: 4.2,
      completedTradesCount: 12,
      paymentPunctualityPercent: 91,
      reliabilityScore: 88,
    },
  },
};

export type DemoBuyerKey = keyof typeof DEMO_BUYERS_CONFIG;

export async function getDemoBuyer(key: DemoBuyerKey = 'ABC_FOODS') {
  try {
    const config = DEMO_BUYERS_CONFIG[key] || DEMO_BUYERS_CONFIG.ABC_FOODS;

    let user = await db.user.findUnique({
      where: { phone: config.phone },
      include: { buyerProfile: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          phone: config.phone,
          email: config.email,
          fullName: config.fullName,
          role: 'BUYER',
          preferredLanguage: 'en',
          buyerProfile: {
            create: {
              companyName: config.companyName,
              buyerType: config.buyerType,
              gstin: config.gstin,
              tradeLicenseNo: config.tradeLicenseNo,
              registeredState: config.registeredState,
              operatingCities: config.operatingCities,
              verified: config.verified,
            },
          },
        },
        include: { buyerProfile: true },
      });
    } else if (!user.buyerProfile) {
      const profile = await db.buyerProfile.create({
        data: {
          userId: user.id,
          companyName: config.companyName,
          buyerType: config.buyerType,
          gstin: config.gstin,
          tradeLicenseNo: config.tradeLicenseNo,
          registeredState: config.registeredState,
          operatingCities: config.operatingCities,
          verified: config.verified,
        },
      });
      user = { ...user, buyerProfile: profile };
    }

    return {
      user,
      buyerProfile: user.buyerProfile!,
      reputation: config.reputation,
      isDemo: true,
    };
  } catch (error) {
    console.error('Error provisioning demo buyer:', error);
    throw new Error('Failed to resolve demo buyer identity');
  }
}

/**
 * Seeds all 4 Maharashtra prototype buyers into SQLite database.
 */
export async function seedDemoBuyers() {
  const keys: DemoBuyerKey[] = ['ABC_FOODS', 'NASHIK_FRESH', 'MAHA_EXPORTS', 'PUNE_INSTITUTIONAL'];
  const seeded = [];
  for (const k of keys) {
    const buyer = await getDemoBuyer(k);
    seeded.push(buyer);
  }
  return seeded;
}

export function getBuyerReputation(buyerTypeOrKey: string) {
  for (const config of Object.values(DEMO_BUYERS_CONFIG)) {
    if (config.companyName.includes(buyerTypeOrKey) || config.key === buyerTypeOrKey) {
      return config.reputation;
    }
  }
  // Default prototype reputation
  return {
    ratingScore: 4.5,
    completedTradesCount: 20,
    paymentPunctualityPercent: 95,
    reliabilityScore: 90,
  };
}

/**
 * -------------------------------------------------------------------
 * DEMO TRANSPORTERS CONFIGURATION & PROVISIONING (MAHARASHTRA FLEETS)
 * -------------------------------------------------------------------
 * Independent verification (RTO/commercial transport permits) is maintained
 * strictly separated from commercial reputation (ratings, on-time percentage).
 */
export const DEMO_TRANSPORTERS_CONFIG = {
  SAHYADRI_LOGISTICS: {
    key: 'SAHYADRI_LOGISTICS',
    phone: '+919822330001',
    email: 'dispatch@sahyadrilogistics.demo.kisansetu.in',
    fullName: 'Sanjay Deshmukh (संजय देशमुख)',
    businessName: 'Sahyadri Agri Logistics [Demo]',
    commercialLicenseNo: 'MH-TRANS-NSK-2024-101',
    operationalDistricts: 'Nashik, Pune, Mumbai, Ahmednagar, Dhule',
    verified: true,
    ratingScore: 4.8,
    completedTripsCount: 156,
    onTimeDeliveryPercent: 96.0,
    vehicles: [
      {
        registrationNumber: 'MH-15-EG-4412',
        vehicleName: 'Mahindra Bolero Maxi Truck',
        vehicleType: 'PICKUP_1_TON',
        capacityTonnes: 2.5,
        capacityQuintals: 25.0,
        ratePerKm: 30.0,
        isRefrigerated: false,
        isAvailable: true,
      },
      {
        registrationNumber: 'MH-15-FV-8804',
        vehicleName: 'Tata 407 LPT Light Truck',
        vehicleType: 'LIGHT_TRUCK_3_TON',
        capacityTonnes: 4.0,
        capacityQuintals: 40.0,
        ratePerKm: 38.0,
        isRefrigerated: false,
        isAvailable: true,
      },
      {
        registrationNumber: 'MH-15-GH-1290',
        vehicleName: 'Eicher Pro 1110 Medium Truck',
        vehicleType: 'HEAVY_TRUCK_10_TON',
        capacityTonnes: 8.0,
        capacityQuintals: 80.0,
        ratePerKm: 52.0,
        isRefrigerated: false,
        isAvailable: true,
      },
    ],
  },
  MAHAKISAN_FREIGHT: {
    key: 'MAHAKISAN_FREIGHT',
    phone: '+919822330002',
    email: 'fleet@mahakisanfreight.demo.kisansetu.in',
    fullName: 'Datta Chavan (दत्ता चव्हाण)',
    businessName: 'MahaKisan Freight Carriers [Demo]',
    commercialLicenseNo: 'MH-TRANS-PUN-2023-404',
    operationalDistricts: 'Pune, Satara, Solapur, Ahmednagar, Nashik',
    verified: true,
    ratingScore: 4.7,
    completedTripsCount: 142,
    onTimeDeliveryPercent: 94.0,
    vehicles: [
      {
        registrationNumber: 'MH-12-PQ-9011',
        vehicleName: 'Ashok Leyland Dost+',
        vehicleType: 'PICKUP_1_TON',
        capacityTonnes: 2.0,
        capacityQuintals: 20.0,
        ratePerKm: 28.0,
        isRefrigerated: false,
        isAvailable: true,
      },
      {
        registrationNumber: 'MH-12-RT-6723',
        vehicleName: 'Tata 709 EX Medium Truck',
        vehicleType: 'LIGHT_TRUCK_3_TON',
        capacityTonnes: 5.0,
        capacityQuintals: 50.0,
        ratePerKm: 42.0,
        isRefrigerated: false,
        isAvailable: true,
      },
      {
        registrationNumber: 'MH-12-XY-3401',
        vehicleName: 'BharatBenz 1214 Heavy Cargo Truck',
        vehicleType: 'HEAVY_TRUCK_10_TON',
        capacityTonnes: 10.0,
        capacityQuintals: 100.0,
        ratePerKm: 58.0,
        isRefrigerated: false,
        isAvailable: true,
      },
    ],
  },
  GODAVARI_COLDCHAIN: {
    key: 'GODAVARI_COLDCHAIN',
    phone: '+919822330003',
    email: 'coldchain@godavarilogistics.demo.kisansetu.in',
    fullName: 'Mahesh Wagh (महेश वाघ)',
    businessName: 'Godavari Cold Chain & Express [Demo]',
    commercialLicenseNo: 'MH-TRANS-CSN-2024-770',
    operationalDistricts: 'Chhatrapati Sambhaji Nagar, Jalna, Nashik, Pune, Mumbai',
    verified: true,
    ratingScore: 4.9,
    completedTripsCount: 98,
    onTimeDeliveryPercent: 98.0,
    vehicles: [
      {
        registrationNumber: 'MH-20-AB-5520',
        vehicleName: 'Tata 407 Reefer Van (Cold Chain)',
        vehicleType: 'LIGHT_TRUCK_3_TON',
        capacityTonnes: 3.0,
        capacityQuintals: 30.0,
        ratePerKm: 48.0,
        isRefrigerated: true,
        isAvailable: true,
      },
      {
        registrationNumber: 'MH-20-CC-9908',
        vehicleName: 'Eicher Pro Insulated Cargo Tipper',
        vehicleType: 'HEAVY_TRUCK_10_TON',
        capacityTonnes: 6.0,
        capacityQuintals: 60.0,
        ratePerKm: 45.0,
        isRefrigerated: false,
        isAvailable: true,
      },
    ],
  },
  GRAMIN_VAHAN: {
    key: 'GRAMIN_VAHAN',
    phone: '+919822330004',
    email: 'gramin.vahan@demo.kisansetu.in',
    fullName: 'Pravin Gaikwad (प्रवीण गायकवाड)',
    businessName: 'Gramin Vahan Seva Niphad [Demo]',
    commercialLicenseNo: 'PENDING_VERIFICATION',
    operationalDistricts: 'Nashik, Niphad, Lasalgaon, Sinnar',
    verified: false, // Explicitly UNVERIFIED prototype for testing
    ratingScore: 4.3,
    completedTripsCount: 28,
    onTimeDeliveryPercent: 89.0,
    vehicles: [
      {
        registrationNumber: 'MH-15-KM-2098',
        vehicleName: 'Mahindra Supro Mini Van',
        vehicleType: 'PICKUP_1_TON',
        capacityTonnes: 1.5,
        capacityQuintals: 15.0,
        ratePerKm: 25.0,
        isRefrigerated: false,
        isAvailable: true,
      },
    ],
  },
};

export type DemoTransporterKey = keyof typeof DEMO_TRANSPORTERS_CONFIG;

export async function getDemoTransporter(key: DemoTransporterKey = 'SAHYADRI_LOGISTICS') {
  try {
    const config = DEMO_TRANSPORTERS_CONFIG[key] || DEMO_TRANSPORTERS_CONFIG.SAHYADRI_LOGISTICS;

    let user = await db.user.findUnique({
      where: { phone: config.phone },
      include: {
        transporterProfile: {
          include: { vehicles: true },
        },
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          phone: config.phone,
          email: config.email,
          fullName: config.fullName,
          role: 'TRANSPORTER',
          preferredLanguage: 'mr',
          transporterProfile: {
            create: {
              businessName: config.businessName,
              commercialLicenseNo: config.commercialLicenseNo,
              operationalDistricts: config.operationalDistricts,
              verified: config.verified,
              ratingScore: config.ratingScore,
              completedTripsCount: config.completedTripsCount,
              onTimeDeliveryPercent: config.onTimeDeliveryPercent,
              vehicles: {
                create: config.vehicles.map((v) => ({
                  registrationNumber: v.registrationNumber,
                  vehicleName: v.vehicleName,
                  vehicleType: v.vehicleType,
                  capacityTonnes: v.capacityTonnes,
                  capacityQuintals: v.capacityQuintals,
                  ratePerKm: v.ratePerKm,
                  isRefrigerated: v.isRefrigerated,
                  isAvailable: v.isAvailable,
                })),
              },
            },
          },
        },
        include: {
          transporterProfile: {
            include: { vehicles: true },
          },
        },
      });
    } else if (!user.transporterProfile) {
      const profile = await db.transporterProfile.create({
        data: {
          userId: user.id,
          businessName: config.businessName,
          commercialLicenseNo: config.commercialLicenseNo,
          operationalDistricts: config.operationalDistricts,
          verified: config.verified,
          ratingScore: config.ratingScore,
          completedTripsCount: config.completedTripsCount,
          onTimeDeliveryPercent: config.onTimeDeliveryPercent,
          vehicles: {
            create: config.vehicles.map((v) => ({
              registrationNumber: v.registrationNumber,
              vehicleName: v.vehicleName,
              vehicleType: v.vehicleType,
              capacityTonnes: v.capacityTonnes,
              capacityQuintals: v.capacityQuintals,
              ratePerKm: v.ratePerKm,
              isRefrigerated: v.isRefrigerated,
              isAvailable: v.isAvailable,
            })),
          },
        },
        include: { vehicles: true },
      });
      user = { ...user, transporterProfile: profile };
    } else {
      // Ensure vehicles exist
      for (const v of config.vehicles) {
        const existingVehicle = await db.transporterVehicle.findUnique({
          where: { registrationNumber: v.registrationNumber },
        });
        if (!existingVehicle) {
          await db.transporterVehicle.create({
            data: {
              transporterId: user.transporterProfile.id,
              registrationNumber: v.registrationNumber,
              vehicleName: v.vehicleName,
              vehicleType: v.vehicleType,
              capacityTonnes: v.capacityTonnes,
              capacityQuintals: v.capacityQuintals,
              ratePerKm: v.ratePerKm,
              isRefrigerated: v.isRefrigerated,
              isAvailable: v.isAvailable,
            },
          });
        }
      }
      // Re-fetch profile with vehicles
      const refreshedProfile = await db.transporterProfile.findUnique({
        where: { id: user.transporterProfile.id },
        include: { vehicles: true },
      });
      if (refreshedProfile) {
        user = { ...user, transporterProfile: refreshedProfile };
      }
    }

    return {
      user,
      transporterProfile: user.transporterProfile!,
      vehicles: user.transporterProfile?.vehicles || [],
      isDemo: true,
    };
  } catch (error) {
    console.error('Error provisioning demo transporter:', error);
    throw new Error('Failed to resolve demo transporter identity');
  }
}

/**
 * Seeds all 4 Maharashtra prototype transporters into SQLite database.
 */
export async function seedDemoTransporters() {
  const keys: DemoTransporterKey[] = [
    'SAHYADRI_LOGISTICS',
    'MAHAKISAN_FREIGHT',
    'GODAVARI_COLDCHAIN',
    'GRAMIN_VAHAN',
  ];
  const seeded = [];
  for (const k of keys) {
    const transporter = await getDemoTransporter(k);
    seeded.push(transporter);
  }
  return seeded;
}

/**
 * DEMO STORAGE FACILITIES CONFIGURATION (MAHARASHTRA STATE WAREHOUSING / APMC)
 * Used in Phase 6 Net Realisation to estimate post-harvest storage costs.
 */
export const DEMO_STORAGE_FACILITIES = [
  {
    name: 'MSWC Pimpalgaon Baswant Agri Warehouse [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    district: 'Nashik',
    state: 'Maharashtra',
    totalCapacityTonnes: 5000.0,
    availableCapacityTonnes: 3200.0,
    ratePerQuintalPerMonth: 45.0,
    contactPhone: '+919822440001',
  },
  {
    name: 'Lasalgaon APMC Ventilated Onion Storage [Demo]',
    facilityType: 'VENTILATED_CHAWL',
    district: 'Nashik',
    state: 'Maharashtra',
    totalCapacityTonnes: 3500.0,
    availableCapacityTonnes: 1800.0,
    ratePerQuintalPerMonth: 50.0,
    contactPhone: '+919822440002',
  },
  {
    name: 'MSWC Pune Market Yard Cold Chain Storage [Demo]',
    facilityType: 'COLD_STORAGE',
    district: 'Pune',
    state: 'Maharashtra',
    totalCapacityTonnes: 8000.0,
    availableCapacityTonnes: 4500.0,
    ratePerQuintalPerMonth: 75.0,
    contactPhone: '+919822440003',
  },
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

/**
 * Seeds Maharashtra prototype storage facilities into SQLite database if empty.
 */
export async function seedDemoStorageFacilities() {
  const count = await db.storageFacility.count();
  if (count > 0) return await db.storageFacility.findMany();

  const created = [];
  for (const facility of DEMO_STORAGE_FACILITIES) {
    const item = await db.storageFacility.create({
      data: facility,
    });
    created.push(item);
  }
  return created;
}

/**
 * DEMO ADMIN IDENTITY (MSAMB / Govt of Maharashtra Grievance Officer)
 */
export const DEMO_ADMIN_CONFIG = {
  phone: '+919822990001',
  email: 'admin.msamb@demo.kisansetu.in',
  fullName: 'Sanjay Deshmukh (संजय देशमुख - MSAMB Grievance Officer)',
  role: 'ADMIN',
  preferredLanguage: 'mr',
};

export async function getDemoAdmin() {
  try {
    let user = await db.user.findUnique({
      where: { phone: DEMO_ADMIN_CONFIG.phone },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          phone: DEMO_ADMIN_CONFIG.phone,
          email: DEMO_ADMIN_CONFIG.email,
          fullName: DEMO_ADMIN_CONFIG.fullName,
          role: DEMO_ADMIN_CONFIG.role,
          preferredLanguage: DEMO_ADMIN_CONFIG.preferredLanguage,
        },
      });
    }

    return {
      user,
      isDemo: true,
    };
  } catch (error) {
    console.error('Error provisioning demo admin:', error);
    throw new Error('Failed to resolve demo admin identity');
  }
}

/**
 * Seeds initial prototype demonstration transactions into SQLite database if empty.
 */
export async function seedDemoTransactions() {
  const count = await db.transaction.count();
  if (count > 0) {
    return await db.transaction.findMany({
      include: {
        lot: true,
        farmer: { include: { user: true } },
        buyer: { include: { user: true } },
        transporter: { include: { user: true } },
        payments: true,
        ratings: true,
        disputes: true,
      },
    });
  }

  // Ensure prerequisite demo profiles exist
  const { farmerProfile } = await getDemoFarmer();
  const abcFoods = await getDemoBuyer('ABC_FOODS');
  const sahyadriLogistics = await getDemoTransporter('SAHYADRI_LOGISTICS');

  // Find demo lot
  const lot = await db.produceLot.findFirst({
    where: { farmerId: farmerProfile.id },
  });

  if (!lot) return [];

  // Create demonstration transaction 1: Active in-transit trade
  const txn1 = await db.transaction.create({
    data: {
      transactionCode: 'TXN-2026-0001',
      lotId: lot.id,
      farmerId: farmerProfile.id,
      buyerId: abcFoods.buyerProfile.id,
      transporterId: sahyadriLogistics.transporterProfile.id,
      agreedPricePerQuintal: 2400.0,
      quantityQuintals: 80.0,
      grossSaleValue: 192000.0,
      transportCost: 1200.0,
      storageCost: 0.0,
      otherCosts: 1200.0,
      netRealisation: 189600.0,
      status: 'IN_TRANSIT',
      payments: {
        create: {
          amount: 192000.0,
          paymentMethod: 'ESCROW_GATEWAY',
          paymentStatus: 'INITIATED',
          escrowReference: 'DEMO-PAY-2026-0001',
        },
      },
    },
    include: {
      lot: true,
      farmer: { include: { user: true } },
      buyer: { include: { user: true } },
      transporter: { include: { user: true } },
      payments: true,
      ratings: true,
      disputes: true,
    },
  });

  // Create demonstration transaction 2: Completed trade with payment received and 3-way ratings
  const txn2 = await db.transaction.create({
    data: {
      transactionCode: 'TXN-2026-0002',
      lotId: lot.id,
      farmerId: farmerProfile.id,
      buyerId: abcFoods.buyerProfile.id,
      transporterId: sahyadriLogistics.transporterProfile.id,
      agreedPricePerQuintal: 2380.0,
      quantityQuintals: 50.0,
      grossSaleValue: 119000.0,
      transportCost: 1000.0,
      storageCost: 0.0,
      otherCosts: 750.0,
      netRealisation: 117250.0,
      status: 'COMPLETED',
      payments: {
        create: {
          amount: 119000.0,
          paymentMethod: 'ESCROW_GATEWAY',
          paymentStatus: 'PAID',
          escrowReference: 'DEMO-PAY-2026-0002',
          payoutDate: new Date(),
        },
      },
      ratings: {
        create: [
          {
            raterId: farmerProfile.userId,
            rateeId: abcFoods.user.id,
            rolePair: 'FARMER_TO_BUYER',
            ratingScore: 5,
            feedback: 'Immediate digital payment confirmation upon delivery. Highly professional buyer.',
          },
          {
            raterId: abcFoods.user.id,
            rateeId: farmerProfile.userId,
            rolePair: 'BUYER_TO_FARMER',
            ratingScore: 5,
            feedback: 'High quality Nashik red onions matching agreed Grade A visual specification.',
          },
          {
            raterId: farmerProfile.userId,
            rateeId: sahyadriLogistics.user.id,
            rolePair: 'FARMER_TO_TRANSPORTER',
            ratingScore: 5,
            feedback: 'Punctual farm-gate arrival and careful produce loading.',
          },
        ],
      },
    },
    include: {
      lot: true,
      farmer: { include: { user: true } },
      buyer: { include: { user: true } },
      transporter: { include: { user: true } },
      payments: true,
      ratings: true,
      disputes: true,
    },
  });

  return [txn1, txn2];
}



