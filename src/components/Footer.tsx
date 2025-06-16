import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-forest-900 via-forest-800 to-forest-900 text-cream-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-leaf-pattern opacity-5"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-gradient-to-br from-gold-500/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-gold-400/10 to-transparent rounded-full blur-3xl"></div>

      <div className="container-luxury relative">
        <div className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h3 className="font-display text-3xl text-cream-50 tracking-tight mb-2">
                  Palé Hall Art
                </h3>
                <div className="flex items-center space-x-3">
                  <span className="font-accent text-gold-400 italic text-sm tracking-widest uppercase">
                    Curated Collection
                  </span>
                  <div className="w-12 h-px bg-gradient-to-r from-gold-400 to-transparent"></div>
                </div>
              </div>
              
              <p className="text-luxury text-cream-200 mb-8 max-w-md leading-relaxed">
                Exceptional contemporary artworks at the distinguished Palé Hall, featuring our prestigious 
                Sir Kyffin Williams collection and works from renowned Welsh artists.
              </p>

              {/* Newsletter Signup */}
              <div className="bg-cream-50/5 backdrop-blur-sm border border-cream-300/20 rounded-lg p-6">
                <h4 className="font-elegant text-lg font-medium text-cream-50 mb-4">
                  Stay Updated
                </h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-4 py-3 bg-cream-50/10 border border-cream-300/30 rounded-md text-cream-100 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-300"
                  />
                  <button className="btn-primary px-6 py-3 whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div>
              <h4 className="font-elegant text-lg font-medium text-cream-50 mb-6">
                Explore
              </h4>
              <div className="space-y-4">
                <Link 
                  href="/collection" 
                  className="block text-cream-200 hover:text-gold-400 transition-colors duration-300 relative group"
                >
                  The Collection
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link 
                  href="/artists" 
                  className="block text-cream-200 hover:text-gold-400 transition-colors duration-300 relative group"
                >
                  Our Artists
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link 
                  href="/how-to-buy" 
                  className="block text-cream-200 hover:text-gold-400 transition-colors duration-300 relative group"
                >
                  How to Acquire
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link 
                  href="/about" 
                  className="block text-cream-200 hover:text-gold-400 transition-colors duration-300 relative group"
                >
                  About Us
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </div>
            
            {/* Contact & Visit */}
            <div>
              <h4 className="font-elegant text-lg font-medium text-cream-50 mb-6">
                Visit & Connect
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-cream-200 text-sm mb-2">Gallery Address</p>
                  <p className="text-cream-300 text-sm leading-relaxed">
                    Palé Hall<br />
                    Llandderfel<br />
                    Bala LL23 7PS<br />
                    Wales, UK
                  </p>
                </div>
                
                <div>
                  <p className="text-cream-200 text-sm mb-2">Gallery Hours</p>
                  <p className="text-cream-300 text-sm">
                    Daily: 9:00 AM - 6:00 PM<br />
                    Private viewings by appointment
                  </p>
                </div>

                <div>
                  <p className="text-cream-200 text-sm mb-2">Contact</p>
                  <div className="space-y-1">
                    <a 
                      href="mailto:art@palehall.co.uk" 
                      className="block text-cream-300 hover:text-gold-400 transition-colors duration-300 text-sm"
                    >
                      art@palehall.co.uk
                    </a>
                    <a 
                      href="tel:+441678530285" 
                      className="block text-cream-300 hover:text-gold-400 transition-colors duration-300 text-sm"
                    >
                      +44 1678 530 285
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-cream-300/20 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-cream-300 text-sm">
                &copy; {currentYear} Palé Hall Art. All rights reserved.
              </p>
              <p className="text-cream-400 text-xs mt-1">
                Featuring Sir Kyffin Williams Collection
              </p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="w-10 h-10 bg-cream-50/5 hover:bg-cream-50/10 backdrop-blur-sm border border-cream-300/20 rounded-full flex items-center justify-center text-cream-300 hover:text-gold-400 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-cream-50/5 hover:bg-cream-50/10 backdrop-blur-sm border border-cream-300/20 rounded-full flex items-center justify-center text-cream-300 hover:text-gold-400 transition-all duration-300"
                aria-label="Pinterest"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-cream-50/5 hover:bg-cream-50/10 backdrop-blur-sm border border-cream-300/20 rounded-full flex items-center justify-center text-cream-300 hover:text-gold-400 transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-cream-300 hover:text-gold-400 transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-cream-300 hover:text-gold-400 transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link 
                href="/contact" 
                className="text-cream-300 hover:text-gold-400 transition-colors duration-300"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}