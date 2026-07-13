import { requireAdmin } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import AdminPageClient from './AdminPageClient'

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

  // Get user role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  return (
    <AdminPageClient 
      totalEvents={totalEvents || 0}
      totalAttendance={totalAttendance || 0}
      recentEvents={recentEvents || []}
      role={profile?.role || 'member'}
    />
  )
}