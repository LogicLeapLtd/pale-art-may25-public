'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'

interface EnquireButtonProps {
  artwork: {
    id: string
    name: string
    artist?: string | null
  }
  className?: string
}

export default function EnquireButton({ artwork, className = '' }: EnquireButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleEnquire = () => {
    setIsLoading(true)
    // Navigate to enquiry form with artwork details
    const params = new URLSearchParams({
      artworkId: artwork.id,
      artworkName: artwork.name,
      ...(artwork.artist && { artist: artwork.artist })
    })
    router.push(`/enquire?${params.toString()}`)
  }

  return (
    <button
      onClick={handleEnquire}
      disabled={isLoading}
      className={`btn-secondary w-full disabled:opacity-50 ${className}`}
    >
      <Mail className="mr-2 h-5 w-5" />
      {isLoading ? 'Loading...' : 'Enquire About This Artwork'}
    </button>
  )
}