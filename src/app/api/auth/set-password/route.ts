import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email, password } = body

    if (!token || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid invitation' },
        { status: 404 }
      )
    }

    // Check if password field contains invitation token
    if (!user.password.startsWith('INVITE:')) {
      return NextResponse.json(
        { message: 'This account has already been activated' },
        { status: 400 }
      )
    }

    // Parse the invitation data
    const [prefix, storedToken, expiryStr, originalHash] = user.password.split(':')
    
    if (storedToken !== token) {
      return NextResponse.json(
        { message: 'Invalid invitation token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    const expiry = new Date(expiryStr)
    if (expiry < new Date()) {
      return NextResponse.json(
        { message: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10)

    // Update user with new password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    })

    // Add user to admin list by creating admin entry
    // Since we don't have a separate admin table, we'll add their email to the admin list
    // This is handled by the isAdmin function in auth.ts

    return NextResponse.json({ 
      message: 'Password set successfully',
      success: true 
    })

  } catch (error) {
    console.error('Failed to set password:', error)
    return NextResponse.json(
      { message: 'Failed to set password' },
      { status: 500 }
    )
  }
}