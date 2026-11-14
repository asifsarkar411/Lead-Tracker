import { NextResponse } from 'next/server';
import { updateUser, deleteUser } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateUser(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('API Error in PUT /api/users/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await deleteUser(id);
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('API Error in DELETE /api/users/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

