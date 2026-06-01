"use client";

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { toast } from '@/hooks/use-toast';

export function SalesWatcher() {
  const completedSales  = useAppStore((s) => s.completedSales);
  const surveyResponses = useAppStore((s) => s.surveyResponses);
  const products        = useAppStore((s) => s.products);
  const prevSales       = useRef(completedSales.length);
  const prevSurveys     = useRef(surveyResponses.length);

  // Nuevo pedido web
  useEffect(() => {
    if (completedSales.length > prevSales.current) {
      const sale = completedSales[0];

      toast({
        title: `🛒 Nuevo pedido web — ${sale.id}`,
        description: `S/ ${sale.total.toFixed(2)} · ${sale.paymentMethod} · ${sale.items.length} producto(s)`,
      });

      // Chequear stock bajo DESPUÉS de que updateStock ya actualizó el store
      setTimeout(() => {
        const lowStock = sale.items
          .map(i => products.find(p => p.id === i.id))
          .filter((p): p is NonNullable<typeof p> => !!p && p.stock < 10 && p.stock > 0);

        const outOfStock = sale.items
          .map(i => products.find(p => p.id === i.id))
          .filter((p): p is NonNullable<typeof p> => !!p && p.stock === 0);

        if (outOfStock.length > 0) {
          toast({
            title: '🚨 ¡Producto agotado!',
            description: `Sin stock: ${outOfStock.map(p => p.name).join(', ')}`,
            variant: 'destructive',
          });
        } else if (lowStock.length > 0) {
          toast({
            title: '⚠️ Stock bajo',
            description: `Pocas unidades: ${lowStock.map(p => `${p.name} (${p.stock} ud.)`).join(' · ')}`,
            variant: 'destructive',
          });
        }
      }, 1400);
    }
    prevSales.current = completedSales.length;
  }, [completedSales.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Nueva encuesta completada
  useEffect(() => {
    if (surveyResponses.length > prevSurveys.current) {
      const r = surveyResponses[0];
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      toast({
        title: `📋 Nueva encuesta recibida ${stars}`,
        description: r.comment
          ? `"${r.comment.slice(0, 60)}${r.comment.length > 60 ? '…' : ''}"`
          : 'Sin comentario.',
      });
    }
    prevSurveys.current = surveyResponses.length;
  }, [surveyResponses.length]);

  return null;
}
