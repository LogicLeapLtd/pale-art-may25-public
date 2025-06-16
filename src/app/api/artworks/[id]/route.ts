import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single artwork by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const artwork = await prisma.product.findUnique({
      where: { id }
    })
    
    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json({ error: 'Failed to fetch artwork' }, { status: 500 })
  }
}

// UPDATE artwork
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const [data, { id }] = await Promise.all([
      request.json(),
      context.params
    ])
    
    // Convert string boolean to actual boolean for featured field
    if (data.featured !== undefined) {
      data.featured = data.featured === 'true' || data.featured === true
    }
    
    const updatedArtwork = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        artist: data.artist,
        price: data.price,
        status: data.status,
        medium: data.medium,
        year: data.year,
        dimensions: data.dimensions,
        featured: data.featured,
        description: data.description,
        category: data.category,
        slug: data.slug,
        updatedAt: new Date()
      }
    })
    
    // Track the update activity
    await prisma.activity.create({
      data: {
        type: 'artwork_update',
        title: `Artwork updated: ${updatedArtwork.name}`,
        description: `Updated artwork details`,
        artworkId: updatedArtwork.id,
        artworkName: updatedArtwork.name,
        artistName: updatedArtwork.artist,
        metadata: { updatedFields: Object.keys(data) }
      }
    })
    
    return NextResponse.json(updatedArtwork)
  } catch (error) {
    console.error('Error updating artwork:', error)
    return NextResponse.json({ error: 'Failed to update artwork' }, { status: 500 })
  }
}

// DELETE artwork
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // Get artwork details before deletion for activity tracking
    const artwork = await prisma.product.findUnique({
      where: { id }
    })
    
    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    await prisma.product.delete({
      where: { id }
    })
    
    // Track the deletion activity
    await prisma.activity.create({
      data: {
        type: 'artwork_delete',
        title: `Artwork deleted: ${artwork.name}`,
        description: `Deleted artwork from collection`,
        artworkId: artwork.id,
        artworkName: artwork.name,
        artistName: artwork.artist
      }
    })
    
    return NextResponse.json({ message: 'Artwork deleted successfully' })
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return NextResponse.json({ error: 'Failed to delete artwork' }, { status: 500 })
  }
}