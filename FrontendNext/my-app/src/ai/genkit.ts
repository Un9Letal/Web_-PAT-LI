import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const PRIMARY_KEY   = process.env.GOOGLE_GENAI_API_KEY;
const SECONDARY_KEY = process.env.GOOGLE_GENAI_API_KEY_2;

// Instancia principal
export const ai = genkit({
  plugins: [googleAI({ apiKey: PRIMARY_KEY })],
  model: 'googleai/gemini-2.5-flash',
});

// Instancia secundaria (solo si existe la segunda key en .env.local)
const ai2 = SECONDARY_KEY
  ? genkit({ plugins: [googleAI({ apiKey: SECONDARY_KEY })], model: 'googleai/gemini-2.5-flash' })
  : null;

function isQuotaError(err: unknown): boolean {
  const msg = String(err instanceof Error ? err.message : err).toLowerCase();
  return (
    msg.includes('429')              ||
    msg.includes('quota')            ||
    msg.includes('resource exhausted') ||
    msg.includes('rate limit')       ||
    msg.includes('too many requests')
  );
}

// Parche transparente: reemplaza ai.generate en el mismo objeto
// → todos los flows existentes heredan el fallback automáticamente
const _orig = ai.generate.bind(ai);
(ai as any).generate = async function (options: Parameters<typeof _orig>[0]) {
  try {
    return await _orig(options);
  } catch (err) {
    if (isQuotaError(err) && ai2) {
      console.warn('[AI Fallback] Cuota primaria agotada — usando API key secundaria');
      return await ai2.generate(options);
    }
    throw err;
  }
};
