import { requireAdmin } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EventActions from './EventActions'
import EventDeleteButton from './EventDeleteButton'
import QRCodeImage from '@/components/QRCodeImage'

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

// Use an external QR API to avoid Turbopack issues
async function generateQRCodeUrl(text: string): Promise<string> {
  // Using a free QR code API
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`
}

export default async function EventDetailPage({ params }: EventPageProps) {
  await requireAdmin()
  
  const { id } = await params
  
  const supabase = await createClient()
  
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !event) {
    notFound()
  }
  
  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${event.qr_code_token}`
  const qrCodeDataUrl = await generateQRCodeUrl(eventUrl)
  
  const { count: attendanceCount } = await supabase
    .from('attendance_records')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
  
  const isExpired = new Date(event.qr_code_expiry) < new Date()
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link 
            href="/admin" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{event.title}</h1>
          <p className="text-gray-600">{event.description}</p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.is_active && !isExpired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {event.is_active && !isExpired ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h2>
          <div className="flex flex-col items-center">
            <QRCodeImage 
              src={qrCodeDataUrl}
              alt="Event QR Code"
              className="w-64 h-64 border border-gray-200 rounded-lg"
            />
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Token: <code className="bg-gray-100 px-2 py-1 rounded">{event.qr_code_token}</code></p>
              <p>Expires: {new Date(event.qr_code_expiry).toLocaleString()}</p>
              {isExpired && (
                <p className="text-red-600 font-medium mt-2">⚠️ This QR code has expired</p>
              )}
            </div>
            <EventActions 
              qrCodeDataUrl={qrCodeDataUrl} 
              eventUrl={eventUrl}
              eventTitle={event.title}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="text-gray-900">{event.location_name || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
              <dd className="text-gray-900">
                {event.latitude}, {event.longitude}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Geofence Radius</dt>
              <dd className="text-gray-900">{event.radius_meters} meters</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Attendance</dt>
              <dd className="text-gray-900">{attendanceCount || 0} scans</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-gray-900">{new Date(event.created_at).toLocaleString()}</dd>
            </div>
          </dl>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Admin Actions</h3>
            <div className="flex flex-col gap-2">
              <Link 
                href={`/admin/events/${event.id}/edit`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit Event
              </Link>
              <EventDeleteButton eventId={event.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h2>
        <div className="text-gray-600 text-sm">
          No attendance records yet. Share the QR code with attendees!
        </div>
      </div>
    </div>
  )
}