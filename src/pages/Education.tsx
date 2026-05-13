import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { Reveal } from "../components/Reveal";
import { ArrowUpRight, ArrowRight } from "../components/Icons";
import { BrandImg } from "../components/BrandImg";
import { easeOutExpo } from "../styles/motion";
import "./Home.css";
import "./Trading.css";
import "./Education.css";

type TabId = "academy" | "analysis" | "webinars" | "glossary";

const TABS: { id: TabId; label: string }[] = [
  { id: "academy", label: "Academy" },
  { id: "analysis", label: "Research" },
  { id: "webinars", label: "Webinars" },
  { id: "glossary", label: "Glossary" },
];

const ARTICLES = [
  {
    slug: "forex-from-first-principles",
    tab: "academy" as TabId,
    feat: true,
    tag: "Course",
    level: "Beginner",
    title: "Forex from first principles: a 12-lesson primer.",
    excerpt: "What a currency pair is, why central banks set rates, how spreads emerge, and the four mistakes that account for 60% of beginner losses. Free, no signup, no email gate.",
    read: "65 min · 12 lessons",
  },
  {
    slug: "risk-of-ruin",
    tab: "academy" as TabId,
    feat: false,
    tag: "Guide",
    level: "Intermediate",
    title: "Risk-of-ruin: a working calculator.",
    excerpt: "Position sizing built around your account, win-rate, and stop distance — with a downloadable Excel template.",
    read: "14 min read",
  },
  {
    slug: "depth-of-market",
    tab: "academy" as TabId,
    feat: false,
    tag: "Series",
    level: "Beginner",
    title: "Reading the depth-of-market: a five-part series.",
    excerpt: "What the order book actually shows, what it hides, and how to use it without overfitting.",
    read: "32 min · 5 parts",
  },
  {
    slug: "mql5-bootcamp",
    tab: "academy" as TabId,
    feat: false,
    tag: "Reference",
    level: "Advanced",
    title: "MQL5 algorithmic trading bootcamp.",
    excerpt: "From your first script to a multi-asset cross-correlation system, with source code and walk-forward tests.",
    read: "9 hr · 24 lessons",
  },
  {
    slug: "auro-weekly-247",
    tab: "analysis" as TabId,
    feat: true,
    tag: "Macro",
    level: "Weekly",
    title: "Auro Weekly: dollar at a 16-month high — what breaks first?",
    excerpt: "Our macro desk's read on the May rate path, USD/JPY at MoF intervention zones, and why long gold is becoming consensus. With downloadable charts and the data we used.",
    read: "Issue 247 · 22 min",
  },
  {
    slug: "eur-usd-1860",
    tab: "analysis" as TabId,
    feat: false,
    tag: "FX",
    level: "Daily",
    title: "EUR/USD: 1.0860 holds. Now what?",
    excerpt: "Three scenarios into ECB minutes, with positioning and option flow.",
    read: "5 min · today",
  },
  {
    slug: "btc-etf-flows",
    tab: "analysis" as TabId,
    feat: false,
    tag: "Crypto",
    level: "Daily",
    title: "BTC: spot ETF flows turn net positive.",
    excerpt: "What the BlackRock prints actually mean for spot vs. perp funding spread.",
    read: "4 min · today",
  },
  {
    slug: "sp-earnings-three-names",
    tab: "analysis" as TabId,
    feat: false,
    tag: "Indices",
    level: "Weekly",
    title: "S&P earnings season: the only three names that matter.",
    excerpt: "Mega-cap concentration is back. Here's the read on NVDA, AAPL, and MSFT into prints.",
    read: "9 min read",
  },
];

