import { NextResponse } from 'next/server';
import { getLeads, createLead, importBatchLeads } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const service = searchParams.get('service') || '';
    const search = searchParams.get('search') || '';
    const date = searchParams.get('date') || '';
    const month = searchParams.get('month') || '';
    const year = searchParams.get('year') || '';

    const leads = await getLeads({ status, service, search, date, month, year });
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('API Error in GET /api/leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Check if batch array from Excel/CSV import
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ success: false, error: 'Empty batch provided' }, { status: 400 });
      }
      const created = await importBatchLeads(body);
      return NextResponse.json({ success: true, count: created.length, leads: created }, { status: 201 });
    }

    if (!body.name || !body.phone) {
      return NextResponse.json({ success: false, error: 'Name and Phone are required.' }, { status: 400 });
    }

    const lead = await createLead(body);
    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
