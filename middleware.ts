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
  const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));

  if (!isAllowedRoute) {
    return NextResponse.redirect(new URL('/home', nextRequest.url));
  }

  if (!isPublicRoute(req)) {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.redirect(new URL('/auth/signup', req.url));
    }

    try {
      const user = await clerkClient.users.getUser(userId);
      const onboardingStep = user.publicMetadata.onboarding_step as string;

      switch (onboardingStep) {
        case 'create_organization':
          if (pathname !== '/auth/create-organization') {
            return NextResponse.redirect(new URL('/auth/create-organization', req.url));
          }
          break;
        case 'stripe_connect':
          const onboardingLink = user.publicMetadata.onboarding_link as string;
          if (onboardingLink && pathname !== onboardingLink) {
            return NextResponse.redirect(new URL(onboardingLink, req.url));
          }
          break;
        // Add more cases for other onboarding steps if needed
        default:
          // If onboarding is complete or no specific step is set, continue to the requested page
          break;
      }

      const orgId = user.publicMetadata.organization_id as string;
      if (orgId) {
        const organization = await clerkClient.organizations.getOrganization({ organizationId: orgId });
        const publicMetadata = organization.publicMetadata as { status?: string };

        if (publicMetadata.status === "suspended") {
          return NextResponse.redirect(new URL('/suspended', req.url));
        }
      }

      auth().protect();
    } catch (error) {
      console.error('Error in middleware:', error);
      return NextResponse.redirect(new URL('/error', req.url));
    }
  }

  const response = NextResponse.next();
  return corsMiddleware(nextRequest, response);
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};