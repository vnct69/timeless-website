import { requireAdmin } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import NewEventForm from './NewEventForm'

export default async function NewEventPage() {
  await requireAdmin()

  async function createEventAction(formData: FormData) {
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
        location_name: locationName || 'Auto-detected location',
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

      <NewEventForm createEventAction={createEventAction} />

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Search for a location (e.g., &quot;Eiffel Tower, Paris&quot;) 
          and the coordinates will be automatically filled in. You can also manually enter coordinates.
        </p>
      </div>
    </div>
  )
}