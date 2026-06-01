import { NextResponse } from 'next/server';
import { analyzeChatbotHistory } from '@/ai/flows/admin-chatbot-history-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await analyzeChatbotHistory(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Error al analizar historial del chatbot' }, { status: 500 });
  }
}
