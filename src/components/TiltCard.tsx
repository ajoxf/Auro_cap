import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, useMotionTemplate } from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  max?: number;
  glare?: boolean;
};

export function TiltCard({ children, className, style, max = 6, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const xRaw = useMotionValue(0.5);
  const yRaw = useMotionValue(0.5);
  const x = useSpring(xRaw, { stiffness: 200, damping: 18, mass: 0.4 });
  const y = useSpring(yRaw, { stiffness: 200, damping: 18, mass: 0.4 });

  const rotX = useTransform(y, [0, 1], [max, -max]);
  const rotY = useTransform(x, [0, 1], [-max, max]);
  const glareX = useTransform(x, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(y, [0, 1], ["0%", "100%"]);
  const glareBg = useMotionTemplate`radial-gradient(circle 220px at ${glareX} ${glareY}, rgba(255, 240, 200, 0.22), transparent 70%)`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    xRaw.set((e.clientX - r.left) / r.width);
    yRaw.set((e.clientY - r.top) / r.height);
  };

  const onLeave = () => {
    xRaw.set(0.5);
    yRaw.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: "preserve-3d",
        perspective: 1200,
        position: "relative",
        ...style,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            background: glareBg,
            mixBlendMode: "screen",
          }}
        />
      )}
    </motion.div>
  );
}
