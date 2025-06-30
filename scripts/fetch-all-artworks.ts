import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fetchAllArtworks() {
  try {
    const artworks = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Just output the JSON without extra text
    console.log(JSON.stringify(artworks, null, 2))
  } catch (error) {
    console.error('Error fetching artworks:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fetchAllArtworks()