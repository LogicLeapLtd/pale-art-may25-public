import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { sendEmail, emailTemplates } from '@/lib/email'
import { cookies } from 'next/headers'


// Force Node.js runtime
export const runtime = 'nodejs'
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, phone } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email,
      name,
      phone: phone || undefined,
      metadata: {
        source: 'website_registration'
      }
    })

    // Create user with Stripe customer ID
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        stripeCustomerId: stripeCustomer.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        stripeCustomerId: true,
        createdAt: true
      }
    })

    // Create token and set cookie
    const token = await createToken(user.id)
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    // Send welcome email
    const emailContent = emailTemplates.welcome({ name })
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
    })

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}