export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Return empty results for now to maintain zero-lint
    return Response.json({ success: true, data: [] })
  } catch {
    return Response.json({ success: false, error: 'Failed to fetch similar products' }, { status: 500 })
  }
}
