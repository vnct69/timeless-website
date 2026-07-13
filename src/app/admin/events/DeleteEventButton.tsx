/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DeleteEventButtonProps {
  eventId: string
  eventTitle: string
}

export default function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`Delete "${eventTitle}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      // First, check if there are any attendance records
      const { count, error: countError } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)

      if (countError) {
        console.error('Error checking attendance:', countError)
      }

      // If there are attendance records, ask for confirmation
      if (count && count > 0) {
        const confirmDelete = confirm(
          `This event has ${count} attendance record(s). Deleting it will also remove all associated attendance records. Continue?`
        )
        if (!confirmDelete) {
          setIsDeleting(false)
          return
        }
      }

      // Delete the event (cascade will delete attendance records)
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        setError(deleteError.message)
        setIsDeleting(false)
        return
      }

      // Success - refresh the page
      router.refresh()
      
      // Force a hard refresh after a moment to ensure data is updated
      setTimeout(() => {
        window.location.reload()
      }, 300)
      
    } catch (err: any) {
      console.error('Error deleting event:', err)
      setError(err.message || 'Failed to delete event. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <>
      {error && (
        <div className="text-xs text-red-600 mb-1">{error}</div>
      )}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </>
  )
}