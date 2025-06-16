'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const heroSlides = [
  {
    id: 1,
    title: 'Sir Kyffin Williams',
    artist: 'Master Collection',
    subtitle: 'Wales\' Greatest Artist',
    description: 'Discover over 100 exceptional works from Wales\' greatest artist',
    image: '/ART/Landscape_Hero_1.jpg',
    type: 'featured-collection'
  },
  {
    id: 2,
    title: 'Exceptional Art',
    artist: 'Curated Collection',
    subtitle: 'Contemporary Gallery',
    description: 'Discover extraordinary artworks in the heart of Wales',
    image: '/ART/landscape-hero-2.jpg',
    type: 'artwork'
  }
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        setIsTransitioning(false)
      }, 500) // Smooth content transition
    }, 8000) // Slower transition for better viewing
    return () => clearInterval(timer)
  }, [])

  const currentHero = heroSlides[currentSlide]

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Images */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-3000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          {/* Hero Image */}
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="container-luxury">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated content */}
            <div className={`transition-all duration-1000 delay-300 ${
              isLoaded && !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {/* Subtitle */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-px bg-gold-500"></div>
                <span className="font-accent text-gold-400 text-sm tracking-ultra-wide uppercase mx-6">
                  {currentHero.subtitle}
                </span>
                <div className="w-16 h-px bg-gold-500"></div>
              </div>

              {/* Main Title */}
              <h1 className="heading-display text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-cream-50 mb-6 leading-none">
                {currentHero.title}
              </h1>

              {/* Artist */}
              {currentHero.artist && (
                <p className="font-accent text-2xl md:text-3xl text-gold-300 italic mb-4">
                  {currentHero.artist}
                </p>
              )}

              {/* Description */}
              <p className="text-luxury-large text-cream-100 mb-12 max-w-2xl mx-auto">
                {currentHero.description}
              </p>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  href={
                    currentHero.type === 'featured-collection' ? '/artists/sir-kyffin-williams' : 
                    currentHero.type === 'artists' ? '/artists' : '/collection'
                  }
                  className="btn-primary text-lg px-12 py-5"
                >
                  {currentHero.type === 'featured-collection' ? 'View Collection' : 
                   currentHero.type === 'artists' ? 'Meet Our Artists' : 'Explore Collection'}
                </Link>
                <Link 
                  href="/contact"
                  className="btn-hero-secondary text-lg"
                >
                  {currentHero.type === 'featured-collection' ? 'Enquire Today' : 'Discover Our Story'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-4">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (index !== currentSlide) {
                setIsTransitioning(true)
                setTimeout(() => {
                  setCurrentSlide(index)
                  setIsTransitioning(false)
                }, 300)
              }
            }}
            className={`w-12 h-1 transition-all duration-500 ${
              index === currentSlide 
                ? 'bg-gold-500' 
                : 'bg-cream-400/40 hover:bg-cream-400/60'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-24 right-8 hidden lg:block">
        <div className="flex flex-col items-center space-y-2 text-cream-300">
          <span className="font-accent text-xs tracking-widest uppercase rotate-90 transform origin-center">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-cream-300 to-transparent"></div>
        </div>
      </div>
    </section>
  )
}