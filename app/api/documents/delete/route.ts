// /api/deleteDocument.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/app/utils/supabase/server';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    const org = auth().orgId;
    if (!org || !documentId) {
      return NextResponse.json({ error: 'Unauthorized or missing document ID' }, { status: 401 });
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('organization', org);

    if (error) {
      console.error('Error deleting document:', error);
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}