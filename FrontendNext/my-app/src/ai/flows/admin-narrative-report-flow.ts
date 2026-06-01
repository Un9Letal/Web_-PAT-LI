'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  month:           z.string(),
  totalRevenue:    z.number(),
  prevRevenue:     z.number(),
  totalOrders:     z.number(),
  newClients:      z.number(),
  avgSatisfaction: z.number(),
  topProducts:     z.array(z.object({ nombre: z.string(), ingresos: z.number() })),
  criticalStock:   z.number(),
  webOrders:       z.number(),
  chatbotSessions: z.number(),
  goalPct:         z.number(),
});
export type NarrativeReportInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  executiveSummary: z.string(),
  highlights:       z.array(z.string()),
  concerns:         z.array(z.string()),
  outlook:          z.string(),
});
export type NarrativeReportOutput = z.infer<typeof OutputSchema>;

export async function generateNarrativeReport(input: NarrativeReportInput): Promise<NarrativeReportOutput> {
  return narrativeReportFlow(input);
}

const narrativeReportFlow = ai.defineFlow(
  { name: 'narrativeReportFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const growth = input.prevRevenue > 0
      ? (((input.totalRevenue - input.prevRevenue) / input.prevRevenue) * 100).toFixed(1)
      : '—';

    const prompt = `Eres el director de análisis de PAT-LI Textiles, Ica, Perú.
Redacta un informe ejecutivo narrativo del mes de ${input.month} en español profesional.

DATOS DEL MES:
- Ingresos totales: S/ ${input.totalRevenue.toLocaleString('es-PE')} (${growth}% vs mes anterior)
- Pedidos totales: ${input.totalOrders} (${input.webOrders} web / catálogo digital)
- Nuevos clientes: ${input.newClients}
- Meta de ventas cumplida: ${input.goalPct}%
- Satisfacción promedio: ${input.avgSatisfaction}/5
- Sesiones chatbot: ${input.chatbotSessions}
- Productos con stock crítico: ${input.criticalStock}
- Top 3 productos por ingresos: ${input.topProducts.slice(0,3).map(p => `${p.nombre} (S/ ${p.ingresos})`).join(', ')}

Genera:
1. executiveSummary: Párrafo de 3-4 oraciones describiendo el mes en prosa ejecutiva (menciona números clave)
2. highlights: Lista de 3 logros destacados del mes (frases cortas con datos)
3. concerns: Lista de 2-3 áreas de atención o riesgos (frases directas)
4. outlook: 1-2 oraciones con perspectiva para el próximo mes

Tono: profesional, objetivo, basado en datos. Como un informe que va al directorio.

Responde SOLO con JSON:
{
  "executiveSummary": "...",
  "highlights": ["...", "...", "..."],
  "concerns": ["...", "..."],
  "outlook": "..."
}`;

    const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.45 } });
    const text = res.text.trim().replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(text) as NarrativeReportOutput;
    } catch {
      return {
        executiveSummary: `${input.month} registró ingresos de S/ ${input.totalRevenue.toLocaleString('es-PE')}, alcanzando el ${input.goalPct}% de la meta mensual con ${input.totalOrders} pedidos procesados.`,
        highlights:       [`Meta al ${input.goalPct}% completada`, `${input.newClients} nuevos clientes captados`, `Satisfacción promedio de ${input.avgSatisfaction}/5`],
        concerns:         [`${input.criticalStock} productos con stock crítico`, 'Revisar cadena de suministro para productos top'],
        outlook:          'Se proyecta mantener la tendencia de crecimiento reforzando el canal digital y el catálogo web.',
      };
    }
  }
);
