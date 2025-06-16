'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

// Placeholder images for when actual images are not available
const ARTIST_PLACEHOLDER_IMAGE = '/placeholder-artist.svg'
const ARTWORK_PLACEHOLDER_IMAGE = '/ART/landscape-hero-2.jpg'

type Artist = {
  id: string
  name: string
  slug: string
  title: string
  biography: string
  portfolioUrl?: string
  imageUrl?: string
  featured: boolean
  artworks: Artwork[]
}

type Artwork = {
  id: string
  name: string
  artist: string | null
  medium: string | null
  dimensions: string | null
  status: string | null
  price: string
  slug: string | null
  createdAt: Date
  updatedAt: Date
  originalImageUrl: string
  originalProductUrl: string
  localImagePath: string | null
  description: string | null
  year: string | null
  featured: boolean
  category: string | null
}

interface ArtistDetailProps {
  params: Promise<{
    slug: string
  }>
}

export default function ArtistDetail({ params }: ArtistDetailProps) {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadData = async () => {
      const { slug } = await params
      
      try {
        const response = await fetch(`/api/artists/${slug}`)
        if (!response.ok) {
          setArtist(null)
          return
        }
        
        const artistData = await response.json()
        setArtist(artistData)
      } catch (error) {
        console.error('Error loading artist data:', error)
        setArtist(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [params])
  
  if (loading) {
    return (
      <div className="pt-32 pb-20">
        <div className="container-luxury text-center">
          <p className="text-luxury-large text-forest-600">Loading artist...</p>
        </div>
      </div>
    )
  }
  
  if (!artist) {
    notFound()
  }

  return (
    <div className="pt-32 pb-20">
      <div className="container-luxury">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-forest-600 hover:text-gold-600 transition-colors">
              Home
            </Link>
            <span className="text-forest-400">/</span>
            <Link href="/artists" className="text-forest-600 hover:text-gold-600 transition-colors">
              Artists
            </Link>
            <span className="text-forest-400">/</span>
            <span className="text-forest-800 font-medium">{artist.name}</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 mb-20">
          {/* Portrait */}
          <div className="space-y-6">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-luxe">
                {artist.imageUrl ? (
                  <Image
                    src={artist.imageUrl}
                    alt={artist.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={80}
                  />
                ) : (
                  <Image
                    src={ARTIST_PLACEHOLDER_IMAGE}
                    alt={`Placeholder image for ${artist.name}`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Badges */}
              <div className="absolute top-6 left-6 space-y-2">
                {artist.featured && (
                  <span className="block px-4 py-2 bg-gold-500/90 text-cream-50 text-sm font-medium tracking-wide rounded-full">
                    Featured Artist
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="heading-section mb-2">
                {artist.name}
              </h1>
              <p className="text-luxury-large text-gold-700 font-medium mb-6">
                {artist.title}
              </p>
              
              {artist.portfolioUrl && (
                <div className="mb-6">
                  <a 
                    href={artist.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gold-600 hover:text-gold-700 transition-colors duration-300 font-medium"
                  >
                    Visit Artist Portfolio
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>

            {/* Bio */}
            <div>
              <h2 className="font-elegant text-xl font-medium text-forest-800 mb-4">
                About the Artist
              </h2>
              <div className="prose prose-lg">
                <p className="text-luxury-large leading-relaxed whitespace-pre-wrap">
                  {artist.biography}
                </p>
              </div>
            </div>

            {/* Contact for Commission */}
            <div className="bg-gradient-to-br from-gold-50 to-cream-100 border border-gold-200 rounded-lg p-6">
              <h3 className="font-elegant text-lg font-medium text-forest-800 mb-3">
                Commission Work
              </h3>
              <p className="text-luxury mb-4">
                Interested in commissioning a piece by {artist.name}? 
                Contact us to discuss your vision and requirements.
              </p>
              <Link 
                href={`/contact?artist=${artist.name}`}
                className="btn-primary"
              >
                Enquire About Commission
              </Link>
            </div>
          </div>
        </div>

        {/* Artist's Works */}
        {artist.artworks && artist.artworks.length > 0 && (
          <div className="border-t border-cream-200 pt-16">
            <div className="text-center mb-12">
              <h2 className="heading-featured mb-4">
                Works by {artist.name}
              </h2>
              <p className="text-luxury">
                Explore {artist.name}'s pieces in our collection ({artist.artworks.length} work{artist.artworks.length !== 1 ? 's' : ''})
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artist.artworks.map((artwork) => (
                <Link 
                  key={artwork.id} 
                  href={`/collection/${artwork.slug || artwork.id}`}
                  className="group block"
                >
                  <div className="card-luxury rounded-lg overflow-hidden">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {artwork.localImagePath ? (
                        <Image
                          src={artwork.localImagePath}
                          alt={artwork.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          quality={80}
                        />
                      ) : (
                        <Image
                          src={ARTWORK_PLACEHOLDER_IMAGE}
                          alt={`Placeholder image for ${artwork.name}`}
                          fill
                          className="object-cover"
                        />
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide ${
                          artwork.status === 'sold' 
                            ? 'bg-red-500/90 text-cream-50' 
                            : 'bg-green-500/90 text-cream-50'
                        }`}>
                          {artwork.status === 'sold' ? 'Sold' : 'Available'}
                        </span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-forest-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <div className="text-center text-cream-100 p-4">
                          <p className="font-body text-sm leading-relaxed mb-3">
                            {artwork.description ? 
                              (artwork.description.length > 100 ? 
                                artwork.description.substring(0, 100) + '...' : 
                                artwork.description
                              ) : 
                              'Click to view full details'
                            }
                          </p>
                          <div className="inline-flex items-center text-gold-400 text-sm font-medium">
                            View Artwork
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="heading-card mb-2 group-hover:text-gold-700 transition-colors duration-300">
                        {artwork.name}
                      </h3>
                      <p className="text-luxury text-sm text-forest-600 mb-3">
                        {artwork.year}
                        {artwork.dimensions && ` • ${artwork.dimensions}`}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-elegant text-forest-800 font-medium">
                          {artwork.price}
                        </span>
                        
                        {artwork.featured && (
                          <span className="text-xs bg-gold-100 text-gold-800 px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(!artist.artworks || artist.artworks.length === 0) && (
          <div className="border-t border-cream-200 pt-16">
            <div className="text-center py-16">
              <h2 className="heading-featured mb-4">Works by {artist.name}</h2>
              <p className="text-luxury-large text-forest-600 mb-6">
                No works currently available by this artist in our collection.
              </p>
              <Link 
                href={`/contact?artist=${artist.name}`}
                className="btn-secondary-light"
              >
                Enquire About Future Works
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}