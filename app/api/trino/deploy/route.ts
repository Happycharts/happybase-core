import { NextRequest, NextResponse } from 'next/server';
import { deployTrino } from '@/app/utils/trinoDeploy';

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await request.json();

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const result = await deployTrino(orgId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in Trino deployment API:', error);
    return NextResponse.json(
      { error: 'An error occurred during Trino deployment' },
      { status: 500 }
    );
  }
}