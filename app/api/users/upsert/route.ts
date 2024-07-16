import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

interface UpsertData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    primaryEmailAddress?: {
      emailAddress: string;
    };
    orgName: string;
  };
  orgId: string;
  orgName: string;
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const { user, orgId, orgName } = (await request.json()) as UpsertData;

    // Upsert user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        organization: orgName,
      }, {
        onConflict: 'id'
      });

    if (userError) throw userError;

    // Upsert organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: orgId,
        name: orgName,
      }, {
        onConflict: 'id'
      });

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