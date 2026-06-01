'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  usuario: z.string(),
  mensaje: z.string(),
  canal:   z.string(),
});
export type ConsultaReplyInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  draft:    z.string(),
  tone:     z.enum(['formal', 'cordial', 'urgente']),
  category: z.string(),
});
export type ConsultaReplyOutput = z.infer<typeof OutputSchema>;

export async function generateConsultaReply(input: ConsultaReplyInput): Promise<ConsultaReplyOutput> {
  return consultaReplyFlow(input);
}

const consultaReplyFlow = ai.defineFlow(
  { name: 'consultaReplyFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const prompt = `Eres el agente de atención al cliente de PAT-LI Textiles, Ica, Perú.
Un cliente envió la siguiente consulta por ${input.canal}:

Cliente: ${input.usuario}
Mensaje: "${input.mensaje}"

Redacta una respuesta profesional y empática en español peruano que:
1. Salude al cliente por su nombre (si lo tiene)
2. Responda directamente su consulta con información útil de PAT-LI Textiles
3. Ofrezca ayuda adicional si es necesario
4. Sea breve (máximo 3-4 oraciones) y cálida
5. Use tono apropiado para el canal: ${input.canal}

También clasifica:
- tone: "formal" (WhatsApp empresarial, Email), "cordial" (Web Chat), "urgente" (reclamos o quejas)
- category: tema en 2-3 palabras (ej: "Envíos y despacho", "Stock y tallas", "Precios", "Cambios y devoluciones", "Información general")

Responde SOLO con JSON:
{
  "draft": "Texto de respuesta al cliente...",
  "tone": "cordial",
  "category": "Información general"
}`;

    const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.5 } });
    const text = res.text.trim().replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(text);
      return {
        draft:    parsed.draft    ?? '¡Hola! Gracias por contactarnos. Estamos revisando tu consulta y te responderemos a la brevedad. ¡Quedo a tu disposición!',
        tone:     (['formal','cordial','urgente'].includes(parsed.tone) ? parsed.tone : 'cordial') as ConsultaReplyOutput['tone'],
        category: parsed.category ?? 'Información general',
      };
    } catch {
      return {
        draft:    `Hola ${input.usuario}, gracias por escribirnos a PAT-LI Textiles. Hemos recibido tu consulta y te atenderemos a la brevedad. ¡Estamos para servirte!`,
        tone:     'cordial' as const,
        category: 'Información general',
      };
    }
  }
);
