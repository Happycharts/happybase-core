import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

interface InsertData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    primaryEmailAddress?: {
      emailAddress: string;
    };
    orgName: string;
    admin: boolean;
  };
  orgId: string;
  orgName: string;
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { has } = auth();
  const isAdmin = has({ role: "role:admin" });
  if (!isAdmin) {
    const admin = false;
  } else {
    const admin = true;
  }
  try {
    const { user, orgId, orgName } = (await request.json()) as InsertData;

    // Insert user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        organization: orgName,
        admin: isAdmin,
      }, 
    );

    if (userError) throw userError;

    // Insert organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        id: orgId,
        name: orgName,
      },
    );

    if (orgError) throw orgError;

    return NextResponse.json({ message: 'User and organization upserted successfully', userData, orgData }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error upserting user and organization:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Error upserting user and organization', error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
  }
}