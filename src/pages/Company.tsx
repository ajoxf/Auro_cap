import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageShell } from "../components/PageShell";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { ArrowUpRight, ArrowRight, Shield } from "../components/Icons";
import { easeOutExpo } from "../styles/motion";
import "./Home.css";
import "./Trading.css";
import "./Company.css";

const HISTORY = [
  { year: "2002", title: "Founded in London", body: "Auro begins as a four-person desk at a Mayfair address with a single MT4 server." },
  { year: "2008", title: "FCA authorised", body: "Direct authorisation from the UK Financial Conduct Authority — FRN 532234." },
  { year: "2014", title: "Multi-asset launch", body: "Indices, commodities, and shares added alongside FX. Liquidity pool expanded to 16 LPs." },
  { year: "2019", title: "Mobile-first rebuild", body: "Native iOS / Android apps. 1M+ active clients across 130 countries." },
  { year: "2024", title: "Tier-1 partnerships", body: "Co-location in TY3. 2.1M clients in 170 jurisdictions. Crypto and tokenised-equity desks." },
];

const LEADERS = [
  {
    name: "Helena Cárdenas",
    role: "Chief Executive Officer",
    bio: "Former MD at a tier-1 European prime broker. 22 years building execution platforms.",
    grad: ["#F7E5B7", "#A57424"],
  },
  {
    name: "Niels Hvidberg",
    role: "Chief Operating Officer",
    bio: "Built the execution stack at Auro since 2009. Stanford EE, ex-LCH.",
    grad: ["#EBD49B", "#7A5520"],
  },
  {
    name: "Maria Bertolini",
    role: "Chief Macro Strategist",
    bio: "Ten years on the BIS Markets Committee. Bocconi PhD in monetary economics.",
    grad: ["#FFDFA3", "#C0822E"],
  },
  {
    name: "Tunde Akande",
    role: "Chief Compliance Officer",
    bio: "FCA-supervised CF11. Previously Head of Compliance at a Swiss neo-bank.",
    grad: ["#F4D58B", "#8E6526"],
  },
];

const OFFICES = [
  { city: "London", addr: "1 King William Street, EC4N 7AF", tag: "HQ · FCA-authorised entity", x: 47, y: 30 },
  { city: "Nicosia", addr: "Office 401, 12 Themistokli Dervi Avenue, 1066", tag: "CySEC entity · EU passporting", x: 56, y: 39 },
  { city: "Cape Town", addr: "The Atrium, 5 Silo Square, V&A Waterfront, 8001", tag: "FSCA entity", x: 53, y: 76 },
  { city: "Singapore", addr: "8 Marina View, Asia Square Tower 1, 018960", tag: "Asia operations · Compliance", x: 78, y: 56 },
  { city: "Tokyo", addr: "1-9-2 Marunouchi, Chiyoda-ku, 100-6390", tag: "TY3 co-location · Execution", x: 85, y: 38 },
  { city: "New York", addr: "200 West Street, 10282", tag: "NY4 co-location · Liquidity", x: 24, y: 33 },
];

function PortraitSilhouette({ grad }: { grad: [string, string] }) {
  const id = `lead-${grad[0].slice(1)}`;
  return (
    <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={grad[0]} />
          <stop offset="100%" stopColor={grad[1]} />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="0.3" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="250" fill={`url(#${id})`} />
      <rect width="200" height="250" fill={`url(#${id}-light)`} />
      <ellipse cx="100" cy="95" rx="38" ry="42" fill="rgba(26,22,16,0.18)" />
      <path
        d="M30 250 L30 215 Q30 175 100 165 Q170 175 170 215 L170 250 Z"
        fill="rgba(26,22,16,0.18)"
      />
      <ellipse cx="100" cy="95" rx="38" ry="42" fill="rgba(255,255,255,0.05)" />
    </svg>
  );
}

