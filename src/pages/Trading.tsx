import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageShell } from "../components/PageShell";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { ArrowUpRight, ArrowRight } from "../components/Icons";
import { usePrices, formatPrice } from "../hooks/usePrices";
import { easeOutExpo } from "../styles/motion";
import "./Home.css";
import "./Trading.css";

const CATS = [
  { id: "all", label: "All" },
  { id: "fx", label: "Forex" },
  { id: "indices", label: "Indices" },
  { id: "commodities", label: "Commodities" },
  { id: "crypto", label: "Crypto" },
  { id: "shares", label: "Shares" },
] as const;
type CatId = (typeof CATS)[number]["id"];

const SPREAD_DATA: Record<string, { auro: number; ind: number; unit: string }> = {
  "EUR/USD": { auro: 0.0, ind: 0.9, unit: " pip" },
  "GBP/USD": { auro: 0.1, ind: 1.4, unit: " pip" },
  "USD/JPY": { auro: 0.1, ind: 1.2, unit: " pip" },
  "XAU/USD": { auro: 0.15, ind: 0.45, unit: " $" },
  "US500": { auro: 0.4, ind: 1.1, unit: "" },
  "BTC/USD": { auro: 12, ind: 38, unit: " $" },
};

const NARRATIVES = [
  {
    eyebrow: "Forex",
    title: "62 currency pairs at institutional pricing.",
    body: "Aggregated liquidity from 28 tier-1 banks and non-bank LPs. Raw+ pricing on majors, minors and exotics. Average EUR/USD spread of 0.06 pip in London hours.",
    pills: ["62 pairs", "Raw+ from 0.0 pip", "+ $3.00/lot"],
  },
  {
    eyebrow: "Indices",
    title: "23 global cash and futures indices.",
    body: "S&P 500, NASDAQ 100, Dow Jones, DAX 40, FTSE 100, Nikkei 225, Hang Seng — direct from exchange feeds, no synthetic prints.",
    pills: ["23 indices", "From 0.4 pts on US500", "1:200 leverage"],
  },
  {
    eyebrow: "Commodities",
    title: "Metals, energies, agriculturals.",
    body: "Spot gold and silver alongside WTI, Brent and natural gas. Soft commodities (coffee, cocoa, cotton, wheat) for diversified macro exposure.",
    pills: ["Gold from 0.15", "Oil from 0.03", "15 instruments"],
  },
  {
    eyebrow: "Crypto",
    title: "80+ coins, 24/7 settlement.",
    body: "Spot crypto CFDs on Bitcoin, Ethereum, Solana, and 77 other tokens. No wallet management, no on-chain risk — settled in USD at custodial rates.",
    pills: ["80+ coins", "Weekend trading", "Up to 1:5 retail"],
  },
  {
    eyebrow: "Shares",
    title: "1,800+ stocks across 12 exchanges.",
    body: "Apple to ASML, Tesla to Tencent. Single-stock CFDs with commission-free standard accounts and Raw+ pricing on Pro tier.",
    pills: ["1,800+ shares", "12 exchanges", "Fractional lots"],
  },
];

