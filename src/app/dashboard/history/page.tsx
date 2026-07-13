import { getCurrentUser } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Helper to format date in Philippine Time
function formatPhilippineTime(date: Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

// Helper to format date for display (shorter version)
function formatShortPhilippineTime(date: Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export default async function AttendanceHistoryPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: records, error } = await supabase
    .from('attendance_records')
    .select(`
      *,
      events (
        id,
        title,
        description,
        location_name,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('scan_time', { ascending: false })

  if (error) {
    console.error('Error fetching attendance history:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">My Attendance History</h1>
          <p className="text-gray-600">View all your past attendance records</p>
        </div>

        {records && records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record) => (
              <div 
                key={record.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {record.events?.title || 'Unknown Event'}
                    </h3>
                    {record.events?.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {record.events.description}
                      </p>
                    )}
                    {record.events?.location_name && (
                      <p className="text-sm text-gray-500 mt-1">
                        📍 {record.events.location_name}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.verification_status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {record.verification_status || 'Pending'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Scanned:</span>{' '}
                    {formatPhilippineTime(new Date(record.scan_time))}
                  </div>
                  <div>
                    <span className="font-medium">Trust Score:</span>{' '}
                    {record.trust_score || 'N/A'}
                  </div>
                </div>

                {/* Optional: Show time difference */}
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(record.scan_time).toLocaleDateString('en-PH', {
                    timeZone: 'Asia/Manila',
                    weekday: 'long',
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-gray-600">
              You haven&apos;t recorded any attendance yet. 
              Scan a QR code at an event to get started!
            </p>
            <Link 
              href="/dashboard/scan"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Scan Now →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}