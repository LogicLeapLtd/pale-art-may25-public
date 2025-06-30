import { NextResponse } from 'next/server'
import { getUser, isAdmin } from '@/lib/auth'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function GET() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userIsAdmin = await isAdmin(user.id)
    
    return NextResponse.json({ isAdmin: userIsAdmin })
  } catch (error) {
    console.error('Check admin status error:', error)
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    )
  }
}