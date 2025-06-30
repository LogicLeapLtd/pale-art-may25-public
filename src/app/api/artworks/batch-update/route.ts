import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// Force Node.js runtime
export const runtime = 'nodejs'
// Batch update artworks
export async function POST(request: NextRequest) {
  try {
    const { ids, updates } = await request.json()
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No artwork IDs provided' }, { status: 400 })
    }
    
    // Build update data object, only including non-empty values
    const updateData: any = {}
    
    if (updates.status && updates.status !== '') {
      updateData.status = updates.status
    }
    
    if (updates.featured !== undefined && updates.featured !== '') {
      updateData.featured = updates.featured === 'true'
    }
    
    if (updates.medium && updates.medium !== '') {
      updateData.medium = updates.medium
    }
    
    if (updates.category && updates.category !== '') {
      updateData.category = updates.category
    }
    
    // Update all artworks with the provided IDs
    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({ 
      message: `Successfully updated ${result.count} artworks`,
      count: result.count 
    })
  } catch (error) {
    console.error('Error batch updating artworks:', error)
    return NextResponse.json({ error: 'Failed to batch update artworks' }, { status: 500 })
  }
}