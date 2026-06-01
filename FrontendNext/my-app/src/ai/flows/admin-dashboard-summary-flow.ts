'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  totalRevenue:    z.number(),
  liveOrders:      z.number(),
  criticalStock:   z.number(),
  outOfStock:      z.number(),
  goalPct:         z.number(),
  avgSatisfaction: z.number(),
  topProducts: z.array(z.object({
    nombre:   z.string(),
    vendidos: z.number(),
    ingresos: z.number(),
  })),
  recentSalesCount: z.number(),
});
export type DashboardSummaryInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  insights: z.array(z.object({
    type: z.enum(['positive', 'warning', 'action']),
    text: z.string(),
  })),
  recommendation: z.string(),
  overallStatus:  z.enum(['excelente', 'bueno', 'atencion']),
});
export type DashboardSummaryOutput = z.infer<typeof OutputSchema>;

export async function generateDashboardSummary(input: DashboardSummaryInput): Promise<DashboardSummaryOutput> {
  return dashboardSummaryFlow(input);
}

const dashboardSummaryFlow = ai.defineFlow(
  { name: 'dashboardSummaryFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const prompt = `Eres el analista de inteligencia de negocios de PAT-LI Textiles, Ica, Perú.
Analiza los siguientes KPIs actuales y genera insights accionables en español:

DATOS:
- Ingresos del mes: S/ ${input.totalRevenue.toLocaleString('es-PE')}
- Meta cumplida: ${input.goalPct}%
- Pedidos web en vivo: ${input.liveOrders}
- Productos con stock crítico (<10 ud.): ${input.criticalStock}
- Productos agotados: ${input.outOfStock}
- Satisfacción promedio: ${input.avgSatisfaction}/5
- Ventas web en esta sesión: ${input.recentSalesCount}
- Top productos (nombre, unidades, ingresos):
${input.topProducts.map(p => `  · ${p.nombre}: ${p.vendidos} ud. — S/${p.ingresos}`).join('\n')}

INSTRUCCIONES:
1. Genera exactamente 3 insights (1 positivo, 1 advertencia o neutral, 1 acción concreta).
2. Cada insight debe ser específico con datos concretos, máximo 20 palabras.
3. La recomendación estratégica debe ser 1 oración concreta y accionable.
4. El estado general es 'excelente' si meta>=80%, 'bueno' si meta>=50%, 'atencion' si no.

Responde SOLO con JSON válido en este formato exacto:
{
  "insights": [
    {"type": "positive", "text": "..."},
    {"type": "warning", "text": "..."},
    {"type": "action", "text": "..."}
  ],
  "recommendation": "...",
  "overallStatus": "excelente"|"bueno"|"atencion"
}`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      config: { temperature: 0.4 },
    });

    const text = response.text.trim().replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(text);
      return {
        insights: (parsed.insights ?? []).map((ins: { type: string; text: string }) => ({
          type: (['positive', 'warning', 'action'].includes(ins.type) ? ins.type : 'action') as 'positive' | 'warning' | 'action',
          text: ins.text,
        })),
        recommendation: parsed.recommendation ?? '',
        overallStatus: (['excelente', 'bueno', 'atencion'].includes(parsed.overallStatus) ? parsed.overallStatus : 'bueno') as 'excelente' | 'bueno' | 'atencion',
      };
    } catch {
      return {
        insights: [
          { type: 'positive' as const, text: `Meta al ${input.goalPct}% — buen ritmo de ventas este mes.` },
          { type: 'warning'  as const, text: `${input.criticalStock} productos con stock crítico requieren reabastecimiento.` },
          { type: 'action'   as const, text: 'Revisa los productos más vendidos y ajusta el inventario esta semana.' },
        ],
        recommendation: 'Reabastecer el top 3 de productos más vendidos antes del fin de semana.',
        overallStatus: (input.goalPct >= 80 ? 'excelente' : input.goalPct >= 50 ? 'bueno' : 'atencion') as 'excelente' | 'bueno' | 'atencion',
      };
    }
  }
);
