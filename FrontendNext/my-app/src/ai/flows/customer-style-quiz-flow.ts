'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  occasion:    z.string(),
  budget:      z.number(),
  gender:      z.string(),
  preferences: z.string(),
  availableProducts: z.array(z.object({
    id:       z.string(),
    name:     z.string(),
    category: z.string(),
    price:    z.number(),
  })),
});
export type StyleQuizInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  picks: z.array(z.object({
    productId:   z.string(),
    productName: z.string(),
    reason:      z.string(),
    matchScore:  z.number(),
  })),
  styleAdvice: z.string(),
  outfitTip:   z.string(),
});
export type StyleQuizOutput = z.infer<typeof OutputSchema>;

export async function runStyleQuiz(input: StyleQuizInput): Promise<StyleQuizOutput> {
  return styleQuizFlow(input);
}

const styleQuizFlow = ai.defineFlow(
  { name: 'styleQuizFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const candidates = input.availableProducts.filter(p => p.price <= input.budget * 1.2).slice(0, 40);

    const prompt = `Eres el estilista personal de PAT-LI Textiles, Ica, Perú.
Un cliente completó el quiz de estilo con estas respuestas:

- Ocasión: ${input.occasion}
- Presupuesto: hasta S/ ${input.budget}
- Para: ${input.gender}
- Preferencias adicionales: ${input.preferences || 'ninguna'}

PRODUCTOS DISPONIBLES (dentro del presupuesto):
${candidates.map(p => `· ID: ${p.id} | ${p.name} (${p.category}) | S/ ${p.price}`).join('\n')}

Selecciona los 3 productos que MEJOR se adapten al perfil del cliente.
Para cada uno asigna un matchScore del 70-100 indicando qué tan bien calza.
Escribe una razón personalizada de máx 12 palabras.

También genera:
- styleAdvice: consejo de estilo personalizado de 1-2 oraciones
- outfitTip: cómo combinar los 3 productos elegidos en 1 oración

Responde SOLO con JSON:
{
  "picks": [
    {"productId": "...", "productName": "...", "reason": "...", "matchScore": 95},
    {"productId": "...", "productName": "...", "reason": "...", "matchScore": 88},
    {"productId": "...", "productName": "...", "reason": "...", "matchScore": 82}
  ],
  "styleAdvice": "...",
  "outfitTip": "..."
}`;

    const makeFallback = (): StyleQuizOutput => {
      const fallback = candidates.slice(0, 3);
      const categoryAdvice: Record<string, string> = {
        'Mujer':  'Para esta ocasión te recomendamos prendas femeninas y elegantes que combinen comodidad con estilo.',
        'Hombre': 'Estas prendas te darán un look impecable y apropiado para la ocasión que buscas.',
        'Niño/a': 'Prendas cómodas y resistentes perfectas para los más activos de la familia.',
        'Bebé':   'Telas suaves y seguras para el bienestar del bebé en todo momento.',
      };
      return {
        picks: fallback.map((p, i) => ({
          productId:   p.id,
          productName: p.name,
          reason:      ['Perfecta para tu ocasión y presupuesto', 'Excelente relación calidad-precio', 'Ideal según tus preferencias'][i] ?? 'Recomendado para ti',
          matchScore:  93 - i * 6,
        })),
        styleAdvice: categoryAdvice[input.gender] ?? 'Elige prendas que reflejen tu personalidad y sean cómodas para la ocasión.',
        outfitTip:   'Combina colores neutros con un accesorio de color para completar el look perfectamente.',
      };
    };

    // Si no hay candidatos, devolver fallback directo sin llamar a Gemini
    if (candidates.length === 0) return makeFallback();

    try {
      const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.65 } });

      // Extracción robusta de JSON: busca el primer { ... } del texto
      const raw = res.text ?? '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return makeFallback();

      const parsed = JSON.parse(jsonMatch[0]) as StyleQuizOutput;

      if (!parsed.picks || !Array.isArray(parsed.picks) || parsed.picks.length === 0) {
        return makeFallback();
      }

      const validIds = new Set(candidates.map(p => p.id));
      const validPicks = parsed.picks.filter(p => p.productId && validIds.has(p.productId)).slice(0, 3);

      // Si Gemini no devolvió IDs válidos, usar fallback
      if (validPicks.length === 0) return makeFallback();

      return {
        picks:       validPicks,
        styleAdvice: parsed.styleAdvice || makeFallback().styleAdvice,
        outfitTip:   parsed.outfitTip   || makeFallback().outfitTip,
      };
    } catch {
      return makeFallback();
    }
  }
);
