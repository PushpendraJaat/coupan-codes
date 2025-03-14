import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getClientIp(headers: ReadonlyHeaders): string | null {
  // Try various headers that might contain the client IP
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    // X-Forwarded-For can be a comma-separated list of IPs
    // The client's IP is typically the first one
    return forwardedFor.split(",")[0].trim()
  }

  // Try other common headers
  return (
    headers.get("x-real-ip") ||
    headers.get("x-client-ip") ||
    headers.get("cf-connecting-ip") || // Cloudflare
    null
  )
}

