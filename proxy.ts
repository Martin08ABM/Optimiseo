import { type NextRequest } from 'next/server'
import { updateSession } from '@/src/lib/supabase/proxy'

export default async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
  ],
}
