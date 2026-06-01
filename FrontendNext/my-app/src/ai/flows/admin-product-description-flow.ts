'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  name:     z.string(),
  category: z.string(),
  price:    z.number(),
  stock:    z.number(),
});
export type ProductDescriptionInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  shortDescription: z.string(),
  longDescription:  z.string(),
  keywords:         z.array(z.string()),
  callToAction:     z.string(),
});
export type ProductDescriptionOutput = z.infer<typeof OutputSchema>;

export async function generateProductDescription(input: ProductDescriptionInput): Promise<ProductDescriptionOutput> {
  return productDescriptionFlow(input);
}

const productDescriptionFlow = ai.defineFlow(
  { name: 'productDescriptionFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const prompt = `Eres el copywriter de moda de PAT-LI Textiles, Ica, Perú, especializado en textiles peruanos premium.

Crea contenido de marketing atractivo para este producto:
- Nombre: ${input.name}
- Categoría: ${input.category}
- Precio: S/ ${input.price}
- Stock disponible: ${input.stock} unidades

Genera:
1. shortDescription: 1 oración impactante para la card del catálogo (máx 15 palabras, con emoji al inicio)
2. longDescription: Párrafo de 2-3 oraciones que destaque la calidad, el origen peruano, y beneficios específicos del producto
3. keywords: Lista de 5 palabras clave de SEO relacionadas al producto
4. callToAction: Frase de llamada a la acción urgente y persuasiva (máx 8 palabras)

Estilo: moderno, aspiracional, peruano orgulloso. Evita clichés genéricos.

Responde SOLO con JSON:
{
  "shortDescription": "...",
  "longDescription": "...",
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "callToAction": "..."
}`;

    const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.75 } });
    const text = res.text.trim().replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(text) as ProductDescriptionOutput;
    } catch {
      return {
        shortDescription: `✨ ${input.name} — Calidad PAT-LI garantizada`,
        longDescription:  `El ${input.name} representa lo mejor de la tradición textil de Ica. Elaborado con materiales de primera calidad, combina comodidad y estilo en cada prenda.`,
        keywords:         [input.name.split(' ')[0], input.category, 'Ica', 'Perú', 'calidad'],
        callToAction:     '¡Agrega al carrito ahora!',
      };
    }
  }
);
