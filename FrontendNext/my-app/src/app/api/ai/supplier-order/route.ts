import { NextResponse } from 'next/server';
import { generateSupplierOrder } from '@/ai/flows/admin-supplier-order-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await generateSupplierOrder(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Error al generar la orden de proveedor' }, { status: 500 });
  }
}
