import { NextResponse } from 'next/server';
import { scoreLeads } from '@/ai/flows/admin-lead-scoring-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await scoreLeads(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Lead scoring error:', error);
    return NextResponse.json({ error: 'Error al evaluar leads' }, { status: 500 });
  }
}
