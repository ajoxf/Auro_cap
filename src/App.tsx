import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Trading } from "./pages/Trading";
import { Platforms } from "./pages/Platforms";
import { Accounts } from "./pages/Accounts";
import { Education } from "./pages/Education";
import { Company } from "./pages/Company";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <>
      <Nav />
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/platforms" element={<Platforms />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/education" element={<Education />} />
          <Route path="/company" element={<Company />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}
