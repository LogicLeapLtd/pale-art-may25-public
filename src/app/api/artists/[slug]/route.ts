import { NextResponse } from 'next/server'
import { getArtistWithArtworks } from '@/lib/artists'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const artist = await getArtistWithArtworks(slug)
    
    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(artist)
  } catch (error) {
    console.error('Error in artist API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist' },
      { status: 500 }
    )
  }
}