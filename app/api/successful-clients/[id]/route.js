import { NextResponse } from 'next/server';
import { updateSuccessfulClient, deleteSuccessfulClient } from '@/lib/store';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateSuccessfulClient(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Successful client not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, successfulClient: updated });
  } catch (error) {
    console.error('API Error in PUT /api/successful-clients/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await deleteSuccessfulClient(id);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('API Error in DELETE /api/successful-clients/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

