import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, isAdmin } from '@/lib/auth'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure user is admin
    await requireAdmin()
    
    const { id } = await context.params
    
    // Check if target user is admin
    const targetIsAdmin = await isAdmin(id)
    if (targetIsAdmin) {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      )
    }
    
    // Delete user and all related data
    await prisma.$transaction(async (tx) => {
      // Delete user's addresses
      await tx.address.deleteMany({
        where: { userId: id }
      })
      
      // Delete user's cart items
      await tx.cartItem.deleteMany({
        where: { userId: id }
      })
      
      // Delete user's wishlist items
      await tx.wishlistItem.deleteMany({
        where: { userId: id }
      })
      
      // Delete user's enquiries
      await tx.enquiry.deleteMany({
        where: { userId: id }
      })
      
      // Note: We keep orders for record-keeping purposes
      // But we could optionally anonymize them instead
      
      // Finally, delete the user
      await tx.user.delete({
        where: { id }
      })
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}