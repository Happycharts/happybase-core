import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

interface InsertData {
  organization: {
    id: string;
    name: string;
  };
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { has } = auth();
  try {
    const { organization } = (await request.json()) as InsertData;

    // Insert organiz
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        id: organization.id,
        name: organization.name,
      }, 
    );

    if (orgError) throw orgError;

    return NextResponse.json({ message: 'Organization created successfully', orgData }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error upserting user and organization:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Error inserting organization', error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
  }
}