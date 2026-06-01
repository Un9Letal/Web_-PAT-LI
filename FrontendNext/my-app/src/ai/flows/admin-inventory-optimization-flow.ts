'use server';
/**
 * @fileOverview Un flujo de Genkit para optimizar el inventario de PAT-LI.
 * 
 * - optimizeInventory - Analiza el stock actual y genera recomendaciones de reposición.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InventoryItemSchema = z.object({
  name: z.string(),
  stock: z.number(),
  category: z.string(),
});

const InventoryOptimizationInputSchema = z.object({
  inventory: z.array(InventoryItemSchema),
});
export type InventoryOptimizationInput = z.infer<typeof InventoryOptimizationInputSchema>;

const OptimizationRecommendationSchema = z.object({
  recommendations: z.array(z.object({
    product: z.string(),
    action: z.string().describe('Acción recomendada: Reponer, Liquidar, Mantener'),
    quantity: z.number().optional(),
    reason: z.string().describe('Explicación lógica basada en el stock'),
  })),
  summary: z.string().describe('Resumen general del estado del inventario'),
});
export type InventoryOptimizationOutput = z.infer<typeof OptimizationRecommendationSchema>;

export async function optimizeInventory(input: InventoryOptimizationInput): Promise<InventoryOptimizationOutput> {
  return inventoryOptimizationFlow(input);
}

const inventoryOptimizationFlow = ai.defineFlow(
  {
    name: 'inventoryOptimizationFlow',
    inputSchema: InventoryOptimizationInputSchema,
    outputSchema: OptimizationRecommendationSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'optimizeInventoryPrompt',
      input: { schema: InventoryOptimizationInputSchema },
      output: { schema: OptimizationRecommendationSchema },
      prompt: `Eres un analista de suministros experto para PAT-LI Textiles.
Analiza el siguiente inventario y genera recomendaciones estratégicas.
Prioriza los productos con stock menor a 10 unidades para "Reponer".
Si hay productos con mucho stock (más de 50), sugiere estrategias como promociones.

Inventario Actual:
{{#each inventory}}
- {{name}} ({{category}}): {{stock}} unidades
{{/each}}`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);
