import { motion } from "motion/react";
import { useId, type ReactElement } from "react";
import type { Stamp } from "../data/types";

/**
 * Generated artwork. Stamps and hero visuals are drawn as SVG so they stay
 * crisp on every Android density, adapt to dark mode and weigh almost nothing.
 * Real illustration/photography can replace any of them without touching layout.
 */

const MOTIFS: Record<Stamp["motif"], (fg: string) => ReactElement> = {
  river: (fg) => (
    <g fill="none" stroke={fg} strokeWidth="3" strokeLinecap="round">
      <path d="M8 62c10-6 20-6 30 0s20 6 30 0" />
      <path d="M8 74c10-6 20-6 30 0s20 6 30 0" opacity=".6" />
      <circle cx="56" cy="30" r="10" fill={fg} stroke="none" />
    </g>
  ),
  sun: (fg) => (
    <g>
      <circle cx="38" cy="58" r="20" fill={fg} />
      {Array.from({ length: 7 }).map((_, i) => {
        const a = Math.PI + (i * Math.PI) / 6;
        return <line key={i} x1={38 + Math.cos(a) * 26} y1={58 + Math.sin(a) * 26} x2={38 + Math.cos(a) * 34} y2={58 + Math.sin(a) * 34} stroke={fg} strokeWidth="3" strokeLinecap="round" />;
      })}
    </g>
  ),
  leaf: (fg) => (
    <g fill={fg}>
      <path d="M38 80C14 66 14 34 38 18c24 16 24 48 0 62z" />
      <path d="M38 80V24" stroke="currentColor" strokeWidth="2" opacity=".25" />
    </g>
  ),
  boat: (fg) => (
    <g fill={fg}>
      <path d="M36 16v42l-20-2z" />
      <path d="M40 22v36l18-2z" opacity=".75" />
      <path d="M12 62h52l-8 10H20z" />
      <path d="M6 80c8-4 16-4 24 0s16 4 24 0 12-3 16-2" fill="none" stroke={fg} strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
    </g>
  ),
  tiger: (fg) => (
    <g fill={fg}>
      <circle cx="38" cy="48" r="24" />
      <circle cx="20" cy="28" r="7" />
      <circle cx="56" cy="28" r="7" />
      <g fill="currentColor" opacity=".9">
        <path d="M30 30l4 10-6-2zM46 30l-4 10 6-2zM18 48l10 2-10 4zM58 48l-10 2 10 4z" />
        <circle cx="30" cy="48" r="2.5" />
        <circle cx="46" cy="48" r="2.5" />
        <path d="M34 58h8l-4 4z" />
      </g>
    </g>
  ),
  mosque: (fg) => (
    <g fill={fg}>
      <rect x="12" y="50" width="52" height="28" rx="2" />
      <path d="M22 50a8 8 0 0116 0zM38 50a8 8 0 0116 0z" />
      <path d="M26 44a12 12 0 0124 0z" />
      <rect x="10" y="30" width="5" height="48" />
      <rect x="61" y="30" width="5" height="48" />
      <g fill="currentColor" opacity=".35">
        <rect x="22" y="60" width="6" height="18" rx="3" />
        <rect x="35" y="60" width="6" height="18" rx="3" />
        <rect x="48" y="60" width="6" height="18" rx="3" />
      </g>
    </g>
  ),
  flower: (fg) => (
    <g fill={fg}>
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse key={i} cx="38" cy="32" rx="6" ry="16" transform={`rotate(${i * 22.5 - 78} 38 48)`} opacity={0.6 + (i % 2) * 0.4} />
      ))}
      <circle cx="38" cy="48" r="6" fill="currentColor" opacity=".3" />
      <path d="M8 74c10-4 20-4 30 0s20 4 30 0" fill="none" stroke={fg} strokeWidth="2.5" opacity=".5" />
    </g>
  ),
  moon: (fg) => (
    <g fill={fg}>
      <path d="M48 20a26 26 0 100 52 22 22 0 010-52z" />
      <circle cx="58" cy="30" r="2" />
      <circle cx="62" cy="46" r="1.5" />
      <circle cx="18" cy="22" r="1.5" />
    </g>
  ),
  rain: (fg) => (
    <g fill="none" stroke={fg} strokeWidth="3" strokeLinecap="round">
      <path d="M20 40a14 14 0 0128-6 11 11 0 018 21H24a10 10 0 01-4-15z" fill={fg} stroke="none" />
      <path d="M26 64l-3 8M38 64l-3 8M50 64l-3 8" />
    </g>
  ),
  kite: (fg) => (
    <g>
      <path d="M38 14l20 24-20 30-20-30z" fill={fg} />
      <path d="M38 14v54M18 38h40" stroke="currentColor" strokeWidth="1.5" opacity=".3" />
      <path d="M38 68c-4 6 4 8 0 14" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
};

