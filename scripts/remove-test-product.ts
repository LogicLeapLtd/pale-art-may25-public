import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeTestProduct() {
  try {
    // Find all test products
    const testProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Test Artwork' } },
          { slug: { contains: 'test-artwork' } },
          { category: 'test' },
          { id: { startsWith: 'test-' } }
        ]
      }
    })

    if (testProducts.length === 0) {
      console.log('No test products found in the database.')
      return
    }

    console.log(`Found ${testProducts.length} test product(s):`)
    testProducts.forEach(product => {
      console.log(`- ${product.name} (ID: ${product.id})`)
    })

    // Delete related data for each test product
    for (const product of testProducts) {
      // Delete related cart items
      const deletedCartItems = await prisma.cartItem.deleteMany({
        where: { productId: product.id }
      })
      if (deletedCartItems.count > 0) {
        console.log(`  Deleted ${deletedCartItems.count} cart items for product ${product.id}`)
      }

      // Delete related wishlist items
      const deletedWishlistItems = await prisma.wishlistItem.deleteMany({
        where: { productId: product.id }
      })
      if (deletedWishlistItems.count > 0) {
        console.log(`  Deleted ${deletedWishlistItems.count} wishlist items for product ${product.id}`)
      }

      // Delete related enquiries
      const deletedEnquiries = await prisma.enquiry.deleteMany({
        where: { productId: product.id }
      })
      if (deletedEnquiries.count > 0) {
        console.log(`  Deleted ${deletedEnquiries.count} enquiries for product ${product.id}`)
      }

      // Note: OrderItems cannot be deleted if they're part of existing orders
      // Check for existing order items
      const orderItems = await prisma.orderItem.findMany({
        where: { productId: product.id },
        include: { order: true }
      })
      
      if (orderItems.length > 0) {
        console.log(`  WARNING: ${orderItems.length} order items exist for product ${product.id}`)
        console.log(`  Orders affected:`)
        const uniqueOrders = Array.from(new Set(orderItems.map(item => item.order.orderNumber)))
        uniqueOrders.forEach(orderNumber => {
          console.log(`    - Order ${orderNumber}`)
        })
        console.log(`  Product will not be deleted to maintain order integrity.`)
        continue
      }

      // Delete the product
      await prisma.product.delete({
        where: { id: product.id }
      })
      console.log(`✓ Deleted test product: ${product.name}`)
    }

    console.log('\nTest product removal complete.')
  } catch (error) {
    console.error('Error removing test product:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeTestProduct()