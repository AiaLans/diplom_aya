import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Если нужно сменить пароль
    if (token?.mustChangePassword && pathname !== '/change-password') {
      return NextResponse.redirect(new URL('/change-password', req.url))
    }

    if (pathname.startsWith('/superadmin') && token?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/student', req.url))
    }

    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN' && token?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/student', req.url))
    }

    if (pathname.startsWith('/curator') && token?.role !== 'CURATOR' && token?.role !== 'ADMIN' && token?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/student', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/student/:path*', '/admin/:path*', '/curator/:path*', '/company/:path*', '/supervisor/:path*', '/superadmin/:path*', '/change-password'],
}