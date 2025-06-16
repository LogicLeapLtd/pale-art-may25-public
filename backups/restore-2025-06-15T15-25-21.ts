import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function restore() {
  const backup = JSON.parse(fs.readFileSync('/Volumes/SSD/Development/Customers/PaleHall/pale-art-websites/pale-art-may25/backups/full-backup-2025-06-15T15-25-21.json', 'utf-8'))
  
  console.log('⚠️  WARNING: This will DELETE all current data and restore from backup!')
  console.log('Press Ctrl+C to cancel, or wait 10 seconds to continue...')
  
  await new Promise(resolve => setTimeout(resolve, 10000))
  
  // Delete all current data
  await prisma.activity.deleteMany()
  await prisma.enquiry.deleteMany()
  await prisma.product.deleteMany()
  await prisma.artist.deleteMany()
  
  // Restore from backup
  if (backup.artists.length > 0) {
    await prisma.artist.createMany({ data: backup.artists })
  }
  if (backup.products.length > 0) {
    await prisma.product.createMany({ data: backup.products })
  }
  if (backup.activities.length > 0) {
    await prisma.activity.createMany({ data: backup.activities })
  }
  if (backup.enquiries.length > 0) {
    await prisma.enquiry.createMany({ data: backup.enquiries })
  }
  
  console.log('✓ Restore complete!')
}

restore()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
