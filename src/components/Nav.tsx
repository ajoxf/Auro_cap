import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Logo, Menu, Close, ArrowUpRight } from "./Icons";
import { BrandImg } from "./BrandImg";
import { Ticker } from "./Ticker";
import "./Nav.css";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/trading", label: "Trading" },
  { to: "/platforms", label: "Platforms" },
  { to: "/accounts", label: "Accounts" },
  { to: "/education", label: "Education" },
  { to: "/company", label: "Company" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Ticker />
      <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container-wide nav-inner">
          <Link to="/" className="nav-logo" aria-label="Auro Brokers — home">
            <BrandImg
              src="/brand/logo-mark.svg"
              alt=""
              fallback={<Logo size={32} />}
              style={{ height: 32, width: 32 }}
              loading="eager"
            />
            <span className="nav-logo-word">AURO</span>
          </Link>

          <nav className="nav-links" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <a href="#login" className="nav-login">Login</a>
            <Link to="/accounts" className="btn btn-gold btn-sm nav-cta">
              Open Account <ArrowUpRight size={14} />
            </Link>
            <button
              type="button"
              className="nav-burger"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <Close size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <motion.div className="nav-progress" style={{ scaleX: progress }} aria-hidden />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="nav-drawer-inner"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NavLink to={item.to} end={item.to === "/"} className="nav-drawer-link">
                    <span>{item.label}</span>
                    <ArrowUpRight size={18} />
                  </NavLink>
                </motion.div>
              ))}
              <div className="nav-drawer-actions">
                <a href="#login" className="btn btn-ghost">Login</a>
                <Link to="/accounts" className="btn btn-gold">Open Account</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
