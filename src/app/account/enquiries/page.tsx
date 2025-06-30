'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowLeft, Mail, Calendar, Eye } from 'lucide-react'

type Enquiry = {
  id: string
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
  artworkId?: string | null
  artworkName?: string | null
  status: string
  createdAt: string
  updatedAt: string
  product?: {
    name: string
    artist?: string | null
    localImagePath?: string | null
  } | null
}

export default function EnquiriesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loadingEnquiries, setLoadingEnquiries] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchEnquiries()
    }
  }, [user])

  const fetchEnquiries = async () => {
    try {
      const response = await fetch('/api/user/enquiries')
      if (response.ok) {
        const data = await response.json()
        setEnquiries(data)
      } else {
        console.error('Failed to fetch enquiries')
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error)
    } finally {
      setLoadingEnquiries(false)
    }
  }

  if (loading || loadingEnquiries) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-sage">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'responded':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-cream-light py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/account" 
            className="inline-flex items-center text-sage hover:text-forest mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Account
          </Link>
          <h1 className="text-3xl font-accent text-forest">My Enquiries</h1>
          <p className="mt-2 text-sage">View all your artwork enquiries</p>
        </div>

        {enquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8 text-center">
            <Mail className="h-12 w-12 text-sage mx-auto mb-4" />
            <h3 className="text-lg font-medium text-forest mb-2">No enquiries yet</h3>
            <p className="text-sage mb-6">
              When you enquire about artworks, they'll appear here.
            </p>
            <Link href="/collection" className="btn-primary">
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {enquiries.map((enquiry) => (
              <div 
                key={enquiry.id} 
                className="bg-white rounded-lg shadow-soft p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-forest">
                      {enquiry.artworkName || enquiry.subject}
                    </h3>
                    {enquiry.product?.artist && (
                      <p className="text-sm text-sage">by {enquiry.product.artist}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(enquiry.status)}`}>
                    {enquiry.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-sage mb-1">Enquiry Date</p>
                    <p className="text-sm text-forest flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(enquiry.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {enquiry.product && (
                    <div>
                      <p className="text-sm text-sage mb-1">Artwork</p>
                      <Link 
                        href={`/artwork/${enquiry.artworkId}`}
                        className="text-sm text-gold hover:text-forest flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Artwork
                      </Link>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-sage mb-2">Your Message:</p>
                  <p className="text-sm text-forest whitespace-pre-wrap">{enquiry.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}