import { NextResponse } from 'next/server';
import { getMeetings, createMeeting } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const date = searchParams.get('date') || '';
    const meetings = await getMeetings({ status, date });
    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    console.error('API Error in GET /api/meetings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title || !body.clientName || !body.meetingDate) {
      return NextResponse.json({ success: false, error: 'Title, Client Name, and Meeting Date are required.' }, { status: 400 });
    }
    const meeting = await createMeeting(body);
    return NextResponse.json({ success: true, meeting }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/meetings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

