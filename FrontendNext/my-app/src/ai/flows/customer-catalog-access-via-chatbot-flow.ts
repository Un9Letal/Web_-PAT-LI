'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MessageData } from 'genkit';

/**
 * @fileOverview Flujo de Genkit para el Chatbot de PAT-LI Textiles.
 * 
 * Implementa objetivos de venta proactiva, recomendaciones inteligentes,
 * personalización y generación de leads para clientes en Ica, Perú.
 */

const CustomerCatalogAccessViaChatbotInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ).describe('Historial completo de la conversación.'),
  productCatalog: z.string().describe('Catálogo de productos actual desde la base de datos.'),
});
export type CustomerCatalogAccessViaChatbotInput = z.infer<typeof CustomerCatalogAccessViaChatbotInputSchema>;

const CustomerCatalogAccessViaChatbotOutputSchema = z.object({
  response: z.string().describe('Respuesta del bot con lógica de ventas y asistencia.'),
  detectedIntention: z.enum(['consulta', 'compra', 'reclamo', 'otro']).optional(),
});
export type CustomerCatalogAccessViaChatbotOutput = z.infer<typeof CustomerCatalogAccessViaChatbotOutputSchema>;

export async function customerCatalogAccessViaChatbot(input: CustomerCatalogAccessViaChatbotInput): Promise<CustomerCatalogAccessViaChatbotOutput> {
  return customerCatalogAccessViaChatbotFlow(input);
}

const customerCatalogAccessViaChatbotFlow = ai.defineFlow(
  {
    name: 'customerCatalogAccessViaChatbotFlow',
    inputSchema: CustomerCatalogAccessViaChatbotInputSchema,
    outputSchema: CustomerCatalogAccessViaChatbotOutputSchema,
  },
  async (input) => {
    const systemPrompt = `Eres PAT-LI Bot, el asesor virtual de ventas de PAT-LI Textiles, tienda de ropa de calidad en Ica, Perú (Calle Lima 123).

PERSONALIDAD:
- Amable, entusiasta y experto en moda y textiles peruanos
- Tono cálido y natural, como un vendedor de confianza
- Frases peruanas sutiles: "¡Qué buena elección!", "A la orden", "Con gusto"
- Eres PROACTIVO: anticipas necesidades, ofreces, y guías hacia la compra

OBJETIVO PRINCIPAL: Ayudar al cliente a encontrar lo que busca Y cerrar la venta.

CATÁLOGO EN TIEMPO REAL:
${input.productCatalog}

REGLAS ESTRICTAS:
1. PRECIOS: Cita siempre precios exactos del catálogo con el formato "**Nombre** a S/ XX.XX". NUNCA inventes precios.
2. AGOTADO: "Ese modelo está agotado por ahora, pero tenemos **X** que es muy similar a S/ XX. ¿Te interesa?"
3. FORMATO: Máximo 4 líneas. Usa saltos de línea para organizar. Nada de párrafos largos.
4. CROSS-SELLING: Cuando recomiendas un producto, SIEMPRE menciona uno más que combine.
5. CIERRE: Termina SIEMPRE con una pregunta de cierre: "¿Te lo separamos?", "¿Pasas por tienda hoy?", "¿Te envío más fotos por WhatsApp?"
6. LEAD: Si el cliente muestra intención de compra seria, pide: "Para coordinarte, ¿me compartes tu nombre y número?"
7. ESCALAMIENTO: Si hay reclamo grave o el cliente insiste en asesor humano, responde SOLO: [DERIVAR_ASESOR]
8. DELIVERY: "Sí hacemos delivery en Ica y envíos nacionales por courier. ¿Cuál es tu dirección?"
9. PAGOS: Aceptamos efectivo, YaPe, Plin y transferencia bancaria.

RESPONDE de forma concisa, en español peruano, y con genuino interés en ayudar.`;

    const messages: MessageData[] = input.messages.map(m => ({
      role: m.role,
      content: [{ text: m.content }],
    } as MessageData));

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      messages,
      config: {
        temperature: 0.7,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error('No output received from the AI model.');
    }

    // Inferir la intención a partir del texto de respuesta
    let detectedIntention: any = 'consulta';
    if (text.toLowerCase().includes('reclamo') || text.toLowerCase().includes('queja')) detectedIntention = 'reclamo';
    if (text.toLowerCase().includes('comprar') || text.toLowerCase().includes('precio')) detectedIntention = 'compra';

    return {
      response: text,
      detectedIntention: detectedIntention
    };
  }
);
