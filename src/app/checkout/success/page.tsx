'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      fetchOrderDetails(sessionId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const fetchOrderDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/orders/confirm?session_id=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setOrderDetails(data)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
          <p className="text-forest-600">Confirming your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-gold-50">
      <div className="container-luxury py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-display text-forest-900 mb-2">Order Confirmed!</h1>
            <p className="text-forest-600">Thank you for your purchase from Palé Hall Art Collection</p>
          </div>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-white rounded-lg shadow-luxe p-8 mb-8">
              <h2 className="text-xl font-medium text-forest-900 mb-4">Order Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-cream-200">
                  <span className="text-forest-600">Order ID</span>
                  <span className="font-medium text-forest-900">{orderDetails.orderId}</span>
                </div>
                
                <div className="flex justify-between py-3 border-b border-cream-200">
                  <span className="text-forest-600">Total Amount</span>
                  <span className="font-medium text-forest-900">£{orderDetails.total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between py-3">
                  <span className="text-forest-600">Status</span>
                  <span className="font-medium text-green-600 capitalize">{orderDetails.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-cream-100 rounded-lg p-8 mb-8">
            <h3 className="text-lg font-medium text-forest-900 mb-4">What Happens Next?</h3>
            <ul className="space-y-3 text-forest-600">
              <li className="flex items-start">
                <span className="text-gold-600 mr-2">•</span>
                You will receive an order confirmation email shortly
              </li>
              <li className="flex items-start">
                <span className="text-gold-600 mr-2">•</span>
                Our team will carefully prepare your artwork for shipping
              </li>
              <li className="flex items-start">
                <span className="text-gold-600 mr-2">•</span>
                You'll receive tracking information once your order ships
              </li>
              <li className="flex items-start">
                <span className="text-gold-600 mr-2">•</span>
                Expected delivery within 5-7 business days
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/collection"
              className="flex-1 btn-secondary text-center"
            >
              Continue Shopping
            </Link>
            
            <Link
              href="/account/orders"
              className="flex-1 btn-primary text-center flex items-center justify-center gap-2"
            >
              View Your Orders
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Contact Info */}
          <div className="text-center mt-12 text-sm text-forest-600">
            <p>Questions about your order?</p>
            <p>Contact us at <a href="mailto:art@palehall.co.uk" className="text-gold-600 hover:text-gold-700">art@palehall.co.uk</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
          <p className="text-forest-600">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}