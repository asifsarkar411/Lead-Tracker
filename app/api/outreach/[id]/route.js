import { NextResponse } from 'next/server';
import { updateOutreachLead, deleteOutreachLead } from '@/lib/store';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateOutreachLead(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Outreach lead not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, outreachLead: updated });
  } catch (error) {
    console.error('API Error in PUT /api/outreach/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await deleteOutreachLead(id);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('API Error in DELETE /api/outreach/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

