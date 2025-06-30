'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { parsePrice, PriceInfo } from '@/lib/pricing'
import CartSidebar from '@/components/CartSidebar'

interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  createdAt: Date
  updatedAt: Date
  product: {
    id: string
    name: string
    price: string
    artist?: string | null
    localImagePath?: string | null
    status?: string | null
  }
  priceInfo: PriceInfo
  itemTotal: number
}

interface CartContextType {
  items: CartItem[]
  total: number
  count: number
  loading: boolean
  sidebarOpen: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  openSidebar: () => void
  closeSidebar: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([])
      setTotal(0)
      setCount(0)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
        setTotal(data.total)
        setCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) throw new Error('Must be logged in to add to cart')

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add to cart')
    }

    await fetchCart()
    setSidebarOpen(true) // Open sidebar after adding to cart
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update quantity')
    }

    await fetchCart()
  }

  const removeFromCart = async (itemId: string) => {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to remove from cart')
    }

    await fetchCart()
  }

  const clearCart = async () => {
    const response = await fetch('/api/cart', {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to clear cart')
    }

    await fetchCart()
  }

  const openSidebar = () => setSidebarOpen(true)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <CartContext.Provider value={{
      items,
      total,
      count,
      loading,
      sidebarOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: fetchCart,
      openSidebar,
      closeSidebar
    }}>
      {children}
      <CartSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}