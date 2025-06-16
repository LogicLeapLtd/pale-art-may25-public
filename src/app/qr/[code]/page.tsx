'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Product } from '@prisma/client'

interface QRPageProps {
  params: Promise<{
    code: string
  }>
}

export default function QRPage({ params }: QRPageProps) {
  const [isGuestPerks, setIsGuestPerks] = useState(false)
  const [artwork, setArtwork] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState<string>('')

  useEffect(() => {
    // Check if user is coming from the hotel/gallery
    const isFromGallery = document.referrer.includes('palehall') || 
                         !!sessionStorage.getItem('pale-hall-guest')
    setIsGuestPerks(isFromGallery)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const { code: paramCode } = await params
      setCode(paramCode)
      
      try {
        const response = await fetch(`/api/artworks/by-qr/${encodeURIComponent(paramCode)}`)
        if (response.ok) {
          const foundArtwork = await response.json()
          setArtwork(foundArtwork)
        }
      } catch (error) {
        console.error('Error loading artwork:', error)
        setArtwork(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-forest-600">Loading artwork...</div>
    </div>
  }

  if (!artwork) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-gold-50">
      {/* Mobile-First Header */}
      <div className="sticky top-0 bg-cream-50/95 backdrop-blur-md border-b border-gold-200/30 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="font-display text-lg text-forest-900 tracking-tight leading-none">
                Palé Hall
              </h1>
              <span className="font-accent text-xs text-gold-700 italic tracking-widest uppercase">
                Art Collection
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs text-forest-600">
                {artwork.slug || code}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Guest Perks Banner */}
        {isGuestPerks && (
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-cream-50 rounded-lg p-4 mb-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="font-elegant font-medium">Exclusive Guest Benefits</span>
            </div>
            <p className="text-sm opacity-90">
              Complimentary shipping & framing for Palé Hall guests
            </p>
          </div>
        )}

        {/* Artwork Image */}
        <div className="relative mb-6">
          <div className="aspect-square bg-gradient-to-br from-forest-400 via-forest-500 to-forest-600 rounded-lg flex items-center justify-center shadow-luxe">
            <div className="text-center text-cream-100">
              <div className="w-24 h-24 bg-gold-400/30 rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="w-12 h-12 bg-gold-300/40 rounded-full"></div>
              </div>
              <p className="font-elegant font-medium text-xl mb-2">{artwork.name}</p>
              <p className="font-accent text-lg opacity-80">
                {artwork.artist ? `by ${artwork.artist}` : 'Palé Hall Collection'}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-2 rounded-full text-sm font-medium tracking-wide ${
              artwork.status === 'sold' 
                ? 'bg-forest-800/90 text-cream-50' 
                : 'bg-gold-500/90 text-cream-50'
            }`}>
              {artwork.status === 'sold' ? 'Sold' : 'Available'}
            </span>
          </div>
        </div>

        {/* Artwork Details */}
        <div className="space-y-6">
          {/* Title & Artist */}
          <div className="text-center">
            <h2 className="font-display text-3xl text-forest-900 mb-2">
              {artwork.name}
            </h2>
            <p className="font-accent text-xl text-gold-600 italic mb-4">
              {artwork.artist ? `by ${artwork.artist}` : 'Palé Hall Collection'}
            </p>
            <div className="text-luxury space-y-1">
              {artwork.dimensions && <p>{artwork.dimensions}</p>}
              {artwork.year && <p>{artwork.year}</p>}
            </div>
          </div>

          {/* Price */}
          <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-6 text-center">
            {!artwork.price || artwork.price === 'POA' ? (
              <div>
                <p className="font-elegant text-2xl text-forest-800 mb-2">
                  Enquire for Price
                </p>
                <p className="text-luxury text-sm">
                  Contact us for pricing on this exceptional piece
                </p>
              </div>
            ) : (
              <div>
                <p className="font-elegant text-2xl text-forest-800 mb-2">
                  {artwork.price.startsWith('£') ? artwork.price : `£${artwork.price}`}
                </p>
                <p className="text-luxury text-sm">
                  {isGuestPerks ? 'Includes complimentary shipping & framing' : 'Shipping calculated at enquiry'}
                </p>
              </div>
            )}
          </div>

          {/* Story/Description */}
          {artwork.description && (
            <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-6">
              <h3 className="font-elegant text-lg font-medium text-forest-800 mb-4">
                About This Work
              </h3>
              <p className="text-luxury leading-relaxed">
                {artwork.description}
              </p>
            </div>
          )}

          {/* Artist Info */}
          {artwork.artist && (
            <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-forest-300 to-forest-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 bg-gold-400/40 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-elegant text-lg font-medium text-forest-800 mb-2">
                    {artwork.artist}
                  </h4>
                  <p className="text-luxury text-sm mb-3">
                    Learn more about this artist's background and other works in our collection.
                  </p>
                  <Link 
                    href={`/artists?search=${encodeURIComponent(artwork.artist)}`}
                    className="inline-flex items-center text-gold-600 hover:text-gold-700 transition-colors duration-300 text-sm font-medium"
                  >
                    View Artist Works
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href={`/contact?artwork=${artwork.slug || artwork.id}&source=qr-code`}
              className="block w-full btn-primary text-center py-4"
            >
              {artwork.status === 'sold' ? 'Enquire About Similar' : (!artwork.price || artwork.price === 'POA') ? 'Enquire for Price' : 'Purchase Enquiry'}
            </Link>
            
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href={`/collection/${artwork.id}`}
                className="btn-secondary text-center py-3"
              >
                Full Details
              </Link>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: artwork.name,
                      text: `${artwork.name} by ${artwork.artist || 'Unknown Artist'}`,
                      url: window.location.href,
                    })
                  }
                }}
                className="btn-ghost text-center py-3"
              >
                Share
              </button>
            </div>
          </div>

          {/* Related Information */}
          <div className="bg-gradient-to-br from-gold-50 to-cream-100 border border-gold-200 rounded-lg p-6">
            <h3 className="font-elegant text-lg font-medium text-forest-800 mb-4">
              Visiting Palé Hall
            </h3>
            <div className="space-y-3 text-luxury text-sm">
              <p className="flex items-start space-x-3">
                <svg className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Gallery open daily 9 AM - 6 PM</span>
              </p>
              <p className="flex items-start space-x-3">
                <svg className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Private viewings by appointment</span>
              </p>
              <p className="flex items-start space-x-3">
                <svg className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call +44 1678 530 285</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-cream-200">
            <Link 
              href="/"
              className="font-accent text-gold-600 hover:text-gold-700 transition-colors duration-300"
            >
              Visit our full collection online →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}