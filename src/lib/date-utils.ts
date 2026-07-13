/**
 * Philippine Timezone utilities
 */

const PHILIPPINE_TIMEZONE = 'Asia/Manila'

/**
 * Format a date to Philippine Time (PHT/UTC+8)
 */
export function formatPhilippineTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: PHILIPPINE_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj)
}

/**
 * Format a date to Philippine Time (short version)
 */
export function formatShortPhilippineTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: PHILIPPINE_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj)
}

/**
 * Format a date to Philippine Time (full version with weekday)
 */
export function formatFullPhilippineTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: PHILIPPINE_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj)
}