import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'


// Force Node.js runtime
export const runtime = 'nodejs'
const validStatuses = ['paid_for', 'awaiting_shipping', 'awaiting_collection', 'on_route', 'fulfilled']

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    
    const resolvedParams = await params
    const { status } = await request.json()

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id: resolvedParams.id },
      data: { 
        status,
        updatedAt: new Date(),
        shippedAt: status === 'on_route' ? new Date() : undefined,
        deliveredAt: status === 'fulfilled' ? new Date() : undefined
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'order_status_update',
        title: `Order ${updatedOrder.orderNumber} status updated`,
        description: `Order status changed to ${status}`,
        metadata: {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          previousStatus: updatedOrder.status,
          newStatus: status
        }
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}