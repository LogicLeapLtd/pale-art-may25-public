import { prisma } from './database'

export async function getAllArtists() {
  try {
    return await prisma.artist.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching artists:', error)
    return []
  }
}

export async function getFeaturedArtists() {
  try {
    return await prisma.artist.findMany({
      where: { featured: true },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching featured artists:', error)
    return []
  }
}

export async function getArtistBySlug(slug: string) {
  try {
    return await prisma.artist.findUnique({
      where: { slug }
    })
  } catch (error) {
    console.error('Error fetching artist:', error)
    return null
  }
}

export async function getArtistWithArtworks(slug: string) {
  try {
    const artist = await getArtistBySlug(slug)
    if (!artist) return null

    const artworks = await prisma.product.findMany({
      where: { 
        artist: {
          equals: artist.name,
          mode: 'insensitive'
        }
      },
      orderBy: { name: 'asc' }
    })

    return {
      ...artist,
      artworks
    }
  } catch (error) {
    console.error('Error fetching artist with artworks:', error)
    return null
  }
}