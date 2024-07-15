// /api/deleteSource.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/app/utils/supabase/server';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceId = searchParams.get('id');

    const org = auth().orgId;
    if (!org || !sourceId) {
      return NextResponse.json({ error: 'Unauthorized or missing source ID' }, { status: 401 });
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', sourceId)
      .eq('organization', org);

    if (error) {
      console.error('Error deleting source:', error);
      return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}