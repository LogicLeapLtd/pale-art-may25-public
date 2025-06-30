import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PRODUCTION_BASE_URL } from '@/lib/config'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Find the artwork
    const artwork = await prisma.product.findUnique({
      where: { id }
    })
    
    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }
    
    // Generate QR code URL with forest green color
    const qrBaseUrl = `${PRODUCTION_BASE_URL}/qr/${artwork.slug || artwork.id}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=516951&bgcolor=FFFFFF&data=${encodeURIComponent(qrBaseUrl)}`
    
    // Update the artwork with the QR code URL
    const updatedArtwork = await prisma.product.update({
      where: { id },
      data: { 
        qrCodeUrl,
        updatedAt: new Date()
      }
    })
    
    // Log the activity
    await prisma.activity.create({
      data: {
        type: 'qr_generated',
        title: 'QR Code Generated',
        description: `QR code generated for ${artwork.name}`,
        artworkId: artwork.id,
        artworkName: artwork.name,
        artistName: artwork.artist,
        metadata: {
          qrCodeUrl,
          qrBaseUrl
        }
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      qrCodeUrl,
      qrBaseUrl,
      artwork: updatedArtwork 
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 