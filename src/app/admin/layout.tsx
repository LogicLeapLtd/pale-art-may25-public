'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResponse = await fetch('/api/auth/me')
        if (!authResponse.ok) {
          router.push('/auth/login?redirect=/admin&error=admin_required')
          return
        }

        const adminResponse = await fetch('/api/auth/check-admin')
        if (!adminResponse.ok) {
          router.push('/auth/login?redirect=/admin&error=admin_required')
          return
        }

        const adminData = await adminResponse.json()
        if (!adminData.isAdmin) {
          router.push('/account')
          return
        }

        setIsCheckingAuth(false)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login?redirect=/admin&error=admin_required')
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
  }, [])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-sage">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/sales', label: 'Sales', icon: '💰' },
    { href: '/admin/purchases', label: 'Purchases', icon: '🛍️' },
    { href: '/admin/enquiries', label: 'Enquiries', icon: '✉️' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/qr-print-pro', label: 'QR Print Pro', icon: '🖨️' },
    { href: '/admin/collections', label: 'Collections', icon: '📚' },
    { href: '/admin/batch-upload', label: 'Batch Upload', icon: '📤' },
  ]

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {/* Admin Header */}
      <div className="bg-forest-900 text-cream-50 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-gold-300 text-sm">Palé Hall Art Collection Management</p>
          </div>
          <div className="text-right">
            <p className="text-cream-200 text-sm">{currentDate}</p>
            <p className="text-gold-400 text-xs">Welcome, Joanna</p>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white border-b border-cream-200 overflow-x-auto">
        <div className="flex min-w-max px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                pathname === item.href
                  ? 'border-gold-500 text-gold-600 bg-gold-50'
                  : 'border-transparent text-forest-600 hover:text-gold-600 hover:bg-cream-50'
              }`}
            >
              <span>{item.icon}</span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}