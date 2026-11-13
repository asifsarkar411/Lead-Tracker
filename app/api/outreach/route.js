import { NextResponse } from 'next/server';
import { getOutreachLeads, createOutreachLead, importBatchOutreachLeads } from '@/lib/store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const meetingStatus = searchParams.get('meetingStatus') || '';

    const outreachLeads = await getOutreachLeads({ status, meetingStatus });
    return NextResponse.json({ success: true, outreachLeads });
  } catch (error) {
    console.error('API Error in GET /api/outreach:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Check if batch import from CSV
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ success: false, error: 'Empty batch provided' }, { status: 400 });
      }
      const created = await importBatchOutreachLeads(body);
      return NextResponse.json({ success: true, count: created.length, outreachLeads: created }, { status: 201 });
    }

    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const created = await createOutreachLead(body);
    return NextResponse.json({ success: true, outreachLead: created }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/outreach:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

