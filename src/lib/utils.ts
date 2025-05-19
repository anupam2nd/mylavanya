
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency (INR)
 * @param amount Number to format as currency
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) {
    return "₹0.00";
  }
  
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
