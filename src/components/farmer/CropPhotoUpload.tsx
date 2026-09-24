'use client';

import React, { useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CropPhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

function compressImageFile(file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(dataUrl);
          }
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export function CropPhotoUpload({
  photos,
  onChange,
  maxPhotos = 4,
}: CropPhotoUploadProps) {
  const { t } = useLanguage();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) return;

    const filesToRead = Array.from(files).slice(0, remainingSlots);
    const compressedPhotos = await Promise.all(
      filesToRead.map((file) => compressImageFile(file))
    );
    const validPhotos = compressedPhotos.filter((p) => Boolean(p));

    if (validPhotos.length > 0) {
      onChange([...photos, ...validPhotos]);
    }

    // Reset input
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Photo Counter & Instructions */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
            {t.farmer.step2Title}
          </span>
          <p className="text-xs text-[#635E59]">
            {t.farmer.step2Subtitle}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {photos.length >= 2 ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ Multi-Photo Ready
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              2+ Photos Recommended
            </span>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#ECE7DE] border border-[#D8D2C4] text-[#262320]">
            {t.farmer.photoCount.replace('{count}', String(photos.length))}
          </span>
        </div>
      </div>

      {/* Multi-Photo Angle Checklist Hint */}
      <div className="p-3 bg-[#FAF8F5] border border-[#EBE7DF] rounded-[8px] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className={`p-2 rounded border ${photos.length >= 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-white border-[#D8D2C4] text-[#635E59]'}`}>
          <span className="text-[10px] font-bold block uppercase tracking-wider">Photo 1</span>
          <span>Whole Lot / Pile Overview</span>
        </div>
        <div className={`p-2 rounded border ${photos.length >= 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-white border-[#D8D2C4] text-[#635E59]'}`}>
          <span className="text-[10px] font-bold block uppercase tracking-wider">Photo 2</span>
          <span>Close-Up Sample (5-10 units)</span>
        </div>
        <div className={`p-2 rounded border ${photos.length >= 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-white border-[#D8D2C4] text-[#635E59]'}`}>
          <span className="text-[10px] font-bold block uppercase tracking-wider">Photo 3 (Optional)</span>
          <span>Skin / Cross-Section Check</span>
        </div>
      </div>

      {/* Upload Action Buttons */}
      {photos.length < maxPhotos && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Direct Camera Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 h-14 border-2 border-dashed border-[#1B4332]/40 bg-[#EAF2ED]/30 hover:bg-[#EAF2ED] text-[#1B4332] font-semibold text-sm transition-all"
            >
              <Camera className="w-5 h-5 text-[#1B4332]" />
              <span>{t.farmer.takePhotoBtn}</span>
            </Button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Gallery / File Picker */}
            <Button
              type="button"
              variant="outline"
              onClick={() => galleryInputRef.current?.click()}
              className="flex items-center justify-center gap-2 h-14 border-2 border-dashed border-[#D8D2C4] bg-white hover:bg-stone-50 text-[#262320] font-semibold text-sm transition-all"
            >
              <Upload className="w-5 h-5 text-[#635E59]" />
              <span>{t.farmer.uploadPhotoBtn}</span>
            </Button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Quick Demo Sample Photos CTA */}
          {photos.length === 0 && (
            <button
              type="button"
              onClick={() => {
                const sample1 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23831843"/><circle cx="200" cy="200" r="140" fill="%239d174d" stroke="%23701a75" stroke-width="6"/><text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" font-size="76">🧅</text><text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="20" font-weight="bold">Nashik Red Garva</text><text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" fill="%23fbcfe8" font-family="sans-serif" font-size="13">Lot Sample Photo 1 (High Quality)</text></svg>';
                const sample2 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23701a75"/><circle cx="200" cy="200" r="140" fill="%2386198f" stroke="%23581c87" stroke-width="6"/><text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" font-size="76">🧅</text><text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="20" font-weight="bold">Skin Dryness &amp; Purity</text><text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" fill="%23f5d0fe" font-family="sans-serif" font-size="13">Lot Sample Photo 2 (Visual Screening)</text></svg>';
                onChange([sample1, sample2]);
              }}
              className="w-full py-1.5 px-3 bg-[#ECE7DE] hover:bg-[#D8D2C4] text-[#262320] text-xs font-semibold rounded border border-[#D8D2C4] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>📷 Load Sample Demo Crop Photos</span>
            </button>
          )}
        </div>
      )}

      {/* Photo Previews Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {photos.map((src, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-[6px] overflow-hidden border border-[#D8D2C4] bg-stone-100 group shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Crop photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 right-1">
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md transition-all"
                  title={t.farmer.removePhoto}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 border border-dashed border-[#D8D2C4] rounded-[8px] bg-[#F4F1EA]/50 text-center space-y-2">
          <ImageIcon className="w-8 h-8 text-[#635E59] mx-auto opacity-40" />
          <p className="text-xs text-[#635E59]">
            {t.quality.photoEmptyPrompt || 'Add produce photos to enable AI preliminary screening.'}
          </p>
        </div>
      )}
    </div>
  );
}
