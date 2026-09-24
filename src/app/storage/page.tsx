'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import {
  Warehouse,
  ThermometerSnowflake,
  Wind,
  MapPin,
  ShieldCheck,
  Calculator,
  Coins,
  FileText,
  Printer,
  X,
  Info,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  calculateStoreVsSell,
  PriceTrend,
  StoreVsSellResult,
} from '@/lib/storage-calculator';

interface StorageFacility {
  id: string;
  name: string;
  facilityType: string;
  typeLabel: string;
  district: string;
  state: string;
  distanceKm: number;
  totalCapacityTonnes: number;
  availableCapacityTonnes: number;
  availableCapacityQuintals: number;
  ratePerQuintalPerMonth: number;
  dailyRatePerQuintal: number;
  contactPhone: string;
  operator: string;
  suitableCrops: string[];
  tempRange?: string;
  recommendedDuration?: string;
  wdraCertified: boolean;
  enwrEligible: boolean;
  status: string;
}

const DEFAULT_FACILITIES: StorageFacility[] = [
  {
    id: 'fac-1',
    name: 'MSWC Pimpalgaon Baswant Agri Warehouse [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    typeLabel: 'Dry Warehouse',
    district: 'Nashik',
    state: 'Maharashtra',
    distanceKm: 8.4,
    totalCapacityTonnes: 5000,
    availableCapacityTonnes: 3200,
    availableCapacityQuintals: 32000,
    ratePerQuintalPerMonth: 45,
    dailyRatePerQuintal: 1.5,
    contactPhone: '+91 98224 40001',
    operator: 'Maharashtra State Warehousing Corporation (MSWC)',
    suitableCrops: ['Soybean', 'Wheat', 'Maize', 'Paddy / Rice', 'Pulses', 'Gram'],
    tempRange: 'Moisture-Proof Dry Storage (Ambient 18-28°C)',
    recommendedDuration: '3 to 12 Months',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-2',
    name: 'Lasalgaon APMC Ventilated Onion Storage [Demo]',
    facilityType: 'VENTILATED_CHAWL',
    typeLabel: 'Ventilated Onion Chawl',
    district: 'Nashik',
    state: 'Maharashtra',
    distanceKm: 14.2,
    totalCapacityTonnes: 3500,
    availableCapacityTonnes: 1800,
    availableCapacityQuintals: 18000,
    ratePerQuintalPerMonth: 50,
    dailyRatePerQuintal: 1.67,
    contactPhone: '+91 98224 40002',
    operator: 'APMC Co-operative Market Committee',
    suitableCrops: ['Onion', 'Garlic'],
    tempRange: 'Natural Air-Cooled Racks (Ambient)',
    recommendedDuration: '1 to 4 Months',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-3',
    name: 'MSWC Pune Market Yard Cold Chain Storage [Demo]',
    facilityType: 'COLD_STORAGE',
    typeLabel: 'Cold Storage',
    district: 'Pune',
    state: 'Maharashtra',
    distanceKm: 28.5,
    totalCapacityTonnes: 8000,
    availableCapacityTonnes: 4500,
    availableCapacityQuintals: 45000,
    ratePerQuintalPerMonth: 75,
    dailyRatePerQuintal: 2.5,
    contactPhone: '+91 98224 40003',
    operator: 'Maharashtra State Warehousing Corporation (MSWC)',
    suitableCrops: ['Tomato', 'Grapes', 'Potato', 'Pomegranate', 'Vegetables'],
    tempRange: '0°C to 4°C (90-95% RH Multi-Chamber)',
    recommendedDuration: '15 to 90 Days',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-4',
    name: 'Sahyadri Agro Cold Chain & Packhouse [Demo]',
    facilityType: 'COLD_STORAGE',
    typeLabel: 'Cold Storage',
    district: 'Nashik',
    state: 'Maharashtra',
    distanceKm: 11.6,
    totalCapacityTonnes: 6000,
    availableCapacityTonnes: 2600,
    availableCapacityQuintals: 26000,
    ratePerQuintalPerMonth: 95,
    dailyRatePerQuintal: 3.17,
    contactPhone: '+91 98224 40004',
    operator: 'Sahyadri Farmers Producer Co. & MSAMB',
    suitableCrops: ['Grapes', 'Tomato', 'Pomegranate', 'Vegetables'],
    tempRange: '0°C to 2°C Pre-Cooling & Cold Chain',
    recommendedDuration: '15 to 60 Days',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-5',
    name: 'Niphad Taluka Farmer Co-op Onion Chawl [Demo]',
    facilityType: 'VENTILATED_CHAWL',
    typeLabel: 'Ventilated Onion Chawl',
    district: 'Nashik',
    state: 'Maharashtra',
    distanceKm: 16.8,
    totalCapacityTonnes: 2800,
    availableCapacityTonnes: 1400,
    availableCapacityQuintals: 14000,
    ratePerQuintalPerMonth: 48,
    dailyRatePerQuintal: 1.6,
    contactPhone: '+91 98224 40005',
    operator: 'Niphad Taluka Sahakari Kharedi Vikri Sangh',
    suitableCrops: ['Onion', 'Garlic'],
    tempRange: 'Raised Bottom Slotted Aeration Racks',
    recommendedDuration: '1 to 4 Months',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-6',
    name: 'Ahmednagar APMC Scientific Grain Silo [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    typeLabel: 'Dry Warehouse',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    distanceKm: 42.0,
    totalCapacityTonnes: 10000,
    availableCapacityTonnes: 5200,
    availableCapacityQuintals: 52000,
    ratePerQuintalPerMonth: 38,
    dailyRatePerQuintal: 1.27,
    contactPhone: '+91 98224 40006',
    operator: 'Maharashtra State Warehousing Corporation (MSWC)',
    suitableCrops: ['Soybean', 'Wheat', 'Maize', 'Gram', 'Jowar'],
    tempRange: 'Moisture-Controlled Metal Silo & Flat Shed',
    recommendedDuration: '3 to 12 Months',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-7',
    name: 'Sangamner Agro Processing & Dry Storage [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    typeLabel: 'Dry Warehouse',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    distanceKm: 36.5,
    totalCapacityTonnes: 4200,
    availableCapacityTonnes: 2100,
    availableCapacityQuintals: 21000,
    ratePerQuintalPerMonth: 42,
    dailyRatePerQuintal: 1.4,
    contactPhone: '+91 98224 40007',
    operator: 'MSWC Sub-Division',
    suitableCrops: ['Soybean', 'Wheat', 'Gram', 'Pulses'],
    tempRange: 'Ambient Dry Well-Ventilated Sheds',
    recommendedDuration: '3 to 9 Months',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-8',
    name: 'Jalgaon District Warehouse & Pulses Terminal [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    typeLabel: 'Dry Warehouse',
    district: 'Jalgaon',
    state: 'Maharashtra',
    distanceKm: 52.0,
    totalCapacityTonnes: 7500,
    availableCapacityTonnes: 3800,
    availableCapacityQuintals: 38000,
    ratePerQuintalPerMonth: 40,
    dailyRatePerQuintal: 1.33,
    contactPhone: '+91 98224 40008',
    operator: 'Maharashtra State Warehousing Corporation',
    suitableCrops: ['Maize', 'Soybean', 'Pulses', 'Wheat', 'Cottonseed'],
    tempRange: 'Pest-Controlled High-Ceiling Warehouse',
    recommendedDuration: '3 to 12 Months',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-9',
    name: 'Baramati Agro Multi-Chamber Cold Storage [Demo]',
    facilityType: 'COLD_STORAGE',
    typeLabel: 'Cold Storage',
    district: 'Pune',
    state: 'Maharashtra',
    distanceKm: 44.0,
    totalCapacityTonnes: 5500,
    availableCapacityTonnes: 2900,
    availableCapacityQuintals: 29000,
    ratePerQuintalPerMonth: 90,
    dailyRatePerQuintal: 3.0,
    contactPhone: '+91 98224 40009',
    operator: 'Baramati Agro Cold Chain Logistics',
    suitableCrops: ['Grapes', 'Pomegranate', 'Tomato', 'Vegetables'],
    tempRange: 'Multi-Chamber 0°C to 4°C with Ethylene Scrubbing',
    recommendedDuration: '15 to 90 Days',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-10',
    name: 'Talegaon Dabhade Controlled Atmosphere Cold Hub [Demo]',
    facilityType: 'COLD_STORAGE',
    typeLabel: 'Cold Storage',
    district: 'Pune',
    state: 'Maharashtra',
    distanceKm: 31.5,
    totalCapacityTonnes: 4800,
    availableCapacityTonnes: 1950,
    availableCapacityQuintals: 19500,
    ratePerQuintalPerMonth: 85,
    dailyRatePerQuintal: 2.83,
    contactPhone: '+91 98224 40010',
    operator: 'Maharashtra State Warehousing Corporation',
    suitableCrops: ['Potato', 'Tomato', 'Fruits', 'Vegetables'],
    tempRange: 'Controlled Atmosphere (2°C to 4°C, 95% RH)',
    recommendedDuration: '30 to 120 Days',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-11',
    name: 'Sinnar Farmers Scientific Onion Chawl [Demo]',
    facilityType: 'SCIENTIFIC_CHAWL',
    typeLabel: 'Scientific Onion Storage',
    district: 'Nashik',
    state: 'Maharashtra',
    distanceKm: 19.2,
    totalCapacityTonnes: 3200,
    availableCapacityTonnes: 1650,
    availableCapacityQuintals: 16500,
    ratePerQuintalPerMonth: 52,
    dailyRatePerQuintal: 1.73,
    contactPhone: '+91 98224 40011',
    operator: 'Sinnar Agro FPC & MSAMB',
    suitableCrops: ['Onion', 'Garlic'],
    tempRange: 'Forced-Draft Bottom Aeration (22-26°C)',
    recommendedDuration: '2 to 6 Months',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-12',
    name: 'Solapur APMC Scientific Agro Warehouse [Demo]',
    facilityType: 'SCIENTIFIC_CHAWL',
    typeLabel: 'Scientific Onion Storage',
    district: 'Solapur',
    state: 'Maharashtra',
    distanceKm: 58.0,
    totalCapacityTonnes: 6200,
    availableCapacityTonnes: 3100,
    availableCapacityQuintals: 31000,
    ratePerQuintalPerMonth: 46,
    dailyRatePerQuintal: 1.53,
    contactPhone: '+91 98224 40012',
    operator: 'Solapur APMC Co-operative',
    suitableCrops: ['Onion', 'Garlic', 'Pomegranate', 'Pulses'],
    tempRange: 'Scientific Aerated Concrete Silos',
    recommendedDuration: '2 to 6 Months',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-13',
    name: 'Satara Multi-Commodity Cold Storage [Demo]',
    facilityType: 'COLD_STORAGE',
    typeLabel: 'Cold Storage',
    district: 'Satara',
    state: 'Maharashtra',
    distanceKm: 48.0,
    totalCapacityTonnes: 3800,
    availableCapacityTonnes: 1700,
    availableCapacityQuintals: 17000,
    ratePerQuintalPerMonth: 88,
    dailyRatePerQuintal: 2.93,
    contactPhone: '+91 98224 40013',
    operator: 'Satara Agricultural Development Cell',
    suitableCrops: ['Potato', 'Grapes', 'Tomato', 'Vegetables'],
    tempRange: '0°C to 4°C with Humidity Regulation',
    recommendedDuration: '15 to 90 Days',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-14',
    name: 'Dhule National Highway Agrilogistics Center [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    typeLabel: 'Dry Warehouse',
    district: 'Dhule',
    state: 'Maharashtra',
    distanceKm: 64.0,
    totalCapacityTonnes: 9000,
    availableCapacityTonnes: 4400,
    availableCapacityQuintals: 44000,
    ratePerQuintalPerMonth: 36,
    dailyRatePerQuintal: 1.2,
    contactPhone: '+91 98224 40014',
    operator: 'MSWC Logistics Terminal',
    suitableCrops: ['Wheat', 'Maize', 'Soybean', 'Pulses'],
    tempRange: 'Heavy Duty Dry Warehousing Complex',
    recommendedDuration: '3 to 12 Months',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
  {
    id: 'fac-15',
    name: 'Kolhapur Regional Agricultural Warehouse [Demo]',
    facilityType: 'DRY_WAREHOUSE',
    typeLabel: 'Dry Warehouse',
    district: 'Kolhapur',
    state: 'Maharashtra',
    distanceKm: 72.0,
    totalCapacityTonnes: 6500,
    availableCapacityTonnes: 3300,
    availableCapacityQuintals: 33000,
    ratePerQuintalPerMonth: 44,
    dailyRatePerQuintal: 1.47,
    contactPhone: '+91 98224 40015',
    operator: 'Maharashtra State Warehousing Corporation',
    suitableCrops: ['Soybean', 'Paddy / Rice', 'Jaggery', 'Wheat'],
    tempRange: 'Moisture-Insulated Dry Sheds',
    recommendedDuration: '3 to 12 Months',
    wdraCertified: true,
    enwrEligible: true,
    status: 'AVAILABLE',
  },
];

interface GeneratedGatePass {
  passNumber: string;
  facilityName: string;
  district: string;
  farmerName: string;
  crop: string;
  quantityQuintals: number;
  preferredDate: string;
  storageRateMonthly: number;
  bayNumber: string;
  enwrEligible: boolean;
  estimatedPledgeLoanValue: number;
  createdAt: string;
  validUntil: string;
}

export default function StorageDiscoveryPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();

  const [facilities, setFacilities] = useState<StorageFacility[]>(DEFAULT_FACILITIES);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCrop, setFilterCrop] = useState<string>('ALL');
  const [searchDistrict, setSearchDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamic Calculator State
  const [calcCrop, setCalcCrop] = useState<string>('Onion');
  const [calcQty, setCalcQty] = useState<number>(50);
  const [calcSpotPrice, setCalcSpotPrice] = useState<number>(2150);
  const [calcTrend, setCalcTrend] = useState<PriceTrend>('MODERATE');
  const [calcStorageType, setCalcStorageType] = useState<
    'DRY_WAREHOUSE' | 'VENTILATED_CHAWL' | 'COLD_STORAGE' | 'SCIENTIFIC_CHAWL'
  >('VENTILATED_CHAWL');
  const [calcMonthlyRate, setCalcMonthlyRate] = useState<number>(48);

  // Reservation Pass Modal State
  const [selectedFacilityForPass, setSelectedFacilityForPass] = useState<StorageFacility | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);
  const [farmerNameInput, setFarmerNameInput] = useState<string>(user?.fullName || 'Suresh Patil');
  const [depositQtyInput, setDepositQtyInput] = useState<number>(50);
  const [depositCropInput, setDepositCropInput] = useState<string>('Onion');
  const [inwardDateInput, setInwardDateInput] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [requestEnwr, setRequestEnwr] = useState<boolean>(true);
  const [generatedPass, setGeneratedPass] = useState<GeneratedGatePass | null>(null);

  // Auto-sync spot price and storage type when crop changes
  const handleCropChange = (newCrop: string) => {
    setCalcCrop(newCrop);
    if (newCrop === 'Tomato') {
      setCalcSpotPrice(1600);
      setCalcStorageType('COLD_STORAGE');
      setCalcMonthlyRate(95);
    } else if (newCrop === 'Grapes') {
      setCalcSpotPrice(4200);
      setCalcStorageType('COLD_STORAGE');
      setCalcMonthlyRate(105);
    } else if (newCrop === 'Potato') {
      setCalcSpotPrice(1800);
      setCalcStorageType('COLD_STORAGE');
      setCalcMonthlyRate(70);
    } else if (newCrop === 'Onion') {
      setCalcSpotPrice(2150);
      setCalcStorageType('VENTILATED_CHAWL');
      setCalcMonthlyRate(48);
    } else if (newCrop === 'Soybean') {
      setCalcSpotPrice(4600);
      setCalcStorageType('DRY_WAREHOUSE');
      setCalcMonthlyRate(40);
    } else if (newCrop === 'Wheat') {
      setCalcSpotPrice(2450);
      setCalcStorageType('DRY_WAREHOUSE');
      setCalcMonthlyRate(38);
    } else if (newCrop === 'Maize') {
      setCalcSpotPrice(2050);
      setCalcStorageType('DRY_WAREHOUSE');
      setCalcMonthlyRate(36);
    } else {
      setCalcSpotPrice(6200);
      setCalcStorageType('DRY_WAREHOUSE');
      setCalcMonthlyRate(42);
    }
  };

  useEffect(() => {
    async function loadFacilities() {
      try {
        const res = await fetch('/api/storage');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setFacilities(json.data);
          }
        }
      } catch {
        // Fallback to default facilities
      }
    }
    loadFacilities();
  }, []);

  const filteredFacilities = facilities.filter((f) => {
    const matchesType = filterType === 'ALL' || f.facilityType === filterType;
    const matchesDistrict = searchDistrict === 'ALL' || f.district.toLowerCase() === searchDistrict.toLowerCase();
    const matchesCrop =
      filterCrop === 'ALL' ||
      f.suitableCrops.some((c) => c.toLowerCase().includes(filterCrop.toLowerCase()));
    const matchesSearch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.operator.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesDistrict && matchesCrop && matchesSearch;
  });

  // Calculate dynamic store vs sell intelligence
  const calcResult: StoreVsSellResult = calculateStoreVsSell({
    crop: calcCrop,
    quantityQuintals: calcQty,
    currentSpotPricePerQtl: calcSpotPrice,
    trend: calcTrend,
    storageFacilityType: calcStorageType,
    monthlyTariffPerQtl: calcMonthlyRate,
  });

  const handleOpenReserveModal = (facility: StorageFacility) => {
    setSelectedFacilityForPass(facility);
    setCalcMonthlyRate(facility.ratePerQuintalPerMonth);
    setDepositCropInput(calcCrop);
    setGeneratedPass(null);
    setIsPassModalOpen(true);
  };

  const handleGeneratePass = () => {
    if (!selectedFacilityForPass) return;
    const token = Math.floor(100000 + Math.random() * 900000);
    const pass: GeneratedGatePass = {
      passNumber: `MSWC-MH-2026-${token}`,
      facilityName: selectedFacilityForPass.name,
      district: selectedFacilityForPass.district,
      farmerName: farmerNameInput || 'Suresh Patil',
      crop: depositCropInput,
      quantityQuintals: depositQtyInput,
      preferredDate: inwardDateInput,
      storageRateMonthly: selectedFacilityForPass.ratePerQuintalPerMonth,
      bayNumber: `Bay-${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(10 + Math.random() * 89)}`,
      enwrEligible: requestEnwr,
      estimatedPledgeLoanValue: requestEnwr ? Math.round(depositQtyInput * calcSpotPrice * 0.7) : 0,
      createdAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      validUntil: new Date(Date.now() + 172800000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    setGeneratedPass(pass);
  };

  const activeRationale = calcResult.rationale[locale] || calcResult.rationale.en;

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header Banner */}
      <div className="bg-[#1B4332] text-white py-10 border-b border-[#143225]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F] text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
                <Warehouse className="w-3.5 h-3.5" />
                <span>{t.netRealisation.storageBadge || 'Post-Harvest Preservation & Warehousing'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white">
                {t.netRealisation.storageTitle || 'Storage Facility Discovery'}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-emerald-100 max-w-2xl">
                {t.netRealisation.storageSubtitle ||
                  'Discover accredited MSWC dry warehouses, scientific onion chawls, and cold storage facilities. Avoid distress sales and unlock e-NWR pledge loans.'}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-[6px] p-4 flex items-center gap-6">
              <div>
                <div className="text-xs text-emerald-200 uppercase font-medium">Network Capacity</div>
                <div className="text-xl font-bold text-white font-mono">1.25 Lakh MT</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="text-xs text-emerald-200 uppercase font-medium">WDRA Certified</div>
                <div className="text-xl font-bold text-emerald-300 font-mono">100%</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="text-xs text-emerald-200 uppercase font-medium">e-NWR Pledge Loan</div>
                <div className="text-xl font-bold text-amber-300 font-mono">Up to 70%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Prototype Simulation Notice */}
      <div className="bg-[#F4EFE6] border-b border-[#D8D2C4] py-2 px-4 text-xs text-[#635E59]">
        <div className="container mx-auto max-w-7xl flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1B4332] shrink-0" />
          <span>
            {t.netRealisation.storageDemoNotice ||
              'Prototype storage facility discovery modeled on MSWC (Maharashtra State Warehousing Corporation) & APMC cold chain networks under SIH PS 26132.'}
          </span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Cols: Facility Directory */}
          <div className="lg:col-span-7 space-y-6">
            {/* Filter Bar */}
            <div className="bg-white rounded-[6px] border border-[#D8D2C4] p-4 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Facility Type Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'ALL', label: 'All Facilities' },
                    { id: 'DRY_WAREHOUSE', label: t.netRealisation.storageDryWarehouse || 'Dry Warehouse' },
                    { id: 'VENTILATED_CHAWL', label: t.netRealisation.storageVentilatedChawl || 'Onion Chawl' },
                    { id: 'COLD_STORAGE', label: t.netRealisation.storageColdStorage || 'Cold Storage' },
                    { id: 'SCIENTIFIC_CHAWL', label: t.netRealisation.storageScientificChawl || 'Scientific Chawl' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterType(tab.id)}
                      className={`px-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors ${
                        filterType === tab.id
                          ? 'bg-[#1B4332] text-white'
                          : 'bg-[#F4EFE6] text-[#635E59] hover:bg-[#EAE4D9]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-[#635E59]">
                  Showing <strong className="text-[#262320]">{filteredFacilities.length}</strong> facilities
                </div>
              </div>

              {/* Sub-Filters: Crop, District & Text Search */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#ECE7DE] text-xs">
                {/* Filter by Crop */}
                <div>
                  <label className="text-[11px] font-semibold text-[#635E59] block mb-1">
                    {t.netRealisation.filterByCrop || 'Filter by Crop'}:
                  </label>
                  <select
                    value={filterCrop}
                    onChange={(e) => setFilterCrop(e.target.value)}
                    className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-2 py-1 text-xs text-[#262320] font-medium"
                  >
                    <option value="ALL">All Crops</option>
                    <option value="Onion">Onion</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Grapes">Grapes</option>
                    <option value="Potato">Potato</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Maize">Maize</option>
                    <option value="Pulses">Pulses / Gram</option>
                  </select>
                </div>

                {/* Filter by District */}
                <div>
                  <label className="text-[11px] font-semibold text-[#635E59] block mb-1">
                    {t.netRealisation.allDistricts || 'District'}:
                  </label>
                  <select
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    aria-label="Filter storage facilities by district"
                    className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-2 py-1 text-xs text-[#262320] font-medium"
                  >
                    <option value="ALL">All Maharashtra Districts</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Pune">Pune</option>
                    <option value="Ahmednagar">Ahmednagar</option>
                    <option value="Jalgaon">Jalgaon</option>
                    <option value="Solapur">Solapur</option>
                    <option value="Satara">Satara</option>
                    <option value="Dhule">Dhule</option>
                    <option value="Kolhapur">Kolhapur</option>
                  </select>
                </div>

                {/* Search Text */}
                <div>
                  <label className="text-[11px] font-semibold text-[#635E59] block mb-1">Search Facility:</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Name, town, operator..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] pl-7 pr-2 py-1 text-xs text-[#262320]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#635E59] absolute left-2 top-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Facilities Cards List */}
            {filteredFacilities.length === 0 ? (
              <div className="bg-white rounded-[6px] border border-[#D8D2C4] p-8 text-center text-xs text-[#635E59]">
                No storage facilities match your current filters. Try selecting &ldquo;All Facilities&rdquo; or clearing the search.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFacilities.map((fac) => {
                  const isCold = fac.facilityType === 'COLD_STORAGE';
                  const isChawl = fac.facilityType === 'VENTILATED_CHAWL';
                  const isScientific = fac.facilityType === 'SCIENTIFIC_CHAWL';

                  const isSuitableForCalcCrop = fac.suitableCrops.some((c) =>
                    c.toLowerCase().includes(calcCrop.toLowerCase())
                  );

                  const capacityPct = Math.round(
                    (fac.availableCapacityTonnes / fac.totalCapacityTonnes) * 100
                  );

                  return (
                    <div
                      key={fac.id}
                      className={`bg-white rounded-[6px] border p-5 shadow-xs transition-all ${
                        isSuitableForCalcCrop
                          ? 'border-[#52B788] ring-1 ring-[#52B788]/20'
                          : 'border-[#D8D2C4] hover:border-[#1B4332]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          {/* Badges Row */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] font-bold uppercase ${
                                isCold
                                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                  : isScientific
                                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                  : isChawl
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isCold ? (
                                <ThermometerSnowflake className="w-3 h-3" />
                              ) : isScientific || isChawl ? (
                                <Wind className="w-3 h-3" />
                              ) : (
                                <Warehouse className="w-3 h-3" />
                              )}
                              {fac.typeLabel}
                            </span>

                            {fac.wdraCertified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                <span>WDRA Accredited • e-NWR</span>
                              </span>
                            )}

                            {isSuitableForCalcCrop && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1B4332] bg-[#EAF2ED] px-2 py-0.5 rounded border border-[#B7D5C4]">
                                <Sparkles className="w-3 h-3 text-[#1B4332]" />
                                <span>{t.netRealisation.suitableForYourCrop || `Suitable for ${calcCrop}`}</span>
                              </span>
                            )}
                          </div>

                          {/* Facility Name & Operator */}
                          <h3 className="text-base font-bold text-[#262320] font-heading">{fac.name}</h3>
                          <p className="text-xs text-[#635E59] font-medium">{fac.operator}</p>

                          {/* Location & Distance */}
                          <div className="flex items-center gap-3 text-xs text-[#635E59] pt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#1B4332]" />
                              <strong>
                                {fac.district}, {fac.state}
                              </strong>
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-stone-700 font-mono">
                              ~{fac.distanceKm} km from farmer hub
                            </span>
                          </div>
                        </div>

                        {/* Tariff Column */}
                        <div className="text-right shrink-0">
                          <div className="text-xs text-[#635E59]">Monthly Tariff</div>
                          <div className="text-lg font-extrabold text-[#1B4332] font-mono">
                            ₹{fac.ratePerQuintalPerMonth}
                            <span className="text-xs font-normal text-[#635E59]">/Qtl</span>
                          </div>
                          <div className="text-[11px] text-[#635E59] font-mono mt-0.5">
                            (₹{fac.dailyRatePerQuintal}/Qtl/day)
                          </div>
                        </div>
                      </div>

                      {/* Atmosphere & Recommended Duration */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5 p-2.5 bg-[#FAF8F5] rounded border border-[#ECE7DE] text-xs">
                        <div>
                          <span className="text-[11px] text-[#635E59] block font-semibold">
                            {t.netRealisation.environment || 'Storage Atmosphere'}:
                          </span>
                          <span className="text-[#262320] font-medium">{fac.tempRange}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#635E59] block font-semibold">
                            {t.netRealisation.recommendedDuration || 'Recommended Duration'}:
                          </span>
                          <span className="text-[#262320] font-medium">{fac.recommendedDuration}</span>
                        </div>
                      </div>

                      {/* Capacity Meter */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex justify-between text-xs text-[#635E59]">
                          <span>Available Space:</span>
                          <span className="font-bold text-[#262320] font-mono">
                            {fac.availableCapacityTonnes} Tonnes ({fac.availableCapacityQuintals.toLocaleString('en-IN')}{' '}
                            Qtl) • {capacityPct}% free
                          </span>
                        </div>
                        <div className="w-full bg-[#EAE4D9] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              capacityPct > 40 ? 'bg-[#2D6A4F]' : 'bg-amber-600'
                            }`}
                            style={{ width: `${capacityPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Suitable Crops Tags & Book CTA */}
                      <div className="mt-4 pt-3 border-t border-[#ECE7DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-[#635E59] mr-1 font-medium">Suitable for:</span>
                          {fac.suitableCrops.map((c) => (
                            <span
                              key={c}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                c.toLowerCase().includes(calcCrop.toLowerCase())
                                  ? 'bg-[#1B4332] text-white'
                                  : 'bg-[#F4EFE6] text-[#262320] border border-[#D8D2C4]'
                              }`}
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenReserveModal(fac)}
                          className="px-3.5 py-1.5 rounded-[4px] bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-colors shrink-0 self-end sm:self-auto flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t.netRealisation.storageReserveBtn || 'Reserve Slot / Inward Pass'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right 5 Cols: Dynamic Store vs Sell Intelligence Calculator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[6px] border border-[#D8D2C4] p-5 shadow-xs sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#ECE7DE]">
                <div className="w-9 h-9 rounded-[4px] bg-[#1B4332] text-white flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#262320] font-heading">
                    {t.netRealisation.storageCalcTitle || 'Store vs Sell Now Calculator'}
                  </h2>
                  <p className="text-xs text-[#635E59]">
                    {t.netRealisation.storageCalcSub ||
                      'Compare immediate mandi sale with post-harvest storage holding value'}
                  </p>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-3.5 text-xs pt-4">
                {/* Crop & Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#635E59] font-medium mb-1">Select Crop</label>
                    <select
                      value={calcCrop}
                      onChange={(e) => handleCropChange(e.target.value)}
                      className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-2.5 py-1.5 font-bold text-[#262320]"
                    >
                      <option value="Onion">Onion (कांदा)</option>
                      <option value="Tomato">Tomato (टोमॅटो)</option>
                      <option value="Grapes">Grapes (द्राक्षे)</option>
                      <option value="Potato">Potato (बटाटा)</option>
                      <option value="Soybean">Soybean (सोयाबीन)</option>
                      <option value="Wheat">Wheat (गहू)</option>
                      <option value="Maize">Maize (मका)</option>
                      <option value="Pulses">Pulses / Gram (हरभरा)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#635E59] font-medium mb-1">Quantity (Quintals)</label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={calcQty}
                      onChange={(e) => setCalcQty(Number(e.target.value) || 10)}
                      className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-2.5 py-1.5 font-bold text-[#262320] font-mono"
                    />
                  </div>
                </div>

                {/* Spot Price & Market Trend */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#635E59] font-medium mb-1">Current Spot (₹/Qtl)</label>
                    <input
                      type="number"
                      min={300}
                      step={50}
                      value={calcSpotPrice}
                      onChange={(e) => setCalcSpotPrice(Number(e.target.value) || 500)}
                      className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-2.5 py-1.5 font-bold text-[#262320] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#635E59] font-medium mb-1">Market Outlook</label>
                    <select
                      value={calcTrend}
                      onChange={(e) => setCalcTrend(e.target.value as PriceTrend)}
                      className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-2.5 py-1.5 font-semibold text-[#262320]"
                    >
                      <option value="BEARISH">Softening (-5% to -10%)</option>
                      <option value="STABLE">Stable (+0% to +3%)</option>
                      <option value="MODERATE">Moderate Gain (+10% to +18%)</option>
                      <option value="HIGH">High Surge (+20% to +30%)</option>
                      <option value="PEAK_SEASON">Peak Off-Season (+35%+)</option>
                    </select>
                  </div>
                </div>

                {/* Storage Type & Tariff */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#635E59] font-medium mb-1">Storage Facility Type</label>
                    <select
                      value={calcStorageType}
                      onChange={(e) => {
                        const t = e.target.value as
                          | 'DRY_WAREHOUSE'
                          | 'VENTILATED_CHAWL'
                          | 'COLD_STORAGE'
                          | 'SCIENTIFIC_CHAWL';
                        setCalcStorageType(t);
                        if (t === 'COLD_STORAGE') setCalcMonthlyRate(90);
                        else if (t === 'SCIENTIFIC_CHAWL') setCalcMonthlyRate(52);
                        else if (t === 'VENTILATED_CHAWL') setCalcMonthlyRate(48);
                        else setCalcMonthlyRate(38);
                      }}
                      className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-2.5 py-1.5 font-semibold text-[#262320]"
                    >
                      <option value="DRY_WAREHOUSE">Dry Warehouse</option>
                      <option value="VENTILATED_CHAWL">Ventilated Onion Chawl</option>
                      <option value="SCIENTIFIC_CHAWL">Scientific Onion Chawl</option>
                      <option value="COLD_STORAGE">Cold Storage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#635E59] font-medium mb-1">Monthly Tariff (₹/Qtl)</label>
                    <input
                      type="number"
                      min={20}
                      max={200}
                      value={calcMonthlyRate}
                      onChange={(e) => setCalcMonthlyRate(Number(e.target.value) || 40)}
                      className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-2.5 py-1.5 font-mono font-bold text-[#262320]"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Scenario Comparative Analysis (Part 4) */}
              <div className="mt-5 pt-4 border-t border-[#ECE7DE] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#262320] uppercase tracking-wider">
                    Multi-Scenario Realisation Comparison
                  </span>
                  <span className="text-[11px] font-semibold text-[#1B4332]">5 Scenarios Evaluated</span>
                </div>

                {/* Scenarios Stack */}
                <div className="space-y-2">
                  {calcResult.scenarios.map((sc) => {
                    const isWinning = sc.isRecommended;
                    const isImmediate = sc.id === 'SELL_NOW';

                    return (
                      <div
                        key={sc.id}
                        className={`rounded-[6px] border p-3 transition-all ${
                          isWinning
                            ? 'bg-[#EAF2ED] border-[#52B788] ring-2 ring-[#52B788]/30 shadow-xs'
                            : 'bg-[#FAF8F5] border-[#D8D2C4]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            {isWinning && <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                            <strong className={isWinning ? 'text-[#1B4332] font-black' : 'text-[#262320]'}>
                              {sc.label}
                            </strong>
                          </div>

                          {isWinning ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white shadow-2xs">
                              {t.netRealisation.highestEstimatedOption || '★ RECOMMENDED'}
                            </span>
                          ) : sc.netAdvantageVsImmediate > 0 ? (
                            <span className="text-[10px] font-bold text-emerald-800 font-mono">
                              +₹{sc.netAdvantageVsImmediate.toLocaleString('en-IN')} vs Sell Now
                            </span>
                          ) : !isImmediate ? (
                            <span className="text-[10px] font-bold text-red-700 font-mono">
                              {sc.netAdvantageVsImmediate.toLocaleString('en-IN')} vs Sell Now
                            </span>
                          ) : null}
                        </div>

                        {/* Breakdown Metrics */}
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1.5 border-t border-[#D8D2C4]/60">
                          <div>
                            <span className="text-[#635E59] block">Expected Price</span>
                            <strong className="text-[#262320]">₹{sc.expectedPricePerQtl}/Qtl</strong>
                          </div>

                          <div>
                            <span className="text-[#635E59] block">Shrinkage / Loss</span>
                            <span className={sc.shrinkageLossPct > 15 ? 'text-red-700 font-bold' : 'text-[#635E59]'}>
                              {sc.shrinkageLossPct}% (~{sc.shrinkageLossKg} kg)
                            </span>
                          </div>

                          <div>
                            <span className="text-[#635E59] block">Storage Tariff</span>
                            <span className="text-[#635E59] font-mono">
                              {sc.storageTariffTotal > 0 ? `-₹${sc.storageTariffTotal.toLocaleString('en-IN')}` : '₹0'}
                            </span>
                          </div>

                          <div className="text-right sm:text-left">
                            <span className="text-[#635E59] block">Net Realisation</span>
                            <strong className="text-[#1B4332] font-black font-mono">
                              ₹{sc.netRealisation.toLocaleString('en-IN')}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Localized Transparent Rationale Box */}
                <div
                  className={`mt-4 rounded-[6px] p-3 border text-xs leading-relaxed ${
                    calcResult.recommendationType === 'SELL_NOW' ||
                    calcResult.recommendationType === 'STORAGE_NOT_ECONOMIC'
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                      : 'bg-[#1B4332] text-white border-[#143225]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {calcResult.recommendationType === 'SELL_NOW' ||
                    calcResult.recommendationType === 'STORAGE_NOT_ECONOMIC' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block text-xs uppercase tracking-wider mb-0.5">
                        {calcResult.recommendationType === 'STORAGE_NOT_ECONOMIC'
                          ? t.netRealisation.storageNotEconomic || 'Storage Not Economic — Sell Now'
                          : 'Recommendation Rationale'}
                      </strong>
                      <p>{activeRationale}</p>
                    </div>
                  </div>
                </div>

                {/* Non-guaranteed Advisory Notice */}
                <p className="text-[10px] text-[#635E59] italic pt-1 leading-tight">
                  {t.netRealisation.advisoryPriceNotice ||
                    'Future price projections are seasonal market estimates, not financial guarantees. Actual prices and shrinkage depend on crop moisture and mandi dynamics.'}
                </p>

                {/* e-NWR Financing Callout */}
                <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-[4px] p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#1B4332]">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>e-NWR Pledge Financing Available</span>
                  </div>
                  <p className="text-[#635E59] text-[11px]">
                    Farmers depositing produce in WDRA registered MSWC warehouses can obtain up to{' '}
                    <strong className="text-[#262320]">70% immediate pledge credit</strong> from SBI, Bank of
                    Maharashtra, and Nabard to meet working capital needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inward Reservation Gate Pass Modal */}
      {isPassModalOpen && selectedFacilityForPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[6px] border border-[#D8D2C4] max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-150 my-8">
            <button
              type="button"
              onClick={() => setIsPassModalOpen(false)}
              className="absolute top-4 right-4 text-[#635E59] hover:text-[#262320] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {!generatedPass ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-[4px] bg-[#1B4332] text-white flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#262320] font-heading">
                      {t.netRealisation.storageReserveBtn || 'Reserve Inward Slot'}
                    </h3>
                    <p className="text-xs text-[#635E59]">{selectedFacilityForPass.name}</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[#635E59] font-medium mb-1">Farmer / Producer Name</label>
                    <input
                      type="text"
                      value={farmerNameInput}
                      onChange={(e) => setFarmerNameInput(e.target.value)}
                      className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-3 py-2 font-semibold text-[#262320]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#635E59] font-medium mb-1">Crop to Store</label>
                      <select
                        value={depositCropInput}
                        onChange={(e) => setDepositCropInput(e.target.value)}
                        className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-3 py-2 font-semibold text-[#262320]"
                      >
                        {selectedFacilityForPass.suitableCrops.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#635E59] font-medium mb-1">Deposit Quantity (Qtl)</label>
                      <input
                        type="number"
                        min={10}
                        max={1000}
                        value={depositQtyInput}
                        onChange={(e) => setDepositQtyInput(Number(e.target.value) || 10)}
                        className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-3 py-2 font-mono font-bold text-[#262320]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#635E59] font-medium mb-1">Preferred Inward Gate Date</label>
                    <input
                      type="date"
                      value={inwardDateInput}
                      onChange={(e) => setInwardDateInput(e.target.value)}
                      className="w-full bg-[#F4EFE6] border border-[#D8D2C4] rounded-[4px] px-3 py-2 font-medium text-[#262320]"
                    />
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-[4px] p-3 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="enwrCheck"
                      checked={requestEnwr}
                      onChange={(e) => setRequestEnwr(e.target.checked)}
                      className="mt-0.5 rounded border-[#D8D2C4] text-[#1B4332] focus:ring-[#1B4332]"
                    />
                    <label htmlFor="enwrCheck" className="text-[11px] text-[#262320] leading-tight cursor-pointer">
                      <strong className="block text-[#1B4332]">Issue e-NWR Electronic Negotiable Receipt</strong>
                      Enable electronic warehouse receipt for 70% bank pledge financing at 7% subsidized interest rate.
                    </label>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPassModalOpen(false)}
                      className="px-3.5 py-2 rounded-[4px] text-xs font-semibold text-[#635E59] hover:bg-[#F4EFE6]"
                    >
                      {t.common.cancel || 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleGeneratePass}
                      className="px-4 py-2 rounded-[4px] bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] transition-colors"
                    >
                      Generate Inward Gate Pass
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Official Gate Pass Slip */
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#1B4332] rounded-[6px] p-5 bg-[#FAFBF9] text-[#262320]">
                  <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-3">
                    <div>
                      <div className="text-[10px] font-bold text-[#1B4332] uppercase tracking-wider">
                        Govt of Maharashtra • MSWC Warehousing System
                      </div>
                      <h4 className="text-sm font-extrabold font-heading text-[#1B4332]">
                        INWARD GATE ENTRY TOKEN & PASS
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        CONFIRMED
                      </span>
                    </div>
                  </div>

                  {/* Token Details */}
                  <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-[#ECE7DE]">
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">{t.netRealisation.storageReceiptNumber || 'Pass Number'}</div>
                      <div className="font-mono font-bold text-[#1B4332] text-sm">{generatedPass.passNumber}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">Allocated Bay</div>
                      <div className="font-mono font-bold text-stone-800">{generatedPass.bayNumber}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">Farmer / Depositor</div>
                      <div className="font-bold text-stone-800">{generatedPass.farmerName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">Commodity & Quantity</div>
                      <div className="font-bold text-stone-800">
                        {generatedPass.crop} • {generatedPass.quantityQuintals} Quintals
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">Facility</div>
                      <div className="font-medium text-stone-700">{generatedPass.facilityName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">Inward Date</div>
                      <div className="font-medium text-stone-700">{generatedPass.preferredDate} (Valid 48h)</div>
                    </div>
                  </div>

                  {/* Barcode Simulation */}
                  <div className="pt-3 text-center">
                    <div className="font-mono text-xs tracking-widest text-stone-700 bg-white py-1.5 border border-[#D8D2C4] rounded">
                      ||| | |||| | |||||| || | |||| ||||| | ||
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Show this pass at warehouse gate before 11:00 AM for moisture testing & lot unload.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-[4px] border border-[#D8D2C4] text-xs font-semibold text-[#262320] hover:bg-[#F4EFE6] flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Token</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPassModalOpen(false)}
                    className="px-4 py-1.5 rounded-[4px] bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#2D6A4F]"
                  >
                    {t.netRealisation.storageCloseModal || 'Done'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
