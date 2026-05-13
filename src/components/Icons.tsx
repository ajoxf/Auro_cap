import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

export const Logo = ({ size = 28, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden {...p}>
    <defs>
      <linearGradient id="auro-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E8D8A3" />
        <stop offset="55%" stopColor="#C9A04C" />
        <stop offset="100%" stopColor="#A07A2E" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" stroke="url(#auro-g)" strokeWidth="2" />
    <path d="M9 22L16 7L23 22" stroke="url(#auro-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M12 17H20" stroke="url(#auro-g)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ChevronDown = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M6 9l6 6 6-6" /></svg>
);
export const ChevronRight = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M9 6l6 6-6 6" /></svg>
);
export const ArrowUpRight = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M7 17L17 7" /><path d="M9 7h8v8" /></svg>
);
export const ArrowRight = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
);
export const Menu = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M4 7h16" /><path d="M4 17h16" /></svg>
);
export const Close = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M6 6l12 12" /><path d="M6 18l12-12" /></svg>
);
export const Check = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M5 12l5 5L20 6" /></svg>
);
export const Shield = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const Bolt = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" /></svg>
);
export const Globe = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 010 18" /><path d="M12 3a14 14 0 000 18" /></svg>
);
export const Headset = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M4 13a8 8 0 0116 0v4a3 3 0 01-3 3h-1v-7h4M4 13v4a3 3 0 003 3h1v-7H4" /></svg>
);
export const Lock = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
);
export const Chart = ({ size = 22, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M3 20h18" /><path d="M5 16l5-6 4 3 5-9" /></svg>
);
export const Star = ({ size = 14, filled = true, ...p }: IconProps & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M12 3l2.9 6.3 6.6.9-4.8 4.7 1.2 6.6L12 18.3 6.1 21.5l1.2-6.6L2.5 10.2l6.6-.9L12 3z" />
  </svg>
);
export const Plus = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);
export const Minus = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M5 12h14" /></svg>
);
export const Apple = ({ size = 22, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M16.6 13.1c0-2.8 2.3-4.2 2.4-4.2-1.3-1.9-3.3-2.2-4.1-2.2-1.7-.2-3.4 1-4.3 1-.9 0-2.3-1-3.7-1-1.9 0-3.7 1.1-4.7 2.8-2 3.5-.5 8.7 1.5 11.5 1 1.4 2.1 2.9 3.6 2.8 1.5-.1 2-.9 3.8-.9s2.3.9 3.8.9c1.6 0 2.6-1.4 3.5-2.8 1.1-1.6 1.6-3.2 1.6-3.3-.1 0-3.4-1.3-3.4-5.2zm-2.7-9.6c.8-1 1.3-2.3 1.2-3.5-1.1.1-2.5.8-3.3 1.7-.7.9-1.4 2.2-1.2 3.4 1.2.1 2.5-.6 3.3-1.6z" />
  </svg>
);
export const Android = ({ size = 22, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M17 7.5l1.5-2.5c.1-.2.1-.4-.1-.6-.2-.1-.4-.1-.6.1l-1.6 2.6c-1.2-.5-2.5-.8-4-.8s-2.8.3-4 .8L6.7 4.5c-.1-.2-.4-.2-.6-.1-.2.2-.2.4-.1.6L7.5 7.5C5.4 8.8 4 11 4 13.5h16C20 11 18.6 8.8 16.5 7.5M8.5 11.5c-.4 0-.8-.4-.8-.8s.4-.7.8-.7.8.3.8.7-.4.8-.8.8m7 0c-.4 0-.8-.4-.8-.8s.4-.7.8-.7.8.3.8.7-.4.8-.8.8M4 14.5v6c0 .8.7 1.5 1.5 1.5H7v3c0 .8.7 1.5 1.5 1.5S10 25.8 10 25v-3h4v3c0 .8.7 1.5 1.5 1.5S17 25.8 17 25v-3h1.5c.8 0 1.5-.7 1.5-1.5v-6H4z" transform="translate(0 -2)" />
  </svg>
);
export const Windows = ({ size = 22, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M3 5.5L10.5 4.5v7H3v-6zm0 7h7.5v7L3 18.5v-6zm8.5-8L21 3.5v8h-9.5v-7zm0 8H21v8l-9.5-1v-7z" />
  </svg>
);
export const Mac = ({ size = 22, ...p }: IconProps) => Apple({ size, ...p });
