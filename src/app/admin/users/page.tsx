import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import UserManagement from './UserManagement'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  // Ensure user is admin
  await requireAdmin()
  
  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
      emailVerified: true,
      _count: {
        select: {
          orders: true,
          enquiries: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  // Get admin emails from auth config
  const adminEmails = [
    'admin@palehall.co.uk',
    'art@palehall.co.uk',
    'joanna@palehall.co.uk'
  ]
  
  return <UserManagement users={users} adminEmails={adminEmails} />
}