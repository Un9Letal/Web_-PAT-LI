'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductNeedSchema = z.object({
  id:       z.string(),
  name:     z.string(),
  category: z.string(),
  stock:    z.number(),
  price:    z.number(),
  minStock: z.number().optional(),
});

const InputSchema = z.object({
  products:       z.array(ProductNeedSchema),
  supplierName:   z.string(),
  supplierType:   z.string(),  // e.g. "telas", "confección", "accesorios"
  budget:         z.number().optional(),
});
export type SupplierOrderInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  orderItems: z.array(z.object({
    productId:    z.string(),
    productName:  z.string(),
    quantity:     z.number(),
    unitCost:     z.number(),
    subtotal:     z.number(),
    priority:     z.enum(['urgente', 'normal', 'opcional']),
    justification: z.string(),
  })),
  totalAmount:    z.number(),
  estimatedDays:  z.number(),
  notes:          z.string(),
  subject:        z.string(),
  emailBody:      z.string(),
});
export type SupplierOrderOutput = z.infer<typeof OutputSchema>;

export async function generateSupplierOrder(input: SupplierOrderInput): Promise<SupplierOrderOutput> {
  return supplierOrderFlow(input);
}

const supplierOrderFlow = ai.defineFlow(
  { name: 'supplierOrderFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const criticalProducts = input.products.filter(p => p.stock < 10);

    const prompt = `Eres el jefe de compras de PAT-LI Textiles, tienda de ropa en Ica, Perú.
Debes generar una orden de reabastecimiento profesional para el proveedor "${input.supplierName}" (rubro: ${input.supplierType}).

PRODUCTOS CON STOCK BAJO:
${criticalProducts.map(p =>
  `- ${p.name} (${p.category}): stock actual ${p.stock} ud., precio venta S/ ${p.price}`
).join('\n')}

${input.budget ? `Presupuesto disponible: S/ ${input.budget}` : ''}

Genera:
1. orderItems: para cada producto crítico, determina:
   - quantity: cuántas unidades pedir (considera que el mínimo razonable es 15-30 ud. según categoría)
   - unitCost: costo estimado al proveedor (aproximadamente 55-65% del precio de venta)
   - subtotal: quantity × unitCost
   - priority: "urgente" si stock < 5, "normal" si stock 5-8, "opcional" si stock 9-12
   - justification: razón breve en 6 palabras

2. totalAmount: suma de todos los subtotales
3. estimatedDays: días estimados de entrega (5-15 días típico en Ica)
4. notes: observación general sobre la orden en 1 oración
5. subject: asunto del email al proveedor (profesional, en español)
6. emailBody: email completo profesional en español peruano dirigido a ${input.supplierName}, solicitando los productos, con tono comercial cordial (4-5 párrafos)

Responde SOLO con JSON válido:
{
  "orderItems": [...],
  "totalAmount": N,
  "estimatedDays": N,
  "notes": "...",
  "subject": "...",
  "emailBody": "..."
}`;

    const res = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt, config: { temperature: 0.4 } });
    const text = res.text.trim().replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(text);
      return {
        orderItems:    parsed.orderItems    ?? [],
        totalAmount:   parsed.totalAmount   ?? 0,
        estimatedDays: parsed.estimatedDays ?? 10,
        notes:         parsed.notes         ?? '',
        subject:       parsed.subject       ?? `Orden de reabastecimiento PAT-LI — ${new Date().toLocaleDateString('es-PE')}`,
        emailBody:     parsed.emailBody     ?? '',
      };
    } catch {
      return {
        orderItems:    [],
        totalAmount:   0,
        estimatedDays: 10,
        notes:         'No se pudo generar la orden automáticamente.',
        subject:       `Orden de reabastecimiento PAT-LI — ${new Date().toLocaleDateString('es-PE')}`,
        emailBody:     'Estimado proveedor, adjuntamos nuestra orden de reabastecimiento mensual. Favor confirmar disponibilidad y fecha de entrega.',
      };
    }
  }
);
