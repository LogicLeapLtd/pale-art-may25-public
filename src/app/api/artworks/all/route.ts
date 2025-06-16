import { NextResponse } from 'next/server'
import { getAllArtworks } from '@/lib/database'

export async function GET() {
  try {
    const artworks = await getAllArtworks()
    
    // Just return the raw data like the collection page gets
    return NextResponse.json(artworks)
  } catch (error) {
    console.error('Error fetching all artworks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}