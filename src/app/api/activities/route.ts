import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// Force Node.js runtime
export const runtime = 'nodejs'
// GET recent activities
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST create new activity
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const activity = await prisma.activity.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        artworkId: data.artworkId,
        artworkName: data.artworkName,
        artistName: data.artistName,
        metadata: data.metadata || {}
      }
    })
    
    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}