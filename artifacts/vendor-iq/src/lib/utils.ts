import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian Rupees using compact Indian notation.
 * e.g. 84_700_000 → ₹8.5Cr, 420_000 → ₹4.2L, 9_500 → ₹9.5K
 */
export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_00_00_000) {
    // 10 million+ → Crore
    return `${sign}₹${(abs / 1_00_00_000).toFixed(1)}Cr`;
  } else if (abs >= 1_00_000) {
    // 100 thousand+ → Lakh
    return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
  } else if (abs >= 1_000) {
    return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value / 100);
}
