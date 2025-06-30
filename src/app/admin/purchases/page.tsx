'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/pricing'
import { Package, Truck, Clock, CheckCircle, AlertCircle, MapPin } from 'lucide-react'

type OrderStatus = 'paid_for' | 'awaiting_shipping' | 'awaiting_collection' | 'on_route' | 'fulfilled'

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  paid_for: { label: 'Paid For', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  awaiting_shipping: { label: 'Awaiting Shipping', color: 'bg-yellow-100 text-yellow-800', icon: Package },
  awaiting_collection: { label: 'Awaiting Collection', color: 'bg-orange-100 text-orange-800', icon: MapPin },
  on_route: { label: 'On Route', color: 'bg-blue-100 text-blue-800', icon: Truck },
  fulfilled: { label: 'Fulfilled', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
}

type Order = {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  total: number
  shipping: number
  user: {
    name: string
    email: string
    phone?: string
  }
  shippingAddress?: {
    name: string
    line1: string
    line2?: string
    city: string
    county?: string
    postalCode: string
    country: string
  }
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      artist?: string
      localImagePath?: string
    }
  }[]
}

export default function PurchasesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      const updatedOrder = await response.json()
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: updatedOrder.status } : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sage">Loading purchases...</div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container-luxury">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-forest-900 mb-2">Purchase Management</h1>
          <p className="text-sage">Manage order statuses and track deliveries</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'all' 
                ? 'bg-forest-600 text-white' 
                : 'bg-white text-forest-700 hover:bg-cream-100'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = orders.filter(o => o.status === status).length
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status as OrderStatus)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  statusFilter === status 
                    ? 'bg-forest-600 text-white' 
                    : 'bg-white text-forest-700 hover:bg-cream-100'
                }`}
              >
                <config.icon className="h-4 w-4" />
                {config.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-soft p-8 text-center text-sage">
              No orders found with the selected status.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const currentStatus = order.status as OrderStatus
              const StatusIcon = statusConfig[currentStatus]?.icon || AlertCircle
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-soft overflow-hidden">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-forest-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-sage">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="mt-3 lg:mt-0">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          statusConfig[currentStatus]?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          <StatusIcon className="h-4 w-4" />
                          {statusConfig[currentStatus]?.label || order.status}
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border-t border-cream-200 pt-4 mb-4">
                      <h4 className="text-sm font-medium text-forest-900 mb-2">Customer Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-forest-700 font-medium">{order.user.name}</p>
                          <p className="text-sage">{order.user.email}</p>
                          {order.user.phone && <p className="text-sage">{order.user.phone}</p>}
                        </div>
                        {order.shippingAddress && (
                          <div>
                            <p className="text-sage mb-1">Delivery Address:</p>
                            <p className="text-forest-700">{order.shippingAddress.name}</p>
                            <p className="text-forest-700">{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && (
                              <p className="text-forest-700">{order.shippingAddress.line2}</p>
                            )}
                            <p className="text-forest-700">
                              {order.shippingAddress.city}, {order.shippingAddress.county} {order.shippingAddress.postalCode}
                            </p>
                            <p className="text-forest-700">{order.shippingAddress.country}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-cream-200 pt-4 mb-4">
                      <h4 className="text-sm font-medium text-forest-900 mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {item.product.localImagePath && (
                                <img 
                                  src={item.product.localImagePath} 
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-forest-900">
                                  {item.product.name}
                                </p>
                                {item.product.artist && (
                                  <p className="text-xs text-sage">by {item.product.artist}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-forest-700">
                                {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-cream-200 pt-4 mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-sage">
                            {order.shipping > 0 ? 'Delivery' : 'Collection'}
                          </p>
                          <p className="text-lg font-medium text-forest-900">
                            Total: {formatPrice(order.total)}
                          </p>
                        </div>
                        
                        {/* Status Update Dropdown */}
                        <div className="relative">
                          <select
                            value={currentStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            disabled={updatingStatus === order.id}
                            className="block w-48 px-3 py-2 bg-white border border-cream-300 rounded-lg text-sm 
                                     focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {Object.entries(statusConfig).map(([status, config]) => (
                              <option key={status} value={status}>
                                {config.label}
                              </option>
                            ))}
                          </select>
                          {updatingStatus === order.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-forest-600 border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}