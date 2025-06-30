import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
}

async function fixMissingSlugs() {
  try {
    // Find all products without slugs or with UUID-style IDs as slugs
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: '' },
          // Match UUID pattern
          { slug: { contains: '-' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${products.length} products with missing or invalid slugs`)

    // Check which ones have UUID-style slugs
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const productsToFix = products.filter(p => 
      !p.slug || p.slug === '' || uuidPattern.test(p.slug)
    )

    console.log(`${productsToFix.length} products need slug fixes`)

    // Update each product with a proper slug
    for (const product of productsToFix) {
      let baseSlug = generateSlug(product.name)
      let slug = baseSlug
      let counter = 1

      // Check if slug already exists
      let existingProduct = await prisma.product.findFirst({
        where: { 
          slug,
          NOT: { id: product.id }
        }
      })

      // If slug exists, add a number to make it unique
      while (existingProduct) {
        slug = `${baseSlug}-${counter}`
        counter++
        existingProduct = await prisma.product.findFirst({
          where: { 
            slug,
            NOT: { id: product.id }
          }
        })
      }

      // Update the product with the new slug
      await prisma.product.update({
        where: { id: product.id },
        data: { slug }
      })

      console.log(`Updated: "${product.name}" -> slug: "${slug}"`)
    }

    console.log('\nSlug fixes complete!')

    // Show some examples of the fixed slugs
    const updatedProducts = await prisma.product.findMany({
      where: {
        id: { in: productsToFix.map(p => p.id) }
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      take: 10
    })

    console.log('\nExample updated products:')
    updatedProducts.forEach(p => {
      console.log(`- ${p.name}: /collection/${p.slug}`)
    })

  } catch (error) {
    console.error('Error fixing slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Also check for any collection page route issues
async function checkCollectionRoutes() {
  try {
    const productsWithoutSlugs = await prisma.product.count({
      where: {
        OR: [
          { slug: null },
          { slug: '' }
        ]
      }
    })

    if (productsWithoutSlugs > 0) {
      console.log(`\nWARNING: ${productsWithoutSlugs} products still have no slugs!`)
    } else {
      console.log('\nAll products now have valid slugs.')
    }

    // Check for duplicate slugs
    const products = await prisma.product.findMany({
      select: { slug: true }
    })

    const slugCounts = products.reduce((acc, p) => {
      if (p.slug) {
        acc[p.slug] = (acc[p.slug] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const duplicates = Object.entries(slugCounts).filter(([_, count]) => count > 1)
    
    if (duplicates.length > 0) {
      console.log('\nWARNING: Found duplicate slugs:')
      duplicates.forEach(([slug, count]) => {
        console.log(`- "${slug}" appears ${count} times`)
      })
    }

  } catch (error) {
    console.error('Error checking routes:', error)
  }
}

// Run the fix
fixMissingSlugs().then(() => checkCollectionRoutes())