import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAbstract1() {
  try {
    const artwork = await prisma.product.findFirst({
      where: {
        name: 'Abstract1'
      }
    })
    
    if (artwork) {
      console.log('Complete Abstract1 artwork record:')
      console.log('━'.repeat(50))
      console.log('ID:', artwork.id)
      console.log('Name:', artwork.name)
      console.log('Artist:', artwork.artist)
      console.log('Description:', artwork.description)
      console.log('Price:', artwork.price)
      console.log('Medium:', artwork.medium)
      console.log('Year:', artwork.year)
      console.log('Dimensions:', artwork.dimensions)
      console.log('Status:', artwork.status)
      console.log('Category:', artwork.category)
      console.log('Slug:', artwork.slug)
      console.log('Featured:', artwork.featured)
      console.log('Original Image URL:', artwork.originalImageUrl)
      console.log('Local Image Path:', artwork.localImagePath)
      console.log('Original Product URL:', artwork.originalProductUrl)
      console.log('Created At:', artwork.createdAt)
      console.log('Updated At:', artwork.updatedAt)
      console.log('━'.repeat(50))
    } else {
      console.log('No artwork found with name "Abstract1"')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAbstract1()