import { motion } from "framer-motion";
import { usePrices, formatPrice } from "../hooks/usePrices";
import "./Ticker.css";

export function Ticker() {
  const ticks = usePrices(1300);
  const stream = [...ticks, ...ticks];

  return (
    <div className="ticker" role="region" aria-label="Live market prices">
      <div className="ticker-track">
        <motion.div
          className="ticker-row"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 80, ease: "linear", repeat: Infinity }}
        >
          {stream.map((t, i) => {
            const up = t.change >= 0;
            return (
              <span key={`${t.symbol}-${i}`} className="ticker-cell">
                <span className="ticker-sym">{t.symbol}</span>
                <span className="ticker-px mono">{formatPrice(t)}</span>
                <span className={`ticker-delta mono ${up ? "is-up" : "is-down"}`}>
                  {up ? "▲" : "▼"} {t.pct >= 0 ? "+" : ""}{t.pct.toFixed(2)}%
                </span>
              </span>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
