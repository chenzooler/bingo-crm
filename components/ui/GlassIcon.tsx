/**
 * GlassIcon — אייקון lucide בתוך צ'יפ זכוכית פרימיום (ה-.ico מהקונספט v2):
 * ריבוע זכוכית 38px ברדיוס 13, גרדיאנט לבן שקוף 160°, גבול-שיער בהיר,
 * היילייט פנימי עליון; אייקון קו 19px ב-stroke 1.8.
 *
 * API:
 *   icon   רכיב אייקון מ-lucide-react (למשל Phone, FileText)
 *   tone   "default" (דיו) | "green" | "blue"
 *   size   גודל הצ'יפ בפיקסלים (ברירת מחדל 38; האייקון והרדיוס נגזרים ביחס)
 */

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

export interface GlassIconProps {
  icon: LucideIcon;
  tone?: "default" | "green" | "blue";
  size?: number;
  className?: string;
  /** תווית נגישות; בלעדיה הצ'יפ דקורטיבי (aria-hidden) */
  label?: string;
}

const TONE_COLOR: Record<NonNullable<GlassIconProps["tone"]>, string> = {
  default: "var(--color-bingo-black)",
  green: "var(--color-bingo-green-deep)",
  blue: "var(--color-bingo-blue)",
};

export function GlassIcon({
  icon: Icon,
  tone = "default",
  size = 38,
  className,
  label,
}: GlassIconProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: Math.round(size * (13 / 38)),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: TONE_COLOR[tone],
  };

  return (
    <span
      className={["b-glass-ico", className].filter(Boolean).join(" ")}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Icon
        size={Math.round(size * (19 / 38))}
        strokeWidth={1.8}
        absoluteStrokeWidth
      />
    </span>
  );
}

export default GlassIcon;
