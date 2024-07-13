import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@clickhouse/client';
import { auth } from '@clerk/nextjs/server';
import { createClient as createSupabaseClient } from '@/app/utils/supabase/server';

interface ClickHouseCredentials {
  url: string;
  username: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, sourceId } = await req.json();

    if (!query || !sourceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createSupabaseClient();
    const { data: sourceData, error: sourceError } = await supabase
      .from('sources')
      .select('*')
      .eq('id', sourceId)
      .eq('organization', orgId)
      .single();

    if (sourceError || !sourceData) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const credentials: ClickHouseCredentials = sourceData.credentials;

    let client;
    try {
      client = createClient({
        url: credentials.url,
        username: credentials.username,
        password: credentials.password,
      });

      const resultSet = await client.query({
        query,
      });

      const result = await resultSet.json();

      return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
      console.error('Error executing ClickHouse query:', error);
      return NextResponse.json({ 
        error: 'Error executing query', 
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    } finally {
      if (client) {
        await client.close();
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}