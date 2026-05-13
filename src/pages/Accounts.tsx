import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "../components/PageShell";
import { Reveal } from "../components/Reveal";
import { ArrowUpRight, ArrowRight, Check, Plus } from "../components/Icons";
import "./Home.css";
import "./Trading.css";
import "./Accounts.css";

const TIERS = [
  { id: "std", name: "Standard", min: "$100 minimum", rec: false },
  { id: "raw", name: "Raw+", min: "$1,000 minimum", rec: true },
  { id: "elite", name: "Elite", min: "$25,000 minimum", rec: false },
  { id: "pro", name: "Pro", min: "$250,000 minimum", rec: false },
  { id: "isl", name: "Islamic", min: "$100 minimum", rec: false },
] as const;

type Row =
  | { group: string }
  | { label: string; vals: (string | boolean)[] };

const ROWS: Row[] = [
  { group: "Pricing" },
  { label: "Spread (EUR/USD)", vals: ["from 1.0 pip", "from 0.0 pip", "from 0.0 pip", "from 0.0 pip", "from 1.0 pip"] },
  { label: "Commission per side", vals: ["$0", "$3 / lot", "$2 / lot", "$1 / lot", "$0"] },
  { label: "Swap-free", vals: [false, false, false, false, true] },
  { label: "Funding fees", vals: ["—", "—", "—", "—", "—"] },

  { group: "Trading" },
  { label: "Max leverage", vals: ["1:30", "1:30", "1:30", "1:200", "1:30"] },
  { label: "Min position", vals: ["0.01 lot", "0.01 lot", "0.01 lot", "0.01 lot", "0.01 lot"] },
  { label: "Stop-out", vals: ["50%", "50%", "50%", "30%", "50%"] },
  { label: "All instruments", vals: [true, true, true, true, true] },

  { group: "Service" },
  { label: "Personal manager", vals: [false, false, true, true, false] },
  { label: "Priority desk", vals: [false, false, true, true, false] },
  { label: "VIP webinars", vals: [false, false, true, true, false] },
  { label: "Quarterly research", vals: [false, true, true, true, true] },

  { group: "Eligibility" },
  { label: "Retail / Pro", vals: ["Retail", "Retail", "Retail", "Professional", "Retail"] },
  { label: "Compensation scheme", vals: [true, true, true, false, true] },
];

const FAQ = [
  {
    q: "What's the difference between Standard and Raw+?",
    a: "Standard accounts have a mark-up spread (typically 1.0 pip on EUR/USD) and no commission — best for low-frequency traders who want predictable, all-in pricing. Raw+ accounts give you institutional-grade spreads from 0.0 pip plus a $3 round-turn commission per lot — better economics if you trade more than ~5 lots per month.",
  },
  {
    q: "Are my funds segregated?",
    a: "Yes. Client funds are held in segregated accounts at tier-1 custodians (HSBC, Barclays, and Bank of New York Mellon depending on your entity). Under FCA and CySEC rules, client money is never used for the firm's own purposes and is protected in the event of insolvency.",
  },
  {
    q: "How fast is verification?",
    a: "Most retail applications are verified in under 12 minutes via automated KYC and document scanning. Professional and corporate onboarding involves additional checks and is concierge-managed by our compliance desk — typically completed within one business day.",
  },
  {
    q: "Do you accept clients from my country?",
    a: "Auro accepts clients from 170+ jurisdictions. Restricted regions include the United States, Canada, Iran, North Korea, and Cuba. Our application form will tell you immediately whether your residence is supported.",
  },
  {
    q: "What's negative balance protection?",
    a: "If a market gap pushes your balance below zero, we absorb the shortfall — you can never lose more than you deposited. This applies to all retail accounts under FCA, CySEC and FSCA regulation.",
  },
  {
    q: "Can I switch account types later?",
    a: "Yes — switching between Standard, Raw+ and Islamic accounts is a one-click change in your dashboard. Upgrading to Elite or Pro requires meeting the minimum balance and (for Pro) the EU MiFID II professional-client criteria.",
  },
  {
    q: "What deposit methods do you accept?",
    a: "Bank wire (SEPA, SWIFT, BACS, ACH), card (Visa, Mastercard, Amex), and major stablecoins (USDT, USDC) via licensed on-ramp partners. We charge zero deposit fees in all channels — third-party fees may still apply.",
  },
  {
    q: "How do withdrawals work?",
    a: "Withdrawals are processed within one business day. Funds are returned to the original deposit source by default (regulatory requirement). Zero withdrawal fees on Raw+, Elite, and Pro tiers; $5 flat on Standard for non-bank withdrawals.",
  },
];

