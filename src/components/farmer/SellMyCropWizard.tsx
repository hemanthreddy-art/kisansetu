'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { CropPhotoUpload } from './CropPhotoUpload';
import { CropSelector } from './CropSelector';
import {
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertTriangle,
  Scale,
  MapPin,
  Tag,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { formatINR, calculateNetRealisation } from '@/lib/utils';
import { ProduceLot } from '@/types';
import { MAHARASHTRA_DISTRICTS, ANDHRA_PRADESH_DISTRICTS } from '@/lib/constants';
import { analyzeCropPhotos, AiAssessmentResult } from '@/lib/quality-ai';

interface SellMyCropWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLot: ProduceLot) => void;
  initialDistrict?: string;
  initialLocation?: string;
}

const COMMON_VARIETIES: Record<string, string[]> = {
  Onion: ['Nashik Red Garva', 'Pusa Red', 'AgriFound Dark Red'],
  Soybean: ['JS 335', 'JS 9305', 'MACS 1407'],
  Wheat: ['Lokwan', 'Sharbati', 'HD 2967'],
  Cotton: ['BT Hybrid-2', 'Bunny BT', 'DCH 32'],
  Tomato: ['Abhinav Hybrid', 'Vaishali', 'Pusa Ruby'],
  Turmeric: ['Salem', 'Waigaon GI', 'Rajapuri'],
  'Tur / Arhar': ['BDN 711', 'BSMR 736', 'Maruti'],
  'Rice / Paddy': ['Indrayani', 'Wada Kolam', 'Basmati 370'],
  'Maize / Corn': ['Kaveri 50', 'Pioneer 3396', 'DeKalb 9108'],
  Potato: ['Kufri Jyoti', 'Kufri Chandramukhi', 'Kufri Pukhraj'],
  Sugarcane: ['Co 86032', 'Co 0265', 'CoM 0265'],
  Grapes: ['Thompson Seedless', 'Sharad Seedless', 'Tas-A-Ganesh'],
  Pomegranate: ['Bhagwa', 'Arakta', 'Ganesh'],
  Groundnut: ['TAG 24', 'TG 37A', 'JL 24'],
  'Red Chilli': ['Byadagi', 'Guntur Sanam', 'Teja'],
  'Raw Cashew Nut': ['Vengurla-4', 'Vengurla-7'],
  Mango: ['Alphonso (Hapus)', 'Kesar', 'Banganapalli'],
  Banana: ['Grand Naine (G9)', 'Robusta', 'Ardhapuri'],
};

