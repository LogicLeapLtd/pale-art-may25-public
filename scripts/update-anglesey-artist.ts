import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAngleseyArtist() {
  try {
    const artwork = await prisma.product.update({
      where: { id: '66a5c130-39af-490b-bf65-36e9d7b70144' },
      data: { artist: 'Sir Kyffin Williams RA' }
    })
    
    console.log('✓ Updated "Anglesey in Winter" artist to Sir Kyffin Williams RA')
    console.log(`  Name: ${artwork.name}`)
    console.log(`  Artist: ${artwork.artist}`)
    console.log(`  Price: ${artwork.price}`)
    console.log(`  Dimensions: ${artwork.dimensions}`)
    
  } catch (error) {
    console.error('Error updating artwork:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAngleseyArtist()