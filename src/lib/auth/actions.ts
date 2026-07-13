/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthResult = {
  success: boolean
  error?: string
  data?: any
}

/**
 * Sign in with email and password - returns result for client handling
 */
export async function signInWithEmail(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true, data: data.user }
}

/**
 * Sign up with email and password - returns result for client handling
 */
export async function signUpWithEmail(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
        role: 'member',
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true, data: data.user }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// /**
//  * Get user role from profiles table
//  */
// export async function getUserRole(): Promise<string | null> {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) return null
  
//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('role')
//     .eq('id', user.id)
//     .single()
  
//   return profile?.role || null
// }


/**
 * Get user role from profiles table - Force fresh fetch
 */
export async function getUserRole(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // ✅ Force fresh fetch with no caching
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching role:', error)
    return null
  }
  
  return profile?.role || 'member'
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Force refresh user role (useful after role changes)
 */
export async function refreshUserRole(): Promise<{ role: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { role: null }
  }
  
  // Force fetch the latest profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching role:', error)
    return { role: null }
  }
  
  return { role: profile?.role || 'member' }
}