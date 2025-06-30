'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/pricing'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, total, updateQuantity, removeFromCart } = useCart()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity z-50 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-cream-200">
            <h2 className="text-xl font-display text-forest-900">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-sage" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-sage-light mx-auto mb-4" />
                <p className="text-lg text-forest-900 mb-2">Your cart is empty</p>
                <p className="text-sm text-sage mb-6">Discover our carefully curated collection</p>
                <Link
                  href="/collection"
                  onClick={onClose}
                  className="btn-primary inline-block"
                >
                  Browse Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-cream-50 rounded-lg p-4 ${
                      updatingItems.has(item.id) ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {item.product.localImagePath && (
                        <Link 
                          href={`/collection/${item.productId}`}
                          onClick={onClose}
                          className="flex-shrink-0"
                        >
                          <Image
                            src={item.product.localImagePath}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="object-cover rounded"
                          />
                        </Link>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <div>
                            <Link 
                              href={`/collection/${item.productId}`}
                              onClick={onClose}
                              className="font-medium text-forest-900 hover:text-gold-600"
                            >
                              {item.product.name}
                            </Link>
                            {item.product.artist && (
                              <p className="text-sm text-sage italic">
                                by {item.product.artist}
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={updatingItems.has(item.id)}
                            className="text-sage hover:text-red-600 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                              className="p-1 border border-gold-200 rounded hover:bg-gold-50 disabled:opacity-50"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            
                            <span className="font-medium w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updatingItems.has(item.id)}
                              className="p-1 border border-gold-200 rounded hover:bg-gold-50"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <p className="font-medium text-forest-900">
                            {formatPrice(item.itemTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-cream-200 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-forest-900">Subtotal</span>
                <span className="text-lg font-medium text-forest-900">{formatPrice(total)}</span>
              </div>
              
              <p className="text-sm text-sage">Shipping calculated at checkout</p>
              
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="btn-primary w-full text-center block"
                >
                  Proceed to Checkout
                </Link>
                
                <button
                  onClick={onClose}
                  className="btn-secondary w-full"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}