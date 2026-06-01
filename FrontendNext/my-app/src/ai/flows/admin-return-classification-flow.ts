'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  cliente:   z.string(),
  producto:  z.string(),
  motivo:    z.string(),
  diasDesdeCompra: z.number(),
});
export type ReturnClassificationInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  categoria:      z.string(),
  accion:         z.string(),
  recomendacion:  z.string(),
  prioridad:      z.enum(['alta', 'media', 'baja']),
  aceptar:        z.boolean(),
});
export type ReturnClassificationOutput = z.infer<typeof OutputSchema>;

export async function classifyReturn(input: ReturnClassificationInput): Promise<ReturnClassificationOutput> {
  return returnClassificationFlow(input);
}

const returnClassificationFlow = ai.defineFlow(
  { name: 'returnClassificationFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const prompt = `Eres el sistema de gestión de devoluciones de PAT-LI Textiles, Ica, Perú. Analiza la siguiente solicitud de devolución y clasifícala.

DATOS DE LA DEVOLUCIÓN:
- Cliente: ${input.cliente}
- Producto: ${input.producto}
- Motivo declarado: ${input.motivo}
- Días desde la compra: ${input.diasDesdeCompra}

POLÍTICA DE DEVOLUCIONES PAT-LI:
- Plazo máximo: 30 días desde la compra
- Defectos de fabricación: siempre se acepta
- Talla incorrecta: se acepta si tiene etiqueta intacta (hasta 15 días)
- Cambio de parecer: solo si es dentro de 7 días y tiene embalaje original
- Producto dañado por uso: se rechaza

Responde EXACTAMENTE en este formato JSON (sin markdown):
{
  "categoria": "defecto_fabricacion | talla_incorrecta | cambio_parecer | dano_usuario | producto_no_recibido | otro",
  "accion": "descripción concisa de la acción a tomar (1 oración)",
  "recomendacion": "recomendación detallada para el administrador (2-3 oraciones)",
  "prioridad": "alta | media | baja",
  "aceptar": true | false
}`;

    const res = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      config: { temperature: 0.2 },
    });

    const text = res.text.trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return parsed as ReturnClassificationOutput;
  }
);