const WEBINARS = [
  { day: "18", mo: "May", title: "Trading the Fed: live commentary and order book", host: "Maria Bertolini · Chief Macro Strategist", duration: "Wed · 18:00 UTC · 60 min" },
  { day: "23", mo: "May", title: "Algo lab: building a market-regime classifier in MQL5", host: "Dr. Rohan Thakur · Quant Lead", duration: "Mon · 14:00 UTC · 90 min" },
  { day: "29", mo: "May", title: "Risk management for funded prop traders", host: "James Marek · Independent prop trader", duration: "Sun · 16:00 UTC · 75 min" },
  { day: "04", mo: "Jun", title: "Reading the gold tape: COMEX vs. LBMA flow", host: "Aoife O'Reilly · Family office CIO", duration: "Tue · 12:00 UTC · 60 min" },
];

const GLOSSARY = [
  { term: "Pip", def: "The smallest price move a currency pair conventionally makes. Most pairs quote to four decimals; the fourth is the pip. JPY pairs are an exception (two decimals)." },
  { term: "Spread", def: "The difference between bid (sell) and ask (buy) prices, expressed in pips. Lower spreads mean lower cost-per-trade." },
  { term: "Slippage", def: "The difference between the expected price of a trade and the price at which it actually executes. Positive in fast markets when liquidity favors you; negative when it doesn't." },
  { term: "Leverage", def: "The ratio of position size to capital. 1:30 leverage means $1 of margin controls $30 of position. Increases both gains and losses." },
  { term: "Margin call", def: "When account equity falls below required margin, the broker may close positions to prevent further loss. Auro's stop-out is at 50% of required margin on retail accounts." },
  { term: "Lot", def: "Standard unit of trade. One forex lot = 100,000 units of base currency. Mini = 0.1 lot, micro = 0.01 lot." },
  { term: "Hedging", def: "Holding offsetting positions to neutralize risk. Available on Auro across all accounts; some regulators restrict it on retail accounts." },
  { term: "Stop-loss", def: "An order that closes a position once price reaches a specified level, capping the loss on that trade." },
  { term: "ECN", def: "Electronic Communications Network. A broker model where client orders are matched against an aggregated liquidity pool (banks, prime brokers, other clients) rather than against the broker's book." },
  { term: "Liquidity provider", def: "An institution (typically a bank or market-maker) that posts continuous two-way prices, providing the executable quotes a broker aggregates." },
  { term: "Margin", def: "The capital required to open and maintain a leveraged position. Initial margin opens it; maintenance margin keeps it open." },
  { term: "Tick", def: "The minimum price increment for an instrument. On EUR/USD that's 0.00001; on US500 it's 0.1 index points." },
];

function PHero() {
  return (
    <section className="phero">
      <div className="phero-bg" aria-hidden />
      <div className="container">
        <div className="phero-inner">
          <Reveal><span className="phero-eyebrow">Education</span></Reveal>
          <Reveal delay={0.08}>
            <h1 className="phero-h1">
              Research that <span className="serif-italic text-gold">pays for itself.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="phero-sub">
              The Auro Academy, weekly macro from our desk, live webinars with practising traders,
              and a glossary that doesn't make you feel stupid. Free, no signup gate.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="hero-cta-row" style={{ justifyContent: "center" }}>
              <a href="#academy" className="btn btn-gold">
                Start the Academy <ArrowUpRight size={16} />
              </a>
              <a href="#analysis" className="btn btn-ghost">
                Latest research <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ArticleThumb({ tag, level, slug, title }: { tag: string; level: string; slug: string; title: string }) {
  const gradientFallback = (
    <>
      <svg className="article-thumb-chart" viewBox="0 0 400 250" preserveAspectRatio="none">
        <motion.path
          d="M0 200 L40 180 L80 190 L120 150 L160 160 L200 110 L240 130 L280 80 L320 90 L360 50 L400 70"
          fill="none"
          stroke="var(--gold-deep)"
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, ease: easeOutExpo }}
        />
      </svg>
    </>
  );
  return (
    <div className="article-thumb">
      <BrandImg
        src={`/brand/articles/${slug}.jpg`}
        alt={title}
        fallback={gradientFallback}
        style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
      />
      <span className="article-thumb-tag">{tag}</span>
      <span className="article-thumb-level">{level}</span>
    </div>
  );
}

