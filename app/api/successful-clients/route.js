import { NextResponse } from 'next/server';
import { getSuccessfulClients, createSuccessfulClient, importBatchSuccessfulClients } from '@/lib/store';

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

    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ success: false, error: 'Empty batch provided' }, { status: 400 });
      }
      const created = await importBatchSuccessfulClients(body);
      return NextResponse.json({ success: true, count: created.length, successfulClients: created }, { status: 201 });
    }

    if (!body.clientName && !body.businessName) {
      return NextResponse.json({ success: false, error: 'Client or Business Name is required' }, { status: 400 });
    }

    const payload = {
      ...body,
      clientName: body.clientName || body.businessName,
      businessName: body.businessName || body.clientName
    };

    const created = await createSuccessfulClient(payload);
    return NextResponse.json({ success: true, successfulClient: created }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/successful-clients:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
