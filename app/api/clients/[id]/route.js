import { NextResponse } from 'next/server';
import { updateClient, deleteClient } from '@/lib/store';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateClient(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, client: updated });
  } catch (error) {
    console.error('API Error in PUT /api/clients/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await deleteClient(id);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('API Error in DELETE /api/clients/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

