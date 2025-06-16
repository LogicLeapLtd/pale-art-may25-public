import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎨 Checking David Artworks\n')
  
  // 1. Find all artists with "David" in their name
  const davidArtists = await prisma.product.groupBy({
    by: ['artist'],
    _count: true,
    where: {
      artist: {
        contains: 'David',
        mode: 'insensitive'
      }
    }
  })
  
  console.log('1. Artists with "David" in name:')
  davidArtists.forEach(({ artist, _count }) => {
    console.log(`   "${artist}": ${_count} artworks`)
  })
  
  // 2. Get all artworks for "David" (exact match)
  const exactDavidArtworks = await prisma.product.findMany({
    where: {
      artist: 'David'
    }
  })
  
  console.log(`\n2. Artworks for artist "David" (exact match): ${exactDavidArtworks.length}`)
  if (exactDavidArtworks.length > 0) {
    exactDavidArtworks.forEach(artwork => {
      console.log(`   - "${artwork.name}" (ID: ${artwork.id})`)
    })
  }
  
  // 3. Check what the artist page would show for "David"
  // This mimics the getArtistWithArtworks function behavior
  const davidPageArtworks = await prisma.product.findMany({
    where: {
      artist: {
        contains: 'David',
        mode: 'insensitive'
      }
    },
    orderBy: { name: 'asc' }
  })
  
  console.log(`\n3. What "David" artist page would show (using contains): ${davidPageArtworks.length} artworks`)
  
  // 4. Check for any artists table entries
  const artistsTableDavid = await prisma.artist.findMany({
    where: {
      name: {
        contains: 'David',
        mode: 'insensitive'
      }
    }
  })
  
  console.log('\n4. Artists table entries with "David":')
  artistsTableDavid.forEach(artist => {
    console.log(`   - Name: "${artist.name}"`)
    console.log(`     Slug: ${artist.slug}`)
    console.log(`     Title: ${artist.title}`)
    console.log(`     Featured: ${artist.featured}`)
  })
  
  // 5. Summary of the issue
  console.log('\n' + '='.repeat(50))
  console.log('SUMMARY:')
  console.log('The issue is that the artist page for "David" uses a CONTAINS query')
  console.log('which matches "David Kereszteny Lewis" artworks as well.')
  console.log('This is why the David page shows 36+ artworks when there should be 0.')
  
  // 6. Check total artwork counts
  const totalArtworks = await prisma.product.count()
  const artworksWithImages = await prisma.product.count({
    where: {
      OR: [
        { localImagePath: { not: '' } },
        { originalImageUrl: { not: '' } }
      ]
    }
  })
  
  console.log(`\n6. Database counts:`)
  console.log(`   Total artworks: ${totalArtworks}`)
  console.log(`   Artworks with images: ${artworksWithImages}`)
  console.log(`   Artworks without images: ${totalArtworks - artworksWithImages}`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })