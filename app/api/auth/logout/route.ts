import { NextResponse } from 'next/server'
import { deleteAdminSession } from '@/lib/auth/session'

export async function POST() {
  try {
    await deleteAdminSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    return NextResponse.json({ success: true }) // Retourner success même en cas d'erreur
  }
}

