import { NextResponse } from 'next/server';
import { customerCatalogAccessViaChatbot } from '@/ai/flows/customer-catalog-access-via-chatbot-flow';
import { customerEscalationToHumanAgent } from '@/ai/flows/customer-escalation-to-human-agent-flow';
import { customerProductInquiryAndRecommendation } from '@/ai/flows/customer-product-inquiry-and-recommendation-flow';

const MOCK_CATALOG = `
CABALLEROS:
- Polo Algodón Pima Blanco: S/ 45.00 (Stock: 25 und.)
- Polo Algodón Pima Negro: S/ 45.00 (Stock: 18 und.)
- Polo Pima Azul Marino: S/ 45.00 (Stock: 22 und.)
- Polo Pima Oversize Gris: S/ 55.00 (Stock: 14 und.)
- Camisa Lino Beige: S/ 85.00 (Stock: 12 und.)
- Camisa Oxford Cuadros: S/ 90.00 (Stock: 10 und.)
- Jean Skinny Azul Clásico: S/ 95.00 (Stock: 15 und.)
- Jean Slim Fit Gris: S/ 95.00 (Stock: 11 und.)
- Pantalón Drill Beige: S/ 85.00 (Stock: 16 und.)
- Short Cargo Caqui: S/ 65.00 (Stock: 20 und.)
- Casaca Bomber Verde: S/ 160.00 (Stock: 7 und.)
- Jogger Premium Gris: S/ 75.00 (Stock: 18 und.)

DAMAS:
- Vestido Lino Floral Blanco: S/ 120.00 (Stock: 8 und.)
- Vestido Midi Azul: S/ 135.00 (Stock: 9 und.)
- Vestido Mini Estampado: S/ 95.00 (Stock: 11 und.)
- Vestido Maxi Boho Beige: S/ 150.00 (Stock: 6 und.)
- Blusa Seda Natural Crema: S/ 95.00 (Stock: 10 und.)
- Blusa Floral Manga Corta: S/ 65.00 (Stock: 14 und.)
- Falda Plisada Mostaza: S/ 75.00 (Stock: 13 und.)
- Casaca Cuero Sintético Negro: S/ 180.00 (Stock: 5 und.)
- Blazer Sastre Gris: S/ 165.00 (Stock: 7 und.)
- Pantalón Palazzo Beige: S/ 95.00 (Stock: 10 und.)
- Jumpsuit Lino Terracota: S/ 145.00 (Stock: 6 und.)

NIÑOS:
- Conjunto Algodón Pima Niño: S/ 65.00 (Stock: 20 und.)
- Polera Capucha Niño: S/ 55.00 (Stock: 18 und.)
- Vestidito Floral Niña: S/ 60.00 (Stock: 15 und.)
- Jean Jogger Niño: S/ 70.00 (Stock: 12 und.)
- Set Verano Niña: S/ 75.00 (Stock: 10 und.)

BEBÉS:
- Mameluco Algodón Pima Bebé: S/ 45.00 (Stock: 25 und.)
- Set Bodies x3 Bebé: S/ 65.00 (Stock: 20 und.)
- Pijama Ositos Bebé: S/ 55.00 (Stock: 18 und.)
- Ajuar 5 Piezas Recién Nacido: S/ 120.00 (Stock: 8 und.)

DEPORTIVO:
- Polo Running Dry-Fit: S/ 55.00 (Stock: 30 und.)
- Leggings Deportivos Mujer: S/ 75.00 (Stock: 22 und.)
- Short Deportivo Caballero: S/ 55.00 (Stock: 25 und.)
- Chaqueta Cortaviento: S/ 130.00 (Stock: 10 und.)
- Sudadera Hoodie Unisex: S/ 110.00 (Stock: 15 und.)
- Conjunto Yoga Mujer: S/ 130.00 (Stock: 12 und.)

ACCESORIOS:
- Pack Medias Algodón x3: S/ 25.00 (Stock: 80 und.)
- Bolso Tote Canvas Natural: S/ 75.00 (Stock: 15 und.)
- Correa Cuero Caballero: S/ 55.00 (Stock: 20 und.)
- Bufanda Lana Suave: S/ 45.00 (Stock: 18 und.)
- Gorro Tejido Invierno: S/ 35.00 (Stock: 25 und.)
- Billetera Cuero Slim: S/ 65.00 (Stock: 22 und.)
- Gafas Sol UV400: S/ 85.00 (Stock: 14 und.)
- Pañuelo Seda Estampado: S/ 55.00 (Stock: 16 und.)
- Mochila Tela Premium: S/ 120.00 (Stock: 10 und.)
`;

