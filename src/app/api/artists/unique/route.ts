import { NextResponse } from 'next/server'
import { getUniqueArtists } from '@/lib/database'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function GET() {
  try {
    const artists = await getUniqueArtists()
    return NextResponse.json(artists)
  } catch (error) {
    console.error('Error fetching unique artists:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}