import { NextResponse } from 'next/server'
import { calculateTotalRevenue, calculateArtworkRevenue, getTopSellingArtworks } from '@/lib/revenue'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // 'all', '30days', '1year'
    
    let startDate: Date | undefined
    let endDate: Date | undefined = new Date()

    switch (period) {
      case '30days':
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        break
      case '1year':
        startDate = new Date()
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case 'all':
      default:
        startDate = undefined
        endDate = undefined
        break
    }

    // Get overall revenue metrics
    const revenueData = await calculateTotalRevenue(startDate, endDate)
    
    // Get artwork-specific revenue
    const artworkRevenue = await calculateArtworkRevenue(startDate, endDate)
    
    // Get top selling artworks
    const topSelling = await getTopSellingArtworks(5, startDate, endDate)

    return NextResponse.json({
      metrics: revenueData,
      artworkRevenue: Array.from(artworkRevenue.values()),
      topSelling,
      period
    })
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}