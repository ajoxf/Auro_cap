import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageShell } from "../components/PageShell";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { Sparkline, genSeries } from "../components/Sparkline";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Bolt,
  Shield,
  Globe,
  Headset,
  Lock,
  Chart,
  Star,
} from "../components/Icons";
import { usePrices, formatPrice } from "../hooks/usePrices";
import { easeOutExpo } from "../styles/motion";
import "./Home.css";

/* ============================================================
   HERO
   ============================================================ */
function Hero() {
  const reduce = useReducedMotion();
  const ticks = usePrices(1100);
  const featured = useMemo(
    () => [
      ticks.find((t) => t.symbol === "EUR/USD"),
      ticks.find((t) => t.symbol === "XAU/USD"),
      ticks.find((t) => t.symbol === "BTC/USD"),
    ].filter(Boolean),
    [ticks],
  );

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden />
      <div className="hero-grid" aria-hidden />

      <div className="container-wide hero-inner">
        <div>
          <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="dot" />
            FCA · CySEC · FSCA — FOUNDED 2002
          </motion.div>

          <h1 className="hero-h1">
            <motion.span
              className="word"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
              }}
            >
              {["Trade ", "the ", "world's", " markets."].map((chunk, i) => (
                <motion.span
                  key={i}
                  className={`chunk ${chunk.trim() === "world's" ? "italic-word" : ""}`}
                  variants={{
                    hidden: { y: reduce ? 0 : "110%", opacity: reduce ? 0 : 1 },
                    visible: {
                      y: "0%",
                      opacity: 1,
                      transition: { duration: 0.95, ease: easeOutExpo },
                    },
                  }}
                >
                  {chunk}
                </motion.span>
              ))}
            </motion.span>
          </h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          >
            FX, indices, commodities, and crypto — at institutional spreads with
            sub-11ms execution from LD4, NY4, and TY3. Built for traders who count basis points.
          </motion.p>

          <motion.div
            className="hero-cta-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/accounts" className="btn btn-gold">
              Open live account <ArrowUpRight size={16} />
            </Link>
            <Link to="/platforms" className="btn btn-ghost">
              Try demo <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            className="hero-trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.95, ease: "easeOut" }}
          >
            <span className="hero-trust-item"><Check size={14} /> Spreads from 0.0 pip</span>
            <span className="hero-trust-divider" />
            <span className="hero-trust-item"><Check size={14} /> Sub-11ms execution</span>
            <span className="hero-trust-divider" />
            <span className="hero-trust-item"><Check size={14} /> Negative balance protection</span>
          </motion.div>
        </div>

        <div className="hero-stage" aria-hidden>
          <div className="hero-stage-bg" />
          {featured.map((t, i) => {
            if (!t) return null;
            const positions = [
              { top: "8%", left: "8%" },
              { top: "38%", right: "4%" },
              { bottom: "8%", left: "16%" },
            ];
            const up = t.change >= 0;
            return (
              <motion.div
                key={t.symbol}
                className="fcard"
                style={positions[i]}
                initial={{ opacity: 0, y: 30, scale: 0.94 }}
                animate={{
                  opacity: 1,
                  y: [0, -8, 0],
                  scale: 1,
                }}
                transition={{
                  opacity: { duration: 0.7, delay: 0.4 + i * 0.15, ease: "easeOut" },
                  scale: { duration: 0.7, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] },
                  y: reduce
                    ? { duration: 0 }
                    : {
                        duration: 5 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1 + i * 0.4,
                      },
                }}
              >
                <div className="fcard-top">
                  <span className="fcard-sym">{t.symbol}</span>
                  <span>{t.category.toUpperCase()}</span>
                </div>
                <motion.div
                  className="fcard-px"
                  key={t.price.toFixed(t.digits)}
                  initial={reduce ? false : { color: up ? "#2F6B45" : "#A23A30" }}
                  animate={{ color: "var(--ink)" }}
                  transition={{ duration: 0.9 }}
                >
                  {formatPrice(t)}
                </motion.div>
                <span className={`fcard-delta ${up ? "is-up" : "is-down"}`}>
                  {up ? "▲" : "▼"} {t.pct >= 0 ? "+" : ""}{t.pct.toFixed(2)}% today
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STATS
   ============================================================ */
const STATS: { value: number; suffix?: string; prefix?: string; decimals?: number; label: string }[] = [
  { value: 2100, suffix: "+", label: "Instruments" },
  { value: 23, suffix: " yrs", label: "Since 2002" },
  { value: 2.1, suffix: "M+", decimals: 1, label: "Clients worldwide" },
  { value: 170, suffix: "+", label: "Countries served" },
  { value: 0.0, suffix: " pip", decimals: 1, label: "Raw spreads from" },
  { value: 24, suffix: "/5", label: "Support coverage" },
];

function Stats() {
  return (
    <section className="stats">
      <div className="container-wide">
        <Stagger className="stats-grid" delay={0.07}>
          {STATS.map((s) => (
            <StaggerItem className="stat-cell" key={s.label}>
              <div className="stat-num">
                <AnimatedNumber
                  value={s.value}
                  decimals={s.decimals ?? 0}
                  prefix={s.prefix ?? ""}
                />
                <span className="unit">{s.suffix}</span>
              </div>
              <div className="stat-label">{s.label}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ============================================================
   WHY (BENTO with latency hero tile)
   ============================================================ */
const LAT_ROWS = [
  { label: "Auro", val: 11, kind: "auro" as const },
  { label: "Industry top 10", val: 38, kind: "peer" as const },
  { label: "Industry median", val: 84, kind: "peer" as const },
];

function WhyAuro() {
  return (
    <section className="section">
      <div className="container-wide">
        <Reveal className="sec-head">
          <span className="eyebrow">Why Auro</span>
          <h2>The infrastructure of a tier-1 desk, the access of a retail broker.</h2>
          <p>Six pillars that decide whether you save or lose basis points on every fill.</p>
        </Reveal>

        <div className="bento">
          {/* Hero tile — latency bars */}
          <Reveal className="bento-tile hero-tile">
            <div>
              <span className="bento-icon"><Bolt size={20} /></span>
              <h3 className="bento-title">Execution that compounds.</h3>
              <p className="bento-text">
                Co-located in LD4, NY4 and TY3. Median fill latency under 11&nbsp;ms across
                FX, indices, commodities and crypto — without last-look rejections.
              </p>
            </div>
            <div className="bento-latency">
              {LAT_ROWS.map((r, i) => (
                <div key={r.label} className="lat-row">
                  <span className="lat-label">{r.label}</span>
                  <div className="lat-bar-wrap">
                    <motion.div
                      className={`lat-bar ${r.kind}`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: r.val / 100 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 1.1, ease: easeOutExpo, delay: 0.2 + i * 0.12 }}
                    />
                  </div>
                  <span className="lat-val">{r.val} ms</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.05} className="bento-tile tall">
            <div>
              <span className="bento-icon"><Shield size={20} /></span>
              <h3 className="bento-title">Regulated thrice over.</h3>
              <p className="bento-text">
                FCA in the UK, CySEC in the EU, and FSCA in South Africa. Client funds
                segregated at tier-1 custodians. Negative balance protection on every retail account.
              </p>
            </div>
            <div className="text-mono text-faint" style={{ fontSize: 11 }}>
              FRN 532234 · 233/14 · 47428
            </div>
          </Reveal>

          <Reveal delay={0.1} className="bento-tile normal">
            <span className="bento-icon"><Chart size={20} /></span>
            <h3 className="bento-title">Raw+ pricing.</h3>
            <p className="bento-text">
              Aggregated liquidity from 28 tier-1 banks and non-bank LPs. From 0.0 pip + $3/lot.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="bento-tile normal">
            <span className="bento-icon"><Globe size={20} /></span>
            <h3 className="bento-title">2,100+ instruments.</h3>
            <p className="bento-text">
              60+ FX pairs · 23 indices · 15 commodities · 80+ cryptos · 1,800+ stocks.
            </p>
          </Reveal>

          <Reveal delay={0.2} className="bento-tile normal">
            <span className="bento-icon"><Headset size={20} /></span>
            <h3 className="bento-title">Concierge dealing desk.</h3>
            <p className="bento-text">
              Multilingual support across 12 languages, 24 hours a day, five days a week.
            </p>
          </Reveal>

          <Reveal delay={0.25} className="bento-tile normal">
            <span className="bento-icon"><Lock size={20} /></span>
            <h3 className="bento-title">Capital safety.</h3>
            <p className="bento-text">
              Investor compensation up to £85,000 (FSCS) · €20,000 (ICF) · client-money segregation.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   MARKETS
   ============================================================ */
type Cat = "fx" | "indices" | "commodities" | "crypto" | "shares";
const CATS: { id: Cat | "all"; label: string }[] = [
  { id: "all", label: "All markets" },
  { id: "fx", label: "Forex" },
  { id: "indices", label: "Indices" },
  { id: "commodities", label: "Commodities" },
  { id: "crypto", label: "Crypto" },
  { id: "shares", label: "Shares" },
];

function Markets() {
  const [cat, setCat] = useState<Cat | "all">("all");
  const ticks = usePrices(1700);
  const series = useMemo(() => {
    const m: Record<string, number[]> = {};
    for (const t of ticks) m[t.symbol] = genSeries(28, t.pct);
    return m;
  }, [ticks.length]);

  const filtered = cat === "all" ? ticks.slice(0, 12) : ticks.filter((t) => t.category === cat).slice(0, 12);

  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="container-wide">
        <Reveal className="sec-head">
          <span className="eyebrow">Markets</span>
          <h2>Two thousand instruments. <span className="serif-italic">One ledger.</span></h2>
          <p>Trade major and minor FX pairs, global indices, commodities, top cryptos and 1,800+ shares — from a single funded wallet.</p>
        </Reveal>

        <Reveal className="markets-tabs" as="div">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`markets-tab ${cat === c.id ? "is-active" : ""}`}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </Reveal>

        <motion.div
          className="markets-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.map((t) => {
            const up = t.change >= 0;
            return (
              <motion.div
                key={t.symbol}
                className="market-card"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                }}
              >
                <div className="market-card-info">
                  <span className="market-sym">{t.symbol}</span>
                  <span className="market-name">{t.name}</span>
                </div>
                <div className="market-card-r">
                  <Sparkline points={series[t.symbol] ?? []} width={88} height={28} up={up} />
                  <span className="market-price">{formatPrice(t)}</span>
                  <span className={`market-delta ${up ? "is-up" : "is-down"}`}>
                    {up ? "▲" : "▼"} {t.pct >= 0 ? "+" : ""}{t.pct.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <Reveal style={{ marginTop: "var(--s-8)", textAlign: "center" }}>
          <Link to="/trading" className="btn btn-ghost">
            See all 2,100+ instruments <ArrowUpRight size={14} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   TRUST (testimonials + aggregate + regulators)
   ============================================================ */
const TESTIMONIALS = [
  {
    grad: ["#F3CB60", "#A87622"],
    initials: "JM",
    quote:
      "Switched from a tier-2 ECN after six months of slippage hunting. Auro's Raw+ wins on EUR/USD over 92% of my fills — the data is in my CSVs, not their brochure.",
    name: "James Marek",
    role: "Independent prop trader",
    location: "London, UK",
    verified: "Verified — Trustpilot",
  },
  {
    grad: ["#E8CDA3", "#8D6529"],
    initials: "AO",
    quote:
      "Personal dealer is reachable in under 30 seconds. The few times the desk caught a mis-spec on a large block, they called me first. That's worth a fraction of a pip.",
    name: "Aoife O'Reilly",
    role: "Family office CIO",
    location: "Dublin, IE",
    verified: "Verified — LinkedIn",
  },
  {
    grad: ["#FFEFC0", "#B89042"],
    initials: "RT",
    quote:
      "Backtests against their historical depth are now part of our pre-trade workflow. The API endpoints are unflashy in the best way — they just work.",
    name: "Rohan Thakur",
    role: "Quant lead, Lagrange Capital",
    location: "Singapore",
    verified: "Verified — Bloomberg LP",
  },
];

const REGS = [
  { name: "FCA", region: "United Kingdom", body: "Financial Conduct Authority", lic: "FRN 532234" },
  { name: "CySEC", region: "European Union", body: "Cyprus Securities & Exchange Commission", lic: "233/14" },
  { name: "FSCA", region: "South Africa", body: "Financial Sector Conduct Authority", lic: "FSP 47428" },
];

function Trust() {
  return (
    <section className="section">
      <div className="container-wide">
        <Reveal className="sec-head center">
          <span className="eyebrow">Trust & regulation</span>
          <h2>The receipts.</h2>
          <p>Independently regulated in three jurisdictions, scored by clients in 170 countries.</p>
        </Reveal>

        <div className="trust-grid">
          <Reveal className="trust-panel">
            <div className="trust-aggregate">
              <span className="score">4.8</span>
              <div>
                <div className="stars" aria-label="Average rating 4.8 of 5">
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={20} />)}
                </div>
                <div className="meta mono">38,412 verified reviews · Trustpilot, App Store, Play</div>
              </div>
            </div>

            <ul className="testi" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {TESTIMONIALS.map((t) => (
                <li className="testi-item" key={t.name}>
                  <div
                    className="testi-avatar"
                    aria-hidden
                    style={{ background: `linear-gradient(135deg, ${t.grad[0]}, ${t.grad[1]})` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="testi-stars" aria-hidden>
                      {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={12} />)}
                    </div>
                    <p className="testi-quote">"{t.quote}"</p>
                    <p className="testi-attr">
                      <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{t.name}</strong>
                      · <span>{t.role}</span> · <span>{t.location}</span>
                      <span style={{ marginLeft: "auto", color: "var(--gold-deep)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Check size={12} />{t.verified}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <div>
            <div className="regs-grid">
              {REGS.map((r, i) => (
                <Reveal key={r.name} delay={i * 0.08} className="reg-card">
                  <span className="reg-icon"><Shield size={20} /></span>
                  <div>
                    <div className="reg-name">{r.name} — {r.region}</div>
                    <div className="reg-desc">{r.body}</div>
                    <div className="reg-no">License · {r.lic}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal style={{ marginTop: "var(--s-6)" }} className="trust-panel">
              <span className="eyebrow">Awards 2023–2024</span>
              <ul style={{ listStyle: "none", padding: 0, margin: "var(--s-4) 0 0", display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
                <li><strong className="mono">Finance Magnates</strong> — Best Multi-Asset Broker 2024</li>
                <li><strong className="mono">World Finance</strong> — Best Trading Conditions Europe 2024</li>
                <li><strong className="mono">Global Forex Awards</strong> — Best Liquidity Provider 2023</li>
                <li><strong className="mono">Forex Brokers Awards</strong> — Best Mobile Trading App 2023</li>
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CTA BAND — 3 steps
   ============================================================ */
function CTABand() {
  return (
    <section className="cta-band">
      <div className="cta-band-bg" aria-hidden />
      <div className="container-wide cta-inner">
        <Reveal>
          <span className="eyebrow">Open in three steps</span>
          <h2 style={{ margin: "var(--s-3) 0 var(--s-5)" }}>
            Funded and trading <span className="serif-italic">today.</span>
          </h2>
          <p className="sub-lead" style={{ marginBottom: "var(--s-6)" }}>
            Verification typically completes in under 12 minutes for retail clients.
            Professional and corporate onboarding is concierge-managed.
          </p>
          <div className="hero-cta-row" style={{ marginBottom: 0 }}>
            <Link to="/accounts" className="btn btn-gold">
              Start application <ArrowUpRight size={16} />
            </Link>
            <Link to="/platforms" className="btn btn-ghost">
              Practise with demo <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>

        <Stagger className="cta-steps" delay={0.1}>
          {[
            { n: "1", h: "Apply", p: "Personal details, financial profile and trading experience — 4 minutes." },
            { n: "2", h: "Verify", p: "Upload ID and proof of address. Most retail clients verified in under 12 minutes." },
            { n: "3", h: "Fund and trade", p: "Card, bank transfer, or crypto on-ramp — no deposit fees, ever." },
          ].map((s) => (
            <StaggerItem className="cta-step" key={s.n}>
              <div className="cta-step-num">{s.n}</div>
              <div>
                <h4 className="cta-step-h">{s.h}</h4>
                <p className="cta-step-p">{s.p}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ============================================================
   HOME
   ============================================================ */
export function Home() {
  return (
    <PageShell>
      <Hero />
      <Stats />
      <WhyAuro />
      <Markets />
      <Trust />
      <CTABand />
    </PageShell>
  );
}
