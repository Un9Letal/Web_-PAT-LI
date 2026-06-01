import { NextResponse } from 'next/server';
import { generateDashboardSummary } from '@/ai/flows/admin-dashboard-summary-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await generateDashboardSummary(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({ error: 'Error al generar el resumen' }, { status: 500 });
  }
}
