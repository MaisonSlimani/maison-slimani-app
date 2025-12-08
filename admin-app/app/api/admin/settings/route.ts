import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // First try with all columns (including new social fields)
    const { data, error } = await supabase
      .from('settings')
      .select('email_entreprise, telephone, adresse, description, facebook, instagram, meta_pixel_code')
      .limit(1)
      .single()

    // If error is about missing columns, try without the new columns
    if (error && (error.message?.includes('column') || error.code === '42703')) {
      console.warn('New social columns not found, falling back to basic columns')
      const fallbackResult = await supabase
        .from('settings')
        .select('email_entreprise, telephone, adresse, description')
        .limit(1)
        .single()
      
      if (fallbackResult.error && fallbackResult.error.code !== 'PGRST116') {
        throw fallbackResult.error
      }
      
      // Return with null values for new fields
      return NextResponse.json({ 
        data: fallbackResult.data ? {
          ...fallbackResult.data,
          facebook: null,
          instagram: null,
          meta_pixel_code: null,
        } : null 
      })
    }

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return NextResponse.json({ data: data || null })
  } catch (error: any) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { email_entreprise, telephone, adresse, description, facebook, instagram, meta_pixel_code } = body

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: existingSettings } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single()

    // Build update object dynamically - only include fields that are explicitly provided
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Only include fields if they're explicitly provided in the request body
    // This prevents clearing fields when saving from different pages
    if (email_entreprise !== undefined) updateData.email_entreprise = email_entreprise || null
    if (telephone !== undefined) updateData.telephone = telephone || null
    if (adresse !== undefined) updateData.adresse = adresse || null
    if (description !== undefined) updateData.description = description || null
    if (facebook !== undefined) updateData.facebook = facebook || null
    if (instagram !== undefined) updateData.instagram = instagram || null
    if (meta_pixel_code !== undefined) updateData.meta_pixel_code = meta_pixel_code || null

    let result
    if (existingSettings) {
      const { data, error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single()

      // If error is about missing columns, try without the new columns
      if (error && (error.message?.includes('column') || error.code === '42703')) {
        console.warn('New social columns not found, updating without them')
        const { facebook: _, instagram: __, meta_pixel_code: ___, ...basicUpdateData } = updateData
        const fallbackResult = await supabase
          .from('settings')
          .update(basicUpdateData)
          .eq('id', existingSettings.id)
          .select()
          .single()
        
        if (fallbackResult.error) throw fallbackResult.error
        result = fallbackResult.data
      } else {
        if (error) throw error
        result = data
      }
    } else {
      const { data, error } = await supabase
        .from('settings')
        .insert(updateData)
        .select()
        .single()

      // If error is about missing columns, try without the new columns
      if (error && (error.message?.includes('column') || error.code === '42703')) {
        console.warn('New social columns not found, inserting without them')
        const { facebook: _, instagram: __, meta_pixel_code: ___, ...basicUpdateData } = updateData
        const fallbackResult = await supabase
          .from('settings')
          .insert(basicUpdateData)
          .select()
          .single()
        
        if (fallbackResult.error) throw fallbackResult.error
        result = fallbackResult.data
      } else {
        if (error) throw error
        result = data
      }
    }

    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

