/**
 * Utility functions to prevent hydration mismatches in Next.js
 */

/**
 * Generate a stable ID that works on both server and client
 * This prevents hydration mismatches caused by random ID generation
 */
export function generateStableId(prefix: string = 'id'): string {
  if (typeof window === 'undefined') {
    // Server-side: return a placeholder
    return `${prefix}-server`
  }
  // Client-side: generate actual ID
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get current date in ISO format, safe for SSR
 * Returns empty string on server, actual date on client
 */
export function getCurrentDateSafe(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return new Date().toISOString().split('T')[0]
}

/**
 * Format date safely for SSR
 * Handles cases where date might be undefined or null
 */
export function formatDateSafe(date: string | Date | null | undefined): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ''
    
    return dateObj.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

/**
 * Check if we're on the client side
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Safe random number generation for SSR
 */
export function safeRandom(): number {
  if (typeof window === 'undefined') {
    return 0.5 // Fixed value for server
  }
  return Math.random()
}

/**
 * Safe timestamp generation for SSR
 */
export function safeTimestamp(): number {
  if (typeof window === 'undefined') {
    return 0 // Fixed value for server
  }
  return Date.now()
}
