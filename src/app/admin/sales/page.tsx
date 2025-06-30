import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/pricing'
import { Package, Users, TrendingUp, DollarSign, Mail, Calendar } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

async function getSalesData() {
  // Get all orders
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: {
        include: {
          product: true
        }
      },
      shippingAddress: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Get all enquiries
  const enquiries = await prisma.enquiry.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  // Get unique customers
  const uniqueCustomers = new Set(orders.map(order => order.userId)).size

  // Get monthly revenue for chart
  const monthlyRevenue = orders.reduce((acc, order) => {
    const month = new Date(order.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + order.total
    return acc
  }, {} as Record<string, number>)

  return {
    orders,
    enquiries,
    metrics: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      uniqueCustomers,
      totalEnquiries: enquiries.length,
      pendingEnquiries: enquiries.filter(e => e.status === 'pending').length
    },
    monthlyRevenue
  }
}

export default async function SalesAdminPage() {
  const { orders, enquiries, metrics, monthlyRevenue } = await getSalesData()

  return (
    <div className="py-8">
      <div className="container-luxury">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-forest-900 mb-2">Sales Dashboard</h1>
          <p className="text-sage">Monitor your art gallery's performance and customer activity</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-gold-600" />
              <span className="text-xs text-sage">All time</span>
            </div>
            <p className="text-2xl font-medium text-forest-900">{formatPrice(metrics.totalRevenue)}</p>
            <p className="text-sm text-sage mt-1">Total Revenue</p>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="h-8 w-8 text-forest-600" />
              <span className="text-xs text-sage">All time</span>
            </div>
            <p className="text-2xl font-medium text-forest-900">{metrics.totalOrders}</p>
            <p className="text-sm text-sage mt-1">Total Orders</p>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span className="text-xs text-sage">Average</span>
            </div>
            <p className="text-2xl font-medium text-forest-900">{formatPrice(metrics.averageOrderValue)}</p>
            <p className="text-sm text-sage mt-1">Average Order Value</p>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-xs text-sage">Unique</span>
            </div>
            <p className="text-2xl font-medium text-forest-900">{metrics.uniqueCustomers}</p>
            <p className="text-sm text-sage mt-1">Customers</p>
          </div>
        </div>

        {/* Enquiries Summary */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-forest-900 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-sage" />
              Enquiries
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-sage">Total: {metrics.totalEnquiries}</span>
              <span className="text-orange-600">Pending: {metrics.pendingEnquiries}</span>
            </div>
          </div>
          
          {metrics.pendingEnquiries > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                You have {metrics.pendingEnquiries} pending enquiries that need attention.
              </p>
              <Link href="/admin/enquiries" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                View Enquiries →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-200">
            <h2 className="text-xl font-medium text-forest-900">Recent Orders</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sage uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sage uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sage uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sage uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sage uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sage uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sage uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-cream-200">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-cream-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-forest-900">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-forest-700">
                      <div>
                        <p className="font-medium">{order.user.name}</p>
                        <p className="text-xs text-sage">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-forest-700">
                      {order.items.map((item, idx) => (
                        <div key={item.id}>
                          {item.product.name} x{item.quantity}
                          {idx < order.items.length - 1 && ', '}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-forest-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-forest-700">
                      {order.shipping > 0 ? 'Shipping' : 'Collection'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-sage">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {orders.length > 10 && (
            <div className="px-6 py-3 border-t border-cream-200 text-center">
              <Link href="/admin/orders" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
                View All Orders →
              </Link>
            </div>
          )}
        </div>

        {/* Monthly Revenue Chart (simplified) */}
        <div className="mt-8 bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-medium text-forest-900 mb-4">Monthly Revenue</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(monthlyRevenue).slice(-6).map(([month, revenue]) => (
              <div key={month} className="text-center">
                <p className="text-xs text-sage mb-1">{month}</p>
                <p className="font-medium text-forest-900">{formatPrice(revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}