function PHero() {
  return (
    <section className="phero">
      <div className="phero-bg" aria-hidden />
      <div className="container">
        <div className="phero-inner">
          <Reveal>
            <span className="phero-eyebrow">Trading</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="phero-h1">
              2,100 instruments. <span className="serif-italic text-gold">One spread sheet.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="phero-sub">
              FX, indices, commodities, crypto and shares — priced from the same
              aggregated liquidity pool, fillable from the same funded wallet.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="hero-cta-row" style={{ justifyContent: "center" }}>
              <Link to="/accounts" className="btn btn-gold">
                Open account <ArrowUpRight size={16} />
              </Link>
              <Link to="/platforms" className="btn btn-ghost">
                See platforms <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="phero-mini">
              <div><strong>0.0 pip</strong>Raw+ spread on EUR/USD</div>
              <div><strong>11 ms</strong>Median execution</div>
              <div><strong>2,100+</strong>Tradable instruments</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MarketsTable() {
  const [cat, setCat] = useState<CatId>("all");
  const [q, setQ] = useState("");
  const ticks = usePrices(1700);
  const rows = useMemo(() => {
    let r = cat === "all" ? ticks : ticks.filter((t) => t.category === cat);
    if (q.trim()) {
      const term = q.toLowerCase();
      r = r.filter((t) => t.symbol.toLowerCase().includes(term) || t.name.toLowerCase().includes(term));
    }
    return r;
  }, [ticks, cat, q]);

  return (
    <section className="section">
      <div className="container-wide">
        <Reveal className="sec-head">
          <span className="eyebrow">Live prices</span>
          <h2>The full book.</h2>
          <p>All instruments, all categories, live spreads — searchable.</p>
        </Reveal>

        <div className="tbl-wrap">
          <div className="tbl-head">
            <div className="tbl-filters">
              {CATS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={cat === c.id ? "is-active" : ""}
                  onClick={() => setCat(c.id as CatId)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="tbl-search">
              <input
                type="search"
                placeholder="Search EUR/USD, Gold, NVDA…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search instruments"
              />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th className="col-r">Bid / Ask</th>
                  <th className="col-r">Change</th>
                  <th className="col-r opt">Spread</th>
                  <th className="col-r opt">Leverage</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const up = t.change >= 0;
                  const lev = t.category === "crypto" ? "1:5" : t.category === "shares" ? "1:20" : "1:30";
                  const sprUnit = t.category === "fx" ? " pip" : t.category === "crypto" ? "$" : "";
                  const spr = t.category === "fx" ? "0.0" : t.category === "crypto" ? "12" : t.category === "indices" ? "0.4" : "0.15";
                  return (
                    <tr key={t.symbol}>
                      <td>
                        <span className="sym">{t.symbol}</span>
                        <span className="nm">{t.name}</span>
                      </td>
                      <td className="col-r">
                        <span className="px">{formatPrice(t)}</span>
                      </td>
                      <td className="col-r">
                        <span className={`dlt ${up ? "is-up" : "is-down"}`}>
                          {up ? "▲" : "▼"} {t.pct >= 0 ? "+" : ""}{t.pct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="col-r opt">
                        <span className="spr-pill">{spr}{sprUnit}</span>
                      </td>
                      <td className="col-r opt mono text-faint">{lev}</td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "var(--s-8)", color: "var(--ink-3)" }}>
                      No instruments match that filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpreadCompare() {
  const symbols = Object.keys(SPREAD_DATA);
  const [pick, setPick] = useState(symbols[0]);
  const data = SPREAD_DATA[pick];
  const max = Math.max(data.auro, data.ind) * 1.15 || 1;

  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="container-wide">
        <Reveal className="sec-head center">
          <span className="eyebrow">Spread comparator</span>
          <h2>You can see the difference. <span className="serif-italic">Visibly.</span></h2>
          <p>Pick an instrument. We'll show you our typical spread versus the industry average — same data window, same liquidity window.</p>
        </Reveal>

        <Reveal>
          <div className="cmp">
            <div className="cmp-pick">
              <span className="eyebrow">Choose instrument</span>
              <div className="cmp-pill-row">
                {symbols.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`cmp-pill ${pick === s ? "is-active" : ""}`}
                    onClick={() => setPick(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="cmp-note">
                Source: Auro execution data, May 2024 (rolling 30-day average during London session).
                Industry figures: Finance Magnates Intelligence, top-10 retail brokers.
              </p>
            </div>

            <div className="cmp-bars">
              <div className="cmp-row">
                <div className="cmp-name"><strong>Auro Raw+</strong></div>
                <div className="cmp-bar-track">
                  <motion.div
                    className="cmp-bar gold"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: data.auro / max }}
                    transition={{ duration: 0.9, ease: easeOutExpo }}
                    key={`auro-${pick}`}
                  />
                </div>
                <div className="cmp-val">{data.auro.toFixed(2)}{data.unit}</div>
              </div>
              <div className="cmp-row">
                <div className="cmp-name">Industry avg.</div>
                <div className="cmp-bar-track">
                  <motion.div
                    className="cmp-bar peer"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: data.ind / max }}
                    transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.1 }}
                    key={`ind-${pick}`}
                  />
                </div>
                <div className="cmp-val">{data.ind.toFixed(2)}{data.unit}</div>
              </div>
              <div className="cmp-row" style={{ marginTop: "var(--s-4)" }}>
                <div className="cmp-name text-gold"><strong>You save</strong></div>
                <div className="cmp-bar-track" style={{ visibility: "hidden" }} />
                <div className="cmp-val text-gold">
                  {(((data.ind - data.auro) / data.ind) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Narratives() {
  return (
    <section className="section">
      <div className="container-wide">
        <Reveal className="sec-head">
          <span className="eyebrow">Asset classes</span>
          <h2>Five markets. One account.</h2>
          <p>Trade across asset classes from a single funded wallet with cross-margining and unified reporting.</p>
        </Reveal>

        <Stagger className="narr-grid" delay={0.07}>
          {NARRATIVES.map((n) => (
            <StaggerItem className="narr-card" key={n.eyebrow}>
              <span className="narr-eyebrow">{n.eyebrow}</span>
              <h3 className="narr-title">{n.title}</h3>
              <p className="narr-text">{n.body}</p>
              <div className="narr-pills">
                {n.pills.map((p) => (
                  <span className="narr-pill" key={p}>{p}</span>
                ))}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Trading() {
  return (
    <PageShell>
      <PHero />
      <MarketsTable />
      <SpreadCompare />
      <Narratives />
    </PageShell>
  );
}
