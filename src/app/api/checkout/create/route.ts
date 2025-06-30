import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { z } from 'zod'


// Force Node.js runtime
export const runtime = 'nodejs'
const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive()
  })),
  shippingAddressId: z.string().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
})

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
    const { items, shippingAddressId, successUrl, cancelUrl } = checkoutSchema.parse(body)

    // Fetch products and validate
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Some products not found' },
        { status: 400 }
      )
    }

    // Create line items for Stripe
    const lineItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)!
      
      // Check if product has a valid price (not POA or £0)
      const price = parseFloat(product.price.replace(/[£,]/g, ''))
      if (isNaN(price) || price <= 0) {
        throw new Error(`Product ${product.name} is not available for purchase`)
      }

      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product.name,
            description: product.artist ? `by ${product.artist}` : undefined,
            images: product.localImagePath ? [product.localImagePath] : undefined,
            metadata: {
              productId: product.id,
              artist: product.artist || '',
              medium: product.medium || '',
              year: product.year || ''
            }
          },
          unit_amount: formatAmountForStripe(price, 'gbp')
        },
        quantity: item.quantity
      }
    })

    // Get shipping address if provided
    let shippingOptions = undefined
    if (shippingAddressId) {
      const address = await prisma.address.findFirst({
        where: {
          id: shippingAddressId,
          userId: user.id
        }
      })

      if (address) {
        // You can customize shipping options based on the address
        shippingOptions = [{
          shipping_rate_data: {
            type: 'fixed_amount' as const,
            fixed_amount: {
              amount: formatAmountForStripe(15, 'gbp'), // £15 shipping
              currency: 'gbp'
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day' as const,
                value: 5
              },
              maximum: {
                unit: 'business_day' as const,
                value: 10
              }
            }
          }
        }]
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: user.stripeCustomerId || undefined,
      customer_email: !user.stripeCustomerId ? user.email : undefined,
      shipping_options: shippingOptions,
      shipping_address_collection: !shippingAddressId ? {
        allowed_countries: ['GB', 'US', 'CA', 'AU', 'NZ', 'IE', 'FR', 'DE', 'IT', 'ES']
      } : undefined,
      metadata: {
        userId: user.id,
        productIds: productIds.join(',')
      },
      payment_intent_data: {
        metadata: {
          userId: user.id,
          productIds: productIds.join(',')
        }
      }
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}