'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/pricing'

type Artwork = {
  id: string
  name: string
  artist: string | null
  status: string | null
  price: string
  slug: string | null
  createdAt: Date
  updatedAt: Date
  originalImageUrl: string
  originalProductUrl: string
  localImagePath: string | null
  description: string | null
  dimensions: string | null
  medium: string | null
  year: string | null
  featured: boolean
  category: string | null
  qrCodeUrl?: string
  revenue?: number
  unitsSold?: number
}

type Artist = {
  id: string
  name: string
  slug: string
  title: string
  biography: string
  portfolioUrl?: string | null
  imageUrl?: string | null
  featured?: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and is admin
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
    if (!isCheckingAuth) {
      setMounted(true)
      
      // Load data from database
      const loadData = async () => {
        try {
          const [artworksResponse, artistsResponse, activitiesResponse, enquiriesResponse, revenueResponse] = await Promise.all([
            fetch('/api/artworks/all-admin'),
            fetch('/api/artists'),
            fetch('/api/activities?limit=10'),
            fetch('/api/enquiries'),
            fetch('/api/admin/revenue?period=all')
          ])
          
          if (artworksResponse.ok && artistsResponse.ok) {
            const artworksData = await artworksResponse.json()
            const artistsData = await artistsResponse.json()
            
            // Merge revenue data with artworks
            if (revenueResponse.ok) {
              const revenue = await revenueResponse.json()
              setRevenueData(revenue)
              
              // Add revenue data to artworks
              const artworksWithRevenue = artworksData.map((artwork: Artwork) => {
                const revenueItem = revenue.byArtwork.find((r: any) => r.artworkId === artwork.id)
                return {
                  ...artwork,
                  revenue: revenueItem?.revenue || 0,
                  unitsSold: revenueItem?.unitsSold || 0
                }
              })
              
              setArtworks(artworksWithRevenue)
            } else {
              setArtworks(artworksData)
            }
            
            setArtists(artistsData)
          }
          
          if (activitiesResponse.ok) {
            const activitiesData = await activitiesResponse.json()
            setActivities(activitiesData)
          }
          
          if (enquiriesResponse.ok) {
            const enquiriesData = await enquiriesResponse.json()
            setEnquiries(enquiriesData)
          }
        } catch (error) {
          console.error('Error loading data:', error)
        } finally {
          setLoading(false)
        }
      }
      
      loadData()
    }
  }, [isCheckingAuth])

  if (isCheckingAuth || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-sage">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      {/* Overview Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-elegant font-semibold text-forest-900">Dashboard Overview</h2>
          <p className="text-sm text-forest-600">Last updated: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        
        {/* Stats Cards - Mobile Stacked */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200 hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => router.push('/admin')}>
            <div className="flex items-center">
              <div className="p-2 bg-forest-100 rounded-lg">
                <svg className="w-6 h-6 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-forest-600">Total Artworks</p>
                <p className="text-2xl font-bold text-forest-900">{artworks.length}</p>
                <p className="text-xs text-forest-500">Click to manage</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200">
            <div className="flex items-center">
              <div className="p-2 bg-gold-100 rounded-lg">
                <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-forest-600">Artists</p>
                <p className="text-2xl font-bold text-forest-900">{artists.length}</p>
                <p className="text-xs text-forest-500">Featured: Mfikela Jean Samuel</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-forest-600">Available</p>
                <p className="text-2xl font-bold text-forest-900">
                  {artworks.filter(a => a.status === 'available').length}
                </p>
                <p className="text-xs text-forest-500">Ready for sale</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-forest-600">Sold</p>
                <p className="text-2xl font-bold text-forest-900">
                  {artworks.filter(a => a.status === 'sold').length}
                </p>
                <p className="text-xs text-forest-500">Collection value realized</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Metrics Row */}
        {revenueData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200">
              <div className="flex items-center">
                <div className="p-2 bg-gold-100 rounded-lg">
                  <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-forest-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-forest-900">
                    {formatPrice(revenueData.metrics.totalRevenue * 100)}
                  </p>
                  <p className="text-xs text-forest-500">All time</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-forest-600">Total Orders</p>
                  <p className="text-2xl font-bold text-forest-900">{revenueData.metrics.totalOrders}</p>
                  <p className="text-xs text-forest-500">Completed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-forest-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-forest-900">
                    {formatPrice(revenueData.metrics.averageOrderValue * 100)}
                  </p>
                  <p className="text-xs text-forest-500">Per order</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-forest-600">Best Seller</p>
                  <p className="text-sm font-bold text-forest-900 line-clamp-1">
                    {revenueData.topSelling[0]?.artwork?.name || 'No sales yet'}
                  </p>
                  <p className="text-xs text-forest-500">
                    {revenueData.topSelling[0] ? formatPrice(revenueData.topSelling[0].revenue * 100) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-cream-200 p-6">
          <h3 className="font-semibold text-forest-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            <a
              href="/admin/batch-upload"
              className="flex flex-col items-center p-4 bg-forest-50 rounded-lg hover:bg-forest-100 transition-colors"
            >
              <svg className="w-8 h-8 text-forest-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-forest-700">Add Artworks</span>
            </a>
            
            <a
              href="/admin/qr-print-pro"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="text-sm font-medium text-forest-700">QR Printing Pro</span>
            </a>
            
            <a
              href="/admin/leaflet-generator"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-forest-700">Leaflet Generator</span>
            </a>

            <a
              href="/admin/sales"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-forest-700">Sales Dashboard</span>
            </a>
            
            <a
              href="/admin/purchases"
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-sm font-medium text-forest-700">Purchase Management</span>
            </a>
          </div>
          
          <h3 className="font-semibold text-forest-900 mb-4">Management Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <a
              href="/admin/users"
              className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <svg className="w-8 h-8 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium text-forest-700">User Management</span>
            </a>
            
            <a
              href="/admin/collections"
              className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <svg className="w-8 h-8 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-medium text-forest-700">Collections</span>
            </a>
            
            <a
              href="/admin/enquiries"
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-forest-700">Enquiries</span>
              {enquiries.filter(e => e.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {enquiries.filter(e => e.status === 'pending').length}
                </span>
              )}
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-cream-200 p-6">
          <h3 className="font-semibold text-forest-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-gold-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <span className="text-forest-700">{activity.title}</span>
                  <span className="text-forest-500 ml-2 text-xs">
                    {new Date(activity.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-forest-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-cream-200 p-6">
          <h3 className="font-semibold text-forest-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-forest-600">{enquiries.filter(e => e.status === 'pending').length}</p>
              <p className="text-sm text-forest-600">Pending Enquiries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gold-600">{artworks.filter(a => a.featured).length}</p>
              <p className="text-sm text-forest-600">Featured Artworks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-forest-600">{artists.filter(a => a.featured).length}</p>
              <p className="text-sm text-forest-600">Featured Artists</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-forest-600">{new Set(artworks.map(a => a.medium).filter(Boolean)).size}</p>
              <p className="text-sm text-forest-600">Art Mediums</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg border border-cream-200 p-6">
          <h3 className="font-semibold text-forest-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="/"
              target="_blank"
              className="flex items-center justify-between p-3 bg-forest-50 rounded-lg hover:bg-forest-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm font-medium text-forest-700">View Homepage</span>
              </div>
              <svg className="w-4 h-4 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <a
              href="/collection"
              target="_blank"
              className="flex items-center justify-between p-3 bg-forest-50 rounded-lg hover:bg-forest-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-forest-700">Public Collection</span>
              </div>
              <svg className="w-4 h-4 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <a
              href="/artists"
              target="_blank"
              className="flex items-center justify-between p-3 bg-forest-50 rounded-lg hover:bg-forest-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-forest-700">Artists Gallery</span>
              </div>
              <svg className="w-4 h-4 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <a
              href="/artists/mfikela-jean-samuel"
              target="_blank"
              className="flex items-center justify-between p-3 bg-gold-50 rounded-lg hover:bg-gold-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-sm font-medium text-forest-700">Featured Artist</span>
              </div>
              <svg className="w-4 h-4 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}