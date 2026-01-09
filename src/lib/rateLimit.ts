interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS
    })
    return { success: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS }
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { 
      success: false, 
      remaining: 0, 
      resetIn: entry.resetTime - now 
    }
  }

  entry.count++
  rateLimitStore.set(identifier, entry)
  
  return { 
    success: true, 
    remaining: MAX_ATTEMPTS - entry.count, 
    resetIn: entry.resetTime - now 
  }
}

export function getRateLimitIdentifier(email: string): string {
  return `auth:${email.toLowerCase()}`
}
