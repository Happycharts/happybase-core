"use server"
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import cors from 'cors';

const isPublicRoute = createRouteMatcher([
  '/auth',     // This matches exactly '/auth'
  '/auth/(.*)'  // This matches '/auth/' and any path under it
]);


const allowedOrigins = [
  'http://localhost:3000',
  'https://your-production-domain.com'
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
  const nextRequest = new NextRequest(req);
  const { pathname } = nextRequest.nextUrl;

  if (!isPublicRoute(req)) {
    auth().protect();
  }

  const response = NextResponse.next();
  return corsMiddleware(nextRequest, response);
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};