import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Finding artworks without images...\n')
  
  // Get total count
  const totalCount = await prisma.product.count()
  console.log(`Total artworks in database: ${totalCount}`)
  
  // Get artworks WITH images (what getAllArtworks returns)
  const withImages = await prisma.product.findMany({
    where: {
      OR: [
        { localImagePath: { not: '' } },
        { originalImageUrl: { not: '' } }
      ]
    }
  })
  console.log(`Artworks with images: ${withImages.length}`)
  
  // Get artworks WITHOUT images (the problematic ones)
  const withoutImages = await prisma.product.findMany({
    where: {
      NOT: {
        OR: [
          { localImagePath: { not: '' } },
          { originalImageUrl: { not: '' } }
        ]
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`\n❌ Artworks without images: ${withoutImages.length}\n`)
  
  console.log('Details of imageless artworks:')
  console.log('================================')
  
  withoutImages.forEach((artwork, index) => {
    console.log(`\n${index + 1}. ${artwork.name}`)
    console.log(`   ID: ${artwork.id}`)
    console.log(`   Artist: ${artwork.artist || 'Unknown'}`)
    console.log(`   Price: ${artwork.price}`)
    console.log(`   Status: ${artwork.status || 'N/A'}`)
    console.log(`   LocalImagePath: "${artwork.localImagePath}"`)
    console.log(`   OriginalImageUrl: "${artwork.originalImageUrl}"`)
    console.log(`   Created: ${artwork.createdAt}`)
  })
  
  console.log('\n\nThese artworks are showing in the admin dashboard (194 total)')
  console.log('but NOT in the collection pages (164 visible)')
  console.log('\nOptions:')
  console.log('1. Delete these artworks if they are not needed')
  console.log('2. Add images to these artworks')
  console.log('3. Update the admin dashboard to filter them out like collection pages do')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })