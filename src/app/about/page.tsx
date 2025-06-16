import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function About() {
  const team = [
    {
      name: 'Michael Cheetham',
      title: 'Executive Chef & Creative Director',
      bio: 'As Executive Chef and Creative Director of Palé Hall, Michael oversees the artistic vision that extends from cuisine to our curated art collection, with a particular focus on showcasing Wales\' greatest artists.',
      image: '/images/team/michael.jpg'
    },
    {
      name: 'Angela Cheetham',
      title: 'Managing Director',
      bio: 'Angela ensures that every aspect of the Palé Hall experience reflects our commitment to excellence and hospitality, including our exceptional Sir Kyffin Williams collection.',
      image: '/images/team/angela.jpg'
    },
    {
      name: 'Jo-Anna',
      title: 'Art Curator',
      bio: 'With extensive experience in art curation, Jo-Anna provides curatorial expertise and ensures the preservation and presentation of our prestigious collection.',
      image: '/images/team/joanna.jpg'
    }
  ]

  const values = [
    {
      title: 'Exceptional Quality',
      description: 'Every piece is personally selected for its artistic merit, craftsmanship, and the story it tells.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Artist Support',
      description: 'We champion both established and emerging artists, providing them with a platform to reach discerning collectors.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: 'Personal Service',
      description: 'Our intimate approach ensures each collector receives individual attention and expert guidance.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      title: 'Cultural Legacy',
      description: 'We are committed to building lasting relationships between collectors, artists, and the broader art community.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/ART/Landscape_Hero_1.jpg"
          alt="Palé Hall Art - About Us"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Our <span className="italic font-medium text-gold-300">Story</span>
          </h1>
          <p className="text-xl md:text-2xl font-light leading-relaxed opacity-90">
            Where exceptional art meets passionate curation in the heart of Wales
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
              Our Story
            </span>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-600 to-transparent"></div>
          </div>
          
          <h1 className="heading-section mb-6">
            The Vision Behind
            <span className="italic text-gold-700"> Palé Hall Art</span>
          </h1>
          <p className="text-luxury-large max-w-3xl mx-auto">
            More than a gallery, we are a bridge between exceptional artists and discerning collectors, 
            fostering relationships that celebrate the transformative power of contemporary art.
          </p>
        </div>

        {/* Sir Kyffin Williams Collection Highlight */}
        <div className="bg-gradient-to-br from-forest-50 via-forest-100 to-gold-50 border border-forest-200 rounded-lg p-8 lg:p-12 mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-featured mb-8">
              Our Crown Jewel: The Sir Kyffin Williams Collection
            </h2>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <p className="text-luxury-large mb-6">
                  We are proud to house one of the most significant private collections of Sir Kyffin Williams' 
                  work, featuring over 100 exceptional pieces from throughout his distinguished career.
                </p>
                <p className="text-luxury mb-6">
                  Sir Kyffin Williams (1918-2006) was Wales' greatest landscape artist, whose distinctive 
                  palette knife technique captured the raw beauty of Snowdonia and Anglesey. This collection 
                  represents a rare opportunity to experience the full breadth of his artistic vision.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/artists/sir-kyffin-williams" className="btn-primary">
                    View Collection
                  </Link>
                  <Link href="/contact" className="btn-secondary">
                    Private Viewing
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <Image
                    src="/ART/Landscape_Hero_1.jpg"
                    alt="Sir Kyffin Williams Collection"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -top-4 -right-4 bg-gold-500 text-white px-4 py-2 rounded-full">
                  <span className="font-accent text-sm">100+ Works</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-br from-cream-50 via-cream-100 to-gold-50 border border-cream-200 rounded-lg p-8 lg:p-12 mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-featured mb-8">
              Our Curatorial Vision
            </h2>
            <blockquote className="relative">
              <div className="absolute -top-8 -left-8 text-6xl text-gold-300/40 font-display">"</div>
              <p className="text-luxury-large italic leading-relaxed mb-6">
                From our prestigious Sir Kyffin Williams collection to contemporary Welsh artists, 
                every piece tells a story. We believe art has the power to transform spaces and touch souls, 
                bridging traditional craftsmanship with contemporary vision.
              </p>
              <div className="absolute -bottom-8 -right-8 text-6xl text-gold-300/40 font-display">"</div>
            </blockquote>
            <div className="flex items-center justify-center space-x-4 mt-8">
              <div className="w-12 h-px bg-gold-600"></div>
              <span className="font-accent text-gold-600 italic">Our Curatorial Team</span>
              <div className="w-12 h-px bg-gold-600"></div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="heading-featured mb-6">
              A Legacy of Excellence
            </h2>
            <div className="space-y-6 text-luxury">
              <p>
                The Palé Hall Art programme was born from a desire to extend the hotel's 
                commitment to exceptional experiences into the realm of visual arts. What began 
                as a personal passion for collecting has evolved into a carefully curated 
                programme that showcases both established masters and emerging talents.
              </p>
              <p>
                Set within the stunning Welsh countryside, Palé Hall provides the perfect 
                backdrop for experiencing art in an intimate, luxurious setting. Our collection 
                grows organically, with each new acquisition carefully considered for its 
                artistic merit and its ability to enhance the overall experience of our guests and visitors.
              </p>
              <p>
                Today, we work with artists from across the UK and beyond, providing them with 
                a platform to reach discerning collectors while offering our visitors the 
                opportunity to discover and acquire exceptional works in a uniquely beautiful setting.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/ART/landscape-hero-2.jpg"
                alt="Palé Hall Gallery Space"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-gold-400/30 rounded-full"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gold-500/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="heading-featured mb-6">
              Our Commitment
            </h2>
            <p className="text-luxury-large max-w-3xl mx-auto">
              These values guide every decision we make, from the artists we choose to work with 
              to the service we provide our collectors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center text-cream-50">
                      {value.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="heading-card mb-3">
                      {value.title}
                    </h3>
                    <p className="text-luxury">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="heading-featured mb-6">
              Find Us
            </h2>
            <div className="space-y-6 text-luxury">
              <p>
                Palé Hall is nestled in the heart of the stunning Snowdonia National Park,
                offering a tranquil and inspiring setting for our art collection.
              </p>
              <p>
                We invite you to visit our gallery space within the hotel to experience
                the artworks firsthand. Private viewings can be arranged by appointment.
              </p>
              <p>
                Our postcode for navigation is: <span className="font-semibold">LL23 7PS</span>
              </p>
              <Link href="/contact" className="btn-primary">
                Plan Your Visit
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/ART/dsc02540.jpg"
                alt="Palé Hall Location"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-gold-400/30 rounded-full"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gold-500/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-20" id="faq">
          <div className="text-center mb-12">
            <h2 className="heading-featured mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-luxury-large max-w-3xl mx-auto">
              Find answers to common questions about our collection, artists, and services.
            </p>
          </div>

          <div className="space-y-6">
            {/* Example FAQ Item */}
            <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-6">
              <h3 className="font-display text-xl text-forest-900 mb-3">How do I purchase an artwork?</h3>
              <p className="text-luxury">
                To purchase an artwork, simply click the 'Enquire' button on the artwork's page or contact us directly. Our team will guide you through the process.
              </p>
            </div>

            <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-6">
              <h3 className="font-display text-xl text-forest-900 mb-3">Do you offer international shipping?</h3>
              <p className="text-luxury">
                Yes, we offer secure international shipping for all artworks. Shipping costs and delivery times will vary based on destination.
              </p>
            </div>

            <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-6">
              <h3 className="font-display text-xl text-forest-900 mb-3">Can I view artworks in person before purchasing?</h3>
              <p className="text-luxury">
                Absolutely. We welcome private viewings at Palé Hall by appointment. Please contact us to arrange your visit.
              </p>
            </div>

          </div>
        </div>

        </div>
      </div>
    </div>
  )
}