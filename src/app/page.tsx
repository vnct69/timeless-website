import { getCurrentUser, getUserRole } from '@/lib/auth/actions'
import Link from 'next/link'

export default async function Home() {
  const user = await getCurrentUser()
  const role = await getUserRole()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Attendance Tracker System
      </h1>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        {user ? (
          <div>
            <p className="text-green-600">✅ Logged in as: {user.email}</p>
            <p className="text-gray-600 text-sm">Role: {role || 'member'}</p>
            <div className="mt-4 space-y-2">
              <Link 
                href={role === 'admin' ? '/admin' : '/dashboard'} 
                className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Go to {role === 'admin' ? 'Admin' : 'Member'} Dashboard →
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600">Please login to continue</p>
            <div className="mt-4 space-y-2">
              <Link 
                href="/login" 
                className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Login →
              </Link>
              <Link 
                href="/signup" 
                className="block w-full text-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create Account →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}