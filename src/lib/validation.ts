import { ALL_SUPPORTED_DISTRICTS } from './constants';

export interface LotInputData {
  crop?: string;
  variety?: string;
  quantity?: number | string;
  unit?: string;
  district?: string;
  location?: string;
  harvestDate?: string;
  availabilityDate?: string;
  expectedPrice?: number | string;
  expectedGrade?: string;
  description?: string;
  status?: string;
  photos?: string[] | string;
  lotPhotosJson?: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  cleanedData?: {
    crop: string;
    variety: string;
    quantity: number;
    unit: 'Quintal' | 'Tonnes' | 'Kg';
    quantityQuintals: number;
    district: string;
    location: string;
    harvestDate: Date;
    availabilityDate: Date;
    expectedPrice: number;
    expectedPricePerQuintal: number;
    expectedGrade: string;
    description: string;
    status: 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'CANCELLED';
    lotPhotosJson?: string | null;
  };
}

/**
 * Validates Produce Lot form submission (Farmer workflow)
 * Strict validation: Ensures correct types, valid ranges, and safe input
 */
export function validateLotInput(
  input: LotInputData,
  isUpdate = false
): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Crop (Required on create)
  const crop = (input.crop || '').trim();
  if (!isUpdate && !crop) {
    errors.crop = 'Please select or specify a crop name.';
  } else if (crop && crop.length > 50) {
    errors.crop = 'Crop name cannot exceed 50 characters.';
  }

  // 2. Variety (Optional but max 50 chars)
  const variety = (input.variety || '').trim();
  if (variety && variety.length > 50) {
    errors.variety = 'Variety name cannot exceed 50 characters.';
  }

  // 3. Quantity & Unit
  const quantityRaw = input.quantity;
  const quantityNum = Number(quantityRaw);
  const unit = (input.unit || 'Quintal').trim() as 'Quintal' | 'Tonnes' | 'Kg';

  if (!isUpdate && (quantityRaw === undefined || quantityRaw === '')) {
    errors.quantity = 'Quantity is required.';
  } else if (quantityRaw !== undefined && (isNaN(quantityNum) || quantityNum <= 0)) {
    errors.quantity = 'Quantity must be a positive number greater than 0.';
  } else if (quantityNum > 100000) {
    errors.quantity = 'Quantity exceeds maximum allowable lot size (100,000).';
  }

  if (!['Quintal', 'Tonnes', 'Kg'].includes(unit)) {
    errors.unit = 'Unit must be Quintal, Tonnes, or Kg.';
  }

  // Standardize quantity in quintals
  let quantityQuintals = quantityNum;
  if (unit === 'Tonnes') quantityQuintals = quantityNum * 10;
  if (unit === 'Kg') quantityQuintals = quantityNum * 0.01;

  // 4. District (Must be valid)
  const district = (input.district || '').trim();
  if (!isUpdate && !district) {
    errors.district = 'Please select a supported agricultural district.';
  } else if (district && !(ALL_SUPPORTED_DISTRICTS as readonly string[]).includes(district)) {
    errors.district = 'Please select a valid supported district.';
  }

  // 5. Location (Village or taluka address)
  const location = (input.location || '').trim();
  if (!isUpdate && !location) {
    errors.location = 'Please provide farm village or taluka location.';
  }

  // 6. Harvest Date
  const harvestDateObj = input.harvestDate ? new Date(input.harvestDate) : new Date();
  if (isNaN(harvestDateObj.getTime())) {
    errors.harvestDate = 'Please select a valid harvest date.';
  }

  // 7. Availability Date
  const availabilityDateObj = input.availabilityDate
    ? new Date(input.availabilityDate)
    : new Date();
  if (isNaN(availabilityDateObj.getTime())) {
    errors.availabilityDate = 'Please select a valid availability date.';
  }

  // 8. Expected Price (Must be >= 0)
  const priceNum = Number(input.expectedPrice);
  if (isNaN(priceNum) || priceNum < 0) {
    errors.expectedPrice = 'Expected price cannot be negative.';
  }

  // Normalize price per quintal
  let expectedPricePerQuintal = priceNum;
  if (unit === 'Tonnes') expectedPricePerQuintal = priceNum / 10;
  if (unit === 'Kg') expectedPricePerQuintal = priceNum * 100;

  // 9. Expected Grade
  const validGrades = ['A', 'B', 'C', 'Not Graded Yet'];
  const expectedGrade = validGrades.includes(input.expectedGrade || '')
    ? input.expectedGrade!
    : 'Not Graded Yet';

  // 10. Status
  const validStatuses = ['DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD', 'CANCELLED'];
  const status = (validStatuses.includes(input.status || '')
    ? input.status!
    : 'AVAILABLE') as 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'CANCELLED';

  const description = (input.description || '').trim();

  // Parse photos / lotPhotosJson
  let lotPhotosJson: string | null = null;
  if (Array.isArray(input.photos) && input.photos.length > 0) {
    lotPhotosJson = JSON.stringify(input.photos);
  } else if (typeof input.photos === 'string' && input.photos.trim()) {
    try {
      JSON.parse(input.photos);
      lotPhotosJson = input.photos.trim();
    } catch {
      lotPhotosJson = JSON.stringify([input.photos.trim()]);
    }
  } else if (typeof input.lotPhotosJson === 'string' && input.lotPhotosJson.trim()) {
    lotPhotosJson = input.lotPhotosJson.trim();
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    cleanedData: isValid
      ? {
          crop,
          variety,
          quantity: quantityNum,
          unit,
          quantityQuintals,
          district,
          location,
          harvestDate: harvestDateObj,
          availabilityDate: availabilityDateObj,
          expectedPrice: priceNum,
          expectedPricePerQuintal,
          expectedGrade,
          description,
          status,
          lotPhotosJson,
        }
      : undefined,
  };
}

