import { NextResponse } from 'next/server'
import { deleteAdminSession } from '@/lib/auth/session'

export async function POST() {
  await deleteAdminSession()
  return NextResponse.json({ success: true })
}

