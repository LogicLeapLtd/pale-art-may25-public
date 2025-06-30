'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Mail } from 'lucide-react'

type Artist = {
  id: string
  name: string
  slug: string
  imageUrl?: string
  title?: string
  biography?: string
}

type Artwork = {
  id: string
  name: string
  price: string
  localImagePath: string
  slug: string
  year?: string
  dimensions?: string
  description?: string
  status?: string
}

export default function DavidExhibitionPage() {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [featuredWorks, setFeaturedWorks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch David Kereszteny Lewis data
        const artistResponse = await fetch('/api/artists/david-kereszteny-lewis')
        if (artistResponse.ok) {
          const artistData = await artistResponse.json()
          setArtist(artistData)
        }

        // Fetch featured artworks for David
        const artworksResponse = await fetch('/api/artworks/by-artist/David%20Kereszteny%20Lewis?limit=8')
        if (artworksResponse.ok) {
          const artworksData = await artworksResponse.json()
          // Filter for available works with images and sort by price
          const available = artworksData
            .filter((work: Artwork) => work.localImagePath && work.status === 'available')
            .sort((a: Artwork, b: Artwork) => {
              const priceA = parseInt(a.price.replace(/[£,]/g, ''))
              const priceB = parseInt(b.price.replace(/[£,]/g, ''))
              return priceB - priceA
            })
            .slice(0, 8)
          setFeaturedWorks(available)
        }
      } catch (error) {
        console.error('Error fetching exhibition data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    )
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image
          src="/ART/landscape-hero-2.jpg"
          alt="David Kereszteny Lewis Exhibition"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/60 to-transparent"></div>
        
        <div className="relative h-full flex items-end pb-20">
          <div className="container-luxury">
            <div className="max-w-4xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-px bg-gold-500"></div>
                <span className="font-accent text-gold-400 text-sm tracking-ultra-wide uppercase mx-6">
                  Exhibition
                </span>
              </div>
              
              <h1 className="heading-display text-5xl md:text-6xl lg:text-7xl text-cream-50 mb-4">
                David Kereszteny Lewis
              </h1>
              
              <p className="font-accent text-2xl text-gold-300 italic mb-6">
                Contemporary Landscapes & Abstract Compositions
              </p>
              
              <div className="flex flex-wrap gap-6 text-cream-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold-400" />
                  <span>21st June - 16th August 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold-400" />
                  <span>8 Weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gold-400" />
                  <span>Palé Hall Gallery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exhibition Details */}
      <section className="section-padding bg-cream-50">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">
            {/* Artist Portrait & Info */}
            <div>
              {artist?.imageUrl && (
                <div className="relative aspect-[4/5] mb-8 overflow-hidden rounded-lg shadow-luxe">
                  <Image
                    src={artist.imageUrl}
                    alt={artist.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              
              <div className="bg-forest-50 p-8 rounded-lg">
                <h3 className="heading-3 mb-4">Opening Reception</h3>
                <p className="text-luxury mb-4">
                  Join us for the opening reception on <strong>Friday, 21st June 2025</strong> from 6:00 PM to 9:00 PM.
                </p>
                <p className="text-luxury mb-6">
                  Meet the artist, enjoy refreshments, and be among the first to view this captivating new collection.
                </p>
                <Link
                  href="/contact?subject=exhibition-rsvp"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  RSVP for Opening
                </Link>
              </div>
            </div>

            {/* Exhibition Description */}
            <div>
              <h2 className="heading-2 mb-8">About the Exhibition</h2>
              
              <div className="space-y-6 mb-12">
                <p className="text-luxury-large">
                  This anticipated exhibition showcases a new series of works by David Kereszteny Lewis, 
                  offering a fresh perspective on his artistic journey through the Welsh landscape.
                </p>
                
                <p className="text-luxury">
                  Known for his evocative landscapes and abstract compositions, David's work explores 
                  the interplay of light and shadow, capturing the serene beauty of the natural world 
                  with a distinctive emotional depth. Each piece invites viewers into a contemplative 
                  space, reflecting the artist's unique vision and masterful technique.
                </p>
                
                <p className="text-luxury">
                  The exhibition features over 30 new works, including large-scale canvases and intimate 
                  studies that demonstrate the artist's evolving relationship with the Welsh countryside 
                  and coastal environments.
                </p>
              </div>

              <div className="border-t border-forest-200 pt-8">
                <h3 className="heading-3 mb-4">Artist Statement</h3>
                <blockquote className="relative">
                  <div className="absolute -top-4 -left-4 text-6xl text-gold-300/30 font-display">"</div>
                  <p className="font-accent text-xl text-forest-800 italic leading-relaxed pl-8">
                    My work is a continuous dialogue with the landscape - a meditation on place, 
                    memory, and the ephemeral qualities of light that define our experience of 
                    the natural world.
                  </p>
                  <div className="absolute -bottom-4 -right-4 text-6xl text-gold-300/30 font-display">"</div>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Works */}
      <section className="section-padding bg-forest-50">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Featured Works</h2>
            <p className="text-luxury-large max-w-2xl mx-auto">
              A selection of highlights from the exhibition
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredWorks.map((work) => (
              <Link
                key={work.id}
                href={`/collection/${work.id}`}
                className="group"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={work.localImagePath}
                    alt={work.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-medium mb-1">{work.name}</h3>
                    <p className="text-white/80 text-sm">{work.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/artists/david-kereszteny-lewis"
              className="btn-primary"
            >
              View Complete Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Visit Information */}
      <section className="section-padding bg-cream-50">
        <div className="container-luxury">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-2 text-center mb-12">Visit the Exhibition</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gold-600" />
                </div>
                <h3 className="heading-4 mb-2">Exhibition Dates</h3>
                <p className="text-luxury">21st June - 16th August 2025</p>
                <p className="text-luxury">Tuesday - Sunday</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gold-600" />
                </div>
                <h3 className="heading-4 mb-2">Gallery Hours</h3>
                <p className="text-luxury">10:00 AM - 5:00 PM</p>
                <p className="text-luxury">Private viewings available</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gold-600" />
                </div>
                <h3 className="heading-4 mb-2">Location</h3>
                <p className="text-luxury">Palé Hall Gallery</p>
                <p className="text-luxury">Llandderfel, Bala</p>
              </div>
            </div>

            <div className="bg-forest-50 p-8 rounded-lg text-center">
              <p className="text-luxury-large mb-6">
                For private viewings, group visits, or to discuss acquiring works from the exhibition, 
                please contact our gallery team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact?subject=exhibition-enquiry"
                  className="btn-primary"
                >
                  Make an Enquiry
                </Link>
                <Link
                  href="/artists/david-kereszteny-lewis"
                  className="btn-secondary"
                >
                  Artist Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}