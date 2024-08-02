import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent, auth, } from '@clerk/nextjs/server'
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16', // Use the latest API version
});
// Placeholder functions for each event type
async function handleUserCreated(data: any) {
  console.log('User created:', data);
  // Implement user creation logic here
}

async function handleOrganizationMembershipCreated(data: any) {
  console.log('Organization membership created:', data);
  // Implement organization membership creation logic here
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

  try {
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      name: data.name,
      metadata: {
        clerk_organization_id: data.id,
        clerk_organization_name: data.name,
        clerk_organization_image_url: data.imageUrl,
        clerk_organization_email: data.email,
        clerk_organization_created_at: data.createdAt,
      },
    });

    console.log('Stripe customer created:', customer.id);

    // Here you might want to store the Stripe customer ID in your database
    // associated with the Clerk organization ID for future reference

  } catch (error) {
    console.error('Error creating Stripe customer:', error);
  }
}

async function handleOrganizationUpdated(data: any) {
  console.log('Organization updated:', data);
  // Implement organization update logic here
}

async function handleOrganizationDeleted(data: any) {
  console.log('Organization deleted:', data);
  // Implement organization deletion logic here
}

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
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
  const wh = new Webhook(WEBHOOK_SECRET);

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