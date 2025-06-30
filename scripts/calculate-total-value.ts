import fs from 'fs'

// Read the artworks JSON file
const artworks = JSON.parse(fs.readFileSync('artworks-updated.json', 'utf8'))

let totalValue = 0
let validPriceCount = 0
let invalidPriceCount = 0
const invalidPrices: any[] = []

artworks.forEach((artwork: any) => {
  // Skip if price is empty, null, or "SOLD"
  if (!artwork.price || artwork.price === '' || artwork.price.toLowerCase() === 'sold') {
    invalidPriceCount++
    invalidPrices.push({
      name: artwork.name,
      price: artwork.price || '(empty)'
    })
    return
  }
  
  // Handle special price formats
  let priceNum = 0
  
  // Check for "Pair £X" format - extract the first price only
  const pairMatch = artwork.price.match(/Pair\s*£([\d,]+(?:\.\d+)?)/i)
  if (pairMatch) {
    priceNum = parseFloat(pairMatch[1].replace(/,/g, ''))
  } else {
    // Extract the first price found in the string
    const priceMatch = artwork.price.match(/£?([\d,]+(?:\.\d+)?)/i)
    if (priceMatch) {
      priceNum = parseFloat(priceMatch[1].replace(/,/g, ''))
    }
  }
  
  if (!isNaN(priceNum)) {
    totalValue += priceNum
    validPriceCount++
  } else {
    invalidPriceCount++
    invalidPrices.push({
      name: artwork.name,
      price: artwork.price
    })
  }
})

console.log('=== COLLECTION VALUE ANALYSIS ===\n')
console.log(`Total artworks: ${artworks.length}`)
console.log(`Artworks with valid prices: ${validPriceCount}`)
console.log(`Artworks without valid prices: ${invalidPriceCount}`)

if (invalidPrices.length > 0) {
  console.log('\nArtworks excluded from total:')
  invalidPrices.forEach(art => {
    console.log(`  - ${art.name}: "${art.price}"`)
  })
}

console.log(`\nTOTAL COLLECTION VALUE: £${totalValue.toLocaleString('en-GB', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`)

// Show some interesting stats
const avgPrice = totalValue / validPriceCount
console.log(`\nAverage artwork price: £${avgPrice.toLocaleString('en-GB', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`)

// Find most expensive artworks
const sortedByPrice = artworks
  .filter((a: any) => a.price && a.price.toLowerCase() !== 'sold' && a.price !== '')
  .map((a: any) => {
    let priceNum = 0
    const pairMatch = a.price.match(/Pair\s*£([\d,]+(?:\.\d+)?)/i)
    if (pairMatch) {
      priceNum = parseFloat(pairMatch[1].replace(/,/g, ''))
    } else {
      const priceMatch = a.price.match(/£?([\d,]+(?:\.\d+)?)/i)
      if (priceMatch) {
        priceNum = parseFloat(priceMatch[1].replace(/,/g, ''))
      }
    }
    return { ...a, priceNum }
  })
  .filter((a: any) => !isNaN(a.priceNum) && a.priceNum > 0)
  .sort((a: any, b: any) => b.priceNum - a.priceNum)

console.log('\nTop 5 most expensive artworks:')
sortedByPrice.slice(0, 5).forEach((art: any, index: number) => {
  console.log(`${index + 1}. ${art.name} by ${art.artist || 'Unknown'}: £${art.priceNum.toLocaleString('en-GB')}`)
})