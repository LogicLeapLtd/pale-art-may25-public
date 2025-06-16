import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractPriceFromFilename(filename: string): string | null {
  const priceMatch = filename.match(/_(\d+)\./)
  return priceMatch ? `£${priceMatch[1]}` : null
}

function extractTitleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/_\d+$/, '') // Remove price suffix
    .replace(/\d+\.\d+$/, '') // Remove decimal numbers
    .replace(/^\d+\.?\d*/, '') // Remove leading numbers
    .trim()
}

async function processMfikelaJean() {
  const mfikelaPath = './public/ART/Art - Products/Identified - Products/Mfikela Jean'
  const files = fs.readdirSync(mfikelaPath)
  const artworkFiles = files.filter(f => f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.jpg'))
  
  for (const file of artworkFiles) {
    if (file === 'Mfikela Jean.jpeg') continue // Skip artist photo
    
    const title = extractTitleFromFilename(file)
    const price = extractPriceFromFilename(file) || 'Price on request'
    const slug = generateSlug(`${title}-mfikela-jean`)
    
    const product = {
      id: nanoid(),
      name: title,
      price: price,
      originalImageUrl: `/ART/Art - Products/Identified - Products/Mfikela Jean/${file}`,
      originalProductUrl: `/collection/${slug}`,
      localImagePath: `/ART/Art - Products/Identified - Products/Mfikela Jean/${file}`,
      description: `Original artwork by Mfikela Jean Samuel, a talented contemporary artist featured in the Palé Hall Art collection.`,
      artist: 'Mfikela Jean Samuel',
      medium: 'painting',
      category: 'identified',
      status: 'available',
      featured: false,
      slug: slug,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product
    })
    
    console.log(`Added Mfikela Jean artwork: ${title}`)
  }
}

async function processUnidentifiedCategory(categoryPath: string, medium: string) {
  const fullPath = `./public/ART/Art - Products/Unidentified - Products/${categoryPath}`
  const files = fs.readdirSync(fullPath)
  const artworkFiles = files.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'))
  
  for (const file of artworkFiles) {
    const title = extractTitleFromFilename(file) || `${medium} piece ${file.replace(/\.[^/.]+$/, '')}`
    const slug = generateSlug(`${title}-${medium}-${file.replace(/\.[^/.]+$/, '')}`)
    
    const product = {
      id: nanoid(),
      name: title,
      price: 'Price on request',
      originalImageUrl: `/ART/Art - Products/Unidentified - Products/${categoryPath}/${file}`,
      originalProductUrl: `/collection/${slug}`,
      localImagePath: `/ART/Art - Products/Unidentified - Products/${categoryPath}/${file}`,
      description: `Beautiful ${medium} piece from the Palé Hall Art collection. Contact us for more information about this artwork.`,
      artist: 'Artist Unknown',
      medium: medium,
      category: 'unidentified',
      status: 'available',
      featured: false,
      slug: slug,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product
    })
    
    console.log(`Added ${medium}: ${title}`)
  }
}

async function main() {
  console.log('Starting migration of ART folder to database...')
  
  // Process Mfikela Jean (identified artist)
  console.log('Processing Mfikela Jean artworks...')
  await processMfikelaJean()
  
  // Process unidentified categories
  console.log('Processing framed art...')
  await processUnidentifiedCategory('Art - Framed', 'painting')
  
  console.log('Processing pottery...')
  await processUnidentifiedCategory('Pottery', 'ceramics')
  
  console.log('Processing statues...')
  await processUnidentifiedCategory('Statues', 'sculpture')
  
  console.log('Migration completed!')
  
  // Show summary
  const totalProducts = await prisma.product.count()
  console.log(`Total products in database: ${totalProducts}`)
  
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})