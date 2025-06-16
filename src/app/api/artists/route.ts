import { NextResponse } from 'next/server'
import { getAllArtists, getFeaturedArtists } from '@/lib/artists'
import { prisma } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    
    const artists = featured === 'true' ? await getFeaturedArtists() : await getAllArtists()
    
    return NextResponse.json(artists)
  } catch (error) {
    console.error('Error in artists API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, title, biography, portfolioUrl, featured, imageUrl } = data
    
    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    const artist = await prisma.artist.create({
      data: {
        id: crypto.randomUUID(),
        name,
        slug,
        title: title || '',
        biography: biography || '',
        portfolioUrl,
        imageUrl,
        featured: featured || false,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(artist)
  } catch (error) {
    console.error('Error creating artist:', error)
    return NextResponse.json(
      { error: 'Failed to create artist' },
      { status: 500 }
    )
  }
}