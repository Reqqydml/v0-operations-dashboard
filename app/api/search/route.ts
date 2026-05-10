import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const searchTerm = `%${query.toLowerCase()}%`

    // Search across multiple tables
    const [projects, tasks, users] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, slug, description')
        .ilike('name', searchTerm)
        .limit(Math.ceil(limit / 3)),

      supabase
        .from('tasks')
        .select('id, title, project_id')
        .ilike('title', searchTerm)
        .limit(Math.ceil(limit / 3)),

      supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', searchTerm)
        .limit(Math.ceil(limit / 3)),
    ])

    const results = [
      ...(projects.data || []).map((p: any) => ({
        id: p.id,
        title: p.name,
        description: p.description,
        type: 'project',
        href: `/projects/${p.slug}`,
      })),
      ...(tasks.data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        type: 'task',
        href: `/tasks/${t.id}`,
      })),
      ...(users.data || []).map((u: any) => ({
        id: u.id,
        title: u.full_name,
        type: 'user',
        href: `/team/${u.id}`,
      })),
    ]

    return NextResponse.json(results.slice(0, limit))
  } catch (error) {
    console.error('[v0] Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
