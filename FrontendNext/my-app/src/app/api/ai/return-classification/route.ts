import { NextResponse } from 'next/server';
import { classifyReturn } from '@/ai/flows/admin-return-classification-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await classifyReturn(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Error al clasificar la devolución' }, { status: 500 });
  }
}
