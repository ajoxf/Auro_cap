import { useMemo } from "react";
import { motion } from "framer-motion";

type Props = {
  points: number[];
  width?: number;
  height?: number;
  up?: boolean;
  strokeWidth?: number;
};

export function Sparkline({
  points,
  width = 120,
  height = 36,
  up,
  strokeWidth = 1.4,
}: Props) {
  const path = useMemo(() => {
    if (points.length < 2) return "";
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const step = width / (points.length - 1);
    return points
      .map((p, i) => {
        const x = i * step;
        const y = height - ((p - min) / range) * (height - 4) - 2;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [points, width, height]);

  const auto = up ?? points[points.length - 1] >= points[0];
  const color = auto ? "var(--up)" : "var(--down)";
  const fill = auto ? "var(--up-tint)" : "var(--down-tint)";

  const lastY = (() => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    return height - ((points[points.length - 1] - min) / range) * (height - 4) - 2;
  })();

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`spk-fill-${auto ? "u" : "d"}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.5" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${path} L ${width} ${height} L 0 ${height} Z`}
        fill={`url(#spk-fill-${auto ? "u" : "d"})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx={width}
        cy={lastY}
        r="2.5"
        fill={color}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

export function genSeries(n: number, trend: number = 0): number[] {
  const out: number[] = [];
  let v = 100;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.5) * 4 + trend * 0.4;
    out.push(v);
  }
  return out;
}
