"use server"
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import cors from 'cors';

const isPublicRoute = createRouteMatcher([
  '/auth',     // This matches exactly '/auth'
  '/auth/(.*)',  // This matches '/auth/' and any path under it
  '/pricing',
  '/privacy',
  '/terms',
  '/landing',
  '/api/(.*)',
]);

const allowedRoutes = [
  '/editor',
  '/home',
  '/sources',
  '/users',
  '/catalogs',
  '/api',
  '/query',
  '/auth',
  '/local/',
  '/local/editor',
  '/warehouses/',
  '/terms',
  '/privacy',
  '/pricing',
];

const allowedOrigins = [
  'http://localhost:3000',
  'https://app.happybase.co'
  // Add other allowed origins as needed
];

function corsMiddleware(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin') ?? '';
  
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info, ApiKey');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

export default clerkMiddleware((auth, req) => {
  const nextRequest = req as NextRequest;
  const { pathname } = nextRequest.nextUrl;

  // Check if the pathname starts with any of the allowed routes
  const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));

  // Redirect to '/home' if the route is not in the allowed list
  if (!isAllowedRoute) {
    return NextResponse.redirect(new URL('/home', nextRequest.url));
  }

  if (!isPublicRoute(req)) {
    auth().protect();
  }

  const response = NextResponse.next();
  return corsMiddleware(nextRequest, response);
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};