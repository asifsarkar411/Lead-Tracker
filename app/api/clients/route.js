import { NextResponse } from 'next/server';
import { getClients, createClient } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const clientStatus = searchParams.get('clientStatus') || '';
    const date = searchParams.get('date') || '';
    const month = searchParams.get('month') || '';
    const year = searchParams.get('year') || '';

    const clients = await getClients({ paymentStatus, clientStatus, date, month, year });
    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error('API Error in GET /api/clients:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.clientName || !body.phone) {
      return NextResponse.json({ success: false, error: 'Client Name and Phone are required' }, { status: 400 });
    }

    const client = await createClient(body);
    return NextResponse.json({ success: true, client }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/clients:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
