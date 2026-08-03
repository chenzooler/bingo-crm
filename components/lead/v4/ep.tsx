"use client";
/**
 * נייר חשמלי — עזרים משותפים לכרטיס v4 (מעטפת + עמודים 2-4).
 * ספרינגים לפי שפת התנועה, כוריאוגרפיית כניסה, מונה עולה ואריח אייקון תלת-ממד.
 * transform+opacity בלבד; כיבוד prefers-reduced-motion בכל מקום.
 */
import * as React from "react";
import { animate, useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/* ---------- ספרינגים ---------- */
export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 500, damping: 32 };
export const SPRING_SMOOTH: Transition = { type: "spring", stiffness: 300, damping: 26 };
export const SPRING_ENTRANCE: Transition = { type: "spring", stiffness: 240, damping: 22 };
export const SPRING_CELEBRATE: Transition = { type: "spring", stiffness: 400, damping: 14 };
export const TWEEN_REDUCED: Transition = { duration: 0.15 };

/* ---------- כוריאוגרפיית כניסה: הורה מדרג, ילדים עולים ---------- */
export function useEpEntrance(): { reduced: boolean; parent: Variants; child: Variants } {
  const reduced = !!useReducedMotion();
  return React.useMemo(() => ({
    reduced,
    parent: {
      hidden: {},
      show: { transition: reduced ? {} : { staggerChildren: 0.06 } },
    },
    child: {
      hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 },
      show: {
        opacity: 1, y: 0, scale: 1,
        transition: reduced ? TWEEN_REDUCED : SPRING_ENTRANCE,
      },
    },
  }), [reduced]);
}

/* ---------- מונה עולה — כתיבת טקסט בלבד, בלי אנימציית layout ---------- */
export function CountUp({ value, format, className }: {
  value: number;
  /** ברירת מחדל: המספר עם מפרידי אלפים */
  format?: (n: number) => string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  /* נזרע בערך ההתחלתי — פתיחת כרטיס מציגה את הערך הסופי מיד, בלי גלגול מ-0 */
  const prev = React.useRef(value);
  /* חותמת השינוי האחרון — רצף הקשות (פחות מ-600ms בין שינויים) מרונדר מיד, בלי אנימציה */
  const lastChangeAt = React.useRef(0);
  const fmtRef = React.useRef(format);
  fmtRef.current = format;

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = fmtRef.current ?? ((n: number) => n.toLocaleString("he-IL"));
    if (reduced || value === prev.current) {
      prev.current = value;
      el.textContent = fmt(value);
      return;
    }
    const now = performance.now();
    const burst = now - lastChangeAt.current < 600;
    lastChangeAt.current = now;
    if (burst) {
      prev.current = value;
      el.textContent = fmt(value);
      return;
    }
    const controls = animate(prev.current, value, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { el.textContent = fmt(Math.round(v)); },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduced]);

  const fmt = format ?? ((n: number) => n.toLocaleString("he-IL"));
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {fmt(value)}
    </span>
  );
}

/* ---------- אריח אייקון תלת-ממד ---------- */
export function Icon3D({ name, size = 44, radius, className }: {
  name: string;
  size?: number;
  radius?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("ep-icon3d shrink-0", className)}
      style={{ width: size, height: size, ...(radius != null ? { borderRadius: radius } : null) }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/icons3d/${name}.webp`} alt="" />
    </span>
  );
}

/* ---------- כותרת סקשן: אריח 3D + כותרת ---------- */
export function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <Icon3D name={icon} size={44} />
      <div className="min-w-0">
        <h2 className="text-[17px] font-bold text-bingo-black leading-tight">{title}</h2>
        {sub && <p className="text-[12.5px] text-bingo-gray-500 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}
