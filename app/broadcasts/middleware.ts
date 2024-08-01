// File: /middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  if (path.startsWith('/broadcasts/')) {
    const id = path.split('/')[2]
    const supabase = createClient()

    const { data: broadcast, error } = await supabase
      .from('broadcasts')
      .select('expiration_date')
      .eq('id', id)
      .single()

    if (error || !broadcast) {
      return NextResponse.redirect(new URL('/404', request.url))
    }

    const now = new Date()
    const expirationDate = new Date(broadcast.expiration_date)

    if (now > expirationDate) {
      return NextResponse.redirect(new URL('/expired', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/broadcasts/:path*',
}