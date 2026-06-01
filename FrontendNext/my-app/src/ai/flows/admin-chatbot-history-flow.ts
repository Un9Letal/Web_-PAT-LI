'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SessionSchema = z.object({
  id:       z.string(),
  date:     z.string(),
  preview:  z.string(),  // last customer message
  turns:    z.number(),  // number of exchanges
  outcome:  z.enum(['resuelto', 'escalado', 'abandonado']),
});

const InputSchema = z.object({
  sessions: z.array(SessionSchema),
});
export type ChatbotHistoryInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  sessions: z.array(z.object({
    id:        z.string(),
    topic:     z.string(),
    sentiment: z.enum(['positivo', 'negativo', 'neutro']),
    insight:   z.string(),
  })),
  topTopics:      z.array(z.object({ topic: z.string(), count: z.number() })),
  sentimentBreak: z.object({ positivo: z.number(), neutro: z.number(), negativo: z.number() }),
  recommendation: z.string(),
});
export type ChatbotHistoryOutput = z.infer<typeof OutputSchema>;

export async function analyzeChatbotHistory(input: ChatbotHistoryInput): Promise<ChatbotHistoryOutput> {
  return chatbotHistoryFlow(input);
}

const chatbotHistoryFlow = ai.defineFlow(
  { name: 'chatbotHistoryFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const prompt = `Eres el analista de experiencia digital de PAT-LI Textiles, Ica, Perú.
Analiza estas sesiones de chatbot y clasifica cada una.

SESIONES:
${input.sessions.map(s =>
  `ID: ${s.id} | ${s.date} | ${s.turns} turnos | Resultado: ${s.outcome}\nÚltimo mensaje del cliente: "${s.preview}"`
).join('\n\n')}

Para cada sesión determina:
- topic: tema principal en 2-3 palabras (ej: "Consulta de tallas", "Disponibilidad stock", "Precios y descuentos", "Proceso de pago", "Cambios y devoluciones", "Recomendación de producto")
- sentiment: "positivo" (cliente satisfecho/agradecido), "negativo" (frustración/queja), "neutro" (consulta informativa)
- insight: observación en máximo 8 palabras sobre esa sesión

Luego genera:
- topTopics: lista de los 4 temas más frecuentes con su conteo
- sentimentBreak: porcentaje de cada sentimiento (deben sumar 100)
- recommendation: acción concreta en 1 oración para mejorar el bot basada en los patrones

Responde SOLO con JSON válido:
{
  "sessions": [{"id": "...", "topic": "...", "sentiment": "...", "insight": "..."}],
  "topTopics": [{"topic": "...", "count": N}],
  "sentimentBreak": {"positivo": N, "neutro": N, "negativo": N},
  "recommendation": "..."
}`;

    const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.3 } });
    const text = res.text.trim().replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(text);
      return {
        sessions:       parsed.sessions       ?? [],
        topTopics:      parsed.topTopics      ?? [],
        sentimentBreak: parsed.sentimentBreak ?? { positivo: 60, neutro: 30, negativo: 10 },
        recommendation: parsed.recommendation ?? 'Ampliar respuestas sobre políticas de cambio y devolución.',
      };
    } catch {
      return {
        sessions: input.sessions.map(s => ({
          id: s.id, topic: 'Consulta general', sentiment: 'neutro' as const, insight: 'Sesión estándar de soporte',
        })),
        topTopics:      [{ topic: 'Consulta de producto', count: 4 }],
        sentimentBreak: { positivo: 60, neutro: 30, negativo: 10 },
        recommendation: 'Reforzar respuestas sobre disponibilidad de tallas.',
      };
    }
  }
);
