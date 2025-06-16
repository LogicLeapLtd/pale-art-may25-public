import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const targetArtists = [
    'Alla Chakir',
    'Andy Dobbie',
    'David Kereszteny Lewis',
    'Gareth Nash',
    'Glen Farrelly',
    'Jo-Anna Duncalf',
    'Jon Clayton',
    'Mfikela Jean Samuel',
    'Nick Elphick',
    'Steve Page',
    'Steve Tootell',
    'Susan Cantrill Williams'
  ]
  
  console.log('📊 Exporting products for specific artists...\n')
  
  // Get products for these artists
  const products = await prisma.product.findMany({
    where: {
      artist: {
        in: targetArtists
      }
    },
    orderBy: [
      { artist: 'asc' },
      { name: 'asc' }
    ]
  })
  
  console.log(`Found ${products.length} products from ${targetArtists.length} artists\n`)
  
  // Create CSV content
  const csvHeader = 'Name,Artist,Price'
  const csvRows = products.map(product => {
    // Escape fields that might contain commas
    const name = product.name.includes(',') ? `"${product.name.replace(/"/g, '""')}"` : product.name
    const artist = product.artist || 'Unknown Artist'
    const price = product.price || '0'
    
    return `${name},${artist},${price}`
  })
  
  const csvContent = [csvHeader, ...csvRows].join('\n')
  
  // Save to file
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
  const filename = path.join(process.cwd(), 'exports', `selected-artists-${timestamp}.csv`)
  const simpleFilename = path.join(process.cwd(), 'exports', 'selected-artists-latest.csv')
  
  fs.writeFileSync(filename, csvContent, 'utf-8')
  fs.writeFileSync(simpleFilename, csvContent, 'utf-8')
  
  console.log(`✅ Exported to:`)
  console.log(`   ${filename}`)
  console.log(`   ${simpleFilename}`)
  
  // Show breakdown by artist
  console.log('\n📈 Breakdown by artist:')
  const artistCounts: { [key: string]: number } = {}
  products.forEach(p => {
    const artist = p.artist || 'Unknown'
    artistCounts[artist] = (artistCounts[artist] || 0) + 1
  })
  
  Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([artist, count]) => {
      console.log(`   ${artist}: ${count} products`)
    })
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })