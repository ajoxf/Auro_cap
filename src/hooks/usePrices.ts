import { useEffect, useRef, useState } from "react";
import { INSTRUMENTS, type Instrument } from "../data/instruments";

export type PriceTick = {
  symbol: string;
  name: string;
  category: Instrument["category"];
  digits: number;
  price: number;
  prev: number;
  change: number;
  pct: number;
  ts: number;
};

const SEED_OPEN: Record<string, number> = Object.fromEntries(
  INSTRUMENTS.map((i) => [i.symbol, i.base * (1 + (Math.random() - 0.5) * 0.012)]),
);

function step(prev: number, base: number, vol: number) {
  const drift = (base - prev) * 0.0015;
  const noise = (Math.random() - 0.5) * vol;
  return Math.max(prev + drift + noise, 0);
}

function volatilityFor(i: Instrument): number {
  switch (i.category) {
    case "fx": return i.base * 0.0004;
    case "indices": return i.base * 0.0006;
    case "commodities": return i.base * 0.0008;
    case "crypto": return i.base * 0.0015;
    case "shares": return i.base * 0.0010;
  }
}

export function usePrices(intervalMs = 1100): PriceTick[] {
  const [ticks, setTicks] = useState<PriceTick[]>(() =>
    INSTRUMENTS.map((i) => ({
      symbol: i.symbol,
      name: i.name,
      category: i.category,
      digits: i.digits,
      price: i.base,
      prev: i.base,
      change: i.base - SEED_OPEN[i.symbol],
      pct: ((i.base - SEED_OPEN[i.symbol]) / SEED_OPEN[i.symbol]) * 100,
      ts: Date.now(),
    })),
  );

  const ref = useRef(ticks);
  ref.current = ticks;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setTicks((curr) =>
        curr.map((t) => {
          const meta = INSTRUMENTS.find((i) => i.symbol === t.symbol)!;
          const next = step(t.price, meta.base, volatilityFor(meta));
          const open = SEED_OPEN[t.symbol];
          return {
            ...t,
            prev: t.price,
            price: next,
            change: next - open,
            pct: ((next - open) / open) * 100,
            ts: Date.now(),
          };
        }),
      );
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return ticks;
}

export function formatPrice(t: PriceTick): string {
  return t.price.toLocaleString("en-US", {
    minimumFractionDigits: t.digits,
    maximumFractionDigits: t.digits,
  });
}
