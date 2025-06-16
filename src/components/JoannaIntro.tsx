'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const ARTIST_PLACEHOLDER_IMAGE = '/placeholder-artist.svg'

type Artist = {
  id: string
  name: string
  slug: string
  imageUrl?: string
}

export default function JoannaIntro() {
  const [isVisible, setIsVisible] = useState(false)
  const [artist, setArtist] = useState<Artist | null>(null)
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

    const fetchArtistData = async () => {
      try {
        const response = await fetch('/api/artists/jo-anna-duncalf')
        if (response.ok) {
          const data = await response.json()
          setArtist(data)
        } else {
          console.error('Failed to fetch Jo-Anna artist data', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching Jo-Anna artist data:', error)
      }
    }

    fetchArtistData()

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="section-padding bg-pearl-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-champagne-300/30 via-champagne-200/20 to-forest-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-forest-300/30 via-forest-200/20 to-champagne-200/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-champagne-100/10 via-transparent to-forest-100/10 rounded-full blur-3xl"></div>
      
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Content */}
          <div className={`lg:order-1 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            {/* Section Header */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-16 h-px bg-champagne-600"></div>
                <span className="font-accent text-champagne-700 text-sm tracking-ultra-wide uppercase mx-6">
                  Curator's Welcome
                </span>
              </div>
              
              <h2 className="heading-section mb-8">
                A Personal
                <span className="italic text-champagne-700"> Journey</span>
                <br />Through Art
              </h2>
            </div>

            {/* Quote */}
            <div className="mb-12">
              <blockquote className="relative">
                <div className="absolute -top-4 -left-4 text-6xl text-champagne-300/30 font-display">"</div>
                <p className="font-accent text-2xl md:text-3xl text-forest-800 italic leading-relaxed pl-8">
                  Each piece in our collection tells a story—not just of the artist's vision, 
                  but of the moment I knew it belonged here at Palé Hall.
                </p>
                <div className="absolute -bottom-4 -right-4 text-6xl text-champagne-300/30 font-display">"</div>
              </blockquote>
            </div>

            {/* Bio Content */}
            <div className="space-y-6 mb-12">
              <p className="text-luxury-large">
                Welcome to our carefully curated collection. I'm Jo-Anna Duncalf, and as a conceptual ceramicist 
                with Welsh roots and extensive international experience, I've spent years discovering exceptional 
                works that bridge traditional craftsmanship with contemporary vision.
              </p>
              
              <p className="text-luxury-large">
                Growing up in the Conwy Valley and having studied in Cardiff and Japan, I bring a unique perspective 
                to curation. Every artwork here has been personally selected for its ability to transform 
                spaces and touch souls. From Steve Tootell's masterful pottery to our emerging sculptors' 
                bold statements, each piece represents a conversation between artist and observer.
              </p>
            </div>

            {/* Signature */}
            <div className="flex items-center space-x-6">
              <div className="flex flex-col">
                <span className="font-accent text-3xl text-forest-800 italic">Jo-Anna Duncalf</span>
                <span className="font-body text-sm text-forest-600 tracking-widest uppercase">
                  Conceptual Ceramic Artist & Art Director
                </span>
              </div>
              <div className="w-20 h-px bg-champagne-600"></div>
            </div>
          </div>
          
          {/* Portrait */}
          <div className={`lg:order-2 transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="relative">
              {/* Main Portrait Container */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-luxe">
                {/* Jo-Anna's Portrait */}
                {artist?.imageUrl ? (
                  <Image
                    src={artist.imageUrl}
                    alt="Jo-Anna Duncalf - Art Director at Palé Hall"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={true}
                  />
                ) : (
                  <Image
                    src={ARTIST_PLACEHOLDER_IMAGE}
                    alt="Jo-Anna Duncalf - Art Director at Palé Hall Placeholder"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
                
                {/* Elegant overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/20 via-transparent to-transparent"></div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 border border-champagne-400/30 rounded-full"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-champagne-500/20 rounded-full blur-xl"></div>
              
              {/* Art Direction Badge */}
              <div className="absolute top-6 right-6 bg-pearl-50/90 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="font-accent text-xs text-forest-800 tracking-widest uppercase">
                  Conceptual Ceramicist
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative flourish */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="w-16 h-16 border border-champagne-400/20 rounded-full bg-pearl-50/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-8 h-8 border border-champagne-600/40 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}