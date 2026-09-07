// KisanSetu - Multilingual Translation Dictionary
// Supported Locales: en (English), mr (मराठी), te (తెలుగు)
// SIH Problem Statement 26132 (Govt of Maharashtra)

export type Locale = 'en' | 'mr' | 'te' | 'hi';

export interface TranslationDictionary {
  brand: {
    name: string;
    tagline: string;
    subtagline: string;
    sihBadge: string;
  };
  nav: {
    home: string;
    farmer: string;
    buyer: string;
    transporter: string;
    markets: string;
    calculator: string;
    getStarted: string;
    lots: string;
    transactions: string;
    more: string;
    speak: string;
    inspector: string;
    disputes: string;
    admin: string;
  };
  hero: {
    badge: string;
    titleMain: string;
    titleHighlight: string;
    tagline: string;
    descriptor: string;
    coreUsp: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    exploreMarket: string;
    createProduceLot: string;
    findBuyers: string;
    viewDemo: string;
    statsFarmers: string;
    statsMandis: string;
    statsBuyers: string;
  };
  ecosystem: {
    title: string;
    subtitle: string;
    farmerTitle: string;
    farmerDesc: string;
    farmerAction: string;
    buyerTitle: string;
    buyerDesc: string;
    buyerAction: string;
    transporterTitle: string;
    transporterDesc: string;
    transporterAction: string;
    flowTitle: string;
    flowSubtitle: string;
    stepFarmer: string;
    stepMarket: string;
    stepQuality: string;
    stepMatching: string;
    stepTransport: string;
    stepNetRealisation: string;
    stepTransaction: string;
    stepTrust: string;
  };
  usp: {
    title: string;
    subtitle: string;
    formulaLabel: string;
    formulaGross: string;
    formulaTransport: string;
    formulaStorage: string;
    formulaOther: string;
    formulaNet: string;
    explanation: string;
    interactiveDemoTitle: string;
  };
  valueProps: {
    title: string;
    subtitle: string;
    p1Title: string;
    p1Desc: string;
    p2Title: string;
    p2Desc: string;
    p3Title: string;
    p3Desc: string;
    p4Title: string;
    p4Desc: string;
  };
  footer: {
    govtCredit: string;
    disclaimer: string;
    phaseNotice: string;
  };
  farmer: {
    badge: string;
    title: string;
    subtitle: string;
    createLotCTA: string;
    activeLotsCard: string;
    activeLotsSub: string;
    incomingOffersCard: string;
    incomingOffersSub: string;
    fpoMembershipCard: string;
    fpoMembershipSub: string;
    recentLotsTitle: string;
    viewAllLots: string;
    engineTitle: string;
    engineDesc: string;
    engineAction: string;
    qualityTitle: string;
    qualityDesc: string;
    qualityAction: string;
    noticeTitle: string;
    noticeDesc: string;
  };
  lots: {
    badge: string;
    title: string;
    subtitle: string;
    createNew: string;
    filterAll: string;
    filterAvailable: string;
    filterDraft: string;
    filterReserved: string;
    filterSold: string;
    emptyTitle: string;
    emptyDesc: string;
    createFirstLot: string;
    loading: string;
    lotId: string;
    crop: string;
    variety: string;
    volume: string;
    targetPrice: string;
    location: string;
    status: string;
    grade: string;
    actions: string;
    viewDetails: string;
    editLot: string;
    calculateRealisation: string;
    offersReceived: string;
    createModalTitle: string;
    createModalSubtitle: string;
    editModalTitle: string;
    cropLabel: string;
    selectCrop: string;
    cropCustomPlaceholder: string;
    varietyLabel: string;
    varietyPlaceholder: string;
    quantityLabel: string;
    unitLabel: string;
    expectedPriceLabel: string;
    expectedPricePerQtl: string;
    expectedGradeLabel: string;
    gradeA: string;
    gradeB: string;
    gradeC: string;
    gradeNotYet: string;
    harvestDateLabel: string;
    availabilityDateLabel: string;
    districtLabel: string;
    selectDistrict: string;
    locationLabel: string;
    locationPlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    saveDraftBtn: string;
    publishBtn: string;
    updateBtn: string;
    cancelBtn: string;
    savingBtn: string;
    backToList: string;
    detailTitle: string;
    specificationsTitle: string;
    futureOfferTitle: string;
    futureOfferDesc: string;
    futureQualityTitle: string;
    futureQualityDesc: string;
    futureLogisticsTitle: string;
    futureLogisticsDesc: string;
    futureNetTitle: string;
    futureNetDesc: string;
    futureEscrowTitle: string;
    futureEscrowDesc: string;
  };
  quality: {
    sectionTitle: string;
    sectionSubtitle: string;
    tier1Title: string;
    tier1Subtitle: string;
    tier1Badge: string;
    tier1Disclaimer: string;
    tier2Title: string;
    tier2Subtitle: string;
    tier2BadgePending: string;
    tier2BadgeVerified: string;
    tier2BadgeRejected: string;
    tier2BadgeReinspection: string;
    requestAiAssessment: string;
    aiModalTitle: string;
    aiModalSubtitle: string;
    colorLabel: string;
    colorPlaceholder: string;
    visibleDamageLabel: string;
    visibleDamagePlaceholder: string;
    sizeUniformityLabel: string;
    visibleDefectsLabel: string;
    estimatedGradeLabel: string;
    assessmentNotesLabel: string;
    assessmentNotesPlaceholder: string;
    runAiAssessmentBtn: string;
    runningAssessment: string;
    inspectorDashboardTitle: string;
    inspectorDashboardSubtitle: string;
    pendingCard: string;
    verifiedCard: string;
    reinspectionCard: string;
    openInspection: string;
    inspectionModalTitle: string;
    officialGrade: string;
    moisturePercentage: string;
    foreignMatter: string;
    inspectionLocation: string;
    inspectionDate: string;
    inspectionNotes: string;
    verificationStatus: string;
    submitVerification: string;
    submittingVerification: string;
    certificateNumber: string;
    inspector: string;
    verifiedAt: string;
    notAssessedYet: string;
    trustPrincipleTitle: string;
    trustPrincipleDesc: string;
    photoEmptyPrompt: string;
    uploadPhotoBtn: string;
    takePhotoBtn: string;
    changePhotoBtn: string;
    removePhotoBtn: string;
    photoRequiredError: string;
    invalidImageError: string;
    photoInputLabel: string;
    cameraInputLabel: string;
    assessQualityBtn: string;
    ruleBasedNotice: string;
  };
  buyerMatching: {
    matchedBuyersTitle: string;
    matchedBuyersSubtitle: string;
    noMatchesFound: string;
    matchScore: string;
    breakdownTitle: string;
    gapWarningsTitle: string;
    buyerIdentityVerified: string;
    buyerIdentityUnverified: string;
    reputationLabel: string;
    completedTrades: string;
    punctuality: string;
    viewDemandBtn: string;
    incomingOffersTitle: string;
    incomingOffersSubtitle: string;
    noOffersReceived: string;
    offerFrom: string;
    offeredPrice: string;
    offeredQuantity: string;
    totalOfferValue: string;
    paymentTerms: string;
    deliveryTerms: string;
    validUntil: string;
    acceptOfferBtn: string;
    rejectOfferBtn: string;
    acceptSuccess: string;
    rejectSuccess: string;
    confirmAccept: string;
    confirmReject: string;
    lotReservedNotice: string;
    statusPending: string;
    statusAccepted: string;
    statusRejected: string;
    statusCancelled: string;
    statusExpired: string;
    hubTitle: string;
    hubSubtitle: string;
    demoBuyerSelector: string;
    activeBuyerProfile: string;
    switchBuyer: string;
    verifiedCredentials: string;
    unverifiedCredentials: string;
    credentialDetails: string;
    reputationMetrics: string;
    rating: string;
    tradesCompleted: string;
    paymentPunctualityScore: string;
    tabActiveDemands: string;
    tabCreateDemand: string;
    tabBrowseLots: string;
    tabMyOffers: string;
    createDemandTitle: string;
    createDemandSubtitle: string;
    commodityLabel: string;
    commodityPlaceholder: string;
    quantityLabel: string;
    unitLabel: string;
    requiredGradeLabel: string;
    locationLabel: string;
    locationPlaceholder: string;
    deliveryLocationLabel: string;
    deliveryLocationPlaceholder: string;
    minPriceLabel: string;
    maxPriceLabel: string;
    deadlineLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    submitDemandBtn: string;
    submittingDemand: string;
    demandCreatedSuccess: string;
    demandsCount: string;
    noActiveDemands: string;
    viewMatchesBtn: string;
    priceRange: string;
    deadline: string;
    browseLotsTitle: string;
    browseLotsSubtitle: string;
    noMatchingLots: string;
    matchStrength: string;
    farmerLotId: string;
    expectedPrice: string;
    makeOfferBtn: string;
    filterByDemand: string;
    allDemands: string;
    makeOfferTitle: string;
    makeOfferSubtitle: string;
    offerPriceLabel: string;
    offerQtyLabel: string;
    deliveryTermsLabel: string;
    deliveryTermsPlaceholder: string;
    paymentTermsLabel: string;
    paymentTermsPlaceholder: string;
    expiryDateLabel: string;
    offerNotesLabel: string;
    offerNotesPlaceholder: string;
    submitOfferBtn: string;
    submittingOffer: string;
    offerCreatedSuccess: string;
    offerPendingNotice: string;
    myOffersTitle: string;
    myOffersSubtitle: string;
    noSentOffers: string;
    cancelOfferBtn: string;
    cancelSuccess: string;
    confirmCancel: string;
    trustNoticeTitle: string;
    trustNoticeDesc: string;
    demoNotice: string;
  };
  transport: {
    hubTitle: string;
    hubSubtitle: string;
    roleBadge: string;
    logisticsNetworkTitle: string;
    logisticsNetworkDesc: string;
    demoTransporterSelector: string;
    activeTransporterProfile: string;
    switchTransporter: string;
    verifiedPermit: string;
    unverifiedPermit: string;
    operationalDistrictsLabel: string;
    fleetRating: string;
    tripsCompleted: string;
    onTimeRate: string;
    tabFleet: string;
    tabRequests: string;
    tabDispatches: string;
    registerVehicleBtn: string;
    fleetOverviewTitle: string;
    fleetOverviewSubtitle: string;
    vehicleTypeLabel: string;
    vehicleRegLabel: string;
    capacityLabel: string;
    ratePerKmLabel: string;
    coldChainLabel: string;
    availableBadge: string;
    busyBadge: string;
    refrigeratedBadge: string;
    standardBadge: string;
    incomingRequestsTitle: string;
    incomingRequestsSubtitle: string;
    noRequestsReceived: string;
    lotDetailsLabel: string;
    pickupLocationLabel: string;
    dropLocationLabel: string;
    distanceLabel: string;
    tripsLabel: string;
    estimatedEarnings: string;
    costPerQtlLabel: string;
    scheduledPickupLabel: string;
    actualDeliveryLabel: string;
    statusRequested: string;
    statusAccepted: string;
    statusRejected: string;
    statusInTransit: string;
    statusDelivered: string;
    statusCancelled: string;
    acceptRequestBtn: string;
    declineRequestBtn: string;
    markInTransitBtn: string;
    markDeliveredBtn: string;
    activeDispatchesTitle: string;
    activeDispatchesSubtitle: string;
    noDispatchesFound: string;
    formulaTitle: string;
    formulaText: string;
    netRealisationNote: string;
    lotTransportTitle: string;
    lotTransportSubtitle: string;
    findTransportersBtn: string;
    destinationLabel: string;
    destinationPlaceholder: string;
    preferColdChainLabel: string;
    matchingTransportersTitle: string;
    noTransportersAvailable: string;
    costEquationLabel: string;
    bookTransportBtn: string;
    bookingModalTitle: string;
    bookingModalSubtitle: string;
    scheduledDateLabel: string;
    transportNotesLabel: string;
    transportNotesPlaceholder: string;
    confirmBookingBtn: string;
    bookingSuccess: string;
    activeBookingsTitle: string;
    noBookingsYet: string;
    demoNotice: string;
  };
  netRealisation: {
    hubTitle: string;
    hubSubtitle: string;
    netRealisation: string;
    grossSaleValue: string;
    transportCost: string;
    storageCost: string;
    otherCosts: string;
    netPerQuintal: string;
    bestSellingOption: string;
    sellNow: string;
    storeAndSellLater: string;
    waitAndWatch: string;
    estimatedLabel: string;
    notGuaranteed: string;
    whyThisRecommendation: string;
    howIsThisCalculated: string;
    compareSellingOptions: string;
    currentPrice: string;
    expectedFuturePrice: string;
    potentialImprovement: string;
    reliability: string;
    assumptions: string;
    demoData: string;
    estimatedData: string;
    insufficientData: string;
    holdingDaysLabel: string;
    tableOption: string;
    tableGross: string;
    tableTransport: string;
    tableStorage: string;
    tableOther: string;
    tableNet: string;
    tableAction: string;
    formulaTitle: string;
    formulaGrossText: string;
    formulaTransportText: string;
    formulaStorageText: string;
    formulaNetText: string;
    dashboardCardTitle: string;
    dashboardCardSub: string;
    viewAnalysisBtn: string;
    noOptionsAvailable: string;
    mandiYardLabel: string;
    directBuyerLabel: string;
    storageProjectionLabel: string;
  };
  transactions: {
    hubTitle: string;
    hubSubtitle: string;
    myTransactionsTitle: string;
    myTransactionsSubtitle: string;
    transactionCode: string;
    commercialAgreement: string;
    paymentTracking: string;
    paymentStatus: string;
    paymentInitiated: string;
    paymentProcessing: string;
    paymentReceived: string;
    paymentPaid: string;
    markPaymentReceivedBtn: string;
    completed: string;
    transportStatus: string;
    deliveryLocation: string;
    qualityStatus: string;
    physicallyVerified: string;
    aiVisualScreening: string;
    agreedPricePerQtl: string;
    grossContractValue: string;
    netRealisation: string;
    takeHomeEstimate: string;
    threeWayRatings: string;
    rateThisTransaction: string;
    ratingSubmitted: string;
    submitRatingBtn: string;
    ratingFeedbackPlaceholder: string;
    disputeGrievance: string;
    raiseDisputeBtn: string;
    viewTransactionBtn: string;
    filterAll: string;
    filterActive: string;
    filterCompleted: string;
    filterDisputed: string;
    noTransactionsFound: string;
    timelineTitle: string;
    prototypeNotice: string;
    reputationVsVerificationNote: string;
    buyerLabel: string;
    farmerLabel: string;
    transporterLabel: string;
  };
  disputes: {
    hubTitle: string;
    hubSubtitle: string;
    raiseGrievanceTitle: string;
    disputeCode: string;
    categoryLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    submitGrievanceBtn: string;
    statusOpen: string;
    statusUnderReview: string;
    statusResolved: string;
    statusRejected: string;
    statusClosed: string;
    categoryQualityMismatch: string;
    categoryDeliveryDelay: string;
    categoryPaymentDelay: string;
    categoryWeightDiscrepancy: string;
    categoryPriceDisagreement: string;
    categoryCancellation: string;
    categoryOther: string;
    evidenceChecklistTitle: string;
    humanAdjudicationNote: string;
    adminPanelTitle: string;
    resolutionNotesLabel: string;
    resolutionNotesPlaceholder: string;
    markUnderReviewBtn: string;
    resolveDisputeBtn: string;
    closeDisputeBtn: string;
    grievanceRecordedNotice: string;
    noDisputesFound: string;
  };
  calculator: {
    title: string;
    subtitle: string;
    badge: string;
    parametersCardTitle: string;
    parametersCardSub: string;
    selectCropLabel: string;
    harvestQtyLabel: string;
    sellingPriceLabel: string;
    distanceLabel: string;
    storageDurationLabel: string;
    daysUnit: string;
    quintalsUnit: string;
    perQtlUnit: string;
    resultTitle: string;
    takeHomeLabel: string;
    perQuintal: string;
    grossSaleValue: string;
    transportFreight: string;
    storageCost: string;
    mandiCessHandling: string;
    totalDeductions: string;
    formulaTitle: string;
    formulaText: string;
    loadedFromMarket: string;
    resetDefaults: string;
  };
  markets: {
    title: string;
    subtitle: string;
    badge: string;
    dataNoticeTitle: string;
    dataNoticeDesc: string;
    tableTitle: string;
    tableSub: string;
    colMarket: string;
    colCommodity: string;
    colPriceRange: string;
    colModalPrice: string;
    colArrivals: string;
    colAction: string;
    netProfitCheck: string;
    tonnes: string;
    dist: string;
    calculateNetRealisation: string;
    archTitle: string;
    archDesc: string;
  };
  voice: {
    buttonLabel: string;
    buttonHint: string;
    listening: string;
    stop: string;
    cancel: string;
    clear: string;
    readAloud: string;
    notSupported: string;
    permissionDenied: string;
    youSaid: string;
    intentTitle: string;
    fallbackResponse: string;
    suggestionTitle: string;
    safetyNotice: string;
    queryPrice: string;
    queryBuyers: string;
    queryProfit: string;
    queryTransport: string;
    queryOffers: string;
    queryTxns: string;
  };

}

