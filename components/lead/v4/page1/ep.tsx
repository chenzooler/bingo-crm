"use client";
/**
 * נייר חשמלי — פרימיטיבים משותפים לעמוד 1:
 * קפיצי תנועה, אייקון תלת-ממד, וי מצויר, פרץ חלקיקים, זרקור עכבר,
 * וכותרת תת-סקשן. הכל transform+opacity בלבד; reduced-motion מכובד.
 */
import * as React from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

/* ---------- קפיצים ---------- */

export const SPRING = {
  snappy: { type: "spring", stiffness: 500, damping: 32 } as Transition,
  smooth: { type: "spring", stiffness: 300, damping: 26 } as Transition,
  entrance: { type: "spring", stiffness: 240, damping: 22 } as Transition,
  celebrate: { type: "spring", stiffness: 400, damping: 14 } as Transition,
};

/** reduced-motion → tween קצר במקום קפיץ */
export function useEpSpring() {
  const rm = useReducedMotion();
  return React.useCallback(
    (t: Transition): Transition => (rm ? { duration: 0.15 } : t),
    [rm],
  );
}

/* ---------- אייקון תלת-ממד באריח כהה ---------- */

export function Icon3D({ name, size = 48, radius }: {
  name: string;
  size?: number;
  radius?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className="ep-icon3d shrink-0"
      style={{ width: size, height: size, borderRadius: radius ?? Math.round(size * 0.29) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/icons3d/${name}.webp`} alt="" width={size} height={size} />
    </span>
  );
}

/* ---------- וי שמצייר את עצמו (pathLength 0→1) ---------- */

export function DrawnCheck({ size = 14, delay = 0, strokeWidth = 3 }: {
  size?: number;
  delay?: number;
  strokeWidth?: number;
}) {
  const rm = useReducedMotion();
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className="shrink-0">
      <motion.path
        d="M4 12.5 L9.5 18 L20 6.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={rm ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, delay, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ---------- פרץ חלקיקים רדיאלי (רגעי השלמה) ---------- */

export function ParticleBurst({ count = 7, radius = 26, size = 5, colors, duration = 0.5 }: {
  count?: number;
  radius?: number;
  size?: number;
  colors?: string[];
  duration?: number;
}) {
  const rm = useReducedMotion();
  const palette = colors ?? ["#50ff0a", "#daffcb", "#b7f7a1"];
  const parts = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + 0.4;
        const r = radius * (0.75 + ((i * 37) % 45) / 100);
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      }),
    [count, radius],
  );
  if (rm) return null;
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ width: size, height: size, background: palette[i % palette.length] }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
          transition={{ duration, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

/* ---------- זרקור עכבר — JS כותב רק ‎--mx/--my ---------- */

export function useSpotlight() {
  return React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);
}

/* ---------- כותרת תת-סקשן עם אייקון תלת-ממד קטן ---------- */

export function SubSection({ icon, title, children }: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="flex items-center gap-2.5">
        <Icon3D name={icon} size={28} radius={9} />
        <h4 className="text-[14px] font-bold text-bingo-black">{title}</h4>
      </header>
      {children}
    </section>
  );
}
