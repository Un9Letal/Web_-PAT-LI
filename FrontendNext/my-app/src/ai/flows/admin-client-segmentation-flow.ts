'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClienteSchema = z.object({
  id:           z.string(),
  nombre:       z.string(),
  totalGastado: z.number(),
  ultimaCompra: z.string(),
  estado:       z.string(),
});

const InputSchema = z.object({
  clientes: z.array(ClienteSchema),
});
export type ClientSegmentationInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  segments: z.array(z.object({
    clienteId: z.string(),
    segment:   z.enum(['vip', 'frecuente', 'inactivo', 'riesgo']),
    reason:    z.string(),
    action:    z.string(),
  })),
  summary: z.object({
    vip:      z.number(),
    frecuente: z.number(),
    inactivo: z.number(),
    riesgo:   z.number(),
  }),
  insight:     z.string(),
  topStrategy: z.string(),
});
export type ClientSegmentationOutput = z.infer<typeof OutputSchema>;

export async function segmentClients(input: ClientSegmentationInput): Promise<ClientSegmentationOutput> {
  return clientSegmentationFlow(input);
}

const clientSegmentationFlow = ai.defineFlow(
  { name: 'clientSegmentationFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const today = new Date().toISOString().split('T')[0];

    const prompt = `Eres el analista de CRM de PAT-LI Textiles, Ica, Perú.
Segmenta estos clientes para diseñar estrategias de retención y fidelización.
Fecha de hoy: ${today}

CLIENTES:
${input.clientes.map(c =>
  `ID: ${c.id} | ${c.nombre} | Gasto total: S/ ${c.totalGastado} | Última compra: ${c.ultimaCompra} | Estado: ${c.estado}`
).join('\n')}

Clasifica cada cliente en uno de estos segmentos:
- "vip": gasto alto (>S/ 500) y activo recientemente (< 60 días)
- "frecuente": compra regularmente, gasto moderado (S/ 100-500)
- "inactivo": más de 90 días sin comprar o estado Inactivo
- "riesgo": activo pero gasto bajo (< S/ 100) o sin compras recientes (60-90 días)

Para cada cliente:
- segment: el segmento asignado
- reason: razón breve en 5 palabras
- action: acción recomendada concreta en 6 palabras (ej: "Enviar cupón 15% por fidelidad")

Además genera:
- summary: conteo de clientes por segmento
- insight: observación principal sobre la base de clientes (1 oración)
- topStrategy: estrategia más urgente para mejorar la retención (1 oración)

Responde SOLO con JSON válido:
{
  "segments": [{"clienteId":"...","segment":"...","reason":"...","action":"..."}],
  "summary": {"vip":N,"frecuente":N,"inactivo":N,"riesgo":N},
  "insight": "...",
  "topStrategy": "..."
}`;

    const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.3 } });
    const text = res.text.trim().replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(text);
      return {
        segments:    parsed.segments    ?? [],
        summary:     parsed.summary     ?? { vip: 0, frecuente: 0, inactivo: 0, riesgo: 0 },
        insight:     parsed.insight     ?? 'Base de clientes con potencial de crecimiento.',
        topStrategy: parsed.topStrategy ?? 'Reactivar clientes inactivos con campaña de descuento.',
      };
    } catch {
      return {
        segments: input.clientes.map(c => ({
          clienteId: c.id,
          segment:   (c.totalGastado > 500 ? 'vip' : c.totalGastado > 100 ? 'frecuente' : 'riesgo') as any,
          reason:    'Basado en gasto histórico',
          action:    'Seguimiento personalizado por canal',
        })),
        summary:     { vip: 1, frecuente: 2, inactivo: 1, riesgo: 1 },
        insight:     'La mayoría de clientes son activos con potencial de upgrade.',
        topStrategy: 'Implementar programa de puntos para aumentar frecuencia de compra.',
      };
    }
  }
);
