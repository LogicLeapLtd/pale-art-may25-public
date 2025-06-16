import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, { status: 400 })
    }
    
    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Compress and resize image using sharp
    let processedBuffer: Buffer
    try {
      processedBuffer = await sharp(buffer)
        .resize(2000, 2000, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer()
        
      console.log(`Image compressed: ${(buffer.length / 1024 / 1024).toFixed(2)}MB -> ${(processedBuffer.length / 1024 / 1024).toFixed(2)}MB`)
    } catch (sharpError) {
      console.error('Sharp processing error:', sharpError)
      // If sharp fails, use original buffer
      processedBuffer = buffer
    }
    
    // Check processed size
    if (processedBuffer.length > 10 * 1024 * 1024) {
      // If still too large, compress more aggressively
      processedBuffer = await sharp(buffer)
        .resize(1500, 1500, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 75,
          progressive: true 
        })
        .toBuffer()
        
      if (processedBuffer.length > 10 * 1024 * 1024) {
        return NextResponse.json({ 
          error: 'File too large even after compression. Please use a smaller image.' 
        }, { status: 400 })
      }
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '').replace(/\.(jpg|jpeg|png|webp)$/i, '')
    const filename = `artworks/${timestamp}-${cleanName}.jpg` // Always save as JPEG after processing
    
    // Check if token exists
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN is not set in environment variables')
      return NextResponse.json({ 
        error: 'Blob storage is not configured. Please contact the administrator.' 
      }, { status: 500 })
    }
    
    // Upload to Vercel Blob Storage
    const blob = await put(filename, processedBuffer, {
      access: 'public',
      token: token,
      contentType: 'image/jpeg'
    })
    
    return NextResponse.json({ 
      url: blob.url,
      filename: filename,
      originalSize: buffer.length,
      compressedSize: processedBuffer.length,
      compressionRatio: ((1 - processedBuffer.length / buffer.length) * 100).toFixed(1) + '%'
    })
    
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error)
    return NextResponse.json({ error: 'Failed to upload file to blob storage' }, { status: 500 })
  }
}