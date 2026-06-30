import { getCurrentUser, getUserRole } from './actions'
import { redirect } from 'next/navigation'

/**
 * Protect a route - redirect to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

/**
 * Protect an admin route - redirect if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth()
  const role = await getUserRole()
  
  if (role !== 'admin') {
    redirect('/dashboard')
  }
  
  return user
}

/**
 * Redirect to dashboard if already authenticated
 */
export async function redirectIfAuthenticated() {
  const user = await getCurrentUser()
  
  if (user) {
    const role = await getUserRole()
    if (role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }
}