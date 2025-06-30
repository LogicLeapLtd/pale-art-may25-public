'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Calendar, User, Package, CheckCircle, Clock, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  createdAt: string
  product: {
    id: string
    name: string
    artist: string | null
    price: string
  } | null
}

export default function EnquiriesAdminPage() {
  const router = useRouter()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded' | 'closed'>('all')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and is admin
    const checkAuth = async () => {
      try {
        const authResponse = await fetch('/api/auth/me')
        if (!authResponse.ok) {
          router.push('/auth/login?redirect=/admin/enquiries&error=admin_required')
          return
        }

        const adminResponse = await fetch('/api/auth/check-admin')
        if (!adminResponse.ok) {
          router.push('/auth/login?redirect=/admin/enquiries&error=admin_required')
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
        router.push('/auth/login?redirect=/admin/enquiries&error=admin_required')
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!isCheckingAuth) {
      fetchEnquiries()
    }
  }, [isCheckingAuth])

  const fetchEnquiries = async () => {
    try {
      const response = await fetch('/api/admin/enquiries')
      if (response.ok) {
        const data = await response.json()
        setEnquiries(data)
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateEnquiryStatus = async (enquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setEnquiries(prev => prev.map(enq => 
          enq.id === enquiryId ? { ...enq, status: newStatus } : enq
        ))
      }
    } catch (error) {
      console.error('Error updating enquiry:', error)
    }
  }

  const filteredEnquiries = enquiries.filter(enq => {
    if (filter === 'all') return true
    return enq.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'responded':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'responded':
        return <Mail className="h-4 w-4" />
      case 'closed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-sage">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="container-luxury">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-forest-900 mb-2">Enquiry Management</h1>
          <p className="text-sage">Manage customer enquiries about artworks and pricing</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-soft mb-8">
          <div className="border-b border-cream-200">
            <nav className="-mb-px flex">
              {(['all', 'pending', 'responded', 'closed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`py-4 px-6 text-sm font-medium capitalize border-b-2 transition-colors ${
                    filter === status
                      ? 'border-gold-600 text-gold-600'
                      : 'border-transparent text-sage hover:text-forest hover:border-gray-300'
                  }`}
                >
                  {status} ({enquiries.filter(e => status === 'all' || e.status === status).length})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Enquiries List */}
        <div className="space-y-4">
          {filteredEnquiries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-soft p-12 text-center">
              <Mail className="h-12 w-12 text-sage mx-auto mb-4" />
              <p className="text-lg text-forest-900">No enquiries found</p>
              <p className="text-sm text-sage mt-2">
                {filter !== 'all' && `Try selecting a different filter`}
              </p>
            </div>
          ) : (
            filteredEnquiries.map((enquiry) => (
              <div key={enquiry.id} className="bg-white rounded-lg shadow-soft overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                        {getStatusIcon(enquiry.status)}
                        <span className="ml-1">{enquiry.status}</span>
                      </span>
                      <span className="text-sm text-sage flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {/* Status Actions */}
                    <div className="flex items-center space-x-2">
                      {enquiry.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateEnquiryStatus(enquiry.id, 'responded')}
                            className="text-sm px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md"
                          >
                            Mark Responded
                          </button>
                          <button
                            onClick={() => updateEnquiryStatus(enquiry.id, 'closed')}
                            className="text-sm px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md"
                          >
                            Close
                          </button>
                        </>
                      )}
                      {enquiry.status === 'responded' && (
                        <button
                          onClick={() => updateEnquiryStatus(enquiry.id, 'closed')}
                          className="text-sm px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                          Close
                        </button>
                      )}
                      {enquiry.status === 'closed' && (
                        <button
                          onClick={() => updateEnquiryStatus(enquiry.id, 'pending')}
                          className="text-sm px-3 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-md"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-sage mb-2">Customer Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-sage" />
                          <span className="font-medium text-forest-900">{enquiry.name}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-sage" />
                          <a href={`mailto:${enquiry.email}`} className="text-gold-600 hover:text-gold-700">
                            {enquiry.email}
                          </a>
                        </div>
                        {enquiry.phone && (
                          <div className="flex items-center text-sm">
                            <span className="h-4 w-4 mr-2 text-sage">📞</span>
                            <a href={`tel:${enquiry.phone}`} className="text-gold-600 hover:text-gold-700">
                              {enquiry.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {enquiry.product && (
                      <div>
                        <h3 className="text-sm font-medium text-sage mb-2">Artwork Details</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Package className="h-4 w-4 mr-2 text-sage" />
                            <span className="font-medium text-forest-900">{enquiry.product.name}</span>
                          </div>
                          {enquiry.product.artist && (
                            <div className="text-sm text-sage ml-6">
                              by {enquiry.product.artist}
                            </div>
                          )}
                          <div className="text-sm text-sage ml-6">
                            Price: {enquiry.product.price}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <h3 className="text-sm font-medium text-sage mb-2">Message</h3>
                    <div className="bg-cream-50 rounded-lg p-4">
                      <p className="text-sm text-forest-700 whitespace-pre-wrap">{enquiry.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}