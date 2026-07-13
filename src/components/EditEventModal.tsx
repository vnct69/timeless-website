/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GeocodingInput from './GeoCodingInput'

interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    title: string
    description: string
    location_name: string
    latitude: number
    longitude: number
    radius_meters: number
    is_active: boolean
    qr_code_expiry: string
  }
  onSuccess: () => void
}

export default function EditEventModal({ isOpen, onClose, event, onSuccess }: EditEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationName, setLocationName] = useState(event.location_name || '')
  const [latitude, setLatitude] = useState(event.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(event.longitude?.toString() || '')
  const [isActive, setIsActive] = useState(event.is_active)
  const router = useRouter()
  const supabase = createClient()

  // ✅ Check if event is inactive OR expired
  const isEventInactive = !event.is_active
  const isEventExpired = new Date(event.qr_code_expiry) < new Date()
  const isEditDisabled = isEventInactive || isEventExpired

  // ✅ Determine the reason for disabled state
  const getDisabledReason = () => {
    if (isEventInactive) return 'inactive'
    if (isEventExpired) return 'expired'
    return null
  }

  const getDisabledMessage = () => {
    const reason = getDisabledReason()
    if (reason === 'inactive') return 'Cannot edit an inactive event. Please reactivate it first.'
    if (reason === 'expired') return 'Cannot edit an event with an expired QR code. Please reactivate it to generate a new QR code.'
    return null
  }

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

    // ✅ Prevent editing if disabled
    if (isEditDisabled) {
      setError(getDisabledMessage() || 'Cannot edit this event.')
      setLoading(false)
      return
    }

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
      const updateData: any = {
        title,
        description,
        location_name: locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius_meters: radiusMeters,
        is_active: isActive,
      }

      // ✅ If reactivating from inactive OR expired, generate new QR expiry
      if (isActive) {
        const newExpiry = new Date(Date.now() + expiryMinutes * 60000)
        updateData.qr_code_expiry = newExpiry.toISOString()
      }

      const { error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', event.id)

      if (updateError) throw updateError

      onSuccess()
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update event')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const disabledReason = getDisabledReason()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Event</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {isEventInactive && (
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⚠️ Inactive
                  </span>
                )}
                {isEventExpired && (
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    ⏰ QR Expired
                  </span>
                )}
              </div>
            </div>
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
              <div className={`p-4 rounded-md ${isEditDisabled ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                {error}
              </div>
            )}

            {isEditDisabled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  {disabledReason === 'inactive' && (
                    <>⚠️ This event is currently <strong>Inactive</strong>. 
                    To edit this event, change the status to <strong>Active</strong> below.</>
                  )}
                  {disabledReason === 'expired' && (
                    <>⏰ This event&apos;s QR code has <strong>Expired</strong>. 
                    To edit this event, change the status to <strong>Active</strong> to generate a new QR code.</>
                  )}
                </p>
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
                  defaultValue={event.title}
                  disabled={isEditDisabled}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditDisabled 
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                      : 'border-gray-300'
                  }`}
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
                  disabled={isEditDisabled}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditDisabled 
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                      : 'border-gray-300'
                  }`}
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
                  initialValue={event.location_name || ''}
                  disabled={isEditDisabled}
                />
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
                  disabled={isEditDisabled}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditDisabled 
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                      : 'border-gray-300'
                  }`}
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
                    disabled={isEditDisabled}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isEditDisabled 
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                        : 'border-gray-300'
                    }`}
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
                    disabled={isEditDisabled}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isEditDisabled 
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                        : 'border-gray-300'
                    }`}
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
                  defaultValue={event.radius_meters || 100}
                  disabled={isEditDisabled}
                  min={10}
                  max={1000}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditDisabled 
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Event Status</h3>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="isActive"
                    value="true"
                    checked={isActive === true}
                    onChange={() => setIsActive(true)}
                    className="h-4 w-4 text-blue-600"
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
                    className="h-4 w-4 text-red-600"
                  />
                  <span className="text-sm text-gray-700">Inactive</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isEditDisabled 
                  ? '💡 Change to Active to enable editing and generate a new QR code'
                  : 'Inactive events will not accept new attendance scans'
                }
              </p>
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
                  disabled={isEditDisabled}
                  min={1}
                  max={1440}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditDisabled 
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                      : 'border-gray-300'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current expiry: {new Date(event.qr_code_expiry).toLocaleString()}
                  {isEventExpired && (
                    <span className="text-red-600 block mt-1">⚠️ QR code has expired</span>
                  )}
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || isEditDisabled}
                  className={`flex-1 text-white font-medium py-2.5 px-4 rounded-md transition-colors ${
                    isEditDisabled
                      ? 'bg-gray-400 cursor-not-allowed'
                      : loading 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isEditDisabled 
                    ? 'Reactivate to Edit' 
                    : loading 
                      ? 'Updating...' 
                      : 'Update Event'
                  }
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