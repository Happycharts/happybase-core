// /api/query/clickhouse.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@clickhouse/client';
import { auth } from '@clerk/nextjs/server';
import { createClient as createSupabaseClient } from '@/app/utils/supabase/server';
import CryptoJS from 'crypto-js';

export async function POST(req: NextRequest) {
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

  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;
  const decryptedCredentials = JSON.parse(
    CryptoJS.AES.decrypt(sourceData.credentials, SUPABASE_SECRET_KEY).toString(CryptoJS.enc.Utf8)
  );

  const client = createClient({
    url: decryptedCredentials.url,
    username: decryptedCredentials.username,
    password: decryptedCredentials.password,
    database: decryptedCredentials.database,
  });

  try {
    const resultSet = await client.query({
      query,
      format: 'JSONEachRow',
    });

    const result = await resultSet.json();

    await client.close();

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Error executing ClickHouse query:', error);
    return NextResponse.json({ error: 'Error executing query' }, { status: 500 });
  }
}