export const validateProduceLot = validateLotInput;

export interface AiAssessmentInputData {
  estimatedGrade?: string;
  confidenceScore?: number | string;
  color?: string;
  visibleDamage?: string;
  sizeUniformity?: number | string;
  visibleDefects?: number | string;
  assessmentNotes?: string;
}

export function validateAiAssessmentInput(input: AiAssessmentInputData) {
  const errors: Record<string, string> = {};

  const validGrades = [
    'Grade A',
    'Grade B',
    'Grade C',
    'A',
    'B',
    'C',
    'Fair Average Quality',
    'Grade 1',
    'Grade 2',
    'Grade 3',
  ];
  const grade = (input.estimatedGrade || 'Grade B').trim();
  if (!validGrades.includes(grade)) {
    errors.estimatedGrade =
      'Please specify a valid preliminary grade suggestion (e.g. Grade A, Grade B, Grade C).';
  }

  let confidence = Number(input.confidenceScore ?? 0.85);
  if (isNaN(confidence) || confidence < 0 || confidence > 1) {
    confidence = 0.85;
  }

  let sizeUniformity: number | null = null;
  if (input.sizeUniformity !== undefined && input.sizeUniformity !== '') {
    const val = Number(input.sizeUniformity);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      sizeUniformity = val;
    } else {
      errors.sizeUniformity = 'Size uniformity must be a percentage between 0 and 100.';
    }
  }

  let visibleDefects: number | null = null;
  if (input.visibleDefects !== undefined && input.visibleDefects !== '') {
    const val = Number(input.visibleDefects);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      visibleDefects = val;
    } else {
      errors.visibleDefects = 'Visible defects must be a percentage between 0 and 100.';
    }
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    cleanedData: isValid
      ? {
          estimatedGrade: grade,
          confidenceScore: confidence,
          color: (input.color || '').trim() || null,
          visibleDamage: (input.visibleDamage || '').trim() || null,
          sizeUniformity,
          visibleDefects,
          assessmentNotes: (input.assessmentNotes || '').trim() || null,
          status: 'AI_ASSESSMENT_NOT_VERIFIED' as const,
          disclaimer:
            'AI Assessment — Not Verified. Preliminary visual estimate only. Requires authorized physical verification for formal trade grading.',
        }
      : undefined,
  };
}

export interface PhysicalVerificationInputData {
  officialGrade?: string;
  status?: string;
  moisturePercentage?: number | string;
  foreignMatterPerc?: number | string;
  inspectionLocation?: string;
  inspectionDate?: string;
  inspectionNotes?: string;
}

