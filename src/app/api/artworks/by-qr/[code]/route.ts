import { NextRequest, NextResponse } from 'next/server'
import { getArtworkByQRCode } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const artwork = await getArtworkByQRCode(decodeURIComponent(code))
    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error fetching artwork by QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}