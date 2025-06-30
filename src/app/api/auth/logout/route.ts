import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'


// Force Node.js runtime
export const runtime = 'nodejs'
export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
  
  return NextResponse.json({ success: true })
}