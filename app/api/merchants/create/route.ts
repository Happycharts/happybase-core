import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import Stripe from 'stripe';
import { auth, clerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export async function POST(request: NextRequest) {
  const { orgId, name, website } = await request.json();

  if (!orgId || !name || !website) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { userId } = auth();
    const user = await clerkClient().users.getUser(userId!);
    const supabase = createClient();

    // Check if a merchant account already exists for the user's OrgId
    const { data: merchantData, error: merchantError } = await supabase
      .from('merchants')
      .select('*')
      .eq('organization', orgId)
      .maybeSingle();

    if (merchantError) {
      throw new Error('Error checking merchant account: ' + merchantError.message);
    }

    if (!merchantData) {
      // If no merchant account exists, create a Stripe Connect Account
      const account = await stripe.accounts.create({
        country: 'US',
        email: user.emailAddresses[0].emailAddress,
        business_profile: {
          name: name,
          url: website,
        },
        business_type: 'company',
        type: 'express',
      });

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://app.happybase.co/expired-link',
        return_url: 'https://app.happybase.co/home',
        type: 'account_onboarding',
      });

      // Insert the new merchant account into the database
      const { error: insertError } = await supabase
        .from('merchants')
        .insert([
          {
            id: account.id,
            organization: orgId,
            url: account.business_profile!.url,
            email: account.email,
            company: account.business_profile?.name,
            first_name: user.firstName,
            last_name: user.lastName,
            onboarding_link: accountLink.url,
            revenue: null,
            clicks: null,
          },
        ]);

      if (insertError) {
        throw new Error('Error inserting merchant account: ' + insertError.message);
      }

      console.log('Stripe account created:', account.id);
      console.log('Stripe account link created:', accountLink.url);

      const response = NextResponse.json({
        message: 'Merchant account created successfully',
        accountId: account.id,
        onboardingLink: accountLink.url,
      }, { status: 200 });

      // Set a cookie with the account link
      response.cookies.set('stripeAccountLink', accountLink.url, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 5, // 5 minutes
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ message: 'Merchant account already exists' }, { status: 200 });
  } catch (error) {
    console.error('Error creating merchant account:', error);
    return NextResponse.json({ error: 'Failed to create merchant account' }, { status: 500 });
  }
}