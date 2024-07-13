// /api/fetch-sources.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/app/utils/supabase/server'
import CryptoJS from 'crypto-js'

export async function GET() {
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('organization', orgId)

    if (error) {
      console.error('Error fetching sources:', error)
      return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
    }

    console.log(data);

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}