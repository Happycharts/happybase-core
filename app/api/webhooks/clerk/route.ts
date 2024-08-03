import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent, clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe';
import { createClient } from '@/app/utils/supabase/server';
import { Analytics } from '@segment/analytics-node'

const analytics = new Analytics({ writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY! });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

async function handleUserCreated(data: any) {
  console.log('User created:', data);
  analytics.identify({
    userId: data.id,
    traits: {
      email: data.email_addresses[0].email_address,
      name: data.first_name + ' ' + data.last_name,
      createdAt: data.created_at,
    },
  });
  analytics.track({
    userId: data.id,
    event: 'User Created',
    properties: {
      email: data.email_addresses[0].email_address,
      name: data.first_name + ' ' + data.last_name,
      createdAt: data.created_at,
    },
  });
  const userId = data.id;
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      "onboarding_step": "create_organization"
    }
  });
}
async function handleOrganizationCreated(data: any) {
  try {
    console.log('Organization created event received:', JSON.stringify(data, null, 2));

    const orgId = data.id;
    const userId = data.created_by;

    console.log(`Processing organization creation for orgId: ${orgId}, userId: ${userId}`);

    // Get the user's email
    let user;
    try {
      user = await clerkClient.users.getUser(userId);
      console.log(`Retrieved user data for userId: ${userId}`);
    } catch (userError) {
      console.error(`Error fetching user data: ${userError}`);
      throw userError;
    }

    const email = user.emailAddresses[0].emailAddress;
    console.log(`User email: ${email}`);

    // Create Stripe account
    let account;
    try {
      account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      console.log(`Stripe account created: ${account.id}`);
    } catch (stripeError) {
      console.error(`Error creating Stripe account: ${stripeError}`);
      throw stripeError;
    }

    // Create Stripe account link
    let accountLink;
    try {
      accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://app.happybase.co/refresh',
        return_url: 'https://app.happybase.co/home',
        type: 'account_onboarding',
      });
      console.log(`Account link created: ${accountLink.url}`);
    } catch (linkError) {
      console.error(`Error creating account link: ${linkError}`);
      throw linkError;
    }

    // Insert into Supabase
    const supabase = createClient();
    try {
      const { data: insertedData, error } = await supabase
        .from('merchants')
        .insert({
          id: account.id,
          first_name: user.firstName,
          last_name: user.lastName,
          email: email,
          created_at: new Date().toISOString(),
          organization: data.name,
          onboarding_link: accountLink.url,
        });

      if (error) throw error;
      console.log(`Merchant data inserted into Supabase: ${JSON.stringify(insertedData)}`);
    } catch (supabaseError) {
      console.error(`Error inserting into Supabase: ${supabaseError}`);
      throw supabaseError;
    }

    // Update Clerk user metadata
    try {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          "organization_id": orgId,
          "onboarding_link": accountLink.url
        }
      });
      console.log(`Clerk user metadata updated for userId: ${userId}`);
    } catch (clerkError) {
      console.error(`Error updating Clerk user metadata: ${clerkError}`);
      throw clerkError;
    }

    console.log('Organization created event handled successfully');
  } catch (error) {
    console.error('Error in handleOrganizationCreated:', error);
    throw error; // Re-throw the error to be caught by the main handler
  }
}

// Add other event handlers here...

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload);

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    })
  }

  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data);
      break;
    case 'organization.created':
      await handleOrganizationCreated(evt.data);
      break;
    // Add other cases here...
    default:
      console.log(`Unhandled event type: ${evt.type}`);
  }

  console.log(`Webhook with an ID of ${evt.data.id} and type of ${evt.type}`)
  console.log('Webhook body:', body)

  return new Response('Webhook processed successfully', { status: 200 })
}

export async function GET(req: Request) {
  return new Response('This endpoint only accepts POST requests', { status: 405 });
}