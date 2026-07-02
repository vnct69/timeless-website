import { requireAdmin } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

export default async function NewEventPage() {
  await requireAdmin()

  async function createEvent(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const locationName = formData.get('locationName') as string
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)
    const radiusMeters = parseInt(formData.get('radiusMeters') as string) || 100
    const expiryMinutes = parseInt(formData.get('expiryMinutes') as string) || 30
    
    if (!title || !latitude || !longitude) {
      redirect('/admin/events/new?error=Title, latitude, and longitude are required')
    }
    
    const qrToken = uuidv4()
    const qrExpiry = new Date(Date.now() + expiryMinutes * 60000)
    
    const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${qrToken}`
    await QRCode.toDataURL(eventUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
    
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        location_name: locationName,
        latitude,
        longitude,
        radius_meters: radiusMeters,
        qr_code_token: qrToken,
        qr_code_expiry: qrExpiry.toISOString(),
        is_active: true,
        created_by: user?.id,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating event:', error)
      redirect(`/admin/events/new?error=${encodeURIComponent(error.message)}`)
    }
    
    redirect(`/admin/events/${event.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600">Set up an event and generate a QR code for attendance tracking</p>
      </div>

      <form action={createEvent} className="bg-white rounded-lg shadow-md p-6 space-y-6">
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

          <div>
            <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">
              Location Name
            </label>
            <input
              type="text"
              id="locationName"
              name="locationName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Conference Room A, Main Hall"
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Settings</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="0.000001"
                id="latitude"
                name="latitude"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="14.599512"
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="120.984219"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
          >
            Create Event & Generate QR Code
          </button>
        </div>
      </form>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> To get the latitude and longitude of a location, 
          use Google Maps (right-click → &quot;What&apos;s here?&quot;) or any geocoding service.
        </p>
      </div>
    </div>
  )
}