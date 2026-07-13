/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/use-memo */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useCallback, useEffect } from 'react'
import { debounce } from '@/lib/utils'

interface GeocodingInputProps {
  onLocationSelect: (location: {
    name: string
    lat: number
    lng: number
  }) => void
  initialValue?: string
  disabled?: boolean
}

export default function GeocodingInput({ 
  onLocationSelect, 
  initialValue = '',
  disabled = false 
}: GeocodingInputProps) {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<Array<{ lat: number; lon: number; displayName: string }>>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(!!initialValue)

  useEffect(() => {
    if (initialValue && !selected) {
      setQuery(initialValue)
      setSelected(true)
    }
  }, [initialValue])

  const searchLocation = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 3 || disabled) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
          {
            headers: {
              'User-Agent': 'Attendance-Tracker-App/1.0',
            },
          }
        )

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()

        if (data && data.length > 0) {
          setSuggestions(
            data.map((item: any) => ({
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              displayName: item.display_name,
            }))
          )
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error('Search error:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 500),
    [disabled]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelected(false)
    if (!disabled) {
      searchLocation(value)
    }
  }

  const handleSelect = (suggestion: { lat: number; lon: number; displayName: string }) => {
    if (disabled) return
    setQuery(suggestion.displayName)
    setSuggestions([])
    setSelected(true)
    onLocationSelect({
      name: suggestion.displayName,
      lat: suggestion.lat,
      lng: suggestion.lon,
    })
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for a location (e.g., Eiffel Tower, Paris)"
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled 
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
            : 'border-gray-300'
        }`}
        autoComplete="off"
      />
      
      {loading && !disabled && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {suggestions.length > 0 && !selected && !disabled && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
            >
              {suggestion.displayName}
            </li>
          ))}
        </ul>
      )}

      {selected && !disabled && (
        <div className="mt-2 text-xs text-green-600">
          ✅ Location selected
        </div>
      )}
    </div>
  )
}