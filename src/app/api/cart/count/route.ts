import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function GET() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ count: 0 })
    }

    const count = await prisma.cartItem.count({
      where: { userId: user.id }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching cart count:', error)
    return NextResponse.json({ count: 0 })
  }
}