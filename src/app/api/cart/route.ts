import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parsePrice } from '@/lib/pricing'


// Force Node.js runtime
export const runtime = 'nodejs'
const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1)
})

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ items: [], total: 0 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate total
    let total = 0
    const itemsWithPricing = cartItems.map(item => {
      const priceInfo = parsePrice(item.product.price)
      const itemTotal = priceInfo.value ? priceInfo.value * item.quantity : 0
      total += itemTotal
      
      return {
        ...item,
        priceInfo,
        itemTotal
      }
    })

    return NextResponse.json({ 
      items: itemsWithPricing, 
      total,
      count: cartItems.length 
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, quantity } = addToCartSchema.parse(body)

    // Check if product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.status !== 'available') {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      )
    }

    // Check stock
    const currentStock = product.stock ?? 1
    if (currentStock === 0) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      )
    }

    // Check if product is purchasable (not POA or £0)
    const priceInfo = parsePrice(product.price)
    if (!priceInfo.isPurchasable) {
      return NextResponse.json(
        { error: 'This item requires an enquiry' },
        { status: 400 }
      )
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId
        }
      }
    })

    if (existingItem) {
      // Check if we have enough stock for the combined quantity
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > currentStock) {
        return NextResponse.json(
          { error: `Only ${currentStock} item${currentStock === 1 ? '' : 's'} available in stock` },
          { status: 400 }
        )
      }
      
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: newQuantity,
          updatedAt: new Date()
        },
        include: { product: true }
      })
      
      return NextResponse.json({ item: updatedItem })
    } else {
      // Check if requested quantity is available
      if (quantity > currentStock) {
        return NextResponse.json(
          { error: `Only ${currentStock} item${currentStock === 1 ? '' : 's'} available in stock` },
          { status: 400 }
        )
      }
      
      // Create new cart item
      const newItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity
        },
        include: { product: true }
      })
      
      return NextResponse.json({ item: newItem })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Clear entire cart
    await prisma.cartItem.deleteMany({
      where: { userId: user.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}