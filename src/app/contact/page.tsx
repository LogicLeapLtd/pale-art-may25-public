'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CustomDropdown from '@/components/CustomDropdown'
import Image from 'next/image'
import type { Product } from '@prisma/client'

function ContactForm() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
    source: 'website'
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Pre-fill form based on URL parameters
  useEffect(() => {
    const artworkId = searchParams.get('artwork')
    const artistName = searchParams.get('artist')
    
    const loadData = async () => {
      setLoading(true)
      try {
        if (artworkId) {
          const response = await fetch(`/api/artworks/by-slug/${encodeURIComponent(artworkId)}`)
          if (response.ok) {
            const artwork = await response.json()
            if (artwork) {
              setFormData(prev => ({
                ...prev,
                subject: 'artwork-enquiry',
                message: `I am interested in "${artwork.name}" by ${artwork.artist || 'the artist'}. Please provide more information about this piece.`
              }))
            }
          }
        } else if (artistName) {
          setFormData(prev => ({
            ...prev,
            subject: 'commission',
            message: `I am interested in commissioning a work by ${artistName}. Please contact me to discuss possibilities.`
          }))
        }
      } catch (error) {
        console.error('Error loading form data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (artworkId || artistName) {
      loadData()
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: '',
        source: 'website'
      })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/ART/landscape-hero-2.jpg"
          alt="Contact Palé Hall Art"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Get <span className="italic font-medium text-gold-300">in Touch</span>
          </h1>
          <p className="text-xl md:text-2xl font-light leading-relaxed opacity-90">
            Connect with us about commissions, collections, and private viewings
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
              Get in Touch
            </span>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-600 to-transparent"></div>
          </div>
          
          <h1 className="heading-section mb-6">
            Contact
            <span className="italic text-gold-700"> Our Curator</span>
          </h1>
          <p className="text-luxury-large max-w-3xl mx-auto">
            Whether you're interested in a specific piece, seeking a commission, 
            or would like to arrange a private viewing, we're here to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            {loading && (
              <div className="mb-4 text-center">
                <p className="text-forest-600">Loading form data...</p>
              </div>
            )}
            {isSubmitted ? (
              <div className="bg-gradient-to-br from-gold-50 to-cream-100 border border-gold-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-cream-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="heading-card mb-4">Message Sent Successfully</h3>
                <p className="text-luxury">
                  Thank you for your enquiry. Our team will respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block font-elegant text-sm font-medium text-forest-800 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-cream-300 rounded-md bg-cream-50 text-forest-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block font-elegant text-sm font-medium text-forest-800 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-cream-300 rounded-md bg-cream-50 text-forest-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block font-elegant text-sm font-medium text-forest-800 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-cream-300 rounded-md bg-cream-50 text-forest-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <CustomDropdown
                  label="Enquiry Type *"
                  options={[
                    { value: 'general', label: 'General Enquiry' },
                    { value: 'artwork-enquiry', label: 'Artwork Enquiry' },
                    { value: 'commission', label: 'Commission Request' },
                    { value: 'private-viewing', label: 'Private Viewing' },
                    { value: 'press', label: 'Press & Media' }
                  ]}
                  value={formData.subject}
                  onChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                />

                <div>
                  <label htmlFor="message" className="block font-elegant text-sm font-medium text-forest-800 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-cream-300 rounded-md bg-cream-50 text-forest-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-300 resize-vertical"
                    placeholder="Please provide details about your enquiry..."
                  />
                </div>

                <CustomDropdown
                  label="How did you hear about us?"
                  options={[
                    { value: 'website', label: 'Website' },
                    { value: 'hotel-guest', label: 'Palé Hall Guest' },
                    { value: 'social-media', label: 'Social Media' },
                    { value: 'word-of-mouth', label: 'Word of Mouth' },
                    { value: 'press', label: 'Press/Media' },
                    { value: 'other', label: 'Other' }
                  ]}
                  value={formData.source}
                  onChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                />

                <button type="submit" className="w-full btn-primary py-4">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Gallery Contact */}
            <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-8">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-forest-300 to-forest-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-8 h-8 bg-gold-400/40 rounded-full"></div>
                </div>
                <div>
                  <h3 className="heading-card mb-2">Gallery Enquiries</h3>
                  <p className="font-accent text-gold-600 italic mb-3">Art Collection & Sales</p>
                  <p className="text-luxury text-sm mb-4">
                    Our expert team, led by experienced curators, personally guides 
                    collectors through our exceptional Sir Kyffin Williams collection 
                    and other prestigious artworks.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center space-x-3">
                      <svg className="w-4 h-4 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>art@palehall.co.uk</span>
                    </p>
                    <p className="flex items-center space-x-3">
                      <svg className="w-4 h-4 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>+44 1678 530 285</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visit Us */}
            <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-8">
              <h3 className="heading-card mb-4">Visit Palé Hall</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-elegant font-medium text-forest-800 mb-2">Address</h4>
                  <p className="text-luxury">
                    Palé Hall<br />
                    Llandderfel<br />
                    Bala LL23 7PS<br />
                    Wales, United Kingdom
                  </p>
                </div>
                
                <div>
                  <h4 className="font-elegant font-medium text-forest-800 mb-2">Gallery Hours</h4>
                  <div className="text-luxury text-sm space-y-1">
                    <p>Monday - Sunday: 9:00 AM - 6:00 PM</p>
                    <p>Private viewings available by appointment</p>
                    <p className="text-gold-600 italic">Extended hours for hotel guests</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-gradient-to-br from-gold-50 to-cream-100 border border-gold-200 rounded-lg p-6">
              <h3 className="font-elegant text-lg font-medium text-forest-800 mb-3">
                Response Time
              </h3>
              <p className="text-luxury text-sm">
                We respond to all enquiries within 24 hours. For urgent matters 
                or same-day viewing requests, please call us directly.
              </p>
            </div>

            {/* Social Links */}
            <div className="text-center">
              <h3 className="font-elegant text-lg font-medium text-forest-800 mb-4">
                Follow Our Journey
              </h3>
              <div className="flex justify-center space-x-4">
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gold-500 hover:bg-gold-600 rounded-full flex items-center justify-center text-cream-50 transition-colors duration-300"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gold-500 hover:bg-gold-600 rounded-full flex items-center justify-center text-cream-50 transition-colors duration-300"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default function Contact() {
  return (
    <Suspense fallback={
      <div className="pt-32 pb-20">
        <div className="container-luxury text-center">
          <p className="text-luxury-large text-forest-600">Loading contact form...</p>
        </div>
      </div>
    }>
      <ContactForm />
    </Suspense>
  )
}