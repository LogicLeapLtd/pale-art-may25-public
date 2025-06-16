import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎨 MFIKELA JEAN SAMUEL - Complete Collection:\n')
  
  const mfikelaArtworks = await prisma.product.findMany({
    where: { artist: 'Mfikela Jean Samuel' },
    orderBy: { name: 'asc' }
  })
  
  mfikelaArtworks.forEach((artwork, index) => {
    console.log(`${index + 1}. "${artwork.name}"`)
    console.log(`   Price: ${artwork.price}`)
    console.log(`   Status: ${artwork.status}`)
    console.log(`   Featured: ${artwork.featured ? 'Yes' : 'No'}`)
    console.log(`   Slug: ${artwork.slug}`)
    console.log('')
  })
  
  console.log(`Total Mfikela Jean Samuel artworks: ${mfikelaArtworks.length}`)
  
  const totalValue = mfikelaArtworks.reduce((sum, artwork) => {
    const priceMatch = artwork.price.match(/£(\d+)/)
    return sum + (priceMatch ? parseInt(priceMatch[1]) : 0)
  }, 0)
  
  console.log(`Total collection value: £${totalValue.toLocaleString()}`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })