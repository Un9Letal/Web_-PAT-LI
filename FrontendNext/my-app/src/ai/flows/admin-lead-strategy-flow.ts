'use server';
/**
 * @fileOverview Un flujo de Genkit para generar estrategias de conversión de leads.
 * 
 * - generateLeadStrategy - Analiza un prospecto y genera un pitch de ventas y pasos a seguir.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LeadInputSchema = z.object({
  nombre: z.string(),
  fuente: z.string(),
  interes: z.string(),
  nivelInteres: z.string(),
});
export type LeadStrategyInput = z.infer<typeof LeadInputSchema>;

const LeadStrategyOutputSchema = z.object({
  pitch: z.string().describe('Un mensaje de venta personalizado para el cliente'),
  probabilidad: z.string().describe('Probabilidad estimada de cierre (Baja, Media, Alta)'),
  pasosSiguientes: z.array(z.string()).describe('Lista de acciones recomendadas'),
  consejoExperto: z.string().describe('Un consejo breve para el vendedor'),
});
export type LeadStrategyOutput = z.infer<typeof LeadStrategyOutputSchema>;

export async function generateLeadStrategy(input: LeadStrategyInput): Promise<LeadStrategyOutput> {
  return leadStrategyFlow(input);
}

const leadStrategyFlow = ai.defineFlow(
  {
    name: 'leadStrategyFlow',
    inputSchema: LeadInputSchema,
    outputSchema: LeadStrategyOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'leadStrategyPrompt',
      input: { schema: LeadInputSchema },
      output: { schema: LeadStrategyOutputSchema },
      prompt: `Eres un experto en ventas de PAT-LI Textiles. 
Tu objetivo es ayudar al administrador a cerrar una venta con un prospecto.

Datos del Prospecto:
- Nombre: {{nombre}}
- Fuente de captación: {{fuente}}
- Interés principal: {{interes}}
- Nivel de interés: {{nivelInteres}}

Genera una estrategia de conversión que incluya:
1. Un pitch de ventas persuasivo y amable que destaque la calidad de nuestras telas (algodón pima, lino).
2. Una estimación de la probabilidad de cierre basada en el nivel de interés.
3. Tres pasos concretos que el vendedor debe seguir ahora mismo.
4. Un consejo "pro" para este caso específico.`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);