function PHero() {
  return (
    <section className="phero">
      <div className="phero-bg" aria-hidden />
      <div className="container">
        <div className="phero-inner">
          <Reveal><span className="phero-eyebrow">Accounts</span></Reveal>
          <Reveal delay={0.08}>
            <h1 className="phero-h1">
              Five accounts. <span className="serif-italic text-gold">Built around you.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="phero-sub">
              From a $100 starter to a $250,000 professional desk — the same execution engine,
              the same instruments, priced for how you actually trade.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="hero-cta-row" style={{ justifyContent: "center" }}>
              <Link to="/accounts" className="btn btn-gold">
                Open account <ArrowUpRight size={16} />
              </Link>
              <a href="#compare" className="btn btn-ghost">
                Compare tiers <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Compare() {
  const recIdx = TIERS.findIndex((t) => t.rec);
  return (
    <section id="compare" className="section">
      <div className="container-wide">
        <Reveal className="sec-head">
          <span className="eyebrow">Compare</span>
          <h2>All five tiers. <span className="serif-italic">One page.</span></h2>
          <p>What changes between accounts: pricing, leverage, service tier, and eligibility.</p>
        </Reveal>

        <Reveal>
          <div className="acc-tbl-wrap" style={{ overflowX: "auto" }}>
            <table className="acc-tbl">
              <thead>
                <tr>
                  <th></th>
                  {TIERS.map((t) => (
                    <th key={t.id} className={t.rec ? "is-rec" : ""} style={{ paddingTop: t.rec ? "var(--s-8)" : undefined }}>
                      <span className="name">{t.name}</span>
                      <span className="min">{t.min}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, idx) => {
                  if ("group" in r) {
                    return (
                      <tr key={`g-${idx}`} className="acc-tbl-row-group">
                        <th colSpan={TIERS.length + 1}>{r.group}</th>
                      </tr>
                    );
                  }
                  return (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {r.vals.map((v, i) => (
                        <td key={i} className={i === recIdx ? "is-rec" : ""}>
                          {typeof v === "boolean" ? (
                            v ? <span className="yes"><Check size={16} /></span> : <span className="no">—</span>
                          ) : v}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  {TIERS.map((t) => (
                    <td key={t.id} className={t.rec ? "is-rec" : ""}>
                      <Link
                        to="/accounts"
                        className={`btn btn-sm ${t.rec ? "btn-primary" : "btn-ghost"}`}
                        style={{ width: "100%" }}
                      >
                        Choose {t.name}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Timeline() {
  const steps = [
    { n: "01", h: "Apply", p: "Personal details, financial profile, trading experience." },
    { n: "02", h: "Verify", p: "Automated KYC. Most retail applications finish in under 12 minutes." },
    { n: "03", h: "Fund", p: "Wire, card, or stablecoin. Zero deposit fees on every channel." },
    { n: "04", h: "Trade", p: "Choose MT4, MT5, cTrader or WebTrader. Same wallet, same positions." },
  ];
  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="container-wide">
        <Reveal className="sec-head center">
          <span className="eyebrow">Onboarding</span>
          <h2>Live in <span className="serif-italic">an afternoon.</span></h2>
        </Reveal>
        <Reveal>
          <div className="tl">
            {steps.map((s) => (
              <div key={s.n} className="tl-step">
                <div className="tl-num">{s.n}</div>
                <h4>{s.h}</h4>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={`faq-item ${open ? "is-open" : ""}`}>
      <button type="button" className="faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <Plus size={20} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="faq-a-inner">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQ_Section() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section">
      <div className="container">
        <Reveal className="sec-head center">
          <span className="eyebrow">FAQ</span>
          <h2>The questions traders <span className="serif-italic">actually ask.</span></h2>
        </Reveal>
        <Reveal>
          <div className="faq">
            {FAQ.map((f, i) => (
              <FAQItem
                key={f.q}
                q={f.q}
                a={f.a}
                open={open === i}
                onToggle={() => setOpen(open === i ? -1 : i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Accounts() {
  return (
    <PageShell>
      <PHero />
      <Compare />
      <Timeline />
      <FAQ_Section />
    </PageShell>
  );
}
