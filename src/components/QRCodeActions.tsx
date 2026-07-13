'use client'

interface QRCodeActionsProps {
  qrCodeDataUrl: string
  eventUrl: string
  eventTitle: string
}

export default function QRCodeActions({ qrCodeDataUrl, eventUrl, eventTitle }: QRCodeActionsProps) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `qr-${eventTitle}.png`
    link.href = qrCodeDataUrl
    link.click()
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      alert('QR code URL copied to clipboard!')
    } catch (err) {
      alert('Failed to copy URL. Please copy it manually.')
    }
  }

  return (
    <div className="mt-4 flex gap-2">
      <button 
        onClick={handleDownload}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
      >
        Download QR
      </button>
      <button 
        onClick={handleCopyUrl}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
      >
        Copy URL
      </button>
    </div>
  )
}