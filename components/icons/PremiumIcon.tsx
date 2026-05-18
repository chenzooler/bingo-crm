"use client";
import * as React from "react";

/**
 * אייקונים יוקרתיים מותאמים לבינגו — SVG עדינים עם הירוק של המותג.
 * סגנון: line-icon מודרני, stroke ירוק, רקע gradient עדין.
 */

interface IconProps {
  size?: number;
  className?: string;
}

const wrap = (children: React.ReactNode, size: number, className?: string) => (
  <span
    className={`inline-flex items-center justify-center rounded-2xl ${className ?? ""}`}
    style={{
      width: size,
      height: size,
      background:
        "linear-gradient(135deg, rgba(80,255,10,0.18) 0%, rgba(80,255,10,0.04) 100%)",
      border: "1px solid rgba(80,255,10,0.35)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px -6px rgba(80,255,10,0.35)",
    }}
  >
    {children}
  </span>
);

export const IconShieldCheck = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L4 5v6c0 5 3.5 9.3 8 11 4.5-1.7 8-6 8-11V5l-8-3z"
        stroke="#0E0E10"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12l2.5 2.5L16 9.5"
        stroke="#3DCC08"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>,
    size,
    className
  );

export const IconBolt = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        stroke="#0E0E10"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="rgba(80,255,10,0.25)"
      />
    </svg>,
    size,
    className
  );

export const IconWallet = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M3 9h18" stroke="#0E0E10" strokeWidth="1.6" />
      <circle cx="17" cy="13" r="1.5" fill="#3DCC08" />
    </svg>,
    size,
    className
  );

export const IconDigital = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="14" rx="2" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M8 21h8M12 18v3" stroke="#0E0E10" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 9l3 3-3 3M13 14h4" stroke="#3DCC08" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    size,
    className
  );

export const IconClock = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M12 7v5l3.5 2" stroke="#3DCC08" strokeWidth="2" strokeLinecap="round" />
    </svg>,
    size,
    className
  );

export const IconCompare = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M3 12h18" stroke="#0E0E10" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 6l-4 6 4 6M17 6l4 6-4 6" stroke="#3DCC08" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    size,
    className
  );

export const IconCash = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="13" rx="2" stroke="#0E0E10" strokeWidth="1.6" />
      <circle cx="12" cy="12.5" r="3" stroke="#3DCC08" strokeWidth="1.8" />
      <circle cx="6" cy="12.5" r="0.8" fill="#0E0E10" />
      <circle cx="18" cy="12.5" r="0.8" fill="#0E0E10" />
    </svg>,
    size,
    className
  );

// מטרות הלוואה
export const IconDebt = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M7 14h4" stroke="#3DCC08" strokeWidth="2" strokeLinecap="round" />
    </svg>,
    size,
    className
  );

export const IconStudy = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M2 9l10-5 10 5-10 5L2 9z" stroke="#0E0E10" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 11v5c0 1 2.5 3 6 3s6-2 6-3v-5" stroke="#3DCC08" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>,
    size,
    className
  );

export const IconPlane = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12l3 1 3-3 8 8 2-1-3-9 4-4c1-1 1-2 0-3s-2-1-3 0l-4 4-9-3-1 2 8 8-3 3z"
        stroke="#0E0E10"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="rgba(80,255,10,0.15)"
      />
    </svg>,
    size,
    className
  );

export const IconEvent = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M12 2v4M5 7l3 3M19 7l-3 3" stroke="#3DCC08" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 12l4 9 6-13 4 9" stroke="#0E0E10" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>,
    size,
    className
  );

export const IconHeart = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20s-7-4.5-7-10c0-3 2-5 5-5 1.5 0 2.5.5 3 2 0.5-1.5 1.5-2 3-2 3 0 5 2 5 5 0 5.5-7 10-7 10z"
        stroke="#0E0E10"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="rgba(80,255,10,0.18)"
      />
      <path d="M9 12l1.5 1.5L13 11" stroke="#3DCC08" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    size,
    className
  );

