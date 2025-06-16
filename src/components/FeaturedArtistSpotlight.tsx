'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import KYFFIN_PLACEHOLDER from '../../public/placeholder-artist.svg'

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
}

export default function FeaturedArtistSpotlight() {
  const [isVisible, setIsVisible] = useState(false)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [featuredWorks, setFeaturedWorks] = useState<Artwork[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

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

    const fetchData = async () => {
      try {
        // Fetch David Kereszteny Lewis data
        const artistResponse = await fetch('/api/artists/david-kereszteny-lewis')
        if (artistResponse.ok) {
          const artistData = await artistResponse.json()
          setArtist(artistData)
        }

        // Fetch featured artworks for David
        const artworksResponse = await fetch('/api/artworks/by-artist/David%20Kereszteny%20Lewis?limit=3')
        if (artworksResponse.ok) {
          const artworksData = await artworksResponse.json()
          setFeaturedWorks(artworksData.filter((work: Artwork) => work.localImagePath))
        }
      } catch (error) {
        console.error('Error fetching David Kereszteny Lewis data:', error)
      }
    }

    fetchData()

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="section-padding bg-forest-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-gold-300/30 via-gold-200/20 to-forest-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-forest-300/30 via-forest-200/20 to-gold-200/20 rounded-full blur-3xl"></div>
      
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Content */}
          <div className={`transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            {/* Section Header */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-16 h-px bg-gold-600"></div>
                <span className="font-accent text-gold-700 text-sm tracking-ultra-wide uppercase mx-6">
                  Upcoming Exhibition
                </span>
              </div>
              
              <h2 className="heading-section mb-8">
                David Kereszteny Lewis
                <span className="italic text-gold-700"> Exhibition</span>
              </h2>
            </div>

            {/* Quote */}
            <div className="mb-12">
              <blockquote className="relative">
                <div className="absolute -top-4 -left-4 text-6xl text-gold-300/30 font-display">"</div>
                <p className="font-accent text-2xl md:text-3xl text-forest-800 italic leading-relaxed pl-8">
                  Join us for an exclusive exhibition featuring the latest captivating works by David Kereszteny Lewis, opening on the 21st.
                </p>
                <div className="absolute -bottom-4 -right-4 text-6xl text-gold-300/30 font-display">"</div>
              </blockquote>
            </div>

            {/* Bio Content */}
            <div className="space-y-6 mb-12">
              <p className="text-luxury-large">
                David Kereszteny Lewis is a renowned contemporary artist known for his evocative landscapes and abstract compositions. His work often explores the interplay of light and shadow, capturing the serene beauty of the natural world with a distinctive emotional depth.
              </p>
              
              <p className="text-luxury-large">
                This anticipated exhibition showcases a new series of works, offering a fresh perspective on his artistic journey. Each piece invites viewers into a contemplative space, reflecting the artist's unique vision and masterful technique.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/artists/david-kereszteny-lewis"
                className="btn-primary"
              >
                View David's Profile
              </Link>
              <Link 
                href="/contact?subject=exhibition-enquiry"
                className="btn-secondary"
              >
                Enquire About Exhibition
              </Link>
            </div>
          </div>
          
          {/* Featured Works Grid */}
          <div className={`transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="relative">
              {/* Main Featured Work */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-luxe mb-4">
                {artist?.imageUrl ? (
                  <Image
                    src={artist.imageUrl}
                    alt="David Kereszteny Lewis"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={true}
                  />
                ) : (
                  <Image
                    src={KYFFIN_PLACEHOLDER}
                    alt="David Kereszteny Lewis Collection"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
                
                {/* Overlay with title */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white text-2xl font-light mb-2">Contemporary Landscape Artist</h3>
                  <p className="text-white/80 text-sm">New Exhibition Opening Soon</p>
                </div>
              </div>

              {/* Small Featured Works Grid */}
              {featuredWorks.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {featuredWorks.slice(0, 3).map((work) => (
                    <Link 
                      key={work.id}
                      href={`/collection/${work.id}`}
                      className="relative aspect-square overflow-hidden rounded group"
                    >
                      <Image
                        src={work.localImagePath}
                        alt={work.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 33vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"></div>
                      <div className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-white">
                          <p className="text-xs font-display font-medium line-clamp-1">{work.name}</p>
                          <p className="text-xs">{work.price}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Collection Stats */}
              <div className="absolute -top-8 -right-8 bg-gold-500/10 backdrop-blur-sm rounded-full p-6">
                <div className="text-center">
                  <span className="block text-3xl font-light text-forest-800">New</span>
                  <span className="text-xs text-forest-600 uppercase tracking-wider">Works</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative flourish */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="w-16 h-16 border border-gold-400/20 rounded-full bg-forest-50/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-8 h-8 border border-gold-600/40 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}