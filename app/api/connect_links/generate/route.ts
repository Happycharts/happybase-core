import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { createClient } from '@/app/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export async function POST(req: NextRequest) {
  const { orgId } = auth();

  if (!orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();

  try {
    // Fetch the merchant record for the authenticated user
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('id')
      .eq('organization', orgId)
      .single();

    if (error || !merchant) {
      console.error('Error fetching merchant:', error);
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const stripeAccountId = merchant.id;

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: 'https://app.happybase.co/refresh', // Update with your actual refresh URL
      return_url: 'https://app.happybase.co/return', // Update with your actual return URL
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url }, { status: 200 });
  } catch (error) {
    console.error('Error creating account link:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
