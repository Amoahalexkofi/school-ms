import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Strips non-digit chars from a phone number, removes leading zeros, then prepends country code if missing */
function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Already has country code (starts with non-zero country code digits)
  if (digits.startsWith("0")) return digits.slice(1); // strip leading 0 only
  return digits;
}

/**
 * Build a wa.me pre-filled link.
 * @param parentPhone - parent's phone (any format — we normalise)
 * @param message - pre-filled message text
 */
export function buildWhatsAppLink(parentPhone: string, message: string): string {
  const phone = normalisePhone(parentPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
