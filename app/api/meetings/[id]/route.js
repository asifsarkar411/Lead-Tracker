import { NextResponse } from 'next/server';
import { updateMeeting, deleteMeeting } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateMeeting(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Meeting not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, meeting: updated });
  } catch (error) {
    console.error('API Error in PUT /api/meetings/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await deleteMeeting(id);
    return NextResponse.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    console.error('API Error in DELETE /api/meetings/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

