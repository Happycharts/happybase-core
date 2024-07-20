import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { apiKey, selectedProvider } = await req.json();
  const { userId, orgId } = auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();

  try {
    const update = {
      [selectedProvider === 'openai' ? 'openai_key' : 'huggingface_key']: apiKey,
    };

    const { error: updateError } = await supabase
      .from("organizations")
      .update(update)
      .eq("id", orgId);

    if (updateError) {
      throw new Error(`Error updating API key: ${updateError.message}`);
    }

    // Fetch the updated data
    const { data, error: fetchError } = await supabase
      .from("organizations")
      .select()
      .eq("id", orgId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Error fetching API key: ${fetchError.message}`);
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json({ error: 'Error updating API key' }, { status: 500 });
  }
}
