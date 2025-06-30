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
    
    // 5. Backup Users
    console.log('\n👤 Backing up Users...')
    const users = await prisma.user.findMany()
    const usersBackupFile = path.join(backupDir, `users-backup-${timestamp}.json`)
    fs.writeFileSync(usersBackupFile, JSON.stringify(users, null, 2))
    console.log(`✓ Backed up ${users.length} users to: ${usersBackupFile}`)
    
    // 6. Backup Addresses
    console.log('\n📍 Backing up Addresses...')
    const addresses = await prisma.address.findMany()
    const addressesBackupFile = path.join(backupDir, `addresses-backup-${timestamp}.json`)
    fs.writeFileSync(addressesBackupFile, JSON.stringify(addresses, null, 2))
    console.log(`✓ Backed up ${addresses.length} addresses to: ${addressesBackupFile}`)
    
    // 7. Backup Orders
    console.log('\n🛒 Backing up Orders...')
    const orders = await prisma.order.findMany()
    const ordersBackupFile = path.join(backupDir, `orders-backup-${timestamp}.json`)
    fs.writeFileSync(ordersBackupFile, JSON.stringify(orders, null, 2))
    console.log(`✓ Backed up ${orders.length} orders to: ${ordersBackupFile}`)
    
    // 8. Backup Order Items
    console.log('\n📦 Backing up Order Items...')
    const orderItems = await prisma.orderItem.findMany()
    const orderItemsBackupFile = path.join(backupDir, `orderItems-backup-${timestamp}.json`)
    fs.writeFileSync(orderItemsBackupFile, JSON.stringify(orderItems, null, 2))
    console.log(`✓ Backed up ${orderItems.length} order items to: ${orderItemsBackupFile}`)
    
    // 9. Backup Cart Items
    console.log('\n🛒 Backing up Cart Items...')
    const cartItems = await prisma.cartItem.findMany()
    const cartItemsBackupFile = path.join(backupDir, `cartItems-backup-${timestamp}.json`)
    fs.writeFileSync(cartItemsBackupFile, JSON.stringify(cartItems, null, 2))
    console.log(`✓ Backed up ${cartItems.length} cart items to: ${cartItemsBackupFile}`)
    
    // 10. Backup Wishlist Items
    console.log('\n❤️ Backing up Wishlist Items...')
    const wishlistItems = await prisma.wishlistItem.findMany()
    const wishlistItemsBackupFile = path.join(backupDir, `wishlistItems-backup-${timestamp}.json`)
    fs.writeFileSync(wishlistItemsBackupFile, JSON.stringify(wishlistItems, null, 2))
    console.log(`✓ Backed up ${wishlistItems.length} wishlist items to: ${wishlistItemsBackupFile}`)
    
    // 11. Create a combined backup
    console.log('\n💾 Creating combined backup...')
    const fullBackup = {
      timestamp,
      products,
      artists,
      activities,
      enquiries,
      users,
      addresses,
      orders,
      orderItems,
      cartItems,
      wishlistItems
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