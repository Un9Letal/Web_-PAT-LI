import type { Campaign } from '@/store/appStore';

/**
 * Utilidades para aplicar campañas de marketing al catálogo público y carrito.
 * Una campaña se considera vigente cuando su estado es 'activa'.
 */

/** Devuelve la mejor campaña activa (mayor descuento) para una categoría dada. */
export function getBestActiveCampaign(campaigns: Campaign[], category: string): Campaign | null {
  const matching = campaigns.filter(
    (c) => c.estado === 'activa' && c.categorias.includes(category)
  );
  if (matching.length === 0) return null;
  return matching.reduce((best, c) => (c.descuento > best.descuento ? c : best));
}

/** Todas las campañas activas (para banner). */
export function getActiveCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns.filter((c) => c.estado === 'activa');
}

/** Precio con descuento de campaña aplicado (redondeado a 2 decimales). */
export function applyCampaignDiscount(price: number, campaign: Campaign | null): number {
  if (!campaign) return price;
  return +(price * (1 - campaign.descuento / 100)).toFixed(2);
}
