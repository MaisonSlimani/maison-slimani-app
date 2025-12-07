import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const categorie = searchParams.get('categorie')

    // Build base query
    let query = supabase.from('produits').select('prix, stock, taille, couleurs, has_colors, categorie')

    // Filter by category if provided
    if (categorie) {
      query = query.eq('categorie', categorie)
    }

    const { data: produits, error } = await query

    if (error) {
      throw error
    }

    if (!produits || produits.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          minPrice: 0,
          maxPrice: 0,
          tailles: [],
          couleurs: [],
          categories: [],
        },
      })
    }

    // Extract unique values
    const prices = produits.map((p: any) => p.prix).filter((p: number) => p != null)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    // Extract unique tailles from tailles array structure (only sizes with stock > 0)
    const taillesSet = new Set<string>()
    produits.forEach((p: any) => {
      // Check product.tailles array (new structure)
      if (p.tailles && Array.isArray(p.tailles)) {
        p.tailles.forEach((t: any) => {
          if (t.nom && t.stock > 0) {
            taillesSet.add(t.nom)
          }
        })
      }
      // Backward compatibility: Check product.taille field (comma-separated string)
      else if (p.taille) {
        const productTailles = p.taille.split(',').map((t: string) => t.trim()).filter((t: string) => t)
        // Only add if product has stock
        if (p.stock > 0) {
          productTailles.forEach((taille: string) => {
            taillesSet.add(taille)
          })
        }
      }
      // Check couleurs array - each couleur can have tailles array
      if (p.has_colors && p.couleurs) {
        try {
          const couleurs = typeof p.couleurs === 'string' ? JSON.parse(p.couleurs) : p.couleurs
          if (Array.isArray(couleurs)) {
            couleurs.forEach((c: any) => {
              // Check tailles array (new structure)
              if (c.tailles && Array.isArray(c.tailles)) {
                c.tailles.forEach((t: any) => {
                  if (t.nom && t.stock > 0) {
                    taillesSet.add(t.nom)
                  }
                })
              }
              // Backward compatibility: Check taille field
              else if (c.taille) {
                const couleurTailles = c.taille.split(',').map((t: string) => t.trim()).filter((t: string) => t)
                // Only add if color has stock
                if (c.stock > 0) {
                  couleurTailles.forEach((taille: string) => {
                    taillesSet.add(taille)
                  })
                }
              }
            })
          }
        } catch {
          // Skip invalid JSON
        }
      }
    })
    // Sort tailles numerically if they're numbers, otherwise alphabetically
    const tailles = Array.from(taillesSet).sort((a, b) => {
      const numA = parseInt(a, 10)
      const numB = parseInt(b, 10)
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }
      return a.localeCompare(b)
    })

    // Extract unique couleurs with their codes (case-insensitive)
    const couleursMap = new Map<string, { nom: string; code: string }>() // Map lowercase name to {nom, code}
    produits.forEach((p: any) => {
      if (p.has_colors && p.couleurs) {
        try {
          const couleurs = typeof p.couleurs === 'string' ? JSON.parse(p.couleurs) : p.couleurs
          if (Array.isArray(couleurs)) {
            couleurs.forEach((c: any) => {
              if (c.nom) {
                const lowerName = c.nom.toLowerCase()
                // If we haven't seen this color (case-insensitive), add it
                // If we have, prefer the version with capital first letter
                if (!couleursMap.has(lowerName)) {
                  // Capitalize first letter
                  const capitalizedName = c.nom.charAt(0).toUpperCase() + c.nom.slice(1).toLowerCase()
                  couleursMap.set(lowerName, { nom: capitalizedName, code: c.code || '#000000' })
                } else {
                  // If current version has capital first letter, prefer it
                  const existing = couleursMap.get(lowerName)!
                  if (c.nom.charAt(0) === c.nom.charAt(0).toUpperCase() && existing.nom.charAt(0) !== existing.nom.charAt(0).toUpperCase()) {
                    couleursMap.set(lowerName, { nom: c.nom, code: c.code || existing.code || '#000000' })
                  }
                }
              }
            })
          }
        } catch {
          // Skip invalid JSON
        }
      }
    })
    // Convert to array of objects with name and code
    const couleurs = Array.from(couleursMap.values())
      .sort((a, b) => a.nom.localeCompare(b.nom))

    // Extract unique categories (only if not filtering by category)
    const categoriesSet = new Set<string>()
    if (!categorie) {
      produits.forEach((p: any) => {
        if (p.categorie) {
          categoriesSet.add(p.categorie)
        }
      })
    }
    const categories = Array.from(categoriesSet).sort()

    return NextResponse.json({
      success: true,
      data: {
        minPrice,
        maxPrice,
        tailles,
        couleurs,
        categories,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des options de filtre:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des options de filtre',
      },
      { status: 500 }
    )
  }
}

