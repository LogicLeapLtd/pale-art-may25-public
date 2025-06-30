'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Package, ChevronLeft } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  currency: string
  createdAt: string
  paidAt: string | null
  items: {
    id: string
    quantity: number
    price: number
    total: number
    product: {
      id: string
      name: string
      artist: string | null
      localImagePath: string | null
    }
  }[]
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50'
      case 'shipped':
        return 'text-blue-600 bg-blue-50'
      case 'delivered':
        return 'text-forest bg-forest-light'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      case 'refunded':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-sage bg-sage-light'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency
    }).format(price)
  }

  if (loading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-sage">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream-light py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-sage hover:text-forest mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Account
          </Link>
          <h1 className="text-3xl font-accent text-forest">My Orders</h1>
          <p className="mt-2 text-sage">View your order history and track deliveries</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-12 text-center">
            <Package className="h-12 w-12 text-sage-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-forest mb-2">No orders yet</h3>
            <p className="text-sage mb-6">When you make your first purchase, it will appear here.</p>
            <Link
              href="/artworks"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-forest hover:bg-forest-dark"
            >
              Browse Artworks
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-soft overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-forest">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-sage">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="mt-2 text-lg font-semibold text-forest">
                        {formatPrice(order.total, order.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          {item.product.localImagePath && (
                            <img
                              src={item.product.localImagePath}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-forest">
                              {item.product.name}
                            </h4>
                            {item.product.artist && (
                              <p className="text-sm text-sage">by {item.product.artist}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-forest">
                              {formatPrice(item.price, order.currency)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-sage">Qty: {item.quantity}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-sm text-gold hover:text-forest"
                    >
                      View Details
                    </Link>
                    {order.status === 'delivered' && (
                      <button className="text-sm text-sage hover:text-forest">
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}