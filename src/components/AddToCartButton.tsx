'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingBag, Check } from 'lucide-react'

interface AddToCartButtonProps {
  productId: string
  productName: string
  quantity?: number
  className?: string
}

export default function AddToCartButton({ 
  productId, 
  productName, 
  quantity = 1,
  className = ''
}: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/collection/${productId}`)
      return
    }

    setIsAdding(true)
    try {
      await addToCart(productId, quantity)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 3000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert(error instanceof Error ? error.message : 'Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  if (justAdded) {
    return (
      <button
        disabled
        className={`btn-primary w-full bg-green-600 border-green-700 hover:bg-green-700 ${className}`}
      >
        <Check className="mr-2 h-5 w-5" />
        Added to Cart
      </button>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`btn-primary w-full disabled:opacity-50 ${className}`}
    >
      <ShoppingBag className="mr-2 h-5 w-5" />
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}