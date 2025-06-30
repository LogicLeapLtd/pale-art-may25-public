import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createToken, isAdmin } from '@/lib/auth'
import { cookies } from 'next/headers'


// Force Node.js runtime
export const runtime = 'nodejs'
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        phone: true,
        stripeCustomerId: true,
        createdAt: true,
        emailVerified: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const validPassword = await verifyPassword(password, user.password)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create token and set cookie
    const token = await createToken(user.id)
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    // Check if user is admin
    const userIsAdmin = await isAdmin(user.id)
    
    // Return user without password, including admin status
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ 
      user: userWithoutPassword,
      isAdmin: userIsAdmin
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}