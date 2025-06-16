import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface MigrationResult {
  success: boolean
  artwork: any
  originalPath: string
  newUrl?: string
  fileSize?: number
  error?: string
}

async function migrateAllImages() {
  const results: MigrationResult[] = []
  let successCount = 0
  let errorCount = 0

  try {
    console.log('🚀 Starting full image migration to Vercel Blob Storage')
    console.log('═'.repeat(80))
    
    // Find all artworks with local image paths (excluding already migrated ones)
    const artworks = await prisma.product.findMany({
      where: {
        localImagePath: {
          startsWith: '/ART/'
        }
      },
      orderBy: [
        { artist: 'asc' },
        { name: 'asc' }
      ]
    })
    
    console.log(`📊 Found ${artworks.length} artworks to migrate`)
    console.log('═'.repeat(80))
    
    for (let i = 0; i < artworks.length; i++) {
      const artwork = artworks[i]
      const progress = `[${i + 1}/${artworks.length}]`
      
      console.log(`\n${progress} Processing: "${artwork.name}" by ${artwork.artist}`)
      console.log(`💰 Price: ${artwork.price} | 🎨 Medium: ${artwork.medium || 'Not specified'}`)
      console.log(`📅 Year: ${artwork.year || 'Not specified'} | 📏 Dimensions: ${artwork.dimensions || 'Available upon request'}`)
      console.log(`📂 Current path: ${artwork.localImagePath}`)
      
      try {
        // Skip if no local image path
        if (!artwork.localImagePath) {
          console.log(`  ⚠️  No local image path`)
          continue
        }

        // Construct the full file path
        const fullPath = path.join(process.cwd(), 'public', artwork.localImagePath)
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
          console.log(`❌ File not found: ${fullPath}`)
          results.push({
            success: false,
            artwork,
            originalPath: artwork.localImagePath!,
            error: 'File not found'
          })
          errorCount++
          continue
        }
        
        // Read the file
        const fileBuffer = fs.readFileSync(fullPath)
        const fileExtension = path.extname(artwork.localImagePath)
        const mimeType = fileExtension.toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
        
        console.log(`📊 File size: ${(fileBuffer.length / 1024).toFixed(2)} KB | Type: ${mimeType}`)
        
        // Generate blob filename
        const timestamp = Date.now()
        const cleanName = path.basename(artwork.localImagePath, fileExtension)
          .replace(/[^a-zA-Z0-9.-]/g, '')
          .replace(/_\d+$/, '') // Remove price suffix like _259
        const blobFilename = `artworks/${timestamp}-${cleanName}${fileExtension.toLowerCase()}`
        
        console.log(`☁️ Uploading to: ${blobFilename}`)
        
        // Upload to Vercel Blob
        const blob = await put(blobFilename, fileBuffer, {
          access: 'public',
          contentType: mimeType,
          token: process.env.BLOB_READ_WRITE_TOKEN!
        })
        
        console.log(`✅ Upload successful: ${blob.url}`)
        
        // Update the database record
        const updatedArtwork = await prisma.product.update({
          where: { id: artwork.id },
          data: {
            localImagePath: blob.url,
            updatedAt: new Date()
          }
        })
        
        // Create activity record
        await prisma.activity.create({
          data: {
            type: 'artwork_update',
            title: `Image migrated to blob storage: ${artwork.name}`,
            description: `Migrated "${artwork.name}" by ${artwork.artist} from local storage to Vercel Blob`,
            artworkId: artwork.id,
            artworkName: artwork.name,
            artistName: artwork.artist,
            metadata: {
              originalPath: artwork.localImagePath,
              newUrl: blob.url,
              fileSize: fileBuffer.length,
              migration: true,
              migrationBatch: new Date().toISOString()
            }
          }
        })
        
        results.push({
          success: true,
          artwork,
          originalPath: artwork.localImagePath!,
          newUrl: blob.url,
          fileSize: fileBuffer.length
        })
        
        successCount++
        console.log(`💾 Database updated and activity logged`)
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.log(`❌ Error processing ${artwork.name}:`, error)
        results.push({
          success: false,
          artwork,
          originalPath: artwork.localImagePath!,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++
      }
    }
    
    console.log('\n' + '═'.repeat(80))
    console.log('🎉 MIGRATION COMPLETED!')
    console.log('═'.repeat(80))
    console.log(`✅ Successfully migrated: ${successCount} artworks`)
    console.log(`❌ Failed migrations: ${errorCount} artworks`)
    console.log(`📊 Total processed: ${results.length} artworks`)
    
    if (successCount > 0) {
      const totalSize = results
        .filter(r => r.success && r.fileSize)
        .reduce((sum, r) => sum + (r.fileSize || 0), 0)
      console.log(`💾 Total data migrated: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
    }
    
    // Log failed migrations
    if (errorCount > 0) {
      console.log('\n❌ Failed Migrations:')
      console.log('─'.repeat(50))
      results.filter(r => !r.success).forEach(result => {
        console.log(`• ${result.artwork.name} by ${result.artwork.artist}`)
        console.log(`  Path: ${result.originalPath}`)
        console.log(`  Error: ${result.error}`)
      })
    }
    
    return results
    
  } catch (error) {
    console.error('❌ Migration script failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if this file is executed directly
if (require.main === module) {
  migrateAllImages()
    .then(() => {
      console.log('\n🏁 Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error)
      process.exit(1)
    })
}

export default migrateAllImages