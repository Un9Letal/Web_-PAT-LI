'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  rating:  z.number(),
  comment: z.string(),
  topic:   z.string().optional(),
});
export type SurveyResponseInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  response:    z.string(),
  tone:        z.enum(['empathetic', 'apologetic', 'grateful', 'informative']),
  actionItems: z.array(z.string()),
});
export type SurveyResponseOutput = z.infer<typeof OutputSchema>;

export async function generateSurveyResponse(input: SurveyResponseInput): Promise<SurveyResponseOutput> {
  return surveyResponseFlow(input);
}

const surveyResponseFlow = ai.defineFlow(
  { name: 'surveyResponseFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const prompt = `Eres el gerente de atención al cliente de PAT-LI Textiles, Ica, Perú.
Un cliente dejó la siguiente reseña post-compra:

Calificación: ${input.rating}/5 estrellas
Comentario: "${input.comment}"
${input.topic ? `Tema detectado: ${input.topic}` : ''}

Redacta una respuesta profesional, empática y en español peruano que:
1. Agradezca el feedback específicamente
2. Reconozca el problema si lo hay (no seas defensivo)
3. Explique qué acción tomará PAT-LI para mejorar
4. Invite al cliente a volver o contactar directamente
5. Sea breve (máximo 4 oraciones)
6. Use un tono cálido, genuino, nunca robótico

También indica el tono más apropiado: "empathetic" (si hay queja seria), "apologetic" (si hay error de PAT-LI), "grateful" (si es positivo), "informative" (si es duda o sugerencia).

Y lista 1-2 acciones internas que PAT-LI debería tomar a raíz de este feedback (para uso interno del admin).

Responde SOLO con JSON:
{
  "response": "Texto de respuesta al cliente...",
  "tone": "empathetic|apologetic|grateful|informative",
  "actionItems": ["Acción interna 1", "Acción interna 2"]
}`;

    const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.5 } });
    const text = res.text.trim().replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(text);
      return {
        response:    parsed.response ?? '',
        tone:        (['empathetic','apologetic','grateful','informative'].includes(parsed.tone) ? parsed.tone : 'empathetic') as SurveyResponseOutput['tone'],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      };
    } catch {
      return {
        response:    'Estimado cliente, gracias por tu valiosa opinión. Tomamos nota de tu experiencia y trabajaremos para mejorar. ¡Te esperamos de vuelta en PAT-LI Textiles!',
        tone:        (input.rating <= 2 ? 'apologetic' : 'grateful') as SurveyResponseOutput['tone'],
        actionItems: ['Revisar proceso mencionado en el comentario'],
      };
    }
  }
);
