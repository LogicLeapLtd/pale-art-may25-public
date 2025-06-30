import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkArtworkCounts() {
  try {
    // Total count in database
    const totalCount = await prisma.product.count()
    
    // Count with images (matching getAllArtworks filter)
    const withImagesCount = await prisma.product.count({
      where: {
        OR: [
          { localImagePath: { not: '' } },
          { originalImageUrl: { not: '' } }
        ]
      }
    })
    
    // Count without images (both paths empty)
    const noImages = await prisma.product.findMany({
      where: {
        localImagePath: { equals: '' },
        originalImageUrl: { equals: '' }
      }
    })
    const withoutImagesCount = noImages.length
    
    console.log('=== Artwork Count Analysis ===')
    console.log(`Total artworks in database: ${totalCount}`)
    console.log(`Artworks with images (shown on collection page): ${withImagesCount}`)
    console.log(`Artworks without images (hidden from collection page): ${withoutImagesCount}`)
    console.log(`\nDiscrepancy explained: ${totalCount} - ${withImagesCount} = ${totalCount - withImagesCount} artworks are missing images`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkArtworkCounts()