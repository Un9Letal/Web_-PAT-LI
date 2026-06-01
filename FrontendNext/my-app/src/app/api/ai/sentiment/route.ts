import { NextResponse } from 'next/server';
import { analyzeSentiment } from '@/ai/flows/admin-sentiment-analysis-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await analyzeSentiment(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json({ error: 'Error al analizar sentimiento' }, { status: 500 });
  }
}
