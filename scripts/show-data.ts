import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎨 Sample of Improved Artwork Names:\n')
  
  const artworks = await prisma.product.findMany({
    take: 15,
    orderBy: { createdAt: 'desc' }
  })
  
  artworks.forEach((artwork, index) => {
    console.log(`${index + 1}. "${artwork.name}"`)
    console.log(`   Artist: ${artwork.artist}`)
    console.log(`   Medium: ${artwork.medium}`)
    console.log(`   Price: ${artwork.price}`)
    console.log(`   Category: ${artwork.category}`)
    console.log('')
  })
  
  console.log('📊 Statistics by Medium:')
  const mediums = await prisma.product.groupBy({
    by: ['medium'],
    _count: { medium: true }
  })
  
  mediums.forEach(medium => {
    console.log(`   ${medium.medium}: ${medium._count.medium} artworks`)
  })
  
  console.log('\n🏷️ Artists in Collection:')
  const artists = await prisma.product.groupBy({
    by: ['artist'],
    _count: { artist: true }
  })
  
  artists.forEach(artist => {
    console.log(`   ${artist.artist}: ${artist._count.artist} artworks`)
  })
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })