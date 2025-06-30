import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


// Force Node.js runtime
export const runtime = 'nodejs'
const addressSchema = z.object({
  name: z.string(),
  line1: z.string(),
  line2: z.string().optional().nullable(),
  city: z.string(),
  county: z.string().optional().nullable(),
  postalCode: z.string(),
  country: z.string(),
  isDefault: z.boolean()
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const data = addressSchema.parse(body)

    // Verify ownership
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    // If this is set as default, unset other defaults
    if (data.isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: user.id,
          isDefault: true,
          NOT: { id: id }
        },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.update({
      where: { id: id },
      data
    })

    return NextResponse.json({ address })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating address:', error)
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify ownership
    const address = await prisma.address.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    await prisma.address.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}