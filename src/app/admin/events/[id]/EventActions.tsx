'use client'

import { useState } from 'react'
import EditEventModal from '@/components/EditEventModal'
import DeleteConfirmModal from '@/components/DeleteConfirmationModal'

interface EventActionsProps {
  event: {
    id: string
    title: string
    description: string
    location_name: string
    latitude: number
    longitude: number
    radius_meters: number
    is_active: boolean
    qr_code_expiry: string
  }
  attendanceCount: number
}

export default function EventActions({ event, attendanceCount }: EventActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // ✅ Check if event is inactive
  const isEventInactive = !event.is_active

  return (
    <>
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className={`ml-3 font-bold ${
              message.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
            }`}
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {/* ✅ Edit button - disabled for inactive events */}
        <button
          onClick={() => {
            if (isEventInactive) {
              alert('Cannot edit an inactive event. Please reactivate it first.')
              return
            }
            setShowEditModal(true)
          }}
          disabled={isEventInactive}
          className={`text-sm text-left transition-colors ${
            isEventInactive 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-600 hover:text-blue-800'
          }`}
        >
          ✏️ Edit Event {isEventInactive && '(Inactive)'}
        </button>
        
        {/* Delete button - always enabled */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-red-600 hover:text-red-800 text-sm text-left transition-colors"
        >
          🗑️ Delete Event
        </button>
      </div>

      {/* Edit Modal */}
      <EditEventModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        event={event}
        onSuccess={() => {
          setMessage({ text: '✅ Event updated successfully!', type: 'success' })
          setTimeout(() => setMessage(null), 3000)
        }}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        eventId={event.id}
        eventTitle={event.title}
        attendanceCount={attendanceCount}
        onSuccess={() => {
          setMessage({ text: '🗑️ Event deleted successfully!', type: 'success' })
          setTimeout(() => setMessage(null), 3000)
        }}
      />
    </>
  )
}