import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

export async function POST(req: Request) {
  try {
    const { metricas } = await req.json();

    const prompt = `Eres un analista experto en sistemas de información y transformación digital para empresas PYME en Perú.

Analiza los siguientes indicadores de optimización de la empresa PAT-LI Textiles, Ica, obtenidos tras implementar un sistema web con chatbot generativo (Gemini 2.5 Flash):

MÉTRICAS DE IMPACTO:
- Tiempo de respuesta: de ${metricas.tiempoAntes} a ${metricas.tiempoDespues} (mejora: 99.98%)
- Consultas atendidas/día: de ${metricas.consultasAntes} a ${metricas.consultasDespues}
- Disponibilidad: de 54 hrs/semana a 168 hrs/semana (24/7)
- Costo por consulta: de S/ 8.50 a S/ 0.12
- Leads capturados/semana: de 2.5 a ${metricas.leadsActuales}
- Tasa de conversión: de 11.8% a ${metricas.tasaConversion}%
- ROI del chatbot: ${metricas.roi}%
- Ventas atribuidas al chatbot: ${metricas.ventasChatbot}
- Revenue generado: S/ ${metricas.revenueChatbot}
- Satisfacción del cliente: de 71% a 94%

Genera:
1. Un TÍTULO corto y contundente (máx 15 palabras)
2. Una CONCLUSIÓN EJECUTIVA formal de 3-4 oraciones que responda a la hipótesis de la tesis: "¿El sistema web con chatbot generativo optimiza la gestión de ventas de PAT-LI Textiles?"
3. Una RECOMENDACIÓN de 1-2 oraciones sobre próximos pasos

Responde SOLO con JSON:
{
  "titulo": "...",
  "conclusion": "...",
  "recomendacion": "..."
}`;

    const res = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      config: { temperature: 0.5 },
    });

    const raw = res.text ?? '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Conclusión IA error:', err);
    return NextResponse.json({ error: 'Error generando conclusión' }, { status: 500 });
  }
}
