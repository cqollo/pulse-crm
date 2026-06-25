import { NextResponse } from 'next/server'

// Auth is handled client-side in CRMProvider.
// This middleware is intentionally minimal — no SSR cookie complexity.
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
