import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from "@clerk/nextjs/server";

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
  '/api/',
  '/broadcasts',
  '/webhooks/',
  '/portal',
  '/apps',
  '/terms',
  '/privacy',
];

const allowedOrigins = [
  'http://localhost:3000',
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

  // Check for Stripe account link cookie
  const stripeAccountLink = nextRequest.cookies.get('stripeAccountLink');
  if (stripeAccountLink) {
    const response = NextResponse.redirect(stripeAccountLink.value);
    response.cookies.delete('stripeAccountLink');
    return response;
  }

  // Check if the pathname starts with any of the allowed routes
  const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));

  // Redirect to '/home' if the route is not in the allowed list
  if (!isAllowedRoute) {
    return NextResponse.redirect(new URL('/home', nextRequest.url));
  }

  if (!isPublicRoute(req)) {
    const { userId } = auth();

    if (userId) {
      const user = await clerkClient.users.getUser(userId);
      const stripeCustomerId = user.privateMetadata.stripeCustomerId;

      if (!stripeCustomerId) {
        return NextResponse.redirect('https://buy.stripe.com/test_aEU8zLaUR9uW8aQ4gh');
      }

      // Return private metadata if needed
      return NextResponse.json(user.privateMetadata);
    }

    auth().protect();
  }

  const response = NextResponse.next();
  return corsMiddleware(nextRequest, response);
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};