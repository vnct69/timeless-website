/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardScanPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [eventCode, setEventCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
          setLoading(false)
        },
        (err) => {
          setError('Unable to get location: ' + err.message)
          setLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setError('Geolocation is not supported by this browser')
      setLoading(false)
    }
  }, [])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventCode.trim()) {
      setError('Please enter an event code')
      return
    }

    if (!location) {
      setError('Location not available. Please enable location services.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // First, find the event by token
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('qr_code_token', eventCode.trim())
        .single()

      if (eventError || !event) {
        setError('Invalid event code. Please check and try again.')
        setSubmitting(false)
        return
      }

      // Check if event is active and not expired
      const isExpired = new Date(event.qr_code_expiry) < new Date()
      if (isExpired || !event.is_active) {
        setError('This event is no longer active or the QR code has expired.')
        setSubmitting(false)
        return
      }

      // Check if user is within geofence
      const distance = calculateDistance(
        event.latitude,
        event.longitude,
        location.lat,
        location.lng
      )
      const isWithinGeofence = distance <= event.radius_meters / 1000

      if (!isWithinGeofence) {
        setError(`You are ${(distance * 1000).toFixed(0)} meters away. Must be within ${event.radius_meters} meters.`)
        setSubmitting(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to record attendance.')
        setSubmitting(false)
        return
      }

      // Record attendance
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert({
          user_id: user.id,
          event_id: event.id,
          scan_latitude: location.lat,
          scan_longitude: location.lng,
          location_accuracy_meters: 0,
          verification_status: 'approved',
          trust_score: 100,
          qr_token_used: eventCode.trim(),
        })

      if (insertError) {
        setError('Failed to record attendance: ' + insertError.message)
        setSubmitting(false)
        return
      }

      // Success! Redirect to dashboard with success message
      router.push('/dashboard?success=Attendance recorded successfully!')
    } catch (err: any) {
      setError('An error occurred: ' + err.message)
      setSubmitting(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Getting Location...</h2>
          <p className="text-gray-600 mt-2">Please allow location access when prompted</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Record Attendance</h1>
          <p className="text-gray-600">Enter the event code or scan the QR code</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          {location ? (
            <div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                <p className="text-green-800 text-sm">
                  ✅ Location detected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>

              <div className="text-center py-4 mb-6">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-gray-600 mb-2">
                  To scan a QR code, use your phone&apos;s camera.
                </p>
                <p className="text-gray-500 text-sm">
                  On mobile, you&apos;ll be prompted to allow camera access.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Alternatively, enter the event code manually below.
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label htmlFor="eventCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Code
                  </label>
                  <input
                    type="text"
                    id="eventCode"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value)}
                    placeholder="Enter the event code from the QR"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The event code is the unique token in the QR code URL
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !eventCode.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Recording...' : 'Record Attendance'}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📍</div>
              <p className="text-gray-600">Unable to get your location</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> The event code is the last part of the QR code URL. 
            For example: <code className="bg-blue-100 px-2 py-1 rounded">scan/abc-123-xyz</code>
          </p>
        </div>
      </div>
    </div>
  )
}