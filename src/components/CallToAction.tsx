import Link from 'next/link'

export default function CallToAction() {
  const actions = [
    {
      title: 'Sir Kyffin Williams Collection',
      description: 'Explore our prestigious collection of Wales\' greatest artist',
      href: '/artists/sir-kyffin-williams',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      primary: true
    },
    {
      title: 'Meet the Artists',
      description: 'Discover the talented creators behind our exceptional pieces',
      href: '/artists',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      primary: false
    },
    {
      title: 'How to Acquire',
      description: 'Learn about our purchase process and viewing options',
      href: '/how-to-buy',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      primary: false
    },
    {
      title: 'Private Viewings',
      description: 'Book an exclusive viewing experience at Palé Hall',
      href: '/contact',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      primary: false
    }
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-cream-50 via-cream-100 to-gold-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-gold-300/20 to-gold-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-forest-300/20 to-forest-400/10 rounded-full blur-3xl"></div>

      <div className="container-luxury relative">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-600 to-transparent"></div>
            <span className="font-accent text-gold-700 text-sm tracking-ultra-wide uppercase mx-8">
              Begin Your Journey
            </span>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-600 to-transparent"></div>
          </div>
          
          <h2 className="heading-section text-forest-900 mb-6">
            Exceptional Art
            <span className="italic text-gold-700"> Collection</span>
            <br />Awaits You
          </h2>
          <p className="text-luxury-large text-forest-800 max-w-3xl mx-auto">
            From our prestigious Sir Kyffin Williams collection to contemporary Welsh artists, 
            discover museum-quality artworks in an intimate gallery setting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
          {actions.map((action, index) => (
            <Link 
              key={index}
              href={action.href}
              className={`group block p-8 rounded-lg transition-all duration-500 hover:transform hover:scale-105 shadow-elegant hover:shadow-luxe ${
                action.primary 
                  ? 'bg-gradient-to-br from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-cream-50' 
                  : 'bg-white/80 backdrop-blur-sm border border-gold-200/30 hover:bg-white/90 hover:border-gold-300/50'
              }`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  action.primary 
                    ? 'bg-cream-50/20 text-cream-50 group-hover:bg-cream-50/30' 
                    : 'bg-gold-100 text-gold-600 group-hover:bg-gold-200 group-hover:text-gold-700'
                }`}>
                  {action.icon}
                </div>
                
                <h3 className={`heading-card mb-4 font-medium ${
                  action.primary 
                    ? 'text-cream-50' 
                    : 'text-forest-900 group-hover:text-gold-700'
                }`}>
                  {action.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  action.primary 
                    ? 'text-cream-100' 
                    : 'text-forest-700 group-hover:text-forest-800'
                }`}>
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional CTA */}
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm border border-gold-200/30 rounded-lg p-8 max-w-2xl mx-auto shadow-elegant">
            <h3 className="heading-featured text-forest-900 mb-4">
              Interested in the Sir Kyffin Williams Collection?
            </h3>
            <p className="text-luxury text-forest-700 mb-6">
              Our experienced team is available for private consultations and viewings 
              of this exceptional collection of over 100 works.
            </p>
            <Link 
              href="/contact"
              className="btn-primary"
            >
              Arrange Private Viewing
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}