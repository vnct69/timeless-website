import { getCurrentUser } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// ✅ Force dynamic rendering and no caching
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // ✅ Fetch role directly (bypassing cached getUserRole)
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const role = profile?.role || 'member'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user.email}!
            </h1>
            <p className="text-gray-600">
              Role: <span className={`font-semibold capitalize ${role === 'admin' ? 'text-blue-600' : ''}`}>{role}</span>
            </p>
            {role === 'admin' && (
              <p className="text-sm text-blue-600 mt-1">✅ You have admin privileges</p>
            )}
          </div>

          {/* Rest of your dashboard */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📸 Scan QR Code
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Scan the event QR code to mark your attendance
              </p>
              <Link 
                href="/dashboard/scan"
                className="block w-full text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Open Scanner
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📋 My Attendance
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                View your attendance history
              </p>
              <Link 
                href="/dashboard/history"
                className="block w-full text-center bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition"
              >
                View History
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <form action="/auth/logout" method="post">
                <button 
                  type="submit"
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Sign Out
                </button>
              </form>
              {role === 'admin' && (
                <Link 
                  href="/admin"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Go to Admin Panel →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}