/** Perforated stamp. `locked` renders a quiet, desaturated silhouette. */
export function StampArt({ stamp, locked, className }: { stamp: Stamp; locked?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  const [bg, fg] = stamp.palette;
  const holes = [];
  for (let x = 6; x <= 94; x += 8) holes.push(<circle key={`t${x}`} cx={x} cy="0" r="3" />, <circle key={`b${x}`} cx={x} cy="120" r="3" />);
  for (let y = 6; y <= 116; y += 8) holes.push(<circle key={`l${y}`} cx="0" cy={y} r="3" />, <circle key={`r${y}`} cx="100" cy={y} r="3" />);
  return (
    <svg viewBox="0 0 100 120" className={className} role="img" aria-label={stamp.name} style={{ filter: locked ? "grayscale(1)" : "var(--dk-img-filter)", opacity: locked ? 0.45 : 1 }}>
      <defs>
        <mask id={`m${id}`}>
          <rect width="100" height="120" fill="white" />
          <g fill="black">{holes}</g>
        </mask>
      </defs>
      <g mask={`url(#m${id})`}>
        <rect width="100" height="120" fill="#fbfaf6" />
        {stamp.image ? (
          <image href={stamp.image} x="8" y="8" width="84" height="104" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <>
            <rect x="8" y="8" width="84" height="104" rx="2" fill={bg} />
            <g transform="translate(12 10)" color={bg}>
              {MOTIFS[stamp.motif](fg)}
            </g>
            <text x="16" y="104" fill={fg} fontFamily="Inter, sans-serif" fontSize="8" fontWeight="600" letterSpacing="1">
              DAKTIK
            </text>
            <text x="84" y="104" fill={fg} fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700" textAnchor="end">
              {stamp.coins}
            </text>
          </>
        )}
      </g>
    </svg>
  );
}

/** Home hero: an abstract, softly moving envelope in the Daktik palette. */
export function HeroArt({ count }: { count: number }) {
  return (
    <svg viewBox="0 0 360 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="dk-hero-glow" cx="78%" cy="18%" r="70%">
          <stop offset="0" stopColor="#c8a24a" stopOpacity=".55" />
          <stop offset=".5" stopColor="#c8a24a" stopOpacity=".08" />
          <stop offset="1" stopColor="#c8a24a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dk-env" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f5ef" />
          <stop offset="1" stopColor="#e9e4d6" />
        </linearGradient>
      </defs>
      <rect width="360" height="240" fill="#173f35" />
      <rect width="360" height="240" fill="url(#dk-hero-glow)" />
      <g stroke="#f7f5ef" strokeOpacity=".07" fill="none">
        {Array.from({ length: 7 }).map((_, i) => (
          <circle key={i} cx="290" cy="40" r={40 + i * 34} />
        ))}
      </g>
      <motion.g initial={{ y: 8, rotate: -8 }} animate={{ y: [8, 0, 8] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "260px 150px" }}>
        {count > 1 && <rect x="196" y="106" width="132" height="86" rx="10" fill="#aab9a9" opacity=".55" transform="rotate(10 262 149)" />}
        <rect x="186" y="104" width="140" height="92" rx="10" fill="url(#dk-env)" />
        <path d="M188 110l68 46 68-46" fill="none" stroke="#173f35" strokeOpacity=".22" strokeWidth="2" />
        <rect x="290" y="114" width="22" height="26" rx="2" fill="#c8a24a" />
      </motion.g>
    </svg>
  );
}

/** Small envelope glyph for empty states and onboarding. */
export function EnvelopeGlyph({ size = 96, open }: { size?: number; open?: boolean }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 120 86" aria-hidden>
      <rect x="2" y="12" width="116" height="72" rx="10" fill="var(--dk-surface)" stroke="currentColor" strokeWidth="2" />
      {open ? (
        <path d="M4 16l56-14 56 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <path d="M6 18l54 36 54-36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      )}
      <rect x="92" y="22" width="16" height="20" rx="2" fill="var(--dk-gold)" opacity=".8" />
    </svg>
  );
}

/** Stand-in for photography: a soft two-hue gradient with grain. Accepts a real `src`. */
export function ImageCard({ hueA, hueB, src, caption, ratio = "4 / 3" }: { hueA: number; hueB: number; src?: string; caption?: string; ratio?: string }) {
  return (
    <figure className="overflow-hidden rounded-dk-md bg-dk-sunken" style={{ aspectRatio: ratio }}>
      {src ? (
        <img src={src} alt={caption ?? ""} className="dk-img h-full w-full object-cover" loading="lazy" />
      ) : (
        <div
          className="dk-img relative h-full w-full"
          style={{ background: `radial-gradient(120% 90% at 20% 10%, hsl(${hueA} 70% 78%), transparent 60%), linear-gradient(160deg, hsl(${hueA} 45% 62%), hsl(${hueB} 35% 34%))` }}
          role="img"
          aria-label={caption}
        >
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
          <div className="absolute bottom-[22%] left-0 right-0 h-px bg-white/30" />
        </div>
      )}
    </figure>
  );
}
