/**
 * KisanSetu — Dynamic Store vs Sell Decision Intelligence Engine
 * SIH Problem Statement 26132 (Govt of Maharashtra)
 *
 * Models post-harvest preservation economics across Maharashtra crops,
 * comparing Immediate Mandi Sale vs 15d, 30d, 60d, and 90d storage holding.
 */

export type CropCategory =
  | 'PERISHABLE_COLD' // Tomato, Grapes, Pomegranate
  | 'SEMI_PERISHABLE_CHAWL' // Onion, Garlic
  | 'TUBER_COLD' // Potato
  | 'DRY_GRAIN_OILSEED'; // Wheat, Soybean, Maize, Gram/Pulses

export type PriceTrend = 'BEARISH' | 'STABLE' | 'MODERATE' | 'HIGH' | 'PEAK_SEASON';

export type RecommendationType =
  | 'SELL_NOW'
  | 'STORE_15_DAYS'
  | 'STORE_30_DAYS'
  | 'STORE_60_DAYS'
  | 'STORE_90_DAYS'
  | 'STORAGE_NOT_ECONOMIC';

export interface StorageScenario {
  id: 'SELL_NOW' | 'STORE_15_DAYS' | 'STORE_30_DAYS' | 'STORE_60_DAYS' | 'STORE_90_DAYS';
  durationDays: number;
  label: string;
  expectedPricePerQtl: number;
  priceChangePct: number;
  shrinkageLossPct: number;
  shrinkageLossKg: number;
  saleableQuantityQtl: number;
  grossValue: number;
  storageTariffTotal: number;
  handlingTotal: number;
  sellingDeductions: number;
  netRealisation: number;
  netPerQuintal: number;
  netAdvantageVsImmediate: number;
  netAdvantagePerQuintal: number;
  isRecommended: boolean;
  isViable: boolean;
}

export interface StoreVsSellResult {
  crop: string;
  category: CropCategory;
  quantityQuintals: number;
  currentSpotPricePerQtl: number;
  trend: PriceTrend;
  recommendedStorageType: string;
  monthlyTariffPerQtl: number;
  scenarios: StorageScenario[];
  recommendedScenario: StorageScenario;
  recommendationType: RecommendationType;
  rationale: {
    en: string;
    mr: string;
    te: string;
    hi: string;
  };
  disclaimer: string;
}

interface CropProfile {
  category: CropCategory;
  defaultSpotPrice: number;
  preferredStorageType: 'DRY_WAREHOUSE' | 'VENTILATED_CHAWL' | 'COLD_STORAGE' | 'SCIENTIFIC_CHAWL';
  defaultMonthlyTariff: number;
  // Shrinkage & spoilage loss percentages for [15d, 30d, 60d, 90d]
  shrinkageRates: {
    15: number;
    30: number;
    60: number;
    90: number;
  };
  // Base price recovery potential per trend
  trendMultipliers: Record<PriceTrend, { 15: number; 30: number; 60: number; 90: number }>;
}

