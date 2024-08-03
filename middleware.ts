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
  '/api/(.*)', // Ensure this matches all API routes
  '/api/webhooks(.*)'
]);

const allowedRoutes = [
  '/home',
  '/users',
  '/query',
  '/auth',
  '/api/(.*)', // Ensure this matches all API routes
  '/portals',
  '/api/webhooks(.*)',
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
  'https://connect.stripe.com',
  'https://www.happybase.co',
  'https://buy.stripe.com'
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
  const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));

  if (pathname.startsWith('/api/webhooks')) {
    return NextResponse.next();
  }
  console.log(`Request to ${pathname} - isAllowedRoute: ${isAllowedRoute}`);

  if (!isAllowedRoute) {
    console.log(`Redirecting to /home because ${pathname} is not an allowed route`);
    return NextResponse.redirect(new URL('/home', nextRequest.url));
  }


  if (!isPublicRoute(req)) {
    const { userId } = auth();

    if (!userId) {
      console.log(`Redirecting to /auth/signup because user is not authenticated`);
      return NextResponse.redirect(new URL('/auth/signup', req.url));
    }
    const user = await clerkClient.users.getUser(userId);

      const orgId = user.publicMetadata.organization_id as string;
      if (orgId) {
        const organization = await clerkClient.organizations.getOrganization({ organizationId: orgId });
        const publicMetadata = organization.publicMetadata as { status?: string };

        if (publicMetadata.status === "suspended") {
          console.log(`Redirecting to /suspended because organization is suspended`);
          return NextResponse.redirect(new URL('/suspended', req.url));
        }
      }
      if (userId && !orgId) {
        return NextResponse.redirect(new URL('/auth/create-organization', req.url));
      }
      auth().protect();
  }

  const response = NextResponse.next();
  return corsMiddleware(nextRequest, response);
});

export const config = {
  matcher: ['/((?!.*\\..*|_next|api/webhooks).*)', '/', '/(api|trpc)(.*)'],
};