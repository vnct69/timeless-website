import { requireAdmin } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import EventsPageClient from './EventPageClient'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  await requireAdmin()
  
  const supabase = await createClient()
  
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      attendance_records (id)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching events:', error)
  }
  
  const eventsWithCount = events?.map(event => ({
    ...event,
    attendance_count: event.attendance_records?.length || 0
  })) || []
  
  const totalAttendance = eventsWithCount.reduce((sum, event) => sum + event.attendance_count, 0)

  return (
    <EventsPageClient 
      eventsWithCount={eventsWithCount}
      totalAttendance={totalAttendance}
    />
  )
}