'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  leads: z.array(z.object({
    id:           z.string(),
    nombre:       z.string(),
    interes:      z.string(),
    presupuesto:  z.string(),
    canal:        z.string(),
    interacciones: z.number(),
    diasDesdeContacto: z.number(),
    estado:       z.string(),
  })),
  totalSalesThisMonth: z.number(),
  topCategories:       z.array(z.string()),
});
export type LeadScoringInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  scores: z.array(z.object({
    id:           z.string(),
    score:        z.number(),
    priority:     z.enum(['caliente', 'tibio', 'frio']),
    reason:       z.string(),
    nextAction:   z.string(),
  })),
  funnelInsight: z.string(),
  bestTimeToContact: z.string(),
});
export type LeadScoringOutput = z.infer<typeof OutputSchema>;

export async function scoreLeads(input: LeadScoringInput): Promise<LeadScoringOutput> {
  return leadScoringFlow(input);
}

const leadScoringFlow = ai.defineFlow(
  { name: 'leadScoringFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const prompt = `Eres un experto en ventas B2C para PAT-LI Textiles, Ica, Perú.
Analiza estos leads y asigna una puntuación de conversión del 1-100.

CONTEXTO:
- Ventas del mes: S/ ${input.totalSalesThisMonth.toLocaleString('es-PE')}
- Categorías más demandadas: ${input.topCategories.join(', ')}

LEADS A EVALUAR:
${input.leads.map(l => `
ID: ${l.id}
- Nombre: ${l.nombre}
- Interés: ${l.interes}
- Presupuesto declarado: ${l.presupuesto}
- Canal de contacto: ${l.canal}
- Interacciones totales: ${l.interacciones}
- Días desde último contacto: ${l.diasDesdeContacto}
- Estado actual: ${l.estado}
`).join('\n---')}

Para cada lead:
- score (1-100): probabilidad de conversión
- priority: "caliente" (score≥70), "tibio" (40-69), "frio" (<40)
- reason: por qué ese score (máx 10 palabras)
- nextAction: acción concreta para avanzar el lead (máx 10 palabras)

También genera:
- funnelInsight: observación clave sobre el estado general del embudo (1 oración)
- bestTimeToContact: mejor momento para contactar leads tibios/calientes (1 oración)

Responde SOLO con JSON:
{
  "scores": [{"id":"...","score":85,"priority":"caliente","reason":"...","nextAction":"..."},...],
  "funnelInsight": "...",
  "bestTimeToContact": "..."
}`;

    const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.35 } });
    const text = res.text.trim().replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(text);
      return {
        scores: (parsed.scores ?? []).map((s: { id: string; score: number; priority: string; reason: string; nextAction: string }) => ({
          id:         s.id,
          score:      s.score,
          priority:   (['caliente','tibio','frio'].includes(s.priority) ? s.priority : 'tibio') as 'caliente' | 'tibio' | 'frio',
          reason:     s.reason,
          nextAction: s.nextAction,
        })),
        funnelInsight:     parsed.funnelInsight ?? '',
        bestTimeToContact: parsed.bestTimeToContact ?? '',
      };
    } catch {
      return {
        scores: input.leads.map(l => ({
          id:         l.id,
          score:      l.interacciones >= 3 ? 75 : 45,
          priority:   (l.interacciones >= 3 ? 'caliente' : 'tibio') as 'caliente' | 'tibio' | 'frio',
          reason:     'Basado en número de interacciones',
          nextAction: 'Enviar catálogo actualizado',
        })),
        funnelInsight:     'El embudo muestra oportunidades de conversión en leads con múltiples interacciones.',
        bestTimeToContact: 'Los mejores resultados se obtienen contactando entre 10am y 12pm.',
      };
    }
  }
);
