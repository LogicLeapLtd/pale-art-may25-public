import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function GET() {
  try {
    // Get ALL artworks without any filters for duplicate detection
    const artworks = await prisma.product.findMany({
      orderBy: {
        createdAt: 'asc' // Order by creation date ascending to identify oldest first
      }
    })
    
    return NextResponse.json(artworks)
  } catch (error) {
    console.error('Error fetching all artworks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}