// File: /pages/api/broadcasts/create.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, expiration, url, cubeUrl, fullName } = await request.json();

  if (!id || !expiration || !url) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Validate expiration
  const validExpirations = ['1 Week', '2 Weeks', '3 Weeks', '4 Weeks'];
  if (!validExpirations.includes(expiration)) {
    return NextResponse.json({ error: 'Invalid expiration value' }, { status: 400 });
  }

  try {
    const supabase = createClient();

    // Check if the app exists and belongs to the user
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('id')
      .eq('id', id)
      .eq('creator_id', userId)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'App not found or you do not have permission' }, { status: 404 });
    }

    // Calculate expiration date
    const expirationDate = new Date();
    switch (expiration) {
      case '1 Week':
        expirationDate.setDate(expirationDate.getDate() + 7);
        break;
      case '2 Weeks':
        expirationDate.setDate(expirationDate.getDate() + 14);
        break;
      case '3 Weeks':
        expirationDate.setDate(expirationDate.getDate() + 21);
        break;
      case '4 Weeks':
        expirationDate.setDate(expirationDate.getDate() + 28);
        break;
    }

    // Create broadcast record
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcasts')
      .insert({
        id: id,
        creator_id: userId,
        expiration_date: expirationDate.toISOString(),
        url: url,
        cube_url: cubeUrl,
        creator_name: fullName
      })
      .select()
      .single();

    if (broadcastError) {
      console.error('Error creating broadcast:', broadcastError);
      return NextResponse.json({ error: 'Failed to create broadcast' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Broadcast created successfully', broadcast }, { status: 200 });
  } catch (error) {
    console.error('Error in broadcast creation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

