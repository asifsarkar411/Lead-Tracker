import { NextResponse } from 'next/server';
import { updateDemoLink, deleteDemoLink } from '@/lib/store';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateDemoLink(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Demo link not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, demoLink: updated });
  } catch (error) {
    console.error('API Error in PUT /api/demo-links/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await deleteDemoLink(id);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('API Error in DELETE /api/demo-links/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

