import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestProduct() {
  try {
    // Generate a unique ID
    const testId = `test-${Date.now()}`
    
    const testProduct = await prisma.product.create({
      data: {
        id: testId,
        name: 'Test Artwork - Delete Me',
        slug: 'test-artwork-delete-me',
        price: '0.01',
        artist: 'Test Artist',
        description: 'This is a test product for testing the checkout flow. Price is £0.01.',
        medium: 'Digital Test',
        dimensions: '100 x 100 cm',
        year: '2024',
        category: 'test',
        status: 'available',
        originalImageUrl: '/ART/landscape-hero-2.jpg',
        localImagePath: '/ART/landscape-hero-2.jpg',
        originalProductUrl: 'https://palehall.co.uk/test-product',
        updatedAt: new Date()
      }
    })

    console.log('Test product created:', testProduct)
    console.log(`\nYou can view it at: /collection/${testProduct.slug}`)
  } catch (error) {
    console.error('Error creating test product:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestProduct()