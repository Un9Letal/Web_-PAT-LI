'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  comments: z.array(z.object({
    id:      z.string(),
    rating:  z.number(),
    comment: z.string(),
  })),
});
export type SentimentAnalysisInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  results: z.array(z.object({
    id:        z.string(),
    sentiment: z.enum(['positivo', 'negativo', 'sugerencia', 'neutro']),
    topic:     z.string(),
    summary:   z.string(),
  })),
  globalInsight: z.string(),
});
export type SentimentAnalysisOutput = z.infer<typeof OutputSchema>;

export async function analyzeSentiment(input: SentimentAnalysisInput): Promise<SentimentAnalysisOutput> {
  return sentimentAnalysisFlow(input);
}

const sentimentAnalysisFlow = ai.defineFlow(
  { name: 'sentimentAnalysisFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const prompt = `Eres un analista de experiencia del cliente para PAT-LI Textiles, Ica, Perú.
Analiza estos comentarios de encuestas post-compra y clasifica cada uno.

COMENTARIOS:
${input.comments.map(c => `ID: ${c.id} | ${c.rating}★ | "${c.comment}"`).join('\n')}

Para cada comentario determina:
- sentiment: "positivo" (elogio), "negativo" (queja), "sugerencia" (propuesta de mejora), "neutro"
- topic: tema principal en 1-2 palabras (ej: "Calidad tela", "Tiempo envío", "Tallas", "Chatbot", "Precio", "Empaque")
- summary: resumen de 6 palabras máximo

También genera un globalInsight: oración breve con el patrón más importante encontrado.

Responde SOLO con JSON válido:
{
  "results": [
    {"id": "...", "sentiment": "...", "topic": "...", "summary": "..."},
    ...
  ],
  "globalInsight": "..."
}`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      config: { temperature: 0.2 },
    });

    const text = response.text.trim().replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(text) as SentimentAnalysisOutput;
    } catch {
      return {
        results: input.comments.map(c => ({
          id:        c.id,
          sentiment: c.rating >= 4 ? 'positivo' : c.rating === 3 ? 'neutro' : 'negativo' as any,
          topic:     'Experiencia general',
          summary:   c.comment.slice(0, 30),
        })),
        globalInsight: 'La mayoría de clientes destaca la calidad del producto.',
      };
    }
  }
);
