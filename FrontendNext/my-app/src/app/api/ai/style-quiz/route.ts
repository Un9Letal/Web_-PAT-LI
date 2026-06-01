import { NextResponse } from 'next/server';
import { runStyleQuiz } from '@/ai/flows/customer-style-quiz-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await runStyleQuiz(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Style quiz error:', error);
    return NextResponse.json({ error: 'Error al procesar el quiz' }, { status: 500 });
  }
}
