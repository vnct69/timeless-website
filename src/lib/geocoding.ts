/**
 * Geocoding utility using OpenStreetMap Nominatim API
 * Free, no API key required
 */

interface GeocodeResult {
  lat: number
  lon: number
  displayName: string
  address: {
    road?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
  }
}

/**
 * Convert a location name/address to coordinates
 */
export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  try {
    // Rate limiting: Nominatim requires a User-Agent header
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Attendance-Tracker-App/1.0', // Required by Nominatim
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return null
    }

    const result = data[0]

    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      address: {
        road: result.address?.road || '',
        city: result.address?.city || result.address?.town || result.address?.village || '',
        state: result.address?.state || '',
        country: result.address?.country || '',
        postcode: result.address?.postcode || '',
      },
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Get current device location using browser Geolocation API
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  })
}

/**
 * Reverse geocode: Get address from coordinates
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          'User-Agent': 'Attendance-Tracker-App/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data || !data.display_name) {
      return null
    }

    return data.display_name
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}