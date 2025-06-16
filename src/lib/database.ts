import { prisma } from './prisma'
import type { Product } from '@prisma/client'

export { prisma }

export async function getAllArtworks(): Promise<Product[]> {
  return await prisma.product.findMany({
    where: {
      OR: [
        { localImagePath: { not: '' } },
        { originalImageUrl: { not: '' } }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getArtworkBySlug(slug: string): Promise<Product | null> {
  return await prisma.product.findFirst({
    where: { slug }
  })
}

export async function getArtworksByMedium(medium: string): Promise<Product[]> {
  return await prisma.product.findMany({
    where: { 
      medium: { 
        equals: medium, 
        mode: 'insensitive' 
      },
      OR: [
        { localImagePath: { not: '' } },
        { originalImageUrl: { not: '' } }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getArtworksByArtist(artist: string): Promise<Product[]> {
  return await prisma.product.findMany({
    where: { 
      artist: { 
        equals: artist, 
        mode: 'insensitive' 
      },
      OR: [
        { localImagePath: { not: '' } },
        { originalImageUrl: { not: '' } }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getFeaturedArtworks(): Promise<Product[]> {
  return await prisma.product.findMany({
    where: { 
      featured: true,
      OR: [
        { localImagePath: { not: '' } },
        { originalImageUrl: { not: '' } }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getAvailableArtworks(): Promise<Product[]> {
  return await prisma.product.findMany({
    where: { status: 'available' },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function searchArtworks(query: string): Promise<Product[]> {
  return await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { artist: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { medium: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getUniqueArtists(): Promise<string[]> {
  const artists = await prisma.product.findMany({
    select: { artist: true },
    distinct: ['artist']
  })
  return artists.map(a => a.artist).filter(Boolean) as string[]
}

export async function getUniqueMediums(): Promise<string[]> {
  const mediums = await prisma.product.findMany({
    select: { medium: true },
    distinct: ['medium']
  })
  return mediums.map(m => m.medium).filter(Boolean) as string[]
}

export async function getArtworkByQRCode(qrCode: string): Promise<Product | null> {
  // For now, we'll use slug as QR code identifier since the schema doesn't have a specific QR field
  return await prisma.product.findFirst({
    where: { slug: qrCode }
  })
}

export async function getArtworkBySlugOrId(identifier: string): Promise<Product | null> {
  return await prisma.product.findFirst({
    where: {
      OR: [
        { slug: identifier },
        { id: identifier }
      ]
    }
  })
}

// New functions for artwork manager
export async function updateArtwork(id: string, data: Partial<Product>): Promise<Product> {
  return await prisma.product.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  })
}

export async function deleteArtwork(id: string): Promise<Product> {
  return await prisma.product.delete({
    where: { id }
  })
}

export async function createArtwork(data: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<Product> {
  return await prisma.product.create({
    data: {
      ...data,
      updatedAt: new Date()
    }
  })
}