import { requireAdmin } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdmin()
  
  const supabase = await createClient()
  
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
  
  const { count: totalAttendance } = await supabase
    .from('attendance_records')
    .select('*', { count: 'exact', head: true })
  
  const { data: recentEvents } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage events, generate QR codes, and monitor attendance
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
              <p className="text-3xl font-bold text-gray-900">{totalEvents || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Attendance</h3>
              <p className="text-3xl font-bold text-gray-900">{totalAttendance || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Active QR Codes</h3>
              <p className="text-3xl font-bold text-gray-900">
                {recentEvents?.filter(e => e.is_active).length || 0}
              </p>
            </div>
          </div>

          {/* Admin Actions - Updated with 3 cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Link 
              href="/admin/events/new"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                🎫 Create Event
              </h2>
              <p className="text-gray-600 text-sm">
                Create a new event and generate a QR code for attendance
              </p>
              <span className="inline-block mt-3 text-blue-600 font-medium">
                Create New →
              </span>
            </Link>

            <Link 
              href="/admin/events"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                📋 My Events
              </h2>
              <p className="text-gray-600 text-sm">
                View and manage all your events
              </p>
              <span className="inline-block mt-3 text-blue-600 font-medium">
                View All →
              </span>
            </Link>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                📊 Reports
              </h2>
              <p className="text-gray-600 text-sm">
                View attendance reports and analytics
              </p>
              <span className="inline-block mt-3 text-gray-400 font-medium">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Events
              </h2>
              <Link 
                href="/admin/events"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All →
              </Link>
            </div>
            {recentEvents && recentEvents.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentEvents.map((event) => (
                  <Link 
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="block py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(event.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No events created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}