/*
 * ========================================
 * FILE: client/src/middleware.ts (UPDATE)
 * LOKASI: src/middleware.ts
 * ========================================
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode'; // Kita perlu library baru

// Tipe untuk payload token
interface TokenPayload {
  user: {
    id: number;
    email: string;
    role: 'admin' | 'staff' | 'user';
  };
}

/**
 * Middleware (Si "Satpam" Frontend)
 * Sekarang lebih pintar, bisa mengecek role
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Skenario A: Ingin ke area terproteksi
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!token) {
      // 1. TIDAK punya token? Lempar ke /login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. PUNYA token, mari kita periksa role-nya
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const userRole = decoded.user.role;

      // Ingin ke /admin TAPI BUKAN 'admin'?
      if (pathname.startsWith('/admin') && userRole !== 'admin') {
        // Lempar ke dashboard user biasa
        console.warn(`Akses ditolak: User (role: ${userRole}) mencoba ke ${pathname}`);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // (Boleh tambahkan: Ingin ke /dashboard TAPI 'admin'?)
      // (Mungkin admin juga punya dashboard sendiri?)
      // (Untuk saat ini, kita biarkan admin bisa akses dashboard user)
    } catch (error) {
      // Token rusak/gagal decode? Hapus cookie & paksa login ulang
      console.error('Token decode error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Skenario B: Ingin ke /login atau /register TAPI SUDAH punya token
  if ((pathname === '/login' || pathname === '/register') && token) {
    // Lempar ke /dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Skenario C: Aman (misal ke Homepage), biarkan lewat
  return NextResponse.next();
}

// Config matcher tidak perlu diubah, 'matcher' ini sudah mencakup /admin
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
