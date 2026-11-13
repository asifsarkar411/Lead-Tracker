import { NextResponse } from 'next/server';
import { getLeads, createLead } from '@/lib/store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const leads = await getLeads({ status, search });
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('API Error in GET /api/leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
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

