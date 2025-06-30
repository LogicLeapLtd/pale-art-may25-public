import { prisma } from '@/lib/prisma'
import { parsePrice } from '@/lib/pricing'

export interface RevenueData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  monthlyRevenue: Record<string, number>
}

export interface ArtworkRevenue {
  artworkId: string
  revenue: number
  unitsSold: number
}

export async function calculateTotalRevenue(startDate?: Date, endDate?: Date) {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ['completed', 'shipped', 'delivered']
      },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      total: true,
      createdAt: true
    }
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Calculate monthly revenue
  const monthlyRevenue = orders.reduce((acc, order) => {
    const month = new Date(order.createdAt).toLocaleDateString('en-GB', { 
      month: 'short', 
      year: 'numeric' 
    })
    acc[month] = (acc[month] || 0) + order.total
    return acc
  }, {} as Record<string, number>)

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    monthlyRevenue
  }
}

export async function calculateArtworkRevenue(startDate?: Date, endDate?: Date): Promise<Map<string, ArtworkRevenue>> {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: {
          in: ['completed', 'shipped', 'delivered']
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    },
    select: {
      productId: true,
      quantity: true,
      total: true
    }
  })

  const revenueByArtwork = new Map<string, ArtworkRevenue>()

  orderItems.forEach(item => {
    const existing = revenueByArtwork.get(item.productId) || {
      artworkId: item.productId,
      revenue: 0,
      unitsSold: 0
    }

    existing.revenue += item.total
    existing.unitsSold += item.quantity

    revenueByArtwork.set(item.productId, existing)
  })

  return revenueByArtwork
}

export async function getTopSellingArtworks(limit: number = 5, startDate?: Date, endDate?: Date) {
  const revenueByArtwork = await calculateArtworkRevenue(startDate, endDate)
  
  const sorted = Array.from(revenueByArtwork.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)

  // Fetch artwork details
  const artworkIds = sorted.map(item => item.artworkId)
  const artworks = await prisma.product.findMany({
    where: {
      id: {
        in: artworkIds
      }
    },
    select: {
      id: true,
      name: true,
      artist: true,
      price: true,
      localImagePath: true
    }
  })

  const artworkMap = new Map(artworks.map(a => [a.id, a]))

  return sorted.map(item => ({
    ...item,
    artwork: artworkMap.get(item.artworkId)
  }))
}