'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { KEY_CROPS } from '@/lib/constants';

interface CropSelectorProps {
  value: string;
  onChange: (cropNameEn: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export function CropSelector({
  value,
  onChange,
  error,
  label,
  required = true,
}: CropSelectorProps) {
  const { t, locale } = useLanguage();

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-bold text-[#262320] flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-[#B91C1C]">*</span>}
          </span>
          <span className="text-[11px] text-[#635E59] font-normal">
            {t.lots?.selectOrTypeCrop || 'Select below or type custom crop'}
          </span>
        </label>
      )}

      {/* Quick select pills with crop emojis */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 rounded-[6px] border ${
          error ? 'border-red-500 bg-red-50/20' : 'border-[#D8D2C4] bg-[#FAFAF8]'
        }`}
      >
        {KEY_CROPS.map((crop) => {
          const displayName =
            locale === 'mr'
              ? crop.nameMr
              : locale === 'te'
              ? crop.nameTe
              : locale === 'hi'
              ? crop.nameHi
              : crop.nameEn;
          const isSelected =
            value.trim().toLowerCase() === crop.nameEn.toLowerCase() ||
            value.trim().toLowerCase() === displayName.toLowerCase();

          return (
            <button
              key={crop.id}
              type="button"
              onClick={() => onChange(crop.nameEn)}
              className={`px-2.5 py-2 rounded-[6px] text-xs font-semibold flex items-center gap-2 border transition-all text-left ${
                isSelected
                  ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-sm ring-1 ring-[#1B4332]'
                  : 'bg-white border-[#D8D2C4] text-[#262320] hover:bg-[#F4F1EA] hover:border-[#B7D5C4]'
              }`}
            >
              <span className="text-base shrink-0">{crop.icon}</span>
              <span className="truncate">{displayName}</span>
            </button>
          );
        })}
      </div>

      {/* Custom/Selected Crop Text Input */}
      <div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.lots?.cropCustomPlaceholder || 'Enter crop name (e.g. Onion, Wheat)'}
          className={`w-full h-10 px-3 text-xs border rounded-[6px] bg-white transition-colors focus:outline-none ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-900 bg-red-50/30'
              : 'border-[#D8D2C4] focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] text-[#262320]'
          }`}
        />
        {error && (
          <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    </div>
  );
}
