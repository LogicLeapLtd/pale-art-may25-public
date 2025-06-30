import { NextResponse } from 'next/server'
import { getFeaturedArtworks } from '@/lib/database'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function GET() {
  try {
    const artworks = await getFeaturedArtworks()
    return NextResponse.json(artworks)
  } catch (error) {
    console.error('Error fetching featured artworks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}