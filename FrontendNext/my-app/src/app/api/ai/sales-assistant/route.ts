import { NextResponse } from 'next/server';
import { askSalesAssistant } from '@/ai/flows/admin-sales-assistant-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await askSalesAssistant(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Sales assistant error:', error);
    return NextResponse.json({ error: 'Error al consultar el asistente' }, { status: 500 });
  }
}
