import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function HowToBuy() {
  const steps = [
    {
      number: '01',
      title: 'Browse & Discover',
      description: 'Explore our carefully curated collection online or visit us at Palé Hall to experience the artworks in person.',
      details: [
        'View detailed images and artwork stories',
        'Read about the artists and their techniques',
        'Use our QR codes in-gallery for instant information'
      ]
    },
    {
      number: '02',
      title: 'Enquire or Reserve',
      description: 'Found something you love? Contact us to enquire about pricing, availability, or to reserve a piece.',
      details: [
        'Instant enquiry forms on every artwork page',
        'Personal consultation with our curator Joanna',
        'Professional condition reports available'
      ]
    },
    {
      number: '03',
      title: 'Purchase & Authentication',
      description: 'We will guide you through the purchase process, ensuring authenticity and providing complete documentation.',
      details: [
        'Certificate of authenticity included',
        'Detailed provenance documentation',
        'Secure payment options available'
      ]
    },
    {
      number: '04',
      title: 'Delivery & Installation',
      description: 'Professional packaging, insured shipping, and optional installation services ensure your artwork arrives safely.',
      details: [
        'Specialist art transport and insurance',
        'Professional installation service available',
        'Worldwide shipping with tracking'
      ]
    }
  ]

  const faqs = [
    {
      question: 'How do I know if an artwork is authentic?',
      answer: 'Every artwork comes with a certificate of authenticity and detailed provenance documentation. Our curator Joanna personally vets each piece and artist in our collection.'
    },
    {
      question: 'Can I view artworks in person before purchasing?',
      answer: 'Absolutely. We encourage viewing artworks in person at Palé Hall. Private viewing appointments can be arranged, and many pieces are displayed in our public spaces.'
    },
    {
      question: 'What are your shipping and return policies?',
      answer: 'We offer worldwide shipping with full insurance. Returns are accepted within 14 days in original condition. Local delivery and installation services are available in Wales and surrounding areas.'
    },
    {
      question: 'Do you offer payment plans or financing?',
      answer: 'Yes, we can arrange flexible payment plans for qualifying purchases. Contact us to discuss options that work for your budget and timeline.'
    },
    {
      question: 'Can I commission a piece from one of your artists?',
      answer: 'Many of our artists accept commissions. We can facilitate introductions and help coordinate custom pieces. Lead times vary by artist and complexity.'
    },
    {
      question: 'How do I care for my artwork?',
      answer: 'We provide detailed care instructions with every purchase. For valuable pieces, we can recommend professional conservation services and regular maintenance.'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/ART/dsc02540.jpg"
          alt="How to Buy Art - Palé Hall Art"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            How to <span className="italic font-medium text-gold-300">Acquire</span>
          </h1>
          <p className="text-xl md:text-2xl font-light leading-relaxed opacity-90">
            Your guide to collecting exceptional contemporary art
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
              Acquisition Guide
            </span>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-600 to-transparent"></div>
          </div>
          
          <h1 className="heading-section mb-6">
            How to
            <span className="italic text-gold-700"> Acquire</span>
          </h1>
          <p className="text-luxury-large max-w-3xl mx-auto">
            From discovery to delivery, we make acquiring exceptional art a seamless and enjoyable experience. 
            Our personal approach ensures you find the perfect piece for your collection.
          </p>
        </div>

        {/* Process Steps */}
        <div className="mb-20">
          <h2 className="heading-featured text-center mb-12">
            Our Acquisition Process
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                      <span className="font-display text-xl font-bold text-cream-50">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="heading-card mb-3">
                      {step.title}
                    </h3>
                    <p className="text-luxury mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-luxury text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Private Viewings */}
        <div className="bg-gradient-to-br from-forest-50 to-cream-100 border border-cream-200 rounded-lg p-8 lg:p-12 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-featured mb-6">
                Private Viewings
              </h2>
              <p className="text-luxury-large mb-6">
                Experience our collection in the intimate setting of Palé Hall. 
                Private viewings allow you to see artworks in context and receive 
                personal insights from our curator.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-luxury">One-on-one consultation with Jo-Anna</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-luxury">See artworks in the hotel's luxury setting</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-luxury">Learn about each piece's history and technique</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-luxury">Flexible scheduling, including evenings and weekends</span>
                </li>
              </ul>
              <Link href="/contact" className="btn-primary">
                Book Private Viewing
              </Link>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/ART/landscape-hero-2.jpg"
                  alt="Private Gallery Space"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold-500/20 rounded-full blur-xl"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 border-2 border-gold-400/30 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="heading-featured text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg overflow-hidden">
                <summary className="p-6 cursor-pointer hover:bg-cream-200/50 transition-colors duration-300">
                  <h3 className="font-elegant text-lg font-medium text-forest-800 inline-block">
                    {faq.question}
                  </h3>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-luxury leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16 pt-16 border-t border-cream-200">
          <h2 className="heading-featured mb-6">
            Ready to Start Your Collection?
          </h2>
          <p className="text-luxury-large max-w-2xl mx-auto mb-8">
            Have questions about a specific piece or our process? 
            Our team is here to guide you through every step of your art acquisition journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary">
              Contact Our Curator
            </Link>
            <Link href="/collection" className="btn-secondary">
              Browse Collection
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}