'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  products: z.array(z.object({
    id:       z.string(),
    name:     z.string(),
    category: z.string(),
    stock:    z.number(),
    price:    z.number(),
  })),
  recentSales: z.array(z.object({
    productId:   z.string(),
    totalSold:   z.number(),
    daysTracked: z.number(),
  })),
  totalWebSales: z.number(),
});
export type StockPredictionInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  alerts: z.array(z.object({
    productId:    z.string(),
    productName:  z.string(),
    daysLeft:     z.number(),
    urgency:      z.enum(['critico', 'moderado', 'observacion']),
    recommendation: z.string(),
  })),
  generalInsight: z.string(),
  restockPriority: z.array(z.string()),
});
export type StockPredictionOutput = z.infer<typeof OutputSchema>;

export async function predictStock(input: StockPredictionInput): Promise<StockPredictionOutput> {
  return stockPredictionFlow(input);
}

const stockPredictionFlow = ai.defineFlow(
  { name: 'stockPredictionFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const criticalProducts = input.products
      .filter(p => p.stock > 0 && p.stock < 15)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10);

    const prompt = `Eres el analista de inventarios de PAT-LI Textiles, Ica, Perú.
Con base en el stock actual y el ritmo de ventas recientes, predice cuándo se agotarán los productos críticos.

PRODUCTOS CON STOCK BAJO (ordenados de menor a mayor stock):
${criticalProducts.map(p => {
  const sales = input.recentSales.find(s => s.productId === p.id);
  const dailyRate = sales ? (sales.totalSold / sales.daysTracked).toFixed(1) : '~1.5';
  return `· ${p.name} (${p.category}): ${p.stock} ud. | Ventas diarias aprox: ${dailyRate}/día`;
}).join('\n')}

CONTEXTO ADICIONAL:
- Total ventas web en esta sesión: ${input.totalWebSales}
- Temporada: junio 2025 (temporada alta de verano en Ica)

Para cada producto calcula los días estimados hasta agotarse y clasifica la urgencia:
- "critico": se agota en ≤7 días
- "moderado": se agota en 8-21 días
- "observacion": se agota en 22-45 días

Genera también un generalInsight sobre el estado del inventario y una lista restockPriority con los IDs de productos a reabastecer primero (máx 5).

Responde SOLO con JSON válido:
{
  "alerts": [
    {
      "productId": "...",
      "productName": "...",
      "daysLeft": número,
      "urgency": "critico"|"moderado"|"observacion",
      "recommendation": "Acción concreta en max 10 palabras"
    }
  ],
  "generalInsight": "...",
  "restockPriority": ["id1", "id2", ...]
}`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      config: { temperature: 0.3 },
    });

    const text = response.text.trim().replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(text) as StockPredictionOutput;
    } catch {
      return {
        alerts: criticalProducts.slice(0, 5).map(p => ({
          productId:      p.id,
          productName:    p.name,
          daysLeft:       Math.round(p.stock / 1.5),
          urgency:        p.stock <= 3 ? 'critico' : p.stock <= 8 ? 'moderado' : 'observacion' as any,
          recommendation: `Reabastecer ${Math.max(20, p.stock * 3)} unidades`,
        })),
        generalInsight: `${criticalProducts.length} productos necesitan reabastecimiento urgente esta semana.`,
        restockPriority: criticalProducts.slice(0, 5).map(p => p.id),
      };
    }
  }
);
