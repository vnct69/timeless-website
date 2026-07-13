/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteEventAction(eventId: string) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      throw new Error('Not authorized')
    }

    // Delete the event (cascade will handle attendance records)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Delete error:', error)
      throw new Error(error.message)
    }

    // Revalidate the admin and events pages
    revalidatePath('/admin')
    revalidatePath('/admin/events')
    
    return { success: true }
  } catch (error: any) {
    console.error('Delete action error:', error)
    return { success: false, error: error.message }
  }
}