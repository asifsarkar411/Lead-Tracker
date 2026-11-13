import { NextResponse } from 'next/server';
import { updateLead, deleteLead } from '@/lib/store';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateLead(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error('API Error in PUT /api/leads/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await deleteLead(id);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('API Error in DELETE /api/leads/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

