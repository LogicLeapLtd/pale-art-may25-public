import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get ALL artworks without any filtering
    const artworks = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(artworks)
  } catch (error) {
    console.error('Error fetching all artworks for admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}