import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const org = auth().orgId;
    if (!org) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomKUID } = await req.json();
    if (!roomKUID) {
      return NextResponse.json({ error: 'roomKUID is required' }, { status: 400 });
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('documents')
      .insert({
        id: roomKUID,
        organization: org,
      })
      .select();

    if (error) {
      console.error('Error creating document:', error);
      return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }

    return NextResponse.json({ success: true, documentId: roomKUID }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}