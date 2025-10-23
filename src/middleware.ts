import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

/**
 * Middleware Next.js pour la protection des routes
 * Vérifie l'authentification et redirige si nécessaire
 */

// Routes protégées nécessitant une authentification
const protectedRoutes = ['/dashboard', '/habits'];

// Routes publiques accessibles sans authentification
const publicRoutes = ['/login', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // Récupérer et déchiffrer la session
  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  // Rediriger vers /login si route protégée sans session
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Rediriger vers /dashboard si déjà connecté et sur page publique
  if (
    isPublicRoute &&
    session?.userId &&
    !path.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

// Configuration du matcher pour le middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};



