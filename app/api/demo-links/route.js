import { NextResponse } from 'next/server';
import { getDemoLinks, createDemoLink, importBatchDemoLinks } from '@/lib/store';

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

    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ success: false, error: 'Empty batch provided' }, { status: 400 });
      }
      const created = await importBatchDemoLinks(body);
      return NextResponse.json({ success: true, count: created.length, demoLinks: created }, { status: 201 });
    }

    if (!body.title && !body.clientName) {
      return NextResponse.json({ success: false, error: 'Title or Client Name is required' }, { status: 400 });
    }

    const payload = {
      ...body,
      title: body.title || body.clientName || 'Demo Link'
    };

    const created = await createDemoLink(payload);
    return NextResponse.json({ success: true, demoLink: created }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/demo-links:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
