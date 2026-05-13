import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageShell } from "../components/PageShell";
import { Reveal } from "../components/Reveal";
import { ArrowUpRight, ArrowRight, Check, Apple, Android, Windows, Star } from "../components/Icons";
import { easeOutExpo } from "../styles/motion";
import "./Home.css";
import "./Trading.css";
import "./Platforms.css";

type Mock = "candles" | "dom" | "web" | "mobile";

const PLATFORMS: {
  name: string;
  tag: string;
  lead: string;
  feats: string[];
  mock: Mock;
  links: string[];
}[] = [
  {
    name: "MetaTrader 4",
    tag: "Classic · EA-friendly",
    lead: "The industry standard. Battle-tested execution engine, 30+ technical indicators, and a thriving ecosystem of expert advisors.",
    feats: ["9 timeframes", "30 built-in indicators", "MQL4 EAs & custom indicators", "One-click trading", "Mobile + desktop sync", "VPS-ready"],
    mock: "candles",
    links: ["Windows", "macOS", "iOS", "Android"],
  },
  {
    name: "MetaTrader 5",
    tag: "Multi-asset · Hedging",
    lead: "MT4's successor. 21 timeframes, depth-of-market on supported instruments, and an upgraded scripting language for sophisticated automation.",
    feats: ["21 timeframes", "38 indicators · 44 objects", "Hedging & netting modes", "Depth of Market", "Built-in economic calendar", "MQL5 algo studio"],
    mock: "candles",
    links: ["Windows", "macOS", "iOS", "Android"],
  },
  {
    name: "cTrader",
    tag: "Pro · DOM-first",
    lead: "Built from scratch for ECN traders. Full Level II depth on every order, native cAlgo automation, and the cleanest order ladder in the business.",
    feats: ["54 timeframes", "Level II depth on every order", "Native cAlgo automation", "Micro-lot precision (0.01)", "FIX API for institutional", "Smart Stop-Out"],
    mock: "dom",
    links: ["Windows", "macOS", "Web", "iOS", "Android"],
  },
  {
    name: "WebTrader",
    tag: "Zero install",
    lead: "Auro's in-house platform. No download. Markets, charts, and orders in any modern browser — synced to your mobile in real time.",
    feats: ["Browser-native (WebGL)", "Auto-sync with mobile", "Multi-window layouts", "Workspace presets", "Heatmap of correlations", "PDF account statements"],
    mock: "web",
    links: ["Chrome", "Safari", "Edge", "Firefox"],
  },
];

function PHero() {
  return (
    <section className="phero">
      <div className="phero-bg" aria-hidden />
      <div className="container">
        <div className="phero-inner">
          <Reveal><span className="phero-eyebrow">Platforms</span></Reveal>
          <Reveal delay={0.08}>
            <h1 className="phero-h1">
              Four platforms. <span className="serif-italic text-gold">Same wallet.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="phero-sub">
              Trade from the industry-standard MetaTrader suite, the depth-driven cTrader, or
              our browser-native WebTrader — all linked to the same balance and positions.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="hero-cta-row" style={{ justifyContent: "center" }}>
              <Link to="/accounts" className="btn btn-gold">
                Open account <ArrowUpRight size={16} />
              </Link>
              <a href="#mobile" className="btn btn-ghost">
                Get the mobile app <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CandleMock() {
  const bars = Array.from({ length: 18 }, (_, i) => {
    const seed = (i * 13) % 100;
    const up = seed % 3 !== 0;
    const top = 30 + (seed % 30);
    const bot = 70 + (seed % 25);
    const oh = up ? top : bot - 16;
    const ol = up ? bot - 12 : top + 16;
    return { x: 12 + i * 22, up, top, bot, oh, ol };
  });
  return (
    <svg viewBox="0 0 420 240" preserveAspectRatio="xMidYMid slice">
      <g stroke="var(--hairline)" strokeWidth="1">
        <line x1="0" y1="60" x2="420" y2="60" />
        <line x1="0" y1="120" x2="420" y2="120" />
        <line x1="0" y1="180" x2="420" y2="180" />
      </g>
      {bars.map((b, i) => (
        <g key={i}>
          <line
            x1={b.x}
            y1={b.top - 8}
            x2={b.x}
            y2={b.bot + 8}
            stroke={b.up ? "var(--up)" : "var(--down)"}
            strokeWidth="1.2"
          />
          <motion.rect
            x={b.x - 5}
            y={Math.min(b.oh, b.ol)}
            width="10"
            height={Math.abs(b.oh - b.ol)}
            fill={b.up ? "var(--up)" : "var(--down)"}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.03 * i, ease: easeOutExpo }}
            style={{ transformOrigin: "center" }}
          />
        </g>
      ))}
    </svg>
  );
}

function DOMMock() {
  const rows = [
    { px: "1.0867", q: 8.4 },
    { px: "1.0866", q: 12.1 },
    { px: "1.0865", q: 6.8 },
    { px: "1.0864", q: 18.4 },
  ];
  return (
    <div className="dom-grid">
      <div className="dom-cell ask" style={{ background: "var(--up-tint)" }}><span>3.2</span><span>1.0868</span></div>
      <div className="dom-cell px">1.0866</div>
      <div className="dom-cell bid" style={{ background: "var(--down-tint)" }}><span>1.0864</span><span>5.4</span></div>
      {rows.flatMap((r, i) => [
        <div key={`a${i}`} className="dom-cell ask"><span>{r.q.toFixed(1)}</span><span>{r.px}</span></div>,
        <div key={`p${i}`} className="dom-cell" style={{ background: "var(--paper-2)" }}>—</div>,
        <div key={`b${i}`} className="dom-cell bid"><span>{r.px}</span><span>{r.q.toFixed(1)}</span></div>,
      ])}
    </div>
  );
}

function WebMock() {
  return (
    <svg viewBox="0 0 420 240" width="100%" height="100%">
      <rect x="10" y="10" width="120" height="220" rx="6" fill="var(--paper)" stroke="var(--hairline)" />
      <g fontFamily="DM Mono" fontSize="9" fill="var(--ink-3)">
        <text x="20" y="30">WATCHLIST</text>
        {["EUR/USD", "GBP/USD", "XAU/USD", "BTC/USD", "US500", "NAS100", "TSLA"].map((s, i) => (
          <text key={s} x="20" y={50 + i * 18} fill="var(--ink)">{s}</text>
        ))}
      </g>
      <rect x="140" y="10" width="270" height="160" rx="6" fill="var(--paper)" stroke="var(--hairline)" />
      <motion.path
        d="M150 130 L170 110 L190 120 L210 90 L230 95 L250 70 L270 75 L290 50 L310 60 L330 40 L350 55 L370 35 L390 45"
        fill="none"
        stroke="var(--gold-deep)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.4, ease: easeOutExpo }}
      />
      <rect x="140" y="180" width="270" height="50" rx="6" fill="var(--paper)" stroke="var(--hairline)" />
      <text x="150" y="200" fontFamily="DM Mono" fontSize="9" fill="var(--ink)">BUY 1.00 EUR/USD @ 1.0866</text>
      <text x="150" y="218" fontFamily="DM Mono" fontSize="9" fill="var(--up)">▲ +12.40</text>
    </svg>
  );
}

function PlatformMock({ kind }: { kind: Mock }) {
  return (
    <div className="plat-mock">
      <div className="plat-mock-bar">
        <div className="plat-mock-dots">
          <span className="plat-mock-dot" />
          <span className="plat-mock-dot" />
          <span className="plat-mock-dot" />
        </div>
        <span>auro · {kind === "dom" ? "cTrader" : kind === "web" ? "WebTrader" : "MetaTrader"}</span>
      </div>
      <div className="plat-mock-body">
        {kind === "candles" && <div className="mock-candles"><CandleMock /></div>}
        {kind === "dom" && <DOMMock />}
        {kind === "web" && <WebMock />}
      </div>
    </div>
  );
}

