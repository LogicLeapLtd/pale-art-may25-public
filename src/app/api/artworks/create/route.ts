import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  try {
    console.log('Create artwork API called')
    const formData = await request.formData()
    
    // Get form fields
    const name = formData.get('name') as string
    const artist = formData.get('artist') as string
    const price = formData.get('price') as string
    const year = formData.get('year') as string
    const dimensions = formData.get('dimensions') as string
    const medium = formData.get('medium') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string
    const featured = formData.get('featured') === 'true'
    const imageFile = formData.get('image') as File

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    // Upload image to Vercel Blob storage
    let localImagePath = ''
    if (imageFile && imageFile.size > 0) {
      console.log(`Attempting to upload image: ${imageFile.name}, size: ${imageFile.size}`)
      
      const uploadFormData = new FormData()
      uploadFormData.append('file', imageFile)
      
      // Get the host from the request headers
      const host = request.headers.get('host')
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
      const baseUrl = `${protocol}://${host}`
      
      console.log(`Upload URL: ${baseUrl}/api/upload`)
      
      const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        body: uploadFormData,
      })
      
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json()
        localImagePath = uploadResult.url
        console.log('Image uploaded successfully:', localImagePath)
      } else {
        const errorText = await uploadResponse.text()
        console.error('Failed to upload image:', uploadResponse.status, errorText)
        
        // Try parsing as JSON for better error info
        try {
          const errorJson = JSON.parse(errorText)
          console.error('Upload error details:', errorJson)
        } catch (e) {
          // Not JSON, that's ok
        }
        
        // Return error to client
        return NextResponse.json(
          { 
            error: 'Failed to upload image', 
            details: errorText,
            message: 'Please ensure BLOB_READ_WRITE_TOKEN is configured in Vercel environment variables'
          },
          { status: 400 }
        )
      }
    } else {
      console.log('No image file provided or file is empty')
    }

    // Create artwork in database
    console.log('Creating artwork with data:', {
      name, artist, price, year, dimensions, medium, description, status, featured, slug, localImagePath
    })
    
    const artwork = await prisma.product.create({
      data: {
        id: `artwork-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        artist: artist || null,
        price: price || '0',
        year: year || null,
        dimensions: dimensions || null,
        medium: medium || null,
        description: description || null,
        status: status || null,
        featured,
        slug: slug || null,
        localImagePath: localImagePath || null,
        originalImageUrl: '',
        originalProductUrl: '',
        category: 'artwork',
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, artwork })
  } catch (error) {
    console.error('Error creating artwork:', error)
    return NextResponse.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    )
  }
}