export const IconMore = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="12" r="1.6" fill="#0E0E10" />
      <circle cx="12" cy="12" r="1.6" fill="#3DCC08" />
      <circle cx="18" cy="12" r="1.6" fill="#0E0E10" />
    </svg>,
    size,
    className
  );

// אישי
export const IconUser = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="#3DCC08" strokeWidth="1.8" />
    </svg>,
    size,
    className
  );

export const IconPhone = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <rect x="7" y="2" width="10" height="20" rx="2.5" stroke="#0E0E10" strokeWidth="1.6" />
      <circle cx="12" cy="18" r="1" fill="#3DCC08" />
    </svg>,
    size,
    className
  );

export const IconID = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#0E0E10" strokeWidth="1.6" />
      <circle cx="9" cy="11" r="2" stroke="#3DCC08" strokeWidth="1.6" />
      <path d="M14 10h5M14 13h3M6 16h12" stroke="#0E0E10" strokeWidth="1.4" strokeLinecap="round" />
    </svg>,
    size,
    className
  );

// אשראי / BDI
export const IconCreditCard = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M2 10h20" stroke="#0E0E10" strokeWidth="1.6" />
      <rect x="5" y="14" width="6" height="2" rx="1" fill="#3DCC08" />
    </svg>,
    size,
    className
  );

export const IconChart = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M3 3v18h18" stroke="#0E0E10" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 15l4-4 3 3 5-7" stroke="#3DCC08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="7" r="1.5" fill="#3DCC08" />
    </svg>,
    size,
    className
  );

// בית/כתובת/משפחה
export const IconHome = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M3 12l9-8 9 8v8a2 2 0 01-2 2h-3v-7h-8v7H5a2 2 0 01-2-2v-8z" stroke="#0E0E10" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 22v-7h4v7" stroke="#3DCC08" strokeWidth="1.8" />
    </svg>,
    size,
    className
  );

export const IconMap = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" stroke="#0E0E10" strokeWidth="1.6" />
      <circle cx="12" cy="9" r="2.5" stroke="#3DCC08" strokeWidth="1.8" />
    </svg>,
    size,
    className
  );

export const IconCalendar = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="#0E0E10" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.5" fill="#3DCC08" />
    </svg>,
    size,
    className
  );

export const IconHeartFamily = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="9" r="2.5" stroke="#0E0E10" strokeWidth="1.6" />
      <circle cx="16" cy="9" r="2.5" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M3 19c0-2.5 2-4 5-4s5 1.5 5 4M11 19c0-2.5 2-4 5-4s5 1.5 5 4" stroke="#3DCC08" strokeWidth="1.6" />
    </svg>,
    size,
    className
  );

export const IconKids = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <circle cx="7" cy="8" r="2" stroke="#0E0E10" strokeWidth="1.6" />
      <circle cx="17" cy="8" r="2" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M3 19c0-2 2-3 4-3s4 1 4 3M13 19c0-2 2-3 4-3s4 1 4 3" stroke="#3DCC08" strokeWidth="1.6" />
    </svg>,
    size,
    className
  );

// תעסוקה
export const IconBriefcase = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M3 13h18" stroke="#3DCC08" strokeWidth="1.8" />
    </svg>,
    size,
    className
  );

// רכב
export const IconCar = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M3 14l2-6c.3-1 1-2 2-2h10c1 0 1.7 1 2 2l2 6v5h-3v-2H6v2H3v-5z" stroke="#0E0E10" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7" cy="16" r="1.5" fill="#3DCC08" />
      <circle cx="17" cy="16" r="1.5" fill="#3DCC08" />
    </svg>,
    size,
    className
  );

export const IconLock = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M8 11V8a4 4 0 018 0v3" stroke="#3DCC08" strokeWidth="1.8" />
    </svg>,
    size,
    className
  );

// בנק
export const IconBank = ({ size = 44, className }: IconProps) =>
  wrap(
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M3 10l9-6 9 6v2H3v-2z" stroke="#0E0E10" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5 12v8M9 12v8M15 12v8M19 12v8" stroke="#0E0E10" strokeWidth="1.6" />
      <path d="M3 21h18" stroke="#3DCC08" strokeWidth="2" strokeLinecap="round" />
    </svg>,
    size,
    className
  );
