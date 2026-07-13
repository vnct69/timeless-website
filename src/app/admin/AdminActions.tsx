'use client'

import { useState } from 'react'
import CreateEventModal from '@/components/CreateEventModal'

interface AdminActionsProps {
  children?: React.ReactNode
}

export default function AdminActions({ children }: AdminActionsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
      >
        <span className="text-xl">🎫</span> Create New Event
      </button>

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Handle success
        }}
      />

      {children}
    </>
  )
}