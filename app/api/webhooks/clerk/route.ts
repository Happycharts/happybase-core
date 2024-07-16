import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@/app/utils/supabase/server';
import Stripe from 'stripe';
import { clerkClient } from "@clerk/nextjs/server";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20', // Use the latest API version
  });

  const body = await request.text();
  const headers = request.headers;

  const svix_id = headers.get('svix-id');
  const svix_timestamp = headers.get('svix-timestamp');
  const svix_signature = headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const signatureHeader = {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  };

  const wh = new Webhook(webhookSecret);

  let event: WebhookEvent;

  try {
    event = wh.verify(body, signatureHeader) as WebhookEvent;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log(`⚠️  Webhook signature verification failed.`, errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'user.created':
      const user = event.data;
      console.log(`User created: ${user.id}`);
      const { first_name, last_name, email_addresses, public_metadata, private_metadata, organization_memberships } = user;
      async function insertUser(): Promise<void> {
        await supabase.from('users').insert([
          { first_name: first_name, last_name: last_name, email: email_addresses, private_metadata: private_metadata, public_metadata: public_metadata, organization: organization_memberships![0].organization },
        ]);
      }
      await insertUser();      
      break;
    case 'user.updated':
      const updatedUser = event.data;
      console.log(`User updated: ${updatedUser.id}`);
      // Handle user update
      // await handleUserUpdated(updatedUser);
      break;
    case 'organization.created':
      const organization = event.data;
      console.log(`Organization created: ${organization.id}`);
      const { name, members_count, slug } = organization;

      async function insertOrganization(): Promise<void> {
        await supabase.from('organizations').insert([
          {name, members_count, slug},
        ]);
      }
      await insertOrganization();  
      
      async function createStripeCustomer(name: string, email: string): Promise<void> {
        try {
          const customer = await stripe.customers.create({
            name,
            email: email
          });
          const { stripeId, userId } = await request.json();
          await supabase.from('users').update({ stripeId: customer.id }).match({ email: email });
          await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
              stripeId: customer.id
            }
          });
          console.log(`Customer created in Stripe: ${customer.id}`);
        } catch (error) {
          console.error('Error creating customer in Stripe:', error);
        }
      }    
      // You need to call createStripeCustomer here with the correct parameters
      // await createStripeCustomer(name, email);
      break;
    // Add more cases as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({}, { status: 200 });
}