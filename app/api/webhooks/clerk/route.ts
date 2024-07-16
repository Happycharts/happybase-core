'use server'
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@/app/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
const supabase = createClient();

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
    await handleUserCreated(user, supabase);
    break;
  case 'organization.created':
    const organization = event.data;
    console.log(`Organization created: ${organization.id}`);
    // Handle organization creation
    await handleOrganizationCreated(organization, supabase);
    break;
  // Add more cases as needed
  default:
    console.log(`Unhandled event type ${event.type}`);
}

async function handleUserCreated(user: any, supabase: any) {
  const { has } = auth();
  const isAdmin = has({ role: "role:admin" });

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        organization: user.orgName,
        admin: isAdmin,
      },
    { onConflict: 'id' });

    if (userError) throw userError;

    console.log('User upserted successfully:', userData);
  } catch (error: unknown) {
    console.error('Error upserting user:', error);
  }
}

async function handleOrganizationCreated(organization: any, supabase: any) {
  try {
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: organization.id,
        name: organization.orgName,
      },
    { onConflict: 'id' });

    if (orgError) throw orgError;

    console.log('Organization upserted successfully:', orgData);
  } catch (error: unknown) {
    console.error('Error upserting organization:', error);
  }
}

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({}, { status: 200 });
}