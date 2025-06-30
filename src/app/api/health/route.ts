import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force Node.js runtime
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      status: 'ok',
      runtime: process.env.NEXT_RUNTIME || 'nodejs',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      runtime: process.env.NEXT_RUNTIME || 'nodejs'
    }, { status: 500 })
  }
} 