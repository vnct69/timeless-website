'use client'

import { useState } from 'react'

interface QRCodeImageProps {
  src: string
  alt: string
  className?: string
}

export default function QRCodeImage({ src, alt, className = '' }: QRCodeImageProps) {
  const [error, setError] = useState(false)

  const handleError = () => {
    setError(true)
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📱</div>
          <p className="text-sm text-gray-600">QR Code Preview Unavailable</p>
          <p className="text-xs text-gray-400 mt-1">Token is still valid for scanning</p>
        </div>
      </div>
    )
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={handleError}
    />
  )
}