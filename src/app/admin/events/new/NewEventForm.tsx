/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GeocodingInput from '@/components/GeoCodingInput'

interface NewEventFormProps {
  createEventAction: (formData: FormData) => Promise<void>
}

export default function NewEventForm({ createEventAction }: NewEventFormProps) {
  const [locationName, setLocationName] = useState('')
  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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
    
    // Ensure latitude and longitude are included
    formData.set('locationName', locationName)
    formData.set('latitude', latitude)
    formData.set('longitude', longitude)

    try {
      await createEventAction(formData)
      // The action will redirect on success
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Team Meeting, Conference, Workshop"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the event..."
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Settings</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Location
          </label>
          <GeocodingInput onLocationSelect={handleLocationSelect} />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Auto-filled"
            />
          </div>
        </div>

        <div className="mt-4">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 10m, Maximum 1000m</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code Settings</h2>
        
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">QR code will expire after this time (1-1440 minutes)</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Event & Generate QR Code'}
        </button>
      </div>
    </form>
  )
}