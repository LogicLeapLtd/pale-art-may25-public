import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function toTitleCase(str: string): string {
  // Handle special cases and abbreviations
  const specialCases: { [key: string]: string } = {
    'CBE': 'CBE',
    'RA': 'RA',
    'RWS': 'RWS',
    'HRSA': 'HRSA',
    'RSW': 'RSW',
    'PRBA': 'PRBA',
    'RE': 'RE',
    'HRMS': 'HRMS',
    'ROI': 'ROI',
    'DE': 'de',
    'VAN': 'van',
    'VON': 'von',
    'MC': 'Mc',
    'MAC': 'Mac'
  }
  
  return str.split(' ').map(word => {
    // Check if it's a special case
    const upperWord = word.toUpperCase()
    if (specialCases[upperWord]) {
      return specialCases[upperWord]
    }
    
    // Handle hyphenated words
    if (word.includes('-')) {
      return word.split('-').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join('-')
    }
    
    // Regular title case
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join(' ')
}

async function fixArtistCapitalization() {
  console.log('Fixing artist name capitalization...\n')
  
  try {
    // Get all artworks with artists
    const artworks = await prisma.product.findMany({
      where: {
        artist: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        artist: true
      }
    })
    
    let updateCount = 0
    const updates: { id: string; oldArtist: string; newArtist: string }[] = []
    
    for (const artwork of artworks) {
      if (artwork.artist) {
        // Check if artist name is all caps or has issues
        const hasCapsProblem = artwork.artist === artwork.artist.toUpperCase() && artwork.artist.length > 3
        
        if (hasCapsProblem) {
          const newArtist = toTitleCase(artwork.artist)
          
          if (newArtist !== artwork.artist) {
            updates.push({
              id: artwork.id,
              oldArtist: artwork.artist,
              newArtist: newArtist
            })
            
            // Update in database
            await prisma.product.update({
              where: { id: artwork.id },
              data: { artist: newArtist }
            })
            
            updateCount++
            console.log(`✓ Fixed: "${artwork.artist}" → "${newArtist}" (${artwork.name})`)
          }
        }
      }
    }
    
    console.log('\n=== SUMMARY ===')
    console.log(`Total artworks checked: ${artworks.length}`)
    console.log(`Artists fixed: ${updateCount}`)
    
    if (updateCount > 0) {
      console.log('\n=== UNIQUE ARTIST CHANGES ===')
      const uniqueChanges = new Map<string, string>()
      updates.forEach(update => {
        uniqueChanges.set(update.oldArtist, update.newArtist)
      })
      
      uniqueChanges.forEach((newArtist, oldArtist) => {
        console.log(`"${oldArtist}" → "${newArtist}"`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixArtistCapitalization()