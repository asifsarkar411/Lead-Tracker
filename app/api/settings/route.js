import { NextResponse } from 'next/server';
import { getSettings, updateSettings, getStoreStatus } from '@/lib/store';

export async function GET() {
  try {
    const settings = await getSettings();
    const status = await getStoreStatus();
    return NextResponse.json({ success: true, settings, status });
  } catch (error) {
    console.error('API Error in GET /api/settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const updated = await updateSettings(body);
    const status = await getStoreStatus();
    return NextResponse.json({ success: true, settings: updated, status });
  } catch (error) {
    console.error('API Error in PUT /api/settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

