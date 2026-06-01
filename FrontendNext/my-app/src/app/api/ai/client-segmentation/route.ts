import { NextResponse } from 'next/server';
import { segmentClients } from '@/ai/flows/admin-client-segmentation-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await segmentClients(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Error al segmentar clientes' }, { status: 500 });
  }
}
