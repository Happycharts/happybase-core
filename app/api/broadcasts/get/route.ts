import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is not provided' }, { status: 400 });
    }

    try {
      const supabase = createClerkSupabaseClient();
      const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching broadcast:', error);
        return NextResponse.json({ error: 'Error fetching broadcast' }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
      }

      return NextResponse.json(data, { status: 200 });
    } catch (err) {
      console.error('Unexpected error:', err);
      return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
    }
}
