import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <motion.main
      id="main"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.main>
  );
}
