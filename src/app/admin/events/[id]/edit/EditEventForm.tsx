/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GeocodingInput from '@/components/GeoCodingInput'
import Link from 'next/dist/client/link'

interface EditEventFormProps {
  event: any
  updateEventAction: (formData: FormData) => Promise<void>
  eventId: string
}

export default function EditEventForm({ event, updateEventAction, eventId }: EditEventFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationName, setLocationName] = useState(event.location_name || '')
  const [latitude, setLatitude] = useState(event.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(event.longitude?.toString() || '')
  const [isActive, setIsActive] = useState(event.is_active)
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
    formData.set('isActive', String(isActive))

    try {
      await updateEventAction(formData)
      // The action will redirect on success
    } catch (err: any) {
      setError(err.message || 'Failed to update event')
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
            defaultValue={event.title}
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
            defaultValue={event.description || ''}
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
          <GeocodingInput 
            onLocationSelect={handleLocationSelect}
            initialValue={event.location_name || ''}
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
            defaultValue={event.radius_meters || 100}
            min={10}
            max={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 10m, Maximum 1000m</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h2>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="isActive"
              value="true"
              checked={isActive === true}
              onChange={() => setIsActive(true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="isActive"
              value="false"
              checked={isActive === false}
              onChange={() => setIsActive(false)}
              className="h-4 w-4 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Inactive</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Inactive events will not accept new attendance scans
        </p>
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
          <p className="text-xs text-gray-500 mt-1">
            Current expiry: {new Date(event.qr_code_expiry).toLocaleString()}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            ⚠️ Changing the expiry will regenerate the QR code expiration time
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Event'}
          </button>
          <Link
            href={`/admin/events/${eventId}`}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  )
}