export function SellMyCropWizard({
  isOpen,
  onClose,
  onSuccess,
  initialDistrict = 'Nashik',
  initialLocation = 'Niphad, Nashik',
}: SellMyCropWizardProps) {
  const { t } = useLanguage();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form State
  const [commodity, setCommodity] = useState('Onion');
  const [variety, setVariety] = useState('Nashik Red Garva');
  const [quantity, setQuantity] = useState('80');
  const [unit, setUnit] = useState<'Quintal' | 'Tonnes' | 'Kg'>('Quintal');
  const [expectedPrice, setExpectedPrice] = useState('2350');
  const [district, setDistrict] = useState(initialDistrict);
  const [location, setLocation] = useState(initialLocation);
  const todayStr = new Date().toISOString().split('T')[0];
  const [harvestDate] = useState(todayStr);

  // Photos State
  const [photos, setPhotos] = useState<string[]>([]);

  // Step 3 AI Screening State
  const [estimatedGrade, setEstimatedGrade] = useState('Grade A');
  const [surfaceColor, setSurfaceColor] = useState('Uniform Deep Color');
  const [defectObservation, setDefectObservation] = useState('Minimal surface blemishes (< 3%)');
  const [aiNotes, setAiNotes] = useState('Photographic visual screen confirms standard dry skin uniformity.');

  // Automated AI Visual Assessment via quality-ai engine
  const aiResult: AiAssessmentResult = React.useMemo(() => {
    return analyzeCropPhotos({
      crop: commodity,
      variety: variety,
      photos: photos,
    });
  }, [commodity, variety, photos]);

  // Sync initial AI parameters when aiResult updates
  React.useEffect(() => {
    if (aiResult) {
      setEstimatedGrade(aiResult.estimatedGrade);
      setSurfaceColor(aiResult.visibleIndicators.colorUniformity);
      setDefectObservation(aiResult.visibleIndicators.visibleDefects);
      setAiNotes(aiResult.assessmentNotes);
    }
  }, [aiResult]);

  if (!isOpen) return null;

  // Clear single field error when user modifies it
  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (errorMsg) setErrorMsg(null);
  };

  // Calculate quantity in Quintals
  const qtyNum = parseFloat(quantity) || 0;
  let qtyInQuintals = qtyNum;
  if (unit === 'Kg') qtyInQuintals = qtyNum / 100;
  if (unit === 'Tonnes') qtyInQuintals = qtyNum * 10;

  const priceNum = parseFloat(expectedPrice) || 0;
  const estimatedGrossValue = Math.round(qtyInQuintals * priceNum);
  const estimatedCalc = calculateNetRealisation({
    pricePerQuintal: priceNum,
    quantityQuintals: qtyInQuintals,
    distanceKm: 40,
  });

  const handleCommodityChange = (crop: string) => {
    setCommodity(crop);
    clearFieldError('crop');
    if (COMMON_VARIETIES[crop] && COMMON_VARIETIES[crop].length > 0) {
      setVariety(COMMON_VARIETIES[crop][0]);
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!commodity || !commodity.trim()) {
      errors.crop = 'Please select or enter a crop name.';
    }
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      errors.quantity = 'Please enter a valid quantity greater than 0.';
    } else if (qtyNum > 100000) {
      errors.quantity = 'Quantity exceeds maximum allowable lot size (100,000).';
    }

    if (!['Quintal', 'Tonnes', 'Kg'].includes(unit)) {
      errors.unit = 'Unit must be Quintal, Tonnes, or Kg.';
    }

    if (!expectedPrice || isNaN(priceNum) || priceNum <= 0) {
      errors.expectedPrice = 'Please enter an expected price greater than 0.';
    }

    if (!district || !district.trim()) {
      errors.district = 'Please select a supported agricultural district.';
    }

    if (!location || !location.trim()) {
      errors.location = 'Please provide farm village or taluka location.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const messages = Object.values(errors);
      setErrorMsg(messages[0]);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePublish = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      setFieldErrors({});

      // Map UI grade label to backend grade letter code (A, B, C)
      let gradeCode = 'Not Graded Yet';
      if (estimatedGrade.includes('A')) gradeCode = 'A';
      else if (estimatedGrade.includes('B')) gradeCode = 'B';
      else if (estimatedGrade.includes('C')) gradeCode = 'C';

      // 1. Create produce lot via existing /api/lots
      const lotPayload = {
        crop: commodity.trim(),
        variety: variety.trim() || undefined,
        quantity: qtyNum,
        unit: unit, // Strict 'Quintal' | 'Tonnes' | 'Kg'
        district: district.trim() || 'Nashik',
        location: location.trim() || `${district} Farm Gate`,
        harvestDate: harvestDate || todayStr,
        availabilityDate: harvestDate || todayStr,
        expectedPrice: priceNum,
        expectedGrade: gradeCode,
        description: `Farmer listing with AI visual screening. ${photos.length} photos uploaded.`,
        photos: photos,
        status: 'AVAILABLE',
      };

      const res = await fetch('/api/lots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lotPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.details) {
          setFieldErrors(data.details);
          const detailMessages = Object.entries(data.details)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' • ');
          setErrorMsg(detailMessages || data.error);

          // Auto-route back to Step 1 if the error belongs to Step 1 inputs
          const step1Fields = ['crop', 'quantity', 'unit', 'district', 'location', 'expectedPrice', 'variety'];
          if (Object.keys(data.details).some((k) => step1Fields.includes(k))) {
            setCurrentStep(1);
          }
        } else {
          setErrorMsg(data.error || 'Failed to publish produce lot. Please verify inputs.');
        }
        return;
      }

      const createdLot: ProduceLot = data.data;

      // 2. If photos or preliminary AI screening exists, submit non-binding assessment
      if (createdLot && (createdLot.lotCode || createdLot.id)) {
        const lotIdentifier = createdLot.lotCode || createdLot.id;
        try {
          await fetch(`/api/lots/${encodeURIComponent(lotIdentifier)}/assessment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              estimatedGrade: estimatedGrade,
              confidenceScore: aiResult ? aiResult.confidenceScore : 0.88,
              color: surfaceColor,
              visibleDamage: defectObservation,
              sizeUniformity: aiResult ? aiResult.visibleIndicators.sizeUniformityPercent : 92,
              visibleDefects: aiResult ? Math.round((100 - aiResult.visibleIndicators.sizeUniformityPercent) * 0.4) : 3,
              assessmentNotes: aiNotes,
              photos: photos,
              maturityCuringStatus: aiResult?.visibleIndicators.maturityCuringStatus,
              foreignMatterPercent: aiResult?.visibleIndicators.foreignMatterPercent,
              retakeRecommendations: aiResult?.retakeRecommendations,
              nonObservableNotice: aiResult?.nonObservableNotice,
            }),
          });
        } catch (assessErr) {
          console.warn('AI screening submission non-critical warning:', assessErr);
        }
      }

      onSuccess(createdLot);
      onClose();
    } catch (err) {
      console.error('Error in Sell My Crop publish:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Publish failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[12px] border border-[#D8D2C4] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D8D2C4] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-[#1B4332] uppercase bg-[#EAF2ED] px-2 py-0.5 rounded border border-[#B7D5C4]">
                {t.farmer.wizardTitle}
              </span>
              <span className="text-xs font-semibold text-[#635E59]">
                Step {currentStep} of 4
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#262320] mt-0.5">
              {currentStep === 1 && t.farmer.step1Title}
              {currentStep === 2 && t.farmer.step2Title}
              {currentStep === 3 && t.farmer.step3Title}
              {currentStep === 4 && t.farmer.step4Title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#635E59] hover:text-[#262320] p-1.5 rounded-full hover:bg-[#ECE7DE] transition-colors"
            title={t.farmer.closeWizard}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full bg-[#ECE7DE] h-1.5 flex">
          <div
            className="bg-[#1B4332] h-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-[8px] text-xs text-red-800 flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="block font-bold text-red-900">Please review the following:</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* STEP 1: CROP DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-[#635E59]">
                {t.farmer.step1Subtitle}
              </p>

              {/* Crop Selector with Icons (Reusing KEY_CROPS and visual pill style) */}
              <CropSelector
                value={commodity}
                onChange={handleCommodityChange}
                error={fieldErrors.crop}
                label={t.common.commodity}
                required
              />

              {/* Variety Input */}
              <div>
                <label className="block text-xs font-bold text-[#262320] mb-1">
                  {t.common.variety}
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => {
                    setVariety(e.target.value);
                    clearFieldError('variety');
                  }}
                  placeholder="e.g. Nashik Red Garva, Lokwan, JS 335"
                  className={`w-full h-10 px-3 text-xs border rounded-[6px] focus:outline-none transition-colors ${
                    fieldErrors.variety
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500 bg-red-50/20'
                      : 'border-[#D8D2C4] focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]'
                  }`}
                />
                {fieldErrors.variety && (
                  <p className="text-[11px] font-semibold text-red-600 mt-1">⚠ {fieldErrors.variety}</p>
                )}
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#262320] mb-1">
                    {t.common.quantity} <span className="text-[#B91C1C]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        clearFieldError('quantity');
                      }}
                      className={`w-full h-10 px-3 text-xs border rounded-[6px] focus:outline-none transition-colors ${
                        fieldErrors.quantity
                          ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500 bg-red-50/20'
                          : 'border-[#D8D2C4] focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]'
                      }`}
                      placeholder="e.g. 80"
                    />
                    <Scale className="w-4 h-4 text-[#635E59] absolute right-3 top-3 pointer-events-none" />
                  </div>
                  {fieldErrors.quantity && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1">⚠ {fieldErrors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#262320] mb-1">
                    {t.farmer.unitLabel || 'Unit'} <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => {
                      setUnit(e.target.value as 'Quintal' | 'Tonnes' | 'Kg');
                      clearFieldError('unit');
                    }}
                    className={`w-full h-10 px-3 text-xs border rounded-[6px] bg-white focus:outline-none transition-colors ${
                      fieldErrors.unit
                        ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500 bg-red-50/20'
                        : 'border-[#D8D2C4] focus:border-[#1B4332]'
                    }`}
                  >
                    <option value="Quintal">{t.common.unitQuintal || 'Quintal (Qtl)'}</option>
                    <option value="Tonnes">{t.common.unitTonnes || 'Tonnes (MT)'}</option>
                    <option value="Kg">{t.common.unitKg || 'Kilograms (Kg)'}</option>
                  </select>
                  {fieldErrors.unit && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1">⚠ {fieldErrors.unit}</p>
                  )}
                </div>
              </div>

              {/* Expected Price & Benchmark */}
              <div>
                <label className="block text-xs font-bold text-[#262320] mb-1">
                  {t.common.targetPrice} (₹ {t.common.perQuintal}) <span className="text-[#B91C1C]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-[#635E59]">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={expectedPrice}
                    onChange={(e) => {
                      setExpectedPrice(e.target.value);
                      clearFieldError('expectedPrice');
                    }}
                    className={`w-full h-10 pl-7 pr-3 text-xs border rounded-[6px] focus:outline-none font-semibold text-[#1B4332] transition-colors ${
                      fieldErrors.expectedPrice
                        ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500 bg-red-50/20'
                        : 'border-[#D8D2C4] focus:border-[#1B4332]'
                    }`}
                    placeholder="2350"
                  />
                  <Tag className="w-4 h-4 text-[#635E59] absolute right-3 top-3 pointer-events-none" />
                </div>
                {fieldErrors.expectedPrice ? (
                  <p className="text-[11px] font-semibold text-red-600 mt-1">⚠ {fieldErrors.expectedPrice}</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-[#635E59]">
                      <span>{t.farmer.mandiBenchmark || 'Mandi Benchmark'}: ₹2,250 – ₹2,450/qtl</span>
                      <span className="font-semibold text-[#1B4332]">{t.farmer.estGrossPayout || 'Est. Gross'}: {formatINR(estimatedGrossValue)}</span>
                    </div>

                    {qtyInQuintals > 0 && priceNum > 0 && (
                      <div className="mt-2.5 p-2.5 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[6px] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1B4332] flex items-center gap-1 text-[11px]">
                            <span>💰 {t.farmer.estAmountYouReceive}</span>
                            <span className="text-[10px] font-normal text-[#2D6A4F]">(Net Realisation)</span>
                          </span>
                          <strong className="text-[#1B4332] font-black text-sm">
                            {formatINR(estimatedCalc.netRealisation)}
                            <span className="text-[10px] font-normal text-[#2D6A4F] ml-1">
                              (₹{estimatedCalc.netRealisationPerQuintal}/Qtl)
                            </span>
                          </strong>
                        </div>
                        <div className="text-[10px] text-[#2D6A4F] flex items-center justify-between pt-0.5 border-t border-[#B7D5C4]/50">
                          <span>Gross: {formatINR(estimatedCalc.grossSaleValue)} − Est. Freight (40km): -{formatINR(estimatedCalc.transportCost)}</span>
                          <span className="font-semibold text-emerald-800">0% Mandi Commission</span>
                        </div>
                        <p className="text-[10px] text-[#635E59] italic pt-0.5">
                          {t.farmer.estDeductionsNotice}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* District & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#262320] mb-1">
                    {t.farmer.districtLabel || 'District'} <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      clearFieldError('district');
                    }}
                    className={`w-full h-10 px-3 text-xs border rounded-[6px] bg-white focus:outline-none transition-colors ${
                      fieldErrors.district
                        ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500 bg-red-50/20'
                        : 'border-[#D8D2C4] focus:border-[#1B4332]'
                    }`}
                  >
                    <optgroup label="Maharashtra Districts">
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Andhra Pradesh Districts">
                      {ANDHRA_PRADESH_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </optgroup>
                  </select>
                  {fieldErrors.district && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1">⚠ {fieldErrors.district}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#262320] mb-1">
                    {t.common.location} <span className="text-[#B91C1C]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        clearFieldError('location');
                      }}
                      className={`w-full h-10 px-3 text-xs border rounded-[6px] focus:outline-none transition-colors ${
                        fieldErrors.location
                          ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500 bg-red-50/20'
                          : 'border-[#D8D2C4] focus:border-[#1B4332]'
                      }`}
                      placeholder="Village / Taluka (e.g. Niphad, Nashik)"
                    />
                    <MapPin className="w-4 h-4 text-[#635E59] absolute right-3 top-3 pointer-events-none" />
                  </div>
                  {fieldErrors.location && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1">⚠ {fieldErrors.location}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: UPLOAD PHOTOS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <CropPhotoUpload
                photos={photos}
                onChange={setPhotos}
                maxPhotos={4}
              />
              <div className="p-3 bg-[#EAF2ED]/50 border border-[#B7D5C4] rounded-[6px] text-xs text-[#1B4332] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#1B4332]" />
                  <span>{t.farmer.whyPhotosTitle || 'Why upload produce photos?'}</span>
                </div>
                <p className="text-[11px] text-[#2D6A4F] leading-relaxed">
                  {t.farmer.whyPhotosDesc || 'Photos are used for instant visual screening (color, grain size, uniformity) so buyers can make verified pre-dispatch bids.'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: AI PRELIMINARY QUALITY CHECK */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Mandatory AI Screening Disclaimer Banner */}
              <div className="p-3.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-[8px] text-xs text-[#92400E] space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <ShieldAlert className="w-4 h-4 text-[#92400E] shrink-0" />
                    <span>AI Visual Assessment — Preliminary</span>
                    <span className="text-xs text-amber-800 font-normal">({t.farmer.aiScreeningNotice})</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                    Non-Binding • Visual Screening
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Preliminary visual estimate based on uploaded photographs. This screening is non-binding and does NOT constitute an official AGMARK/MSAMB statutory certificate. Physical verification occurs via the Exception & Escalation Desk if triggered.
                </p>
              </div>

              {/* Confidence Score & Photo Count Summary */}
              <div className="p-3 bg-[#FAF8F5] border border-[#D8D2C4] rounded-[8px] flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EAF2ED] border border-[#B7D5C4] flex items-center justify-center font-bold text-xs text-[#1B4332]">
                    <Sparkles className="w-4 h-4 text-[#1B4332]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#262320] block">Visual Confidence Score</span>
                    <span className="text-[11px] text-[#635E59]">
                      {photos.length} photo{photos.length === 1 ? '' : 's'} analyzed for surface indicators
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-base font-heading font-black text-[#1B4332]">
                      {Math.round((aiResult?.confidenceScore ?? 0.85) * 100)}%
                    </span>
                    <span className="block text-[10px] text-[#635E59]">Confidence</span>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1B4332] rounded-full transition-all"
                      style={{ width: `${Math.round((aiResult?.confidenceScore ?? 0.85) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Retake guidance recommendations if present */}
              {aiResult && aiResult.retakeRecommendations && aiResult.retakeRecommendations.length > 0 && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-[8px] text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-950">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    <span>Photo Guidance for Higher Confidence</span>
                  </div>
                  <ul className="text-[11px] space-y-0.5 list-disc pl-4 text-blue-800">
                    {aiResult.retakeRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Estimated Preliminary Grade Selector */}
              <div>
                <label className="block text-xs font-bold text-[#262320] mb-2">
                  {t.farmer.aiEstimatedGrade}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Grade A', 'Grade B', 'Grade C'].map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setEstimatedGrade(grade)}
                      className={`p-3 rounded-[8px] border text-center transition-all ${
                        estimatedGrade === grade
                          ? 'border-[#1B4332] bg-[#EAF2ED] text-[#1B4332] font-black shadow-sm ring-1 ring-[#1B4332]'
                          : 'border-[#D8D2C4] bg-white text-[#635E59] hover:border-stone-400'
                      }`}
                    >
                      <div className="text-sm font-heading font-bold">{grade}</div>
                      <div className="text-[10px] font-normal text-[#635E59] mt-0.5">
                        {grade === 'Grade A' ? 'Premium Quality' : grade === 'Grade B' ? 'Fair Average (FAQ)' : 'Standard'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Observations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#262320] mb-1">
                    {t.farmer.aiColorObservation}
                  </label>
                  <input
                    type="text"
                    value={surfaceColor}
                    onChange={(e) => setSurfaceColor(e.target.value)}
                    className="w-full h-10 px-3 text-xs border border-[#D8D2C4] rounded-[6px] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#262320] mb-1">
                    {t.farmer.aiDamageObservation}
                  </label>
                  <input
                    type="text"
                    value={defectObservation}
                    onChange={(e) => setDefectObservation(e.target.value)}
                    className="w-full h-10 px-3 text-xs border border-[#D8D2C4] rounded-[6px] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              {/* Visible Parameters: Maturity, Uniformity & Foreign Matter */}
              {aiResult && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-white border border-[#D8D2C4] rounded-[6px]">
                    <span className="text-[10px] uppercase font-bold text-[#635E59] block">Maturity / Curing</span>
                    <strong className="text-xs text-[#262320] block mt-0.5">
                      {aiResult.visibleIndicators.maturityCuringStatus}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white border border-[#D8D2C4] rounded-[6px]">
                    <span className="text-[10px] uppercase font-bold text-[#635E59] block">Size Uniformity</span>
                    <strong className="text-xs text-[#1B4332] block mt-0.5">
                      {aiResult.visibleIndicators.sizeUniformityPercent}% Uniform
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white border border-[#D8D2C4] rounded-[6px]">
                    <span className="text-[10px] uppercase font-bold text-[#635E59] block">Surface Foreign Matter</span>
                    <strong className="text-xs text-[#262320] block mt-0.5">
                      {aiResult.visibleIndicators.foreignMatterPercent}% Extraneous
                    </strong>
                  </div>
                </div>
              )}

              {/* Strict Non-Fabrication Guarantee: Physical Measurement Required */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-[6px] text-xs text-stone-700 space-y-1">
                <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-stone-600" />
                  <span>Physical Measurement Required</span>
                </span>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Moisture %, internal sugar/rot, and chemical residues cannot be determined from photographs and are never simulated. Official assaying with a digital moisture meter occurs at dispatch or destination mandi weighbridge.
                </p>
              </div>

              {/* Screening Notes */}
              <div>
                <label className="block text-xs font-bold text-[#262320] mb-1">
                  Preliminary Screening Notes
                </label>
                <textarea
                  rows={2}
                  value={aiNotes}
                  onChange={(e) => setAiNotes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#D8D2C4] rounded-[6px] focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PUBLISH */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-[#635E59]">
                {t.farmer.step4Subtitle}
              </p>

              {/* Produce Summary Card */}
              <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-[8px] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
                  <div>
                    <h3 className="font-heading font-black text-lg text-[#262320]">
                      {commodity} {variety && <span className="font-normal text-sm text-[#635E59]">({variety})</span>}
                    </h3>
                    <div className="text-xs text-[#635E59] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{location || district}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#EAF2ED] text-[#1B4332] font-black text-xs border border-[#B7D5C4]">
                    {estimatedGrade}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-white rounded border border-[#D8D2C4]">
                    <span className="text-[#635E59] block text-[10px] uppercase">{t.common.quantity}</span>
                    <strong className="text-[#262320] text-sm">{qtyInQuintals} {t.common.quintals}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-[#D8D2C4]">
                    <span className="text-[#635E59] block text-[10px] uppercase">{t.common.targetPrice}</span>
                    <strong className="text-[#1B4332] text-sm">₹{priceNum} {t.common.perQuintal}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-[#D8D2C4] col-span-2 sm:col-span-1">
                    <span className="text-[#635E59] block text-[10px] uppercase">{t.farmer.estGrossPayout || 'Est. Gross Payout'}</span>
                    <strong className="text-[#1B4332] text-sm font-black">{formatINR(estimatedGrossValue)}</strong>
                  </div>
                </div>

                {/* Contextual Estimated Net Realisation Card */}
                <div className="p-3 bg-[#EAF2ED] border border-[#52B788] rounded-[8px] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#1B4332] uppercase tracking-wider block">
                        💰 {t.farmer.estAmountYouReceive}
                      </span>
                      <span className="text-xs text-[#2D6A4F] font-semibold">
                        ₹{estimatedCalc.netRealisationPerQuintal} / {t.common.unitQuintal || 'Quintal'} (Net Realisation)
                      </span>
                    </div>
                    <strong className="text-xl font-heading font-black text-[#1B4332]">
                      {formatINR(estimatedCalc.netRealisation)}
                    </strong>
                  </div>
                  <div className="pt-1.5 border-t border-[#B7D5C4]/60 flex items-center justify-between text-[11px] text-[#635E59]">
                    <span>Gross: {formatINR(estimatedCalc.grossSaleValue)} • Est. Transport (40km): -{formatINR(estimatedCalc.transportCost)}</span>
                    <span className="text-emerald-800 font-semibold">0% Mandi Fee</span>
                  </div>
                  <p className="text-[10px] text-[#635E59] italic pt-0.5">
                    {t.farmer.estDeductionsNotice}
                  </p>
                </div>

                {/* Photo Previews */}
                {photos.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-[#635E59] block mb-1.5">
                      {t.farmer.uploadedPhotos || 'Uploaded Photos'} ({photos.length})
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {photos.map((src, idx) => (
                        <div key={idx} className="w-14 h-14 rounded-[4px] overflow-hidden border border-[#D8D2C4] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="Thumbnail" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ready to Publish Notice */}
              <div className="p-3 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[6px] text-xs text-[#1B4332] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Once published, buyers can view your lot and submit competitive offers. You choose which offer to accept.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#D8D2C4] bg-[#FAF8F5] flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={submitting}
              className="border-[#D8D2C4] text-[#262320] gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.farmer.stepBack}</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="border-[#D8D2C4] text-[#635E59] text-xs"
            >
              {t.common.cancel}
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-1.5 text-xs font-bold"
            >
              <span>{t.farmer.stepNext}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handlePublish}
              disabled={submitting}
              className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-2 text-sm font-black px-6 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.farmer.publishBtn}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
