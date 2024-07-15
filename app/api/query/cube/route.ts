import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient as createSupabaseClient } from '@/app/utils/supabase/server';
import { Pool } from 'pg';

interface PostgresCredentials {
  host: string;
  port: number;
  database: string;
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

    const credentials: PostgresCredentials = sourceData.credentials;

    const pool = new Pool({
      host: credentials.host,
      port: credentials.port,
      database: credentials.database,
      user: credentials.username,
      password: credentials.password,
    });

    try {
      const result = await pool.query({
        text: query,
        rowMode: 'array',
      });

      const MAX_ROWS = 10000; // Adjust this value based on your needs
      const limitedRows = result.rows.slice(0, MAX_ROWS);

      return NextResponse.json({
        results: limitedRows,
        rowCount: limitedRows.length,
        fields: result.fields.map(field => field.name),
      }, { status: 200 });
    } catch (error) {
      console.error('Error executing PostgreSQL query:', error);
      return NextResponse.json({ 
        error: 'Error executing query', 
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}