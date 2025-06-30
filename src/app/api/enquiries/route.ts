import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendEnquiryEmail } from '@/lib/email'


// Force Node.js runtime
export const runtime = 'nodejs'
const enquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
  artworkId: z.string(),
  artworkName: z.string(),
  artist: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = enquirySchema.parse(body)

    // Get the product to verify it exists
    const product = await prisma.product.findUnique({
      where: { id: data.artworkId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    // Create the enquiry in the database
    const enquiry = await prisma.enquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: 'Artwork Enquiry',
        message: data.message,
        productId: data.artworkId,
        status: 'pending'
      }
    })

    // Send email to art@palehall.co.uk
    try {
      await sendEnquiryEmail({
        enquiry: {
          ...enquiry,
          product: {
            name: data.artworkName,
            artist: data.artist || null
          }
        }
      })
    } catch (emailError) {
      console.error('Failed to send enquiry email:', emailError)
      // Don't fail the request if email fails - the enquiry is still saved
    }

    return NextResponse.json({ 
      success: true, 
      enquiryId: enquiry.id 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Enquiry submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit enquiry' },
      { status: 500 }
    )
  }
}