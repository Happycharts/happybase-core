import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { has } = auth();
  const isAdmin = has({ role: "role:admin" });
  const admin = isAdmin ? true : false;

  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const token = await auth().getToken();

    const response = await fetch('https://fakecorp-dev-2x4n2qxuxq-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // You can use the `supabase` client and `admin` boolean here if needed

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error querying Cloud Run service:', error);
    return NextResponse.json(
      { error: 'An error occurred while querying the service' },
      { status: 500 }
    );
  }
}