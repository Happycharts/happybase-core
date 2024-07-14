// /api/createRoom.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/app/utils/supabase/server';
import ksuid from 'ksuid';

export async function POST(req: Request) {
  try {
    const org = auth().orgId;
    if (!org) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const prefix = 'room';

    function generateRoomId(prefix: string): string {
      const id = ksuid.randomSync().string;
      return `${prefix}_${id}`;
    }

    const newRoomId = generateRoomId(prefix);

    const { error } = await supabase
      .from('rooms')
      .insert({
        id: newRoomId,
        organization: org,
      })
      .select();

    if (error) {
      console.error('Error creating room:', error);
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    return NextResponse.json({ success: true, roomId: newRoomId }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
