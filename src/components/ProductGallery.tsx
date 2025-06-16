'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const ARTWORK_PLACEHOLDER_IMAGE = '/ART/landscape-hero-2.jpg'

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

export default function ProductGallery() {
  const [isVisible, setIsVisible] = useState(false)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Auto scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const scroll = () => {
      scrollContainer.scrollLeft += 1
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0
      }
    }

    const interval = setInterval(scroll, 30)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const response = await fetch('/api/artworks/featured')
        if (!response.ok) {
          console.error('Failed to fetch featured artworks', response.statusText)
          setArtworks([])
          return
        }
        const data = await response.json()
        setArtworks(data)
      } catch (error) {
        console.error('Error loading featured artworks:', error)
        setArtworks([])
      } finally {
        setLoading(false)
      }
    }

    loadArtworks()
  }, [])

  return (
    <section ref={sectionRef} className="section-padding bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-gold-500/20 to-gold-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-gold-400/20 to-gold-500/10 rounded-full blur-3xl"></div>
      
      <div className="container-luxury">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
            <span className="font-accent text-gold-400 text-sm tracking-ultra-wide uppercase mx-8">
              Our Collection
            </span>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
          </div>
          
          <h2 className="heading-section mb-6 text-cream-50">
            Discover
            <span className="italic text-gold-400"> Exceptional</span>
            <br />Artworks
          </h2>
          <p className="text-luxury-large max-w-3xl mx-auto text-cream-100/90">
            From contemporary ceramics to bold sculptures, each piece has been carefully selected 
            to inspire and captivate. Explore our growing collection of extraordinary works.
          </p>
        </div>

        {/* Scrolling Gallery */}
        {loading ? (
          <div className="text-center text-cream-100">Loading artworks...</div>
        ) : artworks.length === 0 ? (
          <div className="text-center text-cream-100">No featured artworks found.</div>
        ) : (
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div 
              ref={scrollRef}
              className="flex space-x-8 overflow-x-auto scrollbar-hide pb-8"
              style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Duplicate items for seamless loop */}
              {[...artworks, ...artworks].map((artwork, index) => (
                <Link
                  key={`${artwork.id}-${index}`}
                  href={`/collection/${artwork.slug || artwork.id}`}
                  className="flex-none w-80 group cursor-pointer"
                >
                  <div className="bg-cream-50/10 backdrop-blur-sm border border-gold-400/20 rounded-lg overflow-hidden hover:border-gold-400/40 transition-all duration-300 hover:transform hover:scale-105">
                    {/* Image */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {artwork.localImagePath || artwork.originalImageUrl ? (
                        <Image
                          src={artwork.localImagePath || artwork.originalImageUrl}
                          alt={artwork.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="320px"
                          quality={80}
                          priority={index < 3}
                          loading={index >= 3 ? "lazy" : undefined}
                        />
                      ) : (
                        <Image
                          src={ARTWORK_PLACEHOLDER_IMAGE}
                          alt={`Placeholder image for ${artwork.name}`}
                          fill
                          className="object-cover"
                        />
                      )}
                      
                      {/* Price Tag */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-gold-500/90 text-cream-50 text-sm font-medium rounded-full">
                        {artwork.price}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold text-cream-50 mb-2 group-hover:text-gold-300 transition-colors duration-300">
                        {artwork.name}
                      </h3>
                      <p className="font-body text-gold-300 italic mb-4">
                        by {artwork.artist}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <p
                          className="text-gold-400 hover:text-gold-300 transition-colors duration-300 text-sm font-medium group-hover:underline"
                        >
                          View Details →
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/collection"
              className="btn-primary text-lg px-12 py-5"
            >
              Browse Full Collection
            </Link>
            <Link 
              href="/contact?subject=private-viewing"
              className="btn-hero-secondary text-lg"
            >
              Book Private Viewing
            </Link>
          </div>
          <p className="text-cream-100/70 text-sm mt-6">
            Can't find what you're looking for? <Link href="/contact" className="text-gold-400 hover:text-gold-300 underline">Contact Joanna</Link> for personalized recommendations.
          </p>
        </div>
      </div>
    </section>
  )
}