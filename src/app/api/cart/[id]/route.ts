import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


// Force Node.js runtime
export const runtime = 'nodejs'
const updateQuantitySchema = z.object({
  quantity: z.number().int().positive()
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
    const { quantity } = updateQuantitySchema.parse(body)

    // Verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: { product: true }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Check stock
    const currentStock = cartItem.product.stock ?? 1
    if (quantity > currentStock) {
      return NextResponse.json(
        { error: `Only ${currentStock} item${currentStock === 1 ? '' : 's'} available in stock` },
        { status: 400 }
      )
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: id },
      data: { 
        quantity,
        updatedAt: new Date()
      },
      include: { product: true }
    })

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
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
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}