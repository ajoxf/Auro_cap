import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  size?: number;
  color?: string;
};

export function Spotlight({
  children,
  className,
  size = 480,
  color = "rgba(255, 224, 150, 0.32)",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);

  const bg = useMotionTemplate`radial-gradient(${size}px circle at ${x}px ${y}px, ${color}, transparent 70%)`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  const onLeave = () => {
    x.set(-9999);
    y.set(-9999);
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: bg,
          zIndex: 0,
          opacity: 0.95,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}
