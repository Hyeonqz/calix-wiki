import { NextResponse } from 'next/server'

const TOKEN = 'calix-til-auth-token'

export function proxy(request) {
  const auth = request.cookies.get('til-auth')
  if (!auth || auth.value !== TOKEN) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/til/:path*'],
}
