import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.product.count()
  console.log(`Total products in database: ${count}`)
  
  const latestProducts = await prisma.product.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log('\nLatest 5 products:')
  latestProducts.forEach(p => {
    console.log(`- ${p.name} (ID: ${p.id}, Created: ${p.createdAt})`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())