import { PrismaClient } from '@prisma/client'
import { getAllArtworks } from '../src/lib/database'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Artwork Filtering\n')
  
  // 1. Get all artworks via the getAllArtworks function (what admin and collection use)
  const artworksFromFunction = await getAllArtworks()
  console.log(`1. getAllArtworks() returns: ${artworksFromFunction.length} artworks`)
  
  // 2. Check statuses in the returned artworks
  const statusCounts: { [key: string]: number } = {}
  artworksFromFunction.forEach(artwork => {
    const status = artwork.status || 'null'
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })
  
  console.log('\n2. Status breakdown:')
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`)
  })
  
  // 3. Check if there might be hidden/private artworks
  console.log('\n3. Checking for artworks that might be filtered:')
  
  // Check for artworks with specific names that might be filtered
  const testArtworks = artworksFromFunction.filter(a => 
    a.name.toLowerCase().includes('test') ||
    a.name.toLowerCase().includes('demo') ||
    a.name.toLowerCase().includes('sample') ||
    a.name.toLowerCase().includes('angular') // The user mentioned "Angular Form" artworks
  )
  
  console.log(`   Found ${testArtworks.length} potential test/demo artworks`)
  if (testArtworks.length > 0) {
    console.log('   Names:')
    testArtworks.forEach(a => {
      console.log(`     - "${a.name}" by ${a.artist || 'Unknown'}`)
    })
  }
  
  // 4. Check David's artworks specifically
  console.log('\n4. David-related artworks:')
  const davidArtworks = artworksFromFunction.filter(a => 
    a.artist && a.artist.toLowerCase().includes('david')
  )
  console.log(`   Found ${davidArtworks.length} artworks by artists with "David" in name`)
  
  // Group by exact artist name
  const davidArtistGroups: { [key: string]: number } = {}
  davidArtworks.forEach(a => {
    const artist = a.artist || 'Unknown'
    davidArtistGroups[artist] = (davidArtistGroups[artist] || 0) + 1
  })
  
  Object.entries(davidArtistGroups).forEach(([artist, count]) => {
    console.log(`   ${artist}: ${count} artworks`)
  })
  
  // 5. Count unique artworks by name
  const uniqueNames = new Set(artworksFromFunction.map(a => a.name.toLowerCase().trim()))
  console.log(`\n5. Unique artwork names: ${uniqueNames.size}`)
  console.log(`   Total artworks: ${artworksFromFunction.length}`)
  console.log(`   Potential duplicates: ${artworksFromFunction.length - uniqueNames.size}`)
  
  // 6. Check for artworks without proper data
  const incompleteArtworks = artworksFromFunction.filter(a => 
    !a.artist || a.artist === 'Unknown Artist' || a.artist === 'Artist Unknown' ||
    !a.price || a.price === '0' || a.price === '' ||
    !a.medium || !a.year
  )
  console.log(`\n6. Incomplete artworks: ${incompleteArtworks.length}`)
  console.log(`   (Missing artist, price, medium, or year)`)
  
  console.log('\n' + '='.repeat(50))
  console.log('POSSIBLE EXPLANATIONS for 194 vs 164:')
  console.log('1. User might be viewing filtered results (by status/artist/medium)')
  console.log('2. There might be 30 duplicate artworks')
  console.log('3. Some artworks might be hidden on the frontend')
  console.log('4. Check if collection page has any default filters applied')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })