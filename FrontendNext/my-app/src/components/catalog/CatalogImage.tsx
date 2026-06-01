"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_GRADIENTS: Record<string, string> = {
  Caballeros: 'from-blue-100 to-blue-200',
  Damas:      'from-pink-100 to-rose-200',
  Niños:      'from-yellow-100 to-amber-200',
  Bebés:      'from-purple-100 to-violet-200',
  Deportivo:  'from-green-100 to-emerald-200',
  Accesorios: 'from-slate-100 to-slate-200',
};

const CATEGORY_COLORS: Record<string, string> = {
  Caballeros: 'text-blue-400',
  Damas:      'text-pink-400',
  Niños:      'text-amber-400',
  Bebés:      'text-violet-400',
  Deportivo:  'text-emerald-400',
  Accesorios: 'text-slate-400',
};

interface CatalogImageProps {
  src: string;
  alt: string;
  category?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

function Fallback({ category, className, fill }: { category: string; className?: string; fill?: boolean }) {
  const gradient = CATEGORY_GRADIENTS[category] ?? 'from-slate-100 to-slate-200';
  const color    = CATEGORY_COLORS[category]    ?? 'text-slate-400';
  return (
    <div className={cn(
      `bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-3`,
      fill ? 'absolute inset-0' : 'w-full h-full',
      className,
    )}>
      <Shirt className={cn('h-14 w-14 opacity-30', color)} />
      <span className="text-xs font-semibold text-slate-400/70 uppercase tracking-wider">{category}</span>
    </div>
  );
}

export function CatalogImage({ src, alt, category = 'Caballeros', className, fill, width, height, priority }: CatalogImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return <Fallback category={category} className={className} fill={fill} />;
  }

  // unoptimized=true: el navegador carga directo desde Unsplash CDN,
  // sin pasar por el servidor de optimización de Next.js que puede ser bloqueado.
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className={cn('object-cover', className)}
        onError={() => setErrored(true)}
        priority={priority}
        sizes="(max-width: 768px) 100vw, 400px"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 600}
      height={height ?? 800}
      unoptimized
      className={cn('object-cover', className)}
      onError={() => setErrored(true)}
      priority={priority}
    />
  );
}
