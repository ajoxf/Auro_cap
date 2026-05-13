import { useState, type ReactNode, type CSSProperties } from "react";

type Props = {
  src: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
  style?: CSSProperties;
  loading?: "lazy" | "eager";
};

/**
 * Render an image from /brand/... if it loads, otherwise fall back
 * to the supplied JSX. Lets the site stay attractive while real
 * brand assets are still being added to public/brand/.
 */
export function BrandImg({ src, alt, fallback, className, style, loading = "lazy" }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
