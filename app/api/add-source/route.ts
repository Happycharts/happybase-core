// /api/add-source.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/app/utils/supabase/server'
import CryptoJS from 'crypto-js'

export async function POST(req: Request) {
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, credentials } = await req.json()
    if (!type || !credentials) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()

    // Encrypt only the credentials, not the type
    const { data, error } = await supabase
      .from('sources')
      .insert({
        organization: orgId,
        type,
        credentials: credentials,
        creator: userId,
      })
      .select()

    if (error) {
      console.error('Error inserting source:', error)
      return NextResponse.json({ error: 'Failed to add source' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}