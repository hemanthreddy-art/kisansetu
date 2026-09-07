import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Currency (INR)
 * e.g. 154000 -> ₹1,54,000
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * CORE USP: Calculate Net Realisation
 * 
 * Formula:
 * NET REALISATION = Gross Sale Value - Transport Cost - Storage Cost - Other Costs
 * 
 * Where:
 * Gross Sale Value = Selling Price per Quintal * Total Quantity in Quintals
 */
export function calculateNetRealisation(params: {
  pricePerQuintal: number;
  quantityQuintals: number;
  distanceKm: number;
  ratePerKmTon?: number; // default approx ₹4.5 / km / tonne
  storageDays?: number;
  storageRatePerMonthPerQtl?: number; // default approx ₹30 / quintal / month
  mandiCessPercentage?: number; // default approx 1.05%
  handlingCostPerQtl?: number; // default ₹15 per quintal
}) {
  const {
    pricePerQuintal,
    quantityQuintals,
    distanceKm,
    ratePerKmTon = 4.5,
    storageDays = 0,
    storageRatePerMonthPerQtl = 30,
    mandiCessPercentage = 1.05,
    handlingCostPerQtl = 15,
  } = params;

  // 1. Gross Sale Value
  const grossSaleValue = pricePerQuintal * quantityQuintals;

  // 2. Transport Cost (1 Quintal = 0.1 Tonne)
  const totalTonnes = quantityQuintals * 0.1;
  const transportCost = Math.round(distanceKm * ratePerKmTon * Math.max(1, totalTonnes));

  // 3. Storage Cost
  const storageCost =
    storageDays > 0
      ? Math.round((storageRatePerMonthPerQtl / 30) * storageDays * quantityQuintals)
      : 0;

  // 4. Other Costs (Mandi Cess & Labor / Handling)
  const mandiCess = Math.round((grossSaleValue * mandiCessPercentage) / 100);
  const handlingCost = Math.round(handlingCostPerQtl * quantityQuintals);
  const otherCosts = mandiCess + handlingCost;

  // 5. Total Deductions & Net Realisation
  const totalDeductions = transportCost + storageCost + otherCosts;
  const netRealisation = grossSaleValue - totalDeductions;
  const netRealisationPerQuintal =
    quantityQuintals > 0 ? Math.round(netRealisation / quantityQuintals) : 0;

  return {
    grossSaleValue,
    transportCost,
    storageCost,
    otherCosts,
    mandiCess,
    handlingCost,
    totalDeductions,
    netRealisation,
    netRealisationPerQuintal,
  };
}