export function validatePhysicalVerificationInput(input: PhysicalVerificationInputData) {
  const errors: Record<string, string> = {};

  const grade = (input.officialGrade || '').trim();
  if (!grade) {
    errors.officialGrade =
      'Official verified grade is required (e.g. Grade A, Grade B, Fair Average Quality).';
  }

  const validStatuses = ['PENDING', 'PHYSICALLY_VERIFIED', 'REJECTED', 'REQUIRES_REINSPECTION'];
  const status = (validStatuses.includes(input.status || '')
    ? input.status!
    : 'PHYSICALLY_VERIFIED') as
    | 'PENDING'
    | 'PHYSICALLY_VERIFIED'
    | 'REJECTED'
    | 'REQUIRES_REINSPECTION';

  let moisture: number | null = null;
  if (input.moisturePercentage !== undefined && input.moisturePercentage !== '') {
    const m = Number(input.moisturePercentage);
    if (!isNaN(m) && m >= 0 && m <= 100) {
      moisture = m;
    } else {
      errors.moisturePercentage = 'Moisture percentage must be between 0 and 100.';
    }
  }

  let foreignMatter: number | null = null;
  if (input.foreignMatterPerc !== undefined && input.foreignMatterPerc !== '') {
    const f = Number(input.foreignMatterPerc);
    if (!isNaN(f) && f >= 0 && f <= 100) {
      foreignMatter = f;
    } else {
      errors.foreignMatterPerc = 'Foreign matter percentage must be between 0 and 100.';
    }
  }

  const inspectionDate = input.inspectionDate ? new Date(input.inspectionDate) : new Date();
  if (isNaN(inspectionDate.getTime())) {
    errors.inspectionDate = 'Invalid inspection date.';
  }

  const inspectionLocation = (input.inspectionLocation || 'On-Farm').trim();

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    cleanedData: isValid
      ? {
          officialGrade: grade,
          status,
          moisturePercentage: moisture,
          foreignMatterPerc: foreignMatter,
          inspectionLocation,
          inspectionDate,
          inspectionNotes: (input.inspectionNotes || '').trim() || null,
        }
      : undefined,
  };
}

// ----------------------------------------------------
// 4. BUYER DEMAND VALIDATION (PHASE 4A)
// ----------------------------------------------------

export interface BuyerDemandInputData {
  commodity?: string;
  variety?: string;
  requiredQuantityQtl?: number | string;
  unit?: string;
  targetPricePerQtl?: number | string;
  minPricePerQtl?: number | string;
  maxPricePerQtl?: number | string;
  destinationDistrict?: string;
  deliveryLocation?: string;
  deliveryDeadline?: string;
  requiredGrade?: string;
  qualityRequirements?: string;
  description?: string;
  status?: string;
}

