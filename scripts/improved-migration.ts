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

function toTitleCase(str: string): string {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

function extractPriceFromFilename(filename: string): string | null {
  const priceMatch = filename.match(/_(\d+)\./)
  return priceMatch ? `£${priceMatch[1]}` : null
}

function parseNumberingSystem(filename: string): { baseNumber: string, subNumber?: string, isMainImage: boolean } {
  // Extract pattern like "1.1", "1.2", "2", "3.1" etc.
  const numberMatch = filename.match(/^(\d+)(?:\.(\d+))?/)
  if (!numberMatch) return { baseNumber: '0', isMainImage: true }
  
  const baseNumber = numberMatch[1]
  const subNumber = numberMatch[2]
  const isMainImage = !subNumber // Main image is the one without decimal (1, 2, 3)
  
  return { baseNumber, subNumber, isMainImage }
}

function createArtworkTitle(filename: string, medium: string, index: number): string {
  const { baseNumber } = parseNumberingSystem(filename)
  
  // Create descriptive titles based on medium and numbering
  const mediumTitles = {
    'Ceramics': ['Ceramic Vessel', 'Pottery Form', 'Clay Sculpture', 'Ceramic Bowl', 'Earthenware Piece'],
    'Sculpture': ['Abstract Form', 'Contemporary Sculpture', 'Carved Piece', 'Modern Figure', 'Sculptural Work'],
    'Painting': ['Abstract Composition', 'Contemporary Canvas', 'Painted Study', 'Artistic Expression', 'Modern Work'],
    'Mixed Media': ['Mixed Media Piece', 'Contemporary Collage', 'Artistic Composition', 'Modern Assembly', 'Creative Work']
  }
  
  const titles = mediumTitles[medium as keyof typeof mediumTitles] || ['Artwork', 'Piece', 'Work', 'Creation', 'Study']
  const baseTitle = titles[index % titles.length]
  
  return `${baseTitle} ${baseNumber}`
}

function groupImagesByNumber(files: string[]): { [key: string]: string[] } {
  const groups: { [key: string]: string[] } = {}
  
  files.forEach(file => {
    const { baseNumber } = parseNumberingSystem(file)
    if (!groups[baseNumber]) {
      groups[baseNumber] = []
    }
    groups[baseNumber].push(file)
  })
  
  return groups
}

async function processImprovedMfikelaJean() {
  console.log('Processing Mfikela Jean artworks with improved naming...')
  
  const mfikelaPath = './public/ART/Art - Products/Identified - Products/Mfikela Jean'
  const files = fs.readdirSync(mfikelaPath)
  const artworkFiles = files.filter(f => 
    (f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.jpg')) && 
    f !== 'Mfikela Jean.jpeg'
  )
  
  console.log(`Found ${artworkFiles.length} Mfikela Jean artwork files`)
  
  let processedCount = 0
  
  // Process each artwork file separately since they don't follow the numbering system
  for (const file of artworkFiles) {
    const price = extractPriceFromFilename(file) || 'Price on request'
    
    // Extract the artwork name from filename (before price)
    let artworkName = file
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/_\d+$/, '') // Remove price suffix
    
    // Convert to proper title case
    artworkName = toTitleCase(artworkName.replace(/([A-Z])/g, ' $1').trim())
    
    const slug = generateSlug(`${artworkName}-mfikela-jean-samuel`)
    
    const product = {
      id: nanoid(),
      name: artworkName,
      price: price,
      originalImageUrl: `/ART/Art - Products/Identified - Products/Mfikela Jean/${file}`,
      originalProductUrl: `/collection/${slug}`,
      localImagePath: `/ART/Art - Products/Identified - Products/Mfikela Jean/${file}`,
      description: `"${artworkName}" is an original contemporary artwork by Mfikela Jean Samuel, a rising talent in the contemporary art scene. This piece showcases the artist's unique vision and technical skill, demonstrating mastery of form, color, and emotional expression.`,
      createdAt: new Date(),
      updatedAt: new Date(),
      artist: 'Mfikela Jean Samuel',
      dimensions: 'Dimensions available upon request',
      featured: Math.random() > 0.6, // Feature more of Mfikela's work since he's identified
      medium: 'Mixed Media',
      year: '2024',
      slug: slug,
      status: 'available',
      category: 'identified'
    }
    
    console.log(`Creating: "${artworkName}" - ${price}`)
    
    try {
      await prisma.product.create({ data: product })
      processedCount++
    } catch (error) {
      console.error(`Error creating ${artworkName}:`, error)
    }
  }
  
  console.log(`✅ Processed ${processedCount} Mfikela Jean artworks`)
}

async function processImprovedUnidentifiedArt() {
  console.log('Processing unidentified artworks with improved naming...')
  
  const categories = [
    { folder: 'Art - Framed', medium: 'Painting', displayName: 'Framed Artworks' },
    { folder: 'Pottery', medium: 'Ceramics', displayName: 'Ceramic Works' },
    { folder: 'Statues', medium: 'Sculpture', displayName: 'Sculptural Pieces' }
  ]
  
  let totalProcessed = 0
  
  for (const category of categories) {
    console.log(`\nProcessing ${category.displayName}...`)
    
    const categoryPath = `./public/ART/Art - Products/Unidentified - Products/${category.folder}`
    if (!fs.existsSync(categoryPath)) {
      console.log(`Directory not found: ${categoryPath}`)
      continue
    }
    
    const files = fs.readdirSync(categoryPath)
    const artworkFiles = files.filter(f => 
      f.toLowerCase().endsWith('.jpeg') || 
      f.toLowerCase().endsWith('.jpg') || 
      f.toLowerCase().endsWith('.png')
    )
    
    const imageGroups = groupImagesByNumber(artworkFiles)
    let categoryCount = 0
    
    for (const [baseNumber, groupFiles] of Object.entries(imageGroups)) {
      const mainImage = groupFiles.find(f => parseNumberingSystem(f).isMainImage) || groupFiles[0]
      const additionalImages = groupFiles.filter(f => f !== mainImage)
      
      const title = createArtworkTitle(mainImage, category.medium, categoryCount)
      const slug = generateSlug(`${title}-${category.medium.toLowerCase()}`)
      
      const descriptions = {
        'Ceramics': 'A beautiful ceramic piece showcasing traditional craftsmanship with contemporary appeal. This work demonstrates exceptional skill in clay manipulation and glazing techniques.',
        'Sculpture': 'An expressive sculptural work that captures form and movement in three dimensions. This piece demonstrates masterful understanding of material and space.',
        'Painting': 'A compelling painted work that explores color, composition, and artistic expression. This piece showcases sophisticated technique and creative vision.'
      }
      
      const product = {
        id: nanoid(),
        name: title,
        price: 'Price on request',
        originalImageUrl: `/ART/Art - Products/Unidentified - Products/${category.folder}/${mainImage}`,
        originalProductUrl: `/collection/${slug}`,
        localImagePath: `/ART/Art - Products/Unidentified - Products/${category.folder}/${mainImage}`,
        description: descriptions[category.medium as keyof typeof descriptions] || 'A unique artwork in the Palé Hall Art collection.',
        createdAt: new Date(),
        updatedAt: new Date(),
        artist: 'Artist Unknown',
        dimensions: 'Dimensions available upon request',
        featured: Math.random() > 0.8, // Randomly feature fewer unidentified pieces
        medium: category.medium,
        year: 'Contemporary',
        slug: slug,
        status: 'available',
        category: 'unidentified'
      }
      
      console.log(`Creating: ${title} (${groupFiles.length} images)`)
      
      try {
        await prisma.product.create({ data: product })
        categoryCount++
        totalProcessed++
        
        if (additionalImages.length > 0) {
          console.log(`  Additional images: ${additionalImages.join(', ')}`)
        }
      } catch (error) {
        console.error(`Error creating ${title}:`, error)
      }
    }
    
    console.log(`✅ Processed ${categoryCount} artworks in ${category.displayName}`)
  }
  
  console.log(`\n✅ Total unidentified artworks processed: ${totalProcessed}`)
}

async function main() {
  console.log('🎨 Starting improved art collection migration...')
  console.log('This migration respects your numbering system and creates better names.\n')
  
  try {
    // Clear existing data
    console.log('Clearing existing products...')
    await prisma.product.deleteMany({})
    
    // Process with improved naming
    await processImprovedMfikelaJean()
    await processImprovedUnidentifiedArt()
    
    // Show final stats
    const totalCount = await prisma.product.count()
    const featuredCount = await prisma.product.count({ where: { featured: true } })
    const identifiedCount = await prisma.product.count({ where: { category: 'identified' } })
    const unidentifiedCount = await prisma.product.count({ where: { category: 'unidentified' } })
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('📊 Final Statistics:')
    console.log(`   Total artworks: ${totalCount}`)
    console.log(`   Identified artists: ${identifiedCount}`)
    console.log(`   Unidentified works: ${unidentifiedCount}`)
    console.log(`   Featured pieces: ${featuredCount}`)
    console.log('\n✨ Your numbering system has been preserved!')
    console.log('   Each base number (1, 2, 3) represents one artwork')
    console.log('   Additional images (1.1, 1.2) are logged for future gallery implementation')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)