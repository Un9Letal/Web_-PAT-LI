import { NextResponse } from 'next/server';
import { askAdminAssistant } from '@/ai/flows/admin-assistant-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await askAdminAssistant(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Admin Assistant] Error:', err);
    // Devolver estructura válida para que el widget nunca crashee
    return NextResponse.json({
      reply: 'Hubo un problema al conectar con Gemini. Por favor espera unos segundos e intenta de nuevo.',
      suggestions: ['Reintentar la consulta', '¿Cómo interpreto el dashboard?', '¿Qué módulo revisar hoy?'],
    });
  }
}