const CROP_PROFILES: Record<string, CropProfile> = {
  Tomato: {
    category: 'PERISHABLE_COLD',
    defaultSpotPrice: 1600,
    preferredStorageType: 'COLD_STORAGE',
    defaultMonthlyTariff: 95,
    shrinkageRates: { 15: 6.0, 30: 16.0, 60: 42.0, 90: 80.0 }, // Highly perishable, decays rapidly
    trendMultipliers: {
      BEARISH: { 15: -0.05, 30: -0.08, 60: -0.12, 90: -0.15 },
      STABLE: { 15: 0.01, 30: 0.03, 60: 0.04, 90: 0.05 },
      MODERATE: { 15: 0.06, 30: 0.12, 60: 0.18, 90: 0.22 },
      HIGH: { 15: 0.12, 30: 0.22, 60: 0.32, 90: 0.38 },
      PEAK_SEASON: { 15: 0.18, 30: 0.35, 60: 0.48, 90: 0.55 },
    },
  },
  Grapes: {
    category: 'PERISHABLE_COLD',
    defaultSpotPrice: 4200,
    preferredStorageType: 'COLD_STORAGE',
    defaultMonthlyTariff: 105,
    shrinkageRates: { 15: 4.0, 30: 9.0, 60: 24.0, 90: 55.0 },
    trendMultipliers: {
      BEARISH: { 15: -0.04, 30: -0.07, 60: -0.10, 90: -0.15 },
      STABLE: { 15: 0.02, 30: 0.04, 60: 0.06, 90: 0.08 },
      MODERATE: { 15: 0.06, 30: 0.14, 60: 0.22, 90: 0.28 },
      HIGH: { 15: 0.12, 30: 0.24, 60: 0.36, 90: 0.44 },
      PEAK_SEASON: { 15: 0.18, 30: 0.36, 60: 0.50, 90: 0.60 },
    },
  },
  Onion: {
    category: 'SEMI_PERISHABLE_CHAWL',
    defaultSpotPrice: 2150,
    preferredStorageType: 'VENTILATED_CHAWL',
    defaultMonthlyTariff: 48,
    shrinkageRates: { 15: 2.5, 30: 5.0, 60: 9.5, 90: 16.0 }, // Moisture loss + dry outer skin
    trendMultipliers: {
      BEARISH: { 15: -0.04, 30: -0.06, 60: -0.08, 90: -0.10 },
      STABLE: { 15: 0.01, 30: 0.02, 60: 0.03, 90: 0.04 },
      MODERATE: { 15: 0.06, 30: 0.14, 60: 0.25, 90: 0.35 }, // Classic post-harvest glut to lean jump
      HIGH: { 15: 0.10, 30: 0.24, 60: 0.40, 90: 0.55 },
      PEAK_SEASON: { 15: 0.15, 30: 0.35, 60: 0.60, 90: 0.85 },
    },
  },
  Potato: {
    category: 'TUBER_COLD',
    defaultSpotPrice: 1800,
    preferredStorageType: 'COLD_STORAGE',
    defaultMonthlyTariff: 70,
    shrinkageRates: { 15: 1.5, 30: 2.8, 60: 4.8, 90: 7.0 }, // Cold storage holds well
    trendMultipliers: {
      BEARISH: { 15: -0.03, 30: -0.05, 60: -0.08, 90: -0.10 },
      STABLE: { 15: 0.01, 30: 0.03, 60: 0.05, 90: 0.06 },
      MODERATE: { 15: 0.04, 30: 0.10, 60: 0.18, 90: 0.26 },
      HIGH: { 15: 0.08, 30: 0.18, 60: 0.30, 90: 0.42 },
      PEAK_SEASON: { 15: 0.12, 30: 0.28, 60: 0.45, 90: 0.60 },
    },
  },
  Wheat: {
    category: 'DRY_GRAIN_OILSEED',
    defaultSpotPrice: 2450,
    preferredStorageType: 'DRY_WAREHOUSE',
    defaultMonthlyTariff: 38,
    shrinkageRates: { 15: 0.4, 30: 0.8, 60: 1.3, 90: 1.8 }, // Dry warehouse minimal loss
    trendMultipliers: {
      BEARISH: { 15: -0.02, 30: -0.03, 60: -0.04, 90: -0.05 },
      STABLE: { 15: 0.01, 30: 0.02, 60: 0.03, 90: 0.04 },
      MODERATE: { 15: 0.03, 30: 0.07, 60: 0.14, 90: 0.20 },
      HIGH: { 15: 0.06, 30: 0.14, 60: 0.24, 90: 0.32 },
      PEAK_SEASON: { 15: 0.10, 30: 0.20, 60: 0.32, 90: 0.44 },
    },
  },
  Soybean: {
    category: 'DRY_GRAIN_OILSEED',
    defaultSpotPrice: 4600,
    preferredStorageType: 'DRY_WAREHOUSE',
    defaultMonthlyTariff: 40,
    shrinkageRates: { 15: 0.5, 30: 0.9, 60: 1.5, 90: 2.1 },
    trendMultipliers: {
      BEARISH: { 15: -0.02, 30: -0.04, 60: -0.06, 90: -0.08 },
      STABLE: { 15: 0.01, 30: 0.02, 60: 0.04, 90: 0.05 },
      MODERATE: { 15: 0.04, 30: 0.09, 60: 0.17, 90: 0.24 },
      HIGH: { 15: 0.08, 30: 0.16, 60: 0.28, 90: 0.38 },
      PEAK_SEASON: { 15: 0.12, 30: 0.24, 60: 0.38, 90: 0.52 },
    },
  },
  Maize: {
    category: 'DRY_GRAIN_OILSEED',
    defaultSpotPrice: 2050,
    preferredStorageType: 'DRY_WAREHOUSE',
    defaultMonthlyTariff: 36,
    shrinkageRates: { 15: 0.5, 30: 1.0, 60: 1.6, 90: 2.2 },
    trendMultipliers: {
      BEARISH: { 15: -0.02, 30: -0.04, 60: -0.05, 90: -0.07 },
      STABLE: { 15: 0.01, 30: 0.02, 60: 0.03, 90: 0.05 },
      MODERATE: { 15: 0.03, 30: 0.08, 60: 0.15, 90: 0.22 },
      HIGH: { 15: 0.07, 30: 0.15, 60: 0.25, 90: 0.34 },
      PEAK_SEASON: { 15: 0.10, 30: 0.22, 60: 0.34, 90: 0.46 },
    },
  },
  Pulses: {
    category: 'DRY_GRAIN_OILSEED',
    defaultSpotPrice: 6200,
    preferredStorageType: 'DRY_WAREHOUSE',
    defaultMonthlyTariff: 42,
    shrinkageRates: { 15: 0.4, 30: 0.8, 60: 1.4, 90: 2.0 },
    trendMultipliers: {
      BEARISH: { 15: -0.02, 30: -0.04, 60: -0.06, 90: -0.08 },
      STABLE: { 15: 0.01, 30: 0.03, 60: 0.05, 90: 0.06 },
      MODERATE: { 15: 0.04, 30: 0.10, 60: 0.18, 90: 0.26 },
      HIGH: { 15: 0.08, 30: 0.18, 60: 0.30, 90: 0.40 },
      PEAK_SEASON: { 15: 0.12, 30: 0.25, 60: 0.40, 90: 0.55 },
    },
  },
};

