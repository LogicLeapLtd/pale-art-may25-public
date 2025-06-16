import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Analyzing image fields in all artworks...\n')
  
  const allArtworks = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      artist: true,
      localImagePath: true,
      originalImageUrl: true
    },
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`Total artworks: ${allArtworks.length}\n`)
  
  // Categorize by image status
  const hasLocalPath: any[] = []
  const hasOriginalUrl: any[] = []
  const hasBoth: any[] = []
  const hasNeither: any[] = []
  const hasEmptyStrings: any[] = []
  
  allArtworks.forEach(artwork => {
    const hasLocal = artwork.localImagePath && artwork.localImagePath !== ''
    const hasOriginal = artwork.originalImageUrl && artwork.originalImageUrl !== ''
    
    if (hasLocal && hasOriginal) {
      hasBoth.push(artwork)
    } else if (hasLocal && !hasOriginal) {
      hasLocalPath.push(artwork)
    } else if (!hasLocal && hasOriginal) {
      hasOriginalUrl.push(artwork)
    } else {
      hasNeither.push(artwork)
    }
    
    // Check for empty strings specifically
    if (artwork.localImagePath === '' || artwork.originalImageUrl === '') {
      hasEmptyStrings.push(artwork)
    }
  })
  
  console.log('Categories:')
  console.log(`1. Has BOTH localImagePath AND originalImageUrl: ${hasBoth.length}`)
  console.log(`2. Has ONLY localImagePath: ${hasLocalPath.length}`)
  console.log(`3. Has ONLY originalImageUrl: ${hasOriginalUrl.length}`)
  console.log(`4. Has NEITHER (null/empty): ${hasNeither.length}`)
  console.log(`5. Has empty strings: ${hasEmptyStrings.length}`)
  
  if (hasNeither.length > 0) {
    console.log('\n❌ Artworks with NEITHER image (these should be deleted):')
    hasNeither.forEach(artwork => {
      console.log(`\n  "${artwork.name}"`)
      console.log(`  ID: ${artwork.id}`)
      console.log(`  Artist: ${artwork.artist || 'Unknown'}`)
      console.log(`  localImagePath: ${JSON.stringify(artwork.localImagePath)}`)
      console.log(`  originalImageUrl: ${JSON.stringify(artwork.originalImageUrl)}`)
    })
  }
  
  // Check what getAllArtworks would return
  const withImagesQuery = await prisma.product.count({
    where: {
      OR: [
        { localImagePath: { not: '' } },
        { originalImageUrl: { not: '' } }
      ]
    }
  })
  
  console.log(`\n\ngetAllArtworks() would return: ${withImagesQuery} artworks`)
  console.log(`(filters out artworks where both fields are empty strings)`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })