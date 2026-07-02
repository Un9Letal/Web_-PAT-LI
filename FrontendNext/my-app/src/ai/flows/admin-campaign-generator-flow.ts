'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  ocasion:     z.string(),        // "Black Friday", "Día de la Madre", etc.
  fecha:       z.string().optional(),
  categorias:  z.array(z.string()).optional(),
  topProductos:z.array(z.string()).optional(),
});
export type CampaignGeneratorInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  nombre:        z.string(),
  descuentoSugerido: z.number(),
  copy:          z.string(),
  emoji:         z.string(),
  canalesSugeridos: z.array(z.string()),
  categoriasSugeridas: z.array(z.string()),
  estrategia:    z.string(),
  hashtagsSugeridos: z.array(z.string()),
});
export type CampaignGeneratorOutput = z.infer<typeof OutputSchema>;

export async function generateCampaign(input: CampaignGeneratorInput): Promise<CampaignGeneratorOutput> {
  return campaignGeneratorFlow(input);
}

const campaignGeneratorFlow = ai.defineFlow(
  { name: 'campaignGeneratorFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const prompt = `Eres el estratega de marketing de PAT-LI Textiles, tienda de ropa de calidad en Ica, Perú (algodón pima, lino, mezclilla).

Genera una campaña promocional completa para la siguiente ocasión:
- Ocasión / fecha especial: ${input.ocasion}
${input.fecha ? `- Fecha: ${input.fecha}` : ''}
${input.categorias?.length ? `- Categorías sugeridas: ${input.categorias.join(', ')}` : ''}
${input.topProductos?.length ? `- Productos destacados: ${input.topProductos.join(', ')}` : ''}

CATEGORÍAS DISPONIBLES: Caballeros, Damas, Niños, Bebés, Deportivo, Accesorios.
CANALES DISPONIBLES: Web, Redes Sociales, Email, WhatsApp.

Genera:
- nombre: nombre atractivo de la campaña (máx 5 palabras)
- descuentoSugerido: % de descuento ideal según la fecha (número entre 10 y 50)
- copy: mensaje de marketing persuasivo para redes sociales (2-3 oraciones con emojis, tono peruano cercano)
- emoji: 1 emoji que represente la campaña
- canalesSugeridos: array con 2-3 canales recomendados
- categoriasSugeridas: array con 2-3 categorías objetivo según la ocasión
- estrategia: 1 oración con la estrategia clave (ej. urgencia, exclusividad, regalo)
- hashtagsSugeridos: array de 3-4 hashtags para redes

Responde SOLO con JSON válido:
{
  "nombre": "...",
  "descuentoSugerido": 30,
  "copy": "...",
  "emoji": "🛍️",
  "canalesSugeridos": ["Web", "Redes Sociales"],
  "categoriasSugeridas": ["Damas", "Accesorios"],
  "estrategia": "...",
  "hashtagsSugeridos": ["#PatliTextiles", "..."]
}`;

    const makeFallback = (): CampaignGeneratorOutput => ({
      nombre: `${input.ocasion} PAT-LI`,
      descuentoSugerido: 25,
      copy: `¡${input.ocasion} llegó a PAT-LI Textiles! Aprovecha descuentos especiales en nuestra colección de algodón pima premium. Calidad iqueña al mejor precio. 🛍️`,
      emoji: '🛍️',
      canalesSugeridos: ['Web', 'Redes Sociales', 'Email'],
      categoriasSugeridas: ['Caballeros', 'Damas', 'Accesorios'],
      estrategia: 'Crear urgencia con tiempo limitado y resaltar la calidad premium a precio rebajado.',
      hashtagsSugeridos: ['#PatliTextiles', '#ModaIca', '#OfertasPatli'],
    });

    try {
      const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.75 } });
      const raw = res.text ?? '';
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return makeFallback();
      const parsed = JSON.parse(match[0]) as CampaignGeneratorOutput;
      if (!parsed.nombre || !parsed.copy) return makeFallback();
      return {
        nombre:              parsed.nombre,
        descuentoSugerido:   Math.min(50, Math.max(10, parsed.descuentoSugerido || 25)),
        copy:                parsed.copy,
        emoji:               parsed.emoji || '🛍️',
        canalesSugeridos:    Array.isArray(parsed.canalesSugeridos) && parsed.canalesSugeridos.length ? parsed.canalesSugeridos : ['Web', 'Redes Sociales'],
        categoriasSugeridas: Array.isArray(parsed.categoriasSugeridas) && parsed.categoriasSugeridas.length ? parsed.categoriasSugeridas : ['Caballeros', 'Damas'],
        estrategia:          parsed.estrategia || makeFallback().estrategia,
        hashtagsSugeridos:   Array.isArray(parsed.hashtagsSugeridos) && parsed.hashtagsSugeridos.length ? parsed.hashtagsSugeridos : makeFallback().hashtagsSugeridos,
      };
    } catch {
      return makeFallback();
    }
  }
);
