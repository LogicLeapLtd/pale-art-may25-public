import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser, verifyPassword, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


// Force Node.js runtime
export const runtime = 'nodejs'
const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8)
})

export async function PUT(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = passwordSchema.parse(body)

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true }
    })

    if (!userWithPassword) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const validPassword = await verifyPassword(currentPassword, userWithPassword.password)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}