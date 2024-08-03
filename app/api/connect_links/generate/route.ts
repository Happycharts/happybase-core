import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { createClient } from '@/app/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { orgId } = auth();

  if (!orgId) {
    return res.status(401).json({ error: 'Unauthorized' });
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
      return res.status(404).json({ error: 'Merchant not found' });
    }

    const stripeAccountId = merchant.id;

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: 'https://app.happybase.co/refresh', // Update with your actual refresh URL
      return_url: 'https://app.happybase.co/return', // Update with your actual return URL
      type: 'account_onboarding',
    });

    res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating account link:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return POST(req, res);
  } else {
    return res.status(405).end('Method Not Allowed');
  }
}
