import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function migrateSingleImage() {
  try {
    console.log('🔍 Finding a Mfikela Jean artwork to migrate...')
    
    // Find a Mfikela Jean artwork
    const artwork = await prisma.product.findFirst({
      where: {
        artist: 'Mfikela Jean Samuel',
        localImagePath: {
          startsWith: '/ART/'
        }
      }
    })
    
    if (!artwork) {
      console.log('❌ No Mfikela Jean artwork found with local image path')
      return
    }
    
    console.log(`✅ Found artwork: "${artwork.name}"`)
    console.log(`📂 Current image path: ${artwork.localImagePath}`)
    
    // Skip if no local image path
    if (!artwork.localImagePath) {
      console.log(`⚠️  No local image path`)
      return
    }

    // Construct the full file path
    const fullPath = path.join(process.cwd(), 'public', artwork.localImagePath)
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${fullPath}`)
      return
    }
    
    console.log(`📁 File exists: ${fullPath}`)
    
    // Read the file
    const fileBuffer = fs.readFileSync(fullPath)
    const fileExtension = path.extname(artwork.localImagePath)
    const mimeType = fileExtension.toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
    
    console.log(`📊 File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`)
    console.log(`🎨 MIME type: ${mimeType}`)
    
    // Generate blob filename
    const timestamp = Date.now()
    const cleanName = path.basename(artwork.localImagePath, fileExtension).replace(/[^a-zA-Z0-9.-]/g, '')
    const blobFilename = `artworks/${timestamp}-${cleanName}${fileExtension.toLowerCase()}`
    
    console.log(`☁️ Uploading to blob storage as: ${blobFilename}`)
    
    // Upload to Vercel Blob
    const blob = await put(blobFilename, fileBuffer, {
      access: 'public',
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN!
    })
    
    console.log(`✅ Upload successful!`)
    console.log(`🔗 Blob URL: ${blob.url}`)
    
    // Update the database record
    console.log(`💾 Updating database record...`)
    
    const updatedArtwork = await prisma.product.update({
      where: { id: artwork.id },
      data: {
        localImagePath: blob.url,
        updatedAt: new Date()
      }
    })
    
    console.log(`✅ Database updated successfully!`)
    
    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'artwork_update',
        title: `Image migrated to blob storage: ${artwork.name}`,
        description: `Migrated from local storage to Vercel Blob`,
        artworkId: artwork.id,
        artworkName: artwork.name,
        artistName: artwork.artist,
        metadata: {
          originalPath: artwork.localImagePath,
          newUrl: blob.url,
          fileSize: fileBuffer.length,
          migration: true
        }
      }
    })
    
    console.log(`📊 Activity logged`)
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('─'.repeat(50))
    console.log(`Artwork: ${artwork.name}`)
    console.log(`Artist: ${artwork.artist}`)
    console.log(`Old path: ${artwork.localImagePath}`)
    console.log(`New URL: ${blob.url}`)
    console.log(`File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`)
    console.log('─'.repeat(50))
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if this file is executed directly
if (require.main === module) {
  migrateSingleImage()
}

export default migrateSingleImage