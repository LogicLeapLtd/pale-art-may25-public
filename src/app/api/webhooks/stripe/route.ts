import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates, EMAIL_CONFIG } from '@/lib/email'
import Stripe from 'stripe'


// Force Node.js runtime
export const runtime = 'nodejs'
async function generateOrderNumber(): Promise<string> {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  
  // Get count of orders this month
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const count = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfMonth
      }
    }
  })
  
  const orderNum = (count + 1).toString().padStart(4, '0')
  return `PH${year}${month}${orderNum}`
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Get the full session with line items
        const fullSession = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ['line_items', 'line_items.data.price.product']
          }
        )

        if (!fullSession.metadata?.userId) {
          console.error('No userId in session metadata')
          break
        }

        // Create order
        const orderNumber = await generateOrderNumber()
        const order = await prisma.order.create({
          data: {
            userId: fullSession.metadata.userId,
            orderNumber,
            stripeSessionId: fullSession.id,
            stripePaymentId: fullSession.payment_intent as string,
            status: 'paid',
            subtotal: (fullSession.amount_subtotal || 0) / 100,
            tax: (fullSession.total_details?.amount_tax || 0) / 100,
            shipping: (fullSession.total_details?.amount_shipping || 0) / 100,
            total: (fullSession.amount_total || 0) / 100,
            currency: fullSession.currency || 'gbp',
            paidAt: new Date()
          }
        })

        // Create order items
        if (fullSession.line_items?.data) {
          for (const item of fullSession.line_items.data) {
            const productData = item.price?.product as Stripe.Product
            if (productData?.metadata?.productId) {
              await prisma.orderItem.create({
                data: {
                  orderId: order.id,
                  productId: productData.metadata.productId,
                  quantity: item.quantity || 1,
                  price: (item.price?.unit_amount || 0) / 100,
                  total: (item.amount_total || 0) / 100
                }
              })

              // Decrease product stock
              await prisma.product.update({
                where: { id: productData.metadata.productId },
                data: { 
                  stock: {
                    decrement: item.quantity || 1
                  }
                }
              })

              // Remove from all carts
              await prisma.cartItem.deleteMany({
                where: { productId: productData.metadata.productId }
              })
            }
          }
        }

        // If user doesn't have a Stripe customer ID, update it
        if (fullSession.customer && typeof fullSession.customer === 'string') {
          await prisma.user.update({
            where: { id: fullSession.metadata.userId },
            data: { stripeCustomerId: fullSession.customer }
          })
        }

        // Get order details for email
        const orderWithItems = await prisma.order.findUnique({
          where: { id: order.id },
          include: {
            user: true,
            items: {
              include: {
                product: true
              }
            }
          }
        })

        if (orderWithItems) {
          // Send order confirmation email
          const emailContent = emailTemplates.orderConfirmation({
            customerName: orderWithItems.user.name,
            orderNumber: orderWithItems.orderNumber,
            orderDate: orderWithItems.createdAt.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            items: orderWithItems.items.map(item => ({
              name: item.product.name,
              artist: item.product.artist || undefined,
              price: item.price,
              quantity: item.quantity
            })),
            subtotal: orderWithItems.subtotal,
            tax: orderWithItems.tax,
            shipping: orderWithItems.shipping,
            total: orderWithItems.total
          })

          await sendEmail({
            to: orderWithItems.user.email,
            subject: emailContent.subject,
            html: emailContent.html
          })

          // Send notification to admin
          await sendEmail({
            to: EMAIL_CONFIG.adminEmail,
            subject: `New Order - ${orderWithItems.orderNumber}`,
            html: `
              <p>A new order has been placed:</p>
              <p><strong>Order Number:</strong> ${orderWithItems.orderNumber}<br/>
              <strong>Customer:</strong> ${orderWithItems.user.name}<br/>
              <strong>Total:</strong> £${orderWithItems.total.toFixed(2)}</p>
              <p>View full details in the admin dashboard.</p>
            `
          })
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        if (paymentIntent.metadata?.userId) {
          // Update order status if exists
          const order = await prisma.order.findFirst({
            where: { stripePaymentId: paymentIntent.id }
          })

          if (order) {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'failed' }
            })
          }
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        
        // Find order by payment intent
        const order = await prisma.order.findFirst({
          where: { stripePaymentId: charge.payment_intent as string }
        })

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'refunded' }
          })

          // Restore product stock
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: order.id }
          })

          for (const item of orderItems) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { 
                stock: {
                  increment: item.quantity
                }
              }
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}