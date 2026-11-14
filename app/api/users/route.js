import { NextResponse } from 'next/server';
import { getUsers, createUser } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('API Error in GET /api/users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.username || !body.name) {
      return NextResponse.json({ success: false, error: 'Name and Username are required' }, { status: 400 });
    }

    const user = await createUser(body);
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