export function validateBuyerDemandInput(input: BuyerDemandInputData, isUpdate = false) {
  const errors: Record<string, string> = {};

  // Commodity
  const commodity = (input.commodity || '').trim();
  if (!isUpdate && !commodity) {
    errors.commodity = 'Commodity / crop name is required.';
  }

  // Required Quantity (Quintals)
  const qty = Number(input.requiredQuantityQtl);
  if (input.requiredQuantityQtl !== undefined || !isUpdate) {
    if (isNaN(qty) || qty <= 0) {
      errors.requiredQuantityQtl = 'Required quantity must be a positive number in quintals.';
    }
  }

  // Target Price per Quintal
  const targetPrice = Number(input.targetPricePerQtl);
  if (input.targetPricePerQtl !== undefined || !isUpdate) {
    if (isNaN(targetPrice) || targetPrice <= 0) {
      errors.targetPricePerQtl = 'Target price per quintal must be greater than 0.';
    }
  }

  // Min / Max Price
  let minPrice: number | null = null;
  if (input.minPricePerQtl !== undefined && input.minPricePerQtl !== '') {
    const val = Number(input.minPricePerQtl);
    if (!isNaN(val) && val > 0) {
      minPrice = val;
    } else {
      errors.minPricePerQtl = 'Minimum price must be a positive number.';
    }
  }

  let maxPrice: number | null = null;
  if (input.maxPricePerQtl !== undefined && input.maxPricePerQtl !== '') {
    const val = Number(input.maxPricePerQtl);
    if (!isNaN(val) && val > 0) {
      maxPrice = val;
    } else {
      errors.maxPricePerQtl = 'Maximum price must be a positive number.';
    }
  }

  if (minPrice && maxPrice && minPrice > maxPrice) {
    errors.maxPricePerQtl = 'Maximum price cannot be less than minimum price.';
  }

  // Destination District
  const district = (input.destinationDistrict || '').trim();
  if (!isUpdate && !district) {
    errors.destinationDistrict = 'Destination district is required.';
  } else if (district && !(ALL_SUPPORTED_DISTRICTS as readonly string[]).includes(district)) {
    errors.destinationDistrict = 'Please select a valid supported district.';
  }

  // Delivery Deadline
  let deadline: Date = new Date();
  if (input.deliveryDeadline) {
    deadline = new Date(input.deliveryDeadline);
    if (isNaN(deadline.getTime())) {
      errors.deliveryDeadline = 'Invalid delivery deadline date.';
    }
  } else if (!isUpdate) {
    errors.deliveryDeadline = 'Delivery deadline is required.';
  }

  // Status
  const validStatuses = ['ACTIVE', 'PAUSED', 'FULFILLED', 'CANCELLED'];
  const status = (input.status && validStatuses.includes(input.status)
    ? input.status
    : 'ACTIVE') as 'ACTIVE' | 'PAUSED' | 'FULFILLED' | 'CANCELLED';

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    cleanedData: isValid
      ? {
          commodity: commodity || undefined,
          variety: (input.variety || '').trim() || null,
          requiredQuantityQtl: qty,
          unit: (input.unit || 'Quintal').trim(),
          targetPricePerQtl: targetPrice,
          minPricePerQtl: minPrice,
          maxPricePerQtl: maxPrice,
          destinationDistrict: district || undefined,
          deliveryLocation: (input.deliveryLocation || '').trim() || null,
          deliveryDeadline: deadline,
          requiredGrade: (input.requiredGrade || 'Grade A').trim(),
          qualityRequirements: (input.qualityRequirements || '').trim() || null,
          description: (input.description || '').trim() || null,
          status,
        }
      : undefined,
  };
}

// ----------------------------------------------------
// 5. DIGITAL OFFER VALIDATION (PHASE 4A)
// ----------------------------------------------------

export interface OfferInputData {
  offeredPricePerQtl?: number | string;
  quantityQuintals?: number | string;
  proposedPickupDate?: string;
  paymentTerms?: string;
  validUntil?: string;
  notes?: string;
}

export function validateOfferInput(input: OfferInputData) {
  const errors: Record<string, string> = {};

  const price = Number(input.offeredPricePerQtl);
  if (isNaN(price) || price <= 0) {
    errors.offeredPricePerQtl = 'Offered price must be greater than 0.';
  }

  const qty = Number(input.quantityQuintals);
  if (isNaN(qty) || qty <= 0) {
    errors.quantityQuintals = 'Offer quantity must be greater than 0 quintals.';
  }

  let pickupDate = new Date();
  if (input.proposedPickupDate) {
    pickupDate = new Date(input.proposedPickupDate);
    if (isNaN(pickupDate.getTime())) {
      errors.proposedPickupDate = 'Invalid proposed pickup date.';
    }
  }

  let validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default
  if (input.validUntil) {
    validUntil = new Date(input.validUntil);
    if (isNaN(validUntil.getTime())) {
      errors.validUntil = 'Invalid offer expiration date.';
    }
  }

  const paymentTerms = (input.paymentTerms || 'ESCROW_ON_DELIVERY').trim();
  const notes = (input.notes || '').trim() || null;

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    cleanedData: isValid
      ? {
          offeredPricePerQtl: price,
          quantityQuintals: qty,
          proposedPickupDate: pickupDate,
          paymentTerms,
          validUntil,
          notes,
          status: 'PENDING' as const,
        }
      : undefined,
  };
}

export function validateOfferStatusUpdate(status: string) {
  const validTransitions = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED'];
  if (!validTransitions.includes(status)) {
    return {
      isValid: false,
      error: `Invalid offer status: ${status}. Must be one of: ${validTransitions.join(', ')}`,
    };
  }
  return { isValid: true, status };
}