function PHero() {
  return (
    <section className="phero">
      <div className="phero-bg" aria-hidden />
      <div className="container">
        <div className="phero-inner">
          <Reveal><span className="phero-eyebrow">Company</span></Reveal>
          <Reveal delay={0.08}>
            <h1 className="phero-h1">
              Built over <span className="serif-italic text-gold">23 years</span>, not 23 months.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="phero-sub">
              Auro is the brokerage we wanted when we sat on the buy-side: tier-1 pricing, real
              regulators, real humans on the phone, and a stack we could actually audit.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="hero-cta-row" style={{ justifyContent: "center" }}>
              <Link to="/accounts" className="btn btn-gold">
                Open account <ArrowUpRight size={16} />
              </Link>
              <a href="#leadership" className="btn btn-ghost">
                Meet the team <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function History() {
  return (
    <section className="section">
      <div className="container-wide">
        <Reveal className="sec-head center">
          <span className="eyebrow">Milestones</span>
          <h2>Two decades. <span className="serif-italic">Five turning points.</span></h2>
        </Reveal>

        <Reveal>
          <div className="hist">
            <div className="hist-track">
              {HISTORY.map((h, i) => (
                <motion.div
                  key={h.year}
                  className="hist-step"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.1 * i, ease: easeOutExpo }}
                >
                  <div className="hist-body">
                    <div className="hist-year">{h.year}</div>
                  </div>
                  <span className="dot" />
                  <div className="hist-body">
                    <h4>{h.title}</h4>
                    <p>{h.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Regulation() {
  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="container-wide">
        <Reveal className="sec-head">
          <span className="eyebrow">Regulation</span>
          <h2>Authorised by <span className="serif-italic">three regulators.</span></h2>
          <p>One legal entity per jurisdiction, segregated client funds at tier-1 custodians, separate boards and compliance officers.</p>
        </Reveal>
        <Stagger className="narr-grid" delay={0.1}>
          {[
            { name: "Auro UK Ltd", body: "Authorised and regulated by the Financial Conduct Authority. Investor compensation up to £85,000 via the Financial Services Compensation Scheme.", lic: "FCA · FRN 532234", country: "United Kingdom" },
            { name: "Auro Europe Ltd", body: "Authorised by CySEC and passported into the EEA. Investor compensation up to €20,000 via the Investor Compensation Fund.", lic: "CySEC · 233/14", country: "Republic of Cyprus" },
            { name: "Auro Africa (Pty) Ltd", body: "Licensed by the Financial Sector Conduct Authority. Client funds held at Standard Bank in segregated trust accounts.", lic: "FSCA · FSP 47428", country: "South Africa" },
          ].map((r) => (
            <StaggerItem className="narr-card" key={r.name}>
              <span className="bento-icon"><Shield size={20} /></span>
              <span className="narr-eyebrow">{r.country}</span>
              <h3 className="narr-title">{r.name}</h3>
              <p className="narr-text">{r.body}</p>
              <div className="narr-pills"><span className="narr-pill mono">{r.lic}</span></div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Leadership() {
  return (
    <section id="leadership" className="section">
      <div className="container-wide">
        <Reveal className="sec-head">
          <span className="eyebrow">Leadership</span>
          <h2>The people whose <span className="serif-italic">names go on the door.</span></h2>
          <p>Each Auro entity is run by an executive team accountable to the regulator that licenses it.</p>
        </Reveal>

        <Stagger className="lead-grid" delay={0.08}>
          {LEADERS.map((l) => (
            <StaggerItem className="lead-card" key={l.name}>
              <div className="lead-portrait" aria-hidden>
                <PortraitSilhouette grad={l.grad as [string, string]} />
              </div>
              <div className="lead-body">
                <h3 className="lead-name">{l.name}</h3>
                <p className="lead-role">{l.role}</p>
                <p className="lead-bio">{l.bio}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Offices() {
  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="container-wide">
        <Reveal className="sec-head">
          <span className="eyebrow">Offices</span>
          <h2>Six addresses. <span className="serif-italic">One ledger.</span></h2>
        </Reveal>

        <Reveal>
          <div className="offices-grid">
            <div className="map-wrap" aria-hidden>
              <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
                <rect width="100" height="60" fill="var(--paper)" />
                <g stroke="var(--hairline-2)" strokeWidth="0.15" fill="var(--paper-2)">
                  <path d="M14 18 Q22 14 28 18 L34 22 L40 20 L42 30 L36 36 L30 34 L24 30 L20 26 Z" />
                  <path d="M44 16 L52 14 L60 18 L66 20 L70 24 L74 22 L82 26 L84 30 L78 32 L72 30 L66 32 L60 28 L54 30 L48 26 Z" />
                  <path d="M48 38 L54 40 L58 50 L56 56 L50 54 L46 46 Z" />
                  <path d="M76 32 L86 34 L90 38 L88 44 L80 42 Z" />
                  <path d="M16 36 L20 40 L22 46 L18 48 Z" />
                </g>
                {OFFICES.map((o, i) => (
                  <g key={o.city} transform={`translate(${o.x} ${o.y})`}>
                    <motion.circle
                      r="2.4"
                      className="map-pin-pulse"
                      animate={{ scale: [1, 2.4, 1], opacity: [0.45, 0, 0.45] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
                    />
                    <circle r="0.8" className="map-pin" />
                  </g>
                ))}
              </svg>
            </div>

            <ul className="offices-list">
              {OFFICES.map((o) => (
                <li className="office" key={o.city}>
                  <h4 className="office-city">{o.city}</h4>
                  <div className="office-addr">{o.addr}</div>
                  <span className="office-tag">{o.tag}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Company() {
  return (
    <PageShell>
      <PHero />
      <History />
      <Regulation />
      <Leadership />
      <Offices />
    </PageShell>
  );
}
