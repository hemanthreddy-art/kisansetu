// KisanSetu - Core Domain Types
// SIH Problem Statement 26132 (Govt of Maharashtra)

export type UserRole =
  | 'FARMER'
  | 'FPO'
  | 'BUYER'
  | 'TRANSPORTER'
  | 'QUALITY_INSPECTOR'
  | 'ADMIN';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type LotStatus =
  | 'DRAFT'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'TRANSPORT_SELECTED'
  | 'IN_TRANSIT'
  | 'HANDED_OVER'
  | 'PAYMENT_PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export type BuyerDemandStatus = 'ACTIVE' | 'PAUSED' | 'FULFILLED' | 'CANCELLED';

export type TransportStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'PICKUP_COMPLETED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type TransactionStatus =
  | 'INITIATED'
  | 'ESCROW_LOCKED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'SETTLED'
  | 'DISPUTED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'ESCROWED'
  | 'RELEASED_TO_FARMER'
  | 'REFUNDED'
  | 'FAILED';

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'EVIDENCE_SUBMITTED'
  | 'RESOLVED'
  | 'REJECTED';

// ----------------------------------------------------
// 1. Core Users & Profiles
// ----------------------------------------------------

export interface User {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  role: UserRole;
  preferredLanguage: 'en' | 'mr' | 'te';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  state: string;
  district: string;
  taluka: string;
  village?: string;
  pincode?: string;
  landAreaAcres?: number;
  preferredCrops?: string[];
  isFpoMember: boolean;
  fpoId?: string;
}

export interface FPO {
  id: string;
  name: string;
  registrationNumber: string;
  state: string;
  district: string;
  taluka?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  totalMembersCount: number;
  verified: boolean;
}

export interface BuyerProfile {
  id: string;
  userId: string;
  companyName: string;
  buyerType: 'WHOLESALER' | 'RETAILER' | 'FOOD_PROCESSOR' | 'EXPORTER' | 'INSTITUTIONAL';
  gstin?: string;
  tradeLicenseNo?: string;
  registeredState: string;
  operatingCities?: string[];
  verified: boolean;
}

export interface TransporterProfile {
  id: string;
  userId: string;
  businessName: string;
  commercialLicenseNo?: string;
  operationalDistricts?: string[];
  verified: boolean;
}

export interface QualityInspector {
  id: string;
  userId: string;
  agencyName: string;
  licenseNumber: string;
  assignedDistricts: string[];
  isActive: boolean;
}

// ----------------------------------------------------
// 2. Produce Lots & Quality
// ----------------------------------------------------

export interface ProduceLot {
  id: string;
  lotCode: string;
  farmerId: string;
  fpoId?: string | null;
  commodity: string;
  variety?: string | null;
  quantity: number;
  unit: string;
  quantityQuintals: number;
  expectedPrice: number;
  expectedPricePerQuintal: number;
  expectedGrade: string;
  harvestDate: string;
  readyForPickupDate: string;
  locationDistrict: string;
  locationTaluka?: string | null;
  locationVillage?: string | null;
  location?: string | null;
  description?: string | null;
  lotPhotosJson?: string | null;
  images?: string | null;
  status: LotStatus;
  createdAt: string;
  updatedAt: string;
  offers?: Offer[];
  aiAssessments?: QualityAssessment[];
  physicalVerifications?: QualityVerification[];
  transportRequests?: TransportRequest[];
}

export type AiAssessmentStatus = 'AI_ASSESSMENT_NOT_VERIFIED';

export type PhysicalVerificationStatus =
  | 'PENDING'
  | 'PHYSICALLY_VERIFIED'
  | 'REJECTED'
  | 'REQUIRES_REINSPECTION';

export interface QualityAssessment {
  id: string;
  lotId: string;
  status: AiAssessmentStatus;
  estimatedGrade: string;
  confidenceScore: number; // 0.0 to 1.0
  color?: string | null;
  visibleDamage?: string | null;
  sizeUniformity?: number | null; // %
  visibleDefects?: number | null; // %
  assessmentNotes?: string | null;
  visualParameters?: string | null;
  disclaimer: string;
  assessedAt: string;
  updatedAt?: string;
}

