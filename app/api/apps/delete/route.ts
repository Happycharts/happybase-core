import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'App deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deleting app:', error);

    if (error instanceof Error) {
      return NextResponse.json({ message: 'Error deleting app', error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