const buildProductInquirySystem = (catalog: string) =>
`Eres PAT-LI Bot, el asesor de ventas virtual de PAT-LI Textiles, reconocida tienda de ropa en Ica, Perú.

TU PERSONALIDAD:
- Amable, entusiasta y experto en moda y textiles
- Tono cálido y cercano, como un buen amigo que conoce la tienda de pies a cabeza
- Usas frases peruanas sutiles: "¡Claro que sí!", "A la orden", "Con gusto", "Qué buena elección"
- Eres PROACTIVO: no esperas que el cliente pregunte todo, tú ofreces y sugieres

CATÁLOGO ACTUAL (precios en Soles PEN, actualizados en tiempo real):
${catalog}

REGLAS DE RESPUESTA:
- Cita SIEMPRE precios exactos del catálogo: **Nombre Producto** a solo S/ XX.XX
- Si el producto está AGOTADO: "Lamentablemente ese está agotado por ahora, pero te recomiendo **X** que es muy similar a S/ XX"
- Máximo 4 líneas de respuesta, usa saltos de línea para organizar
- Al recomendar un producto, SIEMPRE sugiere otro que combina (cross-selling)
- SIEMPRE termina con una pregunta que invite a continuar o a comprar: "¿Te lo separamos?", "¿Deseas más info?", "¿Pasas por tienda hoy?"

ESCENARIOS CLAVE:
- Regalo: Pregunta género/edad/ocasión → recomienda 2-3 opciones con precio
- Tallas: "Manejamos tallas S, M, L y XL. En tienda tenemos guía de tallas para ayudarte a elegir la perfecta."
- Precio alto: Ofrece alternativa más económica + menciona que aceptan YaPe/Plin
- Delivery: "Sí, hacemos delivery en Ica y envíos nacionales por courier. ¿A qué dirección te lo enviamos?"
- Devoluciones: "Aceptamos cambios en 7 días con boleta. ¿Tienes algún problema con un pedido?"`;

const ESCALATION_SYSTEM = `Eres PAT-LI Bot de PAT-LI Textiles, Ica, Perú.
Si el cliente pide hablar con una persona real o tiene un reclamo grave: responde ÚNICAMENTE con [DERIVAR_ASESOR].
De lo contrario, responde brevemente e invita a continuar la conversación.`;

const ESCALATION_KEYWORD = '[DERIVAR_ASESOR]';

const ESCALATION_PHRASES = /asesor|humano|persona real|empleado|quiero hablar con|necesito que me llame|reclamo grave|queja formal|devolución|reembolso|me estafaron/i;
const PRODUCT_KEYWORDS = /precio|talla|tallas|stock|disponible|modelo|colores|polo|jean|blusa|vestido|casaca|medias|short|pima|lino|algodón|prenda|ropa|producto|catálogo|bebé|bebés|mameluco|body|bodies|deportivo|running|leggings|hoodie|jogger|bolso|bufanda|gorro|billetera|mochila|camisa|pantalón|falda|blazer|jumpsuit|chaqueta|sudadera|regalo|comprar|cuánto cuesta|cuanto cuesta|qué tienen|que tienen|tienen algo|tienen algo/i;

function detectLeadData(messages: Array<{ role: string; content: string }>): { phone?: string; name?: string } | null {
  const userText = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
  const phoneMatch = userText.match(/\b9\d{8}\b|\b9\d{2}[\s-]\d{3}[\s-]\d{3}\b/);
  if (!phoneMatch) return null;
  const phone = phoneMatch[0].replace(/[\s-]/g, '');
  const nameMatch = userText.match(/(?:me llamo|soy|mi nombre es|llámame|llamame)\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)?)/i);
  return { phone, name: nameMatch?.[1] };
}

