import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
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
      // Handle user creation
      // await handleUserCreated(user);
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
      // Handle organization creation
      // await handleOrganizationCreated(organization);
      break;
    // Add more cases as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({}, { status: 200 });
}