export const translations: Record<Locale, TranslationDictionary> = {
  en: {
    brand: {
      name: 'KisanSetu',
      tagline: 'Right Market. Right Buyer. Right Price.',
      subtagline: 'Smart Agricultural Market-Linkage & Net Realisation Platform',
      sihBadge: 'Government of Maharashtra • Agriculture Initiative',
    },
    nav: {
      home: 'Home',
      farmer: 'Farmer / FPO',
      buyer: 'Buyers',
      transporter: 'Transporters',
      markets: 'Mandi Intelligence',
      calculator: 'Net Realisation',
      getStarted: 'Get Started',
      lots: 'My Lots',
      transactions: 'Transactions',
      more: 'More',
      speak: 'Speak',
      inspector: 'Quality Inspector',
      disputes: 'Grievances',
      admin: 'State Admin',
    },
    hero: {
      badge: 'Maharashtra & Coastal Agriculture Market Linkage',
      titleMain: 'Don\'t just find the highest price.',
      titleHighlight: 'Find the highest reliable net realisation.',
      tagline: 'Right Market. Right Buyer. Right Price.',
      descriptor: 'Smart Market Linkage & Net Realisation Platform for Farmers.',
      coreUsp: 'Don\'t just find the highest price. Find the highest reliable NET REALISATION.',
      description:
        'KisanSetu connects Maharashtra farmers and FPOs with verified buyers and trusted transporters. Compare markets, deduct actual logistics and storage costs, and choose the most profitable option with complete transparency.',
      ctaPrimary: 'Get Started',
      ctaSecondary: 'Explore Market Prices',
      exploreMarket: 'Explore Market',
      createProduceLot: 'Create Produce Lot',
      findBuyers: 'Find Buyers',
      viewDemo: 'View Demo',
      statsFarmers: '5,000+ Farmers & FPOs',
      statsMandis: '300+ APMC Mandis',
      statsBuyers: '1,200+ Verified Buyers',
    },
    ecosystem: {
      title: 'Integrated Agricultural Commerce Corridor',
      subtitle: 'Unbroken digital linkage from harvest to escrow settlement',
      farmerTitle: 'Farmers & FPOs',
      farmerDesc:
        'Create digital produce lots, receive AI visual screening, request physical quality checks, and compare multiple buyer offers.',
      farmerAction: 'Enter Farmer Hub',
      buyerTitle: 'Verified Buyers',
      buyerDesc:
        'Source consistent, quality-verified crops directly from Maharashtra farms and FPOs with guaranteed transparent fulfillment.',
      buyerAction: 'Explore Produce Lots',
      transporterTitle: 'Transporters',
      transporterDesc:
        'Get farm logistics bookings, eliminate empty return trips, and receive timely escrow-backed transport payments.',
      transporterAction: 'Join Logistics Network',
      flowTitle: 'The End-to-End KisanSetu Trade Lifecycle',
      flowSubtitle: 'Every step connects transparently without fragmented middlemen or hidden fees',
      stepFarmer: 'Farmer / FPO',
      stepMarket: 'Market Intelligence',
      stepQuality: 'Quality Verification',
      stepMatching: 'Buyer Matching',
      stepTransport: 'Transport Corridor',
      stepNetRealisation: 'Net Realisation',
      stepTransaction: 'Trade Contract',
      stepTrust: 'Trust & Grievance',
    },
    usp: {
      title: 'The KisanSetu Core USP',
      subtitle: 'Why Gross Mandi Price is deceptive without Net Realisation analysis',
      formulaLabel: 'Core Net Realisation Formula',
      formulaGross: 'Gross Sale Value',
      formulaTransport: 'Transport Cost',
      formulaStorage: 'Storage Cost',
      formulaOther: 'Other Costs (Cess & Labor)',
      formulaNet: 'NET REALISATION',
      explanation:
        'A distant market may quote ₹2,500/quintal while your local mandi quotes ₹2,200. But after accounting for ₹350/quintal in transport, loading, and transit spoilage, the distant market only yields ₹2,150! KisanSetu computes the true net take-home cash before you load your truck.',
      interactiveDemoTitle: 'Compare Net Realisation Across Maharashtra Markets',
    },
    valueProps: {
      title: 'Four Core Capabilities',
      subtitle: 'Built for rural usability, trust, and fair farm economics',
      p1Title: 'Market Intelligence',
      p1Desc:
        'Live modal prices, arrivals, and 7-day trend forecasts across Lasalgaon, Pune, Solapur, Vashi, and all Maharashtra APMCs.',
      p2Title: 'Net Realisation Engine',
      p2Desc:
        'Calculates real profit after factoring actual road distance, vehicle freight, warehouse fees, and mandi cess.',
      p3Title: 'Trust & Verification',
      p3Desc:
        'Strict role-based KYC, transaction-linked 3-way ratings, and physical quality verification by certified inspectors.',
      p4Title: 'Integrated Logistics',
      p4Desc:
        'Direct vehicle capacity matching for 1-tonne pickups to 10-tonne trucks with transparent route-based freight quotes.',
    },
    footer: {
      govtCredit:
        'Strengthening market linkages and price discovery for farmers | Government of Maharashtra',
      disclaimer:
        'Demo Architecture. Real-time Agmarknet & MSAMB API connectors will be integrated in subsequent phases.',
      phaseNotice: 'Phase 1 Foundation: Modular Monolith Architecture',
    },
    farmer: {
      badge: 'ROLE: FARMER / FPO',
      title: 'Farmer & FPO Management Hub',
      subtitle:
        'Manage your harvest lots, discover optimal selling markets through Net Realisation, and connect with verified buyers.',
      createLotCTA: 'Create Produce Lot',
      activeLotsCard: 'Active Lots',
      activeLotsSub: 'Lots listed in marketplace',
      incomingOffersCard: 'Incoming Offers',
      incomingOffersSub: 'Buyer bids received',
      fpoMembershipCard: 'FPO Membership',
      fpoMembershipSub: 'Aggregated Volume: 420 Tonnes',
      recentLotsTitle: 'Recent Produce Lots',
      viewAllLots: 'View All Lots',
      engineTitle: 'Net Realisation Decision Engine',
      engineDesc:
        "Don't just pick the highest nominal price. Compare Lasalgaon, Pune, Solapur, and direct buyer offers with net deductions.",
      engineAction: 'Run Realisation Comparison',
      qualityTitle: 'Two-Tier Quality Verification',
      qualityDesc:
        'Submit produce photos for AI visual screening, then request official physical inspection by MSAMB certified inspectors.',
      qualityAction: 'Quality Inspection Protocol',
      noticeTitle: 'Phase 2 Architecture Foundation',
      noticeDesc:
        'This route maps to FarmerProfile, FPO, ProduceLot, and Offer models in SQLite via Prisma Client with live persistence.',
    },
    lots: {
      badge: 'DIGITAL PRODUCE LOTS',
      title: 'Digital Produce Lots',
      subtitle:
        'Standardized digital commodity lots created by farmers and FPOs with quantity, expected price, and quality specifications.',
      createNew: 'Create Produce Lot',
      filterAll: 'All Lots',
      filterAvailable: 'Available / Listed',
      filterDraft: 'Drafts',
      filterReserved: 'Reserved',
      filterSold: 'Sold',
      emptyTitle: 'No Produce Lots Yet',
      emptyDesc: 'You have not created any produce lots yet. List your harvest to receive buyer offers and transport quotes.',
      createFirstLot: 'Create Your First Lot',
      loading: 'Loading produce lots...',
      lotId: 'Lot ID',
      crop: 'Commodity',
      variety: 'Variety',
      volume: 'Volume',
      targetPrice: 'Target Price',
      location: 'Location',
      status: 'Status',
      grade: 'Grade',
      actions: 'Actions',
      viewDetails: 'View Details',
      editLot: 'Edit Lot',
      calculateRealisation: 'Calculate Realisation',
      offersReceived: 'Offers Received',
      createModalTitle: 'Create New Produce Lot',
      createModalSubtitle: 'List your harvest with accurate details for verified buyers and transporters.',
      editModalTitle: 'Edit Produce Lot',
      cropLabel: 'Commodity / Crop',
      selectCrop: 'Select a crop',
      cropCustomPlaceholder: 'Or type custom crop name',
      varietyLabel: 'Variety / Cultivar',
      varietyPlaceholder: 'e.g. Nashik Red Garva, JS-335, Shirdi Safed',
      quantityLabel: 'Harvest Quantity',
      unitLabel: 'Unit',
      expectedPriceLabel: 'Expected Selling Price (₹)',
      expectedPricePerQtl: 'Expected Price per Quintal',
      expectedGradeLabel: 'Expected Quality Grade',
      gradeA: 'Grade A (Export / Premium Quality)',
      gradeB: 'Grade B (Standard Market Quality)',
      gradeC: 'Grade C (Fair Average Quality - FAQ)',
      gradeNotYet: 'Not Graded Yet (Pending Visual Screening)',
      harvestDateLabel: 'Harvest Date',
      availabilityDateLabel: 'Ready for Pickup Date',
      districtLabel: 'District',
      selectDistrict: 'Select Maharashtra District',
      locationLabel: 'Village / Taluka Address',
      locationPlaceholder: 'e.g. Niphad, Nashik or Farm Gat No. 42',
      descriptionLabel: 'Lot Notes / Storage Conditions',
      descriptionPlaceholder: 'e.g. Stored in ventilated kanda chawl, dry, sorting done.',
      saveDraftBtn: 'Save as Draft',
      publishBtn: 'Create & Publish Lot',
      updateBtn: 'Update Produce Lot',
      cancelBtn: 'Cancel',
      savingBtn: 'Saving Lot...',
      backToList: 'Back to All Lots',
      detailTitle: 'Produce Lot Specifications',
      specificationsTitle: 'Harvest & Commodity Specifications',
      futureOfferTitle: 'Buyer Offers & Bids',
      futureOfferDesc: 'Direct purchase bids from verified food processors, exporters, and wholesale buyers will appear here.',
      futureQualityTitle: 'Two-Tier Quality Assessment',
      futureQualityDesc: 'AI visual screening and official MSAMB physical inspection verification status.',
      futureLogisticsTitle: 'Integrated Logistics & Transport',
      futureLogisticsDesc: 'Request farmgate pickup with verified transporters, compare freight rates, and track transit.',
      futureNetTitle: 'Net Realisation Comparison',
      futureNetDesc: 'Calculate actual net earnings after deducting transport, storage, mandi cess, and handling costs.',
      futureEscrowTitle: 'Payment & Escrow Protection',
      futureEscrowDesc: 'Bank-grade transaction escrow ensuring farmers receive payment immediately upon buyer delivery confirmation.',
    },
    quality: {
      sectionTitle: 'Two-Tier Quality Verification',
      sectionSubtitle: 'Transparent produce grading separating AI visual estimates from certified physical inspection.',
      tier1Title: 'Tier 1: AI Visual Screening',
      tier1Subtitle: 'Preliminary visual screening based on crop photographs',
      tier1Badge: 'AI Assessment — Not Verified',
      tier1Disclaimer: 'Preliminary visual estimate only. Requires authorized physical verification for formal trade grading.',
      tier2Title: 'Tier 2: Physical Quality Verification',
      tier2Subtitle: 'Official trade grading conducted in-person by certified inspectors',
      tier2BadgePending: 'Physical Verification Pending',
      tier2BadgeVerified: 'Physically Verified',
      tier2BadgeRejected: 'Rejected',
      tier2BadgeReinspection: 'Requires Reinspection',
      requestAiAssessment: 'Request AI Assessment',
      aiModalTitle: 'Preliminary AI Visual Assessment',
      aiModalSubtitle: 'Input initial visual parameters. Results will be marked as "AI Assessment — Not Verified".',
      colorLabel: 'Color Consistency',
      colorPlaceholder: 'e.g. Deep Red, uniform coloration',
      visibleDamageLabel: 'Visible Surface Damage',
      visibleDamagePlaceholder: 'e.g. Minimal (< 2% skin peel)',
      sizeUniformityLabel: 'Size Uniformity (%)',
      visibleDefectsLabel: 'Visible Defects (%)',
      estimatedGradeLabel: 'Preliminary Grade Suggestion',
      assessmentNotesLabel: 'Assessment Notes / Observations',
      assessmentNotesPlaceholder: 'e.g. Bulb size consistent 55-65mm, dry skin, good neck firmness.',
      runAiAssessmentBtn: 'Record AI Assessment',
      runningAssessment: 'Recording Assessment...',
      inspectorDashboardTitle: 'Two-Tier Quality Inspection Desk',
      inspectorDashboardSubtitle: 'Authorized inspection management adhering to the Two-Tier Quality Principle.',
      pendingCard: 'Pending Inspections',
      verifiedCard: 'Physically Verified',
      reinspectionCard: 'Requires Reinspection',
      openInspection: 'Open Inspection',
      inspectionModalTitle: 'Official Physical Inspection Form',
      officialGrade: 'Official Verified Grade',
      moisturePercentage: 'Moisture Content (%)',
      foreignMatter: 'Foreign Matter (%)',
      inspectionLocation: 'Inspection Location',
      inspectionDate: 'Inspection Date',
      inspectionNotes: 'Inspector Remarks & Assaying Notes',
      verificationStatus: 'Verification Decision Status',
      submitVerification: 'Submit Official Verification',
      submittingVerification: 'Submitting Verification...',
      certificateNumber: 'Certificate Number',
      inspector: 'Certified Quality Inspector',
      verifiedAt: 'Certified Date',
      notAssessedYet: 'Not Assessed Yet',
      trustPrincipleTitle: 'Quality Principle: AI Screening vs. Physical Inspection',
      trustPrincipleDesc: 'KisanSetu strictly rejects the notion that an AI photo upload alone can declare an official crop trade grade. AI output is always marked "AI Assessment — Not Verified". Only physical inspection yields "Physically Verified".',
      photoEmptyPrompt: 'Add a produce photo to begin visual screening.',
      uploadPhotoBtn: 'Upload Photo',
      takePhotoBtn: 'Take Photo',
      changePhotoBtn: 'Change Photo',
      removePhotoBtn: 'Remove Photo',
      photoRequiredError: 'Please select or capture a produce photo before assessing quality.',
      invalidImageError: 'Please select a valid image file (JPG, PNG, WebP).',
      photoInputLabel: 'Upload produce photo from device',
      cameraInputLabel: 'Capture produce photo using camera',
      assessQualityBtn: 'Assess Quality',
      ruleBasedNotice: 'Preliminary visual screening checks surface color and uniformity. Physical assaying is required for official certification.',
    },
    buyerMatching: {
      matchedBuyersTitle: 'Matched Commercial Buyers',
      matchedBuyersSubtitle: 'Commercial buyers and processors actively seeking produce matching your crop, quantity, and grade.',
      noMatchesFound: 'No commercial buyers currently match this lot criteria.',
      matchScore: 'Match Score',
      breakdownTitle: 'Matching Breakdown',
      gapWarningsTitle: 'Criteria Gap / Considerations',
      buyerIdentityVerified: 'Verified Enterprise Entity',
      buyerIdentityUnverified: 'Unverified Entity',
      reputationLabel: 'Commercial Trade Reputation',
      completedTrades: 'Completed Trades',
      punctuality: 'Payment Punctuality',
      viewDemandBtn: 'View Buyer Demand',
      incomingOffersTitle: 'Incoming Digital Offers',
      incomingOffersSubtitle: 'Direct binding offers received from commercial buyers. Review, accept to reserve lot, or reject.',
      noOffersReceived: 'No offers received for this lot yet.',
      offerFrom: 'Buyer Enterprise',
      offeredPrice: 'Offered Price',
      offeredQuantity: 'Offered Quantity',
      totalOfferValue: 'Total Offer Value',
      paymentTerms: 'Payment Terms',
      deliveryTerms: 'Delivery Terms',
      validUntil: 'Offer Expiry',
      acceptOfferBtn: 'Accept Offer',
      rejectOfferBtn: 'Reject Offer',
      acceptSuccess: 'Offer accepted successfully! Lot is now RESERVED.',
      rejectSuccess: 'Offer rejected.',
      confirmAccept: 'Are you sure you want to ACCEPT this offer? The lot status will be set to RESERVED.',
      confirmReject: 'Are you sure you want to REJECT this offer?',
      lotReservedNotice: 'This lot is currently RESERVED for an accepted buyer offer.',
      statusPending: 'Pending Review',
      statusAccepted: 'Accepted',
      statusRejected: 'Rejected',
      statusCancelled: 'Cancelled',
      statusExpired: 'Expired',
      hubTitle: 'Commercial Buyer Procurement Hub',
      hubSubtitle: 'Post crop demands, discover certified farmer lots with verified quality, and dispatch digital offers.',
      demoBuyerSelector: 'Switch Active Demo Buyer Enterprise',
      activeBuyerProfile: 'Active Procurement Profile',
      switchBuyer: 'Switch Enterprise',
      verifiedCredentials: 'Verified Business Entity',
      unverifiedCredentials: 'Unverified Business Entity',
      credentialDetails: 'Govt Registration, GSTIN & Mandi Trade License Verified',
      reputationMetrics: 'Commercial Trade Performance',
      rating: 'Buyer Rating',
      tradesCompleted: 'Completed Trades',
      paymentPunctualityScore: 'Payment Punctuality',
      tabActiveDemands: 'Active Demands',
      tabCreateDemand: 'Post New Demand',
      tabBrowseLots: 'Browse Matching Lots',
      tabMyOffers: 'Offers Sent',
      createDemandTitle: 'Post Procurement Demand',
      createDemandSubtitle: 'Specify crop requirements, target grade, and delivery timeline to match with farmer lots.',
      commodityLabel: 'Commodity / Crop',
      commodityPlaceholder: 'e.g. Onion, Soybean, Wheat',
      quantityLabel: 'Required Quantity',
      unitLabel: 'Unit',
      requiredGradeLabel: 'Required Grade',
      locationLabel: 'Procurement Location / District',
      locationPlaceholder: 'e.g. Nashik, Pune, Aurangabad',
      deliveryLocationLabel: 'Delivery Destination Warehouse',
      deliveryLocationPlaceholder: 'e.g. Chakan Processing Unit, Pune',
      minPriceLabel: 'Min Target Price (₹/Qtl)',
      maxPriceLabel: 'Max Target Price (₹/Qtl)',
      deadlineLabel: 'Delivery Deadline',
      descriptionLabel: 'Procurement Specifications / Notes',
      descriptionPlaceholder: 'e.g. Required moisture < 12%, double-bag packaging preferred.',
      submitDemandBtn: 'Publish Procurement Demand',
      submittingDemand: 'Publishing Demand...',
      demandCreatedSuccess: 'Procurement demand published successfully!',
      demandsCount: 'Active Demands',
      noActiveDemands: 'No active procurement demands posted yet.',
      viewMatchesBtn: 'View Matching Lots',
      priceRange: 'Acceptable Price Range',
      deadline: 'Delivery Deadline',
      browseLotsTitle: 'Available Farmer Produce Lots',
      browseLotsSubtitle: 'Real farmer produce lots evaluated by the KisanSetu matching engine with two-tier quality badges.',
      noMatchingLots: 'No matching farmer lots found for the selected demand.',
      matchStrength: 'Match Strength',
      farmerLotId: 'Farmer Lot ID',
      expectedPrice: 'Farmer Ask Price',
      makeOfferBtn: 'Make Digital Offer',
      filterByDemand: 'Filter by Posted Demand',
      allDemands: 'All Active Demands',
      makeOfferTitle: 'Dispatch Digital Purchase Offer',
      makeOfferSubtitle: 'Send a formal binding offer to the farmer. The offer remains PENDING until farmer acceptance.',
      offerPriceLabel: 'Offered Price (₹/Qtl)',
      offerQtyLabel: 'Offered Quantity (Quintals)',
      deliveryTermsLabel: 'Delivery / Logistics Terms',
      deliveryTermsPlaceholder: 'e.g. Farmgate pickup arranged by buyer / Mandi delivery',
      paymentTermsLabel: 'Payment Terms',
      paymentTermsPlaceholder: 'e.g. Bank escrow release within 24h of physical receipt',
      expiryDateLabel: 'Offer Validity Expiry Date',
      offerNotesLabel: 'Additional Offer Terms / Notes',
      offerNotesPlaceholder: 'e.g. Subject to physical quality certificate matching specifications.',
      submitOfferBtn: 'Dispatch Binding Offer',
      submittingOffer: 'Dispatching Offer...',
      offerCreatedSuccess: 'Offer dispatched successfully to farmer!',
      offerPendingNotice: 'Offer is PENDING farmer review. The lot will be marked RESERVED once accepted.',
      myOffersTitle: 'Dispatched Offers & Contracts',
      myOffersSubtitle: 'Track status of digital offers sent to farmers and manage pending bids.',
      noSentOffers: 'No offers dispatched by this enterprise yet.',
      cancelOfferBtn: 'Cancel Offer',
      cancelSuccess: 'Offer cancelled successfully.',
      confirmCancel: 'Are you sure you want to cancel this pending offer?',
      trustNoticeTitle: 'KisanSetu Transparency & Trust Architecture',
      trustNoticeDesc: 'Credential verification (GSTIN / APMC compliance) and commercial trade performance are kept strictly independent. Real inspection certificates are verified independently from AI screening.',
      demoNotice: 'DEMO NOTICE: Buyer profiles and offers are simulated demonstrations for agricultural market linkages.',
    },
    transport: {
      hubTitle: 'Transporter Logistics & Dispatch Hub',
      hubSubtitle: 'Manage commercial transport fleet, review farm-gate dispatch requests, and update transit delivery milestones across Maharashtra.',
      roleBadge: 'ROLE: TRANSPORTER LOGISTICS',
      logisticsNetworkTitle: 'Transporter Logistics Network',
      logisticsNetworkDesc: 'Connecting farm-gate produce lots to terminal mandis and food processors with transparent per-km freight rates.',
      demoTransporterSelector: 'Switch Demo Transporter',
      activeTransporterProfile: 'Active Transporter Profile',
      switchTransporter: 'Switch Transporter',
      verifiedPermit: 'RTO Commercial Permit Verified',
      unverifiedPermit: 'Verification Pending',
      operationalDistrictsLabel: 'Operational Districts',
      fleetRating: 'Rating Score',
      tripsCompleted: 'Completed Dispatches',
      onTimeRate: 'On-Time Delivery',
      tabFleet: 'Fleet Vehicles',
      tabRequests: 'Incoming Requests',
      tabDispatches: 'Dispatch Tracking',
      registerVehicleBtn: 'Add Fleet Vehicle',
      fleetOverviewTitle: 'Fleet Capacity & Freight Rates',
      fleetOverviewSubtitle: 'Active transport vehicles registered for agricultural produce transport.',
      vehicleTypeLabel: 'Vehicle Model',
      vehicleRegLabel: 'Registration Number',
      capacityLabel: 'Carrying Capacity',
      ratePerKmLabel: 'Base Rate / km',
      coldChainLabel: 'Cold Chain Body',
      availableBadge: 'Available',
      busyBadge: 'On Route',
      refrigeratedBadge: 'Reefer / Cold Chain',
      standardBadge: 'Open / Covered Cargo',
      incomingRequestsTitle: 'Incoming Farm Dispatch Requests',
      incomingRequestsSubtitle: 'Farm-gate pickup and mandi delivery requests initiated by farmers and FPOs.',
      noRequestsReceived: 'No pending transport requests received yet.',
      lotDetailsLabel: 'Produce Lot',
      pickupLocationLabel: 'Pickup Point',
      dropLocationLabel: 'Delivery Destination',
      distanceLabel: 'Corridor Distance',
      tripsLabel: 'Required Trips',
      estimatedEarnings: 'Estimated Freight',
      costPerQtlLabel: 'Freight / Quintal',
      scheduledPickupLabel: 'Scheduled Pickup',
      actualDeliveryLabel: 'Delivered At',
      statusRequested: 'Dispatch Requested',
      statusAccepted: 'Request Accepted',
      statusRejected: 'Declined',
      statusInTransit: 'In Transit',
      statusDelivered: 'Delivered',
      statusCancelled: 'Cancelled',
      acceptRequestBtn: 'Accept Dispatch',
      declineRequestBtn: 'Decline',
      markInTransitBtn: 'Mark In-Transit',
      markDeliveredBtn: 'Mark Delivered',
      activeDispatchesTitle: 'Active & Completed Shipments',
      activeDispatchesSubtitle: 'Track transit milestones and delivery completion.',
      noDispatchesFound: 'No shipments currently active or completed.',
      formulaTitle: 'Transparent Cost Formula',
      formulaText: 'Trips = ⌈Lot Qty / Capacity⌉ • Estimated Cost = Trips × Distance (km) × Rate/km',
      netRealisationNote: 'Feeds deterministic transport cost directly into Phase 6 Net Realisation: Net Realisation = Gross Sale Value - Transport Cost - Storage Cost - Mandi Charges.',
      lotTransportTitle: 'Transport & Logistics Management',
      lotTransportSubtitle: 'Book verified agricultural freight carriers with transparent per-kilometer rates calculated for this lot.',
      findTransportersBtn: 'Calculate Transport Options',
      destinationLabel: 'Delivery Destination APMC / Mandi',
      destinationPlaceholder: 'e.g. Pune Market Yard, Vashi APMC',
      preferColdChainLabel: 'Require Temperature-Controlled Cold Chain',
      matchingTransportersTitle: 'Available Transporter Quotes & Capacities',
      noTransportersAvailable: 'No matching transporters available for this route.',
      costEquationLabel: 'Transparent Cost Equation',
      bookTransportBtn: 'Request Transport Dispatch',
      bookingModalTitle: 'Book Transport Dispatch',
      bookingModalSubtitle: 'Confirm pickup schedule and delivery details with selected carrier.',
      scheduledDateLabel: 'Scheduled Pickup Date',
      transportNotesLabel: 'Handling Instructions / Landmark Notes',
      transportNotesPlaceholder: 'e.g. Near village school, pack in breathable crates',
      confirmBookingBtn: 'Confirm & Send Request',
      bookingSuccess: 'Transport request sent successfully to carrier!',
      activeBookingsTitle: 'Transport Bookings for this Lot',
      noBookingsYet: 'No transport booked yet. Select an option below to request dispatch.',
      demoNotice: 'DEMO NOTICE: Logistics simulation for agricultural corridors. Does not initiate real vehicular dispatch or payment processing.',
    },
    netRealisation: {
      hubTitle: 'Net Realisation & Smart Selling Recommendation',
      hubSubtitle: 'Calculate true farm take-home cash after transparent transport, storage, and handling deductions.',
      netRealisation: 'Net Realisation',
      grossSaleValue: 'Gross Sale Value',
      transportCost: 'Transport Freight Deduction',
      storageCost: 'Warehouse Storage Cost',
      otherCosts: 'Mandi Cess & Handling Charges',
      netPerQuintal: 'Net Realisation / Quintal',
      bestSellingOption: 'Optimal Selling Opportunity',
      sellNow: 'Sell Now',
      storeAndSellLater: 'Store & Sell Later',
      waitAndWatch: 'Wait & Watch Market',
      estimatedLabel: 'Estimated / Non-Guaranteed',
      notGuaranteed: 'Estimated — Market Fluctuation Subject',
      whyThisRecommendation: 'Why this recommendation?',
      howIsThisCalculated: 'How is Net Realisation calculated?',
      compareSellingOptions: 'Compare Selling Channels',
      currentPrice: 'Current Selling Price',
      expectedFuturePrice: 'Projected Future Price',
      potentialImprovement: 'Potential Price Improvement',
      reliability: 'Commercial Trust & Credibility',
      assumptions: 'Economic & Operational Assumptions',
      demoData: 'Sample APMC Mandi Data',
      estimatedData: 'Projected Seasonal Model',
      insufficientData: 'Insufficient market data for recommendation.',
      holdingDaysLabel: 'Holding Period (Days)',
      tableOption: 'Channel / Destination',
      tableGross: 'Gross / Qtl',
      tableTransport: 'Transport / Qtl',
      tableStorage: 'Storage / Qtl',
      tableOther: 'Other / Qtl',
      tableNet: 'Net Realisation / Qtl',
      tableAction: 'Status / Action',
      formulaTitle: 'KisanSetu Deterministic Realisation Formula',
      formulaGrossText: 'Gross Sale Value = Harvest Quantity (Qtl) × Agreed Sale Price (₹/Qtl)',
      formulaTransportText: 'Transport Cost = Trips × Distance (km) × Rate per km (₹/km)',
      formulaStorageText: 'Storage Cost = (Monthly Rate / 30) × Holding Days × Quantity (Qtl)',
      formulaNetText: 'Net Realisation = Gross Value − Transport − Storage − Statutory Mandi Deductions',
      dashboardCardTitle: 'Best Net Realisation',
      dashboardCardSub: 'Optimal Net Take-Home Opportunity',
      viewAnalysisBtn: 'View Net Realisation Analysis',
      noOptionsAvailable: 'No selling channels evaluated yet.',
      mandiYardLabel: 'APMC Regulated Mandi',
      directBuyerLabel: 'Direct Commercial Buyer',
      storageProjectionLabel: 'Warehouse Storage Projection',
    },
    transactions: {
      hubTitle: 'Transactions, Escrow & Trade Fulfillment',
      hubSubtitle: 'Milestone-tracked digital trade execution, demo payment status, and verified 3-way ratings.',
      myTransactionsTitle: 'My Commercial Transactions',
      myTransactionsSubtitle: 'Track trade agreements, logistics dispatch, payment status, and counterparty reputation.',
      transactionCode: 'Transaction ID',
      commercialAgreement: 'Commercial Trade Agreement',
      paymentTracking: 'Payment Tracking',
      paymentStatus: 'Payment Status',
      paymentInitiated: 'Payment Initiated',
      paymentProcessing: 'Payment Processing',
      paymentReceived: 'Payment Received',
      paymentPaid: 'Paid (Settled)',
      markPaymentReceivedBtn: 'Mark Payment Received (Demo)',
      completed: 'Completed',
      transportStatus: 'Logistics Status',
      deliveryLocation: 'Delivery Location',
      qualityStatus: 'Produce Quality Status',
      physicallyVerified: 'Physically Verified by Authorized Inspector',
      aiVisualScreening: 'AI Assessment — Not Verified',
      agreedPricePerQtl: 'Agreed Price / Quintal',
      grossContractValue: 'Gross Contract Value',
      netRealisation: 'Net Realisation',
      takeHomeEstimate: 'Farmer Net Take-Home',
      threeWayRatings: 'Transaction-Linked 3-Way Ratings',
      rateThisTransaction: 'Rate this Trade',
      ratingSubmitted: 'Rating Submitted Successfully',
      submitRatingBtn: 'Submit Verified Rating',
      ratingFeedbackPlaceholder: 'Share operational feedback (punctuality, quality match, promptness)...',
      disputeGrievance: 'Dispute & Grievance Redressal',
      raiseDisputeBtn: 'Raise Trade Dispute',
      viewTransactionBtn: 'View Transaction Journey',
      filterAll: 'All Transactions',
      filterActive: 'Active Dispatches',
      filterCompleted: 'Settled & Completed',
      filterDisputed: 'Under Dispute',
      noTransactionsFound: 'No commercial transactions found.',
      timelineTitle: 'Trade Fulfillment Lifecycle',
      prototypeNotice: 'Payment tracking demonstration — no real banking funds transferred.',
      reputationVsVerificationNote: 'Government/Regulatory Verification is independent of Commercial Ratings.',
      buyerLabel: 'Buyer / Processor',
      farmerLabel: 'Farmer / FPO Producer',
      transporterLabel: 'Commercial Transporter',
    },
    disputes: {
      hubTitle: 'Evidence-Based Dispute Redressal',
      hubSubtitle: 'Transparent grievance resolution conducted by human FPO/APMC administrators using recorded digital evidence.',
      raiseGrievanceTitle: 'Register Trade Grievance',
      disputeCode: 'Dispute ID',
      categoryLabel: 'Grievance Category',
      descriptionLabel: 'Detailed Description & Discrepancy',
      descriptionPlaceholder: 'Detail specific issues regarding weight, grade mismatch, delivery delay, or payment...',
      submitGrievanceBtn: 'Submit Grievance to APMC/FPO Officer',
      statusOpen: 'Open (Pending Review)',
      statusUnderReview: 'Under Review by Grievance Officer',
      statusResolved: 'Resolved',
      statusRejected: 'Rejected',
      statusClosed: 'Closed',
      categoryQualityMismatch: 'Quality & Grade Discrepancy',
      categoryDeliveryDelay: 'Logistics / Delivery Delay',
      categoryPaymentDelay: 'Payment Settlement Delay',
      categoryWeightDiscrepancy: 'Weight & Weighbridge Discrepancy',
      categoryPriceDisagreement: 'Agreed Price Disagreement',
      categoryCancellation: 'Unilateral Deal Cancellation',
      categoryOther: 'Other Grievance',
      evidenceChecklistTitle: 'Required Adjudication Evidence',
      humanAdjudicationNote: 'AI is never permitted to unilaterally decide trade disputes. Human administrative review is mandatory.',
      adminPanelTitle: 'State Agriculture Dispute Adjudication Portal',
      resolutionNotesLabel: 'Official Adjudication & Resolution Notes',
      resolutionNotesPlaceholder: 'Enter findings from weighbridge receipts, inspection certificate, and agreement terms...',
      markUnderReviewBtn: 'Mark Under Review',
      resolveDisputeBtn: 'Resolve & Settle Dispute',
      closeDisputeBtn: 'Close Grievance',
      grievanceRecordedNotice: 'Your grievance has been formally registered with digital transaction evidence.',
      noDisputesFound: 'No active grievances recorded.',
    },
    calculator: {
      title: 'Net Realisation Discovery Engine',
      subtitle: "Don't just chase the highest gross price. Factor transport, storage, and market cess to calculate true net farm take-home cash.",
      badge: 'CORE USP ENGINE',
      parametersCardTitle: 'Crop & Harvest Parameters',
      parametersCardSub: 'Enter the lot details for Net Realisation calculation.',
      selectCropLabel: 'Select Crop (22 Supported Varieties)',
      harvestQtyLabel: 'Harvest Quantity',
      sellingPriceLabel: 'Quoted Selling Price (per Quintal)',
      distanceLabel: 'Distance to Market / Buyer',
      storageDurationLabel: 'Storage Duration (Warehouse / Cold Storage)',
      daysUnit: 'Days',
      quintalsUnit: 'Quintals',
      perQtlUnit: '/ Qtl',
      resultTitle: 'Calculated Net Realisation',
      takeHomeLabel: 'Effective Take-Home',
      perQuintal: '/ Quintal',
      grossSaleValue: 'Gross Sale Value',
      transportFreight: 'Transport Freight',
      storageCost: 'Storage Cost',
      mandiCessHandling: 'Mandi Cess & Labor Handling',
      totalDeductions: 'Total Deductions',
      formulaTitle: 'Net Realisation Formula',
      formulaText: 'NET REALISATION = Gross Sale Value - Transport Cost - Storage Cost - Other Applicable Costs',
      loadedFromMarket: 'Loaded parameters from market',
      resetDefaults: 'Reset Defaults',
    },
    markets: {
      title: 'Mandi Prices & Arrival Volumes',
      subtitle: 'Daily commodity modal prices, price bands, and arrival tracking across Maharashtra & Andhra Pradesh (Vizag Region) APMC mandis.',
      badge: 'APMC MARKET INTELLIGENCE',
      dataNoticeTitle: 'Architectural Principle: Data Transparency',
      dataNoticeDesc: 'The prices below represent clearly separated demo market data for Maharashtra & Andhra Pradesh APMCs. Live Agmarknet / eNAM and MSAMB feeds will integrate without changing core logic. We never present prototype data as real-time certified feeds.',
      tableTitle: 'Regional APMC Daily Price Snapshot',
      tableSub: 'Comparing modal prices per quintal and total daily arrivals across Maharashtra and Andhra Pradesh (Vizag Coastal Region).',
      colMarket: 'Market / Mandi',
      colCommodity: 'Commodity',
      colPriceRange: 'Min - Max Price',
      colModalPrice: 'Modal Price',
      colArrivals: 'Arrivals',
      colAction: 'Action',
      netProfitCheck: 'Net Profit Check',
      tonnes: 'Tonnes',
      dist: 'Dist.',
      calculateNetRealisation: 'Calculate Net Realisation',
      archTitle: 'Phase 1 Architecture Foundation',
      archDesc: 'This data links to the Market, MarketPrice, and MarketArrival tables in the database schema.',
    },
    voice: {
      buttonLabel: 'Speak',
      buttonHint: 'Tap the microphone and speak',
      listening: 'Listening...',
      stop: 'Stop',
      cancel: 'Cancel',
      clear: 'Clear',
      readAloud: 'Read Aloud',
      notSupported: 'Speech recognition is not supported in this browser. Please use the quick question buttons below.',
      permissionDenied: 'Microphone permission was denied. Please allow microphone access or use the quick buttons below.',
      youSaid: 'You asked:',
      intentTitle: 'Recognized Intent:',
      fallbackResponse: "I couldn't understand that. Try asking about market prices, buyers, transport, or net realisation.",
      suggestionTitle: 'Suggested Voice Queries:',
      safetyNotice: 'Voice Assistant: purely informational and navigational. No financial transactions or automatic commitments are executed by voice.',
      queryPrice: "What is today's onion price?",
      queryBuyers: 'Find buyers for my 10 quintals of onion.',
      queryProfit: 'Which option gives me more money?',
      queryTransport: 'Find transport for my lot.',
      queryOffers: 'Show my offers.',
      queryTxns: 'Show my transactions.',
    },
  },

  mr: {
    brand: {
      name: 'किसानसेतू',
      tagline: 'योग्य बाजार. योग्य खरेदीदार. योग्य भाव.',
      subtagline: 'स्मार्ट कृषी बाजार जोडणी आणि निव्वळ परतावा प्लॅटफॉर्म',
      sihBadge: 'महाराष्ट्र शासन • कृषी पणन उपक्रम',
    },
    nav: {
      home: 'मुख्यपृष्ठ',
      farmer: 'शेतकरी / FPO',
      buyer: 'खरेदीदार',
      transporter: 'वाहतूकदार',
      markets: 'बाजार भाव माहिती',
      calculator: 'निव्वळ परतावा',
      getStarted: 'सुरू करा',
      lots: 'माझे लॉट्स',
      transactions: 'व्यवहार',
      more: 'अधिक',
      speak: 'बोला',
      inspector: 'गुणवत्ता निरीक्षक',
      disputes: 'तक्रारी व वाद',
      admin: 'राज्य प्रशासन',
    },
    hero: {
      badge: 'महाराष्ट्र आणि किनारी कृषी बाजार जोडणी',
      titleMain: 'केवळ सर्वात जास्त भाव शोधू नका.',
      titleHighlight: 'सर्वात विश्वासार्ह निव्वळ नफा (Net Realisation) शोधा.',
      tagline: 'योग्य बाजार. योग्य खरेदीदार. योग्य भाव.',
      descriptor: 'शेतकऱ्यांसाठी स्मार्ट बाजार जोडणी व निव्वळ नफा मंच.',
      coreUsp: 'केवळ जास्त भाव शोधू नका. सर्वाधिक विश्वासार्ह निव्वळ नफा मिळवा.',
      description:
        'किसानसेतू महाराष्ट्रातील शेतकरी व एफपीओंना विश्वासू खरेदीदार आणि वाहतूकदारांशी जोडते. बाजार भावांची तुलना करा, वाहतूक आणि साठवणूक खर्च वजा करा आणि खरा नफा मिळवा.',
      ctaPrimary: 'सुरू करा',
      ctaSecondary: 'बाजार भाव पहा',
      exploreMarket: 'बाजार भाव पहा',
      createProduceLot: 'शेतीमाल नोंदवा',
      findBuyers: 'खरेदीदार शोधा',
      viewDemo: 'डेमो पहा',
      statsFarmers: '५,०००+ शेतकरी व FPO',
      statsMandis: '३००+ कृषी उत्पन्न बाजार समित्या',
      statsBuyers: '१,२००+ पडताळणी झालेले खरेदीदार',
    },
    ecosystem: {
      title: 'कृषी पुरवठा साखळीचे मुख्य स्तंभ',
      subtitle: 'ग्रामीण बाजारपेठेतील प्रत्येक घटकाला सशक्त करणे',
      farmerTitle: 'शेतकरी आणि FPO',
      farmerDesc:
        'आपल्या शेतीमालाची नोंदणी करा, डिजिटल गुणवत्ता तपासणी करा आणि योग्य भावाच्या खरेदीदार ऑफर्स मिळवा.',
      farmerAction: 'शेतकरी केंद्र',
      buyerTitle: 'पडताळणी झालेले खरेदीदार',
      buyerDesc:
        'महाराष्ट्रातील थेट शेतातून दर्जेदार शेतीमाल खरेदी करा, मध्यस्थांशिवाय पारदर्शक व्यवहार करा.',
      buyerAction: 'शेतीमाल लॉट्स पहा',
      transporterTitle: 'वाहतूकदार आणि मालवाहतूक',
      transporterDesc:
        'थेट शेतातून वाहतुकीचे काम मिळवा, रिकाम्या परतीचा खर्च वाचवा आणि त्वरित भाडे मिळवा.',
      transporterAction: 'वाहतूक केंद्र',
      flowTitle: 'किसानसेतू संपूर्ण व्यापार चक्र',
      flowSubtitle: 'मध्यस्थांशिवाय प्रत्येक टप्प्यावर पारदर्शकता आणि सुरक्षितता',
      stepFarmer: 'शेतकरी / FPO',
      stepMarket: 'बाजार भाव माहिती',
      stepQuality: 'गुणवत्ता पडताळणी',
      stepMatching: 'खरेदीदार मॅचिंग',
      stepTransport: 'वाहतूक व्यवस्था',
      stepNetRealisation: 'निव्वळ नफा',
      stepTransaction: 'व्यापार करार',
      stepTrust: 'विश्वास व निवारण',
    },
    usp: {
      title: 'किसानसेतूचा मुख्य यूएसपी (USP)',
      subtitle: 'वाहतूक व साठवणूक खर्चाशिवाय केवळ बाजार भाव पाहणे कसे तोट्याचे ठरते?',
      formulaLabel: 'निव्वळ परताव्याचे सूत्र (Net Realisation)',
      formulaGross: 'एकूण विक्री मूल्य',
      formulaTransport: 'वाहतूक खर्च',
      formulaStorage: 'साठवणूक खर्च',
      formulaOther: 'इतर खर्च (सेस आणि हमाली)',
      formulaNet: 'शेतकऱ्याचा निव्वळ नफा',
      explanation:
        'दूरच्या बाजारात कांद्याला २५०० रुपये भाव दिसत असला आणि स्थानिक बाजारात २२०० असला, तरी ३५० रुपये वाहतूक व हमाली गेल्यानंतर दूरच्या बाजारात केवळ २१५० च उरतात! किसानसेतू प्रत्यक्ष निव्वळ नफा मोजून देतो.',
      interactiveDemoTitle: 'महाराष्ट्रातील विविध बाजारांचा निव्वळ नफा तपासा',
    },
    valueProps: {
      title: 'चार प्रमुख वैशिष्ट्ये',
      subtitle: 'शेतकऱ्यांच्या सोयीसाठी आणि पारदर्शक व्यवहारासाठी विकसित',
      p1Title: 'बाजार भाव माहिती',
      p1Desc:
        'लासलगाव, पुणे, सोलापूर, वाशी आणि महाराष्ट्रातील सर्व एपीएमसींचे थेट भाव, आवक आणि बाजार ट्रेंड.',
      p2Title: 'निव्वळ परतावा कॅल्क्युलेटर',
      p2Desc:
        'प्रत्यक्ष अंतर, वाहनाचे भाडे, साठवणूक दर आणि बाजार सेस हिशोबात घेऊन खरा नफा दाखवतो.',
      p3Title: 'विश्वास आणि पडताळणी',
      p3Desc:
        'केवायसी पडताळणी, व्यवहारांशी जोडलेले त्रिपक्षीय रेटिंग आणि अधिकृत गुणवत्ता तपासणी.',
      p4Title: 'एकात्मिक वाहतूक व्यवस्था',
      p4Desc:
        '१ टन पिकअपपासून १० टन ट्रॅकपर्यंत वाहने त्वरित बुक करा, पारदर्शक भाडे दरासह.',
    },
    footer: {
      govtCredit:
        'शेतकऱ्यांसाठी बाजार जोडणी आणि भाव शोध प्रणाली मजबूत करणे | महाराष्ट्र शासन',
      disclaimer:
        'प्रोटोटाइप मॉडेल. पुढील टप्प्यामध्ये थेट ॲगमार्कनेट व एमएसएएमबी एपीआय जोडले जातील.',
      phaseNotice: 'टप्पा १ पायाभूत रचना: मॉड्युलर मोनोलिथ आर्किटेक्चर',
    },
    farmer: {
      badge: 'भूमिका: शेतकरी / FPO',
      title: 'शेतकरी आणि FPO व्यवस्थापन केंद्र',
      subtitle:
        'आपल्या काढणी लॉट्सचे व्यवस्थापन करा, निव्वळ परताव्याद्वारे योग्य बाजार शोधा आणि थेट प्रमाणित खरेदीदारांशी जोडा.',
      createLotCTA: 'नवीन शेतमाल लॉट तयार करा',
      activeLotsCard: 'सक्रिय लॉट्स',
      activeLotsSub: 'बाजारात विक्रीसाठी उपलब्ध',
      incomingOffersCard: 'आलेले ऑफर्स',
      incomingOffersSub: 'खरेदीदारांच्या बोली',
      fpoMembershipCard: 'एफपीओ सदस्यता',
      fpoMembershipSub: 'एकत्रित प्रमाण: ४२० टन',
      recentLotsTitle: 'नुकतेच जोडलेले शेतमाल लॉट्स',
      viewAllLots: 'सर्व लॉट्स पहा',
      engineTitle: 'निव्वळ परतावा निर्णय इंजिन',
      engineDesc:
        'केवळ सर्वाधिक भाव पाहू नका. लासलगाव, पुणे, सोलापूर आणि थेट खरेदीदारांच्या भावातून वाहतूक व सेस वजा करून खरा नफा तपासा.',
      engineAction: 'निव्वळ परतावा तुलना करा',
      qualityTitle: 'द्वि-स्तरीय गुणवत्ता पडताळणी',
      qualityDesc:
        'एआय व्हिज्युअल स्क्रिनिंगसाठी शेतमालाचे फोटो पाठवा आणि एमएसएएमबी प्रमाणित निरीक्षकांकडून प्रत्यक्ष तपासणी मिळवा.',
      qualityAction: 'गुणवत्ता तपासणी प्रोटोकॉल',
      noticeTitle: 'टप्पा २ पायाभूत रचना',
      noticeDesc:
        'हा मार्ग थेट SQLite डेटाबेस मधील FarmerProfile, FPO, ProduceLot आणि Offer मॉडेल्सशी जोडलेला आहे.',
    },
    lots: {
      badge: 'डिजिटल शेतमाल लॉट्स',
      title: 'डिजिटल शेतमाल लॉट्स',
      subtitle:
        'शेतकरी आणि FPO द्वारे वजन, अपेक्षित भाव आणि दर्जा तपशीलांसह तयार केलेले प्रमाणीकृत डिजिटल लॉट्स.',
      createNew: 'नवीन लॉट तयार करा',
      filterAll: 'सर्व लॉट्स',
      filterAvailable: 'उपलब्ध / सूचीबद्ध',
      filterDraft: 'मसुदा (Draft)',
      filterReserved: 'आरक्षित',
      filterSold: 'विक्री पूर्ण',
      emptyTitle: 'अद्याप कोणतेही शेतमाल लॉट्स नाहीत',
      emptyDesc: 'तुम्ही अजून कोणताही शेतमाल लॉट तयार केलेला नाही. खरेदीदार ऑफर्स व वाहतूक दर मिळवण्यासाठी शेतमालाची नोंद करा.',
      createFirstLot: 'तुमचा पहिला लॉट तयार करा',
      loading: 'शेतमाल लॉट्स लोड होत आहेत...',
      lotId: 'लॉट आयडी',
      crop: 'शेतमाल / पीक',
      variety: 'वाण / जात',
      volume: 'परिमाण (वजन)',
      targetPrice: 'अपेक्षित भाव',
      location: 'स्थान / पत्ता',
      status: 'स्थिती',
      grade: 'दर्जा',
      actions: 'कृती',
      viewDetails: 'तपशील पहा',
      editLot: 'बदल करा',
      calculateRealisation: 'निव्वळ नफा काढा',
      offersReceived: 'प्राप्त ऑफर्स',
      createModalTitle: 'नवीन शेतमाल लॉट तयार करा',
      createModalSubtitle: 'प्रमाणित खरेदीदार आणि वाहतूकदारांसाठी आपल्या पिकाची अचूक माहिती भरा.',
      editModalTitle: 'शेतमाल लॉट संपादित करा',
      cropLabel: 'शेतमाल / पीक निवडा',
      selectCrop: 'पीक निवडा',
      cropCustomPlaceholder: 'किंवा इतर पिकाचे नाव लिहा',
      varietyLabel: 'वाण / जात',
      varietyPlaceholder: 'उदा. नाशिक लाल गरवा, जेएस-३३५, शिर्डी सफेद',
      quantityLabel: 'उत्पादन परिमाण (वजन)',
      unitLabel: 'एकक',
      expectedPriceLabel: 'अपेक्षित विक्री भाव (₹)',
      expectedPricePerQtl: 'अपेक्षित भाव प्रति क्विंटल',
      expectedGradeLabel: 'अपेक्षित गुणवत्ता दर्जा',
      gradeA: 'ग्रेड A (उत्कृष्ट / निर्यात दर्जा)',
      gradeB: 'ग्रेड B (मानक बाजार दर्जा)',
      gradeC: 'ग्रेड C (सामान्य सरासरी दर्जा - FAQ)',
      gradeNotYet: 'अद्याप दर्जा निश्चित नाही (तपासणी प्रलंबित)',
      harvestDateLabel: 'काढणीची तारीख',
      availabilityDateLabel: 'उचल / विक्रीसाठी उपलब्ध तारीख',
      districtLabel: 'जिल्हा',
      selectDistrict: 'महाराष्ट्रातील जिल्हा निवडा',
      locationLabel: 'गाव / शेताचा पत्ता',
      locationPlaceholder: 'उदा. निफाड, नाशिक किंवा शेत गट क्र. ४२',
      descriptionLabel: 'साठवणूक पद्धत / टीप',
      descriptionPlaceholder: 'उदा. हवेशीर कांदा चाळीत साठवलेला, कोरडा, प्रतवारी पूर्ण.',
      saveDraftBtn: 'मसुदा म्हणून जतन करा (Draft)',
      publishBtn: 'लॉट तयार करून प्रकाशित करा',
      updateBtn: 'माहिती अद्यतनित करा',
      cancelBtn: 'रद्द करा',
      savingBtn: 'जतन होत आहे...',
      backToList: 'मागे सर्व लॉट्सकडे जा',
      detailTitle: 'शेतमाल लॉट तपशील',
      specificationsTitle: 'काढणी व शेतमाल वैशिष्ट्ये',
      futureOfferTitle: 'खरेदीदार ऑफर्स व बोली',
      futureOfferDesc: 'प्रमाणित अन्न प्रक्रिया उद्योग, निर्यातदार व घाऊक व्यापाऱ्यांच्या थेट बोली येथे दिसतील.',
      futureQualityTitle: 'द्वि-स्तरीय गुणवत्ता मूल्यांकन',
      futureQualityDesc: 'एआय व्हिज्युअल स्क्रिनिंग आणि एमएसएएमबी अधिकृत प्रत्यक्ष गुणवत्ता तपासणी स्थिती.',
      futureLogisticsTitle: 'एकात्मिक वाहतूक व उचल',
      futureLogisticsDesc: 'शेत बांधावरून उचल करण्यासाठी वाहतूकदार शोधा, भाडे दर तपासा आणि ट्रॅकिंग करा.',
      futureNetTitle: 'निव्वळ नफा तुलना विश्लेषण',
      futureNetDesc: 'वाहतूक, साठवणूक आणि सेस वजा केल्यानंतर प्रत्यक्ष हातात मिळणाऱ्या पैशांची अचूक गणना.',
      futureEscrowTitle: 'पेमेंट व सुरक्षित एस्क्रॉ',
      futureEscrowDesc: 'बँक-स्तरीय एस्क्रॉ द्वारे खरेदीदाराने माल मिळाल्याची पुष्टी केल्यावर शेतकऱ्याला त्वरित पेमेंट खात्री.',
    },
    quality: {
      sectionTitle: 'द्वि-स्तरीय गुणवत्ता पडताळणी',
      sectionSubtitle: 'एआय व्हिज्युअल अंदाज आणि अधिकृत प्रत्यक्ष तपासणी यामधील पारदर्शक वर्गीकरण.',
      tier1Title: 'टप्पा १: एआय प्राथमिक व्हिज्युअल तपासणी',
      tier1Subtitle: 'शेतमालाच्या फोटोंवर आधारित प्राथमिक व्हिज्युअल निरीक्षण',
      tier1Badge: 'एआय मूल्यांकन — पडताळणी नाही (AI Assessment — Not Verified)',
      tier1Disclaimer: 'केवळ प्राथमिक व्हिज्युअल अंदाज. अधिकृत व्यापारासाठी मान्यताप्राप्त प्रत्यक्ष तपासणी आवश्यक आहे.',
      tier2Title: 'टप्पा २: प्रत्यक्ष गुणवत्ता पडताळणी',
      tier2Subtitle: 'प्रमाणित निरीक्षकाद्वारे प्रत्यक्ष जागेवर केलेली अधिकृत प्रतवारी',
      tier2BadgePending: 'प्रत्यक्ष तपासणी प्रलंबित (Pending)',
      tier2BadgeVerified: 'प्रत्यक्ष पडताळणी पूर्ण (Physically Verified)',
      tier2BadgeRejected: 'नाकारले (Rejected)',
      tier2BadgeReinspection: 'पुनर्तपासणी आवश्यक (Requires Reinspection)',
      requestAiAssessment: 'एआय मूल्यांकन करा',
      aiModalTitle: 'प्राथमिक एआय व्हिज्युअल मूल्यांकन',
      aiModalSubtitle: 'प्राथमिक दृश्य निकष भरा. परिणाम "एआय मूल्यांकन — पडताळणी नाही" म्हणून चिन्हांकित केले जातील.',
      colorLabel: 'रंगाची सुसंगतता',
      colorPlaceholder: 'उदा. गडद लाल, एकसमान रंग',
      visibleDamageLabel: 'दृश्य पृष्ठभागावरील नुकसान',
      visibleDamagePlaceholder: 'उदा. अत्यंत कमी (< २% साल निघणे)',
      sizeUniformityLabel: 'आकारातील समानता (%)',
      visibleDefectsLabel: 'दृश्य दोष (%)',
      estimatedGradeLabel: 'प्राथमिक दर्जा सूचना',
      assessmentNotesLabel: 'मूल्यांकन नोंदी / निरीक्षणे',
      assessmentNotesPlaceholder: 'उदा. कांदा आकार ५५-६५ मिमी एकसमान, कोरडी साल, मान घट्ट.',
      runAiAssessmentBtn: 'एआय मूल्यांकन नोंदवा',
      runningAssessment: 'मूल्यांकन नोंदवत आहे...',
      inspectorDashboardTitle: 'द्वि-स्तरीय गुणवत्ता तपासणी डेस्क',
      inspectorDashboardSubtitle: 'एसआयएच द्वि-स्तरीय गुणवत्ता तत्त्वानुसार अधिकृत तपासणी व्यवस्थापन.',
      pendingCard: 'प्रलंबित तपासण्या',
      verifiedCard: 'प्रत्यक्ष पडताळणी पूर्ण',
      reinspectionCard: 'पुनर्तपासणी आवश्यक',
      openInspection: 'तपासणी सुरू करा',
      inspectionModalTitle: 'अधिकृत प्रत्यक्ष तपासणी अर्ज',
      officialGrade: 'अधिकृत प्रमाणित दर्जा',
      moisturePercentage: 'ओलावा प्रमाण (%)',
      foreignMatter: 'कचरा / बाह्य घटक (%)',
      inspectionLocation: 'तपासणीचे ठिकाण',
      inspectionDate: 'तपासणी तारीख',
      inspectionNotes: 'निरीक्षकाची अधिकृत टीप',
      verificationStatus: 'तपासणी निर्णय स्थिती',
      submitVerification: 'अधिकृत प्रमाणपत्र सादर करा',
      submittingVerification: 'सादर करत आहे...',
      certificateNumber: 'प्रमाणपत्र क्रमांक',
      inspector: 'प्रमाणित गुणवत्ता निरीक्षक',
      verifiedAt: 'प्रमाणित तारीख',
      notAssessedYet: 'अद्याप मूल्यांकन केलेले नाही',
      trustPrincipleTitle: 'एसआयएच वास्तुकला तत्त्व: एआय स्क्रिनिंग वि. प्रत्यक्ष तपासणी',
      trustPrincipleDesc: 'किसानसेतू केवळ फोटोवरून पिकाचा अंतिम व्यापार दर्जा ठरवण्याचा दावा पूर्णपणे नाकारतो. एआय परिणाम नेहमी "एआय मूल्यांकन — पडताळणी नाही" म्हणून दर्शवला जातो. केवळ प्रत्यक्ष तपासणीनेच "Physically Verified" दर्जा मिळतो.',
      photoEmptyPrompt: 'व्हिज्युअल स्क्रीनिंग सुरू करण्यासाठी शेतमालाचा फोटो जोडा.',
      uploadPhotoBtn: 'फोटो अपलोड करा',
      takePhotoBtn: 'फोटो काढा',
      changePhotoBtn: 'फोटो बदला',
      removePhotoBtn: 'फोटो काढा',
      photoRequiredError: 'कृपया गुणवत्ता मूल्यमापनापूर्वी शेतमालाचा फोटो निवडा किंवा काढा.',
      invalidImageError: 'कृपया वैध इमेज फाईल निवडा (JPG, PNG, WebP).',
      photoInputLabel: 'डिव्हाइसवरून शेतमालाचा फोटो अपलोड करा',
      cameraInputLabel: 'कॅमेऱ्याने शेतमालाचा फोटो काढा',
      assessQualityBtn: 'गुणवत्ता तपासा',
      ruleBasedNotice: 'प्राथमिक व्हिज्युअल तपासणी पृष्ठभागाचा रंग आणि एकसारखेपणा तपासते. अधिकृत प्रमाणपत्रासाठी प्रत्यक्ष तपासणी अनिवार्य आहे.',
    },
    buyerMatching: {
      matchedBuyersTitle: 'जुळणारे व्यावसायिक खरेदीदार',
      matchedBuyersSubtitle: 'तुमच्या पिकाशी, प्रमाण आणि गुणवत्तेशी जुळणारे सक्रिय व्यावसायिक खरेदीदार व प्रक्रिया उद्योग.',
      noMatchesFound: 'या पिकासाठी सध्या थेट जुळणारे खरेदीदार उपलब्ध नाहीत.',
      matchScore: 'मॅच स्कोअर',
      breakdownTitle: 'मॅच निकष',
      gapWarningsTitle: 'फरक / तफावत सूचना',
      buyerIdentityVerified: 'नोंदणीकृत व पडताळणी झालेली संस्था',
      buyerIdentityUnverified: 'अद्याप पडताळणी न झालेली संस्था',
      reputationLabel: 'व्यावसायिक पत (Trade Reputation)',
      completedTrades: 'पूर्ण झालेले व्यवहार',
      punctuality: 'वेळेवर पेमेंट',
      viewDemandBtn: 'मागणी तपशील पहा',
      incomingOffersTitle: 'आलेले थेट खरेदी प्रस्ताव (Digital Offers)',
      incomingOffersSubtitle: 'खरेदीदारांकडून थेट आलेले डिजिटल खरेदी प्रस्ताव तपासा, स्वीकारा (लॉट आरक्षित होईल) किंवा नाकारा.',
      noOffersReceived: 'या लॉटसाठी अद्याप कोणतेही खरेदी प्रस्ताव आलेले नाहीत.',
      offerFrom: 'खरेदीदार संस्था',
      offeredPrice: 'प्रस्तावित दर',
      offeredQuantity: 'प्रस्तावित प्रमाण',
      totalOfferValue: 'एकूण प्रस्ताव मूल्य',
      paymentTerms: 'पेमेंट अटी',
      deliveryTerms: 'डिलिव्हरी अटी',
      validUntil: 'प्रस्ताव मुदत',
      acceptOfferBtn: 'प्रस्ताव स्वीकारा (Accept)',
      rejectOfferBtn: 'प्रस्ताव नाकारा (Reject)',
      acceptSuccess: 'प्रस्ताव यशस्वीरित्या स्वीकारला गेला! लॉट आरक्षित (RESERVED) झाला आहे.',
      rejectSuccess: 'प्रस्ताव नाकारला गेला.',
      confirmAccept: 'तुम्हाला हा खरेदी प्रस्ताव स्वीकारायचा आहे का? लॉट आरक्षित होईल.',
      confirmReject: 'तुम्हाला हा खरेदी प्रस्ताव नाकारायचा आहे का?',
      lotReservedNotice: 'हा लॉट खरेदीदारासाठी आरक्षित (RESERVED) करण्यात आला आहे.',
      statusPending: 'प्रलंबित (Pending)',
      statusAccepted: 'स्वीकारले (Accepted)',
      statusRejected: 'नाकारले (Rejected)',
      statusCancelled: 'रद्द केले (Cancelled)',
      statusExpired: 'मुदत संपली (Expired)',
      hubTitle: 'खरेदीदार खरेदी केंद्र (Buyer Procurement Hub)',
      hubSubtitle: 'मागणी नोंदवा, प्रमाणित शेतकरी लॉट शोधा आणि डिजिटल खरेदी प्रस्ताव पाठवा.',
      demoBuyerSelector: 'डेमो खरेदीदार संस्था निवडा',
      activeBuyerProfile: 'सक्रिय खरेदीदार प्रोफाइल',
      switchBuyer: 'खरेदीदार बदला',
      verifiedCredentials: 'प्रमाणित व्यावसायिक ओळख (Verified Credentials)',
      unverifiedCredentials: 'अद्याप पडताळणी न झालेली संस्था',
      credentialDetails: 'शासकीय नोंदणी, जीएसटीआयएन आणि एपीएमसी परवाना पडताळणी',
      reputationMetrics: 'व्यावसायिक पत आणि व्यवहार इतिहास',
      rating: 'ग्राहक रेटिंग',
      tradesCompleted: 'यशस्वी व्यवहार',
      paymentPunctualityScore: 'पेमेंट वेळेवर करण्याची टक्केवारी',
      tabActiveDemands: 'सक्रिय मागण्या',
      tabCreateDemand: 'नवीन मागणी नोंदवा',
      tabBrowseLots: 'जुळणारे शेतकरी लॉट',
      tabMyOffers: 'माझे पाठवलेले प्रस्ताव',
      createDemandTitle: 'नवीन खरेदी मागणी नोंदवा',
      createDemandSubtitle: 'तुमची आवश्यक पिकाची मागणी नोंदवा जेणेकरून अल्गोरिदम योग्य शेतकरी शोधू शकेल.',
      commodityLabel: 'पीक / शेतमाल',
      commodityPlaceholder: 'उदा. कांदा (Onion), सोयाबीन (Soybean)',
      quantityLabel: 'आवश्यक प्रमाण',
      unitLabel: 'एकक (Unit)',
      requiredGradeLabel: 'आवश्यक गुणवत्ता ग्रेड',
      locationLabel: 'खरेदीदार ठिकाण / जिल्हा',
      locationPlaceholder: 'उदा. नाशिक, पुणे, छत्रपती संभाजीनगर',
      deliveryLocationLabel: 'डिलिव्हरी ठिकाण / वेअरहाऊस',
      deliveryLocationPlaceholder: 'उदा. चाकण वेअरहाऊस, पुणे',
      minPriceLabel: 'किमान किंमत (रु./क्विंटल)',
      maxPriceLabel: 'कमाल किंमत (रु./क्विंटल)',
      deadlineLabel: 'डिलिव्हरी अंतिम मुदत',
      descriptionLabel: 'मागणी तपशील / विशेष सूचना',
      descriptionPlaceholder: 'उदा. चांगल्या सुकलेल्या कांद्याची गरज, किमान 50 मिमी आकार.',
      submitDemandBtn: 'खरेदी मागणी नोंदवा',
      submittingDemand: 'मागणी नोंदवत आहे...',
      demandCreatedSuccess: 'खरेदी मागणी यशस्वीरित्या नोंदवली गेली!',
      demandsCount: 'एकूण नोंदवलेल्या मागण्या',
      noActiveDemands: 'अद्याप कोणतीही सक्रिय मागणी नोंदवलेली नाही.',
      viewMatchesBtn: 'जुळणारे लॉट पहा',
      priceRange: 'स्वीकार्य भाव मर्यादा',
      deadline: 'अंतिम मुदत',
      browseLotsTitle: 'उपलब्ध शेतकरी लॉट',
      browseLotsSubtitle: 'नोंदवलेल्या मागण्यांशी जुळणारे उपलब्ध शेतकरी लॉट, मॅच स्कोअर आणि दोन-अंकी गुणवत्ता स्थिती.',
      noMatchingLots: 'या मागणीशी जुळणारे कोणतेही शेतकरी लॉट सध्या उपलब्ध नाहीत.',
      matchStrength: 'मॅच सामर्थ्य',
      farmerLotId: 'शेतकरी लॉट आयडी',
      expectedPrice: 'अपेक्षित दर',
      makeOfferBtn: 'प्रस्ताव पाठवा (Make Offer)',
      filterByDemand: 'मागणीनुसार फिल्टर करा',
      allDemands: 'सर्व मागण्या',
      makeOfferTitle: 'शेतकऱ्याला डिजिटल खरेदी प्रस्ताव पाठवा',
      makeOfferSubtitle: 'या लॉटसाठी तुमचा अधिकृत खरेदी प्रस्ताव पाठवा. शेतकरी तो स्वीकारेपर्यंत तो प्रलंबित राहील.',
      offerPriceLabel: 'प्रस्तावित दर (रु./क्विंटल)',
      offerQtyLabel: 'प्रस्तावित प्रमाण (क्विंटल)',
      deliveryTermsLabel: 'डिलिव्हरी अटी',
      deliveryTermsPlaceholder: 'उदा. फार्म-गेट पिकअप / खरेदीदार वेअरहाऊस डिलिव्हरी',
      paymentTermsLabel: 'पेमेंट अटी',
      paymentTermsPlaceholder: 'उदा. डिलिव्हरीनंतर 24 तासांत बँक एस्क्रो द्वारे थेट खात्यात',
      expiryDateLabel: 'प्रस्ताव समाप्ती तारीख',
      offerNotesLabel: 'अतिरिक्त टीप',
      offerNotesPlaceholder: 'उदा. माल तपासणीनंतर ताबडतोब उचल करण्यात येईल.',
      submitOfferBtn: 'खरेदी प्रस्ताव पाठवा',
      submittingOffer: 'प्रस्ताव पाठवत आहे...',
      offerCreatedSuccess: 'खरेदी प्रस्ताव यशस्वीरित्या पाठवला गेला!',
      offerPendingNotice: 'प्रस्ताव सध्या प्रलंबित (Pending) आहे. शेतकरी स्वीकारल्यावर लॉट आरक्षित होईल.',
      myOffersTitle: 'माझे पाठवलेले खरेदी प्रस्ताव',
      myOffersSubtitle: 'तुम्ही शेतकऱ्यांना पाठवलेल्या सर्व प्रस्तावांची स्थिती आणि ट्रॅकिंग.',
      noSentOffers: 'तुम्ही अद्याप कोणताही खरेदी प्रस्ताव पाठवलेला नाही.',
      cancelOfferBtn: 'प्रस्ताव रद्द करा',
      cancelSuccess: 'प्रस्ताव यशस्वीरित्या रद्द केला गेला.',
      confirmCancel: 'तुम्हाला हा खरेदी प्रस्ताव खरोखर रद्द करायचा आहे का?',
      trustNoticeTitle: 'पारदर्शकता आणि विश्वास तत्त्वे',
      trustNoticeDesc: 'व्यावसायिक क्रेडेन्शियल पडताळणी आणि प्रत्यक्ष व्यापार कामगिरी या दोन्ही स्वतंत्रपणे दर्शविल्या जातात. कोणतीही खोटी रेटिंग चालत नाही.',
      demoNotice: 'डेमो मोड: हे केवळ प्रात्यक्षिकासाठी तयार केलेले सिम्युलेशन आहे. येथे कोणतेही प्रत्यक्ष आर्थिक व्यवहार किंवा करार होत नाहीत.',
    },
    transport: {
      hubTitle: 'वाहतूकदार लॉजिस्टिक्स आणि डिस्पॅच हब',
      hubSubtitle: 'व्यावसायिक वाहने व्यवस्थापित करा, शेतमालाच्या वाहतूक विनंत्या तपासा आणि पारगमन वितरण अद्यतनित करा.',
      roleBadge: 'भूमिका: वाहतूकदार लॉजिस्टिक्स',
      logisticsNetworkTitle: 'वाहतूकदार लॉजिस्टिक्स नेटवर्क',
      logisticsNetworkDesc: 'पारदर्शक दर प्रति किलोमीटर दराने शेतापासून ते मुख्य बाजारपेठ आणि अन्न प्रक्रिया केंद्रांपर्यंत थेट वाहतूक जोडणी.',
      demoTransporterSelector: 'प्रोटोटाइप डेमो वाहतूकदार बदला',
      activeTransporterProfile: 'सक्रिय वाहतूकदार प्रोफाइल',
      switchTransporter: 'वाहतूकदार बदला',
      verifiedPermit: 'RTO व्यावसायिक परवाना पडताळणी पूर्ण',
      unverifiedPermit: 'पडताळणी प्रलंबित',
      operationalDistrictsLabel: 'कार्यरत जिल्हे',
      fleetRating: 'गुणवत्ता रेटिंग',
      tripsCompleted: 'पूर्ण झालेल्या फेऱ्या',
      onTimeRate: 'वेळेवर पोहोचण्याचे प्रमाण',
      tabFleet: 'वाहन ताफा',
      tabRequests: 'आलेल्या विनंत्या',
      tabDispatches: 'वाहतूक ट्रॅकिंग',
      registerVehicleBtn: 'नवीन वाहन जोडा',
      fleetOverviewTitle: 'वाहन क्षमता आणि भाडे दर',
      fleetOverviewSubtitle: 'कृषी माल वाहतुकीसाठी नोंदणीकृत सक्रिय वाहने.',
      vehicleTypeLabel: 'वाहन मॉडेल',
      vehicleRegLabel: 'वाहन नोंदणी क्रमांक',
      capacityLabel: 'वहन क्षमता',
      ratePerKmLabel: 'दर / किमी',
      coldChainLabel: 'कोल्ड चेन वाहन',
      availableBadge: 'उपलब्ध',
      busyBadge: 'मार्गावर',
      refrigeratedBadge: 'शीतगृह (रेफर व्हॅन)',
      standardBadge: 'मानक मालवाहू',
      incomingRequestsTitle: 'आलेल्या वाहतूक विनंत्या',
      incomingRequestsSubtitle: 'शेतकरी आणि एफपीओ यांनी पाठवलेल्या थेट शेतावरील पिकअप विनंत्या.',
      noRequestsReceived: 'अद्याप कोणत्याही प्रलंबित वाहतूक विनंत्या नाहीत.',
      lotDetailsLabel: 'शेतमाल लॉट',
      pickupLocationLabel: 'माल उचलण्याचे ठिकाण',
      dropLocationLabel: 'पोहोचवण्याचे ठिकाण',
      distanceLabel: 'अंतर (किमी)',
      tripsLabel: 'आवश्यक फेऱ्या',
      estimatedEarnings: 'अंदाजे भाडे कमाई',
      costPerQtlLabel: 'भाडे / क्विंटल',
      scheduledPickupLabel: 'नियोजित वेळ',
      actualDeliveryLabel: 'पोहोचवलेली वेळ',
      statusRequested: 'विनंती पाठवली',
      statusAccepted: 'विनंती स्वीकारली',
      statusRejected: 'नाकारली',
      statusInTransit: 'मार्गावर (ट्रान्झिट)',
      statusDelivered: 'पोहोचवले',
      statusCancelled: 'रद्द केली',
      acceptRequestBtn: 'विनंती स्वीकारा',
      declineRequestBtn: 'नाकारा',
      markInTransitBtn: 'मार्गावर सुरू करा',
      markDeliveredBtn: 'वितरण पूर्ण झाले',
      activeDispatchesTitle: 'सक्रिय आणि पूर्ण झालेली वाहतूक',
      activeDispatchesSubtitle: 'वितरण टप्पे आणि पूर्ततेची स्थिती तपासा.',
      noDispatchesFound: 'सध्या कोणतीही सक्रिय वाहतूक नाही.',
      formulaTitle: 'पारदर्शक खर्च सूत्र',
      formulaText: 'फेऱ्या = ⌈लॉट वजन / क्षमता⌉ • अंदाजे खर्च = फेऱ्या × अंतर (किमी) × दर/किमी',
      netRealisationNote: 'हा पारदर्शक वाहतूक खर्च थेट टप्पा ६ मधील निव्वळ वसुली (Net Realisation) गणनेमध्ये वापरला जातो.',
      lotTransportTitle: 'वाहतूक आणि लॉजिस्टिक्स व्यवस्थापन',
      lotTransportSubtitle: 'या लॉटसाठी निश्चित केलेल्या पारदर्शक प्रति-किमी दराने पडताळणीकृत कृषी मालवाहू बुक करा.',
      findTransportersBtn: 'वाहतूक पर्याय शोधा',
      destinationLabel: 'पोहोचवण्याचे ठिकाण / बाजार समिती',
      destinationPlaceholder: 'उदा. पुणे मार्केट यार्ड, वाशी एपीएमसी',
      preferColdChainLabel: 'शीतगृह (कोल्ड चेन) वाहनाची आवश्यकता आहे',
      matchingTransportersTitle: 'उपलब्ध वाहतूकदार आणि वाहने',
      noTransportersAvailable: 'या मार्गासाठी कोणतेही वाहतूकदार उपलब्ध नाहीत.',
      costEquationLabel: 'पारदर्शक खर्च गणित',
      bookTransportBtn: 'वाहतूक विनंती पाठवा',
      bookingModalTitle: 'वाहतूक विनंती बुक करा',
      bookingModalSubtitle: 'निवडलेल्या वाहतूकदारासोबत पिकअप तारीख आणि पत्ता निश्चित करा.',
      scheduledDateLabel: 'पिकअप तारीख',
      transportNotesLabel: 'विशेष सूचना / पत्त्याची माहिती',
      transportNotesPlaceholder: 'उदा. गावातील शाळेजवळ, सुती पोत्यांमध्ये माल',
      confirmBookingBtn: 'विनंती पाठवा',
      bookingSuccess: 'वाहतूक विनंती यशस्वीरीत्या पाठवण्यात आली!',
      activeBookingsTitle: 'या लॉटसाठी नोंदवलेली वाहतूक',
      noBookingsYet: 'अद्याप वाहतूक बुक केलेली नाही. खालील पर्यायांमधून वाहतूकदार निवडा.',
      demoNotice: 'डेमो सूचना: कृषी कॉरिडॉरसाठी लॉजिस्टिक्स सिम्युलेशन. प्रत्यक्षात कोणतेही वाहन पाठवले जात नाही.',
    },
    netRealisation: {
      hubTitle: 'निव्वळ परतावा (Net Realisation) आणि हुशार विक्री सल्ला',
      hubSubtitle: 'वाहतूक, साठवणूक आणि बाजार सेस कपातीनंतर प्रत्यक्ष हातात येणारा निव्वळ परतावा मोजा.',
      netRealisation: 'निव्वळ परतावा (Net Realisation)',
      grossSaleValue: 'एकूण विक्री मूल्य',
      transportCost: 'वाहतूक भाडे कपात',
      storageCost: 'गोदाम साठवणूक खर्च',
      otherCosts: 'सेस व हमाली/तोलाई खर्च',
      netPerQuintal: 'प्रति क्विंटल निव्वळ परतावा',
      bestSellingOption: 'सर्वोत्तम विक्री पर्याय',
      sellNow: 'आताच विक्री करा',
      storeAndSellLater: 'साठवून नंतर विक्री करा',
      waitAndWatch: 'थांबा आणि बाजाराचे निरीक्षण करा',
      estimatedLabel: 'अंदाजित / बिनहमी',
      notGuaranteed: 'अंदाजित — बाजार चढउतारावर आधारित',
      whyThisRecommendation: 'हा सल्ला का दिला?',
      howIsThisCalculated: 'निव्वळ परतावा कसा मोजला जातो?',
      compareSellingOptions: 'विक्री पर्यायांची तुलना करा',
      currentPrice: 'सध्याचा विक्री भाव',
      expectedFuturePrice: 'अपेक्षित भावी भाव',
      potentialImprovement: 'संभाव्य भाव वाढ',
      reliability: 'व्यावसायिक विश्वासार्हता',
      assumptions: 'आर्थिक व व्यावहारिक गृहीतके',
      demoData: 'नमुना बाजार समिती भाव',
      estimatedData: 'हंगामी अंदाज मॉडेल',
      insufficientData: 'सल्ल्यासाठी पुरेसा बाजार डेटा उपलब्ध नाही.',
      holdingDaysLabel: 'साठवणूक कालावधी (दिवस)',
      tableOption: 'पर्याय / बाजार',
      tableGross: 'एकूण भाव / क्विंटल',
      tableTransport: 'वाहतूक / क्विंटल',
      tableStorage: 'साठवणूक / क्विंटल',
      tableOther: 'इतर / क्विंटल',
      tableNet: 'निव्वळ परतावा / क्विंटल',
      tableAction: 'शिफारस / कृती',
      formulaTitle: 'किसानसेतूचे पारदर्शक परतावा सूत्र',
      formulaGrossText: 'एकूण विक्री मूल्य = शेतमाल वजन (क्विंटल) × विक्री भाव (₹/क्विंटल)',
      formulaTransportText: 'वाहतूक खर्च = फेऱ्या × अंतर (किमी) × दर प्रति किमी (₹/किमी)',
      formulaStorageText: 'साठवणूक खर्च = (मासिक दर / ३०) × साठवण दिवस × वजन (क्विंटल)',
      formulaNetText: 'निव्वळ परतावा = एकूण मूल्य − वाहतूक − साठवणूक − बाजार खर्च',
      dashboardCardTitle: 'सर्वोत्तम निव्वळ परतावा',
      dashboardCardSub: 'सर्वात जास्त नफा देणारा पर्याय',
      viewAnalysisBtn: 'सविस्तर विश्लेषण पहा',
      noOptionsAvailable: 'अद्याप कोणतेही विक्री पर्याय तपासलेले नाहीत.',
      mandiYardLabel: 'नियमित कृषी उत्पन्न बाजार समिती',
      directBuyerLabel: 'थेट व्यावसायिक खरेदीदार',
      storageProjectionLabel: 'गोदाम साठवणूक अंदाज',
    },
    transactions: {
      hubTitle: 'व्यवहार, एस्क्रो आणि व्यापार पूर्तता',
      hubSubtitle: 'टप्प्याटप्प्याने डिजिटल व्यापार अंमलबजावणी, नमुना पेमेंट स्थिती आणि पडताळलेले ३-मार्गी रेटिंग.',
      myTransactionsTitle: 'माझे व्यावसायिक व्यवहार',
      myTransactionsSubtitle: 'व्यापार करार, वाहतूक पाठवणी, पेमेंट स्थिती आणि पक्षांची विश्वासार्हता ट्रॅक करा.',
      transactionCode: 'व्यवहार आयडी',
      commercialAgreement: 'व्यावसायिक व्यापार करार',
      paymentTracking: 'पेमेंट ट्रॅकिंग',
      paymentStatus: 'पेमेंट स्थिती',
      paymentInitiated: 'पेमेंट सुरू केले',
      paymentProcessing: 'पेमेंट प्रक्रिया सुरू',
      paymentReceived: 'पेमेंट प्राप्त झाले',
      paymentPaid: 'पूर्ण भरणा (सफल)',
      markPaymentReceivedBtn: 'पेमेंट मिळाल्याची नोंद करा (डेमो)',
      completed: 'पूर्ण झाले',
      transportStatus: 'वाहतूक स्थिती',
      deliveryLocation: 'वितरण ठिकाण',
      qualityStatus: 'मालाची गुणवत्ता स्थिती',
      physicallyVerified: 'अधिकृत निरीक्षकाद्वारे प्रत्यक्ष प्रमाणित',
      aiVisualScreening: 'एआय प्राथमिक तपासणी — अप्रमाणित',
      agreedPricePerQtl: 'ठरलेला भाव / क्विंटल',
      grossContractValue: 'एकूण करार मूल्य',
      netRealisation: 'निव्वळ परतावा',
      takeHomeEstimate: 'शेतकऱ्याचा निव्वळ नफा',
      threeWayRatings: 'व्यवहार-आधारित ३-मार्गी रेटिंग',
      rateThisTransaction: 'या व्यवहाराचे मूल्यांकन करा',
      ratingSubmitted: 'रेटिंग यशस्वीरीत्या नोंदवले गेले',
      submitRatingBtn: 'प्रमाणित रेटिंग सबमिट करा',
      ratingFeedbackPlaceholder: 'कामाचा अनुभव सामायिक करा (वेळेचे पालन, गुणवत्ता, तत्परता)...',
      disputeGrievance: 'तक्रार व वाद निवारण',
      raiseDisputeBtn: 'व्यापार तक्रार नोंदवा',
      viewTransactionBtn: 'व्यवहार प्रवास पहा',
      filterAll: 'सर्व व्यवहार',
      filterActive: 'सक्रिय व्यवहार',
      filterCompleted: 'पूर्ण व मिटवलेले',
      filterDisputed: 'वाद प्रलंबित',
      noTransactionsFound: 'कोणतेही व्यावसायिक व्यवहार आढळले नाहीत.',
      timelineTitle: 'व्यापार पूर्तता जीवनचक्र',
      prototypeNotice: 'पेमेंट ट्रॅकिंग डेमो — प्रत्यक्ष बँक हस्तांतरण नाही.',
      reputationVsVerificationNote: 'शासकीय/नियामक पडताळणी ही व्यावसायिक रेटिंगपेक्षा स्वतंत्र आहे.',
      buyerLabel: 'खरेदीदार / प्रक्रियादार',
      farmerLabel: 'शेतकरी / एफपीओ उत्पादक',
      transporterLabel: 'व्यावसायिक वाहतूकदार',
    },
    disputes: {
      hubTitle: 'पुरावा-आधारित वाद निवारण प्रणाली',
      hubSubtitle: 'डिजिटल व्यवहार पुराव्यांचा वापर करून एफपीओ/बाजार समिती अधिकाऱ्यांमार्फत पारदर्शक मानवी निवारण.',
      raiseGrievanceTitle: 'व्यापार तक्रार नोंदवा',
      disputeCode: 'तक्रार आयडी',
      categoryLabel: 'तक्रार वर्गवारी',
      descriptionLabel: 'सविस्तर तक्रार व विसंगती',
      descriptionPlaceholder: 'वजन, ग्रेड विसंगती, वाहतूक उशीर किंवा पेमेंटबाबत सविस्तर माहिती लिहा...',
      submitGrievanceBtn: 'बाजार समिती/एफपीओ अधिकाऱ्याकडे तक्रार दाखल करा',
      statusOpen: 'खुली (पुनरावलोकन प्रलंबित)',
      statusUnderReview: 'तक्रार निवारण अधिकाऱ्यामार्फत तपासणी सुरू',
      statusResolved: 'निवारण झाले',
      statusRejected: 'नाकारली',
      statusClosed: 'बंद केली',
      categoryQualityMismatch: 'गुणवत्ता आणि प्रत विसंगती',
      categoryDeliveryDelay: 'वाहतूक व पोहोचण्यास विलंब',
      categoryPaymentDelay: 'पेमेंट मिळण्यास विलंब',
      categoryWeightDiscrepancy: 'वजन व वजनकाटा विसंगती',
      categoryPriceDisagreement: 'ठरलेल्या भावाबाबत वाद',
      categoryCancellation: 'एकतर्फी सौदा रद्द करणे',
      categoryOther: 'इतर तक्रार',
      evidenceChecklistTitle: 'आवश्यक पुरावे तपासणी यादी',
      humanAdjudicationNote: 'एआयला शेतीविषयक वाद ठरवण्याचा अधिकार नाही. अधिकृत मानवी पुनरावलोकन अनिवार्य आहे.',
      adminPanelTitle: 'महाराष्ट्र कृषी वाद निवारण प्रशासन पोर्टल',
      resolutionNotesLabel: 'अधिकृत निर्णय व निवारण नोंदी',
      resolutionNotesPlaceholder: 'वजन पावती, गुणवत्ता प्रमाणपत्र आणि करार अटींनुसार घेतलेला निर्णय नोंदवा...',
      markUnderReviewBtn: 'तपासणीत चिन्हांकित करा',
      resolveDisputeBtn: 'वाद मिटवा व निवारण करा',
      closeDisputeBtn: 'तक्रार बंद करा',
      grievanceRecordedNotice: 'तुमची तक्रार डिजिटल व्यवहाराच्या पुराव्यासह अधिकृतपणे नोंदवली गेली आहे.',
      noDisputesFound: 'कोणतीही प्रलंबित तक्रार नाही.',
    },
    calculator: {
      title: 'निव्वळ प्राप्ती शोध इंजिन',
      subtitle: 'केवळ सर्वोच्च एकूण दराच्या मागे धावू नका. प्रत्यक्ष शेतकरी निव्वळ नफा जाणून घेण्यासाठी वाहतूक, साठवणूक आणि मंडी उपकर विचारात घ्या.',
      badge: 'मुख्य यूएसपी इंजिन',
      parametersCardTitle: 'पीक आणि काढणी मापदंड',
      parametersCardSub: 'निव्वळ प्राप्ती गणनेसाठी मालाचे तपशील प्रविष्ट करा.',
      selectCropLabel: 'पीक निवडा (२२ समर्थित पिके)',
      harvestQtyLabel: 'काढणीचे प्रमाण',
      sellingPriceLabel: 'अपेक्षित विक्री किंमत (प्रति क्विंटल)',
      distanceLabel: 'बाजाराचे अंतर / खरेदीदार',
      storageDurationLabel: 'साठवणूक कालावधी (गोदाम / शीतगृह)',
      daysUnit: 'दिवस',
      quintalsUnit: 'क्विंटल',
      perQtlUnit: '/ क्विंटल',
      resultTitle: 'गणना केलेली निव्वळ प्राप्ती',
      takeHomeLabel: 'प्रत्यक्ष शेतकरी नफा',
      perQuintal: '/ क्विंटल',
      grossSaleValue: 'एकूण विक्री मूल्य',
      transportFreight: 'वाहतूक भाडे',
      storageCost: 'साठवणूक खर्च',
      mandiCessHandling: 'मंडी उपकर आणि हमाली खर्च',
      totalDeductions: 'एकूण वजावट',
      formulaTitle: 'निव्वळ प्राप्ती सूत्र',
      formulaText: 'निव्वळ प्राप्ती = एकूण विक्री मूल्य - वाहतूक खर्च - साठवणूक खर्च - इतर लागू खर्च',
      loadedFromMarket: 'बाजार समितीतून लोड केलेले मापदंड',
      resetDefaults: 'डीफॉल्ट रीसेट करा',
    },
    markets: {
      title: 'मंडी दर आणि आवक प्रमाण',
      subtitle: 'महाराष्ट्र आणि आंध्र प्रदेश (विझाग प्रदेश) मधील एपीएमसी बाजार समित्यांचे दैनंदिन मॉडेल दर आणि आवक ट्रॅकिंग.',
      badge: 'एपीएमसी बाजार गुप्तवार्ता',
      dataNoticeTitle: 'रचनात्मक तत्त्व: डेटा पारदर्शकता',
      dataNoticeDesc: 'खालील दर महाराष्ट्र आणि आंध्र प्रदेश एपीएमसीचे डेमो प्रोटोटाइप डेटा दर्शवतात. प्रत्यक्ष ॲगमार्कनेट / ई-नाम आणि एमएसएएमबी फीड्स मूळ लॉजिक न बदलता समाकलित होतील. आम्ही प्रोटोटाइप डेटा कधीही रिअल-टाइम सरकारी फीड म्हणून सादर करत नाही.',
      tableTitle: 'प्रादेशिक एपीएमसी दैनंदिन दर आढावा',
      tableSub: 'महाराष्ट्र आणि आंध्र प्रदेशातील मॉडेल भाव प्रति क्विंटल आणि एकूण दैनंदिन आवक यांची तुलना.',
      colMarket: 'बाजार / मंडी',
      colCommodity: 'शेतमाल',
      colPriceRange: 'किमान - कमाल दर',
      colModalPrice: 'मॉडेल दर',
      colArrivals: 'आवक',
      colAction: 'कृती',
      netProfitCheck: 'निव्वळ नफा तपासा',
      tonnes: 'टन',
      dist: 'जिल्हा',
      calculateNetRealisation: 'निव्वळ प्राप्ती गणना करा',
      archTitle: 'टप्पा १ आर्किटेक्चर पाया',
      archDesc: 'हा डेटा डेटाबेस स्कीमामधील मार्केट, मार्केट प्राईस आणि मार्केट आवक सारण्यांशी जोडला आहे.',
    },
    voice: {
      buttonLabel: 'बोला',
      buttonHint: 'मायक्रोफोनवर टॅप करा आणि बोला',
      listening: 'ऐकत आहे...',
      stop: 'थांबवा',
      cancel: 'रद्द करा',
      clear: 'साफ करा',
      readAloud: 'मोठ्याने वाचा',
      notSupported: 'या ब्राउझरमध्ये स्पीच रेकग्निशन समर्थित नाही. कृपया खालील त्वरित प्रश्न बटणे वापरा.',
      permissionDenied: 'मायक्रोफोन परवानगी नाकारली गेली. कृपया मायक्रोफोन प्रवेशास अनुमती द्या किंवा खालील बटणे वापरा.',
      youSaid: 'तुम्ही विचारले:',
      intentTitle: 'ओळखलेला हेतू:',
      fallbackResponse: 'मला ते समजले नाही. कृपया बाजार भाव, खरेदीदार, वाहतूक किंवा निव्वळ नफ्याबद्दल विचारून पहा.',
      suggestionTitle: 'सुचवलेले आवाज प्रश्न:',
      safetyNotice: 'आवाज सहाय्यक: केवळ माहिती आणि नेव्हिगेशनसाठी. आवाजाद्वारे कोणतेही आर्थिक व्यवहार किंवा स्वयंचलित वचनबद्धता केली जात नाही.',
      queryPrice: 'कांद्याचा आजचा भाव काय आहे?',
      queryBuyers: 'माझ्या १० क्विंटल कांद्यासाठी खरेदीदार शोधा.',
      queryProfit: 'कोणता पर्याय मला जास्त पैसे देतो?',
      queryTransport: 'माझ्या मालासाठी वाहतूक शोधा.',
      queryOffers: 'माझ्या ऑफर्स दाखवा.',
      queryTxns: 'माझे व्यवहार दाखवा.',
    },
  },

  te: {
    brand: {
      name: 'కిసాన్ సేతు',
      tagline: 'సరైన మార్కెట్. సరైన కొనుగోలుదారు. సరైన ధర.',
      subtagline: 'స్మార్ట్ వ్యవసాయ మార్కెట్-లింకేజ్ & నికర లాభ ప్లాట్‌ఫారమ్',
      sihBadge: 'మహారాష్ట్ర ప్రభుత్వం • వ్యవసాయ మార్కెటింగ్ చొరవ',
    },
    nav: {
      home: 'హోమ్',
      farmer: 'రైతు / FPO',
      buyer: 'కొనుగోలుదారులు',
      transporter: 'రవాణాదారులు',
      markets: 'మార్కెట్ సమాచారం',
      calculator: 'నికర లాభం',
      getStarted: 'ప్రారంభించండి',
      lots: 'నా లాట్లు',
      transactions: 'లావాదేవీలు',
      more: 'మరిన్ని',
      speak: 'మాట్లాడండి',
      inspector: 'క్వాలిటీ ఇన్స్పెక్టర్',
      disputes: 'ఫిర్యాదులు',
      admin: 'రాష్ట్ర అడ్మిన్',
    },
    hero: {
      badge: 'వ్యవసాయ మార్కెట్ లింకేజ్ మరియు ధరల గుర్తింపు',
      titleMain: 'కేవలం అత్యధిక ధరను మాత్రమే చూడకండి.',
      titleHighlight: 'అత్యధిక నమ్మకమైన నికర లాభాన్ని (Net Realisation) కనుగొనండి.',
      tagline: 'సరైన మార్కెట్. సరైన కొనుగోలుదారు. సరైన ధర.',
      descriptor: 'రైతుల కోసం స్మార్ట్ మార్కెట్ అనుసంధానం మరియు నికర లాభ వేదిక.',
      coreUsp: 'కేవలం ఎక్కువ ధర మాత్రమే కాకుండా, వాస్తవ నికర లాభాన్ని కనుగొనండి.',
      description:
        'కిసాన్ సేతు రైతులను మరియు FPO లను ధృవీకరించబడిన కొనుగోలుదారులు మరియు విశ్వసనీయ రవాణాదారులతో కలుపుతుంది. రవాణా మరియు నిల్వ ఖర్చులను లెక్కించి అత్యంత లాభదాయకమైన మార్గాన్ని ఎంచుకోండి.',
      ctaPrimary: 'ప్రారంభించండి',
      ctaSecondary: 'మార్కెట్ ధరలను చూడండి',
      exploreMarket: 'మార్కెట్ అన్వేషించండి',
      createProduceLot: 'పంటను నమోదు చేయండి',
      findBuyers: 'కొనుగోలుదారులను కనుగొనండి',
      viewDemo: 'డెమో చూడండి',
      statsFarmers: '5,000+ రైతులు & FPOలు',
      statsMandis: '300+ APMC మార్కెట్లు',
      statsBuyers: '1,200+ ధృవీకరించబడిన వ్యాపారులు',
    },
    ecosystem: {
      title: 'సమగ్ర వ్యవసాయ వాణిజ్య వ్యవస్థ',
      subtitle: 'పంట చేతికి వచ్చినప్పటి నుండి చెల్లింపు వరకు పూర్తి పారదర్శకత',
      farmerTitle: 'రైతులు & FPOలు',
      farmerDesc:
        'మీ పంట వివరాలను నమోదు చేయండి, డిజిటల్ నాణ్యతా పరిశీలన పొందండి మరియు పోటీ ధరల ఆఫర్లను అందుకోండి.',
      farmerAction: 'రైతు కేంద్రం',
      buyerTitle: 'ధృవీకరించబడిన కొనుగోలుదారులు',
      buyerDesc:
        'నాణ్యమైన పంటను నేరుగా పొలం నుండే పారదర్శకంగా కొనుగోలు చేయండి.',
      buyerAction: 'పంట లాట్‌లను చూడండి',
      transporterTitle: 'రవాణాదారులు',
      transporterDesc:
        'పంట రవాణా బుకింగ్‌లను పొందండి, ఖాళీ ప్రయాణాలను నివారించండి మరియు ఖచ్చితమైన చెల్లింపులు పొందండి.',
      transporterAction: 'రవాణా నెట్‌వర్క్‌లో చేరండి',
      flowTitle: 'కిసాన్ సేతు సంపూర్ణ వాణిజ్య చక్రం',
      flowSubtitle: 'దళారులు లేకుండా ప్రతి దశలో పారదర్శకత మరియు నమ్మకం',
      stepFarmer: 'రైతు / FPO',
      stepMarket: 'మార్కెట్ సమాచారం',
      stepQuality: 'నాణ్యత ధృవీకరణ',
      stepMatching: 'కొనుగోలుదారు మ్యాచ్',
      stepTransport: 'రవాణా సౌకర్యం',
      stepNetRealisation: 'నికర లాభం',
      stepTransaction: 'వాణిజ్య ఒప్పందం',
      stepTrust: 'నమ్మకం & పరిష్కారం',
    },
    usp: {
      title: 'కిసాన్ సేతు ప్రధాన USP',
      subtitle: 'రవాణా మరియు నిల్వ ఖర్చులు తీసివేయకుండా వచ్చే ధర ఎందుకు నష్టదాయకం?',
      formulaLabel: 'నికర లాభం సూత్రం (Net Realisation)',
      formulaGross: 'స్థూల విక్రయ విలువ',
      formulaTransport: 'రవాణా ఖర్చు',
      formulaStorage: 'నిల్వ ఖర్చు',
      formulaOther: 'ఇతర ఖర్చులు (సెస్ & కూలీ)',
      formulaNet: 'రైతు నికర లాభం',
      explanation:
        'దూరంగా ఉన్న మార్కెట్ క్వింటాల్‌కు ₹2500 ఇస్తున్నట్లు కనిపించినా, ₹350 రవాణా ఖర్చుల తర్వాత స్థానిక మార్కెట్‌ కంటే తక్కువ మిగలవచ్చు! కిసాన్ సేతు నిజమైన నికర లాభాన్ని లెక్కిస్తుంది.',
      interactiveDemoTitle: 'మార్కెట్లలో నికర లాభాలను సరిపోల్చండి',
    },
    valueProps: {
      title: 'నాలుగు ప్రధాన సామర్థ్యాలు',
      subtitle: 'గ్రామీణ వినియోగం, విశ్వసనీయత మరియు న్యాయమైన ధరల కోసం నిర్మించబడింది',
      p1Title: 'మార్కెట్ ఇంటెలిజెన్స్',
      p1Desc:
        'మహారాష్ట్ర వ్యాప్తంగా ఉన్న మార్కెట్ యార్డుల తాజా ధరలు, రాబడుల పరిమాణం మరియు ధరల ట్రెండ్స్.',
      p2Title: 'నికర లాభాల ఇంజిన్',
      p2Desc:
        'వాస్తవ రవాణా దూరం, వాహన అద్దె, గిడ్డంగి రుసుములను లెక్కించి నిజమైన లాభాన్ని చూపుతుంది.',
      p3Title: 'విశ్వసనీయత & ధృవీకరణ',
      p3Desc:
        'కేవైసీ ధృవీకరణ, లావాదేవీలతో ముడిపడిన రేటింగ్‌లు మరియు అధికృత నాణ్యత తనిఖీ.',
      p4Title: 'సమగ్ర రవాణా వ్యవస్థ',
      p4Desc:
        '1 టన్ను పికప్ నుండి 10 టన్నుల లారీ వరకు పారదర్శక రవాణా చార్జీలతో వాహనాల బుకింగ్.',
    },
    footer: {
      govtCredit:
        'రైతుల కోసం మార్కెట్ లింకేజ్ మరియు ధరల గుర్తింపును బలోపేతం చేయడం | మహారాష్ట్ర ప్రభుత్వం',
      disclaimer:
        'ప్రోటోటైప్ మోడల్. తదుపరి దశల్లో నిజ సమయ అగ్‌మార్క్‌నెట్ మరియు ఎంఎస్ఏఎంబి ఏపీఐలు అనుసంధానించబడతాయి.',
      phaseNotice: 'దశ 1 పునాది: మాడ్యులర్ మోనోలిత్ ఆర్కిటెక్చర్',
    },
    farmer: {
      badge: 'పాత్ర: రైతు / FPO',
      title: 'రైతు & FPO నిర్వహణ కేంద్రం',
      subtitle:
        'మీ పంట లాట్లను నిర్వహించండి, నికర లాభాల ద్వారా ఉత్తమ మార్కెట్లను కనుగొనండి మరియు ధృవీకరించబడిన కొనుగోలుదారులతో కనెక్ట్ అవ్వండి.',
      createLotCTA: 'కొత్త పంట లాట్‌ను సృష్టించండి',
      activeLotsCard: 'యాక్టివ్ లాట్లు',
      activeLotsSub: 'మార్కెట్‌లో విక్రయానికి సిద్ధంగా ఉన్నాయి',
      incomingOffersCard: 'వచ్చిన ఆఫర్లు',
      incomingOffersSub: 'కొనుగోలుదారుల బిడ్లు',
      fpoMembershipCard: 'FPO సభ్యత్వం',
      fpoMembershipSub: 'మొత్తం పరిమాణం: 420 టన్నులు',
      recentLotsTitle: 'ఇటీవలి పంట లాట్లు',
      viewAllLots: 'అన్ని లాట్లను చూడండి',
      engineTitle: 'నికర లాభాల నిర్ణయ ఇంజిన్',
      engineDesc:
        'కేవలం అత్యధిక ధరకు పరిమితం కావద్దు. లసల్‌గావ్, పూణే, సోలాపూర్ ధరల నుండి రవాణా మరియు సెస్ ఖర్చులను తీసివేసి అసలైన లాభాన్ని లెక్కించండి.',
      engineAction: 'నికర లాభాలను పోల్చండి',
      qualityTitle: 'రెండు అంచెల నాణ్యతా ధృవీకరణ',
      qualityDesc:
        'AI విజువల్ స్క్రీనింగ్ కోసం ఫోటోలను అప్‌లోడ్ చేయండి మరియు MSAMB సర్టిఫైడ్ ఇన్‌స్పెక్టర్ల నుండి ప్రత్యక్ష తనిఖీని పొందండి.',
      qualityAction: 'నాణ్యతా తనిఖీ విధానం',
      noticeTitle: 'దశ 2 ఫౌండేషన్ ఆర్కిటెక్చర్',
      noticeDesc:
        'ఈ రూట్ FarmerProfile, FPO, ProduceLot మరియు Offer మోడల్‌లతో Prisma Client ద్వారా SQLite డేటాబేస్‌కు అనుసంధానించబడింది.',
    },
    lots: {
      badge: 'డిజిటల్ పంట లాట్లు',
      title: 'డిజిటల్ పంట లాట్లు',
      subtitle:
        'రైతులు మరియు FPOల ద్వారా పరిమాణం, ఆశించిన ధర మరియు నాణ్యతా వివరాలతో రూపొందించబడిన ప్రామాణిక డిజిటల్ లాట్లు.',
      createNew: 'కొత్త లాట్ సృష్టించండి',
      filterAll: 'అన్ని లాట్లు',
      filterAvailable: 'అందుబాటులో ఉన్నవి',
      filterDraft: 'డ్రాఫ్ట్‌లు',
      filterReserved: 'రిజర్వ్ చేయబడినవి',
      filterSold: 'విక్రయించబడినవి',
      emptyTitle: 'ఇంకా ఎటువంటి పంట లాట్లు లేవు',
      emptyDesc: 'మీరు ఇంకా పంట లాట్‌ను సృష్టించలేదు. కొనుగోలుదారుల ఆఫర్లు మరియు రవాణా ధరలను పొందడానికి మీ పంటను నమోదు చేయండి.',
      createFirstLot: 'మీ మొదటి లాట్‌ను సృష్టించండి',
      loading: 'పంట లాట్లు లోడ్ అవుతున్నాయి...',
      lotId: 'లాట్ ఐడీ',
      crop: 'పంట పేరు',
      variety: 'రకం / వెరైటీ',
      volume: 'పరిమాణం (వాల్యూమ్)',
      targetPrice: 'ఆశించిన ధర',
      location: 'స్థానం / గ్రామం',
      status: 'స్థితి',
      grade: 'గ్రేడ్',
      actions: 'చర్యలు',
      viewDetails: 'వివరాలు చూడండి',
      editLot: 'సవరించండి',
      calculateRealisation: 'నికర లాభం లెక్కించండి',
      offersReceived: 'వచ్చిన ఆఫర్లు',
      createModalTitle: 'కొత్త పంట లాట్‌ను సృష్టించండి',
      createModalSubtitle: 'ధృవీకరించబడిన కొనుగోలుదారులు మరియు రవాణాదారుల కోసం ఖచ్చితమైన వివరాలను నమోదు చేయండి.',
      editModalTitle: 'పంట లాట్‌ను సవరించండి',
      cropLabel: 'పంటను ఎంచుకోండి',
      selectCrop: 'పంటను ఎంచుకోండి',
      cropCustomPlaceholder: 'లేదా పంట పేరు నమోదు చేయండి',
      varietyLabel: 'రకం / రకం పేరు',
      varietyPlaceholder: 'ఉదా. నాసిక్ రెడ్ గార్వా, JS-335, షిర్డీ వైట్',
      quantityLabel: 'పంట పరిమాణం (వాల్యూమ్)',
      unitLabel: 'యూనిట్',
      expectedPriceLabel: 'ఆశించిన విక్రయ ధర (₹)',
      expectedPricePerQtl: 'క్వింటాల్‌కు ఆశించిన ధర',
      expectedGradeLabel: 'ఆశించిన నాణ్యతా గ్రేడ్',
      gradeA: 'గ్రేడ్ A (ఎగుమతి / అత్యుత్తమ నాణ్యత)',
      gradeB: 'గ్రేడ్ B (ప్రామాణిక మార్కెట్ నాణ్యత)',
      gradeC: 'గ్రేడ్ C (సాధారణ సగటు నాణ్యత - FAQ)',
      gradeNotYet: 'ఇంకా గ్రేడింగ్ చేయలేదు (స్క్రీనింగ్ పెండింగ్‌లో ఉంది)',
      harvestDateLabel: 'కోత తేదీ',
      availabilityDateLabel: 'పికప్ / విక్రయానికి సిద్ధంగా ఉన్న తేదీ',
      districtLabel: 'జిల్లా',
      selectDistrict: 'మహారాష్ట్ర జిల్లాను ఎంచుకోండి',
      locationLabel: 'గ్రామం / ఫామ్ చిరునామా',
      locationPlaceholder: 'ఉదా. నిఫాడ్, నాసిక్ లేదా ఫామ్ గట్ నం. 42',
      descriptionLabel: 'నిల్వ పరిస్థితులు / నోట్స్',
      descriptionPlaceholder: 'ఉదా. వెంటిలేటెడ్ కందా చావల్‌లో నిల్వ చేయబడింది, పొడిగా ఉంది.',
      saveDraftBtn: 'డ్రాఫ్ట్‌గా సేవ్ చేయండి',
      publishBtn: 'లాట్‌ను ప్రచురించండి',
      updateBtn: 'వివరాలను అప్‌డేట్ చేయండి',
      cancelBtn: 'రద్దు చేయండి',
      savingBtn: 'సేవ్ అవుతోంది...',
      backToList: 'మరలా అన్ని లాట్లకు వెళ్లండి',
      detailTitle: 'పంట లాట్ పూర్తి వివరాలు',
      specificationsTitle: 'పంట & నాణ్యతా లక్షణాలు',
      futureOfferTitle: 'కొనుగోలుదారుల ఆఫర్లు & బిడ్లు',
      futureOfferDesc: 'ఫుడ్ ప్రాసెసర్లు, ఎగుమతిదారులు మరియు హోల్‌సేల్ కొనుగోలుదారుల ప్రత్యక్ష బిడ్‌లు ఇక్కడ కనిపిస్తాయి.',
      futureQualityTitle: 'రెండు అంచెల నాణ్యతా పరిశీలన',
      futureQualityDesc: 'AI విజువల్ స్క్రీనింగ్ మరియు MSAMB అధికారిక భౌతిక తనిఖీ స్థితి.',
      futureLogisticsTitle: 'సమగ్ర రవాణా & లాజిస్టిక్స్',
      futureLogisticsDesc: 'రైతు పొలం నుండే పికప్ బుక్ చేసుకోండి, రేట్లను పోల్చండి మరియు ట్రాకింగ్ చేయండి.',
      futureNetTitle: 'నికర లాభాల విశ్లేషణ',
      futureNetDesc: 'రవాణా, నిల్వ మరియు మార్కెట్ రుసుములను తీసివేసిన తర్వాత లభించే ఖచ్చితమైన లాభం.',
      futureEscrowTitle: 'చెల్లింపు & ఎస్క్రో భద్రత',
      futureEscrowDesc: 'డెలివరీ నిర్ధారణ తర్వాత రైతులకు తక్షణమే చెల్లింపు అందేలా బ్యాంక్ ఎస్క్రో రక్షణ.',
    },
    quality: {
      sectionTitle: 'రెండు అంచెల నాణ్యతా ధృవీకరణ',
      sectionSubtitle: 'AI విజువల్ అంచనాలు మరియు అధికారిక భౌతిక తనిఖీ మధ్య పారదర్శక విభజన.',
      tier1Title: 'టైర్ 1: AI ప్రాథమిక విజువల్ స్క్రీనింగ్',
      tier1Subtitle: 'పంట ఫోటోల ఆధారంగా ప్రాథమిక పరిశీలనలు',
      tier1Badge: 'AI అంచనా — ధృవీకరించబడలేదు (AI Assessment — Not Verified)',
      tier1Disclaimer: 'ప్రాథమిక విజువల్ అంచనా మాత్రమే. అధికారిక ట్రేడింగ్ కోసం భౌతిక తనిఖీ తప్పనిసరి.',
      tier2Title: 'టైర్ 2: భౌతిక నాణ్యతా ధృవీకరణ',
      tier2Subtitle: 'సర్టిఫైడ్ ఇన్‌స్పెక్టర్లచే ప్రత్యక్షంగా నిర్వహించబడే అధికారిక గ్రేడింగ్',
      tier2BadgePending: 'భౌతిక తనిఖీ పెండింగ్‌లో ఉంది (Pending)',
      tier2BadgeVerified: 'భౌతికంగా ధృవీకరించబడింది (Physically Verified)',
      tier2BadgeRejected: 'తిరస్కరించబడింది (Rejected)',
      tier2BadgeReinspection: 'పునఃపరిశీలన అవసరం (Requires Reinspection)',
      requestAiAssessment: 'AI అంచనాను అభ్యర్థించండి',
      aiModalTitle: 'ప్రాథమిక AI విజువల్ స్క్రీనింగ్ ఫారమ్',
      aiModalSubtitle: 'ప్రాథమిక విజువల్ పారామితులను నమోదు చేయండి. ఫలితం "AI అంచనా — ధృవీకరించబడలేదు"గా గుర్తించబడుతుంది.',
      colorLabel: 'రంగు స్థిరత్వం',
      colorPlaceholder: 'ఉదా. ముదురు ఎరుపు, ఏకరూప రంగు',
      visibleDamageLabel: 'కనిపించే ఉపరితల నష్టం',
      visibleDamagePlaceholder: 'ఉదా. చాలా తక్కువ (< 2% పొట్టు నష్టం)',
      sizeUniformityLabel: 'పరిమాణ ఏకరూపత (%)',
      visibleDefectsLabel: 'కనిపించే లోపాలు (%)',
      estimatedGradeLabel: 'ప్రాథమిక గ్రేడ్ సూచన',
      assessmentNotesLabel: 'అంచనా గమనికలు / పరిశీలనలు',
      assessmentNotesPlaceholder: 'ఉదా. గడ్డ పరిమాణం 55-65 మి.మీ ఏకరూపంగా ఉంది, పొడి పొట్టు.',
      runAiAssessmentBtn: 'AI అంచనాను నమోదు చేయండి',
      runningAssessment: 'నమోదు అవుతోంది...',
      inspectorDashboardTitle: 'రెండు అంచెల నాణ్యతా తనిఖీ డెస్క్',
      inspectorDashboardSubtitle: 'రెండు అంచెల నాణ్యతా సూత్రానికి కట్టుబడి అధికారిక తనిఖీ నిర్వహణ.',
      pendingCard: 'పెండింగ్ తనిఖీలు',
      verifiedCard: 'భౌతికంగా ధృవీకరించబడినవి',
      reinspectionCard: 'పునఃపరిశీలన అవసరం',
      openInspection: 'తనిఖీని ప్రారంభించండి',
      inspectionModalTitle: 'అధికారిక భౌతిక తనిఖీ ఫారమ్',
      officialGrade: 'అధికారిక ధృవీకరించబడిన గ్రేడ్',
      moisturePercentage: 'తేమ శాతం (%)',
      foreignMatter: 'విదేశీ పదార్థం (%)',
      inspectionLocation: 'తనిఖీ ప్రదేశం',
      inspectionDate: 'తనిఖీ తేదీ',
      inspectionNotes: 'ఇన్‌స్పెక్టర్ గమనికలు & పరీక్ష వివరాలు',
      verificationStatus: 'తనిఖీ నిర్ణయ స్థితి',
      submitVerification: 'అధికారిక ధృవీకరణను సమర్పించండి',
      submittingVerification: 'సమర్పిస్తోంది...',
      certificateNumber: 'సర్టిఫికేట్ సంఖ్య',
      inspector: 'సర్టిఫైడ్ క్వాలిటీ ఇన్‌స్పెక్టర్',
      verifiedAt: 'ధృవీకరించబడిన తేదీ',
      notAssessedYet: 'ఇంకా అంచనా వేయబడలేదు',
      trustPrincipleTitle: 'నాణ్యత సూత్రం: AI స్క్రీనింగ్ vs. భౌతిక తనిఖీ',
      trustPrincipleDesc: 'కేవలం ఫోటో ఆధారంగా పంట అధికారిక వాణిజ్య గ్రేడ్‌ను నిర్ణయించవచ్చనే భావనను కిసాన్ సేతు పూర్తిగా తిరస్కరిస్తుంది. AI ఫలితం ఎల్లప్పుడూ "AI అంచనా — ధృవీకరించబడలేదు"గా గుర్తించబడుతుంది. భౌతిక తనిఖీ ద్వారా మాత్రమే "Physically Verified" సర్టిఫికేట్ లభిస్తుంది.',
      photoEmptyPrompt: 'విజువల్ స్క్రీనింగ్ ప్రారంభించడానికి పంట ఫోటోను జోడించండి.',
      uploadPhotoBtn: 'ఫోటో అప్‌లోడ్ చేయండి',
      takePhotoBtn: 'ఫోటో తీయండి',
      changePhotoBtn: 'ఫోటో మార్చండి',
      removePhotoBtn: 'ఫోటో తొలగించండి',
      photoRequiredError: 'దయచేసి నాణ్యత అంచనా వేయడానికి ముందు పంట ఫోటోను ఎంచుకోండి లేదా తీయండి.',
      invalidImageError: 'దయచేసి సరైన ఇమేజ్ ఫైల్‌ను ఎంచుకోండి (JPG, PNG, WebP).',
      photoInputLabel: 'పరికరం నుండి పంట ఫోటోను అప్‌లోడ్ చేయండి',
      cameraInputLabel: 'కెమెరాతో పంట ఫోటో తీయండి',
      assessQualityBtn: 'నాణ్యతను అంచనా వేయండి',
      ruleBasedNotice: 'ప్రాథమిక విజువల్ స్క్రీనింగ్ రంగు మరియు ఏకరూపతను అంచనా వేస్తుంది. అధికారిక ధృవీకరణ కోసం భౌతిక తనిఖీ తప్పనిసరి.',
    },
    buyerMatching: {
      matchedBuyersTitle: 'సరిపోలే వాణిజ్య కొనుగోలుదారులు',
      matchedBuyersSubtitle: 'మీ పంట, పరిమాణం మరియు నాణ్యతకు సరిపోయే క్రియాశీల వ్యాపారులు మరియు ప్రాసెసర్లు.',
      noMatchesFound: 'ఈ పంట లాట్‌కు ప్రస్తుతానికి ప్రత్యక్ష కొనుగోలుదారులు అందుబాటులో లేరు.',
      matchScore: 'మ్యాచ్ స్కోర్',
      breakdownTitle: 'మ్యాచ్ ప్రమాణాలు',
      gapWarningsTitle: 'తేడాలు / హెచ్చరికలు',
      buyerIdentityVerified: 'ధృవీకరించబడిన సంస్థ (Verified Business)',
      buyerIdentityUnverified: 'ధృవీకరించబడని సంస్థ',
      reputationLabel: 'వాణిజ్య పరపతి (Trade Reputation)',
      completedTrades: 'పూర్తయిన వ్యాపారాలు',
      punctuality: 'సమయానికి చెల్లింపు',
      viewDemandBtn: 'డిమాండ్ వివరాలు చూడండి',
      incomingOffersTitle: 'వచ్చిన కొనుగోలు ప్రతిపాదనలు (Digital Offers)',
      incomingOffersSubtitle: 'కొనుగోలుదారుల నుండి నేరుగా వచ్చిన డిజిటల్ ఆఫర్లను సమీక్షించి ఆమోదించండి (లాట్ రిజర్వ్ అవుతుంది) లేదా తిరస్కరించండి.',
      noOffersReceived: 'ఈ లాట్ కోసం ఇంకా ఎటువంటి ఆఫర్లు రాలేదు.',
      offerFrom: 'కొనుగోలుదారు సంస్థ',
      offeredPrice: 'ఆఫర్ చేసిన ధర',
      offeredQuantity: 'ఆఫర్ చేసిన పరిమాణం',
      totalOfferValue: 'మొత్తం ఆఫర్ విలువ',
      paymentTerms: 'చెల్లింపు నిబంధనలు',
      deliveryTerms: 'డెలివరీ నిబంధనలు',
      validUntil: 'ఆఫర్ చెల్లుబాటు వ్యవధి',
      acceptOfferBtn: 'ఆఫర్‌ను ఆమోదించండి (Accept)',
      rejectOfferBtn: 'ఆఫర్‌ను తిరస్కరించండి (Reject)',
      acceptSuccess: 'ఆఫర్ విజయవంతంగా ఆమోదించబడింది! లాట్ రిజర్వ్ (RESERVED) చేయబడింది.',
      rejectSuccess: 'ఆఫర్ తిరస్కరించబడింది.',
      confirmAccept: 'మీరు ఈ కొనుగోలు ఆఫర్‌ను ఆమోదించాలనుకుంటున్నారా? లాట్ రిజర్వ్ చేయబడుతుంది.',
      confirmReject: 'మీరు ఈ ఆఫర్‌ను తిరస్కరించాలనుకుంటున్నారా?',
      lotReservedNotice: 'ఈ లాట్ కొనుగోలుదారు కోసం రిజర్వ్ (RESERVED) చేయబడింది.',
      statusPending: 'పెండింగ్ (Pending)',
      statusAccepted: 'ఆమోదించబడింది (Accepted)',
      statusRejected: 'తిరస్కరించబడింది (Rejected)',
      statusCancelled: 'రద్దు చేయబడింది (Cancelled)',
      statusExpired: 'గడువు ముగిసింది (Expired)',
      hubTitle: 'కొనుగోలుదారుల సేకరణ హబ్ (Buyer Procurement Hub)',
      hubSubtitle: 'కొనుగోలు డిమాండ్ నమోదు చేయండి, నాణ్యమైన రైతు లాట్లను కనుగొనండి మరియు డిజిటల్ ఆఫర్లను పంపండి.',
      demoBuyerSelector: 'డెమో కొనుగోలుదారు సంస్థను ఎంచుకోండి',
      activeBuyerProfile: 'క్రియాశీల కొనుగోలుదారు ప్రొఫైల్',
      switchBuyer: 'కొనుగోలుదారుని మార్చండి',
      verifiedCredentials: 'ధృవీకరించబడిన గుర్తింపు (Verified Credentials)',
      unverifiedCredentials: 'ధృవీకరించబడని వ్యాపార సంస్థ',
      credentialDetails: 'ప్రభుత్వ రిజిస్ట్రేషన్, GSTIN మరియు APMC లైసెన్స్ ధృవీకరణ',
      reputationMetrics: 'వాణిజ్య పరపతి & ట్రేడింగ్ చరిత్ర',
      rating: 'రేటింగ్',
      tradesCompleted: 'విజయవంతమైన వ్యాపారాలు',
      paymentPunctualityScore: 'సమయానికి చెల్లింపు శాతం',
      tabActiveDemands: 'క్రియాశీల డిమాండ్లు',
      tabCreateDemand: 'కొత్త డిమాండ్‌ను నమోదు చేయండి',
      tabBrowseLots: 'సరిపోలే రైతు లాట్లు',
      tabMyOffers: 'నేను పంపిన ఆఫర్లు',
      createDemandTitle: 'కొత్త కొనుగోలు డిమాండ్‌ను నమోదు చేయండి',
      createDemandSubtitle: 'మీ పంట అవసరాలను నమోదు చేయండి, తద్వారా సరైన రైతులను అల్గారిథమ్ కనుగొంటుంది.',
      commodityLabel: 'పంట / సరుకు',
      commodityPlaceholder: 'ఉదా. ఉల్లిపాయ (Onion), సోయాబీన్ (Soybean)',
      quantityLabel: 'అవసరమైన పరిమాణం',
      unitLabel: 'యూనిట్ (Unit)',
      requiredGradeLabel: 'అవసరమైన నాణ్యతా గ్రేడ్',
      locationLabel: 'కొనుగోలుదారు ప్రాంతం / జిల్లా',
      locationPlaceholder: 'ఉదా. నాసిక్, పూణే, ఛత్రపతి శంభాజీనగర్',
      deliveryLocationLabel: 'డెలివరీ ప్రాంతం / వేర్‌హౌస్',
      deliveryLocationPlaceholder: 'ఉదా. చాకన్ వేర్‌హౌస్, పూణే',
      minPriceLabel: 'కనిష్ట ధర (రూ./క్వింటాల్)',
      maxPriceLabel: 'గరిష్ట ధర (రూ./క్వింటాల్)',
      deadlineLabel: 'డెలివరీ గడువు తేదీ',
      descriptionLabel: 'డిమాండ్ వివరణ / ప్రత్యేక సూచనలు',
      descriptionPlaceholder: 'ఉదా. మంచి పొడి నాణ్యత గల ఉల్లిపాయలు, కనీసం 50 మిమీ పరిమాణం.',
      submitDemandBtn: 'డిమాండ్‌ను సమర్పించండి',
      submittingDemand: 'సమర్పిస్తోంది...',
      demandCreatedSuccess: 'కొనుగోలు డిమాండ్ విజయవంతంగా నమోదు చేయబడింది!',
      demandsCount: 'మొత్తం డిమాండ్లు',
      noActiveDemands: 'ప్రస్తుతానికి ఎటువంటి క్రియాశీల డిమాండ్లు నమోదు కాలేదు.',
      viewMatchesBtn: 'సరిపోలే లాట్లను చూడండి',
      priceRange: 'ఆమోదయోగ్యమైన ధర పరిధి',
      deadline: 'గడువు తేదీ',
      browseLotsTitle: 'లభ్యమయ్యే రైతు పంట లాట్లు',
      browseLotsSubtitle: 'నమోదైన డిమాండ్లకు సరిపోలే రైతు లాట్లు, మ్యాచ్ స్కోర్ మరియు రెండు అంచెల నాణ్యతా స్థితి.',
      noMatchingLots: 'ఈ డిమాండ్‌కు సరిపోయే రైతు లాట్లు ప్రస్తుతానికి లేవు.',
      matchStrength: 'మ్యాచ్ బలం',
      farmerLotId: 'రైతు లాట్ ID',
      expectedPrice: 'ఆశించిన ధర',
      makeOfferBtn: 'ఆఫర్ పంపండి (Make Offer)',
      filterByDemand: 'డిమాండ్ ప్రకారం ఫిల్టర్ చేయండి',
      allDemands: 'అన్ని డిమాండ్లు',
      makeOfferTitle: 'రైతుకు డిజిటల్ కొనుగోలు ఆఫర్ పంపండి',
      makeOfferSubtitle: 'ఈ పంట లాట్ కోసం మీ కొనుగోలు ఆఫర్ పంపండి. రైతు ఆమోదించే వరకు ఇది పెండింగ్‌లో ఉంటుంది.',
      offerPriceLabel: 'ఆఫర్ చేసిన ధర (రూ./క్వింటాల్)',
      offerQtyLabel: 'ఆఫర్ చేసిన పరిమాణం (క్వింటాల్)',
      deliveryTermsLabel: 'డెలివరీ నిబంధనలు',
      deliveryTermsPlaceholder: 'ఉదా. ఫార్మ్-గేట్ పికప్ / కొనుగోలుదారు వేర్‌హౌస్ డెలివరీ',
      paymentTermsLabel: 'చెల్లింపు నిబంధనలు',
      paymentTermsPlaceholder: 'ఉదా. డెలివరీ తర్వాత 24 గంటల్లో బ్యాంక్ ఎస్క్రో ద్వారా ఖాతాలో జమ',
      expiryDateLabel: 'ఆఫర్ చెల్లుబాటు గడువు',
      offerNotesLabel: 'అదనపు గమనికలు',
      offerNotesPlaceholder: 'ఉదా. నాణ్యత తనిఖీ పూర్తయిన వెంటనే సరుకు తరలింపు.',
      submitOfferBtn: 'ఆఫర్‌ను పంపించండి',
      submittingOffer: 'ఆఫర్ పంపుతోంది...',
      offerCreatedSuccess: 'కొనుగోలు ఆఫర్ విజయవంతంగా పంపబడింది!',
      offerPendingNotice: 'ఆఫర్ ప్రస్తుతం పెండింగ్ (Pending) లో ఉంది. రైతు ఆమోదించిన తర్వాత లాట్ రిజర్వ్ అవుతుంది.',
      myOffersTitle: 'నేను పంపిన కొనుగోలు ఆఫర్లు',
      myOffersSubtitle: 'రైతులకు పంపిన అన్ని ఆఫర్ల స్థితి మరియు ప్రత్యక్ష ట్రాకింగ్.',
      noSentOffers: 'మీరు ఇంకా ఎటువంటి కొనుగోలు ఆఫర్లను పంపలేదు.',
      cancelOfferBtn: 'ఆఫర్‌ను రద్దు చేయండి',
      cancelSuccess: 'ఆఫర్ విజయవంతంగా రద్దు చేయబడింది.',
      confirmCancel: 'మీరు ఈ ఆఫర్‌ను ఖచ్చితంగా రద్దు చేయాలనుకుంటున్నారా?',
      trustNoticeTitle: 'పారదర్శకత మరియు విశ్వసనీయత సూత్రాలు',
      trustNoticeDesc: 'వ్యాపార గుర్తింపు ధృవీకరణ మరియు వాణిజ్య రికార్డు రెండూ విడివిడిగా పారదర్శకంగా చూపబడతాయి. కృత్రిమ రేటింగ్‌లు అనుమతించబడవు.',
      demoNotice: 'డెమో మోడ్: ఇది ప్రోటోటైప్ ప్రదర్శన కోసం మాత్రమే. ఎటువంటి వాస్తవ ఆర్థిక లావాదేవీలు లేదా ఒప్పందాలు జరగవు.',
    },
    transport: {
      hubTitle: 'రవాణాదారు లాజిస్టిక్స్ & డిస్పాచ్ హబ్',
      hubSubtitle: 'వాణిజ్య రవాణా వాహనాలను నిర్వహించండి, వ్యవసాయ ఉత్పత్తుల రవాణా అభ్యర్థనలను సమీక్షించండి మరియు పంపిణీ వివరాలను అప్‌డేట్ చేయండి.',
      roleBadge: 'పాత్ర: రవాణాదారు లాజిస్టిక్స్',
      logisticsNetworkTitle: 'రవాణా లాజిస్టిక్స్ నెట్‌వర్క్',
      logisticsNetworkDesc: 'వ్యవసాయ క్షేత్రం నుండి మార్కెట్లకు మరియు ప్రాసెసింగ్ కేంద్రాలకు కిలోమీటరుకు పారదర్శక సరుకు రవాణా ధరలతో కనెక్ట్ చేయండి.',
      demoTransporterSelector: 'ప్రోటోటైప్ డెమో రవాణాదారుని మార్చండి',
      activeTransporterProfile: 'యాక్టివ్ రవాణాదారు ప్రొఫైల్',
      switchTransporter: 'రవాణాదారుని మార్చండి',
      verifiedPermit: 'RTO వాణిజ్య పర్మిట్ ధృవీకరించబడింది',
      unverifiedPermit: 'ధృవీకరణ పెండింగ్‌లో ఉంది',
      operationalDistrictsLabel: 'కార్యాచరణ జిల్లాలు',
      fleetRating: 'రేటింగ్ స్కోరు',
      tripsCompleted: 'పూర్తయిన ప్రయాణాలు',
      onTimeRate: 'సమయానికి డెలివరీ',
      tabFleet: 'వాహన సమూహం',
      tabRequests: 'వచ్చిన అభ్యర్థనలు',
      tabDispatches: 'రవాణా ట్రాకింగ్',
      registerVehicleBtn: 'కొత్త వాహనం జోడించండి',
      fleetOverviewTitle: 'వాహన సామర్థ్యం మరియు రవాణా రేట్లు',
      fleetOverviewSubtitle: 'వ్యవసాయ ఉత్పత్తుల రవాణా కోసం నమోదైన యాక్టివ్ వాహనాలు.',
      vehicleTypeLabel: 'వాహనం మోడల్',
      vehicleRegLabel: 'రిజిస్ట్రేషన్ నంబర్',
      capacityLabel: 'రవాణా సామర్థ్యం',
      ratePerKmLabel: 'ధర / కి.మీ',
      coldChainLabel: 'కోల్డ్ చైన్ వాహనం',
      availableBadge: 'అందుబాటులో ఉంది',
      busyBadge: 'ప్రయాణంలో ఉంది',
      refrigeratedBadge: 'శీతలీకరణ (రీఫర్)',
      standardBadge: 'సాధారణ కార్గో',
      incomingRequestsTitle: 'వచ్చిన వ్యవసాయ రవాణా అభ్యర్థనలు',
      incomingRequestsSubtitle: 'రైతులు మరియు ఎఫ్‌పిఓల నుండి వచ్చిన పికప్ మరియు డెలివరీ అభ్యర్థనలు.',
      noRequestsReceived: 'ఇంకా ఎలాంటి పెండింగ్ రవాణా అభ్యర్థనలు రాలేదు.',
      lotDetailsLabel: 'ఉత్పత్తి లాట్',
      pickupLocationLabel: 'పికప్ ప్రాంతం',
      dropLocationLabel: 'డెలివరీ ప్రాంతం',
      distanceLabel: 'రవాణా దూరం',
      tripsLabel: 'అవసరమైన ట్రిప్పులు',
      estimatedEarnings: 'అంచనా సరుకు రవాణా ఛార్జీ',
      costPerQtlLabel: 'ఛార్జీ / క్వింటాల్',
      scheduledPickupLabel: 'షెడ్యూల్ చేసిన సమయం',
      actualDeliveryLabel: 'డెలివరీ చేసిన సమయం',
      statusRequested: 'రవాణా కోరబడింది',
      statusAccepted: 'అంగీకరించబడింది',
      statusRejected: 'తిరస్కరించబడింది',
      statusInTransit: 'ప్రయాణంలో ఉంది',
      statusDelivered: 'డెలివరీ పూర్తయింది',
      statusCancelled: 'రద్దు చేయబడింది',
      acceptRequestBtn: 'అభ్యర్థనను అంగీకరించండి',
      declineRequestBtn: 'తిరస్కరించండి',
      markInTransitBtn: 'ప్రయాణం ప్రారంభించండి',
      markDeliveredBtn: 'డెలివరీ పూర్తయినట్లు గుర్తించండి',
      activeDispatchesTitle: 'యాక్టివ్ & పూర్తయిన రవాణా రికార్డులు',
      activeDispatchesSubtitle: 'రవాణా మైలురాళ్లు మరియు పూర్తి స్థితిని ట్రాక్ చేయండి.',
      noDispatchesFound: 'ప్రస్తుతం యాక్టివ్ రవాణా ఏదీ లేదు.',
      formulaTitle: 'పారదర్శక వ్యయ సూత్రం',
      formulaText: 'ట్రిప్పులు = ⌈లాట్ పరిమాణం / సామర్థ్యం⌉ • అంచనా వ్యయం = ట్రిప్పులు × దూరం (కి.మీ) × ధర/కి.మీ',
      netRealisationNote: 'ఈ పారదర్శక రవాణా వ్యయం నేరుగా ఫేజ్ 6 నికర రాబడి (Net Realisation) గణనలో ఉపయోగించబడుతుంది.',
      lotTransportTitle: 'రవాణా & లాజిస్టిక్స్ నిర్వహణ',
      lotTransportSubtitle: 'ఈ లాట్ కోసం నిర్ణయించబడిన పారదర్శక కిలోమీటర్ ధరలతో ధృవీకరించబడిన వాహనాలను బుక్ చేయండి.',
      findTransportersBtn: 'రవాణా ఎంపికలను కనుగొనండి',
      destinationLabel: 'డెలివరీ గమ్యస్థానం / మార్కెట్',
      destinationPlaceholder: 'ఉదా. పూణే మార్కెట్ యార్డ్, వాషి ఏపీఎంసీ',
      preferColdChainLabel: 'శీతలీకరణ (కోల్డ్ చైన్) వాహనం అవసరం',
      matchingTransportersTitle: 'అందుబాటులో ఉన్న రవాణాదారులు మరియు వాహనాలు',
      noTransportersAvailable: 'ఈ మార్గానికి రవాణాదారులు ఎవరూ అందుబాటులో లేరు.',
      costEquationLabel: 'పారదర్శక వ్యయ సమీకరణం',
      bookTransportBtn: 'రవాణా అభ్యర్థనను పంపండి',
      bookingModalTitle: 'రవాణా అభ్యర్థన బుకింగ్',
      bookingModalSubtitle: 'ఎంచుకున్న రవాణాదారుతో పికప్ సమయం మరియు వివరాలను ధృవీకరించండి.',
      scheduledDateLabel: 'పికప్ తేదీ',
      transportNotesLabel: 'ప్రత్యేక సూచనలు / చిరునామా వివరాలు',
      transportNotesPlaceholder: 'ఉదా. గ్రామంలోని పాఠశాల దగ్గర, సంచులలో ప్యాకింగ్',
      confirmBookingBtn: 'అభ్యర్థనను పంపండి',
      bookingSuccess: 'రవాణా అభ్యర్థన విజయవంతంగా పంపబడింది!',
      activeBookingsTitle: 'ఈ లాట్ కోసం నమోదు చేసిన రవాణా',
      noBookingsYet: 'ఇంకా రవాణా బుక్ చేయలేదు. కింద ఉన్న ఎంపికల నుండి ఎంచుకోండి.',
      demoNotice: 'డెమో నోటీసు: వ్యవసాయ కారిడార్ కోసం లాజిస్టిక్స్ అనుకరణ. నిజమైన వాహన రవాణా ప్రారంభించబడదు.',
    },
    netRealisation: {
      hubTitle: 'నికర రాబడి (Net Realisation) & స్మార్ట్ విక్రయ సిఫార్సు',
      hubSubtitle: 'రవాణా, నిల్వ మరియు మార్కెట్ సెస్ మినహాయింపుల తర్వాత చేతికి అందే నిజమైన నికర రాబడిని లెక్కించండి.',
      netRealisation: 'నికర రాబడి (Net Realisation)',
      grossSaleValue: 'మొత్తం విక్రయ విలువ',
      transportCost: 'రవాణా వ్యయ మినహాయింపు',
      storageCost: 'గోదాము నిల్వ వ్యయం',
      otherCosts: 'సెస్ మరియు హ్యాండ్లింగ్ ఛార్జీలు',
      netPerQuintal: 'క్వింటాల్‌కు నికర రాబడి',
      bestSellingOption: 'అత్యుత్తమ విక్రయ ఎంపిక',
      sellNow: 'ఇప్పుడే విక్రయించండి',
      storeAndSellLater: 'నిల్వ చేసి తర్వాత విక్రయించండి',
      waitAndWatch: 'వేచి చూసి మార్కెట్‌ను గమనించండి',
      estimatedLabel: 'అంచనా / హామీ లేనిది',
      notGuaranteed: 'అంచనా — మార్కెట్ హెచ్చుతగ్గులకు లోబడి ఉంటుంది',
      whyThisRecommendation: 'ఈ సిఫార్సు ఎందుకు?',
      howIsThisCalculated: 'నికర రాబడి ఎలా లెక్కించబడుతుంది?',
      compareSellingOptions: 'విక్రయ మార్గాలను సరిపోల్చండి',
      currentPrice: 'ప్రస్తుత విక్రయ ధర',
      expectedFuturePrice: 'ఆశించిన భవిష్యత్ ధర',
      potentialImprovement: 'సంభావ్య ధర పెరుగుదల',
      reliability: 'వాణిజ్య విశ్వసనీయత',
      assumptions: 'ఆర్థిక మరియు ఆచరణాత్మక ఊహలు',
      demoData: 'నమూనా మార్కెట్ డేటా',
      estimatedData: 'కాలానుగుణ అంచనా మోడల్',
      insufficientData: 'సిఫార్సు కోసం సరిపోని మార్కెట్ డేటా.',
      holdingDaysLabel: 'నిల్వ వ్యవధి (రోజులు)',
      tableOption: 'విక్రయ మార్గం / గమ్యం',
      tableGross: 'మొత్తం ధర / క్వింటాల్',
      tableTransport: 'రవాణా / క్వింటాల్',
      tableStorage: 'నిల్వ / క్వింటాల్',
      tableOther: 'ఇతర / క్వింటాల్',
      tableNet: 'నికర రాబడి / క్వింటాల్',
      tableAction: 'సిఫార్సు / చర్య',
      formulaTitle: 'కిసాన్ సేతు ఖచ్చితమైన రాబడి సూత్రం',
      formulaGrossText: 'మొత్తం విక్రయ విలువ = పంట పరిమాణం (క్వింటాళ్లు) × విక్రయ ధర (₹/క్వింటాల్)',
      formulaTransportText: 'రవాణా వ్యయం = ట్రిప్పులు × దూరం (కి.మీ) × కి.మీ ధర (₹/కి.మీ)',
      formulaStorageText: 'నిల్వ వ్యయం = (నెలవారీ రేటు / 30) × నిల్వ రోజులు × పరిమాణం (క్వింటాళ్లు)',
      formulaNetText: 'నికర రాబడి = మొత్తం విలువ − రవాణా − నిల్వ − మార్కెట్ ఫీజులు',
      dashboardCardTitle: 'ఉత్తమ నికర రాబడి',
      dashboardCardSub: 'అత్యధిక లాభదాయక అవకాశం',
      viewAnalysisBtn: 'విశ్లేషణను వీక్షించండి',
      noOptionsAvailable: 'ఇంకా విక్రయ మార్గాలు విశ్లేషించబడలేదు.',
      mandiYardLabel: 'నియంత్రిత వ్యవసాయ మార్కెట్ యార్డ్',
      directBuyerLabel: 'ప్రత్యక్ష వాణిజ్య కొనుగోలుదారు',
      storageProjectionLabel: 'గోదాము నిల్వ అంచనా',
    },
    transactions: {
      hubTitle: 'లావాదేవీలు, ఎస్క్రో & వాణిజ్య నెరవేర్పు',
      hubSubtitle: 'దశలవారీ డిజిటల్ వాణిజ్య అమలు, ప్రోటోటైప్ చెల్లింపు స్థితి మరియు ధృవీకరించబడిన 3-వైపుల రేటింగ్‌లు.',
      myTransactionsTitle: 'నా వాణిజ్య లావాదేవీలు',
      myTransactionsSubtitle: 'వాణిజ్య ఒప్పందాలు, రవాణా స్థితి, చెల్లింపు స్థితి మరియు ప్రతిపక్ష విశ్వసనీయతను ట్రాక్ చేయండి.',
      transactionCode: 'లావాదేవీ ఐడి',
      commercialAgreement: 'వాణిజ్య ఒప్పందం',
      paymentTracking: 'చెల్లింపు ట్రాకింగ్',
      paymentStatus: 'చెల్లింపు స్థితి',
      paymentInitiated: 'చెల్లింపు ప్రారంభించబడింది',
      paymentProcessing: 'చెల్లింపు ప్రాసెసింగ్',
      paymentReceived: 'చెల్లింపు అందింది',
      paymentPaid: 'పూర్తి చెల్లింపు (చెల్లించబడింది)',
      markPaymentReceivedBtn: 'చెల్లింపు అందిందని నమోదు చేయండి (డెమో)',
      completed: 'పూర్తయింది',
      transportStatus: 'రవాణా స్థితి',
      deliveryLocation: 'డెలివరీ ప్రదేశం',
      qualityStatus: 'పంట నాణ్యత స్థితి',
      physicallyVerified: 'అధికారిక ఇన్‌స్పెక్టర్ ద్వారా ధృవీకరించబడింది',
      aiVisualScreening: 'AI ప్రాథమిక అంచనా — ధృవీకరించబడలేదు',
      agreedPricePerQtl: 'ఒప్పుకున్న ధర / క్వింటాల్',
      grossContractValue: 'మొత్తం ఒప్పంద విలువ',
      netRealisation: 'నికర రాబడి',
      takeHomeEstimate: 'రైతు నికర లాభం',
      threeWayRatings: 'లావాదేవీ ఆధారిత 3-వైపుల రేటింగ్‌లు',
      rateThisTransaction: 'ఈ వ్యాపారాన్ని రేట్ చేయండి',
      ratingSubmitted: 'రేటింగ్ విజయవంతంగా సమర్పించబడింది',
      submitRatingBtn: 'ధృవీకరించబడిన రేటింగ్‌ను సమర్పించండి',
      ratingFeedbackPlaceholder: 'అనుభవాన్ని పంచుకోండి (సమయపాలన, నాణ్యత, వేగవంతమైన చెల్లింపు)...',
      disputeGrievance: 'ఫిర్యాదు & వివాద పరిష్కారం',
      raiseDisputeBtn: 'వ్యాపార వివాదాన్ని లేవనెత్తండి',
      viewTransactionBtn: 'లావాదేవీ వివరాలను వీక్షించండి',
      filterAll: 'అన్ని లావాదేవీలు',
      filterActive: 'ప్రస్తుత లావాదేవీలు',
      filterCompleted: 'పూర్తయినవి',
      filterDisputed: 'వివాదంలో ఉన్నవి',
      noTransactionsFound: 'వాణిజ్య లావాదేవీలు ఏవీ కనుగొనబడలేదు.',
      timelineTitle: 'వాణిజ్య నెరవేర్పు కాలక్రమం',
      prototypeNotice: 'చెల్లింపు ట్రాకింగ్ డెమో — నిజమైన బ్యాంకు బదిలీ జరగదు.',
      reputationVsVerificationNote: 'ప్రభుత్వ ధృవీకరణ అనేది వాణిజ్య రేటింగ్‌లకు భిన్నంగా స్వతంత్రంగా ఉంటుంది.',
      buyerLabel: 'కొనుగోలుదారు / ప్రాసెసర్',
      farmerLabel: 'రైతు / FPO ఉత్పత్తిదారు',
      transporterLabel: 'వాణిజ్య రవాణాదారు',
    },
    disputes: {
      hubTitle: 'సాక్ష్యాధారాల ఆధారిత వివాద పరిష్కార వ్యవస్థ',
      hubSubtitle: 'నమోదైన డిజిటల్ లావాదేవీ సాక్ష్యాలను ఉపయోగించి FPO/మార్కెట్ కమిటీ అధికారుల ద్వారా పారదర్శక మానవ సమీక్ష.',
      raiseGrievanceTitle: 'వాణిజ్య ఫిర్యాదును నమోదు చేయండి',
      disputeCode: 'ఫిర్యాదు ఐడి',
      categoryLabel: 'ఫిర్యాదు విభాగం',
      descriptionLabel: 'వివరణాత్మక ఫిర్యాదు & వ్యత్యాసం',
      descriptionPlaceholder: 'బరువు, గ్రేడ్ వ్యత్యాసం, రవాణా ఆలస్యం లేదా చెల్లింపు సమస్యను వివరంగా రాయండి...',
      submitGrievanceBtn: 'మార్కెట్ కమిటీ/FPO అధికారికి ఫిర్యాదు సమర్పించండి',
      statusOpen: 'ఓపెన్ (సమీక్ష పెండింగ్‌లో ఉంది)',
      statusUnderReview: 'ఫిర్యాదుల అధికారి సమీక్షలో ఉంది',
      statusResolved: 'పరిష్కరించబడింది',
      statusRejected: 'తిరస్కరించబడింది',
      statusClosed: 'ముగిసింది',
      categoryQualityMismatch: 'నాణ్యత మరియు గ్రేడ్ వ్యత్యాసం',
      categoryDeliveryDelay: 'రవాణా మరియు డెలివరీ ఆలస్యం',
      categoryPaymentDelay: 'చెల్లింపు పరిష్కార ఆలస్యం',
      categoryWeightDiscrepancy: 'బరువు వ్యత్యాసం',
      categoryPriceDisagreement: 'ఒప్పుకున్న ధరపై వివాదం',
      categoryCancellation: 'ఏకపక్ష రద్దు',
      categoryOther: 'ఇతర ఫిర్యాదు',
      evidenceChecklistTitle: 'అవసరమైన సాక్ష్యాధారాల జాబితా',
      humanAdjudicationNote: 'వ్యవసాయ వాణిజ్య వివాదాలను AI స్వయంచాలకంగా నిర్ణయించకూడదు. మానవ సమీక్ష తప్పనిసరి.',
      adminPanelTitle: 'మహారాష్ట్ర వ్యవసాయ వివాద పరిష్కార పోర్టల్',
      resolutionNotesLabel: 'అధికారిక నిర్ణయం & పరిష్కార గమనికలు',
      resolutionNotesPlaceholder: 'వేబ్రిడ్జి రసీదులు, నాణ్యతా సర్టిఫికేట్ మరియు ఒప్పంద నిబంధనల ఆధారంగా నిర్ణయం నమోదు చేయండి...',
      markUnderReviewBtn: 'సమీక్షలో ఉన్నట్లు మార్క్ చేయండి',
      resolveDisputeBtn: 'వివాదాన్ని పరిష్కరించండి',
      closeDisputeBtn: 'ఫిర్యాదును ముగించండి',
      grievanceRecordedNotice: 'మీ ఫిర్యాదు డిజిటల్ లావాదేవీ సాక్ష్యాలతో నమోదు చేయబడింది.',
      noDisputesFound: 'సక్రియ వివాదాలు ఏవీ లేవు.',
    },
    calculator: {
      title: 'నికర రాబడి గణన ఇంజిన్',
      subtitle: 'కేవలం స్థూల ధరను మాత్రమే చూడకండి. రైతు చేతికి వచ్చే అసలు నికర లాభాన్ని లెక్కించడానికి రవాణా, నిల్వ మరియు మార్కెట్ రుసుములను పరిగణనలోకి తీసుకోండి.',
      badge: 'ప్రధాన యుఎస్పీ ఇంజిన్',
      parametersCardTitle: 'పంట మరియు దిగుబడి వివరాలు',
      parametersCardSub: 'నికర రాబడి గణన కోసం వివరాలను నమోదు చేయండి.',
      selectCropLabel: 'పంటను ఎంచుకోండి (22 రకాలు అందుబాటులో ఉన్నాయి)',
      harvestQtyLabel: 'దిగుబడి పరిమాణం',
      sellingPriceLabel: 'విక్రయ ధర (క్వింటాల్‌కు)',
      distanceLabel: 'మార్కెట్ / కొనుగోలుదారు దూరం',
      storageDurationLabel: 'నిల్వ కాలం (వేర్‌హౌస్ / కోల్డ్ స్టోరేజ్)',
      daysUnit: 'రోజులు',
      quintalsUnit: 'క్వింటాళ్లు',
      perQtlUnit: '/ క్విం.',
      resultTitle: 'లెక్కించబడిన నికర రాబడి',
      takeHomeLabel: 'రైతు చేతికి వచ్చే నికర ఆదాయం',
      perQuintal: '/ క్వింటాల్',
      grossSaleValue: 'మొత్తం స్థూల విక్రయ విలువ',
      transportFreight: 'రవాణా చార్జీలు',
      storageCost: 'నిల్వ ఖర్చు',
      mandiCessHandling: 'మార్కెట్ సెస్ & హ్యాండ్లింగ్ ఖర్చులు',
      totalDeductions: 'మొత్తం తగ్గింపులు',
      formulaTitle: 'నికర రాబడి సూత్రం',
      formulaText: 'నికర రాబడి = స్థూల విక్రయ విలువ - రవాణా ఖర్చు - నిల్వ ఖర్చు - ఇతర వర్తించే ఖర్చులు',
      loadedFromMarket: 'మార్కెట్ నుండి లోడ్ చేసిన పారామితులు',
      resetDefaults: 'డిఫాల్ట్‌లను రీసెట్ చేయండి',
    },
    markets: {
      title: 'మార్కెట్ ధరలు & రాక పరిమాణాలు',
      subtitle: 'మహారాష్ట్ర & ఆంధ్రప్రదేశ్ (విశాఖపట్నం ప్రాంతం) మార్కెట్ కమిటీల రోజువారీ సగటు ధరలు మరియు రాకల ట్రాకింగ్.',
      badge: 'ఏపీఎంసీ మార్కెట్ సమాచారం',
      dataNoticeTitle: 'నిర్మాణ సూత్రం: డేటా పారదర్శకత',
      dataNoticeDesc: 'దిగువ ధరలు మహారాష్ట్ర మరియు ఆంధ్రప్రదేశ్ మార్కెట్ల డెమో ప్రోటోటైప్ డేటాను సూచిస్తాయి. లైవ్ అగ్‌మార్క్‌నెట్ / ఈ-నామ్ ఫీడ్‌లు కోర్ లాజిక్ మారకుండా అనుసంధానించబడతాయి. మేము ప్రోటోటైప్ డేటాను నిజమైన ప్రభుత్వ ఫీడ్‌గా చూపించము.',
      tableTitle: 'ప్రాంతీయ ఏపీఎంసీ రోజువారీ ధరల సమీక్ష',
      tableSub: 'క్వింటాల్‌కు సగటు ధరలు మరియు మొత్తం రోజువారీ రాకలను పోల్చడం.',
      colMarket: 'మార్కెట్ / మండి',
      colCommodity: 'వ్యవసాయ సరుకు',
      colPriceRange: 'కనిష్ట - గరిష్ట ధర',
      colModalPrice: 'సగటు ధర',
      colArrivals: 'రాకలు',
      colAction: 'చర్య',
      netProfitCheck: 'నికర లాభం తనిఖీ',
      tonnes: 'టన్నులు',
      dist: 'జిల్లా',
      calculateNetRealisation: 'నికర రాబడిని లెక్కించండి',
      archTitle: 'దశ 1 ఆర్కిటెక్చర్ ఫౌండేషన్',
      archDesc: 'ఈ డేటా డేటాబేస్ స్కీమాలోని మార్కెట్, మార్కెట్ ప్రైస్ మరియు మార్కెట్ అరైవల్ పట్టికలకు అనుసంధానించబడింది.',
    },
    voice: {
      buttonLabel: 'మాట్లాడండి',
      buttonHint: 'మైక్రోఫోన్‌ను నొక్కి మాట్లాడండి',
      listening: 'వింటున్నాము...',
      stop: 'ఆపండి',
      cancel: 'రద్దు చేయండి',
      clear: 'క్లియర్ చేయండి',
      readAloud: 'వినండి',
      notSupported: 'ఈ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి క్రింది ప్రశ్న బటన్లను ఉపయోగించండి.',
      permissionDenied: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి అనుమతించండి లేదా క్రింది బటన్లను ఉపయోగించండి.',
      youSaid: 'మీరు అడిగారు:',
      intentTitle: 'గుర్తించబడిన ఉద్దేశ్యం:',
      fallbackResponse: 'నాకు అర్థం కాలేదు. దయచేసి మార్కెట్ ధరలు, కొనుగోలుదారులు, రవాణా లేదా నికర లాభం గురించి అడగండి.',
      suggestionTitle: 'సూచించబడిన వాయిస్ ప్రశ్నలు:',
      safetyNotice: 'ప్రోటోటైప్ వాయిస్ అసిస్టెంట్: కేవలం సమాచారం మరియు నావిగేషన్ కోసం మాత్రమే. వాయిస్ ద్వారా ఎటువంటి ఆర్థిక లావాదేవీలు జరగవు.',
      queryPrice: 'ఈ రోజు ఉల్లిపాయ ధర ఎంత?',
      queryBuyers: 'నా 10 క్వింటాళ్ల ఉల్లిపాయ కోసం కొనుగోలుదారులను వెతకండి.',
      queryProfit: 'ఏ ఎంపిక నాకు ఎక్కువ డబ్బు ఇస్తుంది?',
      queryTransport: 'నా సరుకు కోసం రవాణాను కనుగొనండి.',
      queryOffers: 'నా ఆఫర్‌లను చూపించు.',
      queryTxns: 'నా లావాదేవీలను చూపించు.',
    },
  },
  hi: {
    "brand": {
      "name": "किसानसेतु",
      "tagline": "सही मंडी. सही खरीदार. सही दाम.",
      "subtagline": "स्मार्ट कृषि बाजार लिंकेज एवं वास्तविक शुद्ध लाभ (Net Realisation) मंच",
      "sihBadge": "महाराष्ट्र शासन • कृषि विपणन पहल"
    },
    "nav": {
      "home": "मुख्यपृष्ठ",
      "farmer": "किसान / FPO",
      "buyer": "खरीदार",
      "transporter": "ट्रांसपोर्टर",
      "markets": "मंडी भाव व आंकड़े",
      "calculator": "शुद्ध लाभ कैलकुलेटर",
      "getStarted": "शुरू करें",
      "lots": "मेरे लॉट्स",
      "transactions": "सौदे",
      "more": "अधिक",
      "speak": "बोलें",
      "inspector": "गुणवत्ता निरीक्षक",
      "disputes": "विवाद व शिकायतें",
      "admin": "राज्य प्रशासन"
    },
    "hero": {
      "badge": "महाराष्ट्र एवं विजाग कृषि बाजार लिंकेज",
      "titleMain": "केवल सबसे ऊँचा भाव मत देखिए।",
      "titleHighlight": "सबसे भरोसेमंद शुद्ध लाभ (Net Realisation) प्राप्त करें।",
      "tagline": "सही मंडी. सही खरीदार. सही दाम.",
      "descriptor": "किसानों के लिए स्मार्ट बाजार लिंकेज व शुद्ध लाभ मंच।",
      "coreUsp": "सिर्फ अधिक भाव मत देखिए। सबसे भरोसेमंद शुद्ध लाभ प्राप्त करें।",
      "description": "किसानसेतु किसानों और FPO को सत्यापित खरीदारों और विश्वसनीय ट्रांसपोर्टरों से जोड़ता है। मंडियों की तुलना करें, वास्तविक परिवहन व भंडारण लागत घटाएं और पूर्ण पारदर्शिता के साथ अधिकतम मुनाफा कमाएं।",
      "ctaPrimary": "शुरू करें",
      "ctaSecondary": "मंडी भाव देखें",
      "exploreMarket": "मंडी भाव देखें",
      "createProduceLot": "फसल लॉट बनाएं",
      "findBuyers": "खरीदार खोजें",
      "viewDemo": "डेमो देखें",
      "statsFarmers": "5,000+ किसान व FPO",
      "statsMandis": "300+ APMC मंडियां",
      "statsBuyers": "1,200+ सत्यापित खरीदार"
    },
    "ecosystem": {
      "title": "एकीकृत कृषि व्यापार गलियारा",
      "subtitle": "खेत से लेकर सुरक्षित भुगतान तक अखंड डिजिटल व्यवस्था",
      "farmerTitle": "किसान एवं FPO",
      "farmerDesc": "फसल लॉट बनाएं, त्वरित AI दृश्य गुणवत्ता रिपोर्ट लें, प्रमाणित भौतिक जांच करवाएं और खरीदारों से सीधे ऑफर प्राप्त करें।",
      "farmerAction": "किसान हब खोलें",
      "buyerTitle": "सत्यापित खरीदार",
      "buyerDesc": "गुणवत्ता-सत्यापित फसल सीधे खेतों से थोक में खरीदें, पारदर्शी अनुबंध और सुरक्षित डिलीवरी सुनिश्चित करें।",
      "buyerAction": "फसल लॉट देखें",
      "transporterTitle": "ट्रांसपोर्टर एवं लॉजिस्टिक्स",
      "transporterDesc": "सीधे खेत से ढुलाई बुकिंग पाएं, खाली वापसी की समस्या खत्म करें और समय पर किराया प्राप्त करें।",
      "transporterAction": "लॉजिस्टिक्स हब खोलें",
      "flowTitle": "किसानसेतु संपूर्ण व्यापार चक्र",
      "flowSubtitle": "बिचौलियों और छिपे खर्चों के बिना हर चरण में पूर्ण पारदर्शिता",
      "stepFarmer": "किसान / FPO",
      "stepMarket": "मंडी भाव जानकारी",
      "stepQuality": "गुणवत्ता प्रमाणीकरण",
      "stepMatching": "स्मार्ट खरीदार मिलान",
      "stepTransport": "परिवहन गलियारा",
      "stepNetRealisation": "शुद्ध लाभ गणना",
      "stepTransaction": "व्यापार अनुबंध",
      "stepTrust": "रेटिंग व शिकायत निवारण"
    },
    "usp": {
      "title": "किसानसेतु का मुख्य यूएसपी (USP)",
      "subtitle": "शुद्ध लाभ विश्लेषण के बिना केवल सकल मंडी भाव भ्रामक हो सकता है",
      "formulaLabel": "मूल शुद्ध लाभ (Net Realisation) सूत्र",
      "formulaGross": "सकल बिक्री मूल्य (Gross Sale Value)",
      "formulaTransport": "परिवहन लागत (Transport Cost)",
      "formulaStorage": "भंडारण शुल्क (Storage Cost)",
      "formulaOther": "अन्य शुल्क व हमाली (Handling & Cess)",
      "formulaNet": "शुद्ध प्राप्त लाभ (NET REALISATION)",
      "explanation": "दूर की मंडी में ₹2,500/क्विंटल का भाव मिल सकता है जबकि स्थानीय मंडी में ₹2,200। लेकिन ₹350/क्विंटल परिवहन, लोडिंग और रास्ते की घटत के बाद दूर की मंडी से केवल ₹2,150 ही हाथ आते हैं! किसानसेतु ट्रक लोड करने से पहले आपको सही शुद्ध मुनाफा बताता है।",
      "interactiveDemoTitle": "मंडियों में शुद्ध लाभ की सीधी तुलना करें"
    },
    "valueProps": {
      "title": "चार प्रमुख तकनीकी स्तंभ",
      "subtitle": "ग्रामीण सहजता, अटूट विश्वास और पारदर्शी कृषि अर्थशास्त्र के लिए निर्मित",
      "p1Title": "मंडी बुद्धिमत्ता",
      "p1Desc": "लासलगांव, पुणे, सोलापूर, वाशी, विजाग और सभी प्रमुख APMC मंडियों के दैनिक मॉडल भाव और आगमन आंकड़े।",
      "p2Title": "शुद्ध लाभ इंजन",
      "p2Desc": "वास्तविक सड़क दूरी, वाहन क्षमता, गोदाम शुल्क और मंडी टैक्स घटाकर किसान की जेब में आने वाला सच्चा मुनाफा।",
      "p3Title": "विश्वसनीयता व रेटिंग",
      "p3Desc": "कड़ा वैधानिक सत्यापन, डिलीवरी पश्चात 3-तरफा रेटिंग और अधिकृत परीक्षकों द्वारा भौतिक ग्रेडिंग।",
      "p4Title": "एकीकृत लॉजिस्टिक्स",
      "p4Desc": "1-टन पिकअप से लेकर 10-टन ट्रक तक सटीक क्षमता मिलान और पारदर्शी प्रति-किमी भाड़ा दरें।"
    },
    "footer": {
      "govtCredit": "किसानों के लिए बाजार लिंकेज और मूल्य खोज को सुदृढ़ बनाना | महाराष्ट्र शासन",
      "disclaimer": "प्रोटोटाइप डेमो आर्किटेक्चर। लाइव एगमार्कनेट (Agmarknet) एवं MSAMB एपीआई को सीधे जोड़ा जा सकता है।",
      "phaseNotice": "फेज 8 पूर्ण: एंड-टू-एंड एकीकृत डिजिटल कृषि मंच"
    },
    "farmer": {
      "badge": "भूमिका: किसान / FPO",
      "title": "किसान एवं FPO प्रबंधन हब",
      "subtitle": "फसल लॉट प्रबंधित करें, खरीद प्रस्ताव देखें और सबसे लाभकारी मंडी चुनें।",
      "createLotCTA": "नया फसल लॉट दर्ज करें",
      "activeLotsCard": "सक्रिय फसल लॉट",
      "activeLotsSub": "बाजार में सूचीबद्ध",
      "incomingOffersCard": "प्राप्त खरीद ऑफर",
      "incomingOffersSub": "समीक्षा व स्वीकृति हेतु",
      "fpoMembershipCard": "FPO सदस्यता स्थिति",
      "fpoMembershipSub": "एकत्रित मात्रा: 420 टन",
      "recentLotsTitle": "हाल के फसल लॉट",
      "viewAllLots": "सभी लॉट देखें",
      "engineTitle": "शुद्ध लाभ निर्णय इंजन",
      "engineDesc": "केवल सबसे अधिक भाव मत देखिए। लासलगांव, पुणे, विजाग और सीधे खरीदारों के भाव से परिवहन खर्च काटकर शुद्ध मुनाफे की तुलना करें।",
      "engineAction": "शुद्ध लाभ तुलना करें",
      "qualityTitle": "द्वि-स्तरीय गुणवत्ता सत्यापन",
      "qualityDesc": "AI दृश्य स्क्रीनिंग हेतु फोटो अपलोड करें और अधिकृत परीक्षकों द्वारा प्रमाणित भौतिक गुणवत्ता रिपोर्ट प्राप्त करें।",
      "qualityAction": "गुणवत्ता परीक्षण प्रोटोकॉल",
      "noticeTitle": "फेज 2 आर्किटेक्चर आधार",
      "noticeDesc": "यह रूट SQLite में FarmerProfile, FPO, ProduceLot और Offer मॉडल्स से सीधे जुड़ा हुआ है।"
    },
    "lots": {
      "badge": "डिजिटल फसल लॉट्स",
      "title": "डिजिटल फसल लॉट्स",
      "subtitle": "किसानों और FPO द्वारा वजन, अपेक्षित मूल्य और गुणवत्ता विवरण के साथ तैयार किए गए मानकीकृत डिजिटल लॉट।",
      "createNew": "नया लॉट बनाएं",
      "filterAll": "सभी लॉट",
      "filterAvailable": "उपलब्ध / सूचीबद्ध",
      "filterDraft": "ड्राफ्ट (Draft)",
      "filterReserved": "आरक्षित",
      "filterSold": "बिक्री पूर्ण",
      "emptyTitle": "अभी तक कोई फसल लॉट नहीं है",
      "emptyDesc": "आपने अभी तक कोई फसल लॉट नहीं बनाया है। खरीद प्रस्ताव व परिवहन दरें पाने के लिए फसल दर्ज करें।",
      "createFirstLot": "अपना पहला लॉट बनाएं",
      "loading": "फसल लॉट लोड हो रहे हैं...",
      "lotId": "लॉट आईडी",
      "crop": "उपज / फसल",
      "variety": "किस्म / प्रजाति",
      "volume": "मात्रा (वजन)",
      "targetPrice": "अपेक्षित मूल्य",
      "location": "स्थान / पता",
      "status": "स्थिति",
      "grade": "ग्रेड",
      "actions": "कार्रवाई",
      "viewDetails": "विवरण देखें",
      "editLot": "संशोधित करें",
      "calculateRealisation": "शुद्ध लाभ निकालें",
      "offersReceived": "प्राप्त ऑफर्स",
      "createModalTitle": "नया फसल लॉट पंजीकृत करें",
      "createModalSubtitle": "प्रमाणित खरीदारों और ट्रांसपोर्टरों के लिए अपनी फसल की सटीक जानकारी भरें।",
      "editModalTitle": "फसल लॉट संशोधित करें",
      "cropLabel": "उपज / फसल चुनें",
      "selectCrop": "फसल चुनें",
      "cropCustomPlaceholder": "या अन्य फसल का नाम लिखें",
      "varietyLabel": "किस्म / प्रजाति",
      "varietyPlaceholder": "उदा. नासिक लाल गरवा, जेएस-335, सांबर...",
      "quantityLabel": "उपज मात्रा (वजन)",
      "unitLabel": "इकाई",
      "expectedPriceLabel": "अपेक्षित बिक्री मूल्य (₹)",
      "expectedPricePerQtl": "अपेक्षित मूल्य प्रति क्विंटल",
      "expectedGradeLabel": "अपेक्षित गुणवत्ता ग्रेड",
      "gradeA": "ग्रेड A (उत्कृष्ट / निर्यात ग्रेड)",
      "gradeB": "ग्रेड B (मानक मंडी ग्रेड)",
      "gradeC": "ग्रेड C (सामान्य औसत ग्रेड - FAQ)",
      "gradeNotYet": "अभी ग्रेड निर्धारित नहीं (स्क्रीनिंग लंबित)",
      "harvestDateLabel": "कटाई की तिथि",
      "availabilityDateLabel": "उठाव / डिलीवरी हेतु उपलब्ध तिथि",
      "districtLabel": "जिला",
      "selectDistrict": "जिला चुनें (महाराष्ट्र / आंध्र प्रदेश)",
      "locationLabel": "गांव / खेत का पता",
      "locationPlaceholder": "उदा. निफाड, नासिक या अनकापल्ले...",
      "descriptionLabel": "भंडारण विधि / टिप्पणी",
      "descriptionPlaceholder": "उदा. हवादार चाली में भंडारित, सूखा, ग्रेडिंग पूर्ण।",
      "saveDraftBtn": "ड्राफ्ट के रूप में सहेजें",
      "publishBtn": "लॉट बनाकर प्रकाशित करें",
      "updateBtn": "जानकारी अपडेट करें",
      "cancelBtn": "रद्द करें",
      "savingBtn": "सहेजा जा रहा है...",
      "backToList": "सभी लॉट्स पर वापस जाएं",
      "detailTitle": "फसल लॉट विवरण",
      "specificationsTitle": "कटाई व फसल विशेषताएं",
      "futureOfferTitle": "खरीदार ऑफर्स व बोलियां",
      "futureOfferDesc": "प्रमाणित खाद्य प्रसंस्करण उद्योगों, निर्यातकों और थोक व्यापारियों की सीधी बोलियां यहां दिखेंगी।",
      "futureQualityTitle": "द्वि-स्तरीय गुणवत्ता मूल्यांकन",
      "futureQualityDesc": "AI दृश्य स्क्रीनिंग और अधिकृत भौतिक गुणवत्ता जांच स्थिति।",
      "futureLogisticsTitle": "एकीकृत परिवहन व उठाव",
      "futureLogisticsDesc": "खेत से उठाव हेतु ट्रांसपोर्टर खोजें, भाड़ा दरें जांचें और ट्रैकिंग करें।",
      "futureNetTitle": "शुद्ध लाभ तुलना विश्लेषण",
      "futureNetDesc": "परिवहन, भंडारण और सेस घटाकर वास्तव में हाथ में आने वाले पैसों की सटीक गणना।",
      "futureEscrowTitle": "भुगतान व सुरक्षित एस्क्रो",
      "futureEscrowDesc": "बैंक-स्तरीय एस्क्रो जो डिलीवरी पुष्टि होते ही किसान को तत्काल भुगतान सुनिश्चित करता है।"
    },
    "quality": {
      "sectionTitle": "द्वि-स्तरीय गुणवत्ता सत्यापन",
      "sectionSubtitle": "AI विजुअल अनुमानों को आधिकारिक भौतिक जांच से अलग रखने वाली पारदर्शी ग्रेडिंग प्रणाली।",
      "tier1Title": "स्तर 1: AI दृश्य स्क्रीनिंग",
      "tier1Subtitle": "फसल की तस्वीरों पर आधारित प्रारंभिक दृश्य स्क्रीनिंग",
      "tier1Badge": "AI मूल्यांकन — असत्यापित",
      "tier1Disclaimer": "केवल प्रारंभिक दृश्य अनुमान। औपचारिक व्यापार ग्रेडिंग हेतु अधिकृत भौतिक सत्यापन आवश्यक है।",
      "tier2Title": "स्तर 2: भौतिक गुणवत्ता सत्यापन",
      "tier2Subtitle": "प्रमाणित परीक्षकों द्वारा व्यक्तिगत रूप से की गई आधिकारिक व्यापार ग्रेडिंग",
      "tier2BadgePending": "भौतिक सत्यापन लंबित",
      "tier2BadgeVerified": "भौतिक रूप से सत्यापित",
      "tier2BadgeRejected": "अमान्य",
      "tier2BadgeReinspection": "पुनः जांच आवश्यक",
      "requestAiAssessment": "AI मूल्यांकन का अनुरोध करें",
      "aiModalTitle": "प्रारंभिक AI दृश्य मूल्यांकन",
      "aiModalSubtitle": "प्रारंभिक दृश्य पैरामीटर दर्ज करें। परिणाम \"AI मूल्यांकन — असत्यापित\" के रूप में चिह्नित होंगे।",
      "colorLabel": "रंग एकरूपता",
      "colorPlaceholder": "उदा. गहरा लाल, एकसमान रंगत",
      "visibleDamageLabel": "सतही क्षति",
      "visibleDamagePlaceholder": "उदा. न्यूनतम (< 2% छिलका उतरा)",
      "sizeUniformityLabel": "आकार एकरूपता (%)",
      "visibleDefectsLabel": "दृश्य दोष (%)",
      "estimatedGradeLabel": "प्रारंभिक ग्रेड सुझाव",
      "assessmentNotesLabel": "मूल्यांकन टिप्पणी / अवलोकन",
      "assessmentNotesPlaceholder": "उदा. 55-65 मिमी समान आकार, सूखा छिलका, मजबूत गर्दन।",
      "runAiAssessmentBtn": "AI मूल्यांकन दर्ज करें",
      "runningAssessment": "मूल्यांकन दर्ज हो रहा है...",
      "inspectorDashboardTitle": "द्वि-स्तरीय गुणवत्ता निरीक्षण डेस्क",
      "inspectorDashboardSubtitle": "कड़े द्वि-स्तरीय गुणवत्ता सिद्धांत का पालन करने वाला अधिकृत निरीक्षण प्रबंधन।",
      "pendingCard": "लंबित निरीक्षण",
      "verifiedCard": "भौतिक रूप से सत्यापित",
      "reinspectionCard": "पुनः जांच आवश्यक",
      "openInspection": "निरीक्षण खोलें",
      "inspectionModalTitle": "आधिकारिक भौतिक निरीक्षण फॉर्म",
      "officialGrade": "आधिकारिक सत्यापित ग्रेड",
      "moisturePercentage": "नमी का स्तर (Moisture %)",
      "foreignMatter": "विजातीय तत्व / कचरा (Foreign Matter %)",
      "inspectionLocation": "निरीक्षण स्थान",
      "inspectionDate": "निरीक्षण तिथि",
      "inspectionNotes": "परीक्षक की टिप्पणी व रिपोर्ट",
      "verificationStatus": "सत्यापन निर्णय स्थिति",
      "submitVerification": "आधिकारिक सत्यापन प्रस्तुत करें",
      "submittingVerification": "सत्यापन प्रस्तुत हो रहा है...",
      "certificateNumber": "प्रमाणपत्र संख्या",
      "inspector": "प्रमाणित गुणवत्ता परीक्षक",
      "verifiedAt": "प्रमाणीकरण तिथि",
      "notAssessedYet": "अभी तक मूल्यांकन नहीं हुआ",
      "trustPrincipleTitle": "गुणवत्ता सिद्धांत: AI स्क्रीनिंग बनाम भौतिक निरीक्षण",
      "trustPrincipleDesc": "किसानसेतु इस धारणा को सिरे से खारिज करता है कि केवल फोटो अपलोड करने से आधिकारिक ग्रेड तय हो सकता है। AI परिणाम हमेशा \"AI मूल्यांकन — असत्यापित\" रहता है। केवल भौतिक परीक्षण से ही \"भौतिक रूप से सत्यापित\" दर्जा मिलता है।",
      "photoEmptyPrompt": "दृश्य स्क्रीनिंग शुरू करने हेतु उपज की फोटो जोड़ें।",
      "uploadPhotoBtn": "फोटो अपलोड करें",
      "takePhotoBtn": "फोटो खींचें",
      "changePhotoBtn": "फोटो बदलें",
      "removePhotoBtn": "फोटो हटाएं",
      "photoRequiredError": "कृपया गुणवत्ता मूल्यांकन शुरू करने से पहले उपज की फोटो चुनें या खींचें।",
      "invalidImageError": "कृपया एक वैध इमेज फ़ाइल चुनें (JPG, PNG, WebP)।",
      "photoInputLabel": "डिवाइस से उपज की फोटो अपलोड करें",
      "cameraInputLabel": "कैमरे से उपज की फोटो खींचें",
      "assessQualityBtn": "गुणवत्ता का मूल्यांकन करें",
      "ruleBasedNotice": "प्रारंभिक दृश्य स्क्रीनिंग सतह के रंग और एकरूपता की जांच करती है। आधिकारिक प्रमाणीकरण के लिए भौतिक निरीक्षण अनिवार्य है।"
    },
    "buyerMatching": {
      "matchedBuyersTitle": "इस लॉट हेतु उपयुक्त खरीदार",
      "matchedBuyersSubtitle": "मांग, दूरी, गुणवत्ता और मूल्य के आधार पर अनुकूल मिलान।",
      "noMatchesFound": "वर्तमान में कोई खरीदार इस लॉट के मापदंडों से मेल नहीं खाता।",
      "matchScore": "मिलान स्कोर",
      "breakdownTitle": "अनुकूलता विश्लेषण",
      "gapWarningsTitle": "विचारणीय बिंदु",
      "buyerIdentityVerified": "पहचान सत्यापित",
      "buyerIdentityUnverified": "पहचान असत्यापित",
      "reputationLabel": "प्रतिष्ठा सूचकांक",
      "completedTrades": "सफल सौदे",
      "punctuality": "समयबद्धता",
      "viewDemandBtn": "मांग विवरण देखें",
      "incomingOffersTitle": "प्राप्त खरीद प्रस्ताव (Incoming Offers)",
      "incomingOffersSubtitle": "समीक्षा करें, मोलभाव करें या तुरंत स्वीकार कर अनुबंध बनाएं।",
      "noOffersReceived": "वर्तमान में इस लॉट पर कोई लंबित ऑफर नहीं है।",
      "offerFrom": "ऑफर प्रदाता खरीदार",
      "offeredPrice": "प्रस्तावित भाव",
      "offeredQuantity": "मांगी गई मात्रा",
      "totalOfferValue": "सकल अनुबंध मूल्य",
      "paymentTerms": "भुगतान की शर्तें",
      "deliveryTerms": "डिलीवरी एवं परिवहन शर्तें",
      "validUntil": "ऑफर की वैधता तिथि",
      "acceptOfferBtn": "ऑफर स्वीकार करें",
      "rejectOfferBtn": "ऑफर अस्वीकार करें",
      "acceptSuccess": "ऑफर स्वीकार कर लिया गया! वाणिज्यिक लेन-देन सृजित हुआ।",
      "rejectSuccess": "ऑफर अस्वीकार कर दिया गया।",
      "confirmAccept": "क्या आप इस खरीद प्रस्ताव को स्वीकार कर लॉट आरक्षित करना चाहते हैं?",
      "confirmReject": "क्या आप निश्चित रूप से इस ऑफर को अस्वीकार करना चाहते हैं?",
      "lotReservedNotice": "यह लॉट वर्तमान में आरक्षित है क्योंकि एक खरीद ऑफर स्वीकार किया जा चुका है।",
      "statusPending": "निर्णय लंबित",
      "statusAccepted": "स्वीकृत (Accepted)",
      "statusRejected": "अस्वीकृत (Rejected)",
      "statusCancelled": "रद्द (Cancelled)",
      "statusExpired": "समय समाप्त (Expired)",
      "hubTitle": "स्मार्ट खरीदार मिलान एवं मांग निर्देशिका",
      "hubSubtitle": "थोक खरीदारों, प्रसंस्करण उद्योगों और खुदरा श्रृंखलाओं की लाइव खरीद मांगें।",
      "demoBuyerSelector": "डेमो खरीदार प्रोफाइल चुनें",
      "activeBuyerProfile": "वर्तमान सक्रिय खरीदार",
      "switchBuyer": "खरीदार बदलें",
      "verifiedCredentials": "वैधानिक क्रेडेंशियल सत्यापित",
      "unverifiedCredentials": "प्रोटोटाइप असत्यापित खरीदार",
      "credentialDetails": "FSSAI, GSTIN और APMC थोक लाइसेंस रिकॉर्ड",
      "reputationMetrics": "व्यापार विश्वसनीयता",
      "rating": "रेटिंग",
      "tradesCompleted": "यशस्वी व्यवहार",
      "paymentPunctualityScore": "पेमेंट वेळेवर करण्याची टक्केवारी",
      "tabActiveDemands": "सक्रिय खरीद मांगें",
      "tabCreateDemand": "नई मांग पोस्ट करें",
      "tabBrowseLots": "उपलब्ध लॉट देखें",
      "tabMyOffers": "मेरे द्वारा भेजे गए ऑफर",
      "createDemandTitle": "नई खरीद मांग (Procurement Demand) दर्ज करें",
      "createDemandSubtitle": "आवश्यक फसल, मात्रा, ग्रेड और लक्ष्य मूल्य निर्दिष्ट करें।",
      "commodityLabel": "वांछित फसल",
      "commodityPlaceholder": "उदा. प्याज, सोयाबीन, धान, मक्का...",
      "quantityLabel": "आवश्यक मात्रा (क्विंटल)",
      "unitLabel": "इकाई",
      "requiredGradeLabel": "आवश्यक गुणवत्ता ग्रेड",
      "locationLabel": "गंतव्य जिला",
      "locationPlaceholder": "उदा. नाशिक, पुणे, छत्रपती संभाजीनगर",
      "deliveryLocationLabel": "गोदाम / फैक्ट्री डिलीवरी पता",
      "deliveryLocationPlaceholder": "उदा. एमआईडीसी भोसरी, नवी मुंबई, विशाखापट्टनम पोर्ट...",
      "minPriceLabel": "न्यूनतम मूल्य सीमा (₹)",
      "maxPriceLabel": "अधिकतम मूल्य सीमा (₹)",
      "deadlineLabel": "डिलीवरी की अंतिम तिथि",
      "descriptionLabel": "अतिरिक्त विनिर्देश / पैकिंग आवश्यकताएं",
      "descriptionPlaceholder": "उदा. 50 किग्रा जूट बोरियां, अधिकतम 12% नमी...",
      "submitDemandBtn": "खरीद मांग प्रकाशित करें",
      "submittingDemand": "मांग प्रकाशित हो रही है...",
      "demandCreatedSuccess": "खरीद मांग सफलतापूर्वक दर्ज की गई!",
      "demandsCount": "कुल मांगें",
      "noActiveDemands": "कोई सक्रिय मांग नहीं मिली।",
      "viewMatchesBtn": "अनुकूल लॉट खोजें",
      "priceRange": "मूल्य दायरा",
      "deadline": "अंतिम तिथि",
      "browseLotsTitle": "उपलब्ध कृषि उपज लॉट",
      "browseLotsSubtitle": "सीधे किसानों से मोलभाव करने हेतु उपलब्ध फसलें।",
      "noMatchingLots": "इस मांग के अनुकूल कोई लॉट उपलब्ध नहीं है।",
      "matchStrength": "मिलान अनुकूलता",
      "farmerLotId": "किसान लॉट कोड",
      "expectedPrice": "किसान का अपेक्षित भाव",
      "makeOfferBtn": "खरीद बोली लगाएं (Make Offer)",
      "filterByDemand": "मांग अनुसार छांटें",
      "allDemands": "सभी मांगें",
      "makeOfferTitle": "डिजिटल खरीद प्रस्ताव (Offer) भेजें",
      "makeOfferSubtitle": "किसान के लॉट हेतु औपचारिक मूल्य और डिलीवरी शर्तें प्रस्तुत करें।",
      "offerPriceLabel": "ऑफर मूल्य (₹/क्विंटल) *",
      "offerQtyLabel": "खरीद मात्रा (क्विंटल) *",
      "deliveryTermsLabel": "परिवहन व्यवस्था *",
      "deliveryTermsPlaceholder": "उदा. खेत से खरीदार द्वारा उठाव (Farm-Gate Pickup)",
      "paymentTermsLabel": "भुगतान की शर्तें *",
      "paymentTermsPlaceholder": "उदा. डिलीवरी व भौतिक जांच के पश्चात बैंक ट्रांसफर",
      "expiryDateLabel": "ऑफर वैधता तिथि *",
      "offerNotesLabel": "टिप्पणी / निर्देश",
      "offerNotesPlaceholder": "गुणवत्ता मापदंड या लोडिंग संबंधी विशेष निर्देश...",
      "submitOfferBtn": "औपचारिक ऑफर भेजें",
      "submittingOffer": "ऑफर भेजा जा रहा है...",
      "offerCreatedSuccess": "ऑफर सफलतापूर्वक भेजा गया!",
      "offerPendingNotice": "ऑफर किसान की स्वीकृति हेतु प्रतीक्षारत है।",
      "myOffersTitle": "मेरे द्वारा भेजे गए ऑफर",
      "myOffersSubtitle": "किसानों को प्रस्तुत किए गए खरीद प्रस्तावों की स्थिति।",
      "noSentOffers": "आपने अभी तक कोई खरीद ऑफर नहीं भेजा है।",
      "cancelOfferBtn": "ऑफर वापस लें",
      "cancelSuccess": "ऑफर सफलतापूर्वक वापस ले लिया गया।",
      "confirmCancel": "क्या आप इस ऑफर को रद्द करना चाहते हैं?",
      "trustNoticeTitle": "व्यापार अनुबंध एवं निष्पक्षता",
      "trustNoticeDesc": "ऑफर स्वीकृत होते ही लॉट लॉक हो जाता है और लॉजिस्टिक्स व भुगतान प्रक्रिया शुरू होती है।",
      "demoNotice": "प्रोटोटाइप वातावरण: सभी ऑफर वास्तविक अनुबंध नियम व शर्तों का अनुकरण करते हैं।"
    },
    "transport": {
      "hubTitle": "परिवहन एवं लॉजिस्टिक्स नेटवर्क",
      "hubSubtitle": "खेत से मंडी/गोदाम तक पारदर्शी भाड़ा दरें, वाहन क्षमता मिलान और लाइव ट्रैकिंग।",
      "roleBadge": "भूमिका: ट्रांसपोर्टर / मालवाहतूक",
      "logisticsNetworkTitle": "पंजीकृत कृषि लॉजिस्टिक्स बेड़ा",
      "logisticsNetworkDesc": "आरईओ (RTO) व्यावसायिक परमिट और वाणिज्यिक वाहन फिटनेस सत्यापित बेड़ा।",
      "demoTransporterSelector": "डेमो ट्रांसपोर्टर प्रोफाइल चुनें",
      "activeTransporterProfile": "सक्रिय ट्रांसपोर्टर",
      "switchTransporter": "ट्रांसपोर्टर बदलें",
      "verifiedPermit": "RTO व्यावसायिक परमिट सत्यापित",
      "unverifiedPermit": "केवल स्थानीय ग्रामीण सेवा",
      "operationalDistrictsLabel": "कार्यरत जिल्हे",
      "fleetRating": "गुणवत्ता रेटिंग",
      "tripsCompleted": "पूर्ण झालेल्या फेऱ्या",
      "onTimeRate": "वेळेवर पोहोचण्याचे प्रमाण",
      "tabFleet": "वाहन बेड़ा (Fleet)",
      "tabRequests": "प्राप्त ढुलाई अनुरोध (Requests)",
      "tabDispatches": "सक्रिय प्रेषण (Active Dispatches)",
      "registerVehicleBtn": "नवीन वाहन जोडा",
      "fleetOverviewTitle": "वाहन क्षमता आणि भाडे दर",
      "fleetOverviewSubtitle": "कृषी माल वाहतुकीसाठी नोंदणीकृत सक्रिय वाहने.",
      "vehicleTypeLabel": "वाहन मॉडेल",
      "vehicleRegLabel": "वाहन नोंदणी क्रमांक",
      "capacityLabel": "वहन क्षमता",
      "ratePerKmLabel": "दर / किमी",
      "coldChainLabel": "कोल्ड चेन वाहन",
      "availableBadge": "उपलब्ध",
      "busyBadge": "मार्गावर",
      "refrigeratedBadge": "शीतगृह (रेफर व्हॅन)",
      "standardBadge": "मानक मालवाहू",
      "incomingRequestsTitle": "आलेल्या वाहतूक विनंत्या",
      "incomingRequestsSubtitle": "शेतकरी आणि एफपीओ यांनी पाठवलेल्या थेट शेतावरील पिकअप विनंत्या.",
      "noRequestsReceived": "अद्याप कोणत्याही प्रलंबित वाहतूक विनंत्या नाहीत.",
      "lotDetailsLabel": "शेतमाल लॉट",
      "pickupLocationLabel": "उठाव स्थान (खेत)",
      "dropLocationLabel": "गंतव्य मंडी / गोदाम",
      "distanceLabel": "दूरी",
      "tripsLabel": "फेरे (Trips)",
      "estimatedEarnings": "अनुमानित भाड़ा",
      "costPerQtlLabel": "लागत प्रति क्विंटल",
      "scheduledPickupLabel": "उठाव का समय",
      "actualDeliveryLabel": "डिलीवरी का समय",
      "statusRequested": "अनुरोध प्राप्त",
      "statusAccepted": "स्वीकृत (Accepted)",
      "statusRejected": "अस्वीकृत (Rejected)",
      "statusInTransit": "मार्ग में (In Transit)",
      "statusDelivered": "सुरक्षित डिलीवर (Delivered)",
      "statusCancelled": "रद्द (Cancelled)",
      "acceptRequestBtn": "ढुलाई स्वीकार करें",
      "declineRequestBtn": "अस्वीकार करें",
      "markInTransitBtn": "मार्ग पर रवाना करें (In Transit)",
      "markDeliveredBtn": "डिलीवरी पूर्ण दर्ज करें (Delivered)",
      "activeDispatchesTitle": "सक्रिय माल प्रेषण ट्रैकिंग",
      "activeDispatchesSubtitle": "खेत से गंतव्य तक लाइव प्रगति निगरानी।",
      "noDispatchesFound": "वर्तमान में कोई सक्रिय प्रेषण नहीं है।",
      "formulaTitle": "पारदर्शी भाड़ा गणना सूत्र",
      "formulaText": "भाड़ा = आवश्यक फेरे × गलियारा दूरी (किमी) × प्रति किमी दर।",
      "netRealisationNote": "परिवहन लागत सीधे किसान के शुद्ध लाभ से काटी जाती है ताकि सही मुनाफे का पता चले।",
      "lotTransportTitle": "लॉट परिवहन विकल्प",
      "lotTransportSubtitle": "इस लॉट को निकटतम मंडी या खरीदार के गोदाम तक पहुंचाने के विकल्प।",
      "findTransportersBtn": "उपयुक्त ट्रांसपोर्टर खोजें",
      "destinationLabel": "गंतव्य मंडी या गोदाम",
      "destinationPlaceholder": "उदा. पुणे मार्केट यार्ड, विशाखापट्टनम पोर्ट...",
      "preferColdChainLabel": "तापमान-नियंत्रित कोल्ड-चेन वाहन आवश्यक है",
      "matchingTransportersTitle": "उपलब्ध ट्रांसपोर्टर",
      "noTransportersAvailable": "इस मार्ग पर कोई अनुकूल ट्रांसपोर्टर उपलब्ध नहीं है।",
      "costEquationLabel": "अनुमानित लागत विवरण",
      "bookTransportBtn": "ढुलाई बुक करें",
      "bookingModalTitle": "परिवहन बुकिंग की पुष्टि करें",
      "bookingModalSubtitle": "वाहन और चालक असाइन करने हेतु अंतिम विवरण दें।",
      "scheduledDateLabel": "उठाव की तिथि",
      "transportNotesLabel": "ड्राइवर हेतु निर्देश",
      "transportNotesPlaceholder": "खेत का लैंडमार्क, संपर्क नंबर या लोडिंग संबंधी निर्देश...",
      "confirmBookingBtn": "बुकिंग सुरक्षित करें",
      "bookingSuccess": "परिवहन सफलतापूर्वक बुक हो गया!",
      "activeBookingsTitle": "सक्रिय बुकिंग विवरण",
      "noBookingsYet": "अभी तक कोई बुकिंग नहीं की गई है।",
      "demoNotice": "प्रोटोटाइप वातावरण: लाइव जीपीएस ट्रैकिंग का अनुकरण किया गया है।"
    },
    "netRealisation": {
      "hubTitle": "शुद्ध लाभ (Net Realisation) इंजन",
      "hubSubtitle": "परिवहन, भंडारण, हमाली और मंडी टैक्स घटाकर किसान का वास्तविक लाभ प्रकट करता है।",
      "netRealisation": "शुद्ध प्राप्त लाभ (Net Realisation)",
      "grossSaleValue": "सकल बिक्री मूल्य (Gross Value)",
      "transportCost": "परिवहन कटौती (Transport Deduction)",
      "storageCost": "भंडारण शुल्क कटौती (Storage Fee)",
      "otherCosts": "हमाली व मंडी शुल्क (Handling & Mandi Cess)",
      "netPerQuintal": "शुद्ध दर प्रति क्विंटल (Net ₹/Qtl)",
      "bestSellingOption": "सर्वोत्तम बिक्री विकल्प",
      "sellNow": "तुरंत बेचें (Sell Now)",
      "storeAndSellLater": "भंडारित करें व बाद में बेचें (Store & Sell Later)",
      "waitAndWatch": "प्रतीक्षा करें (Wait & Watch)",
      "estimatedLabel": "अनुमानित गणना",
      "notGuaranteed": "बाजार के उतार-चढ़ाव पर आधारित",
      "whyThisRecommendation": "यह अनुशंसा क्यों की गई?",
      "howIsThisCalculated": "इसकी गणना कैसे की गई है?",
      "compareSellingOptions": "विक्री पर्यायांची तुलना करा",
      "currentPrice": "सध्याचा विक्री भाव",
      "expectedFuturePrice": "अपेक्षित भावी भाव",
      "potentialImprovement": "संभाव्य भाव वाढ",
      "reliability": "व्यावसायिक विश्वासार्हता",
      "assumptions": "आर्थिक व व्यावहारिक गृहीतके",
      "demoData": "नमुना बाजार समिती भाव",
      "estimatedData": "हंगामी अंदाज मॉडेल",
      "insufficientData": "सल्ल्यासाठी पुरेसा बाजार डेटा उपलब्ध नाही.",
      "holdingDaysLabel": "साठवणूक कालावधी (दिवस)",
      "tableOption": "पर्याय / बाजार",
      "tableGross": "एकूण भाव / क्विंटल",
      "tableTransport": "वाहतूक / क्विंटल",
      "tableStorage": "साठवणूक / क्विंटल",
      "tableOther": "इतर / क्विंटल",
      "tableNet": "निव्वळ परतावा / क्विंटल",
      "tableAction": "शिफारस / कृती",
      "formulaTitle": "किसानसेतूचे पारदर्शक परतावा सूत्र",
      "formulaGrossText": "एकूण विक्री मूल्य = शेतमाल वजन (क्विंटल) × विक्री भाव (₹/क्विंटल)",
      "formulaTransportText": "वाहतूक खर्च = फेऱ्या × अंतर (किमी) × दर प्रति किमी (₹/किमी)",
      "formulaStorageText": "साठवणूक खर्च = (मासिक दर / ३०) × साठवण दिवस × वजन (क्विंटल)",
      "formulaNetText": "निव्वळ परतावा = एकूण मूल्य − वाहतूक − साठवणूक − बाजार खर्च",
      "dashboardCardTitle": "सर्वोत्तम निव्वळ परतावा",
      "dashboardCardSub": "सर्वात जास्त नफा देणारा पर्याय",
      "viewAnalysisBtn": "सविस्तर विश्लेषण पहा",
      "noOptionsAvailable": "अद्याप कोणतेही विक्री पर्याय तपासलेले नाहीत.",
      "mandiYardLabel": "नियमित कृषी उत्पन्न बाजार समिती",
      "directBuyerLabel": "खेत पर सीधा खरीदार",
      "storageProjectionLabel": "गोदाम साठवणूक अंदाज"
    },
    "transactions": {
      "hubTitle": "वाणिज्यिक व्यापार अनुबंध एवं भुगतान ट्रैकिंग",
      "hubSubtitle": "ऑफर स्वीकृति से लेकर डिलीवरी, भुगतान और प्रतिष्ठा रेटिंग तक का संपूर्ण रिकॉर्ड।",
      "myTransactionsTitle": "माझे व्यावसायिक व्यवहार",
      "myTransactionsSubtitle": "व्यापार करार, वाहतूक पाठवणी, पेमेंट स्थिती आणि पक्षांची विश्वासार्हता ट्रॅक करा.",
      "transactionCode": "अनुबंध आईडी",
      "commercialAgreement": "व्यावसायिक व्यापार करार",
      "paymentTracking": "पेमेंट ट्रॅकिंग",
      "paymentStatus": "भुगतान स्थिति",
      "paymentInitiated": "शुरू किया गया (Initiated)",
      "paymentProcessing": "प्रक्रियाधीन (Processing)",
      "paymentReceived": "पेमेंट प्राप्त झाले",
      "paymentPaid": "सफल भुगतान (Paid)",
      "markPaymentReceivedBtn": "पेमेंट मिळाल्याची नोंद करा (डेमो)",
      "completed": "पूर्ण झाले",
      "transportStatus": "वाहतूक स्थिती",
      "deliveryLocation": "वितरण ठिकाण",
      "qualityStatus": "मालाची गुणवत्ता स्थिती",
      "physicallyVerified": "अधिकृत निरीक्षकाद्वारे प्रत्यक्ष प्रमाणित",
      "aiVisualScreening": "एआय प्राथमिक तपासणी — अप्रमाणित",
      "agreedPricePerQtl": "ठरलेला भाव / क्विंटल",
      "grossContractValue": "एकूण करार मूल्य",
      "netRealisation": "किसान को शुद्ध देय",
      "takeHomeEstimate": "शेतकऱ्याचा निव्वळ नफा",
      "threeWayRatings": "व्यवहार-आधारित ३-मार्गी रेटिंग",
      "rateThisTransaction": "या व्यवहाराचे मूल्यांकन करा",
      "ratingSubmitted": "रेटिंग यशस्वीरीत्या नोंदवले गेले",
      "submitRatingBtn": "प्रमाणित रेटिंग सबमिट करा",
      "ratingFeedbackPlaceholder": "कामाचा अनुभव सामायिक करा (वेळेचे पालन, गुणवत्ता, तत्परता)...",
      "disputeGrievance": "शिकायत दर्ज करें",
      "raiseDisputeBtn": "विवाद दर्ज करें",
      "viewTransactionBtn": "अनुबंध विवरण देखें",
      "filterAll": "सभी सौदे",
      "filterActive": "सक्रिय (Active)",
      "filterCompleted": "पूर्ण (Completed)",
      "filterDisputed": "विवादित (Disputed)",
      "noTransactionsFound": "कोई व्यापार अनुबंध नहीं मिला।",
      "timelineTitle": "व्यापार निष्पादन समयरेखा",
      "prototypeNotice": "भुगतान ट्रैकिंग डेमो — वास्तविक बैंकिंग लेनदेन नहीं होता।",
      "reputationVsVerificationNote": "सरकारी वैधानिक सत्यापन और व्यावसायिक रेटिंग स्वतंत्र रूप से अलग रखी जाती हैं।",
      "buyerLabel": "खरीदार / प्रसंस्करणकर्ता",
      "farmerLabel": "किसान / FPO उत्पादक",
      "transporterLabel": "वाणिज्यिक ट्रांसपोर्टर"
    },
    "disputes": {
      "hubTitle": "साक्ष्य-आधारित विवाद समाधान प्रणाली",
      "hubSubtitle": "डिजिटल अनुबंध साक्ष्यों के आधार पर FPO/मंडी अधिकारियों द्वारा निष्पक्ष मानवीय मध्यस्थता।",
      "raiseGrievanceTitle": "व्यापारिक शिकायत दर्ज करें",
      "disputeCode": "शिकायत कोड",
      "categoryLabel": "शिकायत की श्रेणी",
      "descriptionLabel": "विस्तृत शिकायत एवं विसंगति",
      "descriptionPlaceholder": "वजन में अंतर, ग्रेड में कमी, डिलीवरी में देरी या भुगतान समस्या का विवरण दें...",
      "submitGrievanceBtn": "मंडी/FPO अधिकारी को शिकायत प्रस्तुत करें",
      "statusOpen": "ओपन (समीक्षा प्रतीक्षारत)",
      "statusUnderReview": "अधिकारी द्वारा समीक्षाधीन",
      "statusResolved": "निस्तारित (Resolved)",
      "statusRejected": "खारिज (Rejected)",
      "statusClosed": "बंद (Closed)",
      "categoryQualityMismatch": "गुणवत्ता व ग्रेड में विसंगति",
      "categoryDeliveryDelay": "परिवहन व डिलीवरी में अत्यधिक देरी",
      "categoryPaymentDelay": "भुगतान निपटान में देरी",
      "categoryWeightDiscrepancy": "वजन में विसंगति / घटत",
      "categoryPriceDisagreement": "तय मूल्य पर विवाद",
      "categoryCancellation": "एकतरफा अनुबंध रद्दीकरण",
      "categoryOther": "अन्य शिकायत",
      "evidenceChecklistTitle": "आवश्यक साक्ष्य सूची",
      "humanAdjudicationNote": "कृषि विवादों में AI द्वारा स्वतः निर्णय नहीं लिया जा सकता। मानवीय समीक्षा अनिवार्य है।",
      "adminPanelTitle": "महाराष्ट्र कृषि विवाद निवारण पोर्टल",
      "resolutionNotesLabel": "अधिकारिक निर्णय एवं समाधान टिप्पणी",
      "resolutionNotesPlaceholder": "धर्मकांटा पर्ची, गुणवत्ता रिपोर्ट और अनुबंध शर्तों के आधार पर निर्णय दर्ज करें...",
      "markUnderReviewBtn": "समीक्षा में डालें",
      "resolveDisputeBtn": "विवाद का समाधान करें",
      "closeDisputeBtn": "शिकायत बंद करें",
      "grievanceRecordedNotice": "आपकी शिकायत डिजिटल साक्ष्यों सहित दर्ज कर ली गई है।",
      "noDisputesFound": "कोई सक्रिय विवाद नहीं है।"
    },
    calculator: {
      title: 'शुद्ध प्राप्ति खोज इंजन',
      subtitle: 'सिर्फ सबसे ऊंचे सकल भाव के पीछे न भागें। अपनी वास्तविक किसान शुद्ध आय जानने के लिए परिवहन, भंडारण और मंडी उपकर को जोड़कर गणना करें।',
      badge: 'मुख्य यूएसपी इंजन',
      parametersCardTitle: 'फसल एवं कटाई मानदंड',
      parametersCardSub: 'शुद्ध प्राप्ति गणना हेतु विवरण दर्ज करें।',
      selectCropLabel: 'फसल चुनें (२२ समर्थित किस्में)',
      harvestQtyLabel: 'कटाई की मात्रा',
      sellingPriceLabel: 'उद्धृत विक्रय मूल्य (प्रति क्विंटल)',
      distanceLabel: 'मंडी / खरीदार की दूरी',
      storageDurationLabel: 'भंडारण अवधि (गोदाम / शीतगृह)',
      daysUnit: 'दिन',
      quintalsUnit: 'क्विंटल',
      perQtlUnit: '/ क्विंटल',
      resultTitle: 'परिकलित शुद्ध प्राप्ति',
      takeHomeLabel: 'वास्तविक किसान आय',
      perQuintal: '/ क्विंटल',
      grossSaleValue: 'सकल विक्रय मूल्य',
      transportFreight: 'परिवहन भाड़ा',
      storageCost: 'भंडारण लागत',
      mandiCessHandling: 'मंडी उपकर एवं हमाली खर्च',
      totalDeductions: 'कुल कटौतियाँ',
      formulaTitle: 'एसआईएच २६१३२ सूत्र',
      formulaText: 'शुद्ध प्राप्ति = सकल विक्रय मूल्य - परिवहन लागत - भंडारण लागत - अन्य लागू लागतें',
      loadedFromMarket: 'मंडी से लोड किए गए मानदंड',
      resetDefaults: 'डिफ़ॉल्ट रीसेट करें',
    },
    markets: {
      title: 'मंडी भाव एवं दैनिक आवक',
      subtitle: 'महाराष्ट्र एवं आंध्र प्रदेश (विशाखापट्टनम क्षेत्र) की प्रमुख एपीएमसी मंडियों के दैनिक मॉडल भाव और आवक ट्रैकिंग।',
      badge: 'एपीएमसी बाजार अभिसूचना',
      dataNoticeTitle: 'स्थापत्य सिद्धांत: डेटा पारदर्शिता',
      dataNoticeDesc: 'नीचे दिए गए भाव महाराष्ट्र और आंध्र प्रदेश मंडियों के डेमो प्रोटोटाइप डेटा दर्शाते हैं। लाइव एगमार्कनेट / ई-नाम और एमएसएएमबी फीड्स मुख्य लॉजिक को बदले बिना जुड़ेंगे। हम कभी भी प्रोटोटाइप डेटा को वास्तविक सरकारी फीड के रूप में प्रस्तुत नहीं करते हैं।',
      tableTitle: 'क्षेत्रीय एपीएमसी दैनिक भाव सारांश',
      tableSub: 'महाराष्ट्र और आंध्र प्रदेश में प्रति क्विंटल मॉडल भाव और कुल दैनिक आवक की तुलना।',
      colMarket: 'मंडी / बाजार',
      colCommodity: 'कृषि जिंस',
      colPriceRange: 'न्यूनतम - अधिकतम भाव',
      colModalPrice: 'मॉडल भाव',
      colArrivals: 'दैनिक आवक',
      colAction: 'कार्रवाई',
      netProfitCheck: 'शुद्ध लाभ जांचें',
      tonnes: 'टन',
      dist: 'जिला',
      calculateNetRealisation: 'शुद्ध प्राप्ति की गणना करें',
      archTitle: 'चरण १ वास्तुकला आधार',
      archDesc: 'यह डेटा डेटाबेस स्कीमा में मार्केट, मार्केट प्राइस और मार्केट अराइवल टेबल से जुड़ा हुआ है।',
    },
    voice: {
      buttonLabel: 'बोलें',
      buttonHint: 'माइक पर टैप करें और बोलें',
      listening: 'सुन रहे हैं...',
      stop: 'रोकें',
      cancel: 'रद्द करें',
      clear: 'हटाएं',
      readAloud: 'सुनें',
      notSupported: 'इस ब्राउज़र में वाक् पहचान (Speech Recognition) समर्थित नहीं है। कृपया नीचे दिए गए त्वरित प्रश्न बटन उपयोग करें।',
      permissionDenied: 'माइक्रोफ़ोन की अनुमति अस्वीकृत कर दी गई। कृपया माइक्रोफ़ोन की अनुमति दें या नीचे दिए गए बटन का उपयोग करें।',
      youSaid: 'आपने पूछा:',
      intentTitle: 'पहचाना गया उद्देश्य:',
      fallbackResponse: 'मुझे समझ नहीं आया। कृपया मंडी भाव, खरीदार, परिवहन या शुद्ध प्राप्ति के बारे में पूछें।',
      suggestionTitle: 'सुझाए गए वॉयस प्रश्न:',
      safetyNotice: 'प्रोटोटाइप वॉयस सहायक: केवल सूचनात्मक एवं नेविगेशन के लिए। आवाज द्वारा कोई वित्तीय लेनदेन या स्वतः प्रतिबद्धता निष्पादित नहीं की जाती है।',
      queryPrice: 'आज प्याज का भाव क्या है?',
      queryBuyers: 'मेरे १० क्विंटल प्याज के लिए खरीदार खोजें।',
      queryProfit: 'कौन सा विकल्प मुझे अधिक शुद्ध लाभ देता है?',
      queryTransport: 'मेरे माल के लिए परिवहन खोजें।',
      queryOffers: 'मेरे ऑफर्स दिखाएं।',
      queryTxns: 'मेरे सौदे दिखाएं।',
    },
  },
};
