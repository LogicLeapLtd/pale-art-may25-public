import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// Sir Kyffin Williams bio
const KYFFIN_WILLIAMS_BIO = `Sir Kyffin Williams (1918-2006) was one of Wales' most celebrated artists, renowned for his powerful landscapes and portraits that captured the essence of Welsh identity. Born on Anglesey, Williams developed a distinctive style characterized by bold palette knife work and dramatic interpretations of the Welsh landscape, particularly the mountains of Snowdonia and the coastal scenes of Anglesey.

His work is held in major collections including the National Museum Wales, Tate, and the Royal Academy. Williams was elected to the Royal Academy in 1974 and was knighted in 1999 for his services to art. His paintings command significant prices at auction and are highly sought after by collectors worldwide.

This exceptional collection represents a significant portion of Sir Kyffin Williams' oeuvre, making it one of the most important private collections of his work available today.`

async function generateSlug(text: string): Promise<string> {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function migrateSirKyffinWilliams() {
  try {
    console.log('🎨 Starting Sir Kyffin Williams migration...')
    
    // Step 1: Create Sir Kyffin Williams as an artist
    console.log('\n📝 Creating Sir Kyffin Williams artist profile...')
    
    const artistId = uuidv4()
    const artistSlug = 'sir-kyffin-williams'
    
    // Download and upload artist photo
    const artistImageUrl = 'https://upload.wikimedia.org/wikipedia/en/6/66/Kyffin_Williams.jpg' // Public domain image
    
    try {
      // Upload placeholder or find a suitable image
      const artist = await prisma.artist.create({
        data: {
          id: artistId,
          name: 'Sir Kyffin Williams',
          slug: artistSlug,
          title: 'Master of Welsh Landscape Art',
          biography: KYFFIN_WILLIAMS_BIO,
          featured: true,
          imageUrl: artistImageUrl,
          portfolioUrl: 'https://museum.wales/art/online/?action=artist&id=2'
        }
      })
      
      console.log('✅ Created artist:', artist.name)
    } catch (error) {
      console.log('⚠️  Artist may already exist, continuing...')
      const existingArtist = await prisma.artist.findUnique({
        where: { slug: artistSlug }
      })
      if (existingArtist) {
        console.log('✅ Using existing artist:', existingArtist.name)
      }
    }
    
    // Step 2: Load artwork data
    console.log('\n📂 Loading artwork data...')
    const jsonPath = path.join(process.cwd(), 'temp', 'ARTPRODUCTS', 'all_products_with_images.json')
    const artworksData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    
    console.log(`✅ Found ${artworksData.length} artworks to process`)
    
    // Step 3: Process each artwork
    console.log('\n🖼️  Processing artworks...')
    let successCount = 0
    let errorCount = 0
    const featuredIndices = [0, 1, 2, 9, 56, 73, 74, 75, 76, 77, 78, 79, 80] // Feature some prominent pieces
    
    for (let i = 0; i < artworksData.length; i++) {
      const artwork = artworksData[i]
      
      try {
        console.log(`\n[${i + 1}/${artworksData.length}] Processing: ${artwork.title}`)
        
        // Check if file exists
        const localImagePath = path.join(process.cwd(), 'temp', 'ARTPRODUCTS', artwork.local_image)
        if (!fs.existsSync(localImagePath)) {
          console.log(`❌ Image file not found: ${localImagePath}`)
          errorCount++
          continue
        }
        
        // Read the file
        const fileBuffer = fs.readFileSync(localImagePath)
        const fileExtension = path.extname(artwork.local_image)
        const mimeType = fileExtension.toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
        
        // Upload to Vercel Blob
        console.log('📤 Uploading to Vercel Blob...')
        const blob = await put(`kyffin-williams/${artwork.local_image}`, fileBuffer, {
          access: 'public',
          contentType: mimeType,
        })
        
        console.log('✅ Uploaded to:', blob.url)
        
        // Generate product data
        const productId = uuidv4()
        const slug = await generateSlug(artwork.title)
        
        // Estimate price based on title (you can adjust these ranges)
        let price = 'POA' // Price on Application
        if (artwork.title.toLowerCase().includes('landscape') || 
            artwork.title.toLowerCase().includes('snowdon') ||
            artwork.title.toLowerCase().includes('anglesey')) {
          price = '£12,500'
        } else if (artwork.title.toLowerCase().includes('portrait') ||
                   artwork.title.toLowerCase().includes('study')) {
          price = '£8,500'
        } else if (artwork.title.toLowerCase().includes('sketch') ||
                   artwork.title.toLowerCase().includes('drawing')) {
          price = '£3,500'
        } else {
          price = '£7,500'
        }
        
        // Create product in database
        const product = await prisma.product.create({
          data: {
            id: productId,
            name: artwork.title,
            price: price,
            originalImageUrl: artwork.image,
            originalProductUrl: artwork.url,
            localImagePath: blob.url,
            artist: 'Sir Kyffin Williams',
            slug: slug,
            featured: featuredIndices.includes(i),
            status: 'available',
            category: 'painting',
            description: `An exceptional work by Sir Kyffin Williams, one of Wales' most celebrated artists.`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        console.log('✅ Created product:', product.name)
        successCount++
        
      } catch (error) {
        console.error(`❌ Error processing ${artwork.title}:`, error)
        errorCount++
      }
    }
    
    // Step 4: Log activity
    await prisma.activity.create({
      data: {
        type: 'collection_import',
        title: 'Sir Kyffin Williams Collection Import',
        description: `Successfully imported ${successCount} artworks from the Sir Kyffin Williams collection`,
        metadata: {
          totalArtworks: artworksData.length,
          successCount,
          errorCount,
          artistId: artistSlug
        }
      }
    })
    
    console.log('\n📊 Migration Summary:')
    console.log(`✅ Successfully processed: ${successCount} artworks`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log('\n🎉 Sir Kyffin Williams migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateSirKyffinWilliams()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })