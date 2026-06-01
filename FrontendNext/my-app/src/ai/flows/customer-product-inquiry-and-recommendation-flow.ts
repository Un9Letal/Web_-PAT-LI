'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MessageData } from 'genkit';

const CustomerProductInquiryAndRecommendationInputSchema = z.object({
  systemPrompt: z.string().describe('El prompt del sistema que incluye las directrices de venta.'),
  messages: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
});
export type CustomerProductInquiryAndRecommendationInput = z.infer<typeof CustomerProductInquiryAndRecommendationInputSchema>;

const CustomerProductInquiryAndRecommendationOutputSchema = z.object({
  response: z.string().describe('La respuesta del bot enfocada en ventas.'),
});
export type CustomerProductInquiryAndRecommendationOutput = z.infer<typeof CustomerProductInquiryAndRecommendationOutputSchema>;

export async function customerProductInquiryAndRecommendation(
  input: CustomerProductInquiryAndRecommendationInput
): Promise<CustomerProductInquiryAndRecommendationOutput> {
  return customerProductInquiryAndRecommendationFlow(input);
}

const customerProductInquiryAndRecommendationFlow = ai.defineFlow(
  {
    name: 'customerProductInquiryAndRecommendationFlow',
    inputSchema: CustomerProductInquiryAndRecommendationInputSchema,
    outputSchema: CustomerProductInquiryAndRecommendationOutputSchema,
  },
  async (input) => {
    const messages: MessageData[] = input.messages.map(m => ({
      role: m.role,
      content: [{ text: m.content }],
    } as MessageData));

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: `${input.systemPrompt}\n\nRECUERDA: Tu objetivo es vender. Ofrece recomendaciones inteligentes (Cross-selling) y pregunta si desea separar el producto o pasar por tienda.`,
      messages,
      config: { temperature: 0.7 },
    });

    const text = response.text;
    if (!text) throw new Error('No response from AI model.');
    return { response: text };
  }
);
