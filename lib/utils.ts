import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(addr?: string, leading = 4, trailing = 4) {
  if (!addr) return "";
  // Works for 0x addresses and non-0x (e.g., Tron, BTC)
  const cleaned = String(addr);
  const minLen = leading + trailing + 3; // include "..."
  if (cleaned.length <= minLen) return cleaned;
  return `${cleaned.slice(0, leading + (cleaned.startsWith("0x") ? 2 : 0))}...${cleaned.slice(-trailing)}`;
}

export function formatExpiry(expiresAt: string) {
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = expires - now;

  if (diffMs <= 0) return "Expired";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffDays >= 1) return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  if (diffHr >= 1)
    return `${diffHr} hr${diffHr > 1 ? "s" : ""} ${diffMin % 60} min`;
  if (diffMin >= 1)
    return `${diffMin} min${diffMin > 1 ? "s" : ""}`;
  return `${diffSec} sec`;
}
