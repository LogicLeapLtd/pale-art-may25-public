'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Placeholder image for artists without a specific image
const ARTIST_PLACEHOLDER_IMAGE = '/placeholder-artist.svg'

type Artist = {
  id: string
  name: string
  slug: string
  title: string
  biography: string
  portfolioUrl?: string
  imageUrl?: string
  featured: boolean
}

type FilterOption = 'all' | 'featured'

export default function Artists() {
  const [filter, setFilter] = useState<FilterOption>('all')
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadArtists = async () => {
      try {
        const response = await fetch('/api/artists')
        if (!response.ok) return
        const artistData = await response.json()
        setArtists(artistData)
      } catch (error) {
        console.error('Error loading artists:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadArtists()
  }, [])

  const filteredArtists = artists
    .filter((artist) => {
      if (filter === 'featured') return artist.featured
      return true
    })
    .sort((a, b) => {
      // Featured artists first, then by name
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return a.name.localeCompare(b.name)
    })

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/ART/landscape-hero-2.jpg"
          alt="Our Artists - Palé Hall Art"
          fill
          className="object-cover"
          priority
          quality={80}
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Our <span className="italic font-medium text-gold-300">Artists</span>
          </h1>
          <p className="text-xl md:text-2xl font-light leading-relaxed opacity-90">
            Exceptional creators whose vision and craftsmanship bring our collection to life
          </p>
        </div>
      </section>

      <div className="py-20">
        <div className="container-luxury">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-600 to-transparent"></div>
            <span className="font-accent text-gold-700 text-sm tracking-ultra-wide uppercase mx-8">
              Our Artists
            </span>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-600 to-transparent"></div>
          </div>
          
          <h1 className="heading-section mb-6">
            Exceptional
            <span className="italic text-gold-700"> Creators</span>
          </h1>
          <p className="text-luxury-large max-w-3xl mx-auto">
            Meet the talented artists whose vision and craftsmanship bring our collection to life. 
            Each brings their unique perspective and mastery to contemporary art.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-2">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Artists' },
                { key: 'featured', label: 'Featured' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as FilterOption)}
                  className={`px-6 py-3 rounded-md font-elegant font-medium transition-all duration-300 ${
                    filter === key
                      ? 'bg-gold-500 text-cream-50 shadow-elegant'
                      : 'text-forest-800 hover:bg-cream-200/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-luxury">
            {loading ? 'Loading...' : `${filteredArtists.length} artist${filteredArtists.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Artists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-16">
              <p className="text-luxury-large text-forest-600">Loading artists...</p>
            </div>
          ) : filteredArtists.map((artist, index) => (
            <ArtistCard key={artist.id} artist={artist} index={index} />
          ))}
        </div>

        {/* Joanna Section */}
        <div className="mt-20 pt-16 border-t border-cream-200">
          <div className="text-center mb-12">
            <h2 className="heading-featured mb-6">Meet Joanna</h2>
            <p className="text-luxury-large max-w-2xl mx-auto">
              Curator and art director for the Palé Hall Art Collection, Jo-Anna brings together each of these artists to celebrate creative excellence, diversity, and the cultural spirit of Palé Hall and Snowdonia.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-forest-50 to-cream-100 rounded-lg p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 overflow-hidden rounded-full flex-shrink-0">
                <Image
                  src={ARTIST_PLACEHOLDER_IMAGE}
                  alt="Jo-Anna, Curator"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="heading-card mb-3 text-forest-900">Jo-Anna</h3>
                <p className="text-luxury text-forest-700 mb-4">
                  Curator & Art Director
                </p>
                <p className="text-luxury leading-relaxed">
                  With a deep passion for contemporary art and years of experience in curation, 
                  Jo-Anna has carefully assembled this collection to showcase the finest works 
                  from Wales and beyond. Her vision brings together established and emerging 
                  artists in a celebration of artistic excellence.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArtistCard({ artist, index }: { artist: Artist; index: number }) {
  // Create a short bio from the first 100 characters of biography
  const shortBio = artist.biography.length > 100 
    ? artist.biography.substring(0, 100) + '...'
    : artist.biography

  return (
    <Link href={`/artists/${artist.slug}`} className="group block">
      <div className="card-luxury rounded-lg overflow-hidden">
        {/* Portrait */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {artist.imageUrl ? (
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          
          {/* Badges */}
          <div className="absolute top-4 left-4 space-y-2">
            {artist.featured && (
              <span className="block px-3 py-1 bg-gold-500/90 text-cream-50 text-xs font-medium tracking-wide rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-forest-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <div className="text-center text-cream-100 p-6">
              <p className="font-body text-sm leading-relaxed mb-4">
                {shortBio}
              </p>
              <div className="inline-flex items-center text-gold-400 text-sm font-medium">
                View Profile
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="heading-card mb-2 group-hover:text-gold-700 transition-colors duration-300">
            {artist.name}
          </h3>
          <p className="text-luxury text-sm text-gold-700 mb-3 font-medium">
            {artist.title}
          </p>
          <p className="text-luxury text-sm leading-relaxed">
            {shortBio}
          </p>
          
          {artist.portfolioUrl && (
            <div className="mt-4 pt-4 border-t border-cream-200">
              <span className="text-gold-600 text-sm font-medium">
                View Portfolio →
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}