'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  question: z.string(),
  context: z.object({
    totalRevenue:    z.number(),
    liveOrders:      z.number(),
    criticalStock:   z.number(),
    outOfStock:      z.number(),
    goalPct:         z.number(),
    topProducts:     z.array(z.object({ nombre: z.string(), vendidos: z.number(), ingresos: z.number() })),
    categorySales:   z.array(z.object({ cat: z.string(), ventas: z.number() })).optional(),
    recentSales:     z.array(z.object({ id: z.string(), total: z.number(), paymentMethod: z.string(), itemsDescription: z.string() })).optional(),
    totalProducts:   z.number(),
  }),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
});
export type SalesAssistantInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  answer:     z.string(),
  dataPoints: z.array(z.string()).optional(),
  suggestion: z.string().optional(),
});
export type SalesAssistantOutput = z.infer<typeof OutputSchema>;

export async function askSalesAssistant(input: SalesAssistantInput): Promise<SalesAssistantOutput> {
  return salesAssistantFlow(input);
}

const salesAssistantFlow = ai.defineFlow(
  { name: 'salesAssistantFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const ctx = input.context;
    const historyText = (input.history ?? [])
      .slice(-6)
      .map(h => `${h.role === 'user' ? 'Admin' : 'Asistente'}: ${h.content}`)
      .join('\n');

    const prompt = `Eres un analista de negocios experto en retail textil trabajando para PAT-LI Textiles, Ica, Perú.
Respondes preguntas del administrador sobre el estado del negocio de forma concisa, directa y con datos concretos.

DATOS ACTUALES DEL NEGOCIO:
- Ingresos del mes: S/ ${ctx.totalRevenue.toLocaleString('es-PE')}
- Meta cumplida: ${ctx.goalPct}%
- Pedidos web (sesión actual): ${ctx.liveOrders}
- Productos críticos (stock<10): ${ctx.criticalStock}
- Productos agotados: ${ctx.outOfStock}
- Total productos: ${ctx.totalProducts}
- Top productos (nombre | unidades | ingresos):
${ctx.topProducts.map(p => `  · ${p.nombre}: ${p.vendidos} ud. | S/ ${p.ingresos}`).join('\n')}
${ctx.categorySales ? `- Ventas por categoría:\n${ctx.categorySales.map(c => `  · ${c.cat}: S/ ${c.ventas}`).join('\n')}` : ''}
${ctx.recentSales && ctx.recentSales.length > 0 ? `- Últimas ventas web:\n${ctx.recentSales.slice(0,3).map(s => `  · ${s.id}: S/ ${s.total} (${s.paymentMethod})`).join('\n')}` : ''}

${historyText ? `HISTORIAL DE CONVERSACIÓN:\n${historyText}\n` : ''}

PREGUNTA DEL ADMIN: "${input.question}"

Responde de forma directa y útil. Si hay datos relevantes, cítalos con números exactos.
Si la pregunta implica una acción, sugiere una. Máximo 3 oraciones en la respuesta principal.

Responde SOLO con JSON:
{
  "answer": "Respuesta principal directa con datos...",
  "dataPoints": ["Dato clave 1", "Dato clave 2"],
  "suggestion": "Acción recomendada opcional"
}`;

    const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.4 } });
    const text = res.text.trim().replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(text) as SalesAssistantOutput;
    } catch {
      return { answer: res.text.slice(0, 200), dataPoints: [], suggestion: undefined };
    }
  }
);
