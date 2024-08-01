import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export async function POST(request: NextRequest) {
  const { orgId, email } = await request.json();

  if (!orgId || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
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
        type: 'express',
        country: 'US', // Replace with the appropriate country code
        email: email,
      });

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://app.happybase.co/reauth',
        return_url: 'https://app.happybase.co/onboarding-success',
        type: 'account_onboarding',
      });

      // Insert the new merchant account into the database
      const { error: insertError } = await supabase
        .from('merchants')
        .insert([
          {
            id: account.id,
            organization: orgId,
            onboarding_link: accountLink.url,
            revenue: null,
            clicks: null,
          },
        ]);

      if (insertError) {
        throw new Error('Error inserting merchant account: ' + insertError.message);
      }
    }

    return NextResponse.json({ message: 'Merchant account created or already exists' }, { status: 200 });
  } catch (error) {
    console.error('Error creating merchant account:', error);
    return NextResponse.json({ error: 'Failed to create merchant account' }, { status: 500 });
  }
}
