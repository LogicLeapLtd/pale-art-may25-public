import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'


// Force Node.js runtime
export const runtime = 'nodejs'
const checkoutSchema = z.object({
  addressId: z.string().nullable(),
  deliveryMethod: z.enum(['shipping', 'collection']),
  includeShipping: z.boolean()
})

const SHIPPING_RATE_CENTS = 2500 // £25

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const data = checkoutSchema.parse(body)

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: payload.userId },
      include: {
        product: true
      }
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get delivery address if shipping
    let shippingAddress = null
    if (data.deliveryMethod === 'shipping' && data.addressId) {
      const address = await prisma.address.findFirst({
        where: {
          id: data.addressId,
          userId: payload.userId
        }
      })

      if (!address) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 })
      }

      shippingAddress = {
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        state: address.county || undefined,
        postal_code: address.postalCode,
        country: address.country
      }
    }

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map(item => {
      const unitAmount = Math.round(parseFloat(item.product.price) * 100) // Convert to cents

      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.product.name,
            description: item.product.artist || undefined,
            images: item.product.localImagePath ? [`${process.env.NEXT_PUBLIC_BASE_URL}${item.product.localImagePath}`] : []
          },
          unit_amount: unitAmount
        },
        quantity: item.quantity
      }
    })

    // Add shipping if needed
    if (data.includeShipping) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Shipping & Handling',
            description: 'Secure packaging and tracked delivery'
          },
          unit_amount: SHIPPING_RATE_CENTS
        },
        quantity: 1
      })
    }

    // Create metadata for the webhook
    const metadata: Record<string, string> = {
      userId: payload.userId,
      deliveryMethod: data.deliveryMethod
    }

    if (data.addressId) {
      metadata.addressId = data.addressId
    }

    // Create product IDs and quantities for metadata
    const productIds = cartItems.map(item => item.productId).join(',')
    const quantities = cartItems.map(item => item.quantity).join(',')
    metadata.productIds = productIds
    metadata.quantities = quantities

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId || undefined,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      metadata,
      ...(shippingAddress && {
        shipping_address_collection: {
          allowed_countries: ['GB', 'US']
        },
        shipping_options: [{
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'gbp'
            },
            display_name: 'Address already collected'
          }
        }]
      }),
      payment_intent_data: {
        metadata
      }
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Checkout error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}