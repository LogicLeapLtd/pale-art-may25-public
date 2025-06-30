'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/lib/pricing'
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { items, total, loading, updateQuantity, removeFromCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      await updateQuantity(itemId, newQuantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleRemove = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      await removeFromCart(itemId)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth/login?redirect=/cart')
    } else {
      router.push('/checkout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-sage">Loading cart...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-light py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="h-16 w-16 text-sage-light mx-auto mb-4" />
          <h1 className="text-3xl font-accent text-forest mb-4">Your cart is empty</h1>
          <p className="text-sage mb-8">Discover our carefully curated collection of artworks.</p>
          <Link
            href="/collection"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-forest hover:bg-forest-dark"
          >
            Browse Collection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-light py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-accent text-forest mb-8">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-soft">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 border-b last:border-b-0 ${
                    updatingItems.has(item.id) ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {item.product.localImagePath && (
                      <Link href={`/collection/${item.productId}`}>
                        <Image
                          src={item.product.localImagePath}
                          alt={item.product.name}
                          width={120}
                          height={120}
                          className="object-cover rounded"
                        />
                      </Link>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link 
                            href={`/artwork/${item.productId}`}
                            className="text-lg font-medium text-forest hover:text-gold"
                          >
                            {item.product.name}
                          </Link>
                          {item.product.artist && (
                            <p className="text-sm text-sage italic mt-1">
                              by {item.product.artist}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="text-sage hover:text-red-600 p-1"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                            className="p-1 border rounded hover:bg-gold-50 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className="font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.id)}
                            className="p-1 border rounded hover:bg-gold-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-medium text-forest">
                            {formatPrice(item.itemTotal)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-sage">
                              {item.priceInfo.display} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-soft p-6 sticky top-6">
              <h2 className="text-xl font-medium text-forest mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sage">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sage">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-medium text-forest">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="btn-primary w-full flex items-center justify-center"
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              
              <Link
                href="/collection"
                className="block text-center mt-4 text-sm text-sage hover:text-forest"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}