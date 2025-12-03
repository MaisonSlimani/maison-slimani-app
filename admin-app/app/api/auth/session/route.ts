import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth/session'

export async function GET() {
  const email = await verifyAdminSession()
  return NextResponse.json({ authenticated: !!email, email })
}