function ArticlesGrid({ tab }: { tab: TabId }) {
  const items = ARTICLES.filter((a) => a.tab === tab);
  return (
    <Reveal>
      <div className="articles-grid">
        {items.map((a) => (
          <article key={a.title} className={`article ${a.feat ? "feat" : ""}`}>
            <ArticleThumb tag={a.tag} level={a.level} slug={a.slug} title={a.title} />
            <div className="article-body">
              <h3 className="article-title">{a.title}</h3>
              <p className="article-excerpt">{a.excerpt}</p>
              <div className="article-meta">
                <span>{a.read}</span>
                <span>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--gold-deep)" }}>
                  Read <ArrowUpRight size={12} />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Reveal>
  );
}

function WebinarsList() {
  return (
    <Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
        {WEBINARS.map((w) => (
          <div key={w.title} className="webinar">
            <div className="webinar-date">
              <span className="day">{w.day}</span>
              <span className="mo">{w.mo}</span>
            </div>
            <div>
              <h4 className="webinar-title">{w.title}</h4>
              <div className="webinar-meta">{w.host} · {w.duration}</div>
            </div>
            <a href="#register" className="btn btn-ghost btn-sm">Register <ArrowUpRight size={14} /></a>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function GlossaryPanel() {
  const [q, setQ] = useState("");
  const [letter, setLetter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let r = GLOSSARY;
    if (letter) r = r.filter((g) => g.term[0].toUpperCase() === letter);
    if (q.trim()) {
      const term = q.toLowerCase();
      r = r.filter((g) => g.term.toLowerCase().includes(term) || g.def.toLowerCase().includes(term));
    }
    return r;
  }, [q, letter]);

  const available = new Set(GLOSSARY.map((g) => g.term[0].toUpperCase()));

  return (
    <Reveal>
      <div className="gloss-search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search 1,200+ terms…"
          aria-label="Search glossary"
        />
      </div>

      <div className="gloss-alpha">
        <button
          type="button"
          className={letter === null ? "is-active" : ""}
          onClick={() => setLetter(null)}
        >
          ALL
        </button>
        {LETTERS.map((l) => (
          <button
            key={l}
            type="button"
            disabled={!available.has(l)}
            className={letter === l ? "is-active" : ""}
            onClick={() => setLetter(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="gloss-grid">
        {filtered.map((g) => (
          <div key={g.term} className="gloss-card">
            <div className="gloss-letter">{g.term[0]}</div>
            <h4 className="gloss-term">{g.term}</h4>
            <p className="gloss-def">{g.def}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-faint" style={{ padding: "var(--s-6)", gridColumn: "1 / -1", textAlign: "center" }}>
            No definitions match.
          </p>
        )}
      </div>
    </Reveal>
  );
}

export function Education() {
  const [tab, setTab] = useState<TabId>("academy");

  return (
    <PageShell>
      <PHero />
      <section className="section">
        <div className="container-wide">
          <div className="edu-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`edu-tab ${tab === t.id ? "is-active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                {tab === t.id && <motion.span layoutId="edu-tab-ind" className="indicator" />}
              </button>
            ))}
          </div>

          {(tab === "academy" || tab === "analysis") && <ArticlesGrid tab={tab} />}
          {tab === "webinars" && <WebinarsList />}
          {tab === "glossary" && <GlossaryPanel />}
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-band-bg" aria-hidden />
        <div className="container">
          <Reveal style={{ textAlign: "center" }}>
            <span className="eyebrow">Subscribe</span>
            <h2 style={{ margin: "var(--s-3) auto var(--s-4)" }}>
              The Auro Weekly. <span className="serif-italic">Free.</span>
            </h2>
            <p className="sub-lead" style={{ margin: "0 auto var(--s-6)" }}>
              Macro, FX, indices and crypto from our desk, delivered every Sunday.
              No spam, no upsells — unsubscribe with one click.
            </p>
            <div className="hero-cta-row" style={{ justifyContent: "center" }}>
              <Link to="/accounts" className="btn btn-gold">
                Subscribe <ArrowUpRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
