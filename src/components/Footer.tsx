import { Link } from "react-router-dom";
import { Logo, ArrowUpRight } from "./Icons";
import "./Footer.css";

const LINKS = [
  {
    title: "Trade",
    items: [
      { label: "Forex", to: "/trading" },
      { label: "Indices", to: "/trading" },
      { label: "Commodities", to: "/trading" },
      { label: "Cryptocurrencies", to: "/trading" },
      { label: "Shares", to: "/trading" },
    ],
  },
  {
    title: "Platforms",
    items: [
      { label: "MetaTrader 4", to: "/platforms" },
      { label: "MetaTrader 5", to: "/platforms" },
      { label: "cTrader", to: "/platforms" },
      { label: "WebTrader", to: "/platforms" },
      { label: "Mobile apps", to: "/platforms" },
    ],
  },
  {
    title: "Accounts",
    items: [
      { label: "Standard", to: "/accounts" },
      { label: "Raw+", to: "/accounts" },
      { label: "Elite", to: "/accounts" },
      { label: "Pro", to: "/accounts" },
      { label: "Islamic", to: "/accounts" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", to: "/company" },
      { label: "Regulation", to: "/company" },
      { label: "Leadership", to: "/company" },
      { label: "Press", to: "/company" },
      { label: "Careers", to: "/company" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container-wide">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo" aria-label="Auro Brokers — home">
              <Logo size={36} />
              <span className="footer-logo-word">AURO</span>
            </Link>
            <p className="footer-tag serif-italic">Trade the world's markets.</p>
            <div className="footer-newsletter">
              <label className="footer-nl-label" htmlFor="footer-nl">Weekly research digest</label>
              <div className="footer-nl-row">
                <input
                  id="footer-nl"
                  type="email"
                  placeholder="your@email.com"
                  className="footer-nl-input"
                  autoComplete="email"
                />
                <button type="button" className="btn btn-primary btn-sm">
                  Subscribe <ArrowUpRight size={14} />
                </button>
              </div>
              <p className="footer-nl-note">Free. Unsubscribe anytime.</p>
            </div>
          </div>

          <div className="footer-links">
            {LINKS.map((col) => (
              <div className="footer-col" key={col.title}>
                <h4 className="footer-col-title">{col.title}</h4>
                <ul className="footer-col-list">
                  {col.items.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <hr className="gold-rule" />

        <div className="footer-regs">
          <span className="eyebrow">Regulated by</span>
          <ul className="footer-regs-list">
            <li><strong>FCA</strong> — Financial Conduct Authority · United Kingdom</li>
            <li><strong>CySEC</strong> — Cyprus Securities & Exchange Commission · European Union</li>
            <li><strong>FSCA</strong> — Financial Sector Conduct Authority · South Africa</li>
          </ul>
        </div>

        <div className="footer-risk">
          <p>
            <strong>Risk warning.</strong> CFDs are complex instruments and come with a high risk
            of losing money rapidly due to leverage. <strong>74%</strong> of retail investor
            accounts lose money when trading CFDs with this provider. You should consider whether
            you understand how CFDs work and whether you can afford to take the high risk of
            losing your money.
          </p>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy text-faint mono">© {new Date().getFullYear()} Auro Brokers Group. All rights reserved.</p>
          <ul className="footer-legal">
            <li><a href="#legal">Legal</a></li>
            <li><a href="#privacy">Privacy</a></li>
            <li><a href="#cookies">Cookies</a></li>
            <li><a href="#complaints">Complaints</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
