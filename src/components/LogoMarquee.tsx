import { motion } from "framer-motion";
import "./LogoMarquee.css";

const LOGOS = [
  { name: "FCA", sub: "Financial Conduct Authority" },
  { name: "CySEC", sub: "Cyprus Securities & Exchange" },
  { name: "FSCA", sub: "Financial Sector Conduct Authority" },
  { name: "LMAX", sub: "Tier-1 liquidity partner" },
  { name: "LSEG", sub: "London Stock Exchange Group" },
  { name: "EQUINIX", sub: "LD4 · NY4 · TY3 co-location" },
  { name: "BLOOMBERG", sub: "Market data partner" },
  { name: "TRADINGVIEW", sub: "Charting integration" },
  { name: "HSBC", sub: "Segregated funds custodian" },
  { name: "VISA", sub: "Card on-ramps" },
];

export function LogoMarquee() {
  const stream = [...LOGOS, ...LOGOS];
  return (
    <section className="lmq" aria-label="Trust signals">
      <div className="container-wide">
        <div className="lmq-head">
          <span className="lmq-eyebrow">Trusted partners</span>
          <p className="lmq-line">
            <span>Regulators · Liquidity providers · Custodians · Data</span>
          </p>
        </div>
      </div>
      <div className="lmq-track">
        <motion.div
          className="lmq-row"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        >
          {stream.map((l, i) => (
            <div className="lmq-item" key={`${l.name}-${i}`}>
              <span className="lmq-name">{l.name}</span>
              <span className="lmq-sub">{l.sub}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
