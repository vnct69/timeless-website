import { requireAdmin } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  // This will redirect if not admin
  await requireAdmin()
  
  const supabase = await createClient()
  
  // Get some stats for the admin dashboard
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
  
  const { count: totalAttendance } = await supabase
    .from('attendance_records')
    .select('*', { count: 'exact', head: true })

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

          {/* Stats */}
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
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🎫 Create Event
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Create a new event and generate a QR code for attendance
              </p>
              <Link 
                href="/admin/events/new"
                className="block w-full text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                New Event
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📊 View Reports
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                View attendance reports and analytics
              </p>
              <Link 
                href="/admin/reports"
                className="block w-full text-center bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition"
              >
                View Reports
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Recent Activity
            </h2>
            <p className="text-gray-600 text-sm">
              No recent activity to display
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}