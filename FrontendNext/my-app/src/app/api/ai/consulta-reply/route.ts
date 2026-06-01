import { NextResponse } from 'next/server';
import { generateConsultaReply } from '@/ai/flows/admin-consulta-reply-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await generateConsultaReply(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Error al generar respuesta' }, { status: 500 });
  }
}
