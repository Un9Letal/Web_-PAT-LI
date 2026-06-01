import { NextResponse } from 'next/server';
import { generateSurveyResponse } from '@/ai/flows/admin-survey-response-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await generateSurveyResponse(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Survey response error:', error);
    return NextResponse.json({ error: 'Error al generar la respuesta' }, { status: 500 });
  }
}
