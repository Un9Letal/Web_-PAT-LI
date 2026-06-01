import { NextResponse } from 'next/server';
import { getRelatedProducts } from '@/ai/flows/customer-related-products-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await getRelatedProducts(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Related products error:', error);
    return NextResponse.json({ error: 'Error al obtener recomendaciones' }, { status: 500 });
  }
}
