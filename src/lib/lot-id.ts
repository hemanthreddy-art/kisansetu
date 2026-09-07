import { db } from './db';

/**
 * Clean human-readable Unique Lot ID Generator
 * Format: KS-[CROP]-[YEAR]-[SEQUENCE]
 * Example: KS-ONION-2026-0001, KS-TOMATO-2026-0002
 */
export async function generateUniqueLotId(cropName: string): Promise<string> {
  // 1. Sanitize crop code (max 8 letters uppercase)
  let cleanCrop = cropName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  if (!cleanCrop) {
    cleanCrop = 'PRODUCE';
  } else if (cleanCrop === 'SUGARCANE') {
    cleanCrop = 'SUGAR';
  } else if (cleanCrop.length > 8) {
    cleanCrop = cleanCrop.slice(0, 8);
  }

  const currentYear = new Date().getFullYear();
  const basePrefix = `KS-${cleanCrop}-${currentYear}`;

  // 2. Count existing lots with this prefix to determine sequential number
  try {
    const existingCount = await db.produceLot.count({
      where: {
        lotCode: {
          startsWith: basePrefix,
        },
      },
    });

    let sequence = existingCount + 1;
    let candidateLotId = `${basePrefix}-${String(sequence).padStart(4, '0')}`;

    // 3. Ensure absolute uniqueness (prevent collision in concurrent creations)
    let exists = await db.produceLot.findUnique({
      where: { lotCode: candidateLotId },
      select: { id: true },
    });

    while (exists) {
      sequence += 1;
      const randomSuffix = Math.floor(10 + Math.random() * 90); // 2 digit entropy
      candidateLotId = `${basePrefix}-${String(sequence).padStart(4, '0')}-${randomSuffix}`;
      exists = await db.produceLot.findUnique({
        where: { lotCode: candidateLotId },
        select: { id: true },
      });
    }

    return candidateLotId;
  } catch (error) {
    console.error('Error generating Lot ID:', error);
    // Safe fallback with timestamp entropy
    const timestampSuffix = Date.now().toString().slice(-4);
    return `${basePrefix}-${timestampSuffix}`;
  }
}
