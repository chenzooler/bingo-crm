"use client";

/**
 * Ramzor — רכיב הרמזור הרשמי של בינגו (Premium v2).
 * מחליף בהדרגה כל חיווי "סמיילי" במערכת.
 *
 * חומרים לפי card-concept v2: בית אבסידיאן (גרדיאנט 165°, היילייט פנימי,
 * צל עמוק) + שלוש עדשות זכוכית עם גרדיאנט רדיאלי. עדשה כבויה = זכוכית כהה
 * עם נצנוץ ספקולרי; עדשה דלוקה = הגרדיאנט המדויק מהקונספט + הילה חיצונית.
 * מצב scanning = כל העדשות ב-b-scan; תוצאה נדלקת עם b-pop (globals.css).
 *
 * API:
 *   value        "green" | "orange" | "red" | null   — העדשה הדלוקה
 *   state        "idle" | "scanning"                 — סריקה חיה
 *   size         "sm" (צ'יפ כותרת ~28px) | "md" | "lg" (מודאל, 118px)
 *   orientation  "vertical" | "horizontal"
 *   onSelect     כשמסופק — העדשות הופכות לכפתורים (קביעה ידנית),
 *                נגיש מקלדת, aria-labels בעברית (ירוק/כתום/אדום)
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type RamzorValue = "green" | "orange" | "red";

export interface RamzorProps {
  value: RamzorValue | null;
  state?: "idle" | "scanning";
  size?: "sm" | "md" | "lg";
  orientation?: "vertical" | "horizontal";
  onSelect?: (v: RamzorValue) => void;
  className?: string;
}

/* סדר קבוע של רמזור אמיתי: אדום למעלה/בהתחלה, ירוק למטה/בסוף */
const ORDER: RamzorValue[] = ["red", "orange", "green"];

const HEBREW_LABEL: Record<RamzorValue, string> = {
  green: "ירוק",
  orange: "כתום",
  red: "אדום",
};

/* גרדיאנטים מדויקים מהקונספט (card-concept v2) */
const LIT: Record<RamzorValue, { bg: string; glow: string; innerShadow: string }> = {
  red: {
    bg: "radial-gradient(circle at 34% 30%, #FFB4AC, #F0655A 45%, #C4362C 85%)",
    glow: "rgba(226,82,72,.55)",
    innerShadow: "rgba(120,15,8,.5)",
  },
  orange: {
    bg: "radial-gradient(circle at 34% 30%, #FFE0B0, #F5A94E 45%, #C87413 85%)",
    glow: "rgba(240,154,62,.55)",
    innerShadow: "rgba(140,74,5,.5)",
  },
  green: {
    bg: "radial-gradient(circle at 34% 30%, #D8FFBB, #6FFF2E 45%, #2B9410 88%)",
    glow: "var(--b-glow-green)",
    innerShadow: "rgba(20,84,4,.5)",
  },
};

const OFF_BG = "radial-gradient(circle at 34% 30%, #4A4840, #2B2A24 58%, #1C1B16)";

/* קונפיגורציית מידות — m = מכפיל ההילה/צללים ביחס ל-lg */
const SIZES = {
  sm: { lens: 14, gap: 5, padMain: 7, padCross: 7, radius: 999, m: 0.3 },
  md: { lens: 40, gap: 10, padMain: 12, padCross: 13, radius: 22, m: 0.6 },
  lg: { lens: 72, gap: 16, padMain: 18, padCross: 23, radius: 34, m: 1 },
} as const;

export function Ramzor({
  value,
  state = "idle",
  size = "md",
  orientation = "vertical",
  onSelect,
  className,
}: RamzorProps) {
  const s = SIZES[size];
  const vertical = orientation === "vertical";
  const scanning = state === "scanning";

  /* b-pop רק ברגע שהתוצאה נדלקת (לא ברינדור ראשון של ערך קיים) */
  const prevValue = useRef<RamzorValue | null>(value);
  const [popping, setPopping] = useState(false);
  useEffect(() => {
    if (value && value !== prevValue.current && !scanning) {
      setPopping(true);
      const t = setTimeout(() => setPopping(false), 550);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
    prevValue.current = value;
  }, [value, scanning]);

  const housing: CSSProperties = {
    display: "inline-flex",
    flexDirection: vertical ? "column" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s.gap,
    padding: vertical ? `${s.padMain}px ${s.padCross}px` : `${s.padCross}px ${s.padMain}px`,
    borderRadius: s.radius,
    background: "linear-gradient(165deg, var(--b-obsidian-1, #3B3A34), var(--b-obsidian-2, #211F1B) 55%, var(--b-obsidian-3, #191813))",
    border: "1px solid rgba(255,255,255,.09)",
    boxShadow: [
      `0 ${34 * s.m}px ${70 * s.m}px ${-22 * s.m}px rgba(25,24,19,.65)`,
      "inset 0 1.5px 0 rgba(255,255,255,.14)",
      `inset 0 ${-10 * s.m}px ${24 * s.m}px rgba(0,0,0,.45)`,
    ].join(", "),
    flexShrink: 0,
  };

  const lensBase: CSSProperties = {
    position: "relative",
    width: s.lens,
    height: s.lens,
    borderRadius: "50%",
    padding: 0,
    border: "none",
    flexShrink: 0,
    transition: "all .45s var(--b-spring)",
  };

  const groupLabel = value
    ? `רמזור: ${HEBREW_LABEL[value]}`
    : scanning
      ? "רמזור: בבדיקה"
      : "רמזור: ללא תוצאה";

  return (
    <div
      className={className}
      style={housing}
      role={onSelect ? "group" : "img"}
      aria-label={onSelect ? "בחירת רמזור ידנית" : groupLabel}
    >
      {ORDER.map((color) => {
        const lit = !scanning && value === color;
        const spec = LIT[color];
        const style: CSSProperties = {
          ...lensBase,
          background: lit ? spec.bg : OFF_BG,
          boxShadow: lit
            ? [
                `0 0 ${(color === "green" ? 40 : 34) * s.m}px ${(color === "green" ? 10 : 8) * s.m}px ${spec.glow}`,
                `inset 0 ${-4 * s.m}px ${10 * s.m}px ${spec.innerShadow}`,
              ].join(", ")
            : [
                `inset 0 ${Math.max(1.5, 5 * s.m)}px ${12 * s.m}px rgba(0,0,0,.65)`,
                `inset 0 ${-3 * s.m}px ${8 * s.m}px rgba(255,255,255,.05)`,
              ].join(", "),
          cursor: onSelect ? "pointer" : undefined,
        };

        /* נצנוץ ספקולרי — "זכוכית" גם כשהעדשה כבויה */
        const specular = (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "12%",
              insetInlineStart: "16%",
              width: "34%",
              height: "22%",
              borderRadius: "50%",
              pointerEvents: "none",
              background: `radial-gradient(ellipse, rgba(255,255,255,${lit ? ".85" : ".35"}), transparent ${lit ? "70%" : "72%"})`,
              transition: "background .45s var(--b-spring)",
            }}
          />
        );

        const lensClass = scanning ? "b-scan" : lit && popping ? "b-pop" : undefined;

        if (onSelect) {
          return (
            <button
              key={color}
              type="button"
              className={lensClass}
              style={style}
              aria-label={HEBREW_LABEL[color]}
              aria-pressed={value === color}
              onClick={() => onSelect(color)}
            >
              {specular}
            </button>
          );
        }
        return (
          <span key={color} className={lensClass} style={style}>
            {specular}
          </span>
        );
      })}
    </div>
  );
}

export default Ramzor;
