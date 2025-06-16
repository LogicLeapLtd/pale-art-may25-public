import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎨 Finding artists with no artworks...\n')
  
  // Get all artists from the Artist table
  const allArtists = await prisma.artist.findMany({
    orderBy: { name: 'asc' }
  })
  
  console.log(`Total artists in database: ${allArtists.length}\n`)
  
  // Get all unique artist names from artworks
  const artworksGrouped = await prisma.product.groupBy({
    by: ['artist'],
    _count: true
  })
  
  const artistsWithArtworks = new Set(
    artworksGrouped
      .map(group => group.artist)
      .filter(Boolean)
  )
  
  // Find artists with no artworks
  const artistsWithoutArtworks: typeof allArtists = []
  
  for (const artist of allArtists) {
    const hasArtworks = artistsWithArtworks.has(artist.name)
    
    if (!hasArtworks) {
      artistsWithoutArtworks.push(artist)
    }
  }
  
  console.log(`\n❌ Artists with NO artworks: ${artistsWithoutArtworks.length}\n`)
  
  if (artistsWithoutArtworks.length > 0) {
    console.log('Artists without any artworks assigned:')
    console.log('=' .repeat(50))
    
    artistsWithoutArtworks.forEach((artist, index) => {
      console.log(`\n${index + 1}. ${artist.name}`)
      console.log(`   ID: ${artist.id}`)
      console.log(`   Slug: ${artist.slug}`)
      console.log(`   Title: ${artist.title}`)
      console.log(`   Featured: ${artist.featured}`)
      if (artist.portfolioUrl) {
        console.log(`   Portfolio: ${artist.portfolioUrl}`)
      }
    })
  }
  
  // Show artists with artworks for comparison
  console.log('\n\n✅ Artists WITH artworks:')
  console.log('=' .repeat(50))
  
  artworksGrouped
    .filter(group => group.artist)
    .sort((a, b) => b._count - a._count)
    .forEach(group => {
      console.log(`${group.artist}: ${group._count} artworks`)
    })
  
  // Show any artworks with "Unknown Artist" or similar
  const unknownArtistCount = artworksGrouped.find(g => 
    g.artist === 'Unknown Artist' || 
    g.artist === 'Artist Unknown' ||
    g.artist === null
  )?._count || 0
  
  if (unknownArtistCount > 0) {
    console.log(`\n⚠️  Note: ${unknownArtistCount} artworks have "Unknown Artist" or no artist assigned`)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })