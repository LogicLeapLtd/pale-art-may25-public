import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking for Susan Cantrill Williams artworks...\n')
  
  // 1. Find all artworks by Susan
  const susanArtworks = await prisma.product.findMany({
    where: {
      OR: [
        { artist: { contains: 'Susan', mode: 'insensitive' } },
        { artist: { contains: 'Cantrill', mode: 'insensitive' } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`Found ${susanArtworks.length} artworks related to Susan Cantrill Williams:\n`)
  
  if (susanArtworks.length > 0) {
    susanArtworks.forEach((artwork, i) => {
      console.log(`${i + 1}. "${artwork.name}"`)
      console.log(`   ID: ${artwork.id}`)
      console.log(`   Artist: ${artwork.artist}`)
      console.log(`   Price: ${artwork.price}`)
      console.log(`   Status: ${artwork.status}`)
      console.log(`   LocalImagePath: ${artwork.localImagePath || 'NULL'}`)
      console.log(`   OriginalImageUrl: ${artwork.originalImageUrl || 'EMPTY'}`)
      console.log(`   Created: ${artwork.createdAt}`)
      console.log(`   Has Image: ${(artwork.localImagePath && artwork.localImagePath !== '') || (artwork.originalImageUrl && artwork.originalImageUrl !== '') ? 'YES' : 'NO'}`)
      console.log()
    })
  }
  
  // 2. Check what getAllArtworks would return
  const allArtworksCount = await prisma.product.count({
    where: {
      OR: [
        { localImagePath: { not: '' } },
        { originalImageUrl: { not: '' } }
      ]
    }
  })
  
  const totalCount = await prisma.product.count()
  
  console.log('\n' + '='.repeat(50))
  console.log('Database Summary:')
  console.log(`Total artworks in database: ${totalCount}`)
  console.log(`Artworks with images (shown in admin): ${allArtworksCount}`)
  console.log(`Artworks without images (hidden): ${totalCount - allArtworksCount}`)
  
  // 3. Check most recent uploads
  console.log('\n' + '='.repeat(50))
  console.log('10 Most Recent Uploads:')
  
  const recentUploads = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  recentUploads.forEach((artwork, i) => {
    console.log(`\n${i + 1}. "${artwork.name}" by ${artwork.artist || 'Unknown'}`)
    console.log(`   Created: ${artwork.createdAt}`)
    console.log(`   Has Image: ${(artwork.localImagePath && artwork.localImagePath !== '') || (artwork.originalImageUrl && artwork.originalImageUrl !== '') ? 'YES' : 'NO'}`)
  })
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })