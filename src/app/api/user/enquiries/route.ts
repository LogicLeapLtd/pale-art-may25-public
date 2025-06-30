import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function GET() {
  try {
    const user = await requireAuth()
    
    // Get enquiries for the authenticated user
    const enquiries = await prisma.enquiry.findMany({
      where: {
        email: user.email // Match by email since older enquiries might not have userId
      },
      include: {
        product: {
          select: {
            name: true,
            artist: true,
            localImagePath: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(enquiries)
  } catch (error) {
    console.error('Error fetching user enquiries:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch enquiries' },
      { status: 500 }
    )
  }
}