export function getCropProfile(crop: string): CropProfile {
  return CROP_PROFILES[crop] || CROP_PROFILES.Onion;
}

export function calculateStoreVsSell({
  crop = 'Onion',
  quantityQuintals = 50,
  currentSpotPricePerQtl,
  trend = 'MODERATE',
  storageFacilityType,
  monthlyTariffPerQtl,
  handlingPerQtl = 12, // in & out loading labor
}: {
  crop?: string;
  quantityQuintals?: number;
  currentSpotPricePerQtl?: number;
  trend?: PriceTrend;
  storageFacilityType?: 'DRY_WAREHOUSE' | 'VENTILATED_CHAWL' | 'COLD_STORAGE' | 'SCIENTIFIC_CHAWL';
  monthlyTariffPerQtl?: number;
  handlingPerQtl?: number;
}): StoreVsSellResult {
  const profile = getCropProfile(crop);
  const spotPrice = currentSpotPricePerQtl && currentSpotPricePerQtl > 0 ? currentSpotPricePerQtl : profile.defaultSpotPrice;
  const qty = Math.max(1, quantityQuintals);

  // Storage tariff selection
  const storageType = storageFacilityType || profile.preferredStorageType;
  const effectiveMonthlyTariff = monthlyTariffPerQtl && monthlyTariffPerQtl > 0 ? monthlyTariffPerQtl : profile.defaultMonthlyTariff;

  // Scientific chawl gives 25% lower shrinkage on onion
  const isScientific = storageType === 'SCIENTIFIC_CHAWL';

  // 1. Immediate Sale Scenario
  const immediateGross = Math.round(qty * spotPrice);
  const immediateDeductions = Math.round(immediateGross * 0.03); // 3% mandi cess/commission/loading
  const immediateNet = immediateGross - immediateDeductions;
  const immediateNetPerQtl = Math.round(immediateNet / qty);

  const sellNowScenario: StorageScenario = {
    id: 'SELL_NOW',
    durationDays: 0,
    label: 'Sell Now (Immediate Mandi Sale)',
    expectedPricePerQtl: spotPrice,
    priceChangePct: 0,
    shrinkageLossPct: 0,
    shrinkageLossKg: 0,
    saleableQuantityQtl: qty,
    grossValue: immediateGross,
    storageTariffTotal: 0,
    handlingTotal: 0,
    sellingDeductions: immediateDeductions,
    netRealisation: immediateNet,
    netPerQuintal: immediateNetPerQtl,
    netAdvantageVsImmediate: 0,
    netAdvantagePerQuintal: 0,
    isRecommended: false,
    isViable: true,
  };

  // 2. Storage Durations: 15, 30, 60, 90 Days
  const durations: Array<{ id: StorageScenario['id']; days: 15 | 30 | 60 | 90; label: string }> = [
    { id: 'STORE_15_DAYS', days: 15, label: 'Store for 15 Days' },
    { id: 'STORE_30_DAYS', days: 30, label: 'Store for 30 Days' },
    { id: 'STORE_60_DAYS', days: 60, label: 'Store for 60 Days' },
    { id: 'STORE_90_DAYS', days: 90, label: 'Store for 90 Days' },
  ];

  const storageScenarios: StorageScenario[] = durations.map((d) => {
    let lossPct = profile.shrinkageRates[d.days];
    if (isScientific && profile.category === 'SEMI_PERISHABLE_CHAWL') {
      lossPct = Number((lossPct * 0.72).toFixed(1)); // 28% reduction in scientific forced-air chawl
    }

    // Perishables in non-cold storage decay immediately
    if (profile.category === 'PERISHABLE_COLD' && storageType !== 'COLD_STORAGE') {
      lossPct = Math.min(100, lossPct * 2.5);
    }

    const priceChangePct = profile.trendMultipliers[trend][d.days];
    const expectedPrice = Math.round(spotPrice * (1 + priceChangePct));

    const saleableQty = Number((qty * (1 - lossPct / 100)).toFixed(2));
    const shrinkageLossKg = Math.round((qty - saleableQty) * 100);

    const futureGross = Math.round(saleableQty * expectedPrice);
    const storageTariff = Math.round((qty * effectiveMonthlyTariff * d.days) / 30);
    const handling = Math.round(qty * handlingPerQtl);
    const futureDeductions = Math.round(futureGross * 0.025); // direct trade savings

    const netRealisation = futureGross - storageTariff - handling - futureDeductions;
    const netPerQtl = Math.round(netRealisation / qty);
    const netAdvantage = netRealisation - immediateNet;
    const netAdvantagePerQtl = Math.round(netAdvantage / qty);

    // Is viable: loss under 35% and net is positive
    const isViable = lossPct < 35 && netRealisation > 0;

    return {
      id: d.id,
      durationDays: d.days,
      label: d.label,
      expectedPricePerQtl: expectedPrice,
      priceChangePct: Number((priceChangePct * 100).toFixed(1)),
      shrinkageLossPct: lossPct,
      shrinkageLossKg,
      saleableQuantityQtl: saleableQty,
      grossValue: futureGross,
      storageTariffTotal: storageTariff,
      handlingTotal: handling,
      sellingDeductions: futureDeductions,
      netRealisation,
      netPerQuintal: netPerQtl,
      netAdvantageVsImmediate: netAdvantage,
      netAdvantagePerQuintal: netAdvantagePerQtl,
      isRecommended: false,
      isViable,
    };
  });

  const allScenarios = [sellNowScenario, ...storageScenarios];

  // Determine the economically strongest option
  // Must be viable and have the highest netRealisation
  const viableScenarios = allScenarios.filter((s) => s.isViable);
  const bestScenario = viableScenarios.reduce((best, cur) => (cur.netRealisation > best.netRealisation ? cur : best), sellNowScenario);

  // If best is Sell Now, or if best netAdvantage is <= 0:
  let recType: RecommendationType = 'SELL_NOW';
  if (bestScenario.id === 'SELL_NOW' || bestScenario.netAdvantageVsImmediate <= 0) {
    if (profile.category === 'PERISHABLE_COLD' && storageScenarios.some((s) => s.netAdvantageVsImmediate < -2000)) {
      recType = 'STORAGE_NOT_ECONOMIC';
    } else {
      recType = 'SELL_NOW';
    }
    sellNowScenario.isRecommended = true;
  } else {
    recType = bestScenario.id as RecommendationType;
    bestScenario.isRecommended = true;
  }

  const winningScenario = allScenarios.find((s) => s.isRecommended) || sellNowScenario;

  // Generate localized, transparent explanations
  let enRationale = '';
  let mrRationale = '';
  let teRationale = '';
  let hiRationale = '';

  if (recType === 'SELL_NOW' || recType === 'STORAGE_NOT_ECONOMIC') {
    if (profile.category === 'PERISHABLE_COLD') {
      enRationale = `Sell Now Recommended: For perishable ${crop}, cold storage fees (₹${effectiveMonthlyTariff}/Qtl/mo) and weight/spoilage shrinkage exceed the projected price gain. Immediate mandi sale yields the safest net realisation.`;
      mrRationale = `त्वरित विक्री शिफारस: नाशवंत ${crop} साठी कोल्ड स्टोरेज भाडे (₹${effectiveMonthlyTariff}/क्विं/महिना) आणि घट/नासाडी संभाव्य भाववाढीपेक्षा जास्त आहे. आजच थेट विक्री केल्यास सर्वाधिक निव्वळ रक्कम मिळेल.`;
      teRationale = `వెంటనే అమ్మడం సిఫార్సు: పాడైపోయే ${crop} కోసం కోల్డ్ స్టోరేజ్ ఛార్జీలు మరియు బరువు నష్టం ఆశించిన ధర పెరుగుదల కంటే ఎక్కువగా ఉన్నాయి. నేటి అమ్మకమే అత్యధిక నికర రాబడిని ఇస్తుంది.`;
      hiRationale = `तुरंत बिक्री की सिफारिश: नाशवान ${crop} के लिए कोल्ड स्टोरेज किराया (₹${effectiveMonthlyTariff}/क्विं/माह) और नमी/सड़न नुकसान संभावित मूल्य वृद्धि से अधिक है। आज ही बिक्री करने पर सबसे सुरक्षित शुद्ध लाभ मिलेगा।`;
    } else {
      enRationale = `Sell Now Recommended: Under current market conditions, expected price appreciation does not overcome storage tariffs (-₹${effectiveMonthlyTariff}/Qtl) and moisture loss. Storing would result in lower net realization.`;
      mrRationale = `त्वरित विक्री शिफारस: सध्याच्या बाजार स्थितीत, अपेक्षित भाववाढ गोदामाचे भाडे आणि वजनातील घट भरून काढू शकत नाही. साठवणूक केल्यास निव्वळ तोटा होऊ शकतो.`;
      teRationale = `వెంటనే అమ్మడం సిఫార్సు: ప్రస్తుత మార్కెట్ పరిస్థితుల్లో, ఆశించిన ధర పెరుగుదల గిడ్డంగి అద్దె మరియు తేమ నష్టాన్ని భర్తీ చేయదు. నిల్వ చేయడం వల్ల నికర రాబడి తగ్గుతుంది.`;
      hiRationale = `तुरंत बिक्री की सिफारिश: मौजूदा बाजार स्थितियों में, अपेक्षित मूल्य वृद्धि भंडारण शुल्क और नमी के नुकसान की भरपाई नहीं कर पाती। भंडारण करने पर शुद्ध लाभ कम होगा।`;
    }
  } else {
    const adv = winningScenario.netAdvantageVsImmediate.toLocaleString('en-IN');
    const advPerQtl = winningScenario.netAdvantagePerQuintal.toLocaleString('en-IN');
    const days = winningScenario.durationDays;

    enRationale = `Store for ${days} Days Recommended: Storing ${qty} Qtl ${crop} for ${days} days may yield an estimated additional net gain of ₹${adv} (₹${advPerQtl}/Qtl) after deducting storage tariffs and ${winningScenario.shrinkageLossPct}% shrinkage.`;
    mrRationale = `${days} दिवस साठवणूक शिफारस: ${qty} क्विं ${crop} ${days} दिवस साठवल्यास गोदामाचे भाडे आणि ${winningScenario.shrinkageLossPct}% घट वजा करून अंदाजे ₹${adv} (₹${advPerQtl}/क्विं) जास्त निव्वळ नफा मिळू शकतो.`;
    teRationale = `${days} రోజులు నిల్వ చేయడం సిఫార్సు: ${qty} క్వింటాళ్ల ${crop}ను ${days} రోజులు నిల్వ చేయడం ద్వారా నిల్వ ఖర్చులు మరియు ${winningScenario.shrinkageLossPct}% తరుగు తీసివేయగా సుమారు ₹${adv} (₹${advPerQtl}/క్వింటాల్) అదనపు లాభం వచ్చే అవకాశం ఉంది.`;
    hiRationale = `${days} दिन भंडारण की सिफारिश: ${qty} क्विंटल ${crop} को ${days} दिन रखने पर भंडारण शुल्क और ${winningScenario.shrinkageLossPct}% नमी नुकसान काटकर लगभग ₹${adv} (₹${advPerQtl}/क्विं) का अतिरिक्त शुद्ध लाभ मिल सकता है।`;
  }

  return {
    crop,
    category: profile.category,
    quantityQuintals: qty,
    currentSpotPricePerQtl: spotPrice,
    trend,
    recommendedStorageType: storageType,
    monthlyTariffPerQtl: effectiveMonthlyTariff,
    scenarios: allScenarios,
    recommendedScenario: winningScenario,
    recommendationType: recType,
    rationale: {
      en: enRationale,
      mr: mrRationale,
      te: teRationale,
      hi: hiRationale,
    },
    disclaimer: 'Advisory market model based on seasonal Maharashtra APMC price movements. Future spot prices, weather effects, and warehouse shrinkage are estimates and not financial guarantees.',
  };
}
