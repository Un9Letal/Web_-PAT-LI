import { NextResponse } from 'next/server';
import { generateNarrativeReport } from '@/ai/flows/admin-narrative-report-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await generateNarrativeReport(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Narrative report error:', error);
    return NextResponse.json({ error: 'Error al generar el informe narrativo' }, { status: 500 });
  }
}
