import { NextRequest, NextResponse } from 'next/server'
import { getArtworksByArtist } from '@/lib/database'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artist: string }> }
) {
  try {
    const { artist } = await params
    const artworks = await getArtworksByArtist(decodeURIComponent(artist))
    return NextResponse.json(artworks)
  } catch (error) {
    console.error('Error fetching artworks by artist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}