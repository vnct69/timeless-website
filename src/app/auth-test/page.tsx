import { getCurrentUser, getUserRole, isAdmin, signOut } from '@/lib/auth/actions'
import Link from 'next/link'

export default async function AuthTestPage() {
  const user = await getCurrentUser()
  const role = await getUserRole()
  const admin = await isAdmin()

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Auth Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <strong>User:</strong> {user ? user.email : 'Not logged in'}
        </div>
        <div>
          <strong>Role:</strong> {role || 'None'}
        </div>
        <div>
          <strong>Is Admin:</strong> {admin ? '✅ Yes' : '❌ No'}
        </div>
        
        {user ? (
          <form action={signOut}>
            <button 
              type="submit"
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </form>
        ) : (
          <div className="flex gap-4">
            <Link 
              href="/login"
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-center hover:bg-blue-600"
            >
              Login
            </Link>
            <Link 
              href="/signup"
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded text-center hover:bg-green-600"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}