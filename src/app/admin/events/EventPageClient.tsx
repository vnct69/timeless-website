/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import CreateEventModal from '@/components/CreateEventModal'

interface EventsPageClientProps {
  eventsWithCount: any[]
  totalAttendance: number
}

// ✅ Move the date formatter to the client component
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export default function EventsPageClient({ 
  eventsWithCount, 
  totalAttendance
}: EventsPageClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

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

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setMessage({ text: '✅ Event created successfully!', type: 'success' })
          setTimeout(() => setMessage(null), 3000)
          window.location.reload()
        }}
      />

      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between">
            <div>
              <Link 
                href="/admin" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">My Events</h1>
              <p className="text-gray-600">Manage all your events and track attendance</p>
            </div>
            {/* ✅ Create New Event Button - Opens Modal */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-xl">➕</span> Create New Event
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
              <p className="text-3xl font-bold text-gray-900">{eventsWithCount.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Attendance</h3>
              <p className="text-3xl font-bold text-gray-900">{totalAttendance}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Active Events</h3>
              <p className="text-3xl font-bold text-gray-900">
                {eventsWithCount.filter(e => e.is_active).length}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eventsWithCount.length > 0 ? (
                    eventsWithCount.map((event) => {
                      const isExpired = new Date(event.qr_code_expiry) < new Date()
                      const isActive = event.is_active && !isExpired
                      
                      return (
                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {event.title}
                            </div>
                            {event.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {event.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {event.location_name || 'Not specified'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {formatDate(new Date(event.created_at))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {event.attendance_count}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                            {isExpired && (
                              <span className="ml-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Expired
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/events/${event.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Details →
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-gray-600">No events created yet</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create your first event →
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}