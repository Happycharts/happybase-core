import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent, auth, clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe';
import { createClient } from '@/app/utils/supabase/server';
import { Analytics } from '@segment/analytics-node'
const analytics = new Analytics({ writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY! });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16', // Use the latest API version
});
// Placeholder functions for each event type
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
  analytics.track(
    {
      userId: data.id,
      event: 'User Created',
      properties: {
        email: data.email_addresses[0].email_address,
        name: data.first_name + ' ' + data.last_name,
        createdAt: data.created_at,
      },
    }
  )
}

async function handleOrganizationMembershipCreated(data: any) {
  console.log('Organization membership created:', data);
  // Implement organization membership creation logic here
  analytics.track(
    {
      userId: data.id,
      event: 'Organization Membership Created',
      properties: {
        email: data.email_addresses[0].email_address,
        name: data.first_name + ' ' + data.last_name,
        createdAt: data.created_at,
      },
    }
  )
}

async function handleUserUpdated(data: any) {
  console.log('User updated:', data);
  // Implement user update logic here
}

async function handleOrganizationMembershipDeleted(data: any) {
  console.log('Organization membership deleted:', data);
  // Implement organization membership deletion logic here
}

async function handleOrganizationMembershipUpdated(data: any) {
  console.log('Organization membership updated:', data);
  // Implement organization membership update logic here
}

async function handleUserDeleted(data: any) {
  console.log('User deleted:', data);
  // Implement user deletion logic here
  analytics.track(
    {
      userId: data.id,
      event: 'User Deleted',
      properties: {
        email: data.email_addresses[0].email_address,
        name: data.first_name + ' ' + data.last_name,
        createdAt: data.created_at,
      },
    }
  )
}

async function handleUserCreatedAtEdge(data: any) {
  console.log('User created at edge:', data);
  // Implement edge user creation logic here
}

async function handleEmailCreated(data: any) {
  console.log('Email created:', data);
  // Implement email creation logic here
}

async function handleOrganizationCreated(data: any) {
  console.log('Organization created:', data);
  analytics.track(
    {
      userId: data.id,
      event: 'Organization Created',
      properties: {
        name: data.name,
        createdAt: data.created_at,
      },
    }
  )
  
  const stripe = require('stripe')('sk_test_51Pcn4rRoqPQJF71ALzpSkFCm3GOnDu2YSZHe3DKnNyw8gAHnfo04QoJXi7Kq51kFSDc8IJrMogmLkKvSBksYC9Ol00MAbOy2v8');
  const account = await stripe.accounts.create
(
{
    type: 'express',
    country: 'US',
    email: data.email_addresses[0].email_address,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  }
);

const supabase = createClient();

const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: 'https://app.happybase.co/refresh',
  return_url: 'https://app.happybase.co/home',
  type: 'account_onboarding',
});

  // Extract domain from email
const email = data.email_addresses[0].email_address;
const domain = email.split('@')[1];

const event = await supabase
.from('merchants')
.insert({
  id: account.id,
  first_name: data.first_name,
  last_name: data.last_name,
  email: email,
  domain: domain, // Add the extracted domain
  created_at: data.created_at,
  organization: data.organization_memberships[0].organization.name,
  onboarding_link: accountLink.url,
})
.select();

async function handleOrganizationUpdated(data: any) {
  console.log('Organization updated:', data);
  // Implement organization update logic here
}

async function handleOrganizationDeleted(data: any) {
  console.log('Organization deleted:', data);
  // Implement organization deletion logic here
}

async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the event based on its type
  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data);
      break;
    case 'organizationMembership.created':
      await handleOrganizationMembershipCreated(evt.data);
      break;
    case 'user.updated':
      await handleUserUpdated(evt.data);
      break;
    case 'organizationMembership.deleted':
      await handleOrganizationMembershipDeleted(evt.data);
      break;
    case 'organizationMembership.updated':
      await handleOrganizationMembershipUpdated(evt.data);
      break;
    case 'user.deleted':
      await handleUserDeleted(evt.data);
      break;
    case 'email.created':
      await handleEmailCreated(evt.data);
      break;
    case 'organization.created':
      await handleOrganizationCreated(evt.data);
      break;
    case 'organization.updated':
      await handleOrganizationUpdated(evt.data);
      break;
    case 'organization.deleted':
      await handleOrganizationDeleted(evt.data);
      break;
    default:
      console.log(`Unhandled event type: ${evt.type}`);
  }
  

  // Log the event details
  console.log(`Webhook with an ID of ${evt.data.id} and type of ${evt.type}`)
  console.log('Webhook body:', body)

  return new Response('', { status: 200 })
  }
}