function PlatformStrip() {
  return (
    <section className="section">
      <div className="container-wide">
        <Reveal className="sec-head">
          <span className="eyebrow">Choose your weapon</span>
          <h2>Four ways to trade. <span className="serif-italic">Same liquidity, same execution.</span></h2>
        </Reveal>

        <div>
          {PLATFORMS.map((p) => (
            <Reveal key={p.name} delay={0.05}>
              <div className="plat">
                <div className="plat-info">
                  <h3 className="plat-name">{p.name} <small>{p.tag}</small></h3>
                  <p className="plat-lead">{p.lead}</p>
                  <div className="plat-feats">
                    {p.feats.map((f) => (
                      <div className="plat-feat" key={f}>
                        <Check size={14} /> {f}
                      </div>
                    ))}
                  </div>
                  <div className="plat-row">
                    {p.links.map((l) => (
                      <span className="narr-pill mono" key={l}>{l}</span>
                    ))}
                  </div>
                </div>
                <PlatformMock kind={p.mock} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonTable() {
  const cols = ["MT4", "MT5", "cTrader", "WebTrader"];
  const rows: { label: string; vals: (string | boolean)[] }[] = [
    { label: "Timeframes", vals: ["9", "21", "54", "21"] },
    { label: "Min lot", vals: ["0.01", "0.01", "0.01", "0.01"] },
    { label: "DOM (Level II)", vals: [false, true, true, true] },
    { label: "Algorithmic", vals: ["MQL4", "MQL5", "C# cAlgo", "API"] },
    { label: "Hedging", vals: [true, true, true, true] },
    { label: "Mobile app", vals: [true, true, true, true] },
    { label: "Browser", vals: [false, false, true, true] },
    { label: "FIX API", vals: [false, false, true, true] },
  ];
  const recIdx = 2;
  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="container-wide">
        <Reveal className="sec-head center">
          <span className="eyebrow">Compare</span>
          <h2>At a glance.</h2>
          <p>Pick the platform that matches your workflow — switch anytime, same account.</p>
        </Reveal>

        <Reveal>
          <div style={{ overflowX: "auto" }}>
            <table className="cmp-table">
              <thead>
                <tr>
                  <th></th>
                  {cols.map((c, i) => (
                    <th key={c} className={i === recIdx ? "col-rec" : ""}>
                      {c}{i === recIdx ? <> · <Star size={11} /></> : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    {r.vals.map((v, i) => (
                      <td key={i} className={i === recIdx ? "col-rec" : ""}>
                        {typeof v === "boolean" ? (
                          v ? <Check size={16} /> : <span className="no">—</span>
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MobileBand() {
  return (
    <section id="mobile" className="section">
      <div className="container-wide">
        <Reveal>
          <div className="mobile-band">
            <div>
              <span className="eyebrow">Mobile</span>
              <h2 style={{ margin: "var(--s-3) 0 var(--s-4)" }}>Trade in the queue. <span className="serif-italic">Or the back of a taxi.</span></h2>
              <p className="sub-lead" style={{ marginBottom: "var(--s-4)" }}>
                Native iOS and Android apps. 4.8★ across 18,400 App Store reviews. Touch ID / Face ID,
                push price alerts, and a one-tap close-all-positions emergency button — because life happens.
              </p>
              <div className="testi-stars" style={{ marginBottom: "var(--s-3)" }}>
                {[0,1,2,3,4].map((i) => <Star key={i} size={16} />)}
                <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)", letterSpacing: "0.04em" }}>
                  4.8 · 18,400+ reviews
                </span>
              </div>
              <div className="dl-buttons">
                <a className="dl-btn" href="#ios">
                  <Apple size={22} />
                  <span><small>Download on the</small>App Store</span>
                </a>
                <a className="dl-btn" href="#android">
                  <Android size={22} />
                  <span><small>Get it on</small>Google Play</span>
                </a>
                <a className="dl-btn" href="#windows">
                  <Windows size={20} />
                  <span><small>Desktop for</small>Windows · macOS</span>
                </a>
              </div>
            </div>
            <div className="phone-wrap" aria-hidden>
              <div className="phone-screen">
                <div className="phone-row">
                  <span>AURO</span><span>10:24</span>
                </div>
                <div className="phone-row">
                  <span style={{ color: "var(--ink)", fontFamily: "var(--font-display)", fontSize: 16 }}>Portfolio</span>
                  <span style={{ color: "var(--up)" }}>+1.84%</span>
                </div>
                <div className="phone-chart">
                  <svg viewBox="0 0 200 100" preserveAspectRatio="none">
                    <motion.path
                      d="M0 70 L20 65 L40 50 L60 55 L80 35 L100 40 L120 20 L140 30 L160 10 L180 18 L200 5"
                      stroke="var(--gold-deep)"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 1.4, ease: easeOutExpo }}
                    />
                  </svg>
                </div>
                <div className="phone-pill"><span>EUR/USD</span><span className="up">▲ +0.42%</span></div>
                <div className="phone-pill"><span>XAU/USD</span><span className="up">▲ +1.18%</span></div>
                <div className="phone-pill"><span>BTC/USD</span><span className="dn">▼ -0.84%</span></div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Platforms() {
  return (
    <PageShell>
      <PHero />
      <PlatformStrip />
      <ComparisonTable />
      <MobileBand />
    </PageShell>
  );
}
