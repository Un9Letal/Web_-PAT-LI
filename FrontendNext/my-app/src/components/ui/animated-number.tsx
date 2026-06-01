"use client";

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({
  value, duration = 1200, prefix = '', suffix = '', decimals = 0, className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const startRef  = useRef<number | null>(null);
  const frameRef  = useRef<number>(0);
  const fromRef   = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to   = value;
    if (from === to) return;

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current  = to;
        startRef.current = null;
      }
    };

    cancelAnimationFrame(frameRef.current);
    startRef.current = null;
    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  const formatted = display.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
