import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeMissingData() {
  try {
    // Fetch all artworks
    const allArtworks = await prisma.product.findMany()
    
    // Analyze missing data
    const withoutPrices: any[] = []
    const withoutDimensions: any[] = []
    const withoutArtist: any[] = []
    
    allArtworks.forEach(artwork => {
      // Check for missing or invalid prices
      if (!artwork.price || artwork.price === '' || artwork.price === '0' || artwork.price.toLowerCase() === 'sold') {
        withoutPrices.push({
          id: artwork.id,
          name: artwork.name,
          price: artwork.price
        })
      }
      
      // Check for missing dimensions
      if (!artwork.dimensions || artwork.dimensions === '' || artwork.dimensions === null) {
        withoutDimensions.push({
          id: artwork.id,
          name: artwork.name,
          dimensions: artwork.dimensions
        })
      }
      
      // Check for missing or unknown artist
      if (!artwork.artist || 
          artwork.artist === '' || 
          artwork.artist === null || 
          artwork.artist.toLowerCase() === 'unknown' ||
          artwork.artist.toLowerCase() === 'artist unknown') {
        withoutArtist.push({
          id: artwork.id,
          name: artwork.name,
          artist: artwork.artist
        })
      }
    })
    
    console.log('=== ARTWORK DATA ANALYSIS ===\n')
    
    console.log(`Total artworks: ${allArtworks.length}`)
    console.log(`\n1) Artworks without valid prices: ${withoutPrices.length}`)
    if (withoutPrices.length > 0) {
      console.log('   List of artworks without prices:')
      withoutPrices.forEach(art => {
        console.log(`   - ${art.name} (ID: ${art.id}) - Price: "${art.price}"`)
      })
    }
    
    console.log(`\n2) Artworks without dimensions: ${withoutDimensions.length}`)
    if (withoutDimensions.length > 0) {
      console.log('   List of artworks without dimensions:')
      withoutDimensions.forEach(art => {
        console.log(`   - ${art.name} (ID: ${art.id})`)
      })
    }
    
    console.log(`\n3) Artworks without artist/unknown artist: ${withoutArtist.length}`)
    if (withoutArtist.length > 0) {
      console.log('   List of artworks without artist:')
      withoutArtist.forEach(art => {
        console.log(`   - ${art.name} (ID: ${art.id}) - Artist: "${art.artist}"`)
      })
    }
    
    console.log('\n=== SUMMARY ===')
    console.log(`Complete artworks (have price, dimensions, and artist): ${allArtworks.length - Math.max(withoutPrices.length, withoutDimensions.length, withoutArtist.length)}`)
    
  } catch (error) {
    console.error('Error analyzing data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeMissingData()