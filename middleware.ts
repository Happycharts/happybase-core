import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from "@clerk/nextjs/server";
import { stripe } from './app/utils/stripe';

const isPublicRoute = createRouteMatcher([
  '/auth',
  '/auth/(.*)',
  '/pricing',
  '/privacy',
  '/portal/(.*)',
  '/terms',
  '/landing',
  '/api/(.*)',
]);

const allowedRoutes = [
  '/home',
  '/users',
  '/query',
  '/auth',
  '/api/(.*)',
  '/portals',
  '/billing',
  '/portal',
  '/apps',
  '/terms',
  '/privacy',
];

const allowedOrigins = [
  'http://localhost:3000',
  'https://wa.me/18657763192',
  'https://app.happybase.co',
  'https://connect.stripe.com'
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

export default clerkMiddleware(async (auth, req) => {
  const nextRequest = req as NextRequest;
  const { pathname } = nextRequest.nextUrl;
  // Check if the pathname starts with any of the allowed routes
  const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));

  // Redirect to '/home' if the route is not in the allowed list
  if (!isAllowedRoute) {
    return NextResponse.redirect(new URL('/home', nextRequest.url));
  }

  if (!isPublicRoute(req)) {
    const { userId, orgId } = auth();

    if (!userId) {
      // If there's no userId and it's not a public route, redirect to sign-in
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }


    if (!userId || !orgId) {
      // If there's no userId and it's not a public route, redirect to sign-in
      return NextResponse.redirect(new URL('/auth/create-organization', req.url));
    }

    // Redirect to '/home' if the user is already signed in
    if (userId) {
      return NextResponse.redirect(new URL('/home', req.url));
    }

    if (orgId) {
      try {
        const organization = await clerkClient.organizations.getOrganization({ organizationId: orgId });
        const publicMetadata = organization.publicMetadata as { status?: string };

        if (publicMetadata.status === "suspended") {
          // Redirect suspended organizations to a suspended page or show an error
          return NextResponse.redirect(new URL('/suspended', req.url));
        }
      } catch (error) {
        console.error('Error fetching organization metadata:', error);
        // Handle the error appropriately (e.g., redirect to an error page)
        return NextResponse.redirect(new URL('/error', req.url));
      }
    }

    auth().protect();
  }

  const response = NextResponse.next();
  return corsMiddleware(nextRequest, response);
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
