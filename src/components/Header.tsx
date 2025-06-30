'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { User, ShoppingBag } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [megaMenuTimer, setMegaMenuTimer] = useState<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const { count: cartCount } = useCart()

  const handleMegaMenuEnter = (menuName: string) => {
    if (megaMenuTimer) {
      clearTimeout(megaMenuTimer)
    }
    setActiveMegaMenu(menuName)
  }

  const handleMegaMenuLeave = () => {
    const timer = setTimeout(() => {
      setActiveMegaMenu(null)
    }, 150) // Small delay to allow mouse movement
    setMegaMenuTimer(timer)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')
  
  const megaMenus = {
    Collection: {
      sections: [
        {
          title: 'Curated Collection',
          items: [
            { 
              href: '/collection', 
              label: 'All Artworks', 
              description: 'Our complete curated selection',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            },
            { 
              href: '/collection?filter=available', 
              label: 'Available to Purchase', 
              description: 'Ready for immediate acquisition',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            },
            { 
              href: '/collection?filter=featured', 
              label: 'Current Exhibition', 
              description: 'Featured works on display',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            },
            { 
              href: '/collection?filter=qr-enabled', 
              label: 'QR Code Collection', 
              description: 'Scan pieces throughout Palé Hall',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            }
          ]
        },
        {
          title: 'By Medium',
          items: [
            { 
              href: '/collection?medium=Ceramics', 
              label: 'Ceramics & Pottery', 
              description: 'Featured ceramic artists',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            },
            { 
              href: '/collection?medium=Sculpture', 
              label: 'Sculpture', 
              description: 'Nick Elphick, contemporary forms',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            },
            { 
              href: '/collection?medium=Painting', 
              label: 'Paintings', 
              description: 'Gareth Nash, Glen Farrelly',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" /></svg>
            },
            { 
              href: '/collection?medium=Mixed Media', 
              label: 'Mixed Media', 
              description: 'Andy Dobbie, contemporary works',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 4h10M7 4a2 2 0 00-2 2v2h14V6a2 2 0 00-2-2" /></svg>
            }
          ]
        },
        {
          title: 'Experience',
          items: [
            { 
              href: '/contact?subject=private-viewing', 
              label: 'Private View Events', 
              description: 'Exclusive gallery openings',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            },
            { 
              href: '/how-to-buy', 
              label: 'Purchase Artworks', 
              description: 'How to acquire pieces',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            },
            { 
              href: '/contact?subject=gallery-tour', 
              label: 'Gallery Tours', 
              description: 'Explore art throughout Palé Hall',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            }
          ]
        }
      ],
      featured: {
        title: 'Victorian Heritage Meets Contemporary Art',
        artist: 'Est. 1850s',
        description: 'Our magnificent Victorian mansion has housed treasured collections for generations. Today, it continues this tradition showcasing exceptional contemporary works.',
        href: '/about',
        price: 'Since 1850s'
      }
    },
    Artists: {
      sections: [
        {
          title: 'Our Artists',
          items: [
            { 
              href: '/artists', 
              label: 'All Artists', 
              description: 'Meet our featured artists',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
            },
            { 
              href: '/artists/steve-tootell', 
              label: 'Steve Tootell', 
              description: 'Internationally renowned potter',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            },
            { 
              href: '/artists/nick-elphick', 
              label: 'Nick Elphick', 
              description: 'Contemporary sculptor',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            },
            { 
              href: '/artists/sir-kyffin-williams-ra', 
              label: 'Sir Kyffin Williams', 
              description: 'Master Welsh landscape artist',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            }
          ]
        },
        {
          title: 'Featured Artists',
          items: [
            { 
              href: '/artists/gareth-nash', 
              label: 'Gareth Nash', 
              description: 'Contemporary painter',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            },
            { 
              href: '/artists/glen-farrelly', 
              label: 'Glen Farrelly', 
              description: 'Fine art painter',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" /></svg>
            },
            { 
              href: '/artists/andy-dobbie', 
              label: 'Andy Dobbie', 
              description: 'Mixed media artist',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 4h10M7 4a2 2 0 00-2 2v2h14V6a2 2 0 00-2-2" /></svg>
            },
            { 
              href: '/artists/mfikela-jean-samuel', 
              label: 'Mfikela Jean Samuel', 
              description: 'Emerging contemporary artist',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            }
          ]
        },
        {
          title: 'Artist Stories',
          items: [
            { 
              href: '/about', 
              label: 'Our Story', 
              description: 'Our curator and art director',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            },
            { 
              href: '/about', 
              label: 'Curation Process', 
              description: 'How artworks are selected',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            },
            { 
              href: '/contact?subject=artist-collaboration', 
              label: 'Artist Collaborations', 
              description: 'Working with Palé Hall Art',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            }
          ]
        }
      ],
      featured: {
        title: 'Snowdonia\'s Cultural Legacy',
        artist: 'Historic Wales',
        description: 'Nestled in Snowdonia National Park, Palé Hall has welcomed artists, writers and collectors for over a century. Discover how this heritage shapes our curation.',
        href: '/about',
        price: 'Cultural Heritage'
      }
    },
    Acquire: {
      sections: [
        {
          title: 'Purchase Process',
          items: [
            { 
              href: '/how-to-buy', 
              label: 'How to Purchase', 
              description: 'Simple acquisition process',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            },
            { 
              href: '/how-to-buy', 
              label: 'Make an Enquiry', 
              description: 'Interest in specific pieces',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            },
            { 
              href: '/how-to-buy', 
              label: 'Pricing Information', 
              description: 'Transparent pricing policy',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            },
            { 
              href: '/how-to-buy', 
              label: 'QR Code Purchase', 
              description: 'Buy directly via QR codes',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            }
          ]
        },
        {
          title: 'Gallery Services',
          items: [
            { 
              href: '/contact?subject=private-viewing', 
              label: 'Private View Events', 
              description: 'Exclusive gallery openings',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            },
            { 
              href: '/contact?subject=personal-consultation', 
              label: 'Personal Consultation', 
              description: 'Speak with our gallery team',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            },
            { 
              href: '/contact?subject=collection-guidance', 
              label: 'Collection Guidance', 
              description: 'Expert curatorial advice',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            },
            { 
              href: '/contact?subject=hotel-guest', 
              label: 'Hotel Guest Services', 
              description: 'Special services for Palé Hall guests',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            }
          ]
        },
        {
          title: 'Support',
          items: [
            { 
              href: '/contact', 
              label: 'Contact Gallery', 
              description: 'Speak with our curator directly',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            },
            { 
              href: '/how-to-buy', 
              label: 'Delivery & Collection', 
              description: 'Secure artwork delivery',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            },
            { 
              href: '/about#faq', 
              label: 'Frequently Asked', 
              description: 'Common questions answered',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
          ]
        }
      ],
      featured: {
        title: 'The Curator\'s Tradition',
        artist: 'Continuing Heritage',
        description: 'Palé Hall houses one of the most significant private collections of Sir Kyffin Williams\' work, featuring over 100 exceptional pieces.',
        href: '/artists/sir-kyffin-williams-ra',
        price: 'Heritage Continues'
      }
    },
    About: {
      sections: [
        {
          title: 'Palé Hall Art',
          items: [
            { 
              href: '/about', 
              label: 'Our Story', 
              description: 'Luxury gallery within Palé Hall',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            },
            { 
              href: '/about', 
              label: 'About Us', 
              description: 'Our curator with ceramics background',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            },
            { 
              href: '/about', 
              label: 'Curation Philosophy', 
              description: 'How artworks are selected',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            },
            { 
              href: '/about', 
              label: 'Gallery Mission', 
              description: 'Art destination in North Wales',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            }
          ]
        },
        {
          title: 'Visit the Gallery',
          items: [
            { 
              href: '/about#location', 
              label: 'Gallery at Palé Hall', 
              description: 'North Wales, Snowdonia',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            },
            { 
              href: '/collection?filter=qr-enabled', 
              label: 'QR Art Experience', 
              description: 'Scan artworks throughout the hotel',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            },
            { 
              href: '/about', 
              label: 'For Hotel Guests', 
              description: 'Art viewing during your stay',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            },
            { 
              href: '/collection', 
              label: 'Rotating Collection', 
              description: 'New artworks regularly added',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            }
          ]
        },
        {
          title: 'Connect & Events',
          items: [
            { 
              href: '/contact', 
              label: 'Contact Gallery', 
              description: 'Contact our gallery team',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            },
            { 
              href: '/contact?subject=private-viewing', 
              label: 'Private View Events', 
              description: 'Exclusive gallery openings',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            },
            { 
              href: '/contact', 
              label: 'Collector Network', 
              description: 'Connect with fellow collectors',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            },
            { 
              href: '/contact', 
              label: 'Gallery Newsletter', 
              description: 'Latest artworks and events',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            }
          ]
        }
      ],
      featured: {
        title: 'Where History Lives',
        artist: 'Palé Hall, Wales',
        description: 'This Victorian mansion has witnessed centuries of Welsh culture. From its architectural grandeur to its storied past, every room tells a tale of artistic patronage.',
        href: '/about',
        price: 'Living History'
      }
    },
    Family: {
      sections: [
        {
          title: 'Palé Hall Family',
          items: [
            { 
              href: 'https://palehall.co.uk', 
              label: 'Palé Hall Hotel', 
              description: 'Luxury boutique hotel in Snowdonia',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            },
            { 
              href: '/collection', 
              label: 'Art Collection', 
              description: 'Contemporary art gallery',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            }
          ]
        },
        {
          title: 'Experiences',
          items: [
            { 
              href: 'https://palehall.co.uk/dining', 
              label: 'Fine Dining', 
              description: 'Award-winning restaurant',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            },
            { 
              href: 'https://palehall.co.uk/spa', 
              label: 'Spa & Wellness', 
              description: 'Luxury spa treatments',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            },
            { 
              href: 'https://palehall.co.uk/activities', 
              label: 'Activities', 
              description: 'Snowdonia adventures',
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            }
          ]
        }
      ],
      featured: {
        title: 'Palé Hall Estate',
        artist: 'Luxury in Snowdonia',
        description: 'Discover the complete Palé Hall experience - from our award-winning hotel and restaurant to our contemporary art collection, all set within the breathtaking Welsh countryside.',
        href: 'https://palehall.co.uk',
        price: 'Visit Our Family'
      }
    }
  }

  const navLinks = [
    { href: '/collection', label: 'Collection' },
    { href: '/artists', label: 'Artists' },
    { href: '/how-to-buy', label: 'Acquire' },
    { href: '/about', label: 'About' }
  ]

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 bg-white shadow-luxe border-b border-gold-200/30`}>
        <nav className="container-luxury">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <Link href="/" className="group relative z-10 flex items-center space-x-4">
              <div className="relative w-12 h-12 lg:w-14 lg:h-14">
                <Image
                  src="/Logos/Art_At_Pale_Square_Icon.png.avif"
                  alt="Art at Palé Hall Logo"
                  width={60}
                  height={60}
                  priority
                  quality={80}
                  className="object-contain transition-all duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="font-display transition-all duration-300 group-hover:text-gold-500"
                    style={{
                      color: '#2a352a' // forest-900
                    }}>
                  Palé Hall
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="font-accent transition-all duration-300"
                        style={{
                          color: '#B88A00' // gold-600
                        }}>
                    Art Collection
                  </span>
                  <div className="w-6 h-px bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-300 group-hover:w-10"></div>
                </div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-12">
              {navLinks.map((link) => (
                <div 
                  key={link.href}
                  className="relative group"
                  onMouseEnter={() => handleMegaMenuEnter(link.label)}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <Link 
                    href={link.href} 
                    className="relative flex items-center space-x-1 py-2"
                    style={{
                      color: '#2a352a' // forest-900
                    }}
                    onClick={() => setActiveMegaMenu(null)}
                  >
                    <span className="font-body tracking-wide">{link.label}</span>
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </div>
              ))}
              {/* Family Website Switcher */}
              <div 
                className="relative group"
                onMouseEnter={() => handleMegaMenuEnter('Family')}
                onMouseLeave={handleMegaMenuLeave}
              >
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gold-300/30 bg-gold-50/20 hover:bg-gold-50/40 transition-all duration-300">
                  <div className="relative w-5 h-5">
                    <Image
                      src="/Logos/Pale_Hall_DarkGreen_Square_Icon.png"
                      alt="Palé Hall Family"
                      width={60}
                      height={60}
                      quality={80}
                    />
                  </div>
                  <span style={{
                        color: '#2a352a' // forest-900
                      }}>
                    Family
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${activeMegaMenu === 'Family' ? 'rotate-180' : ''}`}
                    style={{
                      fill: 'none',
                      stroke: '#2a352a' // forest-900
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Cart and Account */}
              <div className="flex items-center space-x-4 ml-8 border-l pl-8 border-gold-200/30">
                <Link
                  href="/cart"
                  className="relative p-2 hover:bg-gold-50/50 rounded-lg transition-all duration-300"
                >
                  <ShoppingBag className="w-5 h-5 text-forest" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                
                {loading ? (
                  <div className="w-5 h-5 animate-pulse bg-sage-light rounded-full" />
                ) : user ? (
                  <Link
                    href="/account"
                    className="p-2 hover:bg-gold-50/50 rounded-lg transition-all duration-300"
                  >
                    <User className="w-5 h-5 text-forest" />
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-forest hover:text-gold transition-colors"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Navigation (Hamburger) */}
            <div className="lg:hidden flex items-center">
              <button 
                className={`flex flex-col justify-center items-center w-10 h-10 space-y-1 relative z-[210] transition-all duration-300 ${isMenuOpen ? 'fixed right-6' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className={`transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
                      style={{
                        width: '1.5rem', 
                        height: '0.125rem', 
                        backgroundColor: '#2a352a' // forest-900
                      }}></span>
                <span className={`transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}
                      style={{
                        width: '1.5rem', 
                        height: '0.125rem', 
                        backgroundColor: '#2a352a' // forest-900
                      }}></span>
                <span className={`transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
                      style={{
                        width: '1.5rem', 
                        height: '0.125rem', 
                        backgroundColor: '#2a352a' // forest-900
                      }}></span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-white z-[200] flex flex-col pt-[88px] overflow-y-auto"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex flex-col flex-grow">
            {/* E-commerce Actions - Prominent at top */}
            <div className="bg-gold-50/30 border-b border-gold-200/30 px-4 py-4 space-y-3">
              <Link
                href="/cart"
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gold-200/50 hover:border-gold-400 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-6 h-6 text-gold-600" />
                  <span className="font-body text-lg font-medium text-forest-900">Shopping Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-gold-600 text-white text-sm font-medium rounded-full h-6 w-6 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {loading ? (
                <div className="p-3 bg-white rounded-lg border border-cream-300">
                  <div className="w-full h-6 animate-pulse bg-sage-light rounded" />
                </div>
              ) : user ? (
                <Link
                  href="/account"
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gold-200/50 hover:border-gold-400 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-gold-600" />
                    <span className="font-body text-lg font-medium text-forest-900">My Account</span>
                  </div>
                  <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center p-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 mr-2" />
                  <span className="font-body text-lg font-medium">Sign In</span>
                </Link>
              )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 flex flex-col py-6 px-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-display text-2xl text-forest-900 hover:text-gold-700 transition-colors duration-300 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-gold-200/30 pt-4 mt-4">
                <a
                  href="https://palehall.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="relative w-8 h-8">
                    <Image
                      src="/Logos/Pale_Hall_DarkGreen_Square_Icon.png"
                      alt="Palé Hall Hotel"
                      width={32}
                      height={32}
                      quality={80}
                    />
                  </div>
                  <span className="font-display text-xl text-forest-900 hover:text-gold-700 transition-colors duration-300">
                    Palé Hall Hotel
                  </span>
                </a>
              </div>
            </nav>

            {/* Footer Info */}
            <div className="mt-auto border-t border-gold-200/30 py-6 px-4 bg-cream-50/50">
              <div className="space-y-3 text-sm text-forest-700">
                <Link 
                  href="/contact" 
                  className="flex items-center space-x-2 hover:text-gold-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Contact Gallery</span>
                </Link>
                <Link 
                  href="/how-to-buy" 
                  className="flex items-center space-x-2 hover:text-gold-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>How to Purchase</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu */}
      {activeMegaMenu && megaMenus[activeMegaMenu as keyof typeof megaMenus] && (
        <div 
          className="fixed top-[88px] left-0 right-0 z-[90] bg-white shadow-luxe border-b border-gold-200/30"
          onMouseEnter={() => handleMegaMenuEnter(activeMegaMenu)}
          onMouseLeave={handleMegaMenuLeave}
        >
          <div className="container-luxury py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Menu Sections */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {megaMenus[activeMegaMenu as keyof typeof megaMenus].sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-4">
                      <h3 className="font-display text-lg font-medium text-forest-900 border-b border-gold-200/50 pb-2">
                        {section.title}
                      </h3>
                      <ul className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            <Link 
                              href={item.href}
                              className="group flex items-start space-x-3 p-2 rounded-lg hover:bg-gold-50/50 transition-all duration-300"
                            >
                              <div className="text-gold-600 mt-0.5 transition-colors duration-300 group-hover:text-gold-700">
                                {item.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-body font-medium text-forest-900 transition-colors duration-300 group-hover:text-gold-700">
                                  {item.label}
                                </div>
                                <div className="text-sm text-forest-600 mt-1">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Section */}
              {megaMenus[activeMegaMenu as keyof typeof megaMenus].featured && (
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-gold-50/50 to-cream-50/50 rounded-lg p-6 border border-gold-200/30">
                    <Link 
                      href={megaMenus[activeMegaMenu as keyof typeof megaMenus].featured.href}
                      className="group block space-y-4 hover:scale-105 transition-transform duration-300"
                    >
                      <div className="space-y-2">
                        <h4 className="font-display text-lg font-medium text-forest-900 group-hover:text-gold-700 transition-colors duration-300">
                          {megaMenus[activeMegaMenu as keyof typeof megaMenus].featured.title}
                        </h4>
                        <div className="text-sm font-accent text-gold-600">
                          {megaMenus[activeMegaMenu as keyof typeof megaMenus].featured.artist}
                        </div>
                      </div>
                      <p className="text-sm text-forest-700 leading-relaxed">
                        {megaMenus[activeMegaMenu as keyof typeof megaMenus].featured.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gold-600">
                          {megaMenus[activeMegaMenu as keyof typeof megaMenus].featured.price}
                        </span>
                        <svg className="w-4 h-4 text-gold-600 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}