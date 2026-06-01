'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { MessageData } from 'genkit';

const MessageSchema = z.object({
  role:    z.enum(['user', 'assistant']),
  content: z.string(),
});

const InputSchema = z.object({
  message: z.string(),
  history: z.array(MessageSchema).optional(),
  context: z.string().optional(),
});
export type AdminAssistantInput  = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  reply:       z.string(),
  suggestions: z.array(z.string()).optional(),
});
export type AdminAssistantOutput = z.infer<typeof OutputSchema>;

export async function askAdminAssistant(input: AdminAssistantInput): Promise<AdminAssistantOutput> {
  return adminAssistantFlow(input);
}

const SYSTEM = `Eres el Asistente IA de PAT-LI Textiles, Ica, Perú.
Ayudas al administrador del negocio textil con análisis, estrategias y orientación sobre el sistema de gestión.

CONTEXTO DEL NEGOCIO:
- Tienda y fábrica textil en Ica, Perú · Fundada en 1995
- Especialidad: algodón pima, lino, mezclilla
- Sistema ERP con módulos: Dashboard, Ventas, Inventario, Clientes, Leads, Consultas, Chatbot IA, Proveedores, Reportes, Satisfacción, Devoluciones, Descuentos, Optimización
- Ventas mensuales: S/ 25,000 – 35,000 · Ticket promedio: S/ 85
- Temporada actual: invierno 2026 (mayo-junio) en la costa peruana

MÓDULOS DEL SISTEMA:
- Dashboard: KPIs, meta mensual, gráfico ventas, acciones IA
- Ventas: registro, filtros, pagos (YaPe/Plin/Efectivo/Tarjeta), canal web/tienda
- Inventario: stock en tiempo real, alertas, historial de movimientos
- Clientes: segmentación IA (Premium/Regular/Inactivo), exportar CSV
- Leads: scoring IA, fuente (Facebook/Instagram/Chatbot), seguimiento
- Chatbot IA: métricas de conversaciones, historial real, intenciones detectadas
- Devoluciones: clasificación IA por categoría y urgencia
- Descuentos: cupones con validación, usos, fecha expiración
- Optimización: panel antes/después, ROI del chatbot, conclusión con Gemini
- Reportes: análisis IA de tendencias y predicciones

REGLAS DE RESPUESTA:
1. Responde en español, tono profesional pero cercano
2. Máximo 4-5 líneas por respuesta, directo al punto
3. Si piden análisis, da al menos 1 dato concreto y 1 acción recomendada
4. Si preguntan por un módulo, explica qué hace y cómo usarlo
5. Usa viñetas (•) para listas cortas cuando corresponda`;

const adminAssistantFlow = ai.defineFlow(
  { name: 'adminAssistantFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    // Construir historial de conversación
    const history: MessageData[] = (input.history ?? []).slice(-8).map(m => ({
      role:    m.role === 'user' ? 'user' : 'model',
      content: [{ text: m.content }],
    } as MessageData));

    const res = await ai.generate({
      model:   'googleai/gemini-2.5-flash',
      system:  SYSTEM + (input.context ? `\n\nCONTEXTO ADICIONAL: ${input.context}` : ''),
      messages: [
        ...history,
        { role: 'user', content: [{ text: input.message }] },
      ],
      config: { temperature: 0.55 },
    });

    const raw = (res.text ?? '').trim();
    if (!raw) return { reply: 'No pude generar una respuesta. Por favor intenta de nuevo.', suggestions: [] };

    // Parser robusto: acepta múltiples formatos de sugerencias
    const sepIdx = raw.search(/SUGERENCIAS?:/i);
    let reply       = raw;
    let suggestions: string[] = [];

    if (sepIdx !== -1) {
      reply = raw.slice(0, sepIdx).trim();
      const suggText = raw.slice(sepIdx).replace(/SUGERENCIAS?:/i, '').trim();
      // Acepta separadores: | , · /
      suggestions = suggText
        .split(/[|,·\/\n]/)
        .map(s => s.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/, '').trim())
        .filter(s => s.length > 5 && s.length < 120)
        .slice(0, 3);
    }

    // Si Gemini no generó sugerencias, usar fallback contextual
    if (suggestions.length === 0) {
      suggestions = getContextualSuggestions(input.message);
    }

    return { reply: reply || raw, suggestions };
  },
);

function getContextualSuggestions(message: string): string[] {
  const lower = message.toLowerCase();
  if (lower.includes('venta') || lower.includes('pedido'))
    return ['¿Cómo mejorar la tasa de conversión?', '¿Qué productos venden más esta temporada?', '¿Cómo analizar las ventas por canal?'];
  if (lower.includes('inventario') || lower.includes('stock'))
    return ['¿Qué productos están por agotarse?', '¿Cómo configurar alertas de stock?', '¿Cuándo reabastecer al proveedor?'];
  if (lower.includes('cliente') || lower.includes('lead'))
    return ['¿Cómo reactivar clientes inactivos?', '¿Qué hace la segmentación IA?', '¿Cómo convertir leads en clientes?'];
  if (lower.includes('chatbot') || lower.includes('bot'))
    return ['¿Cómo ver las conversaciones del chatbot?', '¿Qué métricas mide el bot?', '¿Cómo mejorar el ROI del chatbot?'];
  return ['¿Cómo interpreto el dashboard?', '¿Qué módulo me recomiendas revisar hoy?', '¿Cómo exportar los reportes?'];
}
