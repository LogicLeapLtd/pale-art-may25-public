import { NextRequest, NextResponse } from 'next/server'
import { getArtworkBySlugOrId } from '@/lib/database'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const artwork = await getArtworkBySlugOrId(decodeURIComponent(slug))
    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error fetching artwork by slug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}