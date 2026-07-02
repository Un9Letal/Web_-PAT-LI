import { NextResponse } from 'next/server';
import { generateCampaign } from '@/ai/flows/admin-campaign-generator-flow';

export async function POST(req: Request) {
  try {
    const body   = await req.json();
    const result = await generateCampaign(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Campaign Generator] Error:', err);
    return NextResponse.json({ error: 'Error al generar la campaña' }, { status: 500 });
  }
}
