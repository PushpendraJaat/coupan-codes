import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 20

// In-memory store for rate limiting
// Note: This will reset when the server restarts
// For production, use Redis or a similar persistent store
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>()

export function middleware(request: NextRequest) {
  // Get the client's IP address
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  // Skip rate limiting for non-API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Skip rate limiting for the seed route in development
  if (process.env.NODE_ENV === "development" && request.nextUrl.pathname === "/api/seed") {
    return NextResponse.next()
  }

  // Get current time
  const now = Date.now()

  // Get or initialize rate limit data for this IP
  let rateLimitData = ipRequestCounts.get(ip)

  if (!rateLimitData || now > rateLimitData.resetTime) {
    // Initialize or reset rate limit data
    rateLimitData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW }
    ipRequestCounts.set(ip, rateLimitData)
  }

  // Increment request count
  rateLimitData.count++

  // Check if rate limit exceeded
  if (rateLimitData.count > MAX_REQUESTS_PER_WINDOW) {
    // Calculate time until reset
    const timeUntilReset = Math.ceil((rateLimitData.resetTime - now) / 1000)

    // Return rate limit exceeded response
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: timeUntilReset },
      {
        status: 429,
        headers: {
          "Retry-After": timeUntilReset.toString(),
          "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitData.resetTime.toString(),
        },
      },
    )
  }

  // Add rate limit headers to response
  const response = NextResponse.next()
  response.headers.set("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW.toString())
  response.headers.set("X-RateLimit-Remaining", (MAX_REQUESTS_PER_WINDOW - rateLimitData.count).toString())
  response.headers.set("X-RateLimit-Reset", rateLimitData.resetTime.toString())

  return response
}

export const config = {
  matcher: [
    // Apply to all API routes
    "/api/:path*",
  ],
}