export interface QualityVerification {
  id: string;
  lotId: string;
  inspectorId: string;
  inspector?: QualityInspector;
  status: PhysicalVerificationStatus;
  officialGrade: string;
  moisturePercentage?: number | null;
  foreignMatterPerc?: number | null;
  inspectionLocation: string;
  inspectionDate: string;
  inspectionNotes?: string | null;
  certificateNumber: string;
  verifiedAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// 3. Markets & Demand
// ----------------------------------------------------

export interface Market {
  id: string;
  name: string;
  marketCode: string;
  marketType: 'APMC' | 'PRIVATE' | 'DIRECT_PURCHASE_CENTER';
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
}

export interface MarketPrice {
  id: string;
  marketId: string;
  marketName?: string;
  district?: string;
  commodity: string;
  variety?: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceDate: string;
  source: string;
}

export interface MarketArrival {
  id: string;
  marketId: string;
  commodity: string;
  arrivalQuantityTonnes: number;
  arrivalDate: string;
}

export interface BuyerDemand {
  id: string;
  buyerId: string;
  buyerName?: string;
  buyerCompany?: string;
  buyerType?: string;
  isBuyerVerified?: boolean;
  commodity: string;
  variety?: string;
  requiredQuantityQtl: number;
  unit: string;
  targetPricePerQtl: number;
  minPricePerQtl?: number;
  maxPricePerQtl?: number;
  destinationDistrict: string;
  deliveryLocation?: string;
  deliveryDeadline: string;
  requiredGrade?: string;
  qualityRequirements?: string;
  description?: string;
  status: BuyerDemandStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerReputation {
  ratingScore: number;
  completedTradesCount: number;
  paymentPunctualityPercent: number;
  reliabilityScore: number;
}

export interface DemandMatchResult {
  demandId: string;
  buyerId: string;
  buyerName: string;
  companyName: string;
  buyerType: string;
  isBuyerVerified: boolean;
  reputation: BuyerReputation;
  commodity: string;
  variety?: string;
  requiredQuantityQtl: number;
  targetPricePerQtl: number;
  minPricePerQtl?: number;
  maxPricePerQtl?: number;
  destinationDistrict: string;
  deliveryDeadline: string;
  requiredGrade?: string;
  qualityRequirements?: string;
  description?: string;
  matchScore: number;
  matchGrade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  positiveReasons: string[];
  warnings: string[];
  qualityStatus: 'PHYSICALLY_VERIFIED' | 'AI_ASSESSMENT_NOT_VERIFIED' | 'NOT_GRADED';
  qualityCertificate?: string;
}

export interface Offer {
  id: string;
  lotId: string;
  buyerId: string;
  buyerName?: string;
  offeredPricePerQtl: number;
  quantityQuintals: number;
  proposedPickupDate: string;
  paymentTerms: string;
  status: OfferStatus;
  notes?: string;
  validUntil: string;
  createdAt: string;
}

// ----------------------------------------------------
// 4. Logistics & Storage
// ----------------------------------------------------

export interface TransporterVehicle {
  id: string;
  transporterId: string;
  vehicleType: string;
  registrationNumber: string;
  capacityTonnes: number;
  isRefrigerated: boolean;
  isAvailable: boolean;
}

export interface TransportRequest {
  id: string;
  lotId: string;
  transporterId?: string;
  pickupLocation: string;
  dropLocation: string;
  distanceKm: number;
  estimatedCost: number;
  status: TransportStatus;
  scheduledPickup: string;
  actualDelivery?: string;
}

export interface StorageFacility {
  id: string;
  name: string;
  facilityType: 'COLD_STORAGE' | 'DRY_WAREHOUSE' | 'SILO';
  district: string;
  state: string;
  totalCapacityTonnes: number;
  availableCapacityTonnes: number;
  ratePerQuintalPerMonth: number;
  contactPhone?: string;
}

// ----------------------------------------------------
// 5. Transactions, Payments, Ratings & Disputes
// ----------------------------------------------------

export interface Transaction {
  id: string;
  transactionCode: string;
  lotId: string;
  farmerId: string;
  buyerId: string;
  transporterId?: string;
  agreedPricePerQuintal: number;
  quantityQuintals: number;
  grossSaleValue: number;
  transportCost: number;
  storageCost: number;
  otherCosts: number;
  netRealisation: number;
  status: TransactionStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  escrowReference?: string;
  payoutDate?: string;
}

export interface Rating {
  id: string;
  transactionId: string;
  raterId: string;
  rateeId: string;
  rolePair: string;
  ratingScore: number;
  feedback?: string;
  createdAt: string;
}

export interface Verification {
  id: string;
  userId: string;
  documentType: string;
  documentNumber?: string;
  status: VerificationStatus;
  verifiedAt?: string;
  notes?: string;
}

export interface Dispute {
  id: string;
  disputeCode: string;
  transactionId: string;
  raisedById: string;
  reason: string;
  evidenceSummary: string;
  status: DisputeStatus;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// CORE USP ENGINE TYPES
// ----------------------------------------------------

export interface NetRealisationCalculation {
  marketOrBuyerName: string;
  location: string;
  distanceKm: number;
  grossPricePerQuintal: number;
  quantityQuintals: number;
  grossSaleValue: number;
  transportCost: number;
  storageCost: number;
  mandiCessAndHandling: number;
  totalDeductions: number;
  netRealisation: number;
  netRealisationPerQuintal: number;
  isRecommended: boolean;
  notes: string;
}
