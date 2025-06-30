'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/lib/pricing'
import { ArrowLeft, Truck, Hotel, CreditCard, Plus } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const SHIPPING_RATE = 2500 // £25 in pence
const SHIPPING_DISPLAY = '£25.00'

interface Address {
  id: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  postalCode: string
  country: string
  isDefault: boolean
}

export default function CheckoutPage() {
  const { items, total, loading: cartLoading } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'collection'>('shipping')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }

    fetchAddresses()
  }, [user, router])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
        // Select default address if available
        const defaultAddr = data.find((addr: Address) => addr.isDefault)
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id)
        } else if (data.length > 0) {
          setSelectedAddress(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!selectedAddress && deliveryMethod === 'shipping') {
      setError('Please select a delivery address')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          addressId: deliveryMethod === 'shipping' ? selectedAddress : null,
          deliveryMethod,
          includeShipping: deliveryMethod === 'shipping'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setProcessing(false)
    }
  }

  const subtotal = total
  const shipping = deliveryMethod === 'shipping' ? SHIPPING_RATE : 0
  const finalTotal = subtotal + shipping

  if (loading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-sage">Loading checkout...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-forest-900 mb-4">Your cart is empty</h1>
          <Link href="/collection" className="text-gold-600 hover:text-gold-700">
            Return to collection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="container-luxury max-w-6xl">
        <Link 
          href="/cart" 
          className="inline-flex items-center text-sage hover:text-forest mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-display text-forest-900 mb-8">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Method */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h2 className="text-xl font-medium text-forest-900 mb-4">Delivery Method</h2>
              
              <div className="space-y-3">
                <label className="block cursor-pointer">
                  <div className={`border rounded-lg p-4 transition-colors ${
                    deliveryMethod === 'shipping' ? 'border-gold-500 bg-gold-50' : 'border-gold-200'
                  }`}>
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="delivery"
                        value="shipping"
                        checked={deliveryMethod === 'shipping'}
                        onChange={(e) => setDeliveryMethod(e.target.value as 'shipping')}
                        className="mt-1 text-gold-600 focus:ring-gold-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Truck className="h-5 w-5 mr-2 text-sage" />
                            <span className="font-medium">Shipping</span>
                          </div>
                          <span className="font-medium text-forest-900">{SHIPPING_DISPLAY}</span>
                        </div>
                        <p className="text-sm text-sage mt-1">
                          Secure packaging and tracked delivery
                        </p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="block cursor-pointer">
                  <div className={`border rounded-lg p-4 transition-colors ${
                    deliveryMethod === 'collection' ? 'border-gold-500 bg-gold-50' : 'border-gold-200'
                  }`}>
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="delivery"
                        value="collection"
                        checked={deliveryMethod === 'collection'}
                        onChange={(e) => setDeliveryMethod(e.target.value as 'collection')}
                        className="mt-1 text-gold-600 focus:ring-gold-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Hotel className="h-5 w-5 mr-2 text-sage" />
                            <span className="font-medium">Collection from Palé Hall</span>
                          </div>
                          <span className="font-medium text-forest-900">Free</span>
                        </div>
                        <p className="text-sm text-sage mt-1">
                          Collect your artwork in person at our stunning location
                        </p>
                        <a 
                          href="https://palehall.co.uk" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-gold-600 hover:text-gold-700 mt-2 inline-block"
                        >
                          Stay at Palé Hall →
                        </a>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Delivery Address (only show if shipping) */}
            {deliveryMethod === 'shipping' && (
              <div className="bg-white rounded-lg shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-forest-900">Delivery Address</h2>
                  <Link 
                    href="/account/addresses?redirect=/checkout"
                    className="inline-flex items-center text-sm text-gold-600 hover:text-gold-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Address
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sage mb-4">No addresses saved</p>
                    <Link 
                      href="/account/addresses?redirect=/checkout"
                      className="btn-primary inline-flex items-center"
                    >
                      Add Address
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label key={address.id} className="block cursor-pointer">
                        <div className={`border rounded-lg p-4 transition-colors ${
                          selectedAddress === address.id ? 'border-gold-500 bg-gold-50' : 'border-gold-200'
                        }`}>
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="address"
                              value={address.id}
                              checked={selectedAddress === address.id}
                              onChange={(e) => setSelectedAddress(e.target.value)}
                              className="mt-1 text-gold-600 focus:ring-gold-500"
                            />
                            <div className="ml-3">
                              <p className="font-medium text-forest-900">{address.line1}</p>
                              {address.line2 && <p className="text-sm text-sage">{address.line2}</p>}
                              <p className="text-sm text-sage">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className="text-sm text-sage">{address.country}</p>
                              {address.isDefault && (
                                <span className="inline-block mt-2 text-xs px-2 py-1 bg-gold-100 text-gold-800 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h2 className="text-xl font-medium text-forest-900 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    {item.product.localImagePath && (
                      <Image
                        src={item.product.localImagePath}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-forest-900">{item.product.name}</h3>
                      {item.product.artist && (
                        <p className="text-sm text-sage italic">{item.product.artist}</p>
                      )}
                      <p className="text-sm text-sage mt-1">
                        Quantity: {item.quantity} × {item.priceInfo.display}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-forest-900">{formatPrice(item.itemTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-soft p-6 sticky top-6">
              <h2 className="text-xl font-medium text-forest-900 mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sage">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sage">
                  <span>Shipping</span>
                  <span>{shipping > 0 ? formatPrice(shipping) : 'Free'}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-medium text-forest-900">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleCheckout}
                disabled={processing || (deliveryMethod === 'shipping' && !selectedAddress)}
                className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                {processing ? 'Processing...' : 'Proceed to Payment'}
              </button>
              
              <p className="text-xs text-center text-sage mt-4">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}