import { NextResponse } from 'next/server';
import { predictStock } from '@/ai/flows/admin-stock-prediction-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await predictStock(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Stock prediction error:', error);
    return NextResponse.json({ error: 'Error al predecir stock' }, { status: 500 });
  }
}
