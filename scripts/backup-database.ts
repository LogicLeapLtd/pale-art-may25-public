import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🔒 Creating database backup...\n')
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
  const backupDir = path.join(process.cwd(), 'backups')
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  try {
    // 1. Backup Products/Artworks
    console.log('📦 Backing up Products (Artworks)...')
    const products = await prisma.product.findMany()
    const productsBackupFile = path.join(backupDir, `products-backup-${timestamp}.json`)
    fs.writeFileSync(productsBackupFile, JSON.stringify(products, null, 2))
    console.log(`✓ Backed up ${products.length} products to: ${productsBackupFile}`)
    
    // 2. Backup Artists
    console.log('\n🎨 Backing up Artists...')
    const artists = await prisma.artist.findMany()
    const artistsBackupFile = path.join(backupDir, `artists-backup-${timestamp}.json`)
    fs.writeFileSync(artistsBackupFile, JSON.stringify(artists, null, 2))
    console.log(`✓ Backed up ${artists.length} artists to: ${artistsBackupFile}`)
    
    // 3. Backup Activities
    console.log('\n📊 Backing up Activities...')
    const activities = await prisma.activity.findMany()
    const activitiesBackupFile = path.join(backupDir, `activities-backup-${timestamp}.json`)
    fs.writeFileSync(activitiesBackupFile, JSON.stringify(activities, null, 2))
    console.log(`✓ Backed up ${activities.length} activities to: ${activitiesBackupFile}`)
    
    // 4. Backup Enquiries
    console.log('\n📧 Backing up Enquiries...')
    const enquiries = await prisma.enquiry.findMany()
    const enquiriesBackupFile = path.join(backupDir, `enquiries-backup-${timestamp}.json`)
    fs.writeFileSync(enquiriesBackupFile, JSON.stringify(enquiries, null, 2))
    console.log(`✓ Backed up ${enquiries.length} enquiries to: ${enquiriesBackupFile}`)
    
    // 5. Create a combined backup
    console.log('\n💾 Creating combined backup...')
    const fullBackup = {
      timestamp,
      products,
      artists,
      activities,
      enquiries
    }
    const fullBackupFile = path.join(backupDir, `full-backup-${timestamp}.json`)
    fs.writeFileSync(fullBackupFile, JSON.stringify(fullBackup, null, 2))
    console.log(`✓ Created full backup at: ${fullBackupFile}`)
    
    // 6. Create restore script
    const restoreScript = `import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function restore() {
  const backup = JSON.parse(fs.readFileSync('${fullBackupFile}', 'utf-8'))
  
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
`
    
    const restoreScriptFile = path.join(backupDir, `restore-${timestamp}.ts`)
    fs.writeFileSync(restoreScriptFile, restoreScript)
    console.log(`\n✓ Created restore script at: ${restoreScriptFile}`)
    
    console.log('\n' + '='.repeat(50))
    console.log('✅ BACKUP COMPLETE!')
    console.log(`📁 Backup location: ${backupDir}`)
    console.log(`\n🔄 To restore, run: npx tsx ${restoreScriptFile}`)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('❌ Backup failed:', error)
    process.exit(1)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })