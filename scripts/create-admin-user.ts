import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const adminEmails = [
      { email: 'admin@palehall.co.uk', name: 'Admin User', password: 'PaleHallArt2024!' },
      { email: 'art@palehall.co.uk', name: 'Art Manager', password: 'PaleHallArt2024!' },
      { email: 'joanna@palehall.co.uk', name: 'Joanna', password: 'PaleHallArt2024!' }
    ]
    
    for (const admin of adminEmails) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: admin.email }
      })
      
      if (existingUser) {
        console.log(`User ${admin.email} already exists`)
        continue
      }
      
      // Create new admin user
      const hashedPassword = await hashPassword(admin.password)
      
      const user = await prisma.user.create({
        data: {
          email: admin.email,
          name: admin.name,
          password: hashedPassword,
          emailVerified: new Date()
        }
      })
      
      console.log(`Created admin user: ${user.email}`)
    }
    
    console.log('\nAdmin users created successfully!')
    console.log('Default password for all admin users: PaleHallArt2024!')
    console.log('\nIMPORTANT: Please change these passwords after first login!')
    
  } catch (error) {
    console.error('Error creating admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()