import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Exporting artworks to CSV...\n')
  
  // Get all artworks
  const artworks = await prisma.product.findMany({
    orderBy: [
      { artist: 'asc' },
      { name: 'asc' }
    ]
  })
  
  console.log(`Found ${artworks.length} artworks to export\n`)
  
  // Create CSV content
  const csvHeader = 'Name,Artist,Price'
  const csvRows = artworks.map(artwork => {
    // Escape fields that might contain commas
    const name = artwork.name.includes(',') ? `"${artwork.name.replace(/"/g, '""')}"` : artwork.name
    const artist = (artwork.artist || 'Unknown Artist').includes(',') 
      ? `"${(artwork.artist || 'Unknown Artist').replace(/"/g, '""')}"` 
      : (artwork.artist || 'Unknown Artist')
    const price = artwork.price || '0'
    
    return `${name},${artist},${price}`
  })
  
  const csvContent = [csvHeader, ...csvRows].join('\n')
  
  // Save to file
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
  const exportDir = path.join(process.cwd(), 'exports')
  
  // Create exports directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }
  
  const filename = path.join(exportDir, `artworks-export-${timestamp}.csv`)
  fs.writeFileSync(filename, csvContent, 'utf-8')
  
  console.log(`✅ Exported ${artworks.length} artworks to:`)
  console.log(`   ${filename}`)
  
  // Also create a simplified version without timestamp for easy access
  const simpleFilename = path.join(exportDir, 'artworks-latest.csv')
  fs.writeFileSync(simpleFilename, csvContent, 'utf-8')
  console.log(`\n📄 Also saved as: ${simpleFilename}`)
  
  // Show summary statistics
  const priceStats = {
    withPrice: artworks.filter(a => a.price && a.price !== '0' && a.price !== 'POA').length,
    poa: artworks.filter(a => a.price === 'POA').length,
    zero: artworks.filter(a => !a.price || a.price === '0').length,
  }
  
  console.log('\n📈 Price Statistics:')
  console.log(`   With price: ${priceStats.withPrice}`)
  console.log(`   POA: ${priceStats.poa}`)
  console.log(`   No price/Zero: ${priceStats.zero}`)
  
  // Artist statistics
  const artistCounts: { [key: string]: number } = {}
  artworks.forEach(artwork => {
    const artist = artwork.artist || 'Unknown Artist'
    artistCounts[artist] = (artistCounts[artist] || 0) + 1
  })
  
  console.log('\n🎨 Top Artists:')
  Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([artist, count]) => {
      console.log(`   ${artist}: ${count} artworks`)
    })
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })