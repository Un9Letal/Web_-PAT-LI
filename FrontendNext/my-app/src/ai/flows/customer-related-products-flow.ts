'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  productId:       z.string(),
  productName:     z.string(),
  category:        z.string(),
  price:           z.number(),
  availableProducts: z.array(z.object({
    id:       z.string(),
    name:     z.string(),
    category: z.string(),
    price:    z.number(),
  })),
});
export type RelatedProductsInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  recommendations: z.array(z.object({
    productId: z.string(),
    reason:    z.string(),
  })),
  stylingTip: z.string(),
});
export type RelatedProductsOutput = z.infer<typeof OutputSchema>;

export async function getRelatedProducts(input: RelatedProductsInput): Promise<RelatedProductsOutput> {
  return relatedProductsFlow(input);
}

const relatedProductsFlow = ai.defineFlow(
  { name: 'relatedProductsFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const candidates = input.availableProducts
      .filter(p => p.id !== input.productId)
      .slice(0, 30);

    const prompt = `Eres el estilista experto de PAT-LI Textiles, Ica, Perú.
El cliente está viendo este producto:
- Nombre: ${input.productName}
- Categoría: ${input.category}
- Precio: S/ ${input.price}

Productos disponibles en el catálogo (elige los 3 que mejor combinan):
${candidates.map(p => `· ID: ${p.id} | ${p.name} (${p.category}) | S/ ${p.price}`).join('\n')}

Selecciona exactamente 3 productos que combinen bien con "${input.productName}" y explica brevemente por qué (máx 8 palabras por razón). Prioriza complementariedad (ej: si es pantalón → polo + cinturón; si es blusa → falda + accesorio).

También genera un stylingTip: consejo de moda de 1 oración breve y divertida en español peruano.

Responde SOLO con JSON válido:
{
  "recommendations": [
    {"productId": "...", "reason": "..."},
    {"productId": "...", "reason": "..."},
    {"productId": "...", "reason": "..."}
  ],
  "stylingTip": "..."
}`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      config: { temperature: 0.6 },
    });

    const text = response.text.trim().replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(text) as RelatedProductsOutput;
      // Validar que los IDs existan
      const validIds = new Set(candidates.map(p => p.id));
      parsed.recommendations = parsed.recommendations.filter(r => validIds.has(r.productId)).slice(0, 3);
      return parsed;
    } catch {
      const fallback = candidates.filter(p => p.category !== input.category).slice(0, 3);
      return {
        recommendations: fallback.map(p => ({ productId: p.id, reason: 'Combina perfecto con este look' })),
        stylingTip: '¡Con los accesorios correctos, cualquier look brilla más!',
      };
    }
  }
);
