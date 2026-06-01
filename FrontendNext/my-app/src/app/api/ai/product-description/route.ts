import { NextResponse } from 'next/server';
import { generateProductDescription } from '@/ai/flows/admin-product-description-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await generateProductDescription(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Product description error:', error);
    return NextResponse.json({ error: 'Error al generar la descripción' }, { status: 500 });
  }
}
