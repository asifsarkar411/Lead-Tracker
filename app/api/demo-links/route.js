import { NextResponse } from 'next/server';
import { getDemoLinks, createDemoLink } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const list = await getDemoLinks({ category });
    return NextResponse.json({ success: true, demoLinks: list });
  } catch (error) {
    console.error('API Error in GET /api/demo-links:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title || !body.url) {
      return NextResponse.json({ success: false, error: 'Title and URL are required' }, { status: 400 });
    }
    const created = await createDemoLink(body);
    return NextResponse.json({ success: true, demoLink: created }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/demo-links:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
