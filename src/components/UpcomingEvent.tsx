'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Static event data since we don't have an events table yet
// In a real implementation, this would come from a database
const staticEvents = [
  {
    id: '1',
    title: 'Private Gallery Viewing',
    description: 'Join us for an exclusive evening to view our latest acquisitions and meet fellow art enthusiasts. Wine and canapés will be served.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    type: 'private-viewing',
    featured: true
  }
]

export default function UpcomingEvent() {
  const [isVisible, setIsVisible] = useState(false)
  const [formattedDate, setFormattedDate] = useState('')
  const [formattedTime, setFormattedTime] = useState('')
  const sectionRef = useRef<HTMLDivElement>(null)
  const featuredEvent = staticEvents.find(event => event.featured)

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

  useEffect(() => {
    if (featuredEvent) {
      const eventDate = new Date(featuredEvent.date)
      setFormattedDate(eventDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
      setFormattedTime(eventDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      }))
    }
  }, [featuredEvent])

  if (!featuredEvent) return null

  return (
    <section ref={sectionRef} className="section-padding bg-cream-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-gold-300/20 to-gold-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-forest-300/20 to-forest-400/10 rounded-full blur-3xl"></div>
      
      <div className="container-luxury">
        <div className={`max-w-5xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg shadow-luxe overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-px bg-gold-600"></div>
                  <span className="font-accent text-gold-700 text-sm tracking-ultra-wide uppercase mx-6">
                    Upcoming Event
                  </span>
                </div>
                
                <h3 className="heading-featured mb-4">
                  {featuredEvent.title}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-cream-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </svg>
                    </div>
                    <span className="font-elegant text-lg font-medium text-forest-800">
                      {formattedDate}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-cream-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                    </div>
                    <span className="font-elegant text-lg font-medium text-forest-800">
                      {formattedTime}
                    </span>
                  </div>
                </div>
                
                <p className="text-luxury-large mb-8 leading-relaxed">
                  {featuredEvent.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/contact"
                    className="btn-primary"
                  >
                    Reserve Your Place
                  </Link>
                  <Link 
                    href="/contact"
                    className="btn-ghost"
                  >
                    Learn More
                  </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-cream-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-gold-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-elegant font-medium text-forest-800 text-sm mb-1">
                        Complimentary for Hotel Guests
                      </p>
                      <p className="text-luxury text-sm">
                        Light refreshments and wine will be served during the event
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Event Image */}
              <div className="relative h-80 lg:h-auto">
                <Image
                  src="/ART/Landscape_Hero_1.jpg"
                  alt="Private View Event"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Events Preview */}
        {staticEvents.length > 1 && (
          <div className="text-center mt-16">
            <p className="text-luxury mb-6">
              Discover more upcoming events and exhibitions
            </p>
            <Link 
              href="/contact"
              className="btn-secondary-light"
            >
              View All Events
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}