function getSuggestions(responseText: string, intention: string): string[] {
  const text = responseText.toLowerCase();

  if (intention === 'compra' || text.includes('separar') || text.includes('separamos')) {
    return ['Sí, quiero separarlo', '¿Aceptan YaPe?', '¿Tienen delivery?'];
  }
  if (text.includes('caballero') || text.includes('hombre') || text.includes('polo')) {
    return ['¿Qué jeans tienen?', '¿Tienen accesorios?', 'Ver todo para hombre'];
  }
  if (text.includes('dama') || text.includes('mujer') || text.includes('vestido') || text.includes('blusa')) {
    return ['¿Tienen vestidos de fiesta?', '¿Qué tallas manejan?', '¿Tienen accesorios?'];
  }
  if (text.includes('niño') || text.includes('niña') || text.includes('bebé') || text.includes('bebe')) {
    return ['¿Qué tallas para bebé?', '¿Es algodón pima?', 'Ver más para niños'];
  }
  if (text.includes('deportivo') || text.includes('gym') || text.includes('running')) {
    return ['¿Tienen conjunto deportivo?', '¿Qué tallas?', 'Ver accesorios deportivos'];
  }
  if (text.includes('descuento') || text.includes('oferta') || text.includes('promoción')) {
    return ['¿Cuánto de descuento?', '¿Tienen cupones?', '¿Venta al por mayor?'];
  }
  if (text.includes('delivery') || text.includes('envío') || text.includes('envio')) {
    return ['¿Cuánto cuesta el envío?', '¿Cuánto demora?', '¿Aceptan YaPe?'];
  }
  return ['¿Qué más tienen?', '¿Tienen descuentos?', 'Busco un regalo'];
}

export async function POST(req: Request) {
  try {
    const { messages, liveCatalog } = await req.json();
    const lastUserMessage: string = messages[messages.length - 1]?.content || '';
    const catalogToUse: string = (liveCatalog && liveCatalog.trim().length > 50) ? liveCatalog : MOCK_CATALOG;

    const leadData = detectLeadData(messages);

    // Escalation detection
    if (ESCALATION_PHRASES.test(lastUserMessage)) {
      const escalationResult = await customerEscalationToHumanAgent({
        userMessage: lastUserMessage,
        systemPrompt: ESCALATION_SYSTEM,
      });

      if (escalationResult.escalateToHuman) {
        return NextResponse.json({
          response: '¡Claro que sí! Te estoy conectando con uno de nuestros asesores de PAT-LI Textiles.\n\nPor favor espera un momento o contáctanos directamente:\n📍 Calle Lima 123, Ica\n📞 +51 056-212121\n💬 WhatsApp: +51 987 654 321\n\n¡Gracias por tu preferencia!',
          escalate: true,
          intention: 'reclamo',
          suggestions: [],
          leadDetected: leadData,
        });
      }
    }

    // Product-specific flow
    if (PRODUCT_KEYWORDS.test(lastUserMessage)) {
      const productResult = await customerProductInquiryAndRecommendation({
        systemPrompt: buildProductInquirySystem(catalogToUse),
        messages,
      });
      return NextResponse.json({
        response: productResult.response,
        escalate: false,
        intention: 'compra',
        suggestions: getSuggestions(productResult.response, 'compra'),
        leadDetected: leadData,
      });
    }

    // General conversation flow
    const flowResult = await customerCatalogAccessViaChatbot({
      messages,
      productCatalog: catalogToUse,
    });

    const shouldEscalate = flowResult.response.includes(ESCALATION_KEYWORD);
    const responseText = flowResult.response.replace(ESCALATION_KEYWORD, '').trim();
    const intention = flowResult.detectedIntention ?? 'consulta';

    return NextResponse.json({
      response: shouldEscalate
        ? '¡Entendido! Te estoy conectando con un asesor humano.\n\nMientras esperas, también puedes visitarnos en Calle Lima 123, Ica o escribirnos al WhatsApp: +51 987 654 321.'
        : responseText,
      escalate: shouldEscalate,
      intention,
      suggestions: shouldEscalate ? [] : getSuggestions(responseText, intention),
      leadDetected: leadData,
    });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return NextResponse.json({
      response: 'Lo siento, tuve un problema técnico momentáneo. ¿Puedes repetir tu consulta? También puedes llamarnos al +51 056-212121.',
      escalate: false,
      intention: 'consulta',
      suggestions: ['¿Qué tienen para caballeros?', '¿Cuáles son sus precios?', '¿Tienen delivery?'],
    });
  }
}
