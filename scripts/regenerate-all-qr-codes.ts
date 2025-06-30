import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

import { prisma } from '../src/lib/prisma'
import { PRODUCTION_BASE_URL } from '../src/lib/config'

async function regenerateAllQRCodes() {
  console.log('Starting QR code regeneration...')
  console.log(`Using base URL: ${PRODUCTION_BASE_URL}`)
  
  try {
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        qrCodeUrl: true
      }
    })
    
    console.log(`Found ${products.length} products`)
    
    let updated = 0
    let failed = 0
    
    for (const product of products) {
      try {
        // Generate new QR code URL with correct domain
        const qrBaseUrl = `${PRODUCTION_BASE_URL}/qr/${product.slug || product.id}`
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=516951&bgcolor=FFFFFF&data=${encodeURIComponent(qrBaseUrl)}`
        
        // Update the product
        await prisma.product.update({
          where: { id: product.id },
          data: { 
            qrCodeUrl,
            updatedAt: new Date()
          }
        })
        
        console.log(`✓ Updated QR code for: ${product.name} -> ${qrBaseUrl}`)
        updated++
      } catch (error) {
        console.error(`✗ Failed to update ${product.name}:`, error)
        failed++
      }
    }
    
    console.log('\n=== Summary ===')
    console.log(`Total products: ${products.length}`)
    console.log(`Successfully updated: ${updated}`)
    console.log(`Failed: ${failed}`)
    
    // Log activity
    await prisma.activity.create({
      data: {
        type: 'system',
        title: 'Bulk QR Code Regeneration',
        description: `Regenerated QR codes for ${updated} products with production URL`,
        metadata: {
          totalProducts: products.length,
          updated,
          failed,
          baseUrl: PRODUCTION_BASE_URL
        }
      }
    })
    
  } catch (error) {
    console.error('Error regenerating QR codes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
regenerateAllQRCodes()