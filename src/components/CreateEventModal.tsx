/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import GeocodingInput from './GeoCodingInput'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationName, setLocationName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLocationSelect = (location: {
    name: string
    lat: number
    lng: number
  }) => {
    setLocationName(location.name)
    setLatitude(location.lat.toString())
    setLongitude(location.lng.toString())
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const radiusMeters = parseInt(formData.get('radiusMeters') as string) || 100
    const expiryMinutes = parseInt(formData.get('expiryMinutes') as string) || 30

    if (!title || !latitude || !longitude) {
      setError('Title, latitude, and longitude are required')
      setLoading(false)
      return
    }

    try {
      // Generate QR token
      const qrToken = uuidv4()
      const qrExpiry = new Date(Date.now() + expiryMinutes * 60000)
      
      // Generate QR code (just to validate)
      const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${qrToken}`
      await QRCode.toDataURL(eventUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Create event
      const { data: event, error: createError } = await supabase
        .from('events')
        .insert({
          title,
          description,
          location_name: locationName || 'Auto-detected location',
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius_meters: radiusMeters,
          qr_code_token: qrToken,
          qr_code_expiry: qrExpiry.toISOString(),
          is_active: true,
          created_by: user?.id,
        })
        .select()
        .single()

      if (createError) throw createError

      onSuccess()
      onClose()
      router.refresh()
      
      // Redirect to the new event's detail page
      router.push(`/admin/events/${event.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Event</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Team Meeting, Conference"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the event..."
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Settings</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Location
                </label>
                <GeocodingInput 
                  onLocationSelect={handleLocationSelect}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Search for a location and the coordinates will be auto-filled below
                </p>
              </div>

              <div>
                <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  id="locationName"
                  name="locationName"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Conference Room A, Main Hall"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    id="latitude"
                    name="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-filled"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    id="longitude"
                    name="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-filled"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="radiusMeters" className="block text-sm font-medium text-gray-700 mb-1">
                  Geofence Radius (meters)
                </label>
                <input
                  type="number"
                  id="radiusMeters"
                  name="radiusMeters"
                  defaultValue={100}
                  min={10}
                  max={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 10m, Maximum 1000m</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code Settings</h3>
              
              <div>
                <label htmlFor="expiryMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                  QR Code Expiry (minutes)
                </label>
                <input
                  type="number"
                  id="expiryMinutes"
                  name="expiryMinutes"
                  defaultValue={30}
                  min={1}
                  max={1440}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">QR code will expire after this time (1-1440 minutes)</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}