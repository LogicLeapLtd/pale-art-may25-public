'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  LogOut, 
  ShoppingBag,
  Mail,
  Shield
} from 'lucide-react'

export default function AccountPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Check if user is admin
      checkAdminStatus()
    }
  }, [user])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/check-admin')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-sage">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const accountLinks = [
    {
      title: 'My Orders',
      description: 'View your order history and track deliveries',
      href: '/account/orders',
      icon: Package
    },
    {
      title: 'Wishlist',
      description: 'Items you\'ve saved for later',
      href: '/account/wishlist',
      icon: Heart
    },
    {
      title: 'Addresses',
      description: 'Manage your delivery addresses',
      href: '/account/addresses',
      icon: MapPin
    },
    {
      title: 'Profile',
      description: 'Update your personal information',
      href: '/account/profile',
      icon: User
    },
    {
      title: 'Enquiries',
      description: 'View your artwork enquiries',
      href: '/account/enquiries',
      icon: Mail
    }
  ]

  return (
    <div className="min-h-screen bg-cream-light py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-accent text-forest">My Account</h1>
              <p className="mt-2 text-sage">Welcome back, {user.name}</p>
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-forest text-white rounded-md hover:bg-forest/90 transition-colors"
              >
                <Shield className="h-5 w-5 mr-2" />
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accountLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white p-6 rounded-lg shadow-soft hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-forest">
                      {link.title}
                    </h3>
                    <p className="mt-1 text-sm text-sage">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 border-t pt-6">
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-sage hover:text-forest transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  )
}