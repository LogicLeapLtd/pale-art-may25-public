'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsLoading(false)
    
    setTimeout(() => {
      setIsSubmitted(false)
      setEmail('')
    }, 4000)
  }

  return (
    <section className="section-padding bg-gradient-to-br from-forest-700 via-forest-600 to-forest-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-leaf-pattern opacity-5"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-gold-500/20 to-gold-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-gold-400/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="container-luxury relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
              <span className="font-accent text-gold-400 text-sm tracking-ultra-wide uppercase mx-8">
                Stay Connected
              </span>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
            </div>
            
            <h2 className="heading-section text-cream-50 mb-6">
              Join Our
              <span className="italic text-gold-400"> Community</span>
            </h2>
            <p className="text-luxury-large text-cream-100">
              Be the first to discover new artists, artworks, and exclusive events. 
              Join our community of art enthusiasts and collectors.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/10 backdrop-blur-sm border border-gold-400/30 rounded-lg p-8">
              <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-cream-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="heading-card text-cream-50 mb-4">
                Welcome to Our Community!
              </h3>
              <p className="text-luxury text-cream-200">
                Thank you for subscribing. You'll receive our latest updates and exclusive insights soon.
              </p>
            </div>
          ) : (
            <div className="bg-cream-50/10 backdrop-blur-sm border border-cream-300/20 rounded-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-6 py-4 bg-cream-50 border border-cream-300 rounded-md text-forest-900 placeholder-forest-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-300 font-body"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary px-8 py-4 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin"></div>
                        <span>Subscribing...</span>
                      </div>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-cream-300 text-sm">
                    Join over 500 art lovers who receive our curated updates
                  </p>
                  
                  {/* Benefits */}
                  <div className="grid sm:grid-cols-3 gap-4 text-cream-200 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                      <span>New artwork alerts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                      <span>Exclusive previews</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                      <span>Event invitations</span>
                    </div>
                  </div>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-cream-300/20">
                <p className="text-cream-300 text-sm">
                  We respect your privacy. Unsubscribe at any time. Read our{' '}
                  <a href="#" className="text-gold-400 hover:text-gold-300 transition-colors duration-300">
                    privacy policy
                  </a>.
                </p>
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="mt-12">
            <p className="text-cream-300 text-sm mb-6">
              Follow our art journey on social media
            </p>
            <div className="flex justify-center space-x-6">
              <a 
                href="#" 
                className="w-12 h-12 bg-cream-50/10 hover:bg-cream-50/20 backdrop-blur-sm border border-cream-300/20 rounded-full flex items-center justify-center text-cream-200 hover:text-gold-400 transition-all duration-300 group"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-cream-50/10 hover:bg-cream-50/20 backdrop-blur-sm border border-cream-300/20 rounded-full flex items-center justify-center text-cream-200 hover:text-gold-400 transition-all duration-300 group"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-cream-50/10 hover:bg-cream-50/20 backdrop-blur-sm border border-cream-300/20 rounded-full flex items-center justify-center text-cream-200 hover:text-gold-400 transition-all duration-300 group"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}