import { NextResponse } from 'next/server';
import { getSuccessfulClients, createSuccessfulClient } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await getSuccessfulClients();
    return NextResponse.json({ success: true, successfulClients: list });
  } catch (error) {
    console.error('API Error in GET /api/successful-clients:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.clientName || !body.businessName) {
      return NextResponse.json({ success: false, error: 'Client Name and Business Name are required' }, { status: 400 });
    }
    const created = await createSuccessfulClient(body);
    return NextResponse.json({ success: true, successfulClient: created }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/successful-clients:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
