/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
  attendanceCount?: number
  onSuccess: () => void
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  attendanceCount = 0,
  onSuccess,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (deleteError) throw deleteError

      onSuccess()
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to delete event')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
          <div className="p-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Delete Event?
              </h3>
              
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete <span className="font-medium">&quot;{eventTitle}&quot;</span>?
              </p>
              
              {attendanceCount > 0 && (
                <p className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                  ⚠️ This event has <span className="font-bold">{attendanceCount}</span> attendance record(s). 
                  Deleting it will also remove all associated attendance data.
                </p>
              )}
              
              <p className="mt-2 text-xs text-gray-500">
                This action cannot be undone.
              </p>

              {error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}