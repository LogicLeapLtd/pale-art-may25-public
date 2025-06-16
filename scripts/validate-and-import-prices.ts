import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface CSVRow {
  name: string
  artist: string
  price: string
  measurements: string
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',')
  
  const rows: CSVRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const values = line.match(/(?:^|,)("(?:[^"]+|"")*"|[^,]*)/g)?.map(v => {
      // Remove leading comma and quotes
      v = v.replace(/^,/, '')
      if (v.startsWith('"') && v.endsWith('"')) {
        v = v.slice(1, -1).replace(/""/g, '"')
      }
      return v
    }) || []
    
    if (values.length >= 3) {
      rows.push({
        name: values[0] || '',
        artist: values[1] || '',
        price: values[2] || '',
        measurements: values[3] || ''
      })
    }
  }
  
  return rows
}

async function main() {
  console.log('📊 Validating and importing price updates...\n')
  
  // Read CSV file
  const csvPath = path.join(process.cwd(), 'exports', 'selected-artists-latest.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(csvContent)
  
  console.log(`Found ${rows.length} products to update\n`)
  
  // Validate data
  const errors: string[] = []
  const warnings: string[] = []
  
  rows.forEach((row, index) => {
    // Check for data issues
    if (!row.name) {
      errors.push(`Row ${index + 2}: Missing product name`)
    }
    
    if (!row.artist) {
      errors.push(`Row ${index + 2}: Missing artist name`)
    }
    
    // Check price format
    if (row.price && row.price !== 'POA') {
      const price = row.price.replace(/[",]/g, '')
      if (isNaN(Number(price))) {
        errors.push(`Row ${index + 2}: Invalid price format "${row.price}" for ${row.name}`)
      }
    }
    
    // Check measurements
    if (row.measurements) {
      // Special cases
      if (row.measurements === 'Wind and the Rain') {
        warnings.push(`Row ${index + 2}: "${row.name}" has text in measurements field: "${row.measurements}"`)
      } else if (row.measurements.includes('1000cm')) {
        warnings.push(`Row ${index + 2}: "${row.name}" has unusually large dimension: ${row.measurements}`)
      } else if (row.measurements === '78cm x 67') {
        warnings.push(`Row ${index + 2}: "${row.name}" missing 'cm' unit in second dimension`)
      }
    }
  })
  
  // Display validation results
  if (errors.length > 0) {
    console.log('❌ ERRORS found:\n')
    errors.forEach(err => console.log(`   ${err}`))
    console.log('\nPlease fix these errors before importing.')
    return
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n')
    warnings.forEach(warn => console.log(`   ${warn}`))
    console.log()
  }
  
  // Show summary
  const priceStats = {
    withPrice: rows.filter(r => r.price && r.price !== 'POA' && r.price !== '0').length,
    poa: rows.filter(r => r.price === 'POA').length,
    withMeasurements: rows.filter(r => r.measurements).length
  }
  
  console.log('📈 Summary:')
  console.log(`   Products with prices: ${priceStats.withPrice}`)
  console.log(`   Products marked POA: ${priceStats.poa}`)
  console.log(`   Products with measurements: ${priceStats.withMeasurements}`)
  
  // Price range
  const prices = rows
    .filter(r => r.price && r.price !== 'POA')
    .map(r => Number(r.price.replace(/[",]/g, '')))
    .filter(p => !isNaN(p))
    .sort((a, b) => a - b)
  
  if (prices.length > 0) {
    console.log(`\n💰 Price range:`)
    console.log(`   Lowest: £${prices[0]}`)
    console.log(`   Highest: £${prices[prices.length - 1]}`)
    console.log(`   Average: £${Math.round(prices.reduce((a, b) => a + b) / prices.length)}`)
  }
  
  // Ask for confirmation
  console.log('\n' + '='.repeat(50))
  console.log('Ready to update the database with these changes.')
  console.log('This will update prices and dimensions for 90 products.')
  console.log('='.repeat(50))
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to proceed...')
  
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  // Import to database
  console.log('\n📝 Updating database...\n')
  
  let successCount = 0
  let failCount = 0
  
  for (const row of rows) {
    try {
      // Format price
      let priceValue = row.price
      if (priceValue && priceValue !== 'POA') {
        priceValue = priceValue.replace(/[",]/g, '')
      }
      
      // Format dimensions (fix known issues)
      let dimensions = row.measurements
      if (dimensions === 'Wind and the Rain') {
        dimensions = '' // Clear invalid dimension
      } else if (dimensions === '78cm x 67') {
        dimensions = '78cm x 67cm' // Add missing unit
      }
      
      // Find and update product
      const product = await prisma.product.findFirst({
        where: {
          name: row.name,
          artist: row.artist
        }
      })
      
      if (product) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            price: priceValue,
            dimensions: dimensions || product.dimensions,
            updatedAt: new Date()
          }
        })
        successCount++
        console.log(`✓ Updated: ${row.name} - £${priceValue}`)
      } else {
        failCount++
        console.log(`✗ Not found: ${row.name} by ${row.artist}`)
      }
      
    } catch (error) {
      failCount++
      console.error(`✗ Error updating ${row.name}: ${error}`)
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ Import complete!')
  console.log(`   Successfully updated: ${successCount}`)
  console.log(`   Failed: ${failCount}`)
  console.log('='.